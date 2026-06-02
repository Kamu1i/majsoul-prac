export type GameStatus = 'not-started'

export interface GameState {
  readonly status: GameStatus
  readonly title: string
  readonly subtitle: string
}

export function createInitialGameState(): GameState {
  return {
    status: 'not-started',
    title: '单人 PVE 麻将模拟器',
    subtitle: '模块化结构已建立',
  }
}
