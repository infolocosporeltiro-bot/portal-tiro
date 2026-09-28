import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: 'Portal Tiro España',
  description: 'Tiradas, campos, empresas y anuncios del sector del tiro deportivo en España.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
        <footer className="footer"><div className="shell footer-inner"><span>Portal Tiro España</span><span>Información y comunidad de tiro deportivo</span></div></footer>
      </body>
    </html>
  )
}
