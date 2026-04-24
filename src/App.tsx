import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { Community } from '@/pages/Community'
import { CreateEvent } from '@/pages/CreateEvent'
import { Dashboard } from '@/pages/Dashboard'
import { EventDetail } from '@/pages/EventDetail'
import { EventsBoard } from '@/pages/EventsBoard'
import { MemberProfilePage } from '@/pages/MemberProfilePage'
import { MembersPage } from '@/pages/MembersPage'
import { NotificationSettings } from '@/pages/NotificationSettings'
import { ProfilePage } from '@/pages/ProfilePage'
import { SignIn } from '@/pages/SignIn'
import { SignUp } from '@/pages/SignUp'
import { ReservationsPage } from '@/pages/ReservationsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<EventsBoard />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:memberName" element={<MemberProfilePage />} />
          <Route path="/events/new" element={<CreateEvent />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/me" element={<Navigate to="/me/reservations" replace />} />
          <Route path="/me/reservations" element={<ReservationsPage />} />
          <Route path="/me/profile" element={<ProfilePage />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
