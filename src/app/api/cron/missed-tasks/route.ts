import { NextRequest, NextResponse } from 'next/server'
import { detectMissedTasks } from '@/services/reminder.service'

/**
 * Vercel Cron Job — runs every day at midnight UTC.
 * Protected by CRON_SECRET to prevent unauthorized invocations.
 * vercel.json registers the schedule.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await detectMissedTasks()
    return NextResponse.json({ success: true, detected: result.detected })
  } catch (error) {
    console.error('[cron/missed-tasks] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
