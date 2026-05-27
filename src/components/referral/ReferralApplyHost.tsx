import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/hooks/useAuth'

interface ReferralNotice {
  title: string
  description: string
}

export function ReferralApplyHost() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<ReferralNotice | null>(null)

  useEffect(() => {
    if (!user) {
      setNotice(null)
      return
    }

    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    if (!ref) {
      setNotice(null)
      return
    }

    setNotice(
      user.referredByCode
        ? {
            title: 'Indicação já registrada',
            description: 'Seu usuário já possui uma indicação vinculada.',
          }
        : {
            title: 'Indicação apenas para novas contas',
            description: 'Indicações são válidas apenas para novas contas. Como sua conta já existe, este código não pode ser aplicado.',
          },
    )
  }, [user, location.search])

  function handleOpenChange(open: boolean) {
    if (open) return

    setNotice(null)
    const params = new URLSearchParams(location.search)
    params.delete('ref')
    const search = params.toString()
    navigate(location.pathname + (search ? `?${search}` : ''), {
      replace: true,
      state: location.state,
    })
  }

  return (
    <Modal
      open={notice !== null}
      onOpenChange={handleOpenChange}
      title={notice?.title}
      description={notice?.description}
    >
      <div className="flex justify-end px-5 py-4">
        <Button type="button" onClick={() => handleOpenChange(false)}>
          Entendi
        </Button>
      </div>
    </Modal>
  )
}
