export type TileSuit = 'souzu' | 'dragon'

export type SouzuRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type DragonValue = 'white' | 'green' | 'red'

export type SouzuTile = Readonly<{
  suit: 'souzu'
  rank: SouzuRank
  id: `souzu-${SouzuRank}`
  label: string
  sortOrder: number
}>

export type DragonTile = Readonly<{
  suit: 'dragon'
  value: DragonValue
  id: `dragon-${DragonValue}`
  label: string
  sortOrder: number
}>

export type Tile = SouzuTile | DragonTile

const souzuTiles = [
  { suit: 'souzu', rank: 1, id: 'souzu-1', label: '1索', sortOrder: 1 },
  { suit: 'souzu', rank: 2, id: 'souzu-2', label: '2索', sortOrder: 2 },
  { suit: 'souzu', rank: 3, id: 'souzu-3', label: '3索', sortOrder: 3 },
  { suit: 'souzu', rank: 4, id: 'souzu-4', label: '4索', sortOrder: 4 },
  { suit: 'souzu', rank: 5, id: 'souzu-5', label: '5索', sortOrder: 5 },
  { suit: 'souzu', rank: 6, id: 'souzu-6', label: '6索', sortOrder: 6 },
  { suit: 'souzu', rank: 7, id: 'souzu-7', label: '7索', sortOrder: 7 },
  { suit: 'souzu', rank: 8, id: 'souzu-8', label: '8索', sortOrder: 8 },
  { suit: 'souzu', rank: 9, id: 'souzu-9', label: '9索', sortOrder: 9 },
] as const satisfies readonly SouzuTile[]

const dragonTiles = [
  { suit: 'dragon', value: 'white', id: 'dragon-white', label: '白', sortOrder: 10 },
  { suit: 'dragon', value: 'green', id: 'dragon-green', label: '发', sortOrder: 11 },
  { suit: 'dragon', value: 'red', id: 'dragon-red', label: '中', sortOrder: 12 },
] as const satisfies readonly DragonTile[]

export const allowedTiles = [...souzuTiles, ...dragonTiles] as const satisfies readonly Tile[]

export const tileIds = allowedTiles.map((tile) => tile.id)

export function compareTiles(left: Tile, right: Tile): number {
  return left.sortOrder - right.sortOrder
}

export function isSameTile(left: Tile, right: Tile): boolean {
  return left.id === right.id
}

export function getTileById(id: Tile['id']): Tile {
  const tile = allowedTiles.find((candidate) => candidate.id === id)

  if (!tile) {
    throw new Error(`Unknown tile id: ${id}`)
  }

  return tile
}
