import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useWatchReel } from "../hooks/useQueries";

const REEL_TITLES = [
  "Desi Dance Moves",
  "Street Food Tour",
  "Cricket Highlights",
  "Bollywood Mashup",
  "Morning Workout",
  "Quick Recipe",
  "Tech Unboxing",
  "Travel Vlog",
  "Comedy Skit",
  "Motivational Talk",
];

export default function ReelsEarn() {
  const { mutateAsync: watchReel, isPending } = useWatchReel();
  const [watchedCount, setWatchedCount] = useState(0);
  const [watchingIndex, setWatchingIndex] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleWatchReel = async (slotIndex: number) => {
    if (watchedCount >= 10 || isPending || slotIndex !== watchedCount) return;
    setWatchingIndex(slotIndex);

    try {
      // Simulate a short reel watch delay
      await new Promise((res) => setTimeout(res, 1200));
      const totalWatched = await watchReel();
      const newCount =
        typeof totalWatched === "number" ? totalWatched : watchedCount + 1;
      setWatchedCount(newCount);
      setWatchingIndex(null);

      if (newCount >= 10) {
        setCompleted(true);
        toast.success("🎬 All 10 reels watched!", {
          description: "You earned ₹50 today from reels!",
          duration: 5000,
        });
      } else {
        toast.success(`₹5 earned! (${newCount}/10)`, { duration: 2000 });
      }
    } catch (err) {
      setWatchingIndex(null);
      const msg = err instanceof Error ? err.message : "Could not watch reel";
      if (
        msg.toLowerCase().includes("max") ||
        msg.toLowerCase().includes("limit")
      ) {
        setWatchedCount(10);
        setCompleted(true);
      }
      toast.error("Reel watch failed", { description: msg });
    }
  };

  const earned = watchedCount * 5;
  const progress = (watchedCount / 10) * 100;

  return (
    <div className="space-y-4">
      {/* Progress panel */}
      <motion.div
        data-ocid="reels.progress_panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 175 / 0.3), oklch(0.18 0.05 175 / 0.2))",
          border: "1px solid oklch(0.72 0.18 175 / 0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold font-display text-foreground">
            Watched {watchedCount}/10 reels today
          </span>
          <span className="text-lg font-bold text-teal font-display">
            ₹{earned}
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "oklch(0.14 0.025 265)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.72 0.18 175), oklch(0.62 0.2 200))",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-body">
          {watchedCount < 10
            ? `${10 - watchedCount} more reels to earn ₹${(10 - watchedCount) * 5} more`
            : "Daily limit reached! Come back tomorrow."}
        </p>
      </motion.div>

      {/* Reel grid */}
      <div className="grid grid-cols-2 gap-3">
        {REEL_TITLES.map((title, i) => {
          const isWatched = i < watchedCount;
          const isCurrent = i === watchedCount;
          const isLocked = i > watchedCount;
          const isWatching = watchingIndex === i;

          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="relative rounded-xl overflow-hidden"
              style={{
                background: isWatched
                  ? "oklch(0.72 0.18 175 / 0.1)"
                  : isCurrent
                    ? "oklch(0.22 0.04 265)"
                    : "oklch(0.18 0.03 265)",
                border: isWatched
                  ? "1px solid oklch(0.72 0.18 175 / 0.3)"
                  : isCurrent
                    ? "1px solid oklch(0.82 0.165 85 / 0.4)"
                    : "1px solid oklch(0.28 0.04 265)",
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              <div className="aspect-[9/16] min-h-[110px] flex flex-col items-center justify-center p-3 gap-2">
                {/* Thumbnail placeholder with gradient */}
                <div
                  className="w-full flex-1 rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: isWatched
                      ? "oklch(0.72 0.18 175 / 0.15)"
                      : `linear-gradient(${120 + i * 40}deg, oklch(${0.2 + i * 0.01} ${0.04 + i * 0.005} ${240 + i * 15}), oklch(${0.16 + i * 0.01} ${0.03} ${260 + i * 12}))`,
                  }}
                >
                  {isWatched ? (
                    <CheckCircle2 size={28} className="text-teal" />
                  ) : isWatching ? (
                    <Loader2 size={24} className="text-gold animate-spin" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(1 0 0 / 0.15)" }}
                    >
                      <Play
                        size={16}
                        className="text-white ml-0.5"
                        fill="white"
                      />
                    </div>
                  )}
                </div>

                {/* Title + status */}
                <div className="w-full text-center">
                  <p className="text-[10px] font-semibold text-foreground font-body leading-tight truncate">
                    {title}
                  </p>
                  <p className="text-[10px] mt-0.5 font-body">
                    {isWatched ? (
                      <span className="text-teal font-semibold">+₹5 ✓</span>
                    ) : isCurrent ? (
                      <span className="text-gold">₹5 reward</span>
                    ) : (
                      <span className="text-muted-foreground">Locked</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Watch overlay for current reel */}
              {isCurrent && !isWatching && !completed && (
                <button
                  type="button"
                  data-ocid="reels.watch_button"
                  onClick={() => handleWatchReel(i)}
                  disabled={isPending}
                  className="absolute inset-0 flex items-end justify-center pb-2 bg-transparent"
                  aria-label={`Watch reel ${i + 1}`}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Big Watch Button */}
      <AnimatePresence>
        {!completed && watchedCount < 10 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Button
              data-ocid="reels.watch_button"
              onClick={() => handleWatchReel(watchedCount)}
              disabled={
                isPending || watchingIndex !== null || watchedCount >= 10
              }
              className="w-full h-13 text-base font-bold font-display rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 175), oklch(0.62 0.2 200))",
                color: "oklch(0.12 0.02 265)",
                border: "none",
                boxShadow: "0 4px 20px oklch(0.72 0.18 175 / 0.4)",
              }}
            >
              {watchingIndex !== null ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Watching Reel {watchedCount + 1}...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play size={16} fill="currentColor" />
                  Watch Reel {watchedCount + 1} • Earn ₹5
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 px-4 rounded-2xl"
          style={{
            background: "oklch(0.72 0.18 175 / 0.1)",
            border: "1px solid oklch(0.72 0.18 175 / 0.3)",
          }}
        >
          <p className="text-xl">🎬</p>
          <p className="font-bold text-teal font-display mt-1">
            All done for today!
          </p>
          <p className="text-sm text-muted-foreground font-body mt-1">
            You earned ₹50 from reels today
          </p>
        </motion.div>
      )}
    </div>
  );
}
