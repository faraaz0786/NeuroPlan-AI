import Groq from 'groq-sdk'
import { AIGeneratedPlan, AIGeneratedPlanSchema } from '@/validators/planner.validators'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function generateAIStudyPlan(params: {
  subjects: { name: string; difficulty: string; priority: number }[]
  constraints: { hours_per_day: number; start_date: string; end_date: string; study_days: number[] }
}): Promise<AIGeneratedPlan | null> {
  try {
    const prompt = `You are an expert academic planner and cognitive optimization specialist.
Your goal is to generate an efficient and realistic study schedule.

Follow these rules strictly:
* Do not overload any single day. Total daily duration across all tasks MUST NOT exceed ${params.constraints.hours_per_day} hours.
* Distribute difficult subjects across multiple days. Avoid clustering the same subject repeatedly.
* Prioritize high-priority subjects earlier in the schedule.
* Maintain balance between subjects.
* Prefer spaced repetition over cramming.

Output ONLY valid JSON matching this schema:
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "subject": "Exact subject name",
          "duration": <minutes>,
          "priority": <number>,
          "title": "Specific focus topic"
        }
      ]
    }
  ]
}

Input Parameters:
Subjects: ${JSON.stringify(params.subjects)}
Limits: Maximum ${params.constraints.hours_per_day} hours/day.
Date Range: From ${params.constraints.start_date.split('T')[0]} to ${params.constraints.end_date.split('T')[0]}.
Study Days: ONLY schedule tasks on these days of the week: ${params.constraints.study_days.map(d => DAY_NAMES[d]).join(', ')}. Do NOT place any tasks on other days.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0,          // deterministic output
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: 'You are a strict JSON study planner. Output JSON only. No markdown, no explanation.'
        },
        { role: 'user', content: prompt }
      ]
    }, { signal: controller.signal })

    clearTimeout(timeoutId)

    const rawJson = response.choices[0].message.content
    if (!rawJson) return null

    const parsedAction = AIGeneratedPlanSchema.safeParse(JSON.parse(rawJson))
    if (!parsedAction.success) {
      console.warn('[ai.service] Structural violation — falling back.', parsedAction.error)
      return null
    }

    return parsedAction.data

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[ai.service] Groq timeout — falling back to mathematical scheduler.')
    } else {
      console.error('[ai.service] Groq error:', error)
    }
    return null
  }
}
