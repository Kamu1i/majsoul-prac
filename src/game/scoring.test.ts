import { describe, expect, it } from 'vitest'
import { createNewGameState, type Actor, type GameEndResult, type GameState } from './game-state'
import { initialPlayerPoints } from './player'
import { createScoreSettlement, ronPointDelta, settleGameEnd, tsumoPointDelta } from './scoring'

function fixedRandomSource(): number {
  return 0.42
}

function winResult(winner: Actor, method: 'ron' | 'tsumo'): GameEndResult {
  return {
    type: 'win',
    winner,
    loser: method === 'ron' ? (winner === 'player' ? 'computer' : 'player') : null,
    method,
    yaku: method === 'tsumo' ? ['tsumo'] : ['yakuhai'],
    isHaitei: false,
    isHoutei: false,
  }
}

function pointsTotal(state: Pick<GameState, 'player' | 'computer'>): number {
  return state.player.points + state.computer.points
}

describe('基础计分', () => {
  it('玩家荣和时玩家增加 20000 点、电脑扣除 20000 点', () => {
    const state = createNewGameState(fixedRandomSource)
    const settlement = createScoreSettlement(winResult('player', 'ron'), state)

    expect(settlement).toEqual({
      reason: 'ron',
      delta: {
        player: ronPointDelta,
        computer: -ronPointDelta,
      },
      after: {
        player: initialPlayerPoints + ronPointDelta,
        computer: initialPlayerPoints - ronPointDelta,
      },
    })
  })

  it('电脑荣和时电脑增加 20000 点、玩家扣除 20000 点', () => {
    const state = createNewGameState(fixedRandomSource)
    const settlement = createScoreSettlement(winResult('computer', 'ron'), state)

    expect(settlement.delta).toEqual({
      player: -ronPointDelta,
      computer: ronPointDelta,
    })
    expect(settlement.after).toEqual({
      player: initialPlayerPoints - ronPointDelta,
      computer: initialPlayerPoints + ronPointDelta,
    })
  })

  it('玩家自摸时玩家增加 15000 点、电脑扣除 15000 点', () => {
    const state = createNewGameState(fixedRandomSource)
    const settlement = createScoreSettlement(winResult('player', 'tsumo'), state)

    expect(settlement).toEqual({
      reason: 'tsumo',
      delta: {
        player: tsumoPointDelta,
        computer: -tsumoPointDelta,
      },
      after: {
        player: initialPlayerPoints + tsumoPointDelta,
        computer: initialPlayerPoints - tsumoPointDelta,
      },
    })
  })

  it('电脑自摸时电脑增加 15000 点、玩家扣除 15000 点', () => {
    const state = createNewGameState(fixedRandomSource)
    const settlement = createScoreSettlement(winResult('computer', 'tsumo'), state)

    expect(settlement.delta).toEqual({
      player: -tsumoPointDelta,
      computer: tsumoPointDelta,
    })
    expect(settlement.after).toEqual({
      player: initialPlayerPoints - tsumoPointDelta,
      computer: initialPlayerPoints + tsumoPointDelta,
    })
  })

  it('流局时双方点数不变', () => {
    const state = createNewGameState(fixedRandomSource)
    const settlement = createScoreSettlement({ type: 'exhaustive-draw' }, state)

    expect(settlement).toEqual({
      reason: 'exhaustive-draw',
      delta: {
        player: 0,
        computer: 0,
      },
      after: {
        player: initialPlayerPoints,
        computer: initialPlayerPoints,
      },
    })
  })

  it('结算前后双方点数变化总和符合二人零和结算预期', () => {
    const state = createNewGameState(fixedRandomSource)
    const settledState = settleGameEnd({
      ...state,
      endResult: winResult('player', 'ron'),
    })

    expect(pointsTotal(settledState)).toBe(pointsTotal(state))
    expect(settledState.scoreSettlement?.delta.player).toBe(-settledState.scoreSettlement!.delta.computer)
  })
})
