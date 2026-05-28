import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Check, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/features/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const RUBROS = [
  'Comercio',
  'Estación de servicio',
  'Marca / cadena',
  'Club / estadio',
  'Municipio',
  'Otro',
]

export default function CommerceRegister() {
  const [done, setDone] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [rubro, setRubro] = useState(RUBROS[0])

  function submit() {
    if (!name.trim()) return toast.error('Ingresá el nombre de tu comercio')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error('Ingresá un email válido')
    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center bg-eco-grid bg-background px-6 pb-10 pt-safe text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-eco-100 text-eco-600 dark:bg-eco-900/40 dark:text-eco-300">
          <Check size={56} strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">¡Recibimos tu solicitud!</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Gracias por sumar a <span className="font-semibold text-foreground">{name}</span> a la red.
          Te contactamos a <span className="font-semibold text-foreground">{email}</span> para activar
          tu cuenta y coordinar tus puntos de reciclaje.
        </p>
        <div className="mt-6 w-full max-w-xs space-y-2">
          <Link to="/comercio/login">
            <Button block size="lg">
              Volver al ingreso
            </Button>
          </Link>
          <Link to="/" className="block text-sm font-semibold text-eco-700 dark:text-eco-300">
            Ir a la app
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          (Demo: el alta todavía no crea la cuenta — definimos el flujo más adelante.)
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-eco-grid bg-background px-6 pb-10 pt-safe">
      <div className="flex flex-col pt-8">
        <Link
          to="/comercio/login"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft size={16} /> Volver
        </Link>

        <div className="mb-6">
          <div className="mb-3 flex justify-center">
            <Logo />
          </div>
          <div className="mx-auto mb-3 flex w-fit items-center gap-1.5 rounded-full bg-eco-100 px-3 py-1 text-xs font-bold text-eco-800 dark:bg-eco-900/40 dark:text-eco-200">
            <Store size={14} /> Sumá tu comercio
          </div>
          <h1 className="text-center text-2xl font-extrabold leading-tight">Registrá tu comercio</h1>
          <p className="mx-auto mt-2 max-w-xs text-center text-sm text-muted-foreground">
            Dejanos tus datos y te contactamos para activarte en la red.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="rname">Nombre del comercio</Label>
            <Input id="rname" placeholder="Mi Café" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="remail">Email</Label>
            <Input
              id="remail"
              type="email"
              inputMode="email"
              placeholder="contacto@micomercio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="rphone">Teléfono</Label>
            <Input
              id="rphone"
              type="tel"
              inputMode="tel"
              placeholder="+54 9 11 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label>Rubro</Label>
            <div className="flex flex-wrap gap-2">
              {RUBROS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRubro(r)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-semibold',
                    r === rubro ? 'bg-eco-600 text-white' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Button block size="lg" onClick={submit}>
            Registrar mi comercio
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Al registrarte aceptás los términos de la red ReciclaXP.
          </p>
        </div>
      </div>
    </div>
  )
}
