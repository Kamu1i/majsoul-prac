(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function r(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=r(n);fetch(n.href,i)}})();const b=[{suit:"souzu",rank:1,id:"souzu-1",label:"1索",sortOrder:1},{suit:"souzu",rank:2,id:"souzu-2",label:"2索",sortOrder:2},{suit:"souzu",rank:3,id:"souzu-3",label:"3索",sortOrder:3},{suit:"souzu",rank:4,id:"souzu-4",label:"4索",sortOrder:4},{suit:"souzu",rank:5,id:"souzu-5",label:"5索",sortOrder:5},{suit:"souzu",rank:6,id:"souzu-6",label:"6索",sortOrder:6},{suit:"souzu",rank:7,id:"souzu-7",label:"7索",sortOrder:7},{suit:"souzu",rank:8,id:"souzu-8",label:"8索",sortOrder:8},{suit:"souzu",rank:9,id:"souzu-9",label:"9索",sortOrder:9}],f=[{suit:"dragon",value:"white",id:"dragon-white",label:"白",sortOrder:10},{suit:"dragon",value:"green",id:"dragon-green",label:"发",sortOrder:11},{suit:"dragon",value:"red",id:"dragon-red",label:"中",sortOrder:12}],p=[...b,...f];p.map(t=>t.id);function y(t,e){return t.sortOrder-e.sortOrder}const h=[1,2,3,4];function m(){return p.flatMap(t=>h.map(e=>({tile:t,copyIndex:e})))}function v(t,e=Math.random){const r=[...t];for(let a=r.length-1;a>0;a-=1){const n=Math.floor(e()*(a+1));[r[a],r[n]]=[r[n],r[a]]}return r}const g=1e5;function o(){return{hand:[],discardPile:[],melds:[],points:g}}const l=13,$=2;function d(t){return[...t].sort((e,r)=>{const a=y(e.tile,r.tile);return a!==0?a:e.copyIndex-r.copyIndex})}function O(t){const e=o(),r=o(),a=l*$;return e.hand=d(t.slice(0,l)),r.hand=d(t.slice(l,a)),{player:e,computer:r,wall:t.slice(a)}}function z(t){const e=m(),r=v(e,t),a=O(r);return{status:"player-turn",title:"单人 PVE 麻将模拟器",subtitle:"新对局已初始化",player:a.player,computer:a.computer,wall:a.wall,currentActor:"player",lastDiscard:null,endResult:null,scoreSettlement:null,isHaitei:!1,isHoutei:!1}}function w(){return z()}const P={player:"玩家",computer:"电脑"};function T(t,e){t.innerHTML=`
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
            ${x(e.computer.hand.length)}
          </div>
        </section>

        <section class="center-area" aria-label="对局状态">
          <div class="status-panel">
            <h2>当前状态</h2>
            <p>${I(e)}</p>
            <dl class="status-grid">
              <div>
                <dt>剩余牌山</dt>
                <dd>${e.wall.length} 张</dd>
              </div>
              <div>
                <dt>听牌提示</dt>
                <dd>${L(e)}</dd>
              </div>
              <div>
                <dt>可胡提示</dt>
                <dd>${S()}</dd>
              </div>
            </dl>
          </div>

          <div class="discard-board">
            <section aria-labelledby="computer-discards-title">
              <h3 id="computer-discards-title">电脑牌河</h3>
              <div class="tile-row discard-row" aria-label="电脑牌河">${u(e.computer.discardPile,"暂无弃牌")}</div>
            </section>
            <section aria-labelledby="player-discards-title">
              <h3 id="player-discards-title">玩家牌河</h3>
              <div class="tile-row discard-row" aria-label="玩家牌河">${u(e.player.discardPile,"暂无弃牌")}</div>
            </section>
          </div>
        </section>

        <section class="player-area" aria-labelledby="player-area-title">
          <div class="section-heading">
            <h2 id="player-area-title">玩家</h2>
            <span>${e.player.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hand-row" aria-label="玩家手牌">
            ${H(e.player.hand)}
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
  `}function x(t){return t===0?'<span class="empty-text">暂无手牌</span>':Array.from({length:t},()=>'<span class="tile tile-back">牌背</span>').join("")}function H(t){return t.length===0?'<span class="empty-text">暂无手牌</span>':t.map(e=>`<button type="button" class="tile tile-button" data-tile-id="${e.tile.id}" data-copy-index="${e.copyIndex}" aria-label="打出${e.tile.label}">${e.tile.label}</button>`).join("")}function u(t,e){return t.length===0?`<span class="empty-text">${e}</span>`:t.map(r=>`<span class="tile">${r.tile.label}</span>`).join("")}function I(t){return`当前回合：${P[t.currentActor]}`}function L(t){return t.status==="ended"?"对局已结束":"听牌计算将在后续步骤接入"}function S(t){return"可胡判断将在后续步骤接入"}const k=w(),c=document.querySelector("#app");c&&T(c,k);
