import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    </div>
  )
}

function LoginPlaceholder() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold text-foreground">Login</h1>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPlaceholder />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/users" element={<PlaceholderPage title="Usuários" />} />
        <Route path="/clients" element={<PlaceholderPage title="Clientes" />} />
        <Route path="/boards" element={<PlaceholderPage title="Quadros" />} />
        <Route path="/finance" element={<PlaceholderPage title="Financeiro" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<PlaceholderPage title="404 — Página não encontrada" />} />
    </Routes>
  )
}
