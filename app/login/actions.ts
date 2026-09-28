'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : '/cuenta'
  return next.startsWith('/') && !next.startsWith('//') ? next : '/cuenta'
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = safeNext(formData.get('next'))
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent('Email o contraseña incorrectos')}`)
  redirect(next)
}

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const displayName = String(formData.get('display_name') ?? '').trim()
  const supabase = await createClient()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName }, emailRedirectTo: `${site}/auth/confirm` },
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?check=1')
}
