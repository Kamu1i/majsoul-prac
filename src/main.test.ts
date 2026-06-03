import { describe, expect, it } from 'vitest'
import { initialGameState } from './main'
import { renderApp } from './ui/render'

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
})
