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

  it('可以根据初始化状态渲染页面', () => {
    const container = document.createElement('div')

    renderApp(container, initialGameState)

    expect(container.querySelector('h1')?.textContent).toBe('单人 PVE 麻将模拟器')
    expect(container.querySelector('p')?.textContent).toBe('新对局已初始化')
    expect(container.querySelector('.app-shell')?.getAttribute('data-status')).toBe('player-turn')
  })
})
