import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BarChart3,
  Check,
  ChevronRight,
  Crown,
  LogOut,
  Send,
} from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useWalletStore } from '@/store/wallet'
import { useActivityStore } from '@/store/activity'
import { formatDate, formatNumber } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'

const PREMIUM_PERKS = [
  'Mejores canjes por la misma cantidad de XP',
  'Transferí XP a otros usuarios de la comunidad',
  'Acceso anticipado a beneficios y desafíos exclusivos',
  'Reportes personales de impacto ambiental',
]

export default function Profile() {
  const navigate = useNavigate()
  const user = useSessionStore((s) => s.user)
  const setPremium = useSessionStore((s) => s.setPremium)
  const logout = useSessionStore((s) => s.logout)
  const { reputationXp, spendableXp } = useWalletStore()
  const resetWallet = useWalletStore((s) => s.reset)
  const sessionContributions = useActivityStore((s) => s.sessionContributions)
  const clearActivity = useActivityStore((s) => s.clear)
  const { data: history } = useApi(() => api.getContributions(), [])

  const [transferOpen, setTransferOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  if (!user) return null

  const totalAportes = (history?.length ?? 0) + sessionContributions.length

  function goPremium() {
    setPremium(true)
    toast.success('¡Bienvenida a Premium! ⭐ Tus canjes ahora rinden más.')
  }

  function doTransfer() {
    const n = Number(amount)
    if (!recipient.trim()) return toast.error('Ingresá un destinatario')
    if (!n || n <= 0) return toast.error('Ingresá un monto válido')
    if (!useWalletStore.getState().spend(n)) {
      return toast.error('No te alcanzan los XP canjeables')
    }
    setTransferOpen(false)
    setAmount('')
    setRecipient('')
    toast.success(`Enviaste ${formatNumber(n)} XP a ${recipient} 🤝`)
  }

  function doLogout() {
    logout()
    resetWallet()
    clearActivity()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-5">
      {/* Header de perfil */}
      <div className="flex items-center gap-4">
        <Avatar name={user.name} color={user.avatarColor} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-extrabold">{user.name}</h1>
            {user.isPremium && <Badge variant="xp">⭐ Premium</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Nivel {user.level} · {user.levelName}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.city} · desde {formatDate(user.joinedAt)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-lg font-extrabold text-eco-700">{formatNumber(reputationXp)}</p>
          <p className="text-[11px] text-muted-foreground">XP reputación</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-lg font-extrabold text-xp-600">{formatNumber(spendableXp)}</p>
          <p className="text-[11px] text-muted-foreground">XP canjeable</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-lg font-extrabold">{totalAportes}</p>
          <p className="text-[11px] text-muted-foreground">aportes</p>
        </div>
      </div>

      {/* Premium */}
      {user.isPremium ? (
        <div className="rounded-2xl border border-xp-200 bg-xp-50 p-5">
          <div className="flex items-center gap-2 font-extrabold text-xp-700">
            <Crown size={20} /> Sos Premium
          </div>
          <ul className="mt-3 space-y-1.5">
            {PREMIUM_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-eco-600" /> {p}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900 p-5 text-white">
          <div className="flex items-center gap-2 font-extrabold text-xp-300">
            <Crown size={20} /> Pasate a Premium
          </div>
          <p className="mt-1 text-sm text-white/70">
            La app es gratis. Premium potencia tus beneficios y tu impacto.
          </p>
          <ul className="mt-3 space-y-1.5">
            {PREMIUM_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/90">
                <Check size={16} className="mt-0.5 shrink-0 text-xp-300" /> {p}
              </li>
            ))}
          </ul>
          <Button variant="xp" block size="lg" className="mt-4" onClick={goPremium}>
            Hacerme Premium
          </Button>
        </div>
      )}

      {/* Transferir XP */}
      <button
        onClick={() => setTransferOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-eco-100 text-eco-700">
          <Send size={18} />
        </span>
        <div className="flex-1">
          <p className="font-bold">Transferir XP</p>
          <p className="text-xs text-muted-foreground">
            Enviá XP canjeables a otro usuario de la comunidad
          </p>
        </div>
        <ChevronRight size={20} className="text-muted-foreground" />
      </button>

      {/* Panel empresas */}
      <Link
        to="/empresas"
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-eco-100 text-eco-700">
          <BarChart3 size={18} />
        </span>
        <div className="flex-1">
          <p className="font-bold">Panel para empresas</p>
          <p className="text-xs text-muted-foreground">Dashboard de impacto B2B (demo)</p>
        </div>
        <ChevronRight size={20} className="text-muted-foreground" />
      </Link>

      <Button variant="ghost" block onClick={doLogout} className="text-danger">
        <LogOut size={18} /> Cerrar sesión
      </Button>

      {/* Modal transferir */}
      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transferir XP">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Disponible: <span className="font-bold text-foreground">{formatNumber(spendableXp)} XP</span>
          </p>
          <div>
            <Label htmlFor="recipient">Destinatario</Label>
            <Input
              id="recipient"
              placeholder="@usuario o email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="amount">Cantidad de XP</Label>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button block size="lg" onClick={doTransfer}>
            Enviar XP
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Las transferencias tienen límites y auditoría antifraude (demo).
          </p>
        </div>
      </Modal>
    </div>
  )
}
