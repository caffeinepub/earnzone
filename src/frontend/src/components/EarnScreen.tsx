import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footprints, Play, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import ReelsEarn from "./ReelsEarn";
import SpinWheel from "./SpinWheel";
import WalkEarn from "./WalkEarn";

export default function EarnScreen() {
  const [activeTab, setActiveTab] = useState("spin");

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold font-display text-foreground">
          Earn
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-0.5">
          Spin, watch & walk your way to ₹₹₹
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="w-full grid grid-cols-3 rounded-2xl p-1.5 h-auto"
          style={{ background: "oklch(0.18 0.03 265)" }}
        >
          <TabsTrigger
            value="spin"
            data-ocid="earn.spin_tab"
            className="flex items-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold font-body transition-all data-[state=active]:shadow-md"
            style={{
              color:
                activeTab === "spin"
                  ? "oklch(0.12 0.02 265)"
                  : "oklch(0.62 0.04 268)",
            }}
          >
            <Zap size={14} />
            Spin
          </TabsTrigger>
          <TabsTrigger
            value="reels"
            data-ocid="earn.reels_tab"
            className="flex items-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold font-body transition-all data-[state=active]:shadow-md"
            style={{
              color:
                activeTab === "reels"
                  ? "oklch(0.12 0.02 265)"
                  : "oklch(0.62 0.04 268)",
            }}
          >
            <Play size={14} />
            Reels
          </TabsTrigger>
          <TabsTrigger
            value="walk"
            data-ocid="earn.walk_tab"
            className="flex items-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold font-body transition-all data-[state=active]:shadow-md"
            style={{
              color:
                activeTab === "walk"
                  ? "oklch(0.12 0.02 265)"
                  : "oklch(0.62 0.04 268)",
            }}
          >
            <Footprints size={14} />
            Walk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spin" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="rounded-2xl p-4"
              style={{
                background: "oklch(0.18 0.03 265)",
                border: "1px solid oklch(0.28 0.04 265)",
              }}
            >
              {/* Earn info badge */}
              <div
                className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-xl mx-auto w-fit"
                style={{
                  background: "oklch(0.82 0.165 85 / 0.1)",
                  border: "1px solid oklch(0.82 0.165 85 / 0.2)",
                }}
              >
                <Zap size={14} className="text-gold" />
                <span className="text-xs font-semibold text-gold font-body">
                  Win ₹5–₹50 daily
                </span>
              </div>
              <SpinWheel />
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="reels" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="rounded-2xl p-4"
              style={{
                background: "oklch(0.18 0.03 265)",
                border: "1px solid oklch(0.28 0.04 265)",
              }}
            >
              <div
                className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-xl mx-auto w-fit"
                style={{
                  background: "oklch(0.72 0.18 175 / 0.1)",
                  border: "1px solid oklch(0.72 0.18 175 / 0.2)",
                }}
              >
                <Play size={14} className="text-teal" />
                <span className="text-xs font-semibold text-teal font-body">
                  10 reels × ₹5 = ₹50 daily
                </span>
              </div>
              <ReelsEarn />
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="walk" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="rounded-2xl p-4"
              style={{
                background: "oklch(0.18 0.03 265)",
                border: "1px solid oklch(0.28 0.04 265)",
              }}
            >
              <WalkEarn />
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
