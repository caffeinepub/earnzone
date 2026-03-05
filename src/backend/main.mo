import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type EarningType = { #spin; #reel; #walk };
  type WithdrawalStatus = { #pending; #approved; #rejected };

  type UserProfile = {
    name : Text;
    phoneNumber : Text;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  type Earning = {
    userId : Principal;
    amount : Float;
    earningType : EarningType;
    timestamp : Int;
  };

  module Earning {
    public func compareByAmount(earning1 : Earning, earning2 : Earning) : Order.Order {
      switch (Float.compare(earning1.amount, earning2.amount)) {
        case (#equal) { Int.compare(earning1.timestamp, earning2.timestamp) };
        case (order) { order };
      };
    };
  };

  type WithdrawalRequest = {
    userId : Principal;
    amount : Float;
    method : { #upi : Text; #bank : (Text, Text) };
    status : WithdrawalStatus;
    timestamp : Int;
  };

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  var earningsLedger = List.empty<Earning>();
  var withdrawalRequests = List.empty<WithdrawalRequest>();
  let dailySpins = Map.empty<Principal, Int>();
  let reelsWatched = Map.empty<Principal, (Int, Nat)>();

  // Utility functions for Int/Nat to Float conversion
  func intToFloatRange0_99(intNum : Int) : Float {
    (Int.abs(intNum % 100)).toFloat();
  };

  func natToFloatRange0_99(intNum : Nat) : Float {
    (intNum % 100).toFloat();
  };

  func intToFloatDiv2(intNum : Int) : Float {
    let intAbs = Int.abs(intNum % 2);
    switch (intAbs) {
      case (0) { (Int.abs(intNum) / 2).toFloat() };
      case (1) { (Int.abs(intNum) / 2).toFloat() + 0.5 };
      case (_) { 0.0 };
    };
  };

  func natToFloatDiv2(natNum : Nat) : Float {
    if (natNum % 2 == 0) {
      (natNum / 2).toFloat();
    } else {
      let natInt = natNum / 2;
      natInt.toFloat() + 0.5;
    };
  };

  // User Profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Spin Lucky Draw
  public shared ({ caller }) func spinLuckyDraw() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user to spin");
    };

    let lastSpinTime = switch (dailySpins.get(caller)) {
      case (null) { 0 };
      case (?time) { time };
    };

    if (isToday(lastSpinTime)) { Runtime.trap("Already spun today") };

    let timeInt = Time.now() % 100;
    let timeFloat = intToFloatRange0_99(timeInt);
    let reward = 5.0 + (50.0 - 5.0) * timeFloat / 100.0;

    dailySpins.add(caller, Time.now());

    let earning : Earning = {
      userId = caller;
      amount = reward;
      earningType = #spin;
      timestamp = Time.now();
    };

    earningsLedger.add(earning);
    reward;
  };

  // Watch Reels
  public shared ({ caller }) func watchReel() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };

    let (lastWatchTime, countToday) = switch (reelsWatched.get(caller)) {
      case (null) { (0, 0) };
      case (?data) { data };
    };

    let todayCount = if (isToday(lastWatchTime)) { countToday } else { 0 };

    if (todayCount >= 10) { Runtime.trap("Daily limit reached") };

    reelsWatched.add(caller, (Time.now(), todayCount + 1));

    let earning : Earning = {
      userId = caller;
      amount = 5.0;
      earningType = #reel;
      timestamp = Time.now();
    };

    earningsLedger.add(earning);
    5.0;
  };

  // Submit Steps
  public shared ({ caller }) func submitSteps(steps : Nat) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };
    let amount = natToFloatDiv2(steps);

    let earning : Earning = {
      userId = caller;
      amount;
      earningType = #walk;
      timestamp = Time.now();
    };

    earningsLedger.add(earning);
    amount;
  };

  // Get User Earnings
  public query ({ caller }) func getUserEarnings() : async [Earning] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };
    earningsLedger.filter(func(e : Earning) : Bool { Principal.equal(e.userId, caller) }).toArray();
  };

  public query ({ caller }) func getTodaysEarnings() : async [Earning] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };
    earningsLedger.filter(
      func(e : Earning) : Bool {
        Principal.equal(e.userId, caller) and isToday(e.timestamp)
      }
    ).toArray();
  };

  public query ({ caller }) func getBalanceRequestTokens() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };

    var totalEarnings : Float = 0.0;
    for (e in earningsLedger.values()) {
      if (Principal.equal(e.userId, caller)) {
        totalEarnings := totalEarnings + e.amount;
      };
    };

    var totalWithdrawals : Float = 0.0;
    for (w in withdrawalRequests.values()) {
      if (Principal.equal(w.userId, caller) and w.status == #approved) {
        totalWithdrawals := totalWithdrawals + w.amount;
      };
    };

    totalEarnings - totalWithdrawals;
  };

  // Withdrawals
  public shared ({ caller }) func requestWithdrawal(amount : Float, method : { #upi : Text; #bank : (Text, Text) }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };

    let withdrawal : WithdrawalRequest = {
      userId = caller;
      amount;
      method;
      status = #pending;
      timestamp = Time.now();
    };

    withdrawalRequests.add(withdrawal);
  };

  public query ({ caller }) func getUserWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };
    withdrawalRequests.filter(func(w : WithdrawalRequest) : Bool { Principal.equal(w.userId, caller) }).toArray();
  };

  public shared ({ caller }) func approveWithdrawal(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    let requestsArray = withdrawalRequests.toArray();
    if (index >= requestsArray.size()) {
      Runtime.trap("Invalid withdrawal index");
    };

    let updatedRequest = {
      requestsArray[index] with status = #approved
    };

    let newList = List.empty<WithdrawalRequest>();
    var i = 0;
    for (req in requestsArray.vals()) {
      if (i == index) {
        newList.add(updatedRequest);
      } else {
        newList.add(req);
      };
      i += 1;
    };

    withdrawalRequests := newList.reverse();
  };

  public shared ({ caller }) func rejectWithdrawal(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };

    let requestsArray = withdrawalRequests.toArray();
    if (index >= requestsArray.size()) {
      Runtime.trap("Invalid withdrawal index");
    };

    let updatedRequest = {
      requestsArray[index] with status = #rejected
    };

    let newList = List.empty<WithdrawalRequest>();
    var i = 0;
    for (req in requestsArray.vals()) {
      if (i == index) {
        newList.add(updatedRequest);
      } else {
        newList.add(req);
      };
      i += 1;
    };

    withdrawalRequests := newList.reverse();
  };

  public query ({ caller }) func getPendingWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending withdrawals");
    };
    withdrawalRequests.filter(func(w : WithdrawalRequest) : Bool { w.status == #pending }).toArray();
  };

  // Utility functions
  func isToday(timestamp : Int) : Bool {
    let dayInNanos : Int = 24 * 60 * 60 * 1000000000;
    let now = Time.now();
    (now / dayInNanos) == (timestamp / dayInNanos);
  };
};
