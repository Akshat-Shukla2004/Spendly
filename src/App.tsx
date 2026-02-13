import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/"          element={<DashboardPage />} />
          <Route path="/expenses"  element={<ExpensesPage />}  />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings"  element={<SettingsPage />}  />
          <Route path="*"          element={<DashboardPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
