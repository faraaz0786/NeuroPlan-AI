import { Card, CardContent } from "@/components/ui/card"

export function PlannerSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full w-full animate-pulse">
      {[1, 2, 3].map((col) => (
        <div key={col} className="flex flex-col h-[70vh] bg-muted/10 border border-border/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="h-4 w-24 bg-muted/60 rounded-md" />
            <div className="h-5 w-8 bg-muted/60 rounded-full" />
          </div>

          <div className="flex-1 overflow-hidden space-y-3 p-1">
            {[1, 2, 3, 4].map((card) => (
              <Card key={card} className="rounded-2xl border-border/20 bg-background/40 shadow-none">
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="h-4 w-3/4 bg-muted/60 rounded-md" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-12 bg-muted/40 rounded-md" />
                    <div className="h-3 w-20 bg-muted/40 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
