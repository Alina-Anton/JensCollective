import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

export function AppShell() {
  return (
    <div className="min-h-dvh bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
