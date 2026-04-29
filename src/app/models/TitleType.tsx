export const TitleType = {
  Movie: 1,
  Series: 2,
} as const;

export type TitleType =
  (typeof TitleType)[keyof typeof TitleType];