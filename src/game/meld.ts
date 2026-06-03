import type { TileCopy } from './deck'
import type { Actor, GameState } from './game-state'
import type { Meld, MeldType, PlayerState } from './player'
import { compareTiles, getTileById, type SouzuRank, type Tile } from './tile'

export type MeldCandidate = Readonly<{
  type: MeldType
  tiles: readonly TileCopy[]
  calledTile: TileCopy | null
  from: Actor | null
}>

function getOpponent(actor: Actor): Actor {
  return actor === 'player' ? 'computer' : 'player'
}

function getActorState(state: GameState, actor: Actor): PlayerState {
  return actor === 'player' ? state.player : state.computer
}

function isSameTileCopy(firstTile: TileCopy, secondTile: TileCopy): boolean {
  return firstTile.tile.id === secondTile.tile.id && firstTile.copyIndex === secondTile.copyIndex
}

function removeTileCopies(hand: readonly TileCopy[], tilesToRemove: readonly TileCopy[]): TileCopy[] | null {
  const nextHand = [...hand]

  for (const tileToRemove of tilesToRemove) {
    const tileIndex = nextHand.findIndex((tileCopy) => isSameTileCopy(tileCopy, tileToRemove))

    if (tileIndex === -1) {
      return null
    }

    nextHand.splice(tileIndex, 1)
  }

  return nextHand
}

function sortTileCopies(tiles: readonly TileCopy[]): TileCopy[] {
  return [...tiles].sort((left, right) => {
    const tileComparison = compareTiles(left.tile, right.tile)

    if (tileComparison !== 0) {
      return tileComparison
    }

    return left.copyIndex - right.copyIndex
  })
}

function getMatchingTileCopies(hand: readonly TileCopy[], tile: Tile): TileCopy[] {
  return sortTileCopies(hand.filter((tileCopy) => tileCopy.tile.id === tile.id))
}

function createMeld(
  type: MeldType,
  handTiles: readonly TileCopy[],
  calledTile: TileCopy | null,
  from: Actor | null,
): Meld {
  return {
    type,
    tiles: sortTileCopies(calledTile === null ? handTiles : [...handTiles, calledTile]),
    calledTile,
    from,
  }
}

function getChiSequenceIdGroups(tile: Tile): Tile['id'][][] {
  if (tile.suit !== 'souzu') {
    return []
  }

  const startRanks = [tile.rank - 2, tile.rank - 1, tile.rank]
    .filter((rank): rank is SouzuRank => rank >= 1 && rank <= 7)

  return startRanks.map((startRank) => [
    getTileById(`souzu-${startRank}`).id,
    getTileById(`souzu-${startRank + 1 as SouzuRank}`).id,
    getTileById(`souzu-${startRank + 2 as SouzuRank}`).id,
  ])
}

function createChiCandidates(hand: readonly TileCopy[], calledTile: TileCopy, from: Actor): MeldCandidate[] {
  const sequenceIdGroups = getChiSequenceIdGroups(calledTile.tile)
  const candidates: MeldCandidate[] = []

  for (const sequenceIds of sequenceIdGroups) {
    const selectedHandTiles: TileCopy[] = []

    for (const tileId of sequenceIds) {
      if (tileId === calledTile.tile.id) {
        continue
      }

      const tileCopy = sortTileCopies(hand.filter((candidate) => candidate.tile.id === tileId))[0]

      if (tileCopy === undefined) {
        selectedHandTiles.length = 0
        break
      }

      selectedHandTiles.push(tileCopy)
    }

    if (selectedHandTiles.length === 2) {
      candidates.push({
        ...createMeld('chi', selectedHandTiles, calledTile, from),
      })
    }
  }

  return candidates
}

function createSameTileCalledCandidate(
  type: 'pon' | 'open-kan',
  hand: readonly TileCopy[],
  calledTile: TileCopy,
  from: Actor,
): MeldCandidate | null {
  const requiredHandTileCount = type === 'pon' ? 2 : 3
  const matchingTiles = getMatchingTileCopies(hand, calledTile.tile)

  if (matchingTiles.length < requiredHandTileCount) {
    return null
  }

  return createMeld(type, matchingTiles.slice(0, requiredHandTileCount), calledTile, from)
}

export function getChiCandidates(state: GameState, actor: Actor): MeldCandidate[] {
  const lastDiscard = state.lastDiscard

  if (state.status === 'ended' || lastDiscard === null || lastDiscard.actor === actor) {
    return []
  }

  return createChiCandidates(getActorState(state, actor).hand, lastDiscard.tile, lastDiscard.actor)
}

export function getPonCandidate(state: GameState, actor: Actor): MeldCandidate | null {
  const lastDiscard = state.lastDiscard

  if (state.status === 'ended' || lastDiscard === null || lastDiscard.actor === actor) {
    return null
  }

  return createSameTileCalledCandidate('pon', getActorState(state, actor).hand, lastDiscard.tile, lastDiscard.actor)
}

