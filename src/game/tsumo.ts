import type { Actor, GameState, ScoreSettlement } from './game-state'
import { evaluateWinningHand, type WinEvaluation } from './ron'
import { createScoreSettlement } from './scoring'

function getActorHand(state: GameState, actor: Actor) {
  return actor === 'player' ? state.player.hand : state.computer.hand
}

function isActorTurn(state: GameState, actor: Actor): boolean {
  return state.currentActor === actor && state.status === (actor === 'player' ? 'player-turn' : 'computer-turn')
}

export function canTsumo(state: GameState, winner: Actor): WinEvaluation {
  if (state.status === 'ended' || !isActorTurn(state, winner)) {
    return {
      canWin: false,
      yaku: [],
    }
  }

  return evaluateWinningHand(getActorHand(state, winner), {
    method: 'tsumo',
    melds: winner === 'player' ? state.player.melds : state.computer.melds,
    isHaitei: state.isHaitei,
  })
}

export function declareTsumo(state: GameState, winner: Actor): GameState {
  const tsumoEvaluation = canTsumo(state, winner)

  if (!tsumoEvaluation.canWin) {
    return state
  }

  const endResult = {
    type: 'win' as const,
    winner,
    loser: null,
    method: 'tsumo' as const,
    yaku: tsumoEvaluation.yaku,
    isHaitei: state.isHaitei,
    isHoutei: false,
  }
  const scoreSettlement: ScoreSettlement = createScoreSettlement(endResult, state)

  return {
    ...state,
    player: {
      ...state.player,
      points: scoreSettlement.after.player,
    },
    computer: {
      ...state.computer,
      points: scoreSettlement.after.computer,
    },
    status: 'ended',
    currentActor: null,
    endResult,
    scoreSettlement,
  }
}

export function resolveComputerTsumoAfterDraw(state: GameState): GameState {
  if (state.currentActor !== 'computer') {
    return state
  }

  return declareTsumo(state, 'computer')
}
