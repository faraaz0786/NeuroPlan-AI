'use client'

import { SubjectProgress } from '@/hooks/useDashboardStats'
import { BookOpen } from 'lucide-react'

interface SubjectBreakdownCardProps {
  subjects: SubjectProgress[]
}

export function SubjectBreakdownCard({ subjects }: SubjectBreakdownCardProps) {
  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/50 border-2 border-dashed rounded-2xl h-full">
        <BookOpen className="w-7 h-7 mb-2" />
        <p className="text-sm font-medium">No subjects yet</p>
        <p className="text-xs mt-1">Create a study plan to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {subjects.map(subject => (
        <div key={subject.id} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              <span className="font-semibold text-foreground truncate max-w-[130px]">
                {subject.name}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">
                {subject.completed}/{subject.total}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${subject.color}20`,
                  color: subject.color,
                }}
              >
                {subject.rate}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${subject.rate}%`,
                backgroundColor: subject.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
