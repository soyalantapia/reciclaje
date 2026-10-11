import '@testing-library/jest-dom/vitest'

/**
 * Node 25 trae un `localStorage` propio que, sin `--localstorage-file`, no tiene `setItem`, y le
 * gana al de jsdom: los stores con persist no podían guardar. Si el almacenamiento del entorno no
 * anda, uno en memoria, nuevo para cada archivo de prueba, como un navegador recién abierto.
 */
function almacenEnMemoria(): Storage {
  const memoria = new Map<string, string>()
  return {
    getItem: (k: string) => memoria.get(k) ?? null,
    setItem: (k: string, v: string) => void memoria.set(k, String(v)),
    removeItem: (k: string) => void memoria.delete(k),
    clear: () => memoria.clear(),
    key: (i: number) => [...memoria.keys()][i] ?? null,
    get length() {
      return memoria.size
    },
  } as Storage
}

for (const nombre of ['localStorage', 'sessionStorage'] as const) {
  try {
    globalThis[nombre].setItem('__prueba__', '1')
    globalThis[nombre].removeItem('__prueba__')
  } catch {
    globalThis[nombre] = almacenEnMemoria()
  }
}
