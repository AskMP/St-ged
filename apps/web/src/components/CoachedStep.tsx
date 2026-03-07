import type { ReactNode } from 'react'
import { CoachingTooltip } from './CoachingTooltip'
import { findTermsInText } from '../lib/coaching'

interface CoachedStepProps {
  step: string
}

export function CoachedStep({ step }: CoachedStepProps): ReactNode {
  const terms = findTermsInText(step)
  
  if (terms.length === 0) {
    return <>{step}</>
  }

  const elements: ReactNode[] = []
  let lastIndex = 0

  for (const termInfo of terms) {
    // Add text before this term
    if (termInfo.index > lastIndex) {
      elements.push(step.slice(lastIndex, termInfo.index))
    }

    // Add the term with tooltip
    elements.push(
      <CoachingTooltip
        key={`${termInfo.term}-${termInfo.index}`}
        term={termInfo.term}
        definition={termInfo.definition}
        category={termInfo.category}
      >
        {step.slice(termInfo.index, termInfo.index + termInfo.length)}
      </CoachingTooltip>
    )

    lastIndex = termInfo.index + termInfo.length
  }

  // Add remaining text
  if (lastIndex < step.length) {
    elements.push(step.slice(lastIndex))
  }

  return <>{elements}</>
}
