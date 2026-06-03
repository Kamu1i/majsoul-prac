import { describe, expect, it } from 'vitest'
import { createTilePool, type TileCopy } from './deck'
import { discardTile } from './discard'
import { createNewGameState, type Actor, type GameState } from './game-state'
import { discardTileAndSwitchTurn, switchTurnAfterDiscard } from './turn'

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

function getTileCopyKey(tileCopy: TileCopy): string {
  return `${tileCopy.tile.id}:${tileCopy.copyIndex}`
}

function findTileOutsideHand(hand: TileCopy[]): TileCopy {
  const handTileKeys = new Set(hand.map(getTileCopyKey))
  const tileOutsideHand = createTilePool().find((tileCopy) => !handTileKeys.has(getTileCopyKey(tileCopy)))

  if (tileOutsideHand === undefined) {
    throw new Error('测试数据中没有找到手牌外的实体牌')
  }

  return tileOutsideHand
}

describe('discardTileAndSwitchTurn', () => {
  it('switches current actor to computer after a valid player discard', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
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

  it('does not switch current actor after an invalid discard', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const tileToDiscard = findTileOutsideHand(state.player.hand)

    const nextState = discardTileAndSwitchTurn(state, 'player', tileToDiscard)

    expect(nextState).toBe(state)
    expect(nextState.currentActor).toBe('player')
    expect(nextState.status).toBe('player-turn')
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
