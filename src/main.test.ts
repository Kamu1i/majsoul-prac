import { describe, expect, it } from 'vitest'
import { createTilePool, type TileCopy } from './game/deck'
import { discardTile } from './game/discard'
import { createNewGameState, type Actor, type GameState } from './game/game-state'
import { initialGameState } from './main'
import type { Tile } from './game/tile'
import { bindAppEvents } from './ui/events'
import { renderApp } from './ui/render'

function fixedRandomSource(): number {
  return 0.42
}

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

function withActorHand(state: GameState, actor: Actor, hand: TileCopy[]): GameState {
  return {
    ...state,
    player: actor === 'player' ? { ...state.player, hand } : state.player,
    computer: actor === 'computer' ? { ...state.computer, hand } : state.computer,
  }
}

function withComputerDiscard(playerHand: TileCopy[], tileToDiscard: TileCopy): GameState {
  const state: GameState = {
    ...createNewGameState(fixedRandomSource),
    status: 'computer-turn',
    currentActor: 'computer',
  }
  const stateAfterDiscard = discardTile(
    withActorHand(state, 'computer', [tileToDiscard, ...tileCopies(['souzu-1'])]),
    'computer',
    tileToDiscard,
  )

  return withActorHand(
    {
      ...stateAfterDiscard,
      status: 'player-turn',
      currentActor: 'player',
    },
    'player',
    playerHand,
  )
}

