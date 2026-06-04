import { describe, expect, it } from 'vitest'
import { createTilePool, type TileCopy } from './deck'
import { discardTile } from './discard'
import { createNewGameState, type Actor, type GameState } from './game-state'
import { discardTileAndSwitchTurn, switchTurnAfterDiscard } from './turn'
import type { Tile } from './tile'

type TileId = Tile['id']

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

function tileCopies(tileIds: TileId[]): TileCopy[] {
  const remainingTiles = [...createTilePool()]

  return tileIds.map((tileId) => {
    const tileIndex = remainingTiles.findIndex((tileCopy) => tileCopy.tile.id === tileId)

    if (tileIndex === -1) {
      throw new Error('测试牌池中没有足够的指定牌')
    }

    const tileCopy = remainingTiles[tileIndex]
    remainingTiles.splice(tileIndex, 1)

    return tileCopy
  })
}

function withActorHand(state: GameState, actor: Actor, hand: TileCopy[]): GameState {
  return {
    ...state,
    player: actor === 'player' ? { ...state.player, hand } : state.player,
    computer: actor === 'computer' ? { ...state.computer, hand } : state.computer,
  }
}

describe('discardTileAndSwitchTurn', () => {
  it('switches current actor to computer after a valid player discard', () => {
    const state = {
      ...withCurrentActor(createNewGameState(fixedRandomSource), 'player'),
      computer: {
        ...createNewGameState(fixedRandomSource).computer,
        hand: [],
      },
    }
    const tileToDiscard = state.player.hand[0]

    const nextState = discardTileAndSwitchTurn(state, 'player', tileToDiscard)

    expect(nextState.currentActor).toBe('computer')
    expect(nextState.status).toBe('computer-turn')
    expect(nextState.player.discardPile).toEqual([...state.player.discardPile, tileToDiscard])
  })

  it('switches current actor to player after a valid computer discard', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'computer')
    const tileToDiscard = state.computer.hand[0]

    const nextState = discardTileAndSwitchTurn(state, 'computer', tileToDiscard)

    expect(nextState.currentActor).toBe('player')
    expect(nextState.status).toBe('player-turn')
    expect(nextState.computer.discardPile).toEqual([...state.computer.discardPile, tileToDiscard])
  })

  it('玩家弃牌后电脑自动副露时，会由电脑打出一张牌继续流程', () => {
    const playerDiscard = tileCopies(['dragon-white'])[0]
    const state = withActorHand(
      {
        ...withCurrentActor(createNewGameState(fixedRandomSource), 'player'),
        player: {
          ...createNewGameState(fixedRandomSource).player,
          hand: [playerDiscard],
        },
      },
      'computer',
      tileCopies(['dragon-white', 'dragon-white', 'souzu-2']),
    )

    const nextState = discardTileAndSwitchTurn(state, 'player', playerDiscard)

    expect(nextState.currentActor).toBe('player')
    expect(nextState.status).toBe('player-turn')
    expect(nextState.computer.melds[0].type).toBe('pon')
    expect(nextState.computer.discardPile).toHaveLength(state.computer.discardPile.length + 1)
    expect(nextState.lastDiscard?.actor).toBe('computer')
  })

  it('does not trigger computer response after an invalid player discard', () => {
    const playerHand = tileCopies(['souzu-9'])
    const state = withActorHand(
      {
        ...withCurrentActor(createNewGameState(fixedRandomSource), 'player'),
        player: {
          ...createNewGameState(fixedRandomSource).player,
          hand: playerHand,
        },
      },
      'computer',
      tileCopies([
        'souzu-1', 'souzu-2', 'souzu-3',
        'souzu-4', 'souzu-5', 'souzu-6',
        'souzu-7', 'souzu-8', 'souzu-9',
        'dragon-white', 'dragon-white',
        'dragon-red', 'dragon-red',
      ]),
    )
    const tileToDiscard = tileCopies(['dragon-white'])[0]

    const nextState = discardTileAndSwitchTurn(state, 'player', tileToDiscard)

    expect(nextState).toBe(state)
    expect(nextState.status).toBe('player-turn')
    expect(nextState.computer.melds).toEqual([])
    expect(nextState.endResult).toBeNull()
  })

  it('does not switch current actor when the game has ended', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const endedState: GameState = {
      ...state,
      status: 'ended',
      currentActor: null,
      endResult: { type: 'exhaustive-draw' },
    }
    const tileToDiscard = endedState.player.hand[0]

    const nextState = discardTileAndSwitchTurn(endedState, 'player', tileToDiscard)

    expect(nextState).toBe(endedState)
    expect(nextState.currentActor).toBeNull()
    expect(nextState.status).toBe('ended')
  })
})

describe('switchTurnAfterDiscard', () => {
  it('can switch turn after an already completed valid discard state transition', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const tileToDiscard = state.player.hand[0]
    const stateAfterDiscard = discardTile(state, 'player', tileToDiscard)

    const nextState = switchTurnAfterDiscard(state, stateAfterDiscard)

    expect(nextState.currentActor).toBe('computer')
    expect(nextState.status).toBe('computer-turn')
  })
})
