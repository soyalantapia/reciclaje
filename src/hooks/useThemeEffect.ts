import { useEffect } from 'react'
import { useUiStore } from '@/store/ui'

/** Sincroniza la clase `.dark` del <html> con el store de UI. */
export function useThemeEffect() {
  const theme = useUiStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])
}
