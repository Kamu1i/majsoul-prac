import { describe, expect, it } from 'vitest'
import { isStandardWinningHand, standardMeldTileCount, standardWinningHandTileCount } from './rules'
import { getTileById, type Tile } from './tile'

function tiles(tileIds: Tile['id'][]): Tile[] {
  return tileIds.map(getTileById)
}

describe('基础胡牌牌形判断', () => {
  it('识别四组面子加一组雀头的合法标准形', () => {
    const hand = tiles([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white',
    ])

    expect(isStandardWinningHand(hand)).toBe(true)
  })

  it('识别包含索子顺子的合法牌形', () => {
    const hand = tiles([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-2', 'souzu-3', 'souzu-4',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-green', 'dragon-green',
    ])

    expect(isStandardWinningHand(hand)).toBe(true)
  })

  it('识别包含字牌刻子的合法牌形', () => {
    const hand = tiles([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])

    expect(isStandardWinningHand(hand)).toBe(true)
  })

  it('不会把字牌白发中当作顺子', () => {
    const hand = tiles([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-green', 'dragon-red',
      'souzu-1', 'souzu-1',
    ])

    expect(isStandardWinningHand(hand)).toBe(false)
  })

  it('缺少雀头时不可识别为有效牌形', () => {
    const hand = tiles([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-green',
    ])

    expect(isStandardWinningHand(hand)).toBe(false)
  })

  it('牌数不符合胡牌张数要求时不可识别为有效牌形', () => {
    const hand = tiles([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white', 'dragon-white',
      'dragon-red',
    ])

    expect(hand).toHaveLength(standardWinningHandTileCount - 1)
    expect(isStandardWinningHand(hand)).toBe(false)
  })

  it('包含非法牌时不可识别为有效牌形', () => {
    const invalidTile = {
      suit: 'wind',
      value: 'east',
      id: 'wind-east',
      label: '东',
      sortOrder: 13,
    } as unknown as Tile
    const hand = [
      ...tiles([
        'souzu-1', 'souzu-2', 'souzu-3',
        'souzu-4', 'souzu-5', 'souzu-6',
        'souzu-7', 'souzu-8', 'souzu-9',
        'dragon-white', 'dragon-white', 'dragon-white',
        'dragon-red',
      ]),
      invalidTile,
    ]

    expect(isStandardWinningHand(hand)).toBe(false)
  })

  it('导出当前标准形面子张数常量', () => {
    expect(standardMeldTileCount).toBe(3)
  })
})
