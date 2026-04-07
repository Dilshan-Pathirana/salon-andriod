import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav, BottomNavRole, PageType } from './components/BottomNav'
import { HamburgerMenu, MenuItem, MenuTab } from './components/HamburgerMenu'
import { TopBar } from './components/TopBar'
import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { QueuePage } from './pages/QueuePage'
import { ProfilePage } from './pages/ProfilePage'
import { ServicesPage } from './pages/ServicesPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { AuthPage } from './pages/AuthPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminServiceManagementPage } from './pages/AdminServiceManagementPage'
import { AdminSessionManagementPage } from './pages/AdminSessionManagementPage'
import { AdminAppointmentManagementPage } from './pages/AdminAppointmentManagementPage'
import { AdminQueueManagementPage } from './pages/AdminQueueManagementPage'
import { AdminUserManagementPage } from './pages/AdminUserManagementPage'
import { getCurrentSession } from './lib/api'

type AppPage = PageType | 'services' | 'appointments' | 'auth' | 'admin'

function getPageFromPath(pathname: string): AppPage {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname === '/services') return 'services'
  if (pathname === '/appointments') return 'appointments'
  if (pathname === '/book') return 'book'
  if (pathname === '/queue') return 'queue'
  if (pathname === '/profile') return 'profile'
  if (pathname === '/auth') return 'auth'
  return 'home'
}

function toPath(page: MenuTab | PageType): string {
  switch (page) {
    case 'home':
      return '/'
    case 'services':
      return '/services'
    case 'book':
      return '/book'
    case 'queue':
      return '/queue'
    case 'appointments':
      return '/appointments'
    case 'profile':
      return '/profile'
    case 'login':
      return '/auth'
    case 'admin-home':
      return '/admin'
    case 'admin-services':
      return '/admin/services'
    case 'admin-session':
      return '/admin/session'
    case 'admin-appointments':
      return '/admin/appointments'
    case 'admin-queue':
      return '/admin/queue'
    case 'admin-users':
      return '/admin/users'
    default:
      return '/'
  }
}

