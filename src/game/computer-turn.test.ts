import { describe, expect, it } from 'vitest'
import { createTilePool } from './deck'
import { createNewGameState, type GameState } from './game-state'
import { playComputerTurn } from './computer-turn'

function fixedRandomSource(): number {
  return 0.42
}

function asComputerTurn(state: GameState): GameState {
  return {
    ...state,
    status: 'computer-turn',
    currentActor: 'computer',
  }
}

describe('playComputerTurn', () => {
  it('draws before discarding when the computer has a turn and the wall is not empty', () => {
    const wallTile = createTilePool()[0]
    const state: GameState = {
      ...asComputerTurn(createNewGameState(fixedRandomSource)),
      computer: {
        ...createNewGameState(fixedRandomSource).computer,
        hand: [],
      },
      wall: [wallTile],
    }

    const nextState = playComputerTurn(state)

    expect(nextState.computer.hand).toHaveLength(0)
    expect(nextState.computer.discardPile).toEqual([...state.computer.discardPile, wallTile])
    expect(nextState.wall).toHaveLength(0)
    expect(nextState.currentActor).toBe('player')
    expect(nextState.status).toBe('player-turn')
  })

  it('keeps the computer hand at the expected size after drawing and discarding', () => {
    const state = asComputerTurn(createNewGameState(fixedRandomSource))

    const nextState = playComputerTurn(state)

    expect(nextState.computer.hand).toHaveLength(state.computer.hand.length)
    expect(nextState.wall).toHaveLength(state.wall.length - 1)
  })

  it('adds one tile to the computer discard pile', () => {
    const state = asComputerTurn(createNewGameState(fixedRandomSource))

    const nextState = playComputerTurn(state)

    expect(nextState.computer.discardPile).toHaveLength(state.computer.discardPile.length + 1)
    expect(nextState.lastDiscard?.actor).toBe('computer')
  })

  it('switches the current actor back to player after the computer turn ends', () => {
    const state = asComputerTurn(createNewGameState(fixedRandomSource))

    const nextState = playComputerTurn(state)

    expect(nextState.currentActor).toBe('player')
    expect(nextState.status).toBe('player-turn')
  })

  it('ends as exhaustive draw without discarding when the wall is empty', () => {
    const state: GameState = {
      ...asComputerTurn(createNewGameState(fixedRandomSource)),
      wall: [],
    }

    const nextState = playComputerTurn(state)

    expect(nextState.status).toBe('ended')
    expect(nextState.currentActor).toBeNull()
    expect(nextState.endResult).toEqual({ type: 'exhaustive-draw' })
    expect(nextState.computer.discardPile).toHaveLength(state.computer.discardPile.length)
  })

  it('does nothing when it is not the computer turn', () => {
    const state = createNewGameState(fixedRandomSource)

    const nextState = playComputerTurn(state)

    expect(nextState).toBe(state)
  })
})
