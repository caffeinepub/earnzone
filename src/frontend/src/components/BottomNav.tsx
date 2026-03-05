import { Home, TrendingUp, User, Wallet } from "lucide-react";
import { motion } from "motion/react";
import type { Tab } from "../App";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: "home" as Tab, label: "Home", icon: Home, ocid: "nav.home_button" },
  {
    id: "earn" as Tab,
    label: "Earn",
    icon: TrendingUp,
    ocid: "nav.earn_button",
  },
  {
    id: "wallet" as Tab,
    label: "Wallet",
    icon: Wallet,
    ocid: "nav.wallet_button",
  },
  {
    id: "profile" as Tab,
    label: "Profile",
    icon: User,
    ocid: "nav.profile_button",
  },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bottom-nav z-50">
      <div
        className="mx-3 mb-2 rounded-2xl border border-border"
        style={{
          background: "oklch(0.16 0.04 265 / 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 -4px 24px oklch(0.05 0 0 / 0.5), 0 0 0 1px oklch(0.82 0.165 85 / 0.08)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                data-ocid={tab.ocid}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 relative min-w-[60px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "oklch(0.82 0.165 85 / 0.12)",
                    }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? "text-gold" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] font-medium relative z-10 transition-colors duration-200 font-body ${
                    isActive ? "text-gold" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
