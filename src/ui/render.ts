import type { Actor, GameEndResult, GameState, Yaku } from '../game/game-state'
import type { TileCopy } from '../game/deck'

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

export function renderApp(container: HTMLElement, state: GameState): void {
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
                <dd>${renderWinHint(state)}</dd>
              </div>
            </dl>
          </div>

          <div class="discard-board">
            <section aria-labelledby="computer-discards-title">
              <h3 id="computer-discards-title">电脑牌河</h3>
              <div class="tile-row discard-row">${renderTileRow(state.computer.discardPile, '暂无弃牌')}</div>
            </section>
            <section aria-labelledby="player-discards-title">
              <h3 id="player-discards-title">玩家牌河</h3>
              <div class="tile-row discard-row">${renderTileRow(state.player.discardPile, '暂无弃牌')}</div>
            </section>
          </div>
        </section>

        <section class="player-area" aria-labelledby="player-area-title">
          <div class="section-heading">
            <h2 id="player-area-title">玩家</h2>
            <span>${state.player.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hand-row" aria-label="玩家手牌">
            ${renderTileRow(state.player.hand, '暂无手牌')}
          </div>
        </section>
      </section>

      <section class="action-panel" aria-label="操作按钮区域">
        <button type="button" disabled>摸牌</button>
        <button type="button" disabled>打牌</button>
        <button type="button" disabled>吃</button>
        <button type="button" disabled>碰</button>
        <button type="button" disabled>杠</button>
        <button type="button" disabled>胡牌</button>
      </section>
    </main>
  `
}

function renderHiddenHand(tileCount: number): string {
  if (tileCount === 0) {
    return '<span class="empty-text">暂无手牌</span>'
  }

  return Array.from({ length: tileCount }, () => '<span class="tile tile-back">牌背</span>').join('')
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

  return `当前回合：${actorLabels[state.currentActor]}`
}

function renderEndResult(endResult: GameEndResult): string {
  if (endResult.type === 'exhaustive-draw') {
    return '牌山摸完，本局流局。'
  }

  const methodLabel = endResult.method === 'tsumo' ? '自摸' : '荣和'
  const yakuText = endResult.yaku.map((yaku) => yakuLabels[yaku]).join('、')

  return `${actorLabels[endResult.winner]}${methodLabel}，役种：${yakuText}`
}

function renderReadyHint(state: GameState): string {
  if (state.status === 'ended') {
    return '对局已结束'
  }

  return '听牌计算将在后续步骤接入'
}

function renderWinHint(state: GameState): string {
  if (state.endResult?.type === 'win') {
    return `${actorLabels[state.endResult.winner]}已胡牌`
  }

  return '可胡判断将在后续步骤接入'
}
