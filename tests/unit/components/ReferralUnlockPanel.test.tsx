import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReferralUnlockPanel } from '@/components/referral/ReferralUnlockPanel'

describe('ReferralUnlockPanel', () => {
  it('builds the personal referral link without sending users directly to register', () => {
    render(
      <ReferralUnlockPanel
        featureName="a visualização de palpites"
        referralCount={1}
        referralCode="ABC12345"
      />,
    )

    expect(screen.getByDisplayValue(`${window.location.origin}/?ref=ABC12345`)).toBeInTheDocument()
    expect(screen.queryByDisplayValue(/\/auth\/register\?ref=/)).not.toBeInTheDocument()
  })
})
