import type { TileCopy } from './deck'
import { compareTiles, type Tile } from './tile'

function compareTileCopies(left: TileCopy, right: TileCopy): number {
  const tileComparison = compareTiles(left.tile, right.tile)

  if (tileComparison !== 0) {
    return tileComparison
  }

  return left.copyIndex - right.copyIndex
}

function countTilesById(hand: readonly TileCopy[]): Map<Tile['id'], number> {
  const counts = new Map<Tile['id'], number>()

  for (const tileCopy of hand) {
    counts.set(tileCopy.tile.id, (counts.get(tileCopy.tile.id) ?? 0) + 1)
  }

  return counts
}

function hasSouzuNeighbor(hand: readonly TileCopy[], tileCopy: TileCopy): boolean {
  if (tileCopy.tile.suit !== 'souzu') {
    return false
  }

  return hand.some((candidate) => {
    if (candidate.tile.suit !== 'souzu' || tileCopy.tile.suit !== 'souzu') {
      return false
    }

    return Math.abs(candidate.tile.rank - tileCopy.tile.rank) === 1
  })
}

function isIsolatedTileCopy(
  tileCopy: TileCopy,
  hand: readonly TileCopy[],
  tileCounts: ReadonlyMap<Tile['id'], number>,
): boolean {
  if (tileCounts.get(tileCopy.tile.id) !== 1) {
    return false
  }

  return tileCopy.tile.suit === 'dragon' || !hasSouzuNeighbor(hand, tileCopy)
}

export function chooseComputerDiscardTile(hand: readonly TileCopy[]): TileCopy | null {
  if (hand.length === 0) {
    return null
  }

  const tileCounts = countTilesById(hand)
  const isolatedTileCopies = hand.filter((tileCopy) => isIsolatedTileCopy(tileCopy, hand, tileCounts))
  const discardCandidates = isolatedTileCopies.length > 0 ? isolatedTileCopies : hand

  return [...discardCandidates].sort(compareTileCopies)[0]
}
