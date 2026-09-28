import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = '/cuenta'
  redirectTo.search = ''
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(redirectTo)
  }
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) return NextResponse.redirect(redirectTo)
  }
  redirectTo.pathname = '/login'
  redirectTo.searchParams.set('error', 'No se pudo confirmar la cuenta')
  return NextResponse.redirect(redirectTo)
}
