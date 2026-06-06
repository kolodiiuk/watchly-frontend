import type {IconProps} from "./types.ts";

export function TrashIcon({className = 'h-4 w-4'}: IconProps)
{
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 13h8l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}
