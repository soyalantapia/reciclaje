import QRCode from 'qrcode'

const OPTS = {
  width: 600,
  margin: 2,
  color: { dark: '#0c1f1a', light: '#ffffff' },
} as const

export function qrPngDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, OPTS)
}

/** Descarga el QR como PNG. */
export async function downloadQrPng(value: string, filename: string): Promise<void> {
  const url = await qrPngDataUrl(value)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Abre una ventana lista para imprimir con el QR + título. */
export async function printQr(value: string, title: string): Promise<void> {
  const url = await qrPngDataUrl(value)
  const w = window.open('', '_blank', 'width=460,height=620')
  if (!w) return
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>` +
      `<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:36px;color:#0c1f1a">` +
      `<h2 style="margin:0 0 4px">${title}</h2>` +
      `<p style="margin:0 0 18px;color:#059669;font-weight:700">Reciclá acá y sumá XP</p>` +
      `<img src="${url}" style="width:330px;height:330px" alt="QR"/>` +
      `<p style="margin-top:18px;color:#888;font-size:13px">ReciclaXP</p>` +
      `</body></html>`,
  )
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 350)
}