export function getOpenKanCandidate(state: GameState, actor: Actor): MeldCandidate | null {
  const lastDiscard = state.lastDiscard

  if (state.status === 'ended' || lastDiscard === null || lastDiscard.actor === actor) {
    return null
  }

  return createSameTileCalledCandidate('open-kan', getActorState(state, actor).hand, lastDiscard.tile, lastDiscard.actor)
}

export function getClosedKanCandidates(state: GameState, actor: Actor): MeldCandidate[] {
  if (state.status === 'ended' || state.currentActor !== actor) {
    return []
  }

  const actorState = getActorState(state, actor)
  const tileCounts = new Map<Tile['id'], TileCopy[]>()

  for (const tileCopy of actorState.hand) {
    tileCounts.set(tileCopy.tile.id, [...(tileCounts.get(tileCopy.tile.id) ?? []), tileCopy])
  }

  return [...tileCounts.values()]
    .filter((tileCopies) => tileCopies.length === 4)
    .map((tileCopies) => createMeld('closed-kan', tileCopies, null, null))
}

function getHandTilesForCalledMeld(hand: readonly TileCopy[], meld: MeldCandidate): TileCopy[] {
  if (meld.calledTile === null) {
    return [...meld.tiles]
  }

  const selectedTiles: TileCopy[] = []
  let skippedCalledTile = false

  for (const meldTile of meld.tiles) {
    if (!skippedCalledTile && meldTile.tile.id === meld.calledTile.tile.id) {
      skippedCalledTile = true
      continue
    }

    const handTile = sortTileCopies(hand.filter((tileCopy) => tileCopy.tile.id === meldTile.tile.id && !selectedTiles.includes(tileCopy)))[0]

    if (handTile !== undefined) {
      selectedTiles.push(handTile)
    }
  }

  return selectedTiles
}

function applyMeld(state: GameState, actor: Actor, meld: MeldCandidate): GameState {
  const actorState = getActorState(state, actor)
  const handTilesToRemove = getHandTilesForCalledMeld(actorState.hand, meld)
  const handAfterMeld = removeTileCopies(actorState.hand, handTilesToRemove)

  if (handAfterMeld === null) {
    return state
  }

  const actorStateAfterMeld: PlayerState = {
    ...actorState,
    hand: sortTileCopies(handAfterMeld),
    melds: [...actorState.melds, meld],
  }
  const calledTileOwner = meld.from === null ? null : getActorState(state, meld.from)
  const calledTileOwnerAfterMeld = meld.calledTile === null || calledTileOwner === null
    ? calledTileOwner
    : {
        ...calledTileOwner,
        discardPile: removeTileCopies(calledTileOwner.discardPile, [meld.calledTile]) ?? calledTileOwner.discardPile,
      }
  const player = actor === 'player'
    ? actorStateAfterMeld
    : meld.from === 'player' && calledTileOwnerAfterMeld !== null
      ? calledTileOwnerAfterMeld
      : state.player
  const computer = actor === 'computer'
    ? actorStateAfterMeld
    : meld.from === 'computer' && calledTileOwnerAfterMeld !== null
      ? calledTileOwnerAfterMeld
      : state.computer

  return {
    ...state,
    player,
    computer,
    currentActor: actor,
    status: actor === 'player' ? 'player-turn' : 'computer-turn',
    lastDiscard: meld.calledTile === null ? state.lastDiscard : null,
    isHoutei: meld.calledTile === null ? state.isHoutei : false,
  }
}

export function declareChi(state: GameState, actor: Actor, candidateIndex = 0): GameState {
  const candidate = getChiCandidates(state, actor)[candidateIndex]

  return candidate === undefined ? state : applyMeld(state, actor, candidate)
}

export function declarePon(state: GameState, actor: Actor): GameState {
  const candidate = getPonCandidate(state, actor)

  return candidate === null ? state : applyMeld(state, actor, candidate)
}

export function declareOpenKan(state: GameState, actor: Actor): GameState {
  const candidate = getOpenKanCandidate(state, actor)

  return candidate === null ? state : applyMeld(state, actor, candidate)
}

export function declareClosedKan(state: GameState, actor: Actor, candidateIndex = 0): GameState {
  const candidate = getClosedKanCandidates(state, actor)[candidateIndex]

  return candidate === undefined ? state : applyMeld(state, actor, candidate)
}

export function resolveComputerMeldAfterPlayerDiscard(state: GameState): GameState {
  if (state.lastDiscard?.actor !== 'player' || state.status === 'ended') {
    return state
  }

  const actor = getOpponent(state.lastDiscard.actor)
  const openKanCandidate = getOpenKanCandidate(state, actor)

  if (openKanCandidate !== null) {
    return applyMeld(state, actor, openKanCandidate)
  }

  const ponCandidate = getPonCandidate(state, actor)

  if (ponCandidate !== null) {
    return applyMeld(state, actor, ponCandidate)
  }

  const chiCandidate = getChiCandidates(state, actor)[0]

  return chiCandidate === undefined ? state : applyMeld(state, actor, chiCandidate)
}
