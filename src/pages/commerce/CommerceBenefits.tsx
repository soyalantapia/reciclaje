import { useState } from 'react'
import { toast } from 'sonner'
import { Coins, Pause, Play, Plus, Trash2 } from 'lucide-react'
import { api } from '@/services/api'
import { useApi } from '@/hooks/useApi'
import { useSessionStore } from '@/store/session'
import { useCommerceBenefitsStore } from '@/store/commerceBenefits'
import type { Benefit, BenefitCategory } from '@/types'
import { cn, formatNumber, shortCode } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORIES: { value: BenefitCategory; label: string }[] = [
  { value: 'descuento', label: 'Descuento' },
  { value: 'producto', label: 'Producto' },
  { value: 'experiencia', label: 'Experiencia' },
  { value: 'combustible', label: 'Combustible' },
  { value: 'merch', label: 'Merch' },
  { value: 'entrada', label: 'Entrada' },
]
const EMOJIS = ['🎁', '☕', '🍔', '🥤', '⛽', '🎟️', '👕', '🍦', '💧', '🌱']

export default function CommerceBenefits() {
  const commerce = useSessionStore((s) => s.commerce)
  const { data: seeded, loading } = useApi(
    () => api.getBenefits({ sponsor: commerce!.id }),
    [commerce?.id],
  )
  const created = useCommerceBenefitsStore((s) => s.created)
  const pausedIds = useCommerceBenefitsStore((s) => s.pausedIds)
  const add = useCommerceBenefitsStore((s) => s.add)
  const remove = useCommerceBenefitsStore((s) => s.remove)
  const togglePause = useCommerceBenefitsStore((s) => s.togglePause)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<BenefitCategory>('descuento')
  const [costXp, setCostXp] = useState('500')
  const [emoji, setEmoji] = useState('🎁')

  if (!commerce) return null

  const createdMine = created.filter((b) => b.sponsorId === commerce.id)
  const all: Benefit[] = [...createdMine, ...(seeded ?? [])]

  function create() {
    if (!title.trim()) return toast.error('Poné un título al beneficio')
    const cost = Math.max(0, Number(costXp) || 0)
    add({
      id: `b_new_${shortCode(6)}`,
      title: title.trim(),
      sponsorId: commerce!.id,
      sponsorName: commerce!.name,
      category,
      costXp: cost,
      city: 'Red',
      description: description.trim() || 'Beneficio del comercio',
      stock: 100,
      emoji,
    })
    setOpen(false)
    setTitle('')
    setDescription('')
    setCostXp('500')
    setEmoji('🎁')
    setCategory('descuento')
    toast.success('Beneficio publicado 🎉')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">Beneficios</h1>
          <p className="text-sm text-muted-foreground">Lo que tus clientes pueden canjear con XP.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={16} /> Crear
        </Button>
      </div>

      {loading && [0, 1].map((i) => <Skeleton key={i} className="h-24 w-full" />)}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {all.map((b) => {
        const isCreated = createdMine.some((c) => c.id === b.id)
        const paused = pausedIds.includes(b.id)
        return (
          <div
            key={b.id}
            className={cn(
              'rounded-2xl border border-border bg-card p-4 shadow-sm',
              paused && 'opacity-60',
            )}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-2xl">
                {b.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold leading-tight">{b.title}</p>
                  {isCreated && <Badge variant="eco">Tuyo</Badge>}
                  {paused ? (
                    <Badge variant="neutral">Pausado</Badge>
                  ) : (
                    <Badge variant="success">Activo</Badge>
                  )}
                </div>
                <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-bold text-xp-700 dark:text-xp-300">
                  <Coins size={14} /> {formatNumber(b.costXp)} XP
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => togglePause(b.id)}>
                {paused ? (
                  <>
                    <Play size={14} /> Activar
                  </>
                ) : (
                  <>
                    <Pause size={14} /> Pausar
                  </>
                )}
              </Button>
              {isCreated && (
                <Button size="sm" variant="ghost" className="text-danger" onClick={() => remove(b.id)}>
                  <Trash2 size={14} /> Eliminar
                </Button>
              )}
            </div>
          </div>
        )
      })}
      </div>

      {!loading && all.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl">🎁</p>
          <p className="mt-2 font-bold">Todavía no tenés beneficios</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Publicá tu primer beneficio para traccionar clientes a tu local.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus size={16} /> Crear beneficio
          </Button>
        </div>
      )}

      {/* Modal crear */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo beneficio">
        <div className="space-y-4">
          <div>
            <Label htmlFor="bt">Título</Label>
            <Input
              id="bt"
              placeholder="20% en tu próxima compra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bd">Descripción</Label>
            <Input
              id="bd"
              placeholder="Válido de lunes a viernes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-semibold',
                    c.value === category
                      ? 'bg-eco-600 text-white'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bc">Costo (XP)</Label>
              <Input
                id="bc"
                type="number"
                inputMode="numeric"
                value={costXp}
                onChange={(e) => setCostXp(e.target.value)}
              />
            </div>
            <div>
              <Label>Ícono</Label>
              <div className="no-scrollbar flex gap-1 overflow-x-auto">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl',
                      e === emoji ? 'bg-eco-100 ring-2 ring-eco-500 dark:bg-eco-900/40' : 'bg-muted',
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button block size="lg" onClick={create}>
            Publicar beneficio
          </Button>
        </div>
      </Modal>
    </div>
  )
}
