import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'

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
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/users" element={<PlaceholderPage title="Usuários" />} />
          <Route path="/users/new" element={<PlaceholderPage title="Novo Usuário" />} />
          <Route path="/users/:id/edit" element={<PlaceholderPage title="Editar Usuário" />} />
          <Route path="/clients" element={<PlaceholderPage title="Clientes" />} />
          <Route path="/clients/new" element={<PlaceholderPage title="Novo Cliente" />} />
          <Route path="/clients/:id/edit" element={<PlaceholderPage title="Editar Cliente" />} />
          <Route path="/boards" element={<PlaceholderPage title="Quadros" />} />
          <Route path="/boards/:id" element={<PlaceholderPage title="Board" />} />
          <Route path="/finance" element={<PlaceholderPage title="Financeiro" />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<PlaceholderPage title="404 — Página não encontrada" />} />
    </Routes>
  )
}
