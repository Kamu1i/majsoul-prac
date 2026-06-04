import { describe, expect, it } from 'vitest'
import { createNewGameState } from './game-state'

function fixedRandomSource(): number {
  return 0.42
}

describe('完整对局状态', () => {
  it('新对局初始化后包含玩家和电脑状态', () => {
    const state = createNewGameState(fixedRandomSource)

    expect(state.player.hand).toHaveLength(13)
    expect(state.computer.hand).toHaveLength(13)
    expect(state.player.points).toBe(100000)
    expect(state.computer.points).toBe(100000)
  })

  it('新对局初始化后牌山剩余数量正确', () => {
    const state = createNewGameState(fixedRandomSource)

    expect(state.wall).toHaveLength(22)
  })

  it('新对局初始化后当前行动方为玩家', () => {
    const state = createNewGameState(fixedRandomSource)

    expect(state.currentActor).toBe('player')
  })

  it('新对局初始化后海底和河底标记为未触发', () => {
    const state = createNewGameState(fixedRandomSource)

    expect(state.isHaitei).toBe(false)
    expect(state.isHoutei).toBe(false)
  })

  it('新对局初始化后最后打出的牌为空', () => {
    const state = createNewGameState(fixedRandomSource)

    expect(state.lastDiscard).toBeNull()
  })

  it('新对局初始化后对局阶段不是已结束', () => {
    const state = createNewGameState(fixedRandomSource)

    expect(state.status).not.toBe('ended')
    expect(state.endResult).toBeNull()
    expect(state.scoreSettlement).toBeNull()
  })

  it('新对局初始化后全部实体牌数量守恒', () => {
    const state = createNewGameState(fixedRandomSource)
    const allTileKeys = [
      ...state.player.hand,
      ...state.computer.hand,
      ...state.wall,
    ].map((tileCopy) => `${tileCopy.tile.id}:${tileCopy.copyIndex}`)

    expect(allTileKeys).toHaveLength(48)
    expect(new Set(allTileKeys).size).toBe(48)
  })
})
