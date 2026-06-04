(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const V=[{suit:"souzu",rank:1,id:"souzu-1",label:"1索",sortOrder:1},{suit:"souzu",rank:2,id:"souzu-2",label:"2索",sortOrder:2},{suit:"souzu",rank:3,id:"souzu-3",label:"3索",sortOrder:3},{suit:"souzu",rank:4,id:"souzu-4",label:"4索",sortOrder:4},{suit:"souzu",rank:5,id:"souzu-5",label:"5索",sortOrder:5},{suit:"souzu",rank:6,id:"souzu-6",label:"6索",sortOrder:6},{suit:"souzu",rank:7,id:"souzu-7",label:"7索",sortOrder:7},{suit:"souzu",rank:8,id:"souzu-8",label:"8索",sortOrder:8},{suit:"souzu",rank:9,id:"souzu-9",label:"9索",sortOrder:9}],U=[{suit:"dragon",value:"white",id:"dragon-white",label:"白",sortOrder:10},{suit:"dragon",value:"green",id:"dragon-green",label:"发",sortOrder:11},{suit:"dragon",value:"red",id:"dragon-red",label:"中",sortOrder:12}],w=[...V,...U],m=w.map(e=>e.id);function A(e,n){return e.sortOrder-n.sortOrder}function a(e){const n=w.find(t=>t.id===e);if(!n)throw new Error(`Unknown tile id: ${e}`);return n}const Y=[1,2,3,4];function J(){return w.flatMap(e=>Y.map(n=>({tile:e,copyIndex:n})))}function Q(e,n=Math.random){const t=[...e];for(let r=t.length-1;r>0;r-=1){const i=Math.floor(n()*(r+1));[t[r],t[i]]=[t[i],t[r]]}return t}const X=1e5;function P(){return{hand:[],discardPile:[],melds:[],points:X}}const b=13,Z=2;function k(e){return[...e].sort((n,t)=>{const r=A(n.tile,t.tile);return r!==0?r:n.copyIndex-t.copyIndex})}function _(e){const n=P(),t=P(),r=b*Z;return n.hand=k(e.slice(0,b)),t.hand=k(e.slice(b,r)),{player:n,computer:t,wall:e.slice(r)}}function ee(e){const n=J(),t=Q(n,e),r=_(t);return{status:"player-turn",title:"单人 PVE 麻将模拟器",subtitle:"新对局已初始化",player:r.player,computer:r.computer,wall:r.wall,currentActor:"player",lastDiscard:null,endResult:null,scoreSettlement:null,isHaitei:!1,isHoutei:!1}}function ne(){return ee()}const z=2e4,D=15e3;function f(){return{player:0,computer:0}}function te(e){return e==="player"?"computer":"player"}function re(e){return e.type==="exhaustive-draw"?"exhaustive-draw":e.method}function ie(e){if(e.type==="exhaustive-draw")return f();if(e.method==="tsumo"){const n=te(e.winner);return{...f(),[e.winner]:D,[n]:-D}}return e.loser===null?f():{...f(),[e.winner]:z,[e.loser]:-z}}function H(e,n){const t=ie(e);return{reason:re(e),delta:t,after:{player:n.player.points+t.player,computer:n.computer.points+t.computer}}}function S(e,n){return{...e,hand:[...e.hand,n]}}function oe(e,n,t){return n==="player"?{...e,player:S(e.player,t)}:{...e,computer:S(e.computer,t)}}function E(e){if(e.status==="ended"||e.currentActor===null)return e;const[n,...t]=e.wall;if(n===void 0){const r={type:"exhaustive-draw"};return{...e,status:"ended",currentActor:null,endResult:r,scoreSettlement:H(r,e),isHaitei:!1}}return{...oe(e,e.currentActor,n),wall:t,isHaitei:t.length===0}}function ue(e,n){const t=A(e.tile,n.tile);return t!==0?t:e.copyIndex-n.copyIndex}function le(e){const n=new Map;for(const t of e)n.set(t.tile.id,(n.get(t.tile.id)??0)+1);return n}function se(e,n){return n.tile.suit!=="souzu"?!1:e.some(t=>t.tile.suit!=="souzu"||n.tile.suit!=="souzu"?!1:Math.abs(t.tile.rank-n.tile.rank)===1)}function ae(e,n,t){return t.get(e.tile.id)!==1?!1:e.tile.suit==="dragon"||!se(n,e)}function q(e){if(e.length===0)return null;const n=le(e),t=e.filter(i=>ae(i,e,n));return[...t.length>0?t:e].sort(ue)[0]}function ce(e,n){return e.tile.id===n.tile.id&&e.copyIndex===n.copyIndex}function de(e,n){const t=e.findIndex(r=>ce(r,n));return t===-1?null:[...e.slice(0,t),...e.slice(t+1)]}function fe(e,n){const t=de(e.hand,n);return t===null?null:{...e,hand:t,discardPile:[...e.discardPile,n]}}function pe(e,n,t){if(e.status==="ended"||e.currentActor!==n)return e;const r=n==="player"?e.player:e.computer,i=fe(r,t);return i===null?e:{...e,player:n==="player"?i:e.player,computer:n==="computer"?i:e.computer,lastDiscard:{tile:t,actor:n},isHoutei:e.isHaitei}}function ye(e){return e==="player"?"computer":"player"}function c(e,n){return n==="player"?e.player:e.computer}function me(e,n){return e.tile.id===n.tile.id&&e.copyIndex===n.copyIndex}function O(e,n){const t=[...e];for(const r of n){const i=t.findIndex(o=>me(o,r));if(i===-1)return null;t.splice(i,1)}return t}function d(e){return[...e].sort((n,t)=>{const r=A(n.tile,t.tile);return r!==0?r:n.copyIndex-t.copyIndex})}function he(e,n){return d(e.filter(t=>t.tile.id===n.id))}function R(e,n,t,r){return{type:e,tiles:d(t===null?n:[...n,t]),calledTile:t,from:r}}function ge(e){return e.suit!=="souzu"?[]:[e.rank-2,e.rank-1,e.rank].filter(t=>t>=1&&t<=7).map(t=>[a(`souzu-${t}`).id,a(`souzu-${t+1}`).id,a(`souzu-${t+2}`).id])}function be(e,n,t){const r=ge(n.tile),i=[];for(const o of r){const u=[];for(const l of o){if(l===n.tile.id)continue;const s=d(e.filter(g=>g.tile.id===l))[0];if(s===void 0){u.length=0;break}u.push(s)}u.length===2&&i.push({...R("chi",u,n,t)})}return i}function B(e,n,t,r){const i=e==="pon"?2:3,o=he(n,t.tile);return o.length<i?null:R(e,o.slice(0,i),t,r)}function Te(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?[]:be(c(e,n).hand,t.tile,t.actor)}function ve(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?null:B("pon",c(e,n).hand,t.tile,t.actor)}function Ce(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?null:B("open-kan",c(e,n).hand,t.tile,t.actor)}function we(e,n){if(n.calledTile===null)return[...n.tiles];const t=[];let r=!1;for(const i of n.tiles){if(!r&&i.tile.id===n.calledTile.tile.id){r=!0;continue}const o=d(e.filter(u=>u.tile.id===i.tile.id&&!t.includes(u)))[0];o!==void 0&&t.push(o)}return t}function T(e,n,t){const r=c(e,n),i=we(r.hand,t),o=O(r.hand,i);if(o===null)return e;const u={...r,hand:d(o),melds:[...r.melds,t]},l=t.from===null?null:c(e,t.from),s=t.calledTile===null||l===null?l:{...l,discardPile:O(l.discardPile,[t.calledTile])??l.discardPile},g=n==="player"?u:t.from==="player"&&s!==null?s:e.player,K=n==="computer"?u:t.from==="computer"&&s!==null?s:e.computer;return{...e,player:g,computer:K,currentActor:n,status:n==="player"?"player-turn":"computer-turn",lastDiscard:t.calledTile===null?e.lastDiscard:null,isHoutei:t.calledTile===null?e.isHoutei:!1}}function Ae(e){var o;if(((o=e.lastDiscard)==null?void 0:o.actor)!=="player"||e.status==="ended")return e;const n=ye(e.lastDiscard.actor),t=Ce(e,n);if(t!==null)return T(e,n,t);const r=ve(e,n);if(r!==null)return T(e,n,r);const i=Te(e,n)[0];return i===void 0?e:T(e,n,i)}const F=14,He=3,I=2,Ie=7,$e=4;function xe(e){return m.includes(e.id)}function Pe(e){const n=new Map;for(const t of e)n.set(t.id,(n.get(t.id)??0)+1);return n}function h(e,n){return e.get(n)??0}function ke(e,n,t){if(t===0){e.delete(n);return}e.set(n,t)}function ze(e){for(const n of m)if(h(e,n)>0)return n;return null}function p(e,n){const t=new Map(e);for(const r of n){const i=h(t,r);if(i===0)return null;ke(t,r,i-1)}return t}function De(e){return e.suit!=="souzu"||e.rank>7?null:[e.id,a(`souzu-${e.rank+1}`).id,a(`souzu-${e.rank+2}`).id]}function y(e){const n=ze(e);if(n===null)return!0;const t=a(n),r=p(e,[n,n,n]);if(r!==null&&y(r))return!0;const i=De(t);if(i===null)return!1;const o=p(e,i);return o!==null&&y(o)}function Se(e){for(const n of e.values())if(n>$e)return!1;return!0}function $(e,n=F){if(e.length!==n||!e.every(xe))return null;const t=Pe(e);return Se(t)?t:null}function Oe(e){const n=$(e);if(n===null)return!1;for(const t of m){if(h(n,t)<I)continue;const r=p(n,[t,t]);if(r!==null&&y(r))return!0}return!1}function N(e){const n=$(e);if(n===null||n.size!==Ie)return!1;for(const t of n.values())if(t!==I)return!1;return!0}function Me(e){return Oe(e)||N(e)}function We(e,n){if(n===0)return Me(e);const t=F-n*He,r=$(e,t);if(r===null)return!1;for(const i of m){if(h(r,i)<I)continue;const o=p(r,[i,i]);if(o!==null&&y(o))return!0}return!1}function Le(e,n){return n==="player"?e.player.hand:e.computer.hand}function Ee(e,n){return e.computer.melds}function qe(e,n=[]){const t=new Map;for(const r of e)r.tile.suit==="dragon"&&t.set(r.tile.id,(t.get(r.tile.id)??0)+1);for(const r of n)if(r.tiles.length>=3&&r.tiles.every(i=>i.tile.suit==="dragon"&&i.tile.id===r.tiles[0].tile.id))return!0;for(const r of t.values())if(r>=3)return!0;return!1}function Re(e,n=[]){return[...e,...n.flatMap(r=>r.tiles)].every(r=>r.tile.suit==="souzu"&&r.tile.rank>=2&&r.tile.rank<=8)}function G(e,n){const t=e.map(o=>o.tile),r=n.melds??[];if(!We(t,r.length))return{canWin:!1,yaku:[]};const i=[];return n.isRiichi===!0&&i.push("riichi"),n.method==="tsumo"&&i.push("tsumo"),qe(e,r)&&i.push("yakuhai"),Re(e,r)&&i.push("tanyao"),r.length===0&&N(t)&&i.push("seven-pairs"),n.isHaitei===!0&&i.push("haitei"),n.isHoutei===!0&&i.push("houtei"),{canWin:i.length>0,yaku:i}}function Be(e,n){const t=e.lastDiscard;return e.status==="ended"||t===null||t.actor===n?{canWin:!1,yaku:[]}:G([...Le(e,n),t.tile],{method:"ron",melds:Ee(e),isHoutei:e.isHoutei})}function Fe(e,n){const t=Be(e,n);if(!t.canWin||e.lastDiscard===null)return e;const r={type:"win",winner:n,loser:e.lastDiscard.actor,method:"ron",yaku:t.yaku,isHaitei:!1,isHoutei:e.isHoutei},i=H(r,e);return{...e,player:{...e.player,points:i.after.player},computer:{...e.computer,points:i.after.computer},status:"ended",currentActor:null,endResult:r,scoreSettlement:i}}function Ne(e){var n;return((n=e.lastDiscard)==null?void 0:n.actor)!=="player"?e:Fe(e,"computer")}function Ge(e){return e==="player"?"computer":"player"}function je(e){return e==="player"?"player-turn":"computer-turn"}function M(e,n){var i;if(n===e||n.status==="ended")return n;const t=(i=n.lastDiscard)==null?void 0:i.actor;if(t===void 0)return n;const r=Ge(t);return{...n,currentActor:r,status:je(r)}}function x(e,n,t){const r=pe(e,n,t),i=Ne(r);if(i!==r||i.status==="ended")return M(e,i);const o=Ae(r);if(o!==r){const u=q(o.computer.hand);return u===null?o:x(o,"computer",u)}return M(e,r)}function Ke(e,n){return e.computer.hand}function Ve(e,n){return e.currentActor===n&&e.status==="computer-turn"}function Ue(e,n){return e.status==="ended"||!Ve(e,n)?{canWin:!1,yaku:[]}:G(Ke(e),{method:"tsumo",melds:e.computer.melds,isHaitei:e.isHaitei})}function Ye(e,n){const t=Ue(e,n);if(!t.canWin)return e;const r={type:"win",winner:n,loser:null,method:"tsumo",yaku:t.yaku,isHaitei:e.isHaitei,isHoutei:!1},i=H(r,e);return{...e,player:{...e.player,points:i.after.player},computer:{...e.computer,points:i.after.computer},status:"ended",currentActor:null,endResult:r,scoreSettlement:i}}function Je(e){return e.currentActor!=="computer"?e:Ye(e,"computer")}function Qe(e){if(e.status!=="computer-turn"||e.currentActor!=="computer")return e;const n=E(e);if(n.status==="ended")return n;const t=Je(n);if(t.status==="ended")return t;const r=q(t.computer.hand);return r===null?t:x(t,"computer",r)}const j={player:"玩家",computer:"电脑"},Xe={riichi:"立直",tsumo:"自摸",yakuhai:"役牌",tanyao:"断幺九","seven-pairs":"七对子",haitei:"海底摸月",houtei:"河底捞鱼"};function C(e,n){e.innerHTML=`
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
            ${Ze(n.computer.hand.length)}
          </div>
        </section>

        <section class="center-area" aria-label="对局状态">
          <div class="status-panel">
            <h2>当前状态</h2>
            <p>${en(n)}</p>
            <dl class="status-grid">
              <div>
                <dt>剩余牌山</dt>
                <dd>${n.wall.length} 张</dd>
              </div>
              <div>
                <dt>听牌提示</dt>
                <dd>${tn(n)}</dd>
              </div>
              <div>
                <dt>可胡提示</dt>
                <dd>${rn(n)}</dd>
              </div>
            </dl>
          </div>

          <div class="discard-board">
            <section aria-labelledby="computer-discards-title">
              <h3 id="computer-discards-title">电脑牌河</h3>
              <div class="tile-row discard-row" aria-label="电脑牌河">${W(n.computer.discardPile,"暂无弃牌")}</div>
            </section>
            <section aria-labelledby="player-discards-title">
              <h3 id="player-discards-title">玩家牌河</h3>
              <div class="tile-row discard-row" aria-label="玩家牌河">${W(n.player.discardPile,"暂无弃牌")}</div>
            </section>
          </div>
        </section>

        <section class="player-area" aria-labelledby="player-area-title">
          <div class="section-heading">
            <h2 id="player-area-title">玩家</h2>
            <span>${n.player.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hand-row" aria-label="玩家手牌">
            ${_e(n.player.hand)}
          </div>
        </section>
      </section>

      <section class="action-panel" aria-label="操作按钮区域">
        <button type="button" data-action="draw" ${n.status==="player-turn"&&n.currentActor==="player"&&n.player.hand.length===13?"":"disabled"}>摸牌</button>
        <button type="button" disabled>打牌</button>
        <button type="button" disabled>吃</button>
        <button type="button" disabled>碰</button>
        <button type="button" disabled>杠</button>
        <button type="button" disabled>胡牌</button>
      </section>
    </main>
  `}function Ze(e){return e===0?'<span class="empty-text">暂无手牌</span>':Array.from({length:e},()=>'<span class="tile tile-back">牌背</span>').join("")}function _e(e){return e.length===0?'<span class="empty-text">暂无手牌</span>':e.map(n=>`<button type="button" class="tile tile-button" data-tile-id="${n.tile.id}" data-copy-index="${n.copyIndex}" aria-label="打出${n.tile.label}">${n.tile.label}</button>`).join("")}function W(e,n){return e.length===0?`<span class="empty-text">${n}</span>`:e.map(t=>`<span class="tile">${t.tile.label}</span>`).join("")}function en(e){var n;if(e.endResult)return nn(e.endResult);if(!e.currentActor)return"等待新对局开始。";if(e.currentActor==="player"){const t=e.player.hand.length===13?"请摸牌。":"请打出一张牌。";return`${((n=e.lastDiscard)==null?void 0:n.actor)==="computer"?"电脑已自动行动，":""}当前回合：玩家，${t}`}return"当前回合：电脑"}function nn(e){if(e.type==="exhaustive-draw")return"牌山摸完，本局流局。";const n=e.method==="tsumo"?"自摸":"荣和",t=e.yaku.map(r=>Xe[r]).join("、");return`${j[e.winner]}${n}，役种：${t}`}function tn(e){return e.status==="ended"?"对局已结束":"听牌计算将在后续步骤接入"}function rn(e){var n;return((n=e.endResult)==null?void 0:n.type)==="win"?`${j[e.endResult.winner]}已胡牌`:"可胡判断将在后续步骤接入"}function on(e,n){const t=n.dataset.tileId,r=n.dataset.copyIndex;if(t===void 0||r===void 0)return null;const i=Number(r);return e.player.hand.find(o=>o.tile.id===t&&o.copyIndex===i)??null}function un(e,n){const t=x(e,"player",n);return t.status!=="computer-turn"?t:Qe(t)}function ln(e){return e.status==="player-turn"&&e.currentActor==="player"&&e.player.hand.length>13}function sn(e){return e.status==="player-turn"&&e.currentActor==="player"&&e.player.hand.length===13}function an(e,n){let t=n;const r=i=>{const o=i.target;if(!(o instanceof HTMLButtonElement))return;if(o.dataset.action==="draw"){if(!sn(t))return;t=E(t),C(e,t);return}if(!o.classList.contains("tile-button")||!ln(t))return;const u=on(t,o);u!==null&&(t=un(t,u),C(e,t))};return e.addEventListener("click",r),()=>e.removeEventListener("click",r)}const L=ne(),v=document.querySelector("#app");v&&(C(v,L),an(v,L));
