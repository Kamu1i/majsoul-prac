import type { Meld } from './player'
import type { TileCopy } from './deck'
import type { Actor, GameState, ScoreSettlement, Yaku } from './game-state'
import { isSevenPairsWinningHand, isWinningHandWithOpenMelds } from './rules'
import { createScoreSettlement } from './scoring'

export type WinEvaluationContext = Readonly<{
  method: 'ron' | 'tsumo'
  melds?: readonly Meld[]
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

function getActorMelds(state: GameState, actor: Actor): Meld[] {
  return actor === 'player' ? state.player.melds : state.computer.melds
}

function hasYakuhai(tiles: readonly TileCopy[], melds: readonly Meld[] = []): boolean {
  const dragonTileCounts = new Map<string, number>()

  for (const tileCopy of tiles) {
    if (tileCopy.tile.suit !== 'dragon') {
      continue
    }

    dragonTileCounts.set(tileCopy.tile.id, (dragonTileCounts.get(tileCopy.tile.id) ?? 0) + 1)
  }

  for (const meld of melds) {
    if (meld.tiles.length >= 3 && meld.tiles.every((tileCopy) => tileCopy.tile.suit === 'dragon' && tileCopy.tile.id === meld.tiles[0].tile.id)) {
      return true
    }
  }

  for (const count of dragonTileCounts.values()) {
    if (count >= 3) {
      return true
    }
  }

  return false
}

function isTanyao(tiles: readonly TileCopy[], melds: readonly Meld[] = []): boolean {
  const allTiles = [...tiles, ...melds.flatMap((meld) => meld.tiles)]

  return allTiles.every((tileCopy) => tileCopy.tile.suit === 'souzu' && tileCopy.tile.rank >= 2 && tileCopy.tile.rank <= 8)
}

export function evaluateWinningHand(
  tiles: readonly TileCopy[],
  context: WinEvaluationContext,
): WinEvaluation {
  const tileTypes = tiles.map((tileCopy) => tileCopy.tile)
  const melds = context.melds ?? []

  if (!isWinningHandWithOpenMelds(tileTypes, melds.length)) {
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

  if (hasYakuhai(tiles, melds)) {
    yaku.push('yakuhai')
  }

  if (isTanyao(tiles, melds)) {
    yaku.push('tanyao')
  }

  if (melds.length === 0 && isSevenPairsWinningHand(tileTypes)) {
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
    melds: getActorMelds(state, winner),
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
