import { describe, expect, it } from 'vitest'
import { chooseComputerDiscardTile } from './ai'
import { createTilePool, type TileCopy } from './deck'
import type { Tile } from './tile'

function getTileCopy(tileId: Tile['id'], copyIndex: TileCopy['copyIndex']): TileCopy {
  const tileCopy = createTilePool().find(
    (candidate) => candidate.tile.id === tileId && candidate.copyIndex === copyIndex,
  )

  if (tileCopy === undefined) {
    throw new Error(`测试数据中没有找到实体牌 ${tileId}:${copyIndex}`)
  }

  return tileCopy
}

describe('chooseComputerDiscardTile', () => {
  it('固定电脑手牌中优先返回固定牌序最小的孤立牌', () => {
    const hand = [
      getTileCopy('souzu-2', 1),
      getTileCopy('souzu-3', 1),
      getTileCopy('souzu-6', 1),
      getTileCopy('dragon-white', 1),
      getTileCopy('dragon-white', 2),
      getTileCopy('dragon-red', 1),
    ]

    const selectedTile = chooseComputerDiscardTile(hand)

    expect(selectedTile).toEqual(getTileCopy('souzu-6', 1))
  })

  it('返回的牌一定存在于电脑手牌中', () => {
    const hand = [
      getTileCopy('souzu-1', 1),
      getTileCopy('souzu-4', 1),
      getTileCopy('dragon-green', 1),
    ]

    const selectedTile = chooseComputerDiscardTile(hand)

    expect(hand).toContainEqual(selectedTile)
  })

  it('电脑手牌为空时返回无可打牌结果', () => {
    expect(chooseComputerDiscardTile([])).toBeNull()
  })

  it('多次输入同一手牌时返回结果一致', () => {
    const hand = [
      getTileCopy('souzu-9', 1),
      getTileCopy('souzu-5', 1),
      getTileCopy('souzu-5', 2),
      getTileCopy('dragon-white', 1),
    ]

    expect(chooseComputerDiscardTile(hand)).toEqual(chooseComputerDiscardTile(hand))
  })

  it('没有孤立牌时返回固定牌序最小的手牌', () => {
    const hand = [
      getTileCopy('souzu-7', 1),
      getTileCopy('souzu-8', 1),
      getTileCopy('souzu-9', 1),
    ]

    expect(chooseComputerDiscardTile(hand)).toEqual(getTileCopy('souzu-7', 1))
  })
})
