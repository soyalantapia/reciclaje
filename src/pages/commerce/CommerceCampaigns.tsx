import { useState } from 'react'
import { toast } from 'sonner'
import { Pause, Play, Plus, Target, Trash2, Trophy, Zap, type LucideIcon } from 'lucide-react'
import { useSessionStore } from '@/store/session'
import { useCommerceCampaignsStore } from '@/store/commerceCampaigns'
import type { CampaignKind } from '@/types'
import { cn, shortCode } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'

const KINDS: { value: CampaignKind; label: string; icon: LucideIcon }[] = [
  { value: 'premio', label: 'Premio del mes', icon: Trophy },
  { value: 'multiplicador', label: 'Multiplicador XP', icon: Zap },
  { value: 'desafio', label: 'Desafío', icon: Target },
]
const KIND_MAP = Object.fromEntries(KINDS.map((k) => [k.value, k])) as Record<
  CampaignKind,
  (typeof KINDS)[number]
>

export default function CommerceCampaigns() {
  const commerce = useSessionStore((s) => s.commerce)
  const campaigns = useCommerceCampaignsStore((s) => s.campaigns)
  const add = useCommerceCampaignsStore((s) => s.add)
  const remove = useCommerceCampaignsStore((s) => s.remove)
  const toggle = useCommerceCampaignsStore((s) => s.toggle)

  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<CampaignKind>('premio')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [reward, setReward] = useState('')

  if (!commerce) return null

  const mine = campaigns.filter((c) => c.sponsorId === commerce.id)

  function create() {
    if (!title.trim()) return toast.error('Poné un título a la campaña')
    add({
      id: `cmp_${shortCode(6)}`,
      sponsorId: commerce!.id,
      kind,
      title: title.trim(),
      detail: detail.trim() || 'Campaña del comercio',
      reward: reward.trim() || 'Premio a definir',
      active: true,
      createdAt: new Date().toISOString(),
    })
    setOpen(false)
    setTitle('')
    setDetail('')
    setReward('')
    setKind('premio')
    toast.success('Campaña lanzada 🚀')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">Campañas</h1>
          <p className="text-sm text-muted-foreground">Premios, multiplicadores y desafíos.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={16} /> Crear
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {mine.map((c) => {
        const k = KIND_MAP[c.kind]
        const Icon = k.icon
        return (
          <div
            key={c.id}
            className={cn(
              'rounded-2xl border border-border bg-card p-4 shadow-sm',
              !c.active && 'opacity-60',
            )}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-300">
                <Icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold leading-tight">{c.title}</p>
                  {c.active ? (
                    <Badge variant="success">Activa</Badge>
                  ) : (
                    <Badge variant="neutral">Pausada</Badge>
                  )}
                </div>
                <p className="text-xs font-semibold text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
                <p className="mt-1 text-sm font-semibold text-eco-700 dark:text-eco-300">
                  🎁 {c.reward}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => toggle(c.id)}>
                {c.active ? (
                  <>
                    <Pause size={14} /> Pausar
                  </>
                ) : (
                  <>
                    <Play size={14} /> Activar
                  </>
                )}
              </Button>
              <Button size="sm" variant="ghost" className="text-danger" onClick={() => remove(c.id)}>
                <Trash2 size={14} /> Eliminar
              </Button>
            </div>
          </div>
        )
      })}
      </div>

      {mine.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl">📣</p>
          <p className="mt-2 font-bold">Todavía no lanzaste campañas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Creá un premio del mes o un multiplicador para activar a tu comunidad.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus size={16} /> Crear campaña
          </Button>
        </div>
      )}

      {/* Modal crear */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nueva campaña">
        <div className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setKind(value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold',
                    value === kind ? 'bg-eco-600 text-white' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="ct">Título</Label>
            <Input
              id="ct"
              placeholder="Reciclá más en julio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cd">Detalle</Label>
            <Input
              id="cd"
              placeholder="El que más XP sume gana…"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cr">Premio / recompensa</Label>
            <Input
              id="cr"
              placeholder="Un combo gratis por un mes"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
          </div>
          <Button block size="lg" onClick={create}>
            Lanzar campaña
          </Button>
        </div>
      </Modal>
    </div>
  )
}
