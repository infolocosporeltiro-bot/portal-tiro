import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProfile } from './actions'

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const id = claimsData?.claims?.sub
  if (!id) redirect('/login?next=/cuenta')
  const { data: profile } = await supabase.from('profiles').select('display_name,province,municipality,verification_status').eq('id', id).single()
  const { data: listings } = await supabase.from('listings').select('id,title,status,created_at').eq('seller_id', id).order('created_at',{ascending:false}).limit(6)
  return <main className="page"><div className="shell"><div className="section-head"><div><div className="eyebrow muted">Área privada</div><h1 className="page-title">Mi cuenta</h1></div><form action="/auth/signout" method="post"><button className="button button-ghost">Cerrar sesión</button></form></div><div className="account-grid"><aside className="sidebar"><b>{profile?.display_name || 'Usuario'}</b><p className="muted">Estado: {profile?.verification_status ?? 'unverified'}</p><Link href="/cuenta">Perfil</Link><Link href="/anuncios">Mis publicaciones</Link><Link href="/tiradas">Tiradas</Link></aside><section className="panel"><h2>Perfil</h2><form action={updateProfile} className="form-stack"><label><span className="label">Nombre visible</span><input className="input" name="display_name" defaultValue={profile?.display_name ?? ''}/></label><label><span className="label">Provincia</span><input className="input" name="province" defaultValue={profile?.province ?? ''}/></label><label><span className="label">Municipio</span><input className="input" name="municipality" defaultValue={profile?.municipality ?? ''}/></label><button className="button">Guardar cambios</button></form><hr style={{border:0,borderTop:'1px solid var(--line)',margin:'28px 0'}}/><h2>Mis publicaciones</h2>{listings?.length ? listings.map(x=><div key={x.id} style={{padding:'11px 0',borderBottom:'1px solid var(--line)'}}><b>{x.title}</b> <span className="pill">{x.status}</span></div>):<p className="muted">Todavía no tienes publicaciones.</p>}</section></div></div></main>
}
