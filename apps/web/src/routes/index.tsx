import { Routes, Route } from 'react-router-dom'

function PlaceholderPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold text-foreground">Bewave Admin</h1>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<PlaceholderPage />} />
    </Routes>
  )
}
