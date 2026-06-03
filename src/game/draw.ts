import type { TileCopy } from './deck'
import type { Actor, GameState } from './game-state'
import type { PlayerState } from './player'

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
    return {
      ...state,
      status: 'ended',
      currentActor: null,
      endResult: { type: 'exhaustive-draw' },
      isHaitei: false,
    }
  }

  return {
    ...updateActorState(state, state.currentActor, drawnTile),
    wall: remainingWall,
    isHaitei: remainingWall.length === 0,
  }
}
