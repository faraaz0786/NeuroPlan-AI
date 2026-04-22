import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PerformanceChart } from "@/components/analytics/PerformanceChart"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your study performance and completion rates.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <PerformanceChart />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-muted/60 flex flex-col">
          <CardHeader>
            <CardTitle>Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
            <div className="w-full h-full min-h-[200px] rounded-xl bg-muted/20 flex flex-col items-center justify-center p-6 text-center">
               <p className="text-sm">Donut Chart Placeholder</p>
               <p className="text-xs mt-2">Calculus: 40%<br/>History: 35%<br/>Data Structures: 25%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
