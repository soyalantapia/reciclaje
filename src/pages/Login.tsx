import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowRight, Leaf } from 'lucide-react'
import { api, ApiError } from '@/services/api'
import { useSessionStore } from '@/store/session'
import { useWalletStore } from '@/store/wallet'
import { Logo } from '@/components/features/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
})
type FormValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useSessionStore((s) => s.setSession)
  const hydrateFromUser = useWalletStore((s) => s.hydrateFromUser)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'camila@reciclaxp.app', password: 'demo123' },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  async function doLogin() {
    setLoading(true)
    try {
      const user = await api.getMe()
      setSession(user)
      hydrateFromUser(user)
      toast.success(`¡Hola, ${user.name.split(' ')[0]}! 🌱`)
      navigate(from, { replace: true })
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-eco-grid bg-background px-6 pb-10 pt-safe">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold leading-tight">
            Reciclá. Sumá XP.
            <br />
            <span className="text-eco-600">Cambiá tu mundo.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
            Convertí cada tapita en XP, beneficios reales y proyectos que podés ver crecer.
          </p>
        </div>

        <form onSubmit={handleSubmit(doLogin)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && (
              <p className="mt-1 text-xs font-medium text-danger">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs font-medium text-danger">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" block size="lg" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={doLogin} disabled={loading}>
            Google
          </Button>
          <Button variant="secondary" onClick={doLogin} disabled={loading}>
            Apple
          </Button>
        </div>

        <button
          onClick={doLogin}
          disabled={loading}
          className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-eco-700"
        >
          <Leaf size={15} /> Entrar a la demo sin registro
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Demo de producto · datos simulados · ReciclaXP v0.1
      </p>
    </div>
  )
}
