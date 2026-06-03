import { describe, expect, it } from 'vitest'
import { createTilePool, type TileCopy } from './deck'
import { discardTile } from './discard'
import { createNewGameState, type Actor, type GameState } from './game-state'
import { canRon, declareRon, evaluateWinningHand, resolveComputerRonAfterPlayerDiscard } from './ron'
import type { Tile } from './tile'

type TileId = Tile["id"]

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

function fixedRandomSource(): number {
  return 0.42
}

function withActorHand(state: GameState, actor: Actor, hand: TileCopy[]): GameState {
  return {
    ...state,
    player: actor === 'player' ? { ...state.player, hand } : state.player,
    computer: actor === 'computer' ? { ...state.computer, hand } : state.computer,
  }
}

function withDiscardState(discarder: Actor, discarderHand: TileCopy[], tileToDiscard: TileCopy): GameState {
  const state: GameState = {
    ...createNewGameState(fixedRandomSource),
    status: discarder === 'player' ? 'player-turn' : 'computer-turn',
    currentActor: discarder,
  }
  const stateWithHand = withActorHand(state, discarder, [...discarderHand, tileToDiscard])

  return discardTile(stateWithHand, discarder, tileToDiscard)
}

describe('基础有役判断', () => {
  it('识别役牌役种', () => {
    const hand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])

    expect(evaluateWinningHand(hand, { method: 'ron' })).toEqual({
      canWin: true,
      yaku: ['yakuhai'],
    })
  })

  it('识别断幺九役种', () => {
    const hand = tileCopies([
      'souzu-2', 'souzu-3', 'souzu-4',
      'souzu-2', 'souzu-3', 'souzu-4',
      'souzu-3', 'souzu-4', 'souzu-5',
      'souzu-6', 'souzu-7', 'souzu-8',
      'souzu-5', 'souzu-5',
    ])

    expect(evaluateWinningHand(hand, { method: 'ron' }).yaku).toContain('tanyao')
  })

  it('识别七对子役种', () => {
    const hand = tileCopies([
      'souzu-1', 'souzu-1',
      'souzu-2', 'souzu-2',
      'souzu-3', 'souzu-3',
      'souzu-4', 'souzu-4',
      'souzu-5', 'souzu-5',
      'souzu-6', 'souzu-6',
      'souzu-7', 'souzu-7',
    ])

    expect(evaluateWinningHand(hand, { method: 'ron' }).yaku).toContain('seven-pairs')
  })
})

describe('荣和入口', () => {
  it('玩家手牌加电脑最后打出的牌同时满足牌形和有役时，玩家可荣和', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const stateAfterDiscard = withActorHand(
      withDiscardState('computer', tileCopies(['souzu-1']), discardTileCopy),
      'player',
      playerHand,
    )

    expect(canRon(stateAfterDiscard, 'player')).toEqual({
      canWin: true,
      yaku: ['yakuhai'],
    })
  })

  it('玩家手牌加电脑最后打出的牌牌形合法但无役时，玩家不可荣和', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white',
    ])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const stateAfterDiscard = withActorHand(
      withDiscardState('computer', tileCopies(['souzu-1']), discardTileCopy),
      'player',
      playerHand,
    )

    expect(canRon(stateAfterDiscard, 'player')).toEqual({
      canWin: false,
      yaku: [],
    })
  })

  it('玩家手牌加电脑最后打出的牌有役但牌形不合法时，玩家不可荣和', () => {
    const playerHand = tileCopies([
      'dragon-white', 'dragon-white',
      'souzu-1', 'souzu-2', 'souzu-4',
      'souzu-1', 'souzu-2', 'souzu-4',
      'souzu-5', 'souzu-7', 'souzu-9',
      'dragon-green', 'dragon-red',
    ])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const stateAfterDiscard = withActorHand(
      withDiscardState('computer', tileCopies(['souzu-1']), discardTileCopy),
      'player',
      playerHand,
    )

    expect(canRon(stateAfterDiscard, 'player')).toEqual({
      canWin: false,
      yaku: [],
    })
  })

  it('电脑手牌加玩家最后打出的牌同时满足牌形和有役时，电脑自动荣和', () => {
    const computerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const stateAfterDiscard = withActorHand(
      withDiscardState('player', tileCopies(['souzu-1']), discardTileCopy),
      'computer',
      computerHand,
    )

    const nextState = resolveComputerRonAfterPlayerDiscard(stateAfterDiscard)

    expect(nextState.status).toBe('ended')
    expect(nextState.currentActor).toBeNull()
    expect(nextState.endResult).toEqual({
      type: 'win',
      winner: 'computer',
      loser: 'player',
      method: 'ron',
      yaku: ['yakuhai'],
      isHaitei: false,
      isHoutei: false,
    })
    expect(nextState.scoreSettlement).toEqual({
      reason: 'ron',
      delta: {
        player: -20000,
        computer: 20000,
      },
      after: {
        player: 80000,
        computer: 120000,
      },
    })
  })

  it('河底最后弃牌可作为役种参与判断', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white',
    ])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const stateAfterDiscard: GameState = {
      ...withActorHand(
        withDiscardState('computer', tileCopies(['souzu-1']), discardTileCopy),
        'player',
        playerHand,
      ),
      isHoutei: true,
    }

    expect(canRon(stateAfterDiscard, 'player')).toEqual({
      canWin: true,
      yaku: ['houtei'],
    })
  })

  it('胡牌后对局进入已结束状态，并记录胡牌者、放铳者、胡牌方式和命中役种', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const stateAfterDiscard = withActorHand(
      withDiscardState('computer', tileCopies(['souzu-1']), discardTileCopy),
      'player',
      playerHand,
    )

    const nextState = declareRon(stateAfterDiscard, 'player')

    expect(nextState.status).toBe('ended')
    expect(nextState.currentActor).toBeNull()
    expect(nextState.endResult).toEqual({
      type: 'win',
      winner: 'player',
      loser: 'computer',
      method: 'ron',
      yaku: ['yakuhai'],
      isHaitei: false,
      isHoutei: false,
    })
    expect(nextState.scoreSettlement).toEqual({
      reason: 'ron',
      delta: {
        player: 20000,
        computer: -20000,
      },
      after: {
        player: 120000,
        computer: 80000,
      },
    })
  })
})
