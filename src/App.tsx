import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CouponProvider } from '@/stores/CouponContext'
import { LanguageProvider } from '@/stores/LanguageContext'
import { NotificationProvider } from '@/stores/NotificationContext'

import Index from './pages/Index'
import Explore from './pages/Explore'
import CouponDetail from './pages/CouponDetail'
import Upload from './pages/Upload'
import Saved from './pages/Saved'
import Profile from './pages/Profile'
import TravelPlanner from './pages/TravelPlanner'
import VendorDashboard from './pages/VendorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import Seasonal from './pages/Seasonal'
import Notifications from './pages/Notifications'
import Checkout from './pages/Checkout'
import Challenges from './pages/Challenges'
import ItineraryDetail from './pages/ItineraryDetail'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <LanguageProvider>
    <CouponProvider>
      <NotificationProvider>
        <BrowserRouter
          future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/coupon/:id" element={<CouponDetail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/travel-planner" element={<TravelPlanner />} />
                <Route path="/vendor" element={<VendorDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/seasonal" element={<Seasonal />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/itinerary/:id" element={<ItineraryDetail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </NotificationProvider>
    </CouponProvider>
  </LanguageProvider>
)

export default App
