import React, { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BottomNav, BottomNavRole, PageType } from './components/BottomNav'
import { HamburgerMenu, MenuItem, MenuTab } from './components/HamburgerMenu'
import { TopBar } from './components/TopBar'
import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { QueuePage } from './pages/QueuePage'
import { ProfilePage } from './pages/ProfilePage'
import { ServicesPage } from './pages/ServicesPage'
import { WorkPage } from './pages/WorkPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { AuthPage } from './pages/AuthPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminServiceManagementPage } from './pages/AdminServiceManagementPage'
import { AdminSessionManagementPage } from './pages/AdminSessionManagementPage'
import { AdminAppointmentManagementPage } from './pages/AdminAppointmentManagementPage'
import { AdminQueueManagementPage } from './pages/AdminQueueManagementPage'
import { AdminWorkManagementPage } from './pages/AdminWorkManagementPage'
import { AdminUserManagementPage } from './pages/AdminUserManagementPage'
import { getCurrentSession } from './lib/api'

type AppPage =
  | PageType
  | 'services'
  | 'work'
  | 'appointments'
  | 'auth'
  | 'admin-home'
  | 'admin-services'
  | 'admin-session'
  | 'admin-appointments'
  | 'admin-queue'
  | 'admin-work'
  | 'admin-users'

export function App() {
  const [sessionUser, setSessionUser] = useState(() => getCurrentSession()?.user ?? null)
  const [activePage, setActivePage] = useState<AppPage>('home')
  const [authTarget, setAuthTarget] = useState<AppPage>('profile')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
        { id: 'admin-work', label: 'Work Management' },
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
        { id: 'work', label: 'Our Work' },
        { id: 'profile', label: 'Profile' },
      ]
    }

    return [
      { id: 'services', label: 'Services' },
      { id: 'work', label: 'Our Work' },
      { id: 'login', label: 'Login/Register' },
    ]
  }, [isAdmin, isLoggedIn])

  const navigateFromMenu = (tab: MenuTab) => {
    if (tab === 'home' || tab === 'admin-home') {
      if (isAdmin) {
        setActivePage('admin-home')
      } else {
        setActivePage('home')
      }
      return
    }

    if (tab === 'admin-services') {
      setActivePage('admin-services')
      return
    }
    if (tab === 'admin-session') {
      setActivePage('admin-session')
      return
    }
    if (tab === 'admin-appointments') {
      setActivePage('admin-appointments')
      return
    }
    if (tab === 'admin-work') {
      setActivePage('admin-work')
      return
    }
    if (tab === 'admin-users') {
      setActivePage('admin-users')
      return
    }
    if (tab === 'admin-queue') {
      setActivePage('admin-queue')
      return
    }

    if (tab === 'services') {
      setActivePage('services')
      return
    }
    if (tab === 'book') {
      setActivePage('book')
      return
    }
    if (tab === 'work') {
      setActivePage('work')
      return
    }
    if (tab === 'queue') {
      setActivePage('queue')
      return
    }
    if (tab === 'appointments') {
      if (isLoggedIn) {
        setActivePage('appointments')
      } else {
        setAuthTarget('appointments')
        setActivePage('auth')
      }
      return
    }

    if (tab === 'login') {
      setAuthTarget('profile')
      setActivePage('auth')
      return
    }

    if (isLoggedIn) {
      setActivePage('profile')
    } else {
      setAuthTarget('profile')
      setActivePage('auth')
    }
  }

  const handleBottomNav = (page: PageType) => {
    if (page === 'profile' && !isLoggedIn) {
      setAuthTarget('profile')
      setActivePage('auth')
      return
    }
    setActivePage(page)
  }

  const handleAuthSuccess = () => {
    const user = getCurrentSession()?.user ?? null
    setSessionUser(user)

    if (user?.role === 'ADMIN') {
      setActivePage('admin-home')
      return
    }

    setActivePage('home')
  }

  const handleSignedOut = () => {
    setSessionUser(null)
    setActivePage('home')
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage key="home" onBookClick={() => setActivePage('book')} />
      case 'services':
        return <ServicesPage key="services" />
      case 'work':
        return <WorkPage key="work" />
      case 'appointments':
        return <AppointmentsPage key="appointments" />
      case 'admin-home':
        if (!isAdmin || !sessionUser) return <HomePage key="home-admin-fallback" onBookClick={() => setActivePage('book')} />
        return <AdminDashboardPage key="admin-home" />
      case 'admin-services':
        if (!isAdmin || !sessionUser) return <HomePage key="home-admin-fallback" onBookClick={() => setActivePage('book')} />
        return <AdminServiceManagementPage key="admin-services" />
      case 'admin-session':
        if (!isAdmin || !sessionUser) return <HomePage key="home-admin-fallback" onBookClick={() => setActivePage('book')} />
        return <AdminSessionManagementPage key="admin-session" />
      case 'admin-appointments':
        if (!isAdmin || !sessionUser) return <HomePage key="home-admin-fallback" onBookClick={() => setActivePage('book')} />
        return <AdminAppointmentManagementPage key="admin-appointments" />
      case 'admin-queue':
        if (!isAdmin || !sessionUser) return <HomePage key="home-admin-fallback" onBookClick={() => setActivePage('book')} />
        return <AdminQueueManagementPage key="admin-queue" />
      case 'admin-work':
        if (!isAdmin || !sessionUser) return <HomePage key="home-admin-fallback" onBookClick={() => setActivePage('book')} />
        return <AdminWorkManagementPage key="admin-work" />
      case 'admin-users':
        if (!isAdmin || !sessionUser) return <HomePage key="home-admin-fallback" onBookClick={() => setActivePage('book')} />
        return <AdminUserManagementPage key="admin-users" />
      case 'book':
        return (
          <BookingPage
            key="book"
            onRequireAuth={() => {
              setAuthTarget('book')
              setActivePage('auth')
            }}
            onBookingComplete={() => setActivePage('queue')}
          />
        )
      case 'queue':
        return <QueuePage key="queue" />
      case 'profile':
        return <ProfilePage key="profile" onSignedOut={handleSignedOut} />
      case 'auth':
        return <AuthPage key="auth" onAuthSuccess={handleAuthSuccess} />
      default:
        return <HomePage key="home" onBookClick={() => setActivePage('book')} />
    }
  }

  const isAdminPage = activePage.startsWith('admin-')
const getPageTitle = (page: AppPage) => {
    switch(page) {
      case 'home': return 'Salon Home';
      case 'book': return 'Book Appointment';
      case 'queue': return 'Live Queue';
      case 'profile': return 'My Profile';
      case 'services': return 'Our Services';
      case 'work': return 'Our Work';
      case 'appointments': return 'My Appointments';
      case 'auth': return 'Sign In';
      default: return page.replace('admin-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-inter text-slate-800">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        <TopBar 
          title={getPageTitle(activePage)} 
          onMenuClick={() => setIsMenuOpen(true)} 
        />
        
        <HamburgerMenu 
          items={menuItems} 
          onSelect={navigateFromMenu} 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
        
        <div className="flex-1 pt-16 pb-24 overflow-y-auto bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/50">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </div>

        {!isAdmin && !isAdminPage ? (
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100">
             <BottomNav activePage={activePage as PageType} onChange={handleBottomNav} role={bottomNavRole} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
