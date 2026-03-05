import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  Phone,
  Save,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WithdrawalStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useApproveWithdrawal,
  useIsAdmin,
  usePendingWithdrawals,
  useRejectWithdrawal,
  useSaveProfile,
  useUserProfile,
} from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function ProfileScreen() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { mutateAsync: saveProfile, isPending: saving } = useSaveProfile();
  const { data: isAdmin } = useIsAdmin();
  const { data: pendingWithdrawals, isLoading: pendingLoading } =
    usePendingWithdrawals();
  const { mutateAsync: approve, isPending: approving } = useApproveWithdrawal();
  const { mutateAsync: reject, isPending: rejecting } = useRejectWithdrawal();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phoneNumber);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await saveProfile({ name: name.trim(), phoneNumber: phone.trim() });
      toast.success("Profile saved!", {
        description: "Your details have been updated",
      });
    } catch (err) {
      toast.error("Could not save profile", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  };

  const handleApprove = async (index: number) => {
    try {
      await approve(BigInt(index));
      toast.success("Withdrawal approved!");
    } catch (err) {
      toast.error("Approval failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleReject = async (index: number) => {
    try {
      await reject(BigInt(index));
      toast.success("Withdrawal rejected");
    } catch (err) {
      toast.error("Rejection failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const principal = identity?.getPrincipal().toString();

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold font-display text-foreground">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-0.5">
          Manage your account details
        </p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{
          background: "oklch(0.18 0.03 265)",
          border: "1px solid oklch(0.28 0.04 265)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: identity
                ? "linear-gradient(135deg, oklch(0.82 0.165 85 / 0.2), oklch(0.72 0.19 65 / 0.1))"
                : "oklch(0.22 0.04 265)",
              border: identity
                ? "1px solid oklch(0.82 0.165 85 / 0.4)"
                : "1px solid oklch(0.28 0.04 265)",
            }}
          >
            <User
              size={24}
              className={identity ? "text-gold" : "text-muted-foreground"}
            />
          </div>
          <div className="flex-1 min-w-0">
            {identity ? (
              <>
                <p className="font-bold font-display text-foreground truncate">
                  {profile?.name || "EarnZone User"}
                </p>
                <p className="text-xs text-muted-foreground font-body truncate mt-0.5">
                  {principal?.slice(0, 20)}...
                </p>
                {isAdmin && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 font-body"
                    style={{
                      background: "oklch(0.68 0.22 308 / 0.2)",
                      color: "oklch(0.68 0.22 308)",
                      border: "1px solid oklch(0.68 0.22 308 / 0.4)",
                    }}
                  >
                    <Shield size={10} /> Admin
                  </span>
                )}
              </>
            ) : (
              <>
                <p className="font-bold font-display text-foreground">
                  Not logged in
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Login to save your earnings
                </p>
              </>
            )}
          </div>
          <Button
            onClick={identity ? clear : login}
            disabled={isLoggingIn || isInitializing}
            variant="outline"
            size="sm"
            className="shrink-0 rounded-xl font-body"
            style={{
              background: identity
                ? "oklch(0.62 0.22 25 / 0.1)"
                : "oklch(0.82 0.165 85 / 0.1)",
              border: identity
                ? "1px solid oklch(0.62 0.22 25 / 0.4)"
                : "1px solid oklch(0.82 0.165 85 / 0.4)",
              color: identity ? "oklch(0.62 0.22 25)" : "oklch(0.82 0.165 85)",
            }}
          >
            {isLoggingIn || isInitializing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : identity ? (
              <span className="flex items-center gap-1.5">
                <LogOut size={12} />
                Logout
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <LogIn size={12} />
                Login
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl p-5"
        style={{
          background: "oklch(0.18 0.03 265)",
          border: "1px solid oklch(0.28 0.04 265)",
        }}
      >
        <h2 className="font-bold font-display text-foreground mb-4">
          Personal Details
        </h2>

        {profileLoading ? (
          <div className="space-y-4">
            <Skeleton
              className="h-12 rounded-xl"
              style={{ background: "oklch(0.22 0.04 265)" }}
            />
            <Skeleton
              className="h-12 rounded-xl"
              style={{ background: "oklch(0.22 0.04 265)" }}
            />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-sm font-body text-muted-foreground"
              >
                Full Name
              </Label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="name"
                  data-ocid="profile.name_input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="pl-10 h-12 text-base font-body rounded-xl"
                  style={{
                    background: "oklch(0.22 0.04 265)",
                    border: "1px solid oklch(0.28 0.04 265)",
                    color: "oklch(0.96 0.008 255)",
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-sm font-body text-muted-foreground"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="phone"
                  data-ocid="profile.phone_input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="pl-10 h-12 text-base font-body rounded-xl"
                  style={{
                    background: "oklch(0.22 0.04 265)",
                    border: "1px solid oklch(0.28 0.04 265)",
                    color: "oklch(0.96 0.008 255)",
                  }}
                />
              </div>
            </div>

            <Button
              data-ocid="profile.save_button"
              type="submit"
              disabled={saving || !identity}
              className="w-full h-12 font-bold font-display rounded-xl"
              style={{
                background: !identity
                  ? "oklch(0.3 0.03 265)"
                  : "linear-gradient(135deg, oklch(0.82 0.165 85), oklch(0.72 0.19 65))",
                color: !identity
                  ? "oklch(0.55 0.04 265)"
                  : "oklch(0.12 0.02 265)",
                border: "none",
                boxShadow: identity
                  ? "0 4px 16px oklch(0.82 0.165 85 / 0.3)"
                  : "none",
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={14} />
                  {identity ? "Save Profile" : "Login to Save"}
                </span>
              )}
            </Button>
          </form>
        )}
      </motion.div>

      {/* Admin Panel */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "oklch(0.2 0.06 308 / 0.15)",
            border: "1px solid oklch(0.68 0.22 308 / 0.4)",
          }}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-purple-400" />
            <h2 className="font-bold font-display text-foreground">
              Admin: Withdrawal Requests
            </h2>
          </div>

          {pendingLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 rounded-xl"
                  style={{ background: "oklch(0.22 0.04 265)" }}
                />
              ))}
            </div>
          ) : !pendingWithdrawals || pendingWithdrawals.length === 0 ? (
            <div
              className="text-center py-6 rounded-xl"
              style={{
                background: "oklch(0.18 0.03 265)",
                border: "1px dashed oklch(0.28 0.04 265)",
              }}
            >
              <CheckCircle2
                size={24}
                className="mx-auto text-muted-foreground mb-2 opacity-40"
              />
              <p className="text-sm text-muted-foreground font-body">
                No pending requests
              </p>
            </div>
          ) : (
            <div data-ocid="admin.pending_list" className="space-y-3">
              {pendingWithdrawals.map((w, i) => (
                <motion.div
                  key={`pending-${w.timestamp.toString()}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: "oklch(0.18 0.03 265)",
                    border: "1px solid oklch(0.28 0.04 265)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold font-display text-foreground text-sm">
                        ₹{w.amount}
                      </p>
                      <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
                        {w.userId.toString().slice(0, 24)}...
                      </p>
                      <p className="text-xs text-muted-foreground font-body mt-1">
                        {w.method.__kind__ === "upi"
                          ? `UPI: ${(w.method as { __kind__: "upi"; upi: string }).upi}`
                          : `Bank: ${(w.method as { __kind__: "bank"; bank: [string, string] }).bank[0]} / ${(w.method as { __kind__: "bank"; bank: [string, string] }).bank[1]}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                        {formatDate(w.timestamp)}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full font-body"
                      style={{
                        background: "oklch(0.82 0.165 60 / 0.15)",
                        color: "oklch(0.82 0.165 60)",
                        border: "1px solid oklch(0.82 0.165 60 / 0.3)",
                      }}
                    >
                      <Clock size={10} className="inline mr-0.5" />
                      Pending
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      data-ocid={`admin.approve_button.${i + 1}`}
                      onClick={() => handleApprove(i)}
                      disabled={approving || rejecting}
                      size="sm"
                      className="h-9 font-semibold font-body rounded-xl"
                      style={{
                        background: "oklch(0.72 0.18 145 / 0.15)",
                        border: "1px solid oklch(0.72 0.18 145 / 0.4)",
                        color: "oklch(0.72 0.18 145)",
                      }}
                    >
                      {approving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Approve
                        </span>
                      )}
                    </Button>
                    <Button
                      data-ocid={`admin.reject_button.${i + 1}`}
                      onClick={() => handleReject(i)}
                      disabled={approving || rejecting}
                      size="sm"
                      className="h-9 font-semibold font-body rounded-xl"
                      style={{
                        background: "oklch(0.62 0.22 25 / 0.12)",
                        border: "1px solid oklch(0.62 0.22 25 / 0.4)",
                        color: "oklch(0.62 0.22 25)",
                      }}
                    >
                      {rejecting ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <XCircle size={12} /> Reject
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
