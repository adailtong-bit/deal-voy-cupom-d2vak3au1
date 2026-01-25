import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CouponProvider } from '@/stores/CouponContext'
import { LanguageProvider } from '@/stores/LanguageContext'

import Index from './pages/Index'
import Explore from './pages/Explore'
import CouponDetail from './pages/CouponDetail'
import Upload from './pages/Upload'
import Saved from './pages/Saved'
import Profile from './pages/Profile'
import TravelPlanner from './pages/TravelPlanner'
import VendorDashboard from './pages/VendorDashboard'
import Seasonal from './pages/Seasonal'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <LanguageProvider>
    <CouponProvider>
      <BrowserRouter
        future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/coupon/:id" element={<CouponDetail />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/travel-planner" element={<TravelPlanner />} />
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/seasonal" element={<Seasonal />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </CouponProvider>
  </LanguageProvider>
)

export default App
