import { describe, expect, it } from 'vitest'
import { createTilePool, type TileCopy } from './deck'
import { discardTile } from './discard'
import { createNewGameState, type Actor, type GameState } from './game-state'
import {
  declareChi,
  declareClosedKan,
  declareOpenKan,
  declarePon,
  getChiCandidates,
  getClosedKanCandidates,
  getOpenKanCandidate,
  getPonCandidate,
  resolveComputerMeldAfterPlayerDiscard,
} from './meld'
import { canRon, evaluateWinningHand } from './ron'
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

function withDiscardState(discarder: Actor, discarderHand: TileCopy[], tileToDiscard: TileCopy): GameState {
  const state: GameState = {
    ...createNewGameState(fixedRandomSource),
    status: discarder === 'player' ? 'player-turn' : 'computer-turn',
    currentActor: discarder,
  }
  const stateWithHand = withActorHand(state, discarder, [...discarderHand, tileToDiscard])

  return discardTile(stateWithHand, discarder, tileToDiscard)
}

describe('副露候选判断', () => {
  it('玩家可以用电脑弃牌完成合法吃牌', () => {
    const playerHand = tileCopies(['souzu-2', 'souzu-3', 'dragon-white'])
    const discardTileCopy = tileCopies(['souzu-1'])[0]
    const state = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), discardTileCopy),
      'player',
      playerHand,
    )

    const candidates = getChiCandidates(state, 'player')

    expect(candidates).toHaveLength(1)
    expect(candidates[0].tiles.map((tileCopy) => tileCopy.tile.id)).toEqual(['souzu-1', 'souzu-2', 'souzu-3'])
  })

  it('字牌不能被吃，非连续索子不能被吃', () => {
    const dragonDiscard = tileCopies(['dragon-white'])[0]
    const dragonState = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), dragonDiscard),
      'player',
      tileCopies(['dragon-green', 'dragon-red', 'souzu-1']),
    )
    const nonSequenceDiscard = tileCopies(['souzu-1'])[0]
    const nonSequenceState = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), nonSequenceDiscard),
      'player',
      tileCopies(['souzu-3', 'souzu-5', 'dragon-white']),
    )

    expect(getChiCandidates(dragonState, 'player')).toEqual([])
    expect(getChiCandidates(nonSequenceState, 'player')).toEqual([])
  })

  it('玩家可以用电脑弃牌完成合法碰牌', () => {
    const playerHand = tileCopies(['dragon-white', 'dragon-white', 'souzu-1'])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const state = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), discardTileCopy),
      'player',
      playerHand,
    )

    const candidate = getPonCandidate(state, 'player')

    expect(candidate?.tiles.map((tileCopy) => tileCopy.tile.id)).toEqual(['dragon-white', 'dragon-white', 'dragon-white'])
  })

  it('玩家可以用电脑弃牌完成合法明杠', () => {
    const playerHand = tileCopies(['dragon-white', 'dragon-white', 'dragon-white', 'souzu-1'])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const state = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), discardTileCopy),
      'player',
      playerHand,
    )

    const candidate = getOpenKanCandidate(state, 'player')

    expect(candidate?.type).toBe('open-kan')
    expect(candidate?.tiles.map((tileCopy) => tileCopy.tile.id)).toEqual([
      'dragon-white',
      'dragon-white',
      'dragon-white',
      'dragon-white',
    ])
  })

  it('玩家可以在自己回合完成合法暗杠', () => {
    const playerHand = tileCopies(['dragon-white', 'dragon-white', 'dragon-white', 'dragon-white', 'souzu-1'])
    const state = withActorHand(
      {
        ...createNewGameState(fixedRandomSource),
        status: 'player-turn',
        currentActor: 'player',
      },
      'player',
      playerHand,
    )

    const nextState = declareClosedKan(state, 'player')

    expect(getClosedKanCandidates(state, 'player')).toHaveLength(1)
    expect(nextState.player.hand.map((tileCopy) => tileCopy.tile.id)).toEqual(['souzu-1'])
    expect(nextState.player.melds[0]).toMatchObject({
      type: 'closed-kan',
      calledTile: null,
      from: null,
    })
  })
})

