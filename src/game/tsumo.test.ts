import { describe, expect, it } from 'vitest'
import { createTilePool, type TileCopy } from './deck'
import { drawTile } from './draw'
import { createNewGameState, type Actor, type GameState } from './game-state'
import { playComputerTurn } from './computer-turn'
import { canTsumo, declareTsumo } from './tsumo'
import type { Tile } from './tile'

type TileId = Tile['id']

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

function asActorTurn(state: GameState, actor: Actor): GameState {
  return {
    ...state,
    status: actor === 'player' ? 'player-turn' : 'computer-turn',
    currentActor: actor,
  }
}

describe('自摸入口', () => {
  it('玩家摸牌后同时满足牌形和有役时，状态显示玩家可自摸', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const drawnTile = tileCopies(['dragon-white'])[0]
    const stateBeforeDraw = withActorHand(
      {
        ...asActorTurn(createNewGameState(fixedRandomSource), 'player'),
        wall: [drawnTile],
      },
      'player',
      playerHand,
    )

    const stateAfterDraw = drawTile(stateBeforeDraw)

    expect(canTsumo(stateAfterDraw, 'player')).toEqual({
      canWin: true,
      yaku: ['tsumo', 'yakuhai', 'haitei'],
    })
  })

  it('玩家摸牌后牌形合法但无其他役时，自摸役允许胡牌', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white',
    ])
    const drawnTile = tileCopies(['dragon-white'])[0]
    const stateAfterDraw = drawTile(withActorHand(
      {
        ...asActorTurn(createNewGameState(fixedRandomSource), 'player'),
        wall: [drawnTile, ...tileCopies(['dragon-green'])],
      },
      'player',
      playerHand,
    ))

    expect(canTsumo(stateAfterDraw, 'player')).toEqual({
      canWin: true,
      yaku: ['tsumo'],
    })
  })

  it('玩家选择自摸后对局结束', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const state = withActorHand(asActorTurn(createNewGameState(fixedRandomSource), 'player'), 'player', playerHand)

    const nextState = declareTsumo(state, 'player')

    expect(nextState.status).toBe('ended')
    expect(nextState.currentActor).toBeNull()
  })

  it('电脑摸牌后同时满足牌形和有役时，电脑自动胡牌并结束对局', () => {
    const computerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const drawnTile = tileCopies(['dragon-white'])[0]
    const state = withActorHand(
      {
        ...asActorTurn(createNewGameState(fixedRandomSource), 'computer'),
        wall: [drawnTile, ...tileCopies(['dragon-green'])],
      },
      'computer',
      computerHand,
    )

    const nextState = playComputerTurn(state)

    expect(nextState.status).toBe('ended')
    expect(nextState.currentActor).toBeNull()
    expect(nextState.endResult).toEqual({
      type: 'win',
      winner: 'computer',
      loser: null,
      method: 'tsumo',
      yaku: ['tsumo', 'yakuhai'],
      isHaitei: false,
      isHoutei: false,
    })
    expect(nextState.scoreSettlement).toEqual({
      reason: 'tsumo',
      delta: {
        player: -15000,
        computer: 15000,
      },
      after: {
        player: 85000,
        computer: 115000,
      },
    })
  })

  it('海底摸月可作为役种参与判断', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white',
    ])
    const drawnTile = tileCopies(['dragon-white'])[0]
    const stateAfterDraw = drawTile(withActorHand(
      {
        ...asActorTurn(createNewGameState(fixedRandomSource), 'player'),
        wall: [drawnTile],
      },
      'player',
      playerHand,
    ))

    expect(canTsumo(stateAfterDraw, 'player').yaku).toEqual(['tsumo', 'haitei'])
  })

  it('自摸结束后牌河不会新增打出的牌', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const state = withActorHand(asActorTurn(createNewGameState(fixedRandomSource), 'player'), 'player', playerHand)

    const nextState = declareTsumo(state, 'player')

    expect(nextState.player.discardPile).toHaveLength(state.player.discardPile.length)
    expect(nextState.computer.discardPile).toHaveLength(state.computer.discardPile.length)
    expect(nextState.lastDiscard).toBe(state.lastDiscard)
  })

  it('自摸胡牌者、胡牌方式和命中役种记录正确，放铳者为空', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white', 'dragon-white',
      'dragon-red', 'dragon-red',
    ])
    const state = withActorHand(asActorTurn(createNewGameState(fixedRandomSource), 'player'), 'player', playerHand)

    const nextState = declareTsumo(state, 'player')

    expect(nextState.endResult).toEqual({
      type: 'win',
      winner: 'player',
      loser: null,
      method: 'tsumo',
      yaku: ['tsumo', 'yakuhai'],
      isHaitei: false,
      isHoutei: false,
    })
    expect(nextState.scoreSettlement).toEqual({
      reason: 'tsumo',
      delta: {
        player: 15000,
        computer: -15000,
      },
      after: {
        player: 115000,
        computer: 85000,
      },
    })
  })
})
