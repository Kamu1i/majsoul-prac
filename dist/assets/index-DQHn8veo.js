(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const _=[{suit:"souzu",rank:1,id:"souzu-1",label:"1索",sortOrder:1},{suit:"souzu",rank:2,id:"souzu-2",label:"2索",sortOrder:2},{suit:"souzu",rank:3,id:"souzu-3",label:"3索",sortOrder:3},{suit:"souzu",rank:4,id:"souzu-4",label:"4索",sortOrder:4},{suit:"souzu",rank:5,id:"souzu-5",label:"5索",sortOrder:5},{suit:"souzu",rank:6,id:"souzu-6",label:"6索",sortOrder:6},{suit:"souzu",rank:7,id:"souzu-7",label:"7索",sortOrder:7},{suit:"souzu",rank:8,id:"souzu-8",label:"8索",sortOrder:8},{suit:"souzu",rank:9,id:"souzu-9",label:"9索",sortOrder:9}],ee=[{suit:"dragon",value:"white",id:"dragon-white",label:"白",sortOrder:10},{suit:"dragon",value:"green",id:"dragon-green",label:"发",sortOrder:11},{suit:"dragon",value:"red",id:"dragon-red",label:"中",sortOrder:12}],h=[..._,...ee],g=h.map(e=>e.id);function A(e,n){return e.sortOrder-n.sortOrder}function s(e){const n=h.find(t=>t.id===e);if(!n)throw new Error(`Unknown tile id: ${e}`);return n}const ne=[1,2,3,4];function te(){return h.flatMap(e=>ne.map(n=>({tile:e,copyIndex:n})))}function re(e,n=Math.random){const t=[...e];for(let r=t.length-1;r>0;r-=1){const i=Math.floor(n()*(r+1));[t[r],t[i]]=[t[i],t[r]]}return t}const ie=1e5;function k(){return{hand:[],discardPile:[],melds:[],points:ie}}const T=13,oe=2;function z(e){return[...e].sort((n,t)=>{const r=A(n.tile,t.tile);return r!==0?r:n.copyIndex-t.copyIndex})}function ue(e){const n=k(),t=k(),r=T*oe;return n.hand=z(e.slice(0,T)),t.hand=z(e.slice(T,r)),{player:n,computer:t,wall:e.slice(r)}}function R(e){const n=te(),t=re(n,e),r=ue(t);return{status:"player-turn",title:"单人 PVE 麻将模拟器",subtitle:"新对局已初始化",player:r.player,computer:r.computer,wall:r.wall,currentActor:"player",lastDiscard:null,endResult:null,scoreSettlement:null,isHaitei:!1,isHoutei:!1}}function le(){return R()}const D=2e4,S=15e3;function p(){return{player:0,computer:0}}function ae(e){return e==="player"?"computer":"player"}function se(e){return e.type==="exhaustive-draw"?"exhaustive-draw":e.method}function ce(e){if(e.type==="exhaustive-draw")return p();if(e.method==="tsumo"){const n=ae(e.winner);return{...p(),[e.winner]:S,[n]:-S}}return e.loser===null?p():{...p(),[e.winner]:D,[e.loser]:-D}}function $(e,n){const t=ce(e);return{reason:se(e),delta:t,after:{player:n.player.points+t.player,computer:n.computer.points+t.computer}}}function O(e,n){return{...e,hand:[...e.hand,n]}}function de(e,n,t){return n==="player"?{...e,player:O(e.player,t)}:{...e,computer:O(e.computer,t)}}function B(e){if(e.status==="ended"||e.currentActor===null)return e;const[n,...t]=e.wall;if(n===void 0){const r={type:"exhaustive-draw"};return{...e,status:"ended",currentActor:null,endResult:r,scoreSettlement:$(r,e),isHaitei:!1}}return{...de(e,e.currentActor,n),wall:t,isHaitei:t.length===0}}function fe(e,n){const t=A(e.tile,n.tile);return t!==0?t:e.copyIndex-n.copyIndex}function pe(e){const n=new Map;for(const t of e)n.set(t.tile.id,(n.get(t.tile.id)??0)+1);return n}function ye(e,n){return n.tile.suit!=="souzu"?!1:e.some(t=>t.tile.suit!=="souzu"||n.tile.suit!=="souzu"?!1:Math.abs(t.tile.rank-n.tile.rank)===1)}function me(e,n,t){return t.get(e.tile.id)!==1?!1:e.tile.suit==="dragon"||!ye(n,e)}function F(e){if(e.length===0)return null;const n=pe(e),t=e.filter(i=>me(i,e,n));return[...t.length>0?t:e].sort(fe)[0]}function he(e,n){return e.tile.id===n.tile.id&&e.copyIndex===n.copyIndex}function ge(e,n){const t=e.findIndex(r=>he(r,n));return t===-1?null:[...e.slice(0,t),...e.slice(t+1)]}function be(e,n){const t=ge(e.hand,n);return t===null?null:{...e,hand:t,discardPile:[...e.discardPile,n]}}function ve(e,n,t){if(e.status==="ended"||e.currentActor!==n)return e;const r=n==="player"?e.player:e.computer,i=be(r,t);return i===null?e:{...e,player:n==="player"?i:e.player,computer:n==="computer"?i:e.computer,lastDiscard:{tile:t,actor:n},isHoutei:e.isHaitei}}function Te(e){return e==="player"?"computer":"player"}function d(e,n){return n==="player"?e.player:e.computer}function we(e,n){return e.tile.id===n.tile.id&&e.copyIndex===n.copyIndex}function M(e,n){const t=[...e];for(const r of n){const i=t.findIndex(o=>we(o,r));if(i===-1)return null;t.splice(i,1)}return t}function f(e){return[...e].sort((n,t)=>{const r=A(n.tile,t.tile);return r!==0?r:n.copyIndex-t.copyIndex})}function Ce(e,n){return f(e.filter(t=>t.tile.id===n.id))}function N(e,n,t,r){return{type:e,tiles:f(t===null?n:[...n,t]),calledTile:t,from:r}}function Ae(e){return e.suit!=="souzu"?[]:[e.rank-2,e.rank-1,e.rank].filter(t=>t>=1&&t<=7).map(t=>[s(`souzu-${t}`).id,s(`souzu-${t+1}`).id,s(`souzu-${t+2}`).id])}function $e(e,n,t){const r=Ae(n.tile),i=[];for(const o of r){const u=[];for(const l of o){if(l===n.tile.id)continue;const a=f(e.filter(v=>v.tile.id===l))[0];if(a===void 0){u.length=0;break}u.push(a)}u.length===2&&i.push({...N("chi",u,n,t)})}return i}function j(e,n,t,r){const i=e==="pon"?2:3,o=Ce(n,t.tile);return o.length<i?null:N(e,o.slice(0,i),t,r)}function He(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?[]:$e(d(e,n).hand,t.tile,t.actor)}function Ie(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?null:j("pon",d(e,n).hand,t.tile,t.actor)}function Pe(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?null:j("open-kan",d(e,n).hand,t.tile,t.actor)}function xe(e,n){if(n.calledTile===null)return[...n.tiles];const t=[];let r=!1;for(const i of n.tiles){if(!r&&i.tile.id===n.calledTile.tile.id){r=!0;continue}const o=f(e.filter(u=>u.tile.id===i.tile.id&&!t.includes(u)))[0];o!==void 0&&t.push(o)}return t}function w(e,n,t){const r=d(e,n),i=xe(r.hand,t),o=M(r.hand,i);if(o===null)return e;const u={...r,hand:f(o),melds:[...r.melds,t]},l=t.from===null?null:d(e,t.from),a=t.calledTile===null||l===null?l:{...l,discardPile:M(l.discardPile,[t.calledTile])??l.discardPile},v=n==="player"?u:t.from==="player"&&a!==null?a:e.player,Z=n==="computer"?u:t.from==="computer"&&a!==null?a:e.computer;return{...e,player:v,computer:Z,currentActor:n,status:n==="player"?"player-turn":"computer-turn",lastDiscard:t.calledTile===null?e.lastDiscard:null,isHoutei:t.calledTile===null?e.isHoutei:!1}}function ke(e){var o;if(((o=e.lastDiscard)==null?void 0:o.actor)!=="player"||e.status==="ended")return e;const n=Te(e.lastDiscard.actor),t=Pe(e,n);if(t!==null)return w(e,n,t);const r=Ie(e,n);if(r!==null)return w(e,n,r);const i=He(e,n)[0];return i===void 0?e:w(e,n,i)}const G=14,ze=3,H=2,De=7,Se=4;function Oe(e){return g.includes(e.id)}function Me(e){const n=new Map;for(const t of e)n.set(t.id,(n.get(t.id)??0)+1);return n}function b(e,n){return e.get(n)??0}function We(e,n,t){if(t===0){e.delete(n);return}e.set(n,t)}function Le(e){for(const n of g)if(b(e,n)>0)return n;return null}function y(e,n){const t=new Map(e);for(const r of n){const i=b(t,r);if(i===0)return null;We(t,r,i-1)}return t}function Ee(e){return e.suit!=="souzu"||e.rank>7?null:[e.id,s(`souzu-${e.rank+1}`).id,s(`souzu-${e.rank+2}`).id]}function m(e){const n=Le(e);if(n===null)return!0;const t=s(n),r=y(e,[n,n,n]);if(r!==null&&m(r))return!0;const i=Ee(t);if(i===null)return!1;const o=y(e,i);return o!==null&&m(o)}function qe(e){for(const n of e.values())if(n>Se)return!1;return!0}function I(e,n=G){if(e.length!==n||!e.every(Oe))return null;const t=Me(e);return qe(t)?t:null}function Re(e){const n=I(e);if(n===null)return!1;for(const t of g){if(b(n,t)<H)continue;const r=y(n,[t,t]);if(r!==null&&m(r))return!0}return!1}function K(e){const n=I(e);if(n===null||n.size!==De)return!1;for(const t of n.values())if(t!==H)return!1;return!0}function Be(e){return Re(e)||K(e)}function Fe(e,n){if(n===0)return Be(e);const t=G-n*ze,r=I(e,t);if(r===null)return!1;for(const i of g){if(b(r,i)<H)continue;const o=y(r,[i,i]);if(o!==null&&m(o))return!0}return!1}function Ne(e,n){return n==="player"?e.player.hand:e.computer.hand}function je(e,n){return n==="player"?e.player.melds:e.computer.melds}function Ge(e,n=[]){const t=new Map;for(const r of e)r.tile.suit==="dragon"&&t.set(r.tile.id,(t.get(r.tile.id)??0)+1);for(const r of n)if(r.tiles.length>=3&&r.tiles.every(i=>i.tile.suit==="dragon"&&i.tile.id===r.tiles[0].tile.id))return!0;for(const r of t.values())if(r>=3)return!0;return!1}function Ke(e,n=[]){return[...e,...n.flatMap(r=>r.tiles)].every(r=>r.tile.suit==="souzu"&&r.tile.rank>=2&&r.tile.rank<=8)}function P(e,n){const t=e.map(o=>o.tile),r=n.melds??[];if(!Fe(t,r.length))return{canWin:!1,yaku:[]};const i=[];return n.isRiichi===!0&&i.push("riichi"),n.method==="tsumo"&&i.push("tsumo"),Ge(e,r)&&i.push("yakuhai"),Ke(e,r)&&i.push("tanyao"),r.length===0&&K(t)&&i.push("seven-pairs"),n.isHaitei===!0&&i.push("haitei"),n.isHoutei===!0&&i.push("houtei"),{canWin:i.length>0,yaku:i}}function V(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?{canWin:!1,yaku:[]}:P([...Ne(e,n),t.tile],{method:"ron",melds:je(e,n),isHoutei:e.isHoutei})}function Y(e,n){const t=V(e,n);if(!t.canWin||e.lastDiscard===null)return e;const r={type:"win",winner:n,loser:e.lastDiscard.actor,method:"ron",yaku:t.yaku,isHaitei:!1,isHoutei:e.isHoutei},i=$(r,e);return{...e,player:{...e.player,points:i.after.player},computer:{...e.computer,points:i.after.computer},status:"ended",currentActor:null,endResult:r,scoreSettlement:i}}function Ve(e){var n;return((n=e.lastDiscard)==null?void 0:n.actor)!=="player"?e:Y(e,"computer")}function Ye(e){return e==="player"?"computer":"player"}function Ue(e){return e==="player"?"player-turn":"computer-turn"}function W(e,n){var i;if(n===e||n.status==="ended")return n;const t=(i=n.lastDiscard)==null?void 0:i.actor;if(t===void 0)return n;const r=Ye(t);return{...n,currentActor:r,status:Ue(r)}}function x(e,n,t){const r=ve(e,n,t),i=Ve(r);if(i!==r||i.status==="ended")return W(e,i);const o=ke(r);if(o!==r){const u=F(o.computer.hand);return u===null?o:x(o,"computer",u)}return W(e,r)}function Je(e,n){return n==="player"?e.player.hand:e.computer.hand}function Qe(e,n){return e.currentActor===n&&e.status===(n==="player"?"player-turn":"computer-turn")}function U(e,n){return e.status==="ended"||!Qe(e,n)?{canWin:!1,yaku:[]}:P(Je(e,n),{method:"tsumo",melds:n==="player"?e.player.melds:e.computer.melds,isHaitei:e.isHaitei})}function J(e,n){const t=U(e,n);if(!t.canWin)return e;const r={type:"win",winner:n,loser:null,method:"tsumo",yaku:t.yaku,isHaitei:e.isHaitei,isHoutei:!1},i=$(r,e);return{...e,player:{...e.player,points:i.after.player},computer:{...e.computer,points:i.after.computer},status:"ended",currentActor:null,endResult:r,scoreSettlement:i}}function Xe(e){return e.currentActor!=="computer"?e:J(e,"computer")}function Ze(e){if(e.status!=="computer-turn"||e.currentActor!=="computer")return e;const n=B(e);if(n.status==="ended")return n;const t=Xe(n);if(t.status==="ended")return t;const r=F(t.computer.hand);return r===null?t:x(t,"computer",r)}const Q={player:"玩家",computer:"电脑"},X={riichi:"立直",tsumo:"自摸",yakuhai:"役牌",tanyao:"断幺九","seven-pairs":"七对子",haitei:"海底摸月",houtei:"河底捞鱼"},_e="胡牌";function c(e,n){const t=on(n);e.innerHTML=`
    <main class="app-shell" data-status="${n.status}">
      <header class="app-header">
        <div>
          <h1>${n.title}</h1>
          <p>${n.subtitle}</p>
        </div>
        <section class="score-board" aria-label="双方点数">
          <div class="score-card">
            <span>玩家点数</span>
            <strong>${n.player.points}</strong>
          </div>
          <div class="score-card">
            <span>电脑点数</span>
            <strong>${n.computer.points}</strong>
          </div>
        </section>
      </header>

      <section class="table-layout" aria-label="对局桌面">
        <section class="player-area computer-area" aria-labelledby="computer-area-title">
          <div class="section-heading">
            <h2 id="computer-area-title">电脑</h2>
            <span>${n.computer.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hidden-hand" aria-label="电脑手牌">
            ${en(n.computer.hand.length)}
          </div>
        </section>

        <section class="center-area" aria-label="对局状态">
          <div class="status-panel">
            <h2>当前状态</h2>
            <p>${tn(n)}</p>
            <dl class="status-grid">
              <div>
                <dt>剩余牌山</dt>
                <dd>${n.wall.length} 张</dd>
              </div>
              <div>
                <dt>听牌提示</dt>
                <dd>${an(n)}</dd>
              </div>
              <div>
                <dt>可胡提示</dt>
                <dd>${sn(n,t)}</dd>
              </div>
            </dl>
          </div>

          <div class="discard-board">
            <section aria-labelledby="computer-discards-title">
              <h3 id="computer-discards-title">电脑牌河</h3>
              <div class="tile-row discard-row" aria-label="电脑牌河">${L(n.computer.discardPile,"暂无弃牌")}</div>
            </section>
            <section aria-labelledby="player-discards-title">
              <h3 id="player-discards-title">玩家牌河</h3>
              <div class="tile-row discard-row" aria-label="玩家牌河">${L(n.player.discardPile,"暂无弃牌")}</div>
            </section>
          </div>
        </section>

        <section class="player-area" aria-labelledby="player-area-title">
          <div class="section-heading">
            <h2 id="player-area-title">玩家</h2>
            <span>${n.player.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hand-row" aria-label="玩家手牌">
            ${nn(n.player.hand)}
          </div>
        </section>
      </section>

      <section class="action-panel" aria-label="操作按钮区域">
        <button type="button" data-action="new-game">新对局</button>
        <button type="button" data-action="draw" ${n.status==="player-turn"&&n.currentActor==="player"&&n.player.hand.length===13?"":"disabled"}>摸牌</button>
        <button type="button" disabled>打牌</button>
        <button type="button" disabled>吃</button>
        <button type="button" disabled>碰</button>
        <button type="button" disabled>杠</button>
        <button type="button" data-action="win" ${t?"":"disabled"}>${_e}</button>
      </section>
      ${cn(n.scoreSettlement)}
    </main>
  `}function en(e){return e===0?'<span class="empty-text">暂无手牌</span>':Array.from({length:e},()=>'<span class="tile tile-back">牌背</span>').join("")}function nn(e){return e.length===0?'<span class="empty-text">暂无手牌</span>':e.map(n=>`<button type="button" class="tile tile-button" data-tile-id="${n.tile.id}" data-copy-index="${n.copyIndex}" aria-label="打出${n.tile.label}">${n.tile.label}</button>`).join("")}function L(e,n){return e.length===0?`<span class="empty-text">${n}</span>`:e.map(t=>`<span class="tile">${t.tile.label}</span>`).join("")}function tn(e){var n;if(e.endResult)return rn(e.endResult);if(!e.currentActor)return"等待新对局开始。";if(e.currentActor==="player"){const t=e.player.hand.length===13?"请摸牌。":"请打出一张牌。";return`${((n=e.lastDiscard)==null?void 0:n.actor)==="computer"?"电脑已自动行动，":""}当前回合：玩家，${t}`}return"当前回合：电脑"}function rn(e){if(e.type==="exhaustive-draw")return"牌山摸完，本局流局。";const n=e.method==="tsumo"?"自摸":"荣和",t=e.yaku.map(r=>X[r]).join("、");return`${Q[e.winner]}${n}，役种：${t}`}function on(e){const n=U(e,"player");if(n.canWin)return{method:"tsumo",evaluation:n};const t=V(e,"player");return t.canWin?{method:"ron",evaluation:t}:null}function un(e){return e.map(n=>X[n]).join("、")}function ln(e){return e.status==="ended"||e.player.hand.length!==13?[]:h.filter(n=>P([...e.player.hand,{tile:n,copyIndex:1}],{method:"tsumo",melds:e.player.melds}).canWin).map(n=>n.label)}function an(e){if(e.status==="ended")return"对局已结束";const n=ln(e);return n.length>0?`玩家听牌，待牌：${n.join("、")}`:"玩家未听牌"}function sn(e,n){var t;return((t=e.endResult)==null?void 0:t.type)==="win"?`${Q[e.endResult.winner]}已胡牌`:n?`玩家可${n.method==="tsumo"?"自摸":"荣和"}，役种：${un(n.evaluation.yaku)}`:"玩家当前不可胡"}function cn(e){return e===null?"":`
    <section class="settlement-panel" aria-label="点数变化">
      <h2>点数变化</h2>
      <p>玩家：${E(e.delta.player)}，结算后 ${e.after.player} 点</p>
      <p>电脑：${E(e.delta.computer)}，结算后 ${e.after.computer} 点</p>
    </section>
  `}function E(e){return e>0?`+${e}`:String(e)}function dn(e,n){const t=n.dataset.tileId,r=n.dataset.copyIndex;if(t===void 0||r===void 0)return null;const i=Number(r);return e.player.hand.find(o=>o.tile.id===t&&o.copyIndex===i)??null}function fn(e,n){const t=x(e,"player",n);return t.status!=="computer-turn"?t:Ze(t)}function pn(e){return e.status==="player-turn"&&e.currentActor==="player"&&e.player.hand.length>13}function yn(e){return e.status==="player-turn"&&e.currentActor==="player"&&e.player.hand.length===13}function mn(e){const n=J(e,"player");return n!==e?n:Y(e,"player")}function hn(e,n){let t=n;const r=i=>{const o=i.target;if(!(o instanceof HTMLButtonElement))return;if(o.dataset.action==="new-game"){t=R(),c(e,t);return}if(o.dataset.action==="draw"){if(!yn(t))return;t=B(t),c(e,t);return}if(o.dataset.action==="win"){const l=mn(t);if(l===t)return;t=l,c(e,t);return}if(!o.classList.contains("tile-button")||!pn(t))return;const u=dn(t,o);u!==null&&(t=fn(t,u),c(e,t))};return e.addEventListener("click",r),()=>e.removeEventListener("click",r)}const q=le(),C=document.querySelector("#app");C&&(c(C,q),hn(C,q));
