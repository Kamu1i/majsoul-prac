import './styles.css'

export const appTitle = '单人 PVE 麻将模拟器'
export const appSubtitle = '工程初始化完成'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  app.innerHTML = `
    <main class="app-shell">
      <h1>${appTitle}</h1>
      <p>${appSubtitle}</p>
    </main>
  `
}
