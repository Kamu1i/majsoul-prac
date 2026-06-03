import { getTileById, tileIds, type SouzuRank, type Tile } from './tile'

const winningHandTileCount = 14
const meldTileCount = 3
const pairTileCount = 2
const sevenPairsCount = 7
const maxSameTileCount = 4

function isAllowedTile(tile: Tile): boolean {
  return tileIds.includes(tile.id)
}

function countTilesById(tiles: readonly Tile[]): Map<Tile['id'], number> {
  const counts = new Map<Tile['id'], number>()

  for (const tile of tiles) {
    counts.set(tile.id, (counts.get(tile.id) ?? 0) + 1)
  }

  return counts
}

function getTileCount(counts: ReadonlyMap<Tile['id'], number>, tileId: Tile['id']): number {
  return counts.get(tileId) ?? 0
}

function setTileCount(counts: Map<Tile['id'], number>, tileId: Tile['id'], count: number): void {
  if (count === 0) {
    counts.delete(tileId)
    return
  }

  counts.set(tileId, count)
}

function findFirstRemainingTileId(counts: ReadonlyMap<Tile['id'], number>): Tile['id'] | null {
  for (const tileId of tileIds) {
    if (getTileCount(counts, tileId) > 0) {
      return tileId
    }
  }

  return null
}

function removeTiles(counts: Map<Tile['id'], number>, tileIdsToRemove: readonly Tile['id'][]): Map<Tile['id'], number> | null {
  const nextCounts = new Map(counts)

  for (const tileId of tileIdsToRemove) {
    const currentCount = getTileCount(nextCounts, tileId)

    if (currentCount === 0) {
      return null
    }

    setTileCount(nextCounts, tileId, currentCount - 1)
  }

  return nextCounts
}

function getSouzuSequenceTileIds(tile: Tile): Tile['id'][] | null {
  if (tile.suit !== 'souzu' || tile.rank > 7) {
    return null
  }

  return [tile.id, getTileById(`souzu-${tile.rank + 1 as SouzuRank}`).id, getTileById(`souzu-${tile.rank + 2 as SouzuRank}`).id]
}

function canFormMelds(counts: Map<Tile['id'], number>): boolean {
  const firstTileId = findFirstRemainingTileId(counts)

  if (firstTileId === null) {
    return true
  }

  const firstTile = getTileById(firstTileId)
  const tripletCounts = removeTiles(counts, [firstTileId, firstTileId, firstTileId])

  if (tripletCounts !== null && canFormMelds(tripletCounts)) {
    return true
  }

  const sequenceTileIds = getSouzuSequenceTileIds(firstTile)

  if (sequenceTileIds === null) {
    return false
  }

  const sequenceCounts = removeTiles(counts, sequenceTileIds)

  return sequenceCounts !== null && canFormMelds(sequenceCounts)
}

function hasValidTileCounts(counts: ReadonlyMap<Tile['id'], number>): boolean {
  for (const count of counts.values()) {
    if (count > maxSameTileCount) {
      return false
    }
  }

  return true
}

function getWinningHandCounts(tiles: readonly Tile[]): Map<Tile['id'], number> | null {
  if (tiles.length !== winningHandTileCount || !tiles.every(isAllowedTile)) {
    return null
  }

  const counts = countTilesById(tiles)

  if (!hasValidTileCounts(counts)) {
    return null
  }

  return counts
}

export function isStandardWinningHand(tiles: readonly Tile[]): boolean {
  const counts = getWinningHandCounts(tiles)

  if (counts === null) {
    return false
  }

  for (const tileId of tileIds) {
    if (getTileCount(counts, tileId) < pairTileCount) {
      continue
    }

    const countsWithoutPair = removeTiles(counts, [tileId, tileId])

    if (countsWithoutPair !== null && canFormMelds(countsWithoutPair)) {
      return true
    }
  }

  return false
}

export function isSevenPairsWinningHand(tiles: readonly Tile[]): boolean {
  const counts = getWinningHandCounts(tiles)

  if (counts === null || counts.size !== sevenPairsCount) {
    return false
  }

  for (const count of counts.values()) {
    if (count !== pairTileCount) {
      return false
    }
  }

  return true
}

export function isBasicWinningHand(tiles: readonly Tile[]): boolean {
  return isStandardWinningHand(tiles) || isSevenPairsWinningHand(tiles)
}

export const standardWinningHandTileCount = winningHandTileCount
export const standardMeldTileCount = meldTileCount
