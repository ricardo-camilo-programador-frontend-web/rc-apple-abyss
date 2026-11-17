export const APPLE_SPRITES = [
  '/assets/apples/red-delicious-apple-1.webp',
  '/assets/apples/red-delicious-apple-2.webp',
  '/assets/apples/red-delicious-apple-3.webp',
  '/assets/apples/red-delicious-apple-4.webp',
] as const;

/** Sprite da maçã pela porcentagem de vida (0–100). */
export const getAppleSpriteIndex = (percent: number): number => {
  if (percent > 75) return 0;
  if (percent > 50) return 1;
  if (percent > 25) return 2;
  return 3;
};
