import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { GroupIdentityStep } from './GroupIdentityStep'
import { ScoringConfigStep } from './ScoringConfigStep'
import { useCreateGroup } from '@/hooks/useGroups'
import { GroupCreateSchema } from '@/lib/schemas'

interface GroupsModalCreateProps {
  onBack: () => void
  onCreated: (newGroupId: string) => void
}

export function GroupsModalCreate({ onBack, onCreated }: GroupsModalCreateProps) {
  const createGroup = useCreateGroup()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState<string | null>('⚽')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [resultPoints, setResultPoints] = useState(1)
  const [exactScorePoints, setExactScorePoints] = useState(3)
  const [championBetEnabled, setChampionBetEnabled] = useState(true)
  const [championFirstPoints, setChampionFirstPoints] = useState(15)
  const [championSecondPoints, setChampionSecondPoints] = useState(10)
  const [nameError, setNameError] = useState('')

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
      {
        onSuccess: data => onCreated(data.group.id),
      },
    )
  }

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <button
          type="button"
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[var(--text-muted)] transition hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
          aria-label="Voltar"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>
        <span>Passo {step} de 2</span>
      </div>

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
    </div>
  )
}