describe('副露操作入口', () => {
  it('副露后对应手牌数量减少、副露列表增加、弃牌来源记录正确', () => {
    const playerHand = tileCopies(['souzu-2', 'souzu-3', 'dragon-white'])
    const discardTileCopy = tileCopies(['souzu-1'])[0]
    const state = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), discardTileCopy),
      'player',
      playerHand,
    )

    const nextState = declareChi(state, 'player')

    expect(nextState.player.hand.map((tileCopy) => tileCopy.tile.id)).toEqual(['dragon-white'])
    expect(nextState.player.melds).toHaveLength(1)
    expect(nextState.player.melds[0]).toMatchObject({
      type: 'chi',
      calledTile: discardTileCopy,
      from: 'computer',
    })
    expect(nextState.computer.discardPile).toHaveLength(state.computer.discardPile.length - 1)
    expect(nextState.currentActor).toBe('player')
  })

  it('电脑满足条件时按明杠、碰、吃的确定性规则自动副露', () => {
    const computerHand = tileCopies(['dragon-white', 'dragon-white', 'dragon-white', 'souzu-2'])
    const discardTileCopy = tileCopies(['dragon-white'])[0]
    const state = withActorHand(
      withDiscardState('player', tileCopies(['souzu-1']), discardTileCopy),
      'computer',
      computerHand,
    )

    const nextState = resolveComputerMeldAfterPlayerDiscard(state)

    expect(nextState.currentActor).toBe('computer')
    expect(nextState.status).toBe('computer-turn')
    expect(nextState.computer.melds[0].type).toBe('open-kan')
    expect(nextState.computer.hand.map((tileCopy) => tileCopy.tile.id)).toEqual(['souzu-2'])
  })

  it('玩家可以声明碰和明杠', () => {
    const ponDiscard = tileCopies(['souzu-5'])[0]
    const ponState = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), ponDiscard),
      'player',
      tileCopies(['souzu-5', 'souzu-5', 'souzu-1']),
    )
    const kanDiscard = tileCopies(['souzu-6'])[0]
    const kanState = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), kanDiscard),
      'player',
      tileCopies(['souzu-6', 'souzu-6', 'souzu-6', 'souzu-1']),
    )

    expect(declarePon(ponState, 'player').player.melds[0].type).toBe('pon')
    expect(declareOpenKan(kanState, 'player').player.melds[0].type).toBe('open-kan')
  })

  it('没有最后弃牌时，吃碰明杠声明不会改变状态', () => {
    const state = withActorHand(createNewGameState(fixedRandomSource), 'player', tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'dragon-white', 'dragon-white', 'dragon-white',
    ]))

    expect(declareChi(state, 'player')).toBe(state)
    expect(declarePon(state, 'player')).toBe(state)
    expect(declareOpenKan(state, 'player')).toBe(state)
  })

  it('不能响应自己打出的牌进行副露', () => {
    const playerDiscard = tileCopies(['souzu-3'])[0]
    const state = withActorHand(
      withDiscardState('player', tileCopies(['souzu-9']), playerDiscard),
      'player',
      tileCopies(['souzu-1', 'souzu-2', 'dragon-white']),
    )

    expect(getChiCandidates(state, 'player')).toEqual([])
    expect(declareChi(state, 'player')).toBe(state)
  })

  it('用弃牌完成副露后会清空最后弃牌响应窗口', () => {
    const playerHand = tileCopies(['souzu-2', 'souzu-3', 'dragon-white'])
    const discardTileCopy = tileCopies(['souzu-1'])[0]
    const state = withActorHand(
      withDiscardState('computer', tileCopies(['dragon-red']), discardTileCopy),
      'player',
      playerHand,
    )

    const nextState = declareChi(state, 'player')

    expect(nextState.lastDiscard).toBeNull()
  })
})

describe('副露后的胡牌判断', () => {
  it('副露后胡牌判断仍要求有效牌形和有役', () => {
    const openMeld = {
      type: 'pon' as const,
      tiles: tileCopies(['dragon-white', 'dragon-white', 'dragon-white']),
      calledTile: tileCopies(['dragon-white'])[0],
      from: 'computer' as const,
    }
    const concealedWinningTiles = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-red', 'dragon-red',
    ])
    const noYakuOpenMeld = {
      type: 'chi' as const,
      tiles: tileCopies(['souzu-1', 'souzu-2', 'souzu-3']),
      calledTile: tileCopies(['souzu-1'])[0],
      from: 'computer' as const,
    }
    const noYakuConcealedTiles = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-white', 'dragon-white',
    ])

    expect(evaluateWinningHand(concealedWinningTiles, { method: 'ron', melds: [openMeld] })).toEqual({
      canWin: true,
      yaku: ['yakuhai'],
    })
    expect(evaluateWinningHand(noYakuConcealedTiles, { method: 'ron', melds: [noYakuOpenMeld] })).toEqual({
      canWin: false,
      yaku: [],
    })
  })

  it('荣和入口会读取副露并判断剩余手牌', () => {
    const playerHand = tileCopies([
      'souzu-1', 'souzu-2', 'souzu-3',
      'souzu-4', 'souzu-5', 'souzu-6',
      'souzu-7', 'souzu-8', 'souzu-9',
      'dragon-red',
    ])
    const discardTileCopy = tileCopies(['dragon-red'])[0]
    const openMeld = {
      type: 'pon' as const,
      tiles: tileCopies(['dragon-white', 'dragon-white', 'dragon-white']),
      calledTile: tileCopies(['dragon-white'])[0],
      from: 'computer' as const,
    }
    const state = withActorHand(
      withDiscardState('computer', tileCopies(['souzu-1']), discardTileCopy),
      'player',
      playerHand,
    )
    const stateWithMeld = {
      ...state,
      player: {
        ...state.player,
        melds: [openMeld],
      },
    }

    expect(canRon(stateWithMeld, 'player')).toEqual({
      canWin: true,
      yaku: ['yakuhai'],
    })
  })
})
