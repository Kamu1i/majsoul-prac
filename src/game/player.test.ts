import { describe, expect, it } from 'vitest'
import { createPlayerState, initialPlayerPoints } from './player'
import { createTilePool } from './deck'

describe('玩家状态', () => {
  it('新建玩家状态时点数为 100000', () => {
    expect(createPlayerState().points).toBe(initialPlayerPoints)
  })

  it('新建玩家状态时手牌、牌河、副露列表为空', () => {
    const player = createPlayerState()

    expect(player.hand).toEqual([])
    expect(player.discardPile).toEqual([])
    expect(player.melds).toEqual([])
  })

  it('可以独立创建玩家和电脑两份实例，互不影响', () => {
    const player = createPlayerState()
    const computer = createPlayerState()
    const [tileCopy] = createTilePool()

    player.hand.push(tileCopy)
    player.discardPile.push(tileCopy)
    player.melds.push({
      type: 'pon',
      tiles: [tileCopy, tileCopy, tileCopy],
      calledTile: tileCopy,
      from: 'computer',
    })
    player.points -= 1000

    expect(computer.hand).toEqual([])
    expect(computer.discardPile).toEqual([])
    expect(computer.melds).toEqual([])
    expect(computer.points).toBe(initialPlayerPoints)
  })

  it('玩家和电脑的副露列表实例互不影响', () => {
    const player = createPlayerState()
    const computer = createPlayerState()
    const tileCopies = createTilePool().slice(0, 3)

    player.melds.push({
      type: 'pon',
      tiles: tileCopies,
      calledTile: tileCopies[0],
      from: 'computer',
    })

    expect(player.melds).toHaveLength(1)
    expect(computer.melds).toEqual([])
  })
})
