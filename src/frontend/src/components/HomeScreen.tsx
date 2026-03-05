import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Footprints, Play, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { Tab } from "../App";
import { EarningType, WithdrawalStatus } from "../backend.d";
import { useUserEarnings, useUserWithdrawals } from "../hooks/useQueries";
import { useTodaysEarnings } from "../hooks/useQueries";

interface HomeScreenProps {
  onNavigate: (tab: Tab) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { data: earnings, isLoading: earningsLoading } = useUserEarnings();
  const { data: todaysEarnings, isLoading: todayLoading } = useTodaysEarnings();
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useUserWithdrawals();

  const isLoading = earningsLoading || withdrawalsLoading;

  const totalEarned = earnings?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const approvedWithdrawals =
    withdrawals
      ?.filter((w) => w.status === WithdrawalStatus.approved)
      .reduce((sum, w) => sum + w.amount, 0) ?? 0;
  const balance = totalEarned - approvedWithdrawals;

  const todaysSpin =
    todaysEarnings
      ?.filter((e) => e.earningType === EarningType.spin)
      .reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const todaysReels =
    todaysEarnings
      ?.filter((e) => e.earningType === EarningType.reel)
      .reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const todaysWalk =
    todaysEarnings
      ?.filter((e) => e.earningType === EarningType.walk)
      .reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const todaysTotal = todaysSpin + todaysReels + todaysWalk;

  const quickActions = [
    {
      id: "spin",
      label: "Lucky Spin",
      sub: "1× daily",
      icon: Zap,
      gradient: "from-yellow-500/20 to-amber-600/10",
      iconColor: "text-yellow-400",
      borderColor: "border-yellow-500/20",
      ocid: "home.spin_card",
      tab: "earn" as Tab,
    },
    {
      id: "reels",
      label: "Watch Reels",
      sub: "10× daily · ₹5 each",
      icon: Play,
      gradient: "from-teal-500/20 to-cyan-600/10",
      iconColor: "text-teal-400",
      borderColor: "border-teal-500/20",
      ocid: "home.reels_card",
      tab: "earn" as Tab,
    },
    {
      id: "walk",
      label: "Walk & Earn",
      sub: "₹0.5 per step",
      icon: Footprints,
      gradient: "from-purple-500/20 to-violet-600/10",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/20",
      ocid: "home.walk_card",
      tab: "earn" as Tab,
    },
  ];

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground font-body">
            Good day! 👋
          </p>
          <h1 className="text-2xl font-bold font-display text-foreground">
            EarnZone
          </h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30"
          style={{ background: "oklch(0.82 0.165 85 / 0.08)" }}
        >
          <Coins size={14} className="text-gold" />
          <span className="text-xs font-semibold text-gold font-body">
            Earn More
          </span>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        data-ocid="home.balance_card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden noise-overlay"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.12 275) 0%, oklch(0.22 0.1 295) 50%, oklch(0.18 0.08 310) 100%)",
          boxShadow:
            "0 8px 40px oklch(0.5 0.18 285 / 0.25), 0 2px 8px oklch(0.05 0 0 / 0.3)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: "oklch(0.82 0.165 85)" }}
        />
        <div
          className="absolute -bottom-12 -left-4 w-32 h-32 rounded-full opacity-8"
          style={{ background: "oklch(0.72 0.18 175)" }}
        />

        <div className="relative z-10 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1 font-body">
                Total Balance
              </p>
              {isLoading ? (
                <Skeleton
                  className="h-10 w-36"
                  style={{ background: "oklch(1 0 0 / 0.1)" }}
                />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white/80 font-body">
                    ₹
                  </span>
                  <span className="text-5xl font-bold text-white font-display tracking-tight">
                    {balance.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ background: "oklch(1 0 0 / 0.1)" }}
            >
              <TrendingUp size={22} className="text-white" />
            </div>
          </div>

          <div
            className="h-px mb-4"
            style={{ background: "oklch(1 0 0 / 0.12)" }}
          />

          {/* Today's breakdown */}
          <div>
            <p className="text-xs text-white/50 mb-2.5 font-body uppercase tracking-wider">
              Today's Earnings
            </p>
            {todayLoading ? (
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-8 flex-1"
                    style={{ background: "oklch(1 0 0 / 0.1)" }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Spin",
                    value: todaysSpin,
                    color: "text-yellow-300",
                  },
                  {
                    label: "Reels",
                    value: todaysReels,
                    color: "text-teal-300",
                  },
                  {
                    label: "Walk",
                    value: todaysWalk,
                    color: "text-purple-300",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: "oklch(1 0 0 / 0.08)" }}
                  >
                    <p className={`text-base font-bold ${color} font-display`}>
                      ₹{value.toFixed(0)}
                    </p>
                    <p className="text-[10px] text-white/50 mt-0.5 font-body">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {todaysTotal > 0 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-white/60 font-body">
                Total today:{" "}
                <span className="text-yellow-300 font-semibold">
                  ₹{todaysTotal.toFixed(2)}
                </span>
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-body">
          Earn Now
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                data-ocid={action.ocid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("earn")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${action.borderColor} bg-gradient-to-br ${action.gradient} transition-all`}
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.04 265) 0%, oklch(0.16 0.03 265) 100%)",
                  boxShadow: "0 2px 12px oklch(0.05 0 0 / 0.3)",
                }}
              >
                <div
                  className="p-2.5 rounded-xl"
                  style={{ background: "oklch(1 0 0 / 0.06)" }}
                >
                  <Icon size={20} className={action.iconColor} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground font-display leading-tight">
                    {action.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-body leading-tight">
                    {action.sub}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/70 hover:text-gold transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
