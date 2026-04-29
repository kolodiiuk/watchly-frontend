export const ContentType = {
  Episode: 0,
  Movie: 1,
} as const;

export type ContentType =
  (typeof ContentType)[keyof typeof ContentType];