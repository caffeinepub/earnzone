import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Earning {
    userId: Principal;
    timestamp: bigint;
    earningType: EarningType;
    amount: number;
}
export interface WithdrawalRequest {
    status: WithdrawalStatus;
    method: {
        __kind__: "upi";
        upi: string;
    } | {
        __kind__: "bank";
        bank: [string, string];
    };
    userId: Principal;
    timestamp: bigint;
    amount: number;
}
export interface UserProfile {
    name: string;
    phoneNumber: string;
}
export enum EarningType {
    reel = "reel",
    spin = "spin",
    walk = "walk"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    approveWithdrawal(index: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBalanceRequestTokens(): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPendingWithdrawals(): Promise<Array<WithdrawalRequest>>;
    getTodaysEarnings(): Promise<Array<Earning>>;
    getUserEarnings(): Promise<Array<Earning>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserWithdrawals(): Promise<Array<WithdrawalRequest>>;
    isCallerAdmin(): Promise<boolean>;
    rejectWithdrawal(index: bigint): Promise<void>;
    requestWithdrawal(amount: number, method: {
        __kind__: "upi";
        upi: string;
    } | {
        __kind__: "bank";
        bank: [string, string];
    }): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    spinLuckyDraw(): Promise<number>;
    submitSteps(steps: bigint): Promise<number>;
    watchReel(): Promise<number>;
}
