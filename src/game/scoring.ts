import type { Actor, GameEndResult, ScoreDelta, ScoreReason, ScoreSettlement } from './game-state'
import type { PlayerState } from './player'

export const ronPointDelta = 20000
export const tsumoPointDelta = 15000

type PlayerScoreState = Readonly<{
  player: Pick<PlayerState, 'points'>
  computer: Pick<PlayerState, 'points'>
}>

function zeroDelta(): ScoreDelta {
  return {
    player: 0,
    computer: 0,
  }
}

function getOpponent(actor: Actor): Actor {
  return actor === 'player' ? 'computer' : 'player'
}

function getScoreReason(endResult: GameEndResult): ScoreReason {
  if (endResult.type === 'exhaustive-draw') {
    return 'exhaustive-draw'
  }

  return endResult.method
}

function getPointDelta(endResult: GameEndResult): ScoreDelta {
  if (endResult.type === 'exhaustive-draw') {
    return zeroDelta()
  }

  if (endResult.method === 'tsumo') {
    const loser = getOpponent(endResult.winner)

    return {
      ...zeroDelta(),
      [endResult.winner]: tsumoPointDelta,
      [loser]: -tsumoPointDelta,
    }
  }

  if (endResult.loser === null) {
    return zeroDelta()
  }

  return {
    ...zeroDelta(),
    [endResult.winner]: ronPointDelta,
    [endResult.loser]: -ronPointDelta,
  }
}

export function createScoreSettlement(endResult: GameEndResult, state: PlayerScoreState): ScoreSettlement {
  const delta = getPointDelta(endResult)

  return {
    reason: getScoreReason(endResult),
    delta,
    after: {
      player: state.player.points + delta.player,
      computer: state.computer.points + delta.computer,
    },
  }
}

export function applyScoreSettlement<TState extends PlayerScoreState>(
  state: TState,
  settlement: ScoreSettlement,
): TState {
  return {
    ...state,
    player: {
      ...state.player,
      points: settlement.after.player,
    },
    computer: {
      ...state.computer,
      points: settlement.after.computer,
    },
  }
}

export function settleGameEnd<TState extends PlayerScoreState & { endResult: GameEndResult | null }>(
  state: TState,
): TState & { scoreSettlement: ScoreSettlement | null } {
  if (state.endResult === null) {
    return {
      ...state,
      scoreSettlement: null,
    }
  }

  const settlement = createScoreSettlement(state.endResult, state)

  return {
    ...applyScoreSettlement(state, settlement),
    scoreSettlement: settlement,
  }
}
