import { describe, expect, it } from 'vitest'
import { allowedTiles, tileIds } from './tile'
import { countTileTypes, createTilePool, shuffleTilePool, type RandomSource } from './deck'

function createRepeatingRandomSource(values: readonly number[]): RandomSource {
  let index = 0

  return () => {
    const value = values[index % values.length]
    index += 1
    return value
  }
}

describe('完整牌池生成', () => {
  it('生成后的牌池总数为 48', () => {
    expect(createTilePool()).toHaveLength(48)
  })

  it('每一种允许牌都正好出现 4 次', () => {
    const counts = countTileTypes(createTilePool())

    for (const tile of allowedTiles) {
      expect(counts.get(tile.id)).toBe(4)
    }
  })

  it('不会生成任何非法牌', () => {
    const allowedTileIds = new Set(tileIds)
    const tilePool = createTilePool()

    expect(tilePool.every((tileCopy) => allowedTileIds.has(tileCopy.tile.id))).toBe(true)
  })

  it('每一种牌只生成 1 至 4 的副本序号', () => {
    const copyIndexesByTileId = new Map<string, number[]>()

    for (const tileCopy of createTilePool()) {
      copyIndexesByTileId.set(tileCopy.tile.id, [
        ...(copyIndexesByTileId.get(tileCopy.tile.id) ?? []),
        tileCopy.copyIndex,
      ])
    }

    for (const tileId of tileIds) {
      expect(copyIndexesByTileId.get(tileId)).toEqual([1, 2, 3, 4])
    }
  })

  it('多次生成牌池时，未洗牌前的组成完全一致', () => {
    const firstPool = createTilePool()
    const secondPool = createTilePool()

    expect(secondPool).toEqual(firstPool)
    expect(secondPool).not.toBe(firstPool)
  })
})

describe('洗牌', () => {
  it('洗牌后牌数仍为 48', () => {
    expect(shuffleTilePool(createTilePool())).toHaveLength(48)
  })

  it('洗牌后每种牌仍正好 4 张', () => {
    const counts = countTileTypes(shuffleTilePool(createTilePool()))

    for (const tile of allowedTiles) {
      expect(counts.get(tile.id)).toBe(4)
    }
  })

  it('使用固定随机来源时，洗牌结果可重复', () => {
    const randomValues = [0.9, 0.1, 0.7, 0.3, 0.5]
    const firstShuffle = shuffleTilePool(createTilePool(), createRepeatingRandomSource(randomValues))
    const secondShuffle = shuffleTilePool(createTilePool(), createRepeatingRandomSource(randomValues))

    expect(secondShuffle).toEqual(firstShuffle)
    expect(firstShuffle).not.toEqual(createTilePool())
  })

  it('洗牌不会修改原始牌池', () => {
    const tilePool = createTilePool()
    const originalTilePool = [...tilePool]
    const shuffledTilePool = shuffleTilePool(tilePool, createRepeatingRandomSource([0.25, 0.75]))

    expect(tilePool).toEqual(originalTilePool)
    expect(shuffledTilePool).not.toBe(tilePool)
  })
})
