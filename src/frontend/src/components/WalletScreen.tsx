import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { WithdrawalStatus } from "../backend.d";
import {
  useRequestWithdrawal,
  useUserEarnings,
  useUserWithdrawals,
} from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  if (status === WithdrawalStatus.approved) {
    return (
      <span
        className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full font-body"
        style={{
          background: "oklch(0.72 0.18 145 / 0.15)",
          color: "oklch(0.72 0.18 145)",
          border: "1px solid oklch(0.72 0.18 145 / 0.3)",
        }}
      >
        <CheckCircle2 size={10} /> Approved
      </span>
    );
  }
  if (status === WithdrawalStatus.rejected) {
    return (
      <span
        className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full font-body"
        style={{
          background: "oklch(0.62 0.22 25 / 0.15)",
          color: "oklch(0.62 0.22 25)",
          border: "1px solid oklch(0.62 0.22 25 / 0.3)",
        }}
      >
        <XCircle size={10} /> Rejected
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full font-body"
      style={{
        background: "oklch(0.82 0.165 60 / 0.15)",
        color: "oklch(0.82 0.165 60)",
        border: "1px solid oklch(0.82 0.165 60 / 0.3)",
      }}
    >
      <Clock size={10} /> Pending
    </span>
  );
}

export default function WalletScreen() {
  const { data: earnings, isLoading: earningsLoading } = useUserEarnings();
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useUserWithdrawals();
  const { mutateAsync: requestWithdrawal, isPending } = useRequestWithdrawal();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const totalEarned = earnings?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const approvedWithdrawals =
    withdrawals
      ?.filter((w) => w.status === WithdrawalStatus.approved)
      .reduce((sum, w) => sum + w.amount, 0) ?? 0;
  const balance = totalEarned - approvedWithdrawals;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number.parseFloat(amount);

    if (!amountNum || amountNum < 50) {
      toast.error("Minimum withdrawal is ₹50");
      return;
    }
    if (amountNum > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (method === "upi" && !upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (method === "bank" && (!accountNumber.trim() || !ifscCode.trim())) {
      toast.error("Please enter account number and IFSC code");
      return;
    }

    try {
      const withdrawalMethod =
        method === "upi"
          ? { __kind__: "upi" as const, upi: upiId.trim() }
          : {
              __kind__: "bank" as const,
              bank: [accountNumber.trim(), ifscCode.trim()] as [string, string],
            };

      await requestWithdrawal({ amount: amountNum, method: withdrawalMethod });

      toast.success("Withdrawal request submitted!", {
        description: "Your request will be processed within 24–48 hours",
        duration: 5000,
      });
      setAmount("");
      setUpiId("");
      setAccountNumber("");
      setIfscCode("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Withdrawal failed";
      toast.error("Request failed", { description: msg });
    }
  };

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold font-display text-foreground">
          Wallet
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-0.5">
          Withdraw your earnings to PhonePe or bank
        </p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        data-ocid="wallet.balance_card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl p-5 relative overflow-hidden noise-overlay"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.12 275), oklch(0.2 0.08 295))",
          boxShadow: "0 6px 32px oklch(0.5 0.18 285 / 0.2)",
        }}
      >
        <div
          className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-10"
          style={{ background: "oklch(0.82 0.165 85)" }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 font-body uppercase tracking-wider mb-1">
              Available Balance
            </p>
            {earningsLoading || withdrawalsLoading ? (
              <Skeleton
                className="h-10 w-32"
                style={{ background: "oklch(1 0 0 / 0.1)" }}
              />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white/70 font-body">
                  ₹
                </span>
                <span className="text-4xl font-bold text-white font-display">
                  {balance.toFixed(2)}
                </span>
              </div>
            )}
            <p className="text-xs text-white/40 mt-2 font-body">
              Min. withdrawal: ₹50
            </p>
          </div>
          <div
            className="p-4 rounded-2xl"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <Wallet size={28} className="text-white" />
          </div>
        </div>
      </motion.div>

      {/* Withdrawal Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: "oklch(0.18 0.03 265)",
          border: "1px solid oklch(0.28 0.04 265)",
        }}
      >
        <h2 className="font-bold font-display text-foreground flex items-center gap-2">
          <ArrowDownToLine size={16} className="text-gold" />
          Withdraw Funds
        </h2>

        <form onSubmit={handleWithdraw} className="space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label
              htmlFor="amount"
              className="text-sm font-body text-muted-foreground"
            >
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-body font-bold">
                ₹
              </span>
              <Input
                id="amount"
                data-ocid="wallet.amount_input"
                type="number"
                min="50"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-8 h-12 text-base font-body rounded-xl"
                style={{
                  background: "oklch(0.22 0.04 265)",
                  border: "1px solid oklch(0.28 0.04 265)",
                  color: "oklch(0.96 0.008 255)",
                }}
              />
            </div>
          </div>

          {/* Method toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-body text-muted-foreground">
              Payment Method
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-ocid="wallet.upi_toggle"
                onClick={() => setMethod("upi")}
                className="flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm font-body transition-all"
                style={{
                  background:
                    method === "upi"
                      ? "oklch(0.82 0.165 85 / 0.15)"
                      : "oklch(0.22 0.04 265)",
                  border:
                    method === "upi"
                      ? "1px solid oklch(0.82 0.165 85 / 0.5)"
                      : "1px solid oklch(0.28 0.04 265)",
                  color:
                    method === "upi"
                      ? "oklch(0.82 0.165 85)"
                      : "oklch(0.62 0.04 268)",
                }}
              >
                <Smartphone size={14} />
                UPI / PhonePe
              </button>
              <button
                type="button"
                data-ocid="wallet.bank_toggle"
                onClick={() => setMethod("bank")}
                className="flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm font-body transition-all"
                style={{
                  background:
                    method === "bank"
                      ? "oklch(0.72 0.18 175 / 0.15)"
                      : "oklch(0.22 0.04 265)",
                  border:
                    method === "bank"
                      ? "1px solid oklch(0.72 0.18 175 / 0.5)"
                      : "1px solid oklch(0.28 0.04 265)",
                  color:
                    method === "bank"
                      ? "oklch(0.72 0.18 175)"
                      : "oklch(0.62 0.04 268)",
                }}
              >
                <Building2 size={14} />
                Bank Transfer
              </button>
            </div>
          </div>

          {/* UPI input */}
          {method === "upi" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <Label
                htmlFor="upi"
                className="text-sm font-body text-muted-foreground"
              >
                UPI ID
              </Label>
              <Input
                id="upi"
                data-ocid="wallet.upi_input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. 9876543210@paytm"
                className="h-12 text-base font-body rounded-xl"
                style={{
                  background: "oklch(0.22 0.04 265)",
                  border: "1px solid oklch(0.28 0.04 265)",
                  color: "oklch(0.96 0.008 255)",
                }}
              />
              <p className="text-xs text-muted-foreground font-body">
                Works with PhonePe, Paytm, GPay, etc.
              </p>
            </motion.div>
          )}

          {/* Bank inputs */}
          {method === "bank" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="account"
                  className="text-sm font-body text-muted-foreground"
                >
                  Account Number
                </Label>
                <Input
                  id="account"
                  data-ocid="wallet.account_input"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890123456"
                  className="h-12 text-base font-body rounded-xl"
                  style={{
                    background: "oklch(0.22 0.04 265)",
                    border: "1px solid oklch(0.28 0.04 265)",
                    color: "oklch(0.96 0.008 255)",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="ifsc"
                  className="text-sm font-body text-muted-foreground"
                >
                  IFSC Code
                </Label>
                <Input
                  id="ifsc"
                  data-ocid="wallet.ifsc_input"
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="h-12 text-base font-body rounded-xl uppercase"
                  style={{
                    background: "oklch(0.22 0.04 265)",
                    border: "1px solid oklch(0.28 0.04 265)",
                    color: "oklch(0.96 0.008 255)",
                  }}
                />
              </div>
            </motion.div>
          )}

          <Button
            data-ocid="wallet.submit_button"
            type="submit"
            disabled={isPending || !amount}
            className="w-full h-13 text-base font-bold font-display rounded-2xl"
            style={{
              background: !amount
                ? "oklch(0.3 0.03 265)"
                : "linear-gradient(135deg, oklch(0.82 0.165 85), oklch(0.72 0.19 65))",
              color: !amount ? "oklch(0.55 0.04 265)" : "oklch(0.12 0.02 265)",
              border: "none",
              boxShadow: amount
                ? "0 4px 20px oklch(0.82 0.165 85 / 0.4)"
                : "none",
            }}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowDownToLine size={16} />
                Request Withdrawal
              </span>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Withdrawal History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="font-bold font-display text-foreground">
          Withdrawal History
        </h2>

        {withdrawalsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-16 rounded-xl"
                style={{ background: "oklch(0.22 0.04 265)" }}
              />
            ))}
          </div>
        ) : !withdrawals || withdrawals.length === 0 ? (
          <div
            data-ocid="wallet.history_list"
            className="text-center py-8 rounded-2xl"
            style={{
              background: "oklch(0.18 0.03 265)",
              border: "1px dashed oklch(0.28 0.04 265)",
            }}
          >
            <ArrowDownToLine
              size={28}
              className="mx-auto text-muted-foreground mb-2 opacity-40"
            />
            <p className="text-sm text-muted-foreground font-body">
              No withdrawal requests yet
            </p>
          </div>
        ) : (
          <div data-ocid="wallet.history_list" className="space-y-2">
            {withdrawals.map((w, i) => (
              <motion.div
                key={`withdrawal-${w.timestamp.toString()}-${i}`}
                data-ocid={`wallet.history_item.${i + 1}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl p-4 flex items-center justify-between gap-3"
                style={{
                  background: "oklch(0.18 0.03 265)",
                  border: "1px solid oklch(0.28 0.04 265)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ background: "oklch(0.22 0.04 265)" }}
                  >
                    {w.method.__kind__ === "upi" ? (
                      <Smartphone size={14} className="text-gold" />
                    ) : (
                      <Building2 size={14} className="text-teal" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold font-body text-foreground truncate">
                      {w.method.__kind__ === "upi"
                        ? (w.method as { __kind__: "upi"; upi: string }).upi
                        : `${(w.method as { __kind__: "bank"; bank: [string, string] }).bank[0].slice(0, 6)}•••• ${(w.method as { __kind__: "bank"; bank: [string, string] }).bank[1]}`}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {formatDate(w.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-bold font-display text-foreground">
                    ₹{w.amount}
                  </span>
                  <StatusBadge status={w.status} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
