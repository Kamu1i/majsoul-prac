import { evaluateWinningHand, type WinEvaluation } from './ron'
import type { Actor, GameState } from './game-state'

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
    isHaitei: state.isHaitei,
  })
}

export function declareTsumo(state: GameState, winner: Actor): GameState {
  const tsumoEvaluation = canTsumo(state, winner)

  if (!tsumoEvaluation.canWin) {
    return state
  }

  return {
    ...state,
    status: 'ended',
    currentActor: null,
    endResult: {
      type: 'win',
      winner,
      loser: null,
      method: 'tsumo',
      yaku: tsumoEvaluation.yaku,
      isHaitei: state.isHaitei,
      isHoutei: false,
    },
  }
}

export function resolveComputerTsumoAfterDraw(state: GameState): GameState {
  if (state.currentActor !== 'computer') {
    return state
  }

  return declareTsumo(state, 'computer')
}