export function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sessionUser, setSessionUser] = useState(() => getCurrentSession()?.user ?? null)
  const [authTarget, setAuthTarget] = useState('/profile')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const activePage = getPageFromPath(location.pathname)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const isLoggedIn = Boolean(sessionUser)
  const isAdmin = sessionUser?.role === 'ADMIN'
  const bottomNavRole: BottomNavRole = isAdmin ? 'admin' : isLoggedIn ? 'user' : 'visitor'

  const menuItems = useMemo<MenuItem[]>(() => {
    if (isAdmin) {
      return [
        { id: 'admin-home', label: 'Home' },
        { id: 'admin-services', label: 'Service Management' },
        { id: 'admin-session', label: 'Session Management' },
        { id: 'admin-appointments', label: 'Appointment Management' },
        { id: 'admin-queue', label: 'Queue Management' },
        { id: 'admin-users', label: 'User Management' },
        { id: 'profile', label: 'Profile' },
      ]
    }

    if (isLoggedIn) {
      return [
        { id: 'home', label: 'Home' },
        { id: 'services', label: 'Services' },
        { id: 'book', label: 'Book Now' },
        { id: 'appointments', label: 'Appointments' },
        { id: 'queue', label: 'Live Queue' },
        { id: 'profile', label: 'Profile' },
      ]
    }

    return [
      { id: 'services', label: 'Services' },
      { id: 'login', label: 'Login/Register' },
    ]
  }, [isAdmin, isLoggedIn])

  const navigateFromMenu = (tab: MenuTab) => {
    if (tab === 'appointments' && !isLoggedIn) {
      setAuthTarget('/appointments')
      navigate('/auth')
      return
    }
    if (tab === 'profile' && !isLoggedIn) {
      setAuthTarget('/profile')
      navigate('/auth')
      return
    }
    navigate(toPath(tab))
  }

  const handleBottomNav = (page: PageType) => {
    if (page === 'profile' && !isLoggedIn) {
      setAuthTarget('/profile')
      navigate('/auth')
      return
    }
    navigate(toPath(page))
  }

  const handleAuthSuccess = () => {
    const user = getCurrentSession()?.user ?? null
    setSessionUser(user)

    if (user?.role === 'ADMIN') {
      navigate('/admin')
      return
    }

    navigate(authTarget || '/')
  }

  const handleSignedOut = () => {
    setSessionUser(null)
    navigate('/')
  }

  const isAdminPage = location.pathname.startsWith('/admin')

  const getPageTitle = (page: AppPage) => {
    switch (page) {
      case 'home':
        return 'Salon Ru Zero One'
      case 'book':
        return 'Book Appointment'
      case 'queue':
        return 'Live Queue'
      case 'profile':
        return 'My Profile'
      case 'services':
        return 'Our Services'
      case 'appointments':
        return 'My Appointments'
      case 'auth':
        return 'Sign In'
      case 'admin':
        return 'Admin Panel'
      default:
        return 'Salon'
    }
  }

  const activeBottomPage: PageType =
    activePage === 'book' || activePage === 'queue' || activePage === 'profile'
      ? activePage
      : 'home'

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 flex justify-center selection:bg-blue-100 selection:text-blue-900">
      {/* Light subtle SaaS dashboard style background gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[80px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[100px]" />
      </div>

      {/* Main App Container */}
      <div className="relative w-full max-w-[480px] h-full flex flex-col overflow-hidden bg-white shadow-2xl shadow-indigo-100 sm:border-x sm:border-slate-200 z-10">
        {/* Offline banner */}
        {!isOnline && (
          <div className="relative z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-medium text-white">
            <span>⚠</span>
            <span>You are offline. Some features may not be available.</span>
          </div>
        )}
        <TopBar title={getPageTitle(activePage)} onMenuClick={() => setIsMenuOpen(true)} />

        <HamburgerMenu
          items={menuItems}
          onSelect={navigateFromMenu}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <div className="flex-1 overflow-y-auto bg-transparent pb-24">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage key="home" onBookClick={() => navigate('/book')} />} />
              <Route path="/services" element={<ServicesPage key="services" />} />
              <Route
                path="/book"
                element={
                  <BookingPage
                    key="book"
                    onRequireAuth={() => {
                      setAuthTarget('/book')
                      navigate('/auth')
                    }}
                    onBookingComplete={() => navigate('/queue')}
                  />
                }
              />
              <Route path="/queue" element={<QueuePage key="queue" />} />
              <Route
                path="/profile"
                element={isLoggedIn ? <ProfilePage key="profile" onSignedOut={handleSignedOut} /> : <Navigate to="/auth" replace />}
              />
              <Route
                path="/appointments"
                element={isLoggedIn ? <AppointmentsPage key="appointments" /> : <Navigate to="/auth" replace />}
              />
              <Route path="/auth" element={<AuthPage key="auth" onAuthSuccess={handleAuthSuccess} />} />

              <Route path="/admin" element={isAdmin ? <AdminDashboardPage key="admin-home" /> : <Navigate to="/" replace />} />
              <Route path="/admin/services" element={isAdmin ? <AdminServiceManagementPage key="admin-services" /> : <Navigate to="/" replace />} />
              <Route path="/admin/session" element={isAdmin ? <AdminSessionManagementPage key="admin-session" /> : <Navigate to="/" replace />} />
              <Route
                path="/admin/appointments"
                element={isAdmin ? <AdminAppointmentManagementPage key="admin-appointments" /> : <Navigate to="/" replace />}
              />
              <Route path="/admin/queue" element={isAdmin ? <AdminQueueManagementPage key="admin-queue" /> : <Navigate to="/" replace />} />
              <Route path="/admin/users" element={isAdmin ? <AdminUserManagementPage key="admin-users" /> : <Navigate to="/" replace />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>

        {!isAdmin && !isAdminPage ? (
          <div className="absolute bottom-0 left-0 right-0 z-40">
            <BottomNav activePage={activeBottomPage} onChange={handleBottomNav} role={bottomNavRole} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
