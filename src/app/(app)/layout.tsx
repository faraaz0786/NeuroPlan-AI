import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f7f9fb]">
      {/* Fixed sidebar — 240px wide */}
      <Sidebar />

      {/* Main content area offset by sidebar width */}
      <div className="flex flex-col flex-1 md:ml-[240px] min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-[#f7f9fb]">
          {children}
        </main>
      </div>
    </div>
  )
}
