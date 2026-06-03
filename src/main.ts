import './styles.css'
import { createInitialGameState } from './game/game-state'
import { bindAppEvents } from './ui/events'
import { renderApp } from './ui/render'

export const initialGameState = createInitialGameState()

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  renderApp(app, initialGameState)
  bindAppEvents(app, initialGameState)
}
