import { allowedTiles, type Tile } from './tile'

export type TileCopy = Readonly<{
  tile: Tile
  copyIndex: 1 | 2 | 3 | 4
}>

export type RandomSource = () => number

const tileCopyIndexes = [1, 2, 3, 4] as const

export function createTilePool(): TileCopy[] {
  return allowedTiles.flatMap((tile) =>
    tileCopyIndexes.map((copyIndex) => ({
      tile,
      copyIndex,
    })),
  )
}

export function shuffleTilePool(
  tilePool: readonly TileCopy[],
  randomSource: RandomSource = Math.random,
): TileCopy[] {
  const shuffledTilePool = [...tilePool]

  for (let index = shuffledTilePool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomSource() * (index + 1))
    ;[shuffledTilePool[index], shuffledTilePool[swapIndex]] = [
      shuffledTilePool[swapIndex],
      shuffledTilePool[index],
    ]
  }

  return shuffledTilePool
}

export function countTileTypes(tilePool: readonly TileCopy[]): Map<Tile['id'], number> {
  const counts = new Map<Tile['id'], number>()

  for (const tileCopy of tilePool) {
    counts.set(tileCopy.tile.id, (counts.get(tileCopy.tile.id) ?? 0) + 1)
  }

  return counts
}
