import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { applyReferralCode } from '@/services/referral.service'
import { getMe } from '@/services/auth.service'

export function ReferralApplyHost() {
  const { user, setUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const attemptedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    if (user.referredByCode) return

    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    if (!ref) return
    if (ref === user.referralCode) return
    if (attemptedRef.current.has(ref)) return
    attemptedRef.current.add(ref)

    void applyReferralCode(ref)
      .then(() => getMe())
      .then(({ user: fresh }) => setUser(fresh))
      .catch(() => {})
      .finally(() => {
        params.delete('ref')
        const search = params.toString()
        navigate(location.pathname + (search ? `?${search}` : ''), {
          replace: true,
          state: location.state,
        })
      })
  }, [user, location.pathname, location.search, location.state, navigate, setUser])

  return null
}
