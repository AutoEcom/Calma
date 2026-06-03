import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { AdminClassesPage } from './pages/AdminClassesPage'
import { AdminSessionsPlaceholder } from './pages/AdminSessionsPlaceholder'
import { ClassLivePage } from './pages/ClassLivePage'
import { ClassPage } from './pages/ClassPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { AboutPage } from './pages/AboutPage'
import { AudioSanctuaryPage } from './pages/AudioSanctuaryPage'
import { ContactPage } from './pages/ContactPage'
import { SanctuaryMeditationPage } from './pages/SanctuaryMeditationPage'
import { SessionsPage } from './pages/SessionsPage'
import { TermsPage } from './pages/TermsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sanctuary" element={<AudioSanctuaryPage />} />
          <Route path="sanctuary/:slug" element={<SanctuaryMeditationPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="class/:slug/live" element={<ClassLivePage />} />
          <Route path="class/:slug" element={<ClassPage />} />
          <Route path="admin/classes" element={<AdminClassesPage />} />
          <Route path="admin/sessions" element={<AdminSessionsPlaceholder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
