import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const logged = Boolean(data?.claims?.sub)
  let isAdmin = false
  if (logged) {
    const result = await supabase.rpc('is_admin')
    isAdmin = Boolean(result.data)
  }

  return (
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand"><span className="brand-mark">PT</span><span>Portal Tiro <b>España</b></span></Link>
        <nav className="main-nav" aria-label="Principal">
          <Link href="/anuncios">Anuncios</Link>
          <Link href="/tiradas">Tiradas</Link>
          <Link href="/campos">Campos</Link>
          <Link href="/empresas">Empresas</Link>
          {isAdmin && <Link href="/admin">Administración</Link>}
        </nav>
        <div className="nav-actions">
          <Link href={logged ? '/cuenta' : '/login'} className="button button-ghost">{logged ? 'Mi cuenta' : 'Entrar'}</Link>
          <Link href={logged ? '/cuenta' : '/login?next=/cuenta'} className="button">Publicar</Link>
        </div>
      </div>
    </header>
  )
}
