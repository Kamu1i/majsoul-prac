import type { TileCopy } from './deck'
import type { Actor, GameState, ScoreSettlement, Yaku } from './game-state'
import { isBasicWinningHand, isSevenPairsWinningHand } from './rules'
import { createScoreSettlement } from './scoring'

export type WinEvaluationContext = Readonly<{
  method: 'ron' | 'tsumo'
  isRiichi?: boolean
  isHaitei?: boolean
  isHoutei?: boolean
}>

export type WinEvaluation = Readonly<{
  canWin: boolean
  yaku: readonly Yaku[]
}>

function getOpponent(actor: Actor): Actor {
  return actor === 'player' ? 'computer' : 'player'
}

function getActorHand(state: GameState, actor: Actor): TileCopy[] {
  return actor === 'player' ? state.player.hand : state.computer.hand
}

function hasYakuhai(tiles: readonly TileCopy[]): boolean {
  const dragonTileCounts = new Map<string, number>()

  for (const tileCopy of tiles) {
    if (tileCopy.tile.suit !== 'dragon') {
      continue
    }

    dragonTileCounts.set(tileCopy.tile.id, (dragonTileCounts.get(tileCopy.tile.id) ?? 0) + 1)
  }

  for (const count of dragonTileCounts.values()) {
    if (count >= 3) {
      return true
    }
  }

  return false
}

function isTanyao(tiles: readonly TileCopy[]): boolean {
  return tiles.every((tileCopy) => tileCopy.tile.suit === 'souzu' && tileCopy.tile.rank >= 2 && tileCopy.tile.rank <= 8)
}

export function evaluateWinningHand(
  tiles: readonly TileCopy[],
  context: WinEvaluationContext,
): WinEvaluation {
  const tileTypes = tiles.map((tileCopy) => tileCopy.tile)

  if (!isBasicWinningHand(tileTypes)) {
    return {
      canWin: false,
      yaku: [],
    }
  }

  const yaku: Yaku[] = []

  if (context.isRiichi === true) {
    yaku.push('riichi')
  }

  if (context.method === 'tsumo') {
    yaku.push('tsumo')
  }

  if (hasYakuhai(tiles)) {
    yaku.push('yakuhai')
  }

  if (isTanyao(tiles)) {
    yaku.push('tanyao')
  }

  if (isSevenPairsWinningHand(tileTypes)) {
    yaku.push('seven-pairs')
  }

  if (context.isHaitei === true) {
    yaku.push('haitei')
  }

  if (context.isHoutei === true) {
    yaku.push('houtei')
  }

  return {
    canWin: yaku.length > 0,
    yaku,
  }
}

export function canRon(state: GameState, winner: Actor): WinEvaluation {
  const lastDiscard = state.lastDiscard

  if (state.status === 'ended' || lastDiscard === null || lastDiscard.actor === winner) {
    return {
      canWin: false,
      yaku: [],
    }
  }

  return evaluateWinningHand([...getActorHand(state, winner), lastDiscard.tile], {
    method: 'ron',
    isHoutei: state.isHoutei,
  })
}

export function declareRon(state: GameState, winner: Actor): GameState {
  const ronEvaluation = canRon(state, winner)

  if (!ronEvaluation.canWin || state.lastDiscard === null) {
    return state
  }

  const endResult = {
    type: 'win' as const,
    winner,
    loser: state.lastDiscard.actor,
    method: 'ron' as const,
    yaku: ronEvaluation.yaku,
    isHaitei: false,
    isHoutei: state.isHoutei,
  }
  const scoreSettlement: ScoreSettlement = createScoreSettlement(endResult, state)

  return {
    ...state,
    player: {
      ...state.player,
      points: scoreSettlement.after.player,
    },
    computer: {
      ...state.computer,
      points: scoreSettlement.after.computer,
    },
    status: 'ended',
    currentActor: null,
    endResult,
    scoreSettlement,
  }
}

export function resolveComputerRonAfterPlayerDiscard(state: GameState): GameState {
  if (state.lastDiscard?.actor !== 'player') {
    return state
  }

  return declareRon(state, 'computer')
}

export function resolveRonAfterDiscard(state: GameState): GameState {
  const discardActor = state.lastDiscard?.actor

  if (discardActor === undefined) {
    return state
  }

  return declareRon(state, getOpponent(discardActor))
}
