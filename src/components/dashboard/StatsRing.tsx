'use client'

interface StatsRingProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
}

export function StatsRing({ completed, total, size = 120, strokeWidth = 10 }: StatsRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const rate = total > 0 ? completed / total : 0
  const offset = circumference - rate * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-foreground leading-none">
          {Math.round(rate * 100)}%
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
          Today
        </span>
      </div>
    </div>
  )
}
