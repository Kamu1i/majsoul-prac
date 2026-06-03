(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function r(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=r(a);fetch(a.href,i)}})();const b=[{suit:"souzu",rank:1,id:"souzu-1",label:"1索",sortOrder:1},{suit:"souzu",rank:2,id:"souzu-2",label:"2索",sortOrder:2},{suit:"souzu",rank:3,id:"souzu-3",label:"3索",sortOrder:3},{suit:"souzu",rank:4,id:"souzu-4",label:"4索",sortOrder:4},{suit:"souzu",rank:5,id:"souzu-5",label:"5索",sortOrder:5},{suit:"souzu",rank:6,id:"souzu-6",label:"6索",sortOrder:6},{suit:"souzu",rank:7,id:"souzu-7",label:"7索",sortOrder:7},{suit:"souzu",rank:8,id:"souzu-8",label:"8索",sortOrder:8},{suit:"souzu",rank:9,id:"souzu-9",label:"9索",sortOrder:9}],f=[{suit:"dragon",value:"white",id:"dragon-white",label:"白",sortOrder:10},{suit:"dragon",value:"green",id:"dragon-green",label:"发",sortOrder:11},{suit:"dragon",value:"red",id:"dragon-red",label:"中",sortOrder:12}],p=[...b,...f];p.map(t=>t.id);function y(t,e){return t.sortOrder-e.sortOrder}const h=[1,2,3,4];function m(){return p.flatMap(t=>h.map(e=>({tile:t,copyIndex:e})))}function v(t,e=Math.random){const r=[...t];for(let n=r.length-1;n>0;n-=1){const a=Math.floor(e()*(n+1));[r[n],r[a]]=[r[a],r[n]]}return r}const g=1e5;function d(){return{hand:[],discardPile:[],melds:[],points:g}}const o=13,O=2;function u(t){return[...t].sort((e,r)=>{const n=y(e.tile,r.tile);return n!==0?n:e.copyIndex-r.copyIndex})}function z(t){const e=d(),r=d(),n=o*O;return e.hand=u(t.slice(0,o)),r.hand=u(t.slice(o,n)),{player:e,computer:r,wall:t.slice(n)}}function w(t){const e=m(),r=v(e,t),n=z(r);return{status:"player-turn",title:"单人 PVE 麻将模拟器",subtitle:"新对局已初始化",player:n.player,computer:n.computer,wall:n.wall,currentActor:"player",lastDiscard:null,endResult:null,scoreSettlement:null,isHaitei:!1,isHoutei:!1}}function $(){return w()}const P={player:"玩家",computer:"电脑"};function T(t,e){t.innerHTML=`
    <main class="app-shell" data-status="${e.status}">
      <header class="app-header">
        <div>
          <h1>${e.title}</h1>
          <p>${e.subtitle}</p>
        </div>
        <section class="score-board" aria-label="双方点数">
          <div class="score-card">
            <span>玩家点数</span>
            <strong>${e.player.points}</strong>
          </div>
          <div class="score-card">
            <span>电脑点数</span>
            <strong>${e.computer.points}</strong>
          </div>
        </section>
      </header>

      <section class="table-layout" aria-label="对局桌面">
        <section class="player-area computer-area" aria-labelledby="computer-area-title">
          <div class="section-heading">
            <h2 id="computer-area-title">电脑</h2>
            <span>${e.computer.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hidden-hand" aria-label="电脑手牌">
            ${H(e.computer.hand.length)}
          </div>
        </section>

        <section class="center-area" aria-label="对局状态">
          <div class="status-panel">
            <h2>当前状态</h2>
            <p>${x(e)}</p>
            <dl class="status-grid">
              <div>
                <dt>剩余牌山</dt>
                <dd>${e.wall.length} 张</dd>
              </div>
              <div>
                <dt>听牌提示</dt>
                <dd>${I(e)}</dd>
              </div>
              <div>
                <dt>可胡提示</dt>
                <dd>${L()}</dd>
              </div>
            </dl>
          </div>

          <div class="discard-board">
            <section aria-labelledby="computer-discards-title">
              <h3 id="computer-discards-title">电脑牌河</h3>
              <div class="tile-row discard-row">${l(e.computer.discardPile,"暂无弃牌")}</div>
            </section>
            <section aria-labelledby="player-discards-title">
              <h3 id="player-discards-title">玩家牌河</h3>
              <div class="tile-row discard-row">${l(e.player.discardPile,"暂无弃牌")}</div>
            </section>
          </div>
        </section>

        <section class="player-area" aria-labelledby="player-area-title">
          <div class="section-heading">
            <h2 id="player-area-title">玩家</h2>
            <span>${e.player.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hand-row" aria-label="玩家手牌">
            ${l(e.player.hand,"暂无手牌")}
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
  `}function H(t){return t===0?'<span class="empty-text">暂无手牌</span>':Array.from({length:t},()=>'<span class="tile tile-back">牌背</span>').join("")}function l(t,e){return t.length===0?`<span class="empty-text">${e}</span>`:t.map(r=>`<span class="tile">${r.tile.label}</span>`).join("")}function x(t){return`当前回合：${P[t.currentActor]}`}function I(t){return t.status==="ended"?"对局已结束":"听牌计算将在后续步骤接入"}function L(t){return"可胡判断将在后续步骤接入"}const S=$(),c=document.querySelector("#app");c&&T(c,S);
