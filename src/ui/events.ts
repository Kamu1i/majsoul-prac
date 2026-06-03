import type { TileCopy } from '../game/deck'
import type { GameState } from '../game/game-state'
import { drawTile } from '../game/draw'
import { playComputerTurn } from '../game/computer-turn'
import { discardTileAndSwitchTurn } from '../game/turn'
import { renderApp } from './render'

function findPlayerTileByButton(state: GameState, button: HTMLButtonElement): TileCopy | null {
  const tileId = button.dataset.tileId
  const copyIndexText = button.dataset.copyIndex

  if (tileId === undefined || copyIndexText === undefined) {
    return null
  }

  const copyIndex = Number(copyIndexText)

  return state.player.hand.find((tile) => tile.tile.id === tileId && tile.copyIndex === copyIndex) ?? null
}

function resolvePlayerDiscard(state: GameState, tileToDiscard: TileCopy): GameState {
  const stateAfterDiscard = discardTileAndSwitchTurn(state, 'player', tileToDiscard)

  if (stateAfterDiscard.status !== 'computer-turn') {
    return stateAfterDiscard
  }

  return playComputerTurn(stateAfterDiscard)
}

function canPlayerDiscard(state: GameState): boolean {
  return state.status === 'player-turn' && state.currentActor === 'player' && state.player.hand.length > 13
}

function canPlayerDraw(state: GameState): boolean {
  return state.status === 'player-turn' && state.currentActor === 'player' && state.player.hand.length === 13
}

export function bindAppEvents(container: HTMLElement, initialState: GameState): () => void {
  let currentState = initialState

  const handleClick = (event: MouseEvent): void => {
    const clickedElement = event.target

    if (!(clickedElement instanceof HTMLButtonElement)) {
      return
    }

    if (clickedElement.dataset.action === 'draw') {
      if (!canPlayerDraw(currentState)) {
        return
      }

      currentState = drawTile(currentState)
      renderApp(container, currentState)
      return
    }

    if (!clickedElement.classList.contains('tile-button') || !canPlayerDiscard(currentState)) {
      return
    }

    const tileToDiscard = findPlayerTileByButton(currentState, clickedElement)

    if (tileToDiscard === null) {
      return
    }

    currentState = resolvePlayerDiscard(currentState, tileToDiscard)
    renderApp(container, currentState)
  }

  container.addEventListener('click', handleClick)

  return () => container.removeEventListener('click', handleClick)
}
