import type { TileCopy } from './deck'
import { createPlayerState, type PlayerState } from './player'
import { compareTiles } from './tile'

export const initialHandTileCount = 13
export const dealtPlayerCount = 2

export type InitialDealResult = Readonly<{
  player: PlayerState
  computer: PlayerState
  wall: TileCopy[]
}>

export function sortTileCopies(tileCopies: readonly TileCopy[]): TileCopy[] {
  return [...tileCopies].sort((left, right) => {
    const tileOrder = compareTiles(left.tile, right.tile)

    if (tileOrder !== 0) {
      return tileOrder
    }

    return left.copyIndex - right.copyIndex
  })
}

export function dealInitialHands(tileWall: readonly TileCopy[]): InitialDealResult {
  const player = createPlayerState()
  const computer = createPlayerState()
  const dealtTileCount = initialHandTileCount * dealtPlayerCount

  player.hand = sortTileCopies(tileWall.slice(0, initialHandTileCount))
  computer.hand = sortTileCopies(tileWall.slice(initialHandTileCount, dealtTileCount))

  return {
    player,
    computer,
    wall: tileWall.slice(dealtTileCount),
  }
}
