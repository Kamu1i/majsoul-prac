import { chooseComputerDiscardTile } from './ai'
import { drawTile } from './draw'
import type { GameState } from './game-state'
import { discardTileAndSwitchTurn } from './turn'
import { resolveComputerTsumoAfterDraw } from './tsumo'

export function playComputerTurn(state: GameState): GameState {
  if (state.status !== 'computer-turn' || state.currentActor !== 'computer') {
    return state
  }

  const stateAfterDraw = drawTile(state)

  if (stateAfterDraw.status === 'ended') {
    return stateAfterDraw
  }

  const stateAfterTsumo = resolveComputerTsumoAfterDraw(stateAfterDraw)

  if (stateAfterTsumo.status === 'ended') {
    return stateAfterTsumo
  }

  const tileToDiscard = chooseComputerDiscardTile(stateAfterTsumo.computer.hand)

  if (tileToDiscard === null) {
    return stateAfterTsumo
  }

  return discardTileAndSwitchTurn(stateAfterTsumo, 'computer', tileToDiscard)
}
