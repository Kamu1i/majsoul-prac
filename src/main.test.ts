import { describe, expect, it } from 'vitest'
import { appSubtitle, appTitle } from './main'

describe('应用入口占位内容', () => {
  it('提供初始化页面文案', () => {
    expect(appTitle).toBe('单人 PVE 麻将模拟器')
    expect(appSubtitle).toBe('工程初始化完成')
  })
})
