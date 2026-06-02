import type { GameState } from '../game/game-state'

export function renderApp(container: HTMLElement, state: GameState): void {
  container.innerHTML = `
    <main class="app-shell" data-status="${state.status}">
      <h1>${state.title}</h1>
      <p>${state.subtitle}</p>
    </main>
  `
}
