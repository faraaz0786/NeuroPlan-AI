'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { WeeklyBar } from '@/hooks/useDashboardStats'

interface ActivityGraphProps {
  data: WeeklyBar[]
}

interface TooltipPayload {
  value: number
  name: string
  color: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}m
        </p>
      ))}
    </div>
  )
}

export function ActivityGraph({ data }: ActivityGraphProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={2} barCategoryGap="30%">
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}m`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
        <Bar dataKey="planned" name="Planned" fill="currentColor" className="fill-primary/20" radius={[3, 3, 0, 0]} />
        <Bar dataKey="completed" name="Completed" fill="currentColor" className="fill-primary" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
