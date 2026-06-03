import { chooseComputerDiscardTile } from './ai'
import { drawTile } from './draw'
import type { GameState } from './game-state'
import { discardTileAndSwitchTurn } from './turn'

export function playComputerTurn(state: GameState): GameState {
  if (state.status !== 'computer-turn' || state.currentActor !== 'computer') {
    return state
  }

  const stateAfterDraw = drawTile(state)

  if (stateAfterDraw.status === 'ended') {
    return stateAfterDraw
  }

  const tileToDiscard = chooseComputerDiscardTile(stateAfterDraw.computer.hand)

  if (tileToDiscard === null) {
    return stateAfterDraw
  }

  return discardTileAndSwitchTurn(stateAfterDraw, 'computer', tileToDiscard)
}
