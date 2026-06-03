import type { TileCopy } from './deck'

export const initialPlayerPoints = 100000

export type MeldType = 'chi' | 'pon' | 'kan'

export type Meld = Readonly<{
  type: MeldType
  tiles: readonly TileCopy[]
}>

export type PlayerState = {
  hand: TileCopy[]
  discardPile: TileCopy[]
  melds: Meld[]
  points: number
}

export function createPlayerState(): PlayerState {
  return {
    hand: [],
    discardPile: [],
    melds: [],
    points: initialPlayerPoints,
  }
}
