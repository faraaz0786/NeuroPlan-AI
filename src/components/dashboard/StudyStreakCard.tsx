'use client'

import { Flame } from 'lucide-react'

interface StudyStreakCardProps {
  streak: number
}

export function StudyStreakCard({ streak }: StudyStreakCardProps) {
  const getMessage = () => {
    if (streak === 0) return "Start your streak today!"
    if (streak === 1) return "Great start — keep it up!"
    if (streak < 7) return "You're building momentum 🔥"
    if (streak < 30) return "Incredible consistency!"
    return "You're unstoppable! 🏆"
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
        style={{ background: streak > 0 ? 'linear-gradient(135deg, #ff9a3c22, #ff4d0022)' : undefined }}
      >
        <Flame
          className="w-7 h-7"
          style={{ color: streak > 0 ? '#ff6b1a' : '#6b7280' }}
        />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-foreground leading-none">{streak}</span>
          <span className="text-sm font-semibold text-muted-foreground">day{streak !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">{getMessage()}</p>
      </div>
    </div>
  )
}
