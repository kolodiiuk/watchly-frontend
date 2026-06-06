import type {IconProps} from "./types.ts";

export function ChevronIcon({className = 'h-4 w-4', direction = 'up'}: IconProps & { direction?: 'up' | 'down' })
{
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d={direction === 'up' ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}
