import type { Actor, GameEndResult, GameState, ScoreSettlement, Yaku } from '../game/game-state'
import type { TileCopy } from '../game/deck'
import type { Meld, MeldType } from '../game/player'
import { allowedTiles } from '../game/tile'
import { getChiCandidates, getClosedKanCandidates, getOpenKanCandidate, getPonCandidate } from '../game/meld'
import { canRon, evaluateWinningHand, type WinEvaluation } from '../game/ron'
import { canTsumo } from '../game/tsumo'

const actorLabels: Record<Actor, string> = {
  player: '玩家',
  computer: '电脑',
}

const yakuLabels: Record<Yaku, string> = {
  riichi: '立直',
  tsumo: '自摸',
  yakuhai: '役牌',
  tanyao: '断幺九',
  'seven-pairs': '七对子',
  haitei: '海底摸月',
  houtei: '河底捞鱼',
}

const winButtonLabel = '胡牌'

const meldTypeLabels: Record<MeldType, string> = {
  chi: '吃',
  pon: '碰',
  'open-kan': '明杠',
  'closed-kan': '暗杠',
}

type PlayerMeldOpportunity = Readonly<{
  canChi: boolean
  canPon: boolean
  canOpenKan: boolean
  canClosedKan: boolean
}>

type PlayerWinOpportunity = Readonly<{
  method: 'ron' | 'tsumo'
  evaluation: WinEvaluation
}>

export function renderApp(container: HTMLElement, state: GameState): void {
  const playerWinOpportunity = getPlayerWinOpportunity(state)
  const playerMeldOpportunity = getPlayerMeldOpportunity(state)

  container.innerHTML = `
    <main class="app-shell" data-status="${state.status}">
      <header class="app-header">
        <div>
          <h1>${state.title}</h1>
          <p>${state.subtitle}</p>
        </div>
        <section class="score-board" aria-label="双方点数">
          <div class="score-card">
            <span>玩家点数</span>
            <strong>${state.player.points}</strong>
          </div>
          <div class="score-card">
            <span>电脑点数</span>
            <strong>${state.computer.points}</strong>
          </div>
        </section>
      </header>

      <section class="table-layout" aria-label="对局桌面">
        <section class="player-area computer-area" aria-labelledby="computer-area-title">
          <div class="section-heading">
            <h2 id="computer-area-title">电脑</h2>
            <span>${state.computer.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hidden-hand" aria-label="电脑手牌">
            ${renderHiddenHand(state.computer.hand.length)}
          </div>
          <div class="meld-row" aria-label="电脑副露">
            ${renderMelds(state.computer.melds)}
          </div>
        </section>

        <section class="center-area" aria-label="对局状态">
          <div class="status-panel">
            <h2>当前状态</h2>
            <p>${renderTurnPrompt(state)}</p>
            <dl class="status-grid">
              <div>
                <dt>剩余牌山</dt>
                <dd>${state.wall.length} 张</dd>
              </div>
              <div>
                <dt>听牌提示</dt>
                <dd>${renderReadyHint(state)}</dd>
              </div>
              <div>
                <dt>可胡提示</dt>
                <dd>${renderWinHint(state, playerWinOpportunity)}</dd>
              </div>
              <div>
                <dt>副露提示</dt>
                <dd>${renderMeldHint(playerMeldOpportunity)}</dd>
              </div>
            </dl>
          </div>

          <div class="discard-board">
            <section aria-labelledby="computer-discards-title">
              <h3 id="computer-discards-title">电脑牌河</h3>
              <div class="tile-row discard-row" aria-label="电脑牌河">${renderTileRow(state.computer.discardPile, '暂无弃牌')}</div>
            </section>
            <section aria-labelledby="player-discards-title">
              <h3 id="player-discards-title">玩家牌河</h3>
              <div class="tile-row discard-row" aria-label="玩家牌河">${renderTileRow(state.player.discardPile, '暂无弃牌')}</div>
            </section>
          </div>
        </section>

        <section class="player-area" aria-labelledby="player-area-title">
          <div class="section-heading">
            <h2 id="player-area-title">玩家</h2>
            <span>${state.player.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hand-row" aria-label="玩家手牌">
            ${renderPlayerHand(state.player.hand)}
          </div>
          <div class="meld-row" aria-label="玩家副露">
            ${renderMelds(state.player.melds)}
          </div>
        </section>
      </section>

      <section class="action-panel" aria-label="操作按钮区域">
        <button type="button" data-action="new-game">新对局</button>
        <button type="button" data-action="draw" ${state.status === 'player-turn' && state.currentActor === 'player' && getPlayerEffectiveTileCount(state) === 13 ? '' : 'disabled'}>摸牌</button>
        <button type="button" disabled>打牌</button>
        <button type="button" data-action="chi" ${playerMeldOpportunity.canChi ? '' : 'disabled'}>吃</button>
        <button type="button" data-action="pon" ${playerMeldOpportunity.canPon ? '' : 'disabled'}>碰</button>
        <button type="button" data-action="kan" ${playerMeldOpportunity.canOpenKan || playerMeldOpportunity.canClosedKan ? '' : 'disabled'}>杠</button>
        <button type="button" data-action="win" ${playerWinOpportunity ? '' : 'disabled'}>${winButtonLabel}</button>
      </section>
      ${renderScoreSettlement(state.scoreSettlement)}
    </main>
  `
}

function renderHiddenHand(tileCount: number): string {
  if (tileCount === 0) {
    return '<span class="empty-text">暂无手牌</span>'
  }

  return Array.from({ length: tileCount }, () => '<span class="tile tile-back">牌背</span>').join('')
}

