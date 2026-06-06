import { useState } from 'react';
import type { ValidationErrors } from '../services/validation';

export interface TitleFormStubState {
  isDirty: boolean;
  isSubmitting: boolean;
  errors: ValidationErrors;
}

export function useTitleFormState() {
  const [state] = useState<TitleFormStubState>({
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
