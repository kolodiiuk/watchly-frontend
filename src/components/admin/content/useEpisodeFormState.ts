import { useState } from 'react';
import type { ValidationErrors } from './validation';

export interface EpisodeFormStubState {
  isDirty: boolean;
  isSubmitting: boolean;
  errors: ValidationErrors;
}

export function useEpisodeFormState() {
  const [state] = useState<EpisodeFormStubState>({
    isDirty: false,
    isSubmitting: false,
    errors: {},
  });

  return {
    ...state,
    markDirty: () => undefined,
    reset: () => undefined,
    canCloseWithoutPrompt: !state.isDirty,
  };
}