describe('应用入口', () => {
  it('导出初始化后的对局状态', () => {
    expect(initialGameState.status).toBe('player-turn')
    expect(initialGameState.currentActor).toBe('player')
    expect(initialGameState.player.hand).toHaveLength(13)
    expect(initialGameState.computer.hand).toHaveLength(13)
    expect(initialGameState.wall).toHaveLength(22)
  })

  it('可以根据初始化状态渲染基础页面布局', () => {
    const container = document.createElement('div')

    renderApp(container, initialGameState)

    expect(container.querySelector('h1')?.textContent).toBe('单人 PVE 麻将模拟器')
    expect(container.querySelector('.app-shell')?.getAttribute('data-status')).toBe('player-turn')
    expect(container.textContent).toContain('玩家点数')
    expect(container.textContent).toContain('电脑点数')
    expect(container.textContent).toContain('100000')
    expect(container.textContent).toContain('剩余牌山')
    expect(container.textContent).toContain('22 张')
    expect(container.textContent).toContain('当前回合：玩家')
    expect(container.textContent).toContain('听牌提示')
    expect(container.textContent).toContain('可胡提示')
    expect(container.querySelector('[aria-label="操作按钮区域"]')).not.toBeNull()
    expect(container.textContent).toContain('电脑牌河')
    expect(container.textContent).toContain('玩家牌河')
  })

  it('基础页面不会暴露电脑具体手牌牌面', () => {
    const container = document.createElement('div')

    renderApp(container, initialGameState)

    const computerHandText = container.querySelector('.hidden-hand')?.textContent ?? ''

    expect(computerHandText).toContain('牌背')
    expect(computerHandText).not.toContain('索')
    expect(computerHandText).not.toContain('白')
    expect(computerHandText).not.toContain('发')
    expect(computerHandText).not.toContain('中')
  })

  it('初始化后页面显示玩家 13 张可点击手牌', () => {
    const container = document.createElement('div')

    renderApp(container, initialGameState)

    const playerTileButtons = container.querySelectorAll('[aria-label="玩家手牌"] button.tile-button')

    expect(playerTileButtons).toHaveLength(13)
    expect(playerTileButtons[0].getAttribute('data-tile-id')).toBe(initialGameState.player.hand[0].tile.id)
    expect(playerTileButtons[0].getAttribute('data-copy-index')).toBe(String(initialGameState.player.hand[0].copyIndex))
  })

  it('状态变化后重绘会刷新玩家手牌与玩家牌河', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const tileToDiscard = state.player.hand[0]
    const nextState = discardTile(state, 'player', tileToDiscard)

    renderApp(container, nextState)

    expect(container.querySelectorAll('[aria-label="玩家手牌"] button.tile-button')).toHaveLength(12)
    expect(container.querySelector('[aria-label="玩家牌河"]')?.textContent).toBe(tileToDiscard.tile.label)
  })

  it('按状态顺序渲染电脑牌河', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const computerDiscards = [state.computer.hand[0], state.computer.hand[1]]
    const stateWithComputerDiscards: GameState = {
      ...state,
      computer: {
        ...state.computer,
        discardPile: computerDiscards,
      },
    }

    renderApp(container, stateWithComputerDiscards)

    expect(container.querySelector('[aria-label="电脑牌河"]')?.textContent).toBe(
      computerDiscards.map((tile) => tile.tile.label).join(''),
    )
  })

  it('多次渲染同一状态不会导致牌重复显示', () => {
    const container = document.createElement('div')

    renderApp(container, initialGameState)
    renderApp(container, initialGameState)

    expect(container.querySelectorAll('[aria-label="玩家手牌"] button.tile-button')).toHaveLength(13)
    expect(container.querySelectorAll('.hidden-hand .tile-back')).toHaveLength(13)
  })

  it('玩家回合点击摸牌后，玩家手牌增加 1 张并减少牌山', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)

    renderApp(container, state)
    const unbindEvents = bindAppEvents(container, state)
    container.querySelector<HTMLButtonElement>('[data-action="draw"]')?.click()

    expect(container.querySelectorAll('[aria-label="玩家手牌"] button.tile-button')).toHaveLength(14)
    expect(container.textContent).toContain('21 张')
    unbindEvents()
  })

  it('玩家回合提示区分摸牌和打牌阶段', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const stateAfterPlayerDraw: GameState = {
      ...state,
      player: {
        ...state.player,
        hand: [...state.player.hand, state.wall[0]],
      },
      wall: state.wall.slice(1),
    }

    renderApp(container, state)
    expect(container.textContent).toContain('当前回合：玩家，请摸牌。')

    renderApp(container, stateAfterPlayerDraw)
    expect(container.textContent).toContain('当前回合：玩家，请打出一张牌。')
  })

  it('玩家摸牌前点击手牌不会改变状态', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)

    renderApp(container, state)
    const initialText = container.textContent
    const unbindEvents = bindAppEvents(container, state)
    container.querySelector<HTMLButtonElement>('[aria-label="玩家手牌"] button.tile-button')?.click()

    expect(container.textContent).toBe(initialText)
    unbindEvents()
  })

  it('玩家摸牌后点击手牌，该牌进入玩家牌河并触发电脑基础回合', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const tileToDiscard = state.player.hand[0]
    const stateWithoutComputerResponse: GameState = {
      ...state,
      computer: {
        ...state.computer,
        hand: [],
      },
    }

    renderApp(container, stateWithoutComputerResponse)
    const unbindEvents = bindAppEvents(container, stateWithoutComputerResponse)
    container.querySelector<HTMLButtonElement>('[data-action="draw"]')?.click()
    container.querySelector<HTMLButtonElement>('[aria-label="玩家手牌"] button.tile-button')?.click()

    expect(container.querySelector('[aria-label="玩家牌河"]')?.textContent).toContain(tileToDiscard.tile.label)
    expect(container.querySelector('[aria-label="电脑牌河"]')?.textContent).not.toBe('暂无弃牌')
    expect(container.textContent).toContain('电脑已自动行动，当前回合：玩家，请摸牌。')
    unbindEvents()
  })

  it('电脑回合期间玩家点击手牌不会改变状态', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const computerTurnState: GameState = {
      ...state,
      status: 'computer-turn',
      currentActor: 'computer',
    }

    renderApp(container, computerTurnState)
    const initialText = container.textContent
    const unbindEvents = bindAppEvents(container, computerTurnState)
    container.querySelector<HTMLButtonElement>('[aria-label="玩家手牌"] button.tile-button')?.click()

    expect(container.textContent).toBe(initialText)
    unbindEvents()
  })

  it('对局结束后玩家点击手牌不会改变状态', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const endedState: GameState = {
      ...state,
      status: 'ended',
      currentActor: null,
      endResult: { type: 'exhaustive-draw' },
    }

    renderApp(container, endedState)
    const initialText = container.textContent
    const unbindEvents = bindAppEvents(container, endedState)
    container.querySelector<HTMLButtonElement>('[aria-label="玩家手牌"] button.tile-button')?.click()

    expect(container.textContent).toBe(initialText)
    unbindEvents()
  })

  it('构造玩家听牌状态时，页面显示听牌提示和待牌', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const readyState: GameState = {
      ...state,
      player: {
        ...state.player,
        hand: tileCopies([
          'souzu-1', 'souzu-2', 'souzu-3',
          'souzu-4', 'souzu-5', 'souzu-6',
          'souzu-7', 'souzu-8', 'souzu-9',
          'dragon-white', 'dragon-white',
          'dragon-red', 'dragon-red',
        ]),
      },
    }

    renderApp(container, readyState)

    expect(container.textContent).toContain('玩家听牌，待牌：白')
  })

  it('构造玩家可自摸状态时，页面显示胡牌按钮和命中役提示', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const tsumoState: GameState = {
      ...state,
      player: {
        ...state.player,
        hand: tileCopies([
          'souzu-1', 'souzu-2', 'souzu-3',
          'souzu-4', 'souzu-5', 'souzu-6',
          'souzu-7', 'souzu-8', 'souzu-9',
          'dragon-white', 'dragon-white', 'dragon-white',
          'dragon-red', 'dragon-red',
        ]),
      },
    }

    renderApp(container, tsumoState)

    const winButton = container.querySelector<HTMLButtonElement>('[data-action="win"]')

    expect(winButton?.disabled).toBe(false)
    expect(container.textContent).toContain('玩家可自摸，役种：自摸、役牌')
  })

  it('构造玩家可荣和状态时，页面显示胡牌按钮和命中役提示', () => {
    const container = document.createElement('div')
    const state = withComputerDiscard(
      tileCopies([
        'souzu-1', 'souzu-2', 'souzu-3',
        'souzu-4', 'souzu-5', 'souzu-6',
        'souzu-7', 'souzu-8', 'souzu-9',
        'dragon-white', 'dragon-white',
        'dragon-red', 'dragon-red',
      ]),
      tileCopies(['dragon-white'])[0],
    )

    renderApp(container, state)

    const winButton = container.querySelector<HTMLButtonElement>('[data-action="win"]')

    expect(winButton?.disabled).toBe(false)
    expect(container.textContent).toContain('玩家可荣和，役种：役牌')
  })

  it('构造玩家不可胡状态时，页面不允许胡牌', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)

    renderApp(container, state)

    expect(container.querySelector<HTMLButtonElement>('[data-action="win"]')?.disabled).toBe(true)
    expect(container.textContent).toContain('玩家当前不可胡')
  })

  it('点击自摸胡牌后对局结束并更新双方点数', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const tsumoState: GameState = {
      ...state,
      player: {
        ...state.player,
        hand: tileCopies([
          'souzu-1', 'souzu-2', 'souzu-3',
          'souzu-4', 'souzu-5', 'souzu-6',
          'souzu-7', 'souzu-8', 'souzu-9',
          'dragon-white', 'dragon-white', 'dragon-white',
          'dragon-red', 'dragon-red',
        ]),
      },
    }

    renderApp(container, tsumoState)
    const unbindEvents = bindAppEvents(container, tsumoState)
    container.querySelector<HTMLButtonElement>('[data-action="win"]')?.click()

    expect(container.querySelector('.app-shell')?.getAttribute('data-status')).toBe('ended')
    expect(container.textContent).toContain('玩家自摸，役种：自摸、役牌')
    expect(container.textContent).toContain('玩家：+15000，结算后 115000 点')
    expect(container.textContent).toContain('电脑：-15000，结算后 85000 点')
    unbindEvents()
  })

  it('点击荣和胡牌后对局结束并更新双方点数', () => {
    const container = document.createElement('div')
    const state = withComputerDiscard(
      tileCopies([
        'souzu-1', 'souzu-2', 'souzu-3',
        'souzu-4', 'souzu-5', 'souzu-6',
        'souzu-7', 'souzu-8', 'souzu-9',
        'dragon-white', 'dragon-white',
        'dragon-red', 'dragon-red',
      ]),
      tileCopies(['dragon-white'])[0],
    )

    renderApp(container, state)
    const unbindEvents = bindAppEvents(container, state)
    container.querySelector<HTMLButtonElement>('[data-action="win"]')?.click()

    expect(container.querySelector('.app-shell')?.getAttribute('data-status')).toBe('ended')
    expect(container.textContent).toContain('玩家荣和，役种：役牌')
    expect(container.textContent).toContain('玩家：+20000，结算后 120000 点')
    expect(container.textContent).toContain('电脑：-20000，结算后 80000 点')
    unbindEvents()
  })

  it('对局结束后摸牌、打牌、胡牌按钮不再允许改变状态', () => {
    const container = document.createElement('div')
    const state: GameState = {
      ...createNewGameState(fixedRandomSource),
      status: 'ended',
      currentActor: null,
      endResult: { type: 'exhaustive-draw' },
    }

    renderApp(container, state)
    const initialText = container.textContent
    const unbindEvents = bindAppEvents(container, state)
    container.querySelector<HTMLButtonElement>('[data-action="draw"]')?.click()
    container.querySelector<HTMLButtonElement>('[aria-label="玩家手牌"] button.tile-button')?.click()
    container.querySelector<HTMLButtonElement>('[data-action="win"]')?.click()

    expect(container.textContent).toBe(initialText)
    expect(container.querySelector<HTMLButtonElement>('[data-action="win"]')?.disabled).toBe(true)
    unbindEvents()
  })

  it('对局进行中点击新对局后重置手牌、牌河、点数和牌山', () => {
    const container = document.createElement('div')
    const state = createNewGameState(fixedRandomSource)
    const stateInProgress: GameState = {
      ...state,
      player: {
        ...state.player,
        hand: state.player.hand.slice(0, 14),
        discardPile: [state.player.hand[0]],
        points: 115000,
      },
      computer: {
        ...state.computer,
        discardPile: [state.computer.hand[0]],
        points: 85000,
      },
      wall: state.wall.slice(1),
    }

    renderApp(container, stateInProgress)
    const unbindEvents = bindAppEvents(container, stateInProgress)
    container.querySelector<HTMLButtonElement>('[data-action="new-game"]')?.click()

    const scoreValues = Array.from(container.querySelectorAll('.score-card strong')).map((element) => element.textContent)

    expect(container.querySelector('.app-shell')?.getAttribute('data-status')).toBe('player-turn')
    expect(container.querySelectorAll('[aria-label="玩家手牌"] button.tile-button')).toHaveLength(13)
    expect(container.querySelector('[aria-label="玩家牌河"]')?.textContent).toBe('暂无弃牌')
    expect(container.querySelector('[aria-label="电脑牌河"]')?.textContent).toBe('暂无弃牌')
    expect(scoreValues).toEqual(['100000', '100000'])
    expect(container.textContent).toContain('22 张')
    unbindEvents()
  })

  it('对局结束后点击新对局可重新开始', () => {
    const container = document.createElement('div')
    const state: GameState = {
      ...createNewGameState(fixedRandomSource),
      status: 'ended',
      currentActor: null,
      endResult: { type: 'exhaustive-draw' },
      player: {
        ...createNewGameState(fixedRandomSource).player,
        discardPile: tileCopies(['souzu-1']),
        points: 120000,
      },
      computer: {
        ...createNewGameState(fixedRandomSource).computer,
        discardPile: tileCopies(['souzu-2']),
        points: 80000,
      },
      scoreSettlement: {
        reason: 'ron',
        delta: { player: 20000, computer: -20000 },
        after: { player: 120000, computer: 80000 },
      },
    }

    renderApp(container, state)
    const unbindEvents = bindAppEvents(container, state)
    container.querySelector<HTMLButtonElement>('[data-action="new-game"]')?.click()

    const scoreValues = Array.from(container.querySelectorAll('.score-card strong')).map((element) => element.textContent)

    expect(container.querySelector('.app-shell')?.getAttribute('data-status')).toBe('player-turn')
    expect(container.textContent).toContain('当前回合：玩家，请摸牌。')
    expect(container.textContent).not.toContain('牌山摸完，本局流局。')
    expect(container.textContent).not.toContain('点数变化')
    expect(container.querySelectorAll('[aria-label="玩家手牌"] button.tile-button')).toHaveLength(13)
    expect(container.querySelector('[aria-label="玩家牌河"]')?.textContent).toBe('暂无弃牌')
    expect(container.querySelector('[aria-label="电脑牌河"]')?.textContent).toBe('暂无弃牌')
    expect(scoreValues).toEqual(['100000', '100000'])
    expect(container.textContent).toContain('22 张')
    unbindEvents()
  })
})
