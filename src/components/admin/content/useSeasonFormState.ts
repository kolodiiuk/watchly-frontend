import { useState } from 'react';
import type { ValidationErrors } from './validation';

export interface SeasonFormStubState {
  isDirty: boolean;
  isSubmitting: boolean;
  errors: ValidationErrors;
}

export function useSeasonFormState() {
  const [state] = useState<SeasonFormStubState>({
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
