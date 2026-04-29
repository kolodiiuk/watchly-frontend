export const ContentType = {
  Movie: 0,
  Episode: 1,
} as const;

export type ContentType =
  (typeof ContentType)[keyof typeof ContentType];