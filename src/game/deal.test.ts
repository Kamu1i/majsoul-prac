import { describe, expect, it } from 'vitest'
import { createTilePool, shuffleTilePool, type TileCopy } from './deck'
import { dealInitialHands, initialHandTileCount, sortTileCopies } from './deal'

function getTileCopyKey(tileCopy: TileCopy): string {
  return `${tileCopy.tile.id}:${tileCopy.copyIndex}`
}

describe('初始发牌流程', () => {
  it('发牌后玩家手牌为 13 张', () => {
    const result = dealInitialHands(createTilePool())

    expect(result.player.hand).toHaveLength(initialHandTileCount)
  })

  it('发牌后电脑手牌为 13 张', () => {
    const result = dealInitialHands(createTilePool())

    expect(result.computer.hand).toHaveLength(initialHandTileCount)
  })

  it('发牌后牌山剩余 22 张', () => {
    const result = dealInitialHands(createTilePool())

    expect(result.wall).toHaveLength(22)
  })

  it('发牌前后全部牌合计仍为 48 张', () => {
    const tileWall = shuffleTilePool(createTilePool(), () => 0.42)
    const result = dealInitialHands(tileWall)
    const allTilesAfterDeal = [...result.player.hand, ...result.computer.hand, ...result.wall]

    expect(allTilesAfterDeal).toHaveLength(tileWall.length)
    expect(new Set(allTilesAfterDeal.map(getTileCopyKey))).toEqual(
      new Set(tileWall.map(getTileCopyKey)),
    )
  })

  it('玩家和电脑手牌中不会出现同一实体牌被重复分配', () => {
    const result = dealInitialHands(createTilePool())
    const dealtTiles = [...result.player.hand, ...result.computer.hand]
    const dealtTileKeys = dealtTiles.map(getTileCopyKey)

    expect(new Set(dealtTileKeys)).toHaveLength(dealtTiles.length)
  })

  it('发牌后玩家和电脑手牌按固定牌序存储', () => {
    const result = dealInitialHands(shuffleTilePool(createTilePool(), () => 0.42))

    expect(result.player.hand).toEqual(sortTileCopies(result.player.hand))
    expect(result.computer.hand).toEqual(sortTileCopies(result.computer.hand))
  })

  it('发牌不会修改传入的牌山', () => {
    const tileWall = shuffleTilePool(createTilePool(), () => 0.42)
    const originalTileWall = [...tileWall]

    dealInitialHands(tileWall)

    expect(tileWall).toEqual(originalTileWall)
  })
})
