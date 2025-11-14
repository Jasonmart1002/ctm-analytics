import { requireAuth } from '@/lib/auth'
import { Header } from '@/components/layout/header'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />

      <main className="flex-1 overflow-y-auto bg-muted/20">
        {children}
      </main>
    </div>
  )
}
