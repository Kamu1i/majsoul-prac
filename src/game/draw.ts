import type { TileCopy } from './deck'
import type { Actor, GameState } from './game-state'
import type { PlayerState } from './player'
import { createScoreSettlement } from './scoring'

function drawForActor(actorState: PlayerState, drawnTile: TileCopy): PlayerState {
  return {
    ...actorState,
    hand: [...actorState.hand, drawnTile],
  }
}

function updateActorState(state: GameState, actor: Actor, drawnTile: TileCopy): GameState {
  if (actor === 'player') {
    return {
      ...state,
      player: drawForActor(state.player, drawnTile),
    }
  }

  return {
    ...state,
    computer: drawForActor(state.computer, drawnTile),
  }
}

export function drawTile(state: GameState): GameState {
  if (state.status === 'ended' || state.currentActor === null) {
    return state
  }

  const [drawnTile, ...remainingWall] = state.wall

  if (drawnTile === undefined) {
    const endResult = { type: 'exhaustive-draw' as const }

    return {
      ...state,
      status: 'ended',
      currentActor: null,
      endResult,
      scoreSettlement: createScoreSettlement(endResult, state),
      isHaitei: false,
    }
  }

  return {
    ...updateActorState(state, state.currentActor, drawnTile),
    wall: remainingWall,
    isHaitei: remainingWall.length === 0,
  }
}
