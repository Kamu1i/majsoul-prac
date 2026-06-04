import { describe, expect, it } from 'vitest'
import { allowedTiles, compareTiles, getTileById, isSameTile, tileIds } from './tile'

describe('基础牌数据模型', () => {
  it('只定义 12 种允许牌', () => {
    expect(allowedTiles).toHaveLength(12)
    expect(new Set(tileIds)).toHaveLength(12)
  })

  it('包含一索至九索、白、发、中', () => {
    expect(tileIds).toEqual([
      'souzu-1',
      'souzu-2',
      'souzu-3',
      'souzu-4',
      'souzu-5',
      'souzu-6',
      'souzu-7',
      'souzu-8',
      'souzu-9',
      'dragon-white',
      'dragon-green',
      'dragon-red',
    ])

    expect(allowedTiles.map((tile) => tile.label)).toEqual([
      '1索',
      '2索',
      '3索',
      '4索',
      '5索',
      '6索',
      '7索',
      '8索',
      '9索',
      '白',
      '发',
      '中',
    ])
  })

  it('不包含万子、筒子、风牌或赤宝牌', () => {
    expect(tileIds).not.toContain('manzu-1')
    expect(tileIds).not.toContain('pinzu-1')
    expect(tileIds).not.toContain('wind-east')
    expect(tileIds).not.toContain('wind-south')
    expect(tileIds).not.toContain('wind-west')
    expect(tileIds).not.toContain('wind-north')
    expect(tileIds).not.toContain('red-five-souzu')
  })

  it('同一种牌可以稳定比较', () => {
    const oneSouzu = getTileById('souzu-1')
    const anotherOneSouzu = getTileById('souzu-1')

    expect(isSameTile(oneSouzu, anotherOneSouzu)).toBe(true)
    expect(compareTiles(oneSouzu, anotherOneSouzu)).toBe(0)
  })

  it('不同牌不会被判断为同一种牌', () => {
    expect(isSameTile(getTileById('souzu-1'), getTileById('souzu-2'))).toBe(false)
  })

  it('读取未知牌 ID 时会抛出错误', () => {
    expect(() => getTileById('wind-east' as Parameters<typeof getTileById>[0])).toThrow('Unknown tile id: wind-east')
  })

  it('排序后索子按一至九排列，字牌顺序为白发中', () => {
    const shuffled = [
      getTileById('dragon-red'),
      getTileById('souzu-9'),
      getTileById('souzu-1'),
      getTileById('dragon-white'),
      getTileById('souzu-5'),
      getTileById('dragon-green'),
    ]

    expect([...shuffled].sort(compareTiles).map((tile) => tile.id)).toEqual([
      'souzu-1',
      'souzu-5',
      'souzu-9',
      'dragon-white',
      'dragon-green',
      'dragon-red',
    ])
  })
})
