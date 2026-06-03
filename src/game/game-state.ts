import { createTilePool, shuffleTilePool, type RandomSource, type TileCopy } from './deck'
import { dealInitialHands } from './deal'
import type { PlayerState } from './player'

export type GameStatus = 'not-started' | 'player-turn' | 'computer-turn' | 'ended'

export type Actor = 'player' | 'computer'

export type WinMethod = 'ron' | 'tsumo'

export type GameEndResult = Readonly<{
  type: 'win'
  winner: Actor
  loser: Actor | null
  method: WinMethod
}> | Readonly<{
  type: 'exhaustive-draw'
}>

export type DiscardRecord = Readonly<{
  tile: TileCopy
  actor: Actor
}>

export interface GameState {
  readonly status: GameStatus
  readonly title: string
  readonly subtitle: string
  readonly player: PlayerState
  readonly computer: PlayerState
  readonly wall: TileCopy[]
  readonly currentActor: Actor | null
  readonly lastDiscard: DiscardRecord | null
  readonly endResult: GameEndResult | null
  readonly isHaitei: boolean
  readonly isHoutei: boolean
}

export function createNewGameState(randomSource?: RandomSource): GameState {
  const tilePool = createTilePool()
  const tileWall = shuffleTilePool(tilePool, randomSource)
  const initialDeal = dealInitialHands(tileWall)

  return {
    status: 'player-turn',
    title: '单人 PVE 麻将模拟器',
    subtitle: '新对局已初始化',
    player: initialDeal.player,
    computer: initialDeal.computer,
    wall: initialDeal.wall,
    currentActor: 'player',
    lastDiscard: null,
    endResult: null,
    isHaitei: false,
    isHoutei: false,
  }
}

export function createInitialGameState(): GameState {
  return createNewGameState()
}
