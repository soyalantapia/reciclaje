import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl">♻️</p>
      <h1 className="mt-4 text-2xl font-extrabold">Página no encontrada</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lo que buscás no existe o fue reciclado.
      </p>
      <Link to="/" className="mt-6">
        <Button size="lg">Volver al inicio</Button>
      </Link>
    </div>
  )
}
