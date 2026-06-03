import type { TileCopy } from './deck'
import type { Actor, GameState } from './game-state'
import type { PlayerState } from './player'

function isSameTileCopy(firstTile: TileCopy, secondTile: TileCopy): boolean {
  return firstTile.tile.id === secondTile.tile.id && firstTile.copyIndex === secondTile.copyIndex
}

function removeTileCopy(hand: TileCopy[], tileToDiscard: TileCopy): TileCopy[] | null {
  const tileIndex = hand.findIndex((tileCopy) => isSameTileCopy(tileCopy, tileToDiscard))

  if (tileIndex === -1) {
    return null
  }

  return [...hand.slice(0, tileIndex), ...hand.slice(tileIndex + 1)]
}

function discardForActor(actorState: PlayerState, tileToDiscard: TileCopy): PlayerState | null {
  const handAfterDiscard = removeTileCopy(actorState.hand, tileToDiscard)

  if (handAfterDiscard === null) {
    return null
  }

  return {
    ...actorState,
    hand: handAfterDiscard,
    discardPile: [...actorState.discardPile, tileToDiscard],
  }
}

export function discardTile(state: GameState, actor: Actor, tileToDiscard: TileCopy): GameState {
  if (state.status === 'ended' || state.currentActor !== actor) {
    return state
  }

  const actorState = actor === 'player' ? state.player : state.computer
  const actorStateAfterDiscard = discardForActor(actorState, tileToDiscard)

  if (actorStateAfterDiscard === null) {
    return state
  }

  return {
    ...state,
    player: actor === 'player' ? actorStateAfterDiscard : state.player,
    computer: actor === 'computer' ? actorStateAfterDiscard : state.computer,
    lastDiscard: {
      tile: tileToDiscard,
      actor,
    },
    isHoutei: state.isHaitei,
  }
}
