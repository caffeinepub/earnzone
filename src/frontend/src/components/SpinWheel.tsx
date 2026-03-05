import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSpinLuckyDraw } from "../hooks/useQueries";

const WHEEL_SEGMENTS = [
  { label: "₹5", color: "oklch(0.82 0.165 85)", angle: 0 },
  { label: "₹10", color: "oklch(0.72 0.18 175)", angle: 45 },
  { label: "₹25", color: "oklch(0.68 0.22 308)", angle: 90 },
  { label: "₹15", color: "oklch(0.62 0.22 25)", angle: 135 },
  { label: "₹50", color: "oklch(0.55 0.2 240)", angle: 180 },
  { label: "₹20", color: "oklch(0.75 0.19 55)", angle: 225 },
  { label: "₹30", color: "oklch(0.65 0.24 145)", angle: 270 },
  { label: "₹5", color: "oklch(0.7 0.15 200)", angle: 315 },
];

const SEG_COUNT = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / SEG_COUNT;

export default function SpinWheel() {
  const { mutateAsync: spin, isPending } = useSpinLuckyDraw();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const currentRotation = useRef(0);

  const handleSpin = async () => {
    if (isSpinning || alreadySpun) return;
    setIsSpinning(true);
    setReward(null);

    try {
      const won = await spin();
      // Spin 5 full rotations + random final angle
      const extraSpins = 5 * 360;
      const finalAngle = Math.random() * 360;
      const totalRotation = currentRotation.current + extraSpins + finalAngle;
      currentRotation.current = totalRotation;
      setRotation(totalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setReward(won);
        toast.success(`🎉 You won ₹${won}!`, {
          description: "Amount added to your balance",
          duration: 4000,
        });
      }, 3500);
    } catch (err) {
      setIsSpinning(false);
      const msg = err instanceof Error ? err.message : "Already spun today";
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("daily")
      ) {
        setAlreadySpun(true);
      }
      toast.error("Cannot spin right now", { description: msg });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Wheel container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full opacity-40 blur-xl"
          style={{ background: "oklch(0.82 0.165 85)" }}
        />

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div
            className="w-4 h-6"
            style={{
              clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
              background: "oklch(0.96 0.008 255)",
              filter: "drop-shadow(0 2px 8px oklch(0.05 0 0 / 0.5))",
            }}
          />
        </div>

        {/* Wheel SVG */}
        <motion.div
          style={{
            width: 260,
            height: 260,
            transition: `transform ${isSpinning ? "3.5s" : "0s"} cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
            transform: `rotate(${rotation}deg)`,
          }}
          className="relative rounded-full"
        >
          <svg
            viewBox="0 0 260 260"
            width={260}
            height={260}
            aria-label="Lucky draw spin wheel"
            role="img"
          >
            <title>Lucky Draw Spin Wheel</title>
            {WHEEL_SEGMENTS.map((seg, i) => {
              const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
              const cx = 130;
              const cy = 130;
              const r = 120;

              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy + r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(endAngle);
              const y2 = cy + r * Math.sin(endAngle);

              const midAngle =
                ((i + 0.5) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
              const labelR = 80;
              const lx = cx + labelR * Math.cos(midAngle);
              const ly = cy + labelR * Math.sin(midAngle);
              const textAngle = (i + 0.5) * SEGMENT_ANGLE;

              return (
                <g key={seg.label + String(i)}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="oklch(0.14 0.025 265)"
                    strokeWidth="2"
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="Bricolage Grotesque, sans-serif"
                    transform={`rotate(${textAngle}, ${lx}, ${ly})`}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle
              cx="130"
              cy="130"
              r="28"
              fill="oklch(0.16 0.04 265)"
              stroke="oklch(0.82 0.165 85)"
              strokeWidth="3"
            />
            <text
              x="130"
              y="130"
              textAnchor="middle"
              dominantBaseline="central"
              fill="oklch(0.82 0.165 85)"
              fontSize="20"
              fontWeight="900"
            >
              ⚡
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Reward popup */}
      <AnimatePresence>
        {reward !== null && !isSpinning && (
          <motion.div
            data-ocid="spin.success_state"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.28 0.12 85 / 0.3), oklch(0.22 0.08 85 / 0.2))",
              border: "1px solid oklch(0.82 0.165 85 / 0.4)",
            }}
          >
            <Trophy size={20} className="text-gold" />
            <div>
              <p className="text-xs text-muted-foreground font-body">You won</p>
              <p className="text-2xl font-bold text-gold font-display">
                ₹{reward}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already spun state */}
      {alreadySpun && (
        <motion.div
          data-ocid="spin.error_state"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4 py-3 rounded-xl"
          style={{
            background: "oklch(0.62 0.22 25 / 0.12)",
            border: "1px solid oklch(0.62 0.22 25 / 0.3)",
          }}
        >
          <p className="text-sm font-semibold text-destructive font-display">
            Already spun today!
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-body">
            Come back tomorrow for your next spin
          </p>
        </motion.div>
      )}

      {/* Spin Button */}
      <Button
        data-ocid="spin.button"
        onClick={handleSpin}
        disabled={isPending || isSpinning || alreadySpun}
        className="w-full max-w-[240px] h-14 text-lg font-bold font-display rounded-2xl relative overflow-hidden"
        style={{
          background: alreadySpun
            ? "oklch(0.3 0.03 265)"
            : "linear-gradient(135deg, oklch(0.82 0.165 85), oklch(0.72 0.19 65))",
          color: alreadySpun ? "oklch(0.55 0.04 265)" : "oklch(0.12 0.02 265)",
          boxShadow: alreadySpun
            ? "none"
            : "0 4px 24px oklch(0.82 0.165 85 / 0.4)",
          border: "none",
        }}
      >
        {isPending || isSpinning ? (
          <span className="flex items-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            Spinning...
          </span>
        ) : alreadySpun ? (
          "Come Back Tomorrow"
        ) : (
          <span className="flex items-center gap-2">
            <Zap size={18} />
            SPIN NOW
          </span>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center font-body">
        1 free spin every day • Win up to ₹50
      </p>
    </div>
  );
}
