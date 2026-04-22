import { NextRequest, NextResponse } from 'next/server'
import { sendUpcomingReminders } from '@/services/reminder.service'

/**
 * Vercel Cron Job — runs every hour.
 * Protected by CRON_SECRET to prevent unauthorized invocations.
 * vercel.json registers the schedule.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendUpcomingReminders()
    return NextResponse.json({ success: true, sent: result.sent })
  } catch (error) {
    console.error('[cron/upcoming-reminders] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
