import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, Shield, Clock, Zap, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/ui.store'
import logoDark from '@/assets/logo-dark.png'
import logoWhite from '@/assets/logo-white.png'
import axios from 'axios'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

type LoginStats = {
  totalClients: number
  monthlyRevenue: number
}

function useLoginStats() {
  const [stats, setStats] = useState<LoginStats | null>(null)

  useEffect(() => {
    const publicApi = axios.create({ baseURL: '/api/v1' })

    async function fetchStats() {
      try {
        const [clientsRes, financeRes] = await Promise.all([
          publicApi.get('/clients', { params: { limit: 999 } }).catch(() => null),
          publicApi.get('/finance/summary', {
            params: {
              dateFrom: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
              dateTo: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).padStart(2, '0')}`,
            },
          }).catch(() => null),
        ])
        const totalClients = clientsRes?.data?.data?.filter((c: { status: string }) => c.status === 'active')?.length ?? 0
        const monthlyRevenue = financeRes?.data?.data?.totalIncome ?? 0
        setStats({ totalClients, monthlyRevenue })
      } catch {
        // Stats are optional — fail silently
      }
    }
    fetchStats()
  }, [])

  return stats
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [credentialError, setCredentialError] = useState<string | null>(null)
  const loginMutation = useLogin()
  const { theme, toggleTheme } = useUiStore()
  const stats = useLoginStats()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginForm) {
    setCredentialError(null)
    loginMutation.mutate(data, {
      onError: () => {
        setCredentialError('Credenciais inválidas. Verifique seu e-mail e senha.')
      },
    })
  }

  function clearCredentialError() {
    if (credentialError) setCredentialError(null)
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-20 h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 lg:text-white/60 lg:hover:text-white"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Left — Form */}
      <div className="flex w-full flex-col justify-center bg-[#f4f4f0] px-8 py-12 dark:bg-zinc-950 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <img src={logoDark} alt="Bewave" className="hidden h-10 dark:block" />
            <img src={logoWhite} alt="Bewave" className="block h-10 dark:hidden" />
          </div>

          {/* Tag */}
          <span className="mb-4 inline-block rounded-full bg-[#03428E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#03428E]">
            Area Restrita
          </span>

          {/* Title */}
          <h1 className="mb-2 font-display text-4xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-100">
            Bem-vindo de volta<span className="text-[#03428E]">.</span>
          </h1>
          <p className="mb-10 text-sm text-zinc-500 dark:text-zinc-400">
            Acesse o painel de administração com suas credenciais.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoFocus
                  className="h-11 border-zinc-300 bg-white pl-10 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-[#03428E] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  {...register('email', { onChange: clearCredentialError })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 border-zinc-300 bg-white pl-10 pr-10 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-[#03428E] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  {...register('password', { onChange: clearCredentialError })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-[#03428E] hover:underline">
                Esqueceu a senha?
              </button>
            </div>

            {credentialError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                {credentialError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="h-11 w-full bg-[#03428E] text-white shadow-[0_4px_14px_rgba(3,66,142,0.4)] transition-all hover:bg-[#023672] hover:shadow-[0_6px_20px_rgba(3,66,142,0.5)] hover:-translate-y-0.5"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right — Visual Panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-[#03428E] lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Background decorative "B" */}
        <span className="pointer-events-none absolute -right-16 -top-16 select-none font-display text-[28rem] font-extrabold leading-none text-white/[0.04]">
          B
        </span>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-40 w-40 -translate-x-1/2 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute left-12 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Center — Floating cards */}
        <div className="relative z-10 space-y-4">
          <div className="w-fit rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/60">
              Faturamento do mês
            </p>
            <p className="font-display text-3xl font-bold text-white">
              {stats ? formatCurrency(stats.monthlyRevenue) : '—'}
            </p>
          </div>
          <div className="ml-8 w-fit rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/60">
              Clientes ativos
            </p>
            <p className="font-display text-3xl font-bold text-white">
              {stats ? stats.totalClients : '—'}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Painel Bewave
            </h2>
            <p className="mt-1 max-w-xs text-sm text-white/60">
              Gerencie clientes, projetos e finanças em um só lugar.
            </p>
          </div>

          <div className="flex items-center gap-6 border-t border-white/10 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Shield className="h-3.5 w-3.5" />
              Acesso seguro
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Clock className="h-3.5 w-3.5" />
              24/7
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Zap className="h-3.5 w-3.5" />
              v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
