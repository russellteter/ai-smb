'use client'

import { Header } from '@/components/layout/header'
import { MobileNavigation } from '@/components/mobile/mobile-navigation'
import { AnalyticsDashboard } from '@/components/analytics/dashboard'
import { FloatingElements } from '@/components/ui/floating-elements'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
      {/* Background Elements */}
      <FloatingElements count={2} size="md" color="gradient" />
      
      {/* Mobile Navigation */}
      <MobileNavigation currentPage="analytics" />
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Main Content */}
      <main className="pt-16 md:pt-0">
        <div className="container-app py-6 md:py-8">
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}