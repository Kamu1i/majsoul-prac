import { describe, expect, it } from 'vitest'
import { initialGameState } from './main'
import { renderApp } from './ui/render'

describe('应用入口模块化初始化', () => {
  it('提供初始化页面状态', () => {
    expect(initialGameState.title).toBe('单人 PVE 麻将模拟器')
    expect(initialGameState.subtitle).toBe('模块化结构已建立')
    expect(initialGameState.status).toBe('not-started')
  })

  it('通过 UI 渲染模块展示初始化页面', () => {
    const container = document.createElement('div')

    renderApp(container, initialGameState)

    expect(container.querySelector('h1')?.textContent).toBe('单人 PVE 麻将模拟器')
    expect(container.querySelector('p')?.textContent).toBe('模块化结构已建立')
    expect(container.querySelector('main')?.getAttribute('data-status')).toBe('not-started')
  })
})