function renderPlayerHand(tiles: readonly TileCopy[]): string {
  if (tiles.length === 0) {
    return '<span class="empty-text">暂无手牌</span>'
  }

  return tiles
    .map(
      (tile) =>
        `<button type="button" class="tile tile-button" data-tile-id="${tile.tile.id}" data-copy-index="${tile.copyIndex}" aria-label="打出${tile.tile.label}">${tile.tile.label}</button>`,
    )
    .join('')
}

function renderMelds(melds: readonly Meld[]): string {
  if (melds.length === 0) {
    return '<span class="empty-text">暂无副露</span>'
  }

  return melds
    .map((meld) => `<span class="meld">${meldTypeLabels[meld.type]}：${meld.tiles.map((tile) => tile.tile.label).join('')}</span>`)
    .join('')
}

function renderTileRow(tiles: readonly TileCopy[], emptyText: string): string {
  if (tiles.length === 0) {
    return `<span class="empty-text">${emptyText}</span>`
  }

  return tiles.map((tile) => `<span class="tile">${tile.tile.label}</span>`).join('')
}

function renderTurnPrompt(state: GameState): string {
  if (state.endResult) {
    return renderEndResult(state.endResult)
  }

  if (!state.currentActor) {
    return '等待新对局开始。'
  }

  if (state.currentActor === 'player') {
    const playerActionHint = state.player.hand.length === 13 ? '请摸牌。' : '请打出一张牌。'
    const computerActionText = state.lastDiscard?.actor === 'computer' ? '电脑已自动行动，' : ''

    return `${computerActionText}当前回合：玩家，${playerActionHint}`
  }

  return '当前回合：电脑'
}

function renderEndResult(endResult: GameEndResult): string {
  if (endResult.type === 'exhaustive-draw') {
    return '牌山摸完，本局流局。'
  }

  const methodLabel = endResult.method === 'tsumo' ? '自摸' : '荣和'
  const yakuText = endResult.yaku.map((yaku) => yakuLabels[yaku]).join('、')

  return `${actorLabels[endResult.winner]}${methodLabel}，役种：${yakuText}`
}

function getPlayerWinOpportunity(state: GameState): PlayerWinOpportunity | null {
  const tsumoEvaluation = canTsumo(state, 'player')

  if (tsumoEvaluation.canWin) {
    return {
      method: 'tsumo',
      evaluation: tsumoEvaluation,
    }
  }

  const ronEvaluation = canRon(state, 'player')

  if (ronEvaluation.canWin) {
    return {
      method: 'ron',
      evaluation: ronEvaluation,
    }
  }

  return null
}

function getPlayerMeldOpportunity(state: GameState): PlayerMeldOpportunity {
  return {
    canChi: getChiCandidates(state, 'player').length > 0,
    canPon: getPonCandidate(state, 'player') !== null,
    canOpenKan: getOpenKanCandidate(state, 'player') !== null,
    canClosedKan: getClosedKanCandidates(state, 'player').length > 0,
  }
}

function getPlayerEffectiveTileCount(state: GameState): number {
  return state.player.hand.length + state.player.melds.reduce(
    (total, meld) => total + (meld.type === 'open-kan' || meld.type === 'closed-kan' ? 3 : meld.tiles.length),
    0,
  )
}

function renderYakuList(yaku: readonly Yaku[]): string {
  return yaku.map((item) => yakuLabels[item]).join('、')
}

function getPlayerWinningWaits(state: GameState): string[] {
  if (state.status === 'ended' || state.player.hand.length !== 13) {
    return []
  }

  return allowedTiles
    .filter((tile) =>
      evaluateWinningHand([...state.player.hand, { tile, copyIndex: 1 }], {
        method: 'tsumo',
        melds: state.player.melds,
      }).canWin,
    )
    .map((tile) => tile.label)
}

function renderReadyHint(state: GameState): string {
  if (state.status === 'ended') {
    return '对局已结束'
  }

  const waits = getPlayerWinningWaits(state)

  if (waits.length > 0) {
    return `玩家听牌，待牌：${waits.join('、')}`
  }

  return '玩家未听牌'
}

function renderWinHint(state: GameState, playerWinOpportunity: PlayerWinOpportunity | null): string {
  if (state.endResult?.type === 'win') {
    return `${actorLabels[state.endResult.winner]}已胡牌`
  }

  if (playerWinOpportunity) {
    const methodLabel = playerWinOpportunity.method === 'tsumo' ? '自摸' : '荣和'

    return `玩家可${methodLabel}，役种：${renderYakuList(playerWinOpportunity.evaluation.yaku)}`
  }

  return '玩家当前不可胡'
}

function renderMeldHint(playerMeldOpportunity: PlayerMeldOpportunity): string {
  const hints = [
    playerMeldOpportunity.canChi ? '玩家可吃' : null,
    playerMeldOpportunity.canPon ? '玩家可碰' : null,
    playerMeldOpportunity.canOpenKan ? '玩家可明杠' : null,
    playerMeldOpportunity.canClosedKan ? '玩家可暗杠' : null,
  ].filter((hint): hint is string => hint !== null)

  return hints.length > 0 ? hints.join('、') : '暂无可用副露'
}

function renderScoreSettlement(scoreSettlement: ScoreSettlement | null): string {
  if (scoreSettlement === null) {
    return ''
  }

  return `
    <section class="settlement-panel" aria-label="点数变化">
      <h2>点数变化</h2>
      <p>玩家：${formatPointDelta(scoreSettlement.delta.player)}，结算后 ${scoreSettlement.after.player} 点</p>
      <p>电脑：${formatPointDelta(scoreSettlement.delta.computer)}，结算后 ${scoreSettlement.after.computer} 点</p>
    </section>
  `
}

function formatPointDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta}`
  }

  return String(delta)
}
