import { discardTile } from './discard'
import type { TileCopy } from './deck'
import type { Actor, GameState, GameStatus } from './game-state'

function getNextActor(actor: Actor): Actor {
  return actor === 'player' ? 'computer' : 'player'
}

function getStatusForActor(actor: Actor): GameStatus {
  return actor === 'player' ? 'player-turn' : 'computer-turn'
}

export function switchTurnAfterDiscard(stateBeforeDiscard: GameState, stateAfterDiscard: GameState): GameState {
  if (stateAfterDiscard === stateBeforeDiscard || stateAfterDiscard.status === 'ended') {
    return stateAfterDiscard
  }

  const discardActor = stateAfterDiscard.lastDiscard?.actor

  if (discardActor === undefined) {
    return stateAfterDiscard
  }

  const nextActor = getNextActor(discardActor)

  return {
    ...stateAfterDiscard,
    currentActor: nextActor,
    status: getStatusForActor(nextActor),
  }
}

export function discardTileAndSwitchTurn(
  state: GameState,
  actor: Actor,
  tileToDiscard: TileCopy,
): GameState {
  const stateAfterDiscard = discardTile(state, actor, tileToDiscard)

  return switchTurnAfterDiscard(state, stateAfterDiscard)
}
