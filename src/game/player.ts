import type { Actor } from './game-state'
import type { TileCopy } from './deck'

export const initialPlayerPoints = 100000

export type MeldType = 'chi' | 'pon' | 'open-kan' | 'closed-kan'

export type Meld = Readonly<{
  type: MeldType
  tiles: readonly TileCopy[]
  calledTile: TileCopy | null
  from: Actor | null
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
