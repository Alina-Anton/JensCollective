import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Community } from '@/pages/Community'
import { CreateEvent } from '@/pages/CreateEvent'
import { Dashboard } from '@/pages/Dashboard'
import { EventDetail } from '@/pages/EventDetail'
import { EventsBoard } from '@/pages/EventsBoard'
import { NotificationSettings } from '@/pages/NotificationSettings'
import { ProfileReservations } from '@/pages/ProfileReservations'
import { SignIn } from '@/pages/SignIn'
import { SignUp } from '@/pages/SignUp'

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<EventsBoard />} />
        <Route path="/events/new" element={<CreateEvent />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/me" element={<ProfileReservations />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
