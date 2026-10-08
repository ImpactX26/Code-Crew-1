/**
 * Centralized image configuration.
 * Swap any src here to update imagery across the whole app.
 */
export const images = {
  hero: {
    src: '/images/germany-hero.png',
    alt: 'A student walking through a modern German university campus at golden hour',
  },
} as const

export type ImageKey = keyof typeof images
