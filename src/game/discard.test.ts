import { describe, expect, it } from 'vitest'
import { createTilePool, type TileCopy } from './deck'
import { discardTile } from './discard'
import { createNewGameState, type Actor, type GameState } from './game-state'

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

describe('discardTile', () => {
  it('removes a tile from the player hand and adds it to the player discard pile', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const tileToDiscard = state.player.hand[0]

    const nextState = discardTile(state, 'player', tileToDiscard)

    expect(nextState.player.hand).toHaveLength(state.player.hand.length - 1)
    expect(nextState.player.hand).not.toContain(tileToDiscard)
    expect(nextState.player.discardPile).toEqual([...state.player.discardPile, tileToDiscard])
    expect(nextState.computer.hand).toHaveLength(state.computer.hand.length)
    expect(nextState.computer.discardPile).toEqual(state.computer.discardPile)
  })

  it('removes a tile from the computer hand and adds it to the computer discard pile', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'computer')
    const tileToDiscard = state.computer.hand[0]

    const nextState = discardTile(state, 'computer', tileToDiscard)

    expect(nextState.computer.hand).toHaveLength(state.computer.hand.length - 1)
    expect(nextState.computer.hand).not.toContain(tileToDiscard)
    expect(nextState.computer.discardPile).toEqual([...state.computer.discardPile, tileToDiscard])
    expect(nextState.player.hand).toHaveLength(state.player.hand.length)
    expect(nextState.player.discardPile).toEqual(state.player.discardPile)
  })

  it('records the last discarded tile and actor', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const tileToDiscard = state.player.hand[0]

    const nextState = discardTile(state, 'player', tileToDiscard)

    expect(nextState.lastDiscard).toEqual({
      tile: tileToDiscard,
      actor: 'player',
    })
  })

  it('marks houtei when discarding after a haitei draw', () => {
    const state: GameState = {
      ...withCurrentActor(createNewGameState(fixedRandomSource), 'player'),
      isHaitei: true,
    }
    const tileToDiscard = state.player.hand[0]

    const nextState = discardTile(state, 'player', tileToDiscard)

    expect(nextState.isHoutei).toBe(true)
  })

  it('does not change state when discarding a tile that is not in hand', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const tileToDiscard = findTileOutsideHand(state.player.hand)

    const nextState = discardTile(state, 'player', tileToDiscard)

    expect(nextState).toBe(state)
  })

  it('does not change state when a non-current actor discards', () => {
    const state = withCurrentActor(createNewGameState(fixedRandomSource), 'player')
    const tileToDiscard = state.computer.hand[0]

    const nextState = discardTile(state, 'computer', tileToDiscard)

    expect(nextState).toBe(state)
  })
})
