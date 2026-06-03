import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { OnboardingShell } from '@/pages/onboarding/components/OnboardingShell'
import { GroupIdentityStep } from './components/GroupIdentityStep'
import { ScoringConfigStep } from './components/ScoringConfigStep'
import { useCreateGroup, useUserGroups } from '@/hooks/useGroups'
import { GroupCreateSchema } from '@/lib/schemas'

const easeBrasil = [0.2, 0.8, 0.2, 1] as const

export function CreateGroupPage() {
  const navigate = useNavigate()
  const createGroup = useCreateGroup()
  const { data: groupsData } = useUserGroups()

  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState<string | null>('⚽')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [resultPoints, setResultPoints] = useState(7)
  const [exactScorePoints, setExactScorePoints] = useState(10)
  const [championBetEnabled, setChampionBetEnabled] = useState(true)
  const [championFirstPoints, setChampionFirstPoints] = useState(25)
  const [championSecondPoints, setChampionSecondPoints] = useState(15)
  const [nameError, setNameError] = useState('')

  const hasGroups = (groupsData?.groups?.length ?? 0) > 0

  function handleNext() {
    const result = GroupCreateSchema.pick({ name: true }).safeParse({ name })
    if (!result.success) {
      setNameError(result.error.issues[0]?.message ?? 'Nome inválido')
      return
    }
    setNameError('')
    setStep(2)
  }

  function handleSubmit() {
    const result = GroupCreateSchema.safeParse({
      name,
      emoji: emoji ?? undefined,
      resultPoints,
      exactScorePoints,
      championBetEnabled,
      championFirstPoints,
      championSecondPoints,
    })
    if (!result.success) return

    createGroup.mutate(
      { ...result.data, coverUrl: coverUrl ?? undefined },
      { onSuccess: (data) => navigate(`/groups/${data.group.id}`) },
    )
  }

  const backTo = step === 1 ? (hasGroups ? '/groups' : '/onboarding') : undefined

  return (
    <OnboardingShell
      backTo={backTo}
      step={{ current: step, total: 2 }}
      showPattern={false}
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: easeBrasil }}
      >
        {step === 1 ? (
          <GroupIdentityStep
            name={name}
            emoji={emoji}
            coverUrl={coverUrl}
            onNameChange={setName}
            onEmojiChange={setEmoji}
            onCoverUrlChange={setCoverUrl}
            onNext={handleNext}
            nameError={nameError}
          />
        ) : (
          <ScoringConfigStep
            resultPoints={resultPoints}
            exactScorePoints={exactScorePoints}
            championBetEnabled={championBetEnabled}
            championFirstPoints={championFirstPoints}
            championSecondPoints={championSecondPoints}
            onResultPointsChange={setResultPoints}
            onExactScorePointsChange={setExactScorePoints}
            onChampionBetEnabledChange={setChampionBetEnabled}
            onChampionFirstPointsChange={setChampionFirstPoints}
            onChampionSecondPointsChange={setChampionSecondPoints}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            isPending={createGroup.isPending}
            isError={createGroup.isError}
          />
        )}
      </motion.div>
    </OnboardingShell>
  )
}
