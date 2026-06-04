import type { TileCopy } from '../game/deck'
import type { GameState } from '../game/game-state'
import { createNewGameState } from '../game/game-state'
import { drawTile } from '../game/draw'
import { playComputerTurn } from '../game/computer-turn'
import {
  declareChi,
  declareClosedKan,
  declareOpenKan,
  declarePon,
  getClosedKanCandidates,
  getOpenKanCandidate,
} from '../game/meld'
import { discardTileAndSwitchTurn } from '../game/turn'
import { declareRon } from '../game/ron'
import { declareTsumo } from '../game/tsumo'
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

function getPlayerEffectiveTileCount(state: GameState): number {
  return state.player.hand.length + state.player.melds.reduce(
    (total, meld) => total + (meld.type === 'open-kan' || meld.type === 'closed-kan' ? 3 : meld.tiles.length),
    0,
  )
}

function canPlayerDiscard(state: GameState): boolean {
  return state.status === 'player-turn' && state.currentActor === 'player' && getPlayerEffectiveTileCount(state) > 13
}

function canPlayerDraw(state: GameState): boolean {
  return state.status === 'player-turn' && state.currentActor === 'player' && getPlayerEffectiveTileCount(state) === 13
}

function resolvePlayerWin(state: GameState): GameState {
  const stateAfterTsumo = declareTsumo(state, 'player')

  if (stateAfterTsumo !== state) {
    return stateAfterTsumo
  }

  return declareRon(state, 'player')
}

function resolvePlayerKan(state: GameState): GameState {
  if (getOpenKanCandidate(state, 'player') !== null) {
    return declareOpenKan(state, 'player')
  }

  if (getClosedKanCandidates(state, 'player').length > 0) {
    return declareClosedKan(state, 'player')
  }

  return state
}

function resolvePlayerMeld(state: GameState, action: string): GameState {
  if (action === 'chi') {
    return declareChi(state, 'player')
  }

  if (action === 'pon') {
    return declarePon(state, 'player')
  }

  if (action === 'kan') {
    return resolvePlayerKan(state)
  }

  return state
}

export function bindAppEvents(container: HTMLElement, initialState: GameState): () => void {
  let currentState = initialState

  const handleClick = (event: MouseEvent): void => {
    const clickedElement = event.target

    if (!(clickedElement instanceof HTMLButtonElement)) {
      return
    }

    if (clickedElement.dataset.action === 'new-game') {
      currentState = createNewGameState()
      renderApp(container, currentState)
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

    if (clickedElement.dataset.action === 'win') {
      const nextState = resolvePlayerWin(currentState)

      if (nextState === currentState) {
        return
      }

      currentState = nextState
      renderApp(container, currentState)
      return
    }

    if (
      clickedElement.dataset.action === 'chi'
      || clickedElement.dataset.action === 'pon'
      || clickedElement.dataset.action === 'kan'
    ) {
      const nextState = resolvePlayerMeld(currentState, clickedElement.dataset.action)

      if (nextState === currentState) {
        return
      }

      currentState = nextState
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
