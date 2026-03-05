import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footprints, Heart, Loader2, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitSteps } from "../hooks/useQueries";

const MOTIVATIONAL_MESSAGES = [
  "Every step counts towards your earnings! 💪",
  "Walking is the best investment in yourself! 🚶",
  "Keep moving, keep earning! Your health = your wealth 🌟",
  "Small steps lead to big rewards! 👣",
  "Your daily walk is your daily earn! 💰",
];

export default function WalkEarn() {
  const { mutateAsync: submitSteps, isPending } = useSubmitSteps();
  const [steps, setSteps] = useState("");
  const [earnedResult, setEarnedResult] = useState<number | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);

  const stepsNum = Number.parseInt(steps) || 0;
  const preview = stepsNum * 0.5;
  const motivationIndex = stepsNum % MOTIVATIONAL_MESSAGES.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepsNum || stepsNum <= 0) {
      toast.error("Please enter a valid step count");
      return;
    }

    try {
      const earned = await submitSteps(BigInt(stepsNum));
      setEarnedResult(earned);
      setTotalEarned((prev) => prev + earned);
      setSteps("");
      toast.success(`🚶 Great job! You earned ₹${earned.toFixed(2)}`, {
        description: `${stepsNum.toLocaleString()} steps submitted`,
        duration: 4000,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit steps";
      toast.error("Step submission failed", { description: msg });
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats row */}
      {totalEarned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="walk.success_state"
          className="grid grid-cols-2 gap-3"
        >
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: "oklch(0.68 0.22 308 / 0.12)",
              border: "1px solid oklch(0.68 0.22 308 / 0.3)",
            }}
          >
            <p className="text-2xl font-bold font-display text-purple-300">
              ₹{totalEarned.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-body">
              Earned Today
            </p>
          </div>
          {earnedResult !== null && (
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                background: "oklch(0.72 0.18 145 / 0.12)",
                border: "1px solid oklch(0.72 0.18 145 / 0.3)",
              }}
            >
              <p className="text-2xl font-bold font-display text-green-300">
                +₹{earnedResult.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-body">
                Last Submission
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Motivational hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.24 0.1 308) 0%, oklch(0.18 0.08 285) 100%)",
          border: "1px solid oklch(0.68 0.22 308 / 0.3)",
        }}
      >
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15"
          style={{ background: "oklch(0.68 0.22 308)" }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div
            className="p-3 rounded-2xl"
            style={{ background: "oklch(0.68 0.22 308 / 0.2)" }}
          >
            <Footprints size={28} className="text-purple-300" />
          </div>
          <div>
            <h3 className="font-bold font-display text-white">Walk & Earn</h3>
            <p className="text-xs text-white/60 font-body">
              ₹0.50 per step you walk
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { steps: "100", earn: "₹50" },
            { steps: "500", earn: "₹250" },
            { steps: "1000", earn: "₹500" },
          ].map(({ steps: s, earn }) => (
            <button
              key={s}
              type="button"
              className="rounded-xl py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity w-full"
              style={{ background: "oklch(1 0 0 / 0.08)" }}
              onClick={() => setSteps(s)}
            >
              <p className="text-xs font-bold text-white font-display">
                {s} steps
              </p>
              <p className="text-[10px] text-purple-300 mt-0.5 font-body">
                = {earn}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="steps"
            className="text-sm font-semibold font-body text-foreground"
          >
            Enter Steps Walked Today
          </Label>
          <div className="relative">
            <Footprints
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="steps"
              data-ocid="walk.input"
              type="number"
              min="1"
              max="100000"
              value={steps}
              onChange={(e) => {
                setSteps(e.target.value);
                setEarnedResult(null);
              }}
              placeholder="e.g. 5000"
              className="pl-10 h-12 text-base font-body rounded-xl"
              style={{
                background: "oklch(0.22 0.04 265)",
                border: "1px solid oklch(0.28 0.04 265)",
                color: "oklch(0.96 0.008 255)",
              }}
            />
          </div>
        </div>

        {/* Live preview */}
        <AnimatePresence mode="wait">
          {stepsNum > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-4 py-3 flex items-center justify-between"
              style={{
                background: "oklch(0.68 0.22 308 / 0.1)",
                border: "1px solid oklch(0.68 0.22 308 / 0.25)",
              }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-purple-300" />
                <span className="text-sm font-body text-muted-foreground">
                  {stepsNum.toLocaleString()} steps × ₹0.50
                </span>
              </div>
              <span className="text-lg font-bold font-display text-purple-300">
                = ₹{preview.toFixed(2)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={motivationIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground text-center font-body flex items-center justify-center gap-1"
          >
            <Heart size={10} className="text-red-400" />
            {MOTIVATIONAL_MESSAGES[motivationIndex]}
          </motion.p>
        </AnimatePresence>

        <Button
          data-ocid="walk.submit_button"
          type="submit"
          disabled={isPending || !stepsNum || stepsNum <= 0}
          className="w-full h-13 text-base font-bold font-display rounded-2xl"
          style={{
            background:
              !stepsNum || stepsNum <= 0
                ? "oklch(0.3 0.03 265)"
                : "linear-gradient(135deg, oklch(0.68 0.22 308), oklch(0.55 0.24 285))",
            color:
              !stepsNum || stepsNum <= 0 ? "oklch(0.55 0.04 265)" : "white",
            border: "none",
            boxShadow:
              stepsNum > 0 ? "0 4px 20px oklch(0.68 0.22 308 / 0.4)" : "none",
          }}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Footprints size={16} />
              {stepsNum > 0
                ? `Submit ${stepsNum.toLocaleString()} Steps • Earn ₹${preview.toFixed(2)}`
                : "Submit Steps"}
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
