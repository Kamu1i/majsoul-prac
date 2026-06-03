import { describe, expect, it } from 'vitest'
import { createNewGameState, type Actor, type GameState } from './game-state'
import { drawTile } from './draw'

function fixedRandomSource(): number {
  return 0.42
}

function withCurrentActor(state: GameState, currentActor: Actor): GameState {
  return {
    ...state,
    status: currentActor === 'player' ? 'player-turn' : 'computer-turn',
    currentActor,
  }
}

describe('drawTile', () => {
  it('adds one tile to the player hand and removes one tile from the wall', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const drawnTile = state.wall[0]

    const nextState = drawTile(state)

    expect(nextState.player.hand).toHaveLength(state.player.hand.length + 1)
    expect(nextState.computer.hand).toHaveLength(state.computer.hand.length)
    expect(nextState.wall).toHaveLength(state.wall.length - 1)
    expect(nextState.player.hand[nextState.player.hand.length - 1]).toBe(drawnTile)
  })

  it('adds one tile to the computer hand and removes one tile from the wall', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'computer')
    const drawnTile = state.wall[0]

    const nextState = drawTile(state)

    expect(nextState.computer.hand).toHaveLength(state.computer.hand.length + 1)
    expect(nextState.player.hand).toHaveLength(state.player.hand.length)
    expect(nextState.wall).toHaveLength(state.wall.length - 1)
    expect(nextState.computer.hand[nextState.computer.hand.length - 1]).toBe(drawnTile)
  })

  it('draws the first tile from the wall and removes it from the wall', () => {
    const state = createNewGameState(fixedRandomSource)
    const [firstWallTile, secondWallTile] = state.wall

    const nextState = drawTile(state)

    expect(nextState.player.hand[nextState.player.hand.length - 1]).toBe(firstWallTile)
    expect(nextState.wall[0]).toBe(secondWallTile)
  })

  it('marks haitei when drawing the last wall tile', () => {
    const state = createNewGameState(fixedRandomSource)
    const lastWallTile = state.wall[state.wall.length - 1]
    const stateBeforeLastDraw: GameState = {
      ...state,
      wall: lastWallTile === undefined ? [] : [lastWallTile],
    }

    const nextState = drawTile(stateBeforeLastDraw)

    expect(nextState.player.hand[nextState.player.hand.length - 1]).toBe(lastWallTile)
    expect(nextState.wall).toHaveLength(0)
    expect(nextState.isHaitei).toBe(true)
    expect(nextState.status).toBe('player-turn')
    expect(nextState.endResult).toBeNull()
  })

  it('ends the game as exhaustive draw when drawing from an empty wall', () => {
    const state: GameState = {
      ...createNewGameState(fixedRandomSource),
      wall: [],
    }

    const nextState = drawTile(state)

    expect(nextState.player.hand).toHaveLength(state.player.hand.length)
    expect(nextState.computer.hand).toHaveLength(state.computer.hand.length)
    expect(nextState.wall).toHaveLength(0)
    expect(nextState.status).toBe('ended')
    expect(nextState.currentActor).toBeNull()
    expect(nextState.endResult).toEqual({ type: 'exhaustive-draw' })
  })

  it('keeps both players points unchanged when the game ends as exhaustive draw', () => {
    const state: GameState = {
      ...createNewGameState(fixedRandomSource),
      wall: [],
    }

    const nextState = drawTile(state)

    expect(nextState.player.points).toBe(100000)
    expect(nextState.computer.points).toBe(100000)
  })

  it('does not draw after an exhaustive draw has already ended the game', () => {
    const state: GameState = {
      ...createNewGameState(fixedRandomSource),
      status: 'ended',
      currentActor: null,
      endResult: { type: 'exhaustive-draw' },
      wall: createNewGameState(fixedRandomSource).wall.slice(0, 1),
    }

    const nextState = drawTile(state)

    expect(nextState).toBe(state)
  })
})
