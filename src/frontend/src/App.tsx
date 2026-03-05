import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import EarnScreen from "./components/EarnScreen";
import HomeScreen from "./components/HomeScreen";
import ProfileScreen from "./components/ProfileScreen";
import WalletScreen from "./components/WalletScreen";

export type Tab = "home" | "earn" | "wallet" | "profile";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <div className="min-h-svh bg-background">
      <div className="app-container bg-background">
        <main className="main-content">
          {activeTab === "home" && <HomeScreen onNavigate={setActiveTab} />}
          {activeTab === "earn" && <EarnScreen />}
          {activeTab === "wallet" && <WalletScreen />}
          {activeTab === "profile" && <ProfileScreen />}
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.22 0.04 265)",
            border: "1px solid oklch(0.82 0.165 85 / 0.3)",
            color: "oklch(0.96 0.008 255)",
          },
        }}
      />
    </div>
  );
}
