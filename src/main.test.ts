import { describe, expect, it } from 'vitest'
import { createNewGameState, type GameState } from './game/game-state'
import { discardTile } from './game/discard'
import { initialGameState } from './main'
import { bindAppEvents } from './ui/events'
import { renderApp } from './ui/render'

function fixedRandomSource(): number {
  return 0.42
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
    expect(container.textContent).toContain('当前回合：玩家')
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
})
