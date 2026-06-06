import type {IconProps} from "./types.ts";

export function PencilIcon({className = 'h-4 w-4'}: IconProps)
{
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M16.9 4.6 19.4 7.1M4 20h4.2L19.1 9.1a1.8 1.8 0 0 0 0-2.5l-1.7-1.7a1.8 1.8 0 0 0-2.5 0L4 15.8V20Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}
