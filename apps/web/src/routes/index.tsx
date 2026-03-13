import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { UserFormPage } from '@/pages/users/UserFormPage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { ClientFormPage } from '@/pages/clients/ClientFormPage'
import { WorkspacesPage } from '@/pages/boards/WorkspacesPage'
import { BoardPage } from '@/pages/boards/BoardPage'
import { FinancePage } from '@/pages/finance/FinancePage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/new" element={<UserFormPage />} />
          <Route path="/users/:id/edit" element={<UserFormPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<ClientFormPage />} />
          <Route path="/clients/:id/edit" element={<ClientFormPage />} />
          <Route path="/boards" element={<WorkspacesPage />} />
          <Route path="/boards/:id" element={<BoardPage />} />
          <Route path="/finance" element={<FinancePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<PlaceholderPage title="404 — Página não encontrada" />} />
    </Routes>
  )
}
