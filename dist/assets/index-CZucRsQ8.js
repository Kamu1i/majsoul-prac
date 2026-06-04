(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&t(u)}).observe(document,{childList:!0,subtree:!0});function r(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(i){if(i.ep)return;i.ep=!0;const o=r(i);fetch(i.href,o)}})();const un=[{suit:"souzu",rank:1,id:"souzu-1",label:"1索",sortOrder:1},{suit:"souzu",rank:2,id:"souzu-2",label:"2索",sortOrder:2},{suit:"souzu",rank:3,id:"souzu-3",label:"3索",sortOrder:3},{suit:"souzu",rank:4,id:"souzu-4",label:"4索",sortOrder:4},{suit:"souzu",rank:5,id:"souzu-5",label:"5索",sortOrder:5},{suit:"souzu",rank:6,id:"souzu-6",label:"6索",sortOrder:6},{suit:"souzu",rank:7,id:"souzu-7",label:"7索",sortOrder:7},{suit:"souzu",rank:8,id:"souzu-8",label:"8索",sortOrder:8},{suit:"souzu",rank:9,id:"souzu-9",label:"9索",sortOrder:9}],ln=[{suit:"dragon",value:"white",id:"dragon-white",label:"白",sortOrder:10},{suit:"dragon",value:"green",id:"dragon-green",label:"发",sortOrder:11},{suit:"dragon",value:"red",id:"dragon-red",label:"中",sortOrder:12}],g=[...un,...ln],v=g.map(n=>n.id);function A(n,e){return n.sortOrder-e.sortOrder}function d(n){const e=g.find(r=>r.id===n);if(!e)throw new Error(`Unknown tile id: ${n}`);return e}const an=[1,2,3,4];function cn(){return g.flatMap(n=>an.map(e=>({tile:n,copyIndex:e})))}function sn(n,e=Math.random){const r=[...n];for(let t=r.length-1;t>0;t-=1){const i=Math.floor(e()*(t+1));[r[t],r[i]]=[r[i],r[t]]}return r}const dn=1e5;function M(){return{hand:[],discardPile:[],melds:[],points:dn}}const $=13,fn=2;function W(n){return[...n].sort((e,r)=>{const t=A(e.tile,r.tile);return t!==0?t:e.copyIndex-r.copyIndex})}function pn(n){const e=M(),r=M(),t=$*fn;return e.hand=W(n.slice(0,$)),r.hand=W(n.slice($,t)),{player:e,computer:r,wall:n.slice(t)}}function G(n){const e=cn(),r=sn(e,n),t=pn(r);return{status:"player-turn",title:"单人 PVE 麻将模拟器",subtitle:"新对局已初始化",player:t.player,computer:t.computer,wall:t.wall,currentActor:"player",lastDiscard:null,endResult:null,scoreSettlement:null,isHaitei:!1,isHoutei:!1}}function yn(){return G()}const L=2e4,E=15e3;function y(){return{player:0,computer:0}}function mn(n){return n==="player"?"computer":"player"}function hn(n){return n.type==="exhaustive-draw"?"exhaustive-draw":n.method}function gn(n){if(n.type==="exhaustive-draw")return y();if(n.method==="tsumo"){const e=mn(n.winner);return{...y(),[n.winner]:E,[e]:-E}}return n.loser===null?y():{...y(),[n.winner]:L,[n.loser]:-L}}function P(n,e){const r=gn(n);return{reason:hn(n),delta:r,after:{player:e.player.points+r.player,computer:e.computer.points+r.computer}}}function K(n,e){return{...n,hand:[...n.hand,e]}}function vn(n,e,r){return e==="player"?{...n,player:K(n.player,r)}:{...n,computer:K(n.computer,r)}}function V(n){if(n.status==="ended"||n.currentActor===null)return n;const[e,...r]=n.wall;if(e===void 0){const t={type:"exhaustive-draw"};return{...n,status:"ended",currentActor:null,endResult:t,scoreSettlement:P(t,n),isHaitei:!1}}return{...vn(n,n.currentActor,e),wall:r,isHaitei:r.length===0}}function bn(n,e){const r=A(n.tile,e.tile);return r!==0?r:n.copyIndex-e.copyIndex}function Tn(n){const e=new Map;for(const r of n)e.set(r.tile.id,(e.get(r.tile.id)??0)+1);return e}function Cn(n,e){return e.tile.suit!=="souzu"?!1:n.some(r=>r.tile.suit!=="souzu"||e.tile.suit!=="souzu"?!1:Math.abs(r.tile.rank-e.tile.rank)===1)}function $n(n,e,r){return r.get(n.tile.id)!==1?!1:n.tile.suit==="dragon"||!Cn(e,n)}function Y(n){if(n.length===0)return null;const e=Tn(n),r=n.filter(i=>$n(i,n,e));return[...r.length>0?r:n].sort(bn)[0]}function wn(n,e){return n.tile.id===e.tile.id&&n.copyIndex===e.copyIndex}function An(n,e){const r=n.findIndex(t=>wn(t,e));return r===-1?null:[...n.slice(0,r),...n.slice(r+1)]}function Pn(n,e){const r=An(n.hand,e);return r===null?null:{...n,hand:r,discardPile:[...n.discardPile,e]}}function kn(n,e,r){if(n.status==="ended"||n.currentActor!==e)return n;const t=e==="player"?n.player:n.computer,i=Pn(t,r);return i===null?n:{...n,player:e==="player"?i:n.player,computer:e==="computer"?i:n.computer,lastDiscard:{tile:r,actor:e},isHoutei:n.isHaitei}}function Hn(n){return n==="player"?"computer":"player"}function f(n,e){return e==="player"?n.player:n.computer}function In(n,e){return n.tile.id===e.tile.id&&n.copyIndex===e.copyIndex}function j(n,e){const r=[...n];for(const t of e){const i=r.findIndex(o=>In(o,t));if(i===-1)return null;r.splice(i,1)}return r}function p(n){return[...n].sort((e,r)=>{const t=A(e.tile,r.tile);return t!==0?t:e.copyIndex-r.copyIndex})}function xn(n,e){return p(n.filter(r=>r.tile.id===e.id))}function k(n,e,r,t){return{type:n,tiles:p(r===null?e:[...e,r]),calledTile:r,from:t}}function zn(n){return n.suit!=="souzu"?[]:[n.rank-2,n.rank-1,n.rank].filter(r=>r>=1&&r<=7).map(r=>[d(`souzu-${r}`).id,d(`souzu-${r+1}`).id,d(`souzu-${r+2}`).id])}function Dn(n,e,r){const t=zn(e.tile),i=[];for(const o of t){const u=[];for(const l of o){if(l===e.tile.id)continue;const a=p(n.filter(C=>C.tile.id===l))[0];if(a===void 0){u.length=0;break}u.push(a)}u.length===2&&i.push({...k("chi",u,e,r)})}return i}function U(n,e,r,t){const i=n==="pon"?2:3,o=xn(e,r.tile);return o.length<i?null:k(n,o.slice(0,i),r,t)}function H(n,e){const r=n.lastDiscard;return n.status==="ended"||r===null||r.actor===e?[]:Dn(f(n,e).hand,r.tile,r.actor)}function I(n,e){const r=n.lastDiscard;return n.status==="ended"||r===null||r.actor===e?null:U("pon",f(n,e).hand,r.tile,r.actor)}function b(n,e){const r=n.lastDiscard;return n.status==="ended"||r===null||r.actor===e?null:U("open-kan",f(n,e).hand,r.tile,r.actor)}function x(n,e){if(n.status==="ended"||n.currentActor!==e)return[];const r=f(n,e),t=new Map;for(const i of r.hand)t.set(i.tile.id,[...t.get(i.tile.id)??[],i]);return[...t.values()].filter(i=>i.length===4).map(i=>k("closed-kan",i,null,null))}function Sn(n,e){if(e.calledTile===null)return[...e.tiles];const r=[];let t=!1;for(const i of e.tiles){if(!t&&i.tile.id===e.calledTile.tile.id){t=!0;continue}const o=p(n.filter(u=>u.tile.id===i.tile.id&&!r.includes(u)))[0];o!==void 0&&r.push(o)}return r}function c(n,e,r){const t=f(n,e),i=Sn(t.hand,r),o=j(t.hand,i);if(o===null)return n;const u={...t,hand:p(o),melds:[...t.melds,r]},l=r.from===null?null:f(n,r.from),a=r.calledTile===null||l===null?l:{...l,discardPile:j(l.discardPile,[r.calledTile])??l.discardPile},C=e==="player"?u:r.from==="player"&&a!==null?a:n.player,on=e==="computer"?u:r.from==="computer"&&a!==null?a:n.computer;return{...n,player:C,computer:on,currentActor:e,status:e==="player"?"player-turn":"computer-turn",lastDiscard:r.calledTile===null?n.lastDiscard:null,isHoutei:r.calledTile===null?n.isHoutei:!1}}function On(n,e,r=0){const t=H(n,e)[r];return t===void 0?n:c(n,e,t)}function Mn(n,e){const r=I(n,e);return r===null?n:c(n,e,r)}function Wn(n,e){const r=b(n,e);return r===null?n:c(n,e,r)}function Ln(n,e,r=0){const t=x(n,e)[r];return t===void 0?n:c(n,e,t)}function En(n){var o;if(((o=n.lastDiscard)==null?void 0:o.actor)!=="player"||n.status==="ended")return n;const e=Hn(n.lastDiscard.actor),r=b(n,e);if(r!==null)return c(n,e,r);const t=I(n,e);if(t!==null)return c(n,e,t);const i=H(n,e)[0];return i===void 0?n:c(n,e,i)}const J=14,Kn=3,z=2,jn=7,qn=4;function Rn(n){return v.includes(n.id)}function Bn(n){const e=new Map;for(const r of n)e.set(r.id,(e.get(r.id)??0)+1);return e}function T(n,e){return n.get(e)??0}function Fn(n,e,r){if(r===0){n.delete(e);return}n.set(e,r)}function Nn(n){for(const e of v)if(T(n,e)>0)return e;return null}function m(n,e){const r=new Map(n);for(const t of e){const i=T(r,t);if(i===0)return null;Fn(r,t,i-1)}return r}function Gn(n){return n.suit!=="souzu"||n.rank>7?null:[n.id,d(`souzu-${n.rank+1}`).id,d(`souzu-${n.rank+2}`).id]}function h(n){const e=Nn(n);if(e===null)return!0;const r=d(e),t=m(n,[e,e,e]);if(t!==null&&h(t))return!0;const i=Gn(r);if(i===null)return!1;const o=m(n,i);return o!==null&&h(o)}function Vn(n){for(const e of n.values())if(e>qn)return!1;return!0}function D(n,e=J){if(n.length!==e||!n.every(Rn))return null;const r=Bn(n);return Vn(r)?r:null}function Yn(n){const e=D(n);if(e===null)return!1;for(const r of v){if(T(e,r)<z)continue;const t=m(e,[r,r]);if(t!==null&&h(t))return!0}return!1}function Q(n){const e=D(n);if(e===null||e.size!==jn)return!1;for(const r of e.values())if(r!==z)return!1;return!0}function Un(n){return Yn(n)||Q(n)}function Jn(n,e){if(e===0)return Un(n);const r=J-e*Kn,t=D(n,r);if(t===null)return!1;for(const i of v){if(T(t,i)<z)continue;const o=m(t,[i,i]);if(o!==null&&h(o))return!0}return!1}function Qn(n,e){return e==="player"?n.player.hand:n.computer.hand}function Xn(n,e){return e==="player"?n.player.melds:n.computer.melds}function Zn(n,e=[]){const r=new Map;for(const t of n)t.tile.suit==="dragon"&&r.set(t.tile.id,(r.get(t.tile.id)??0)+1);for(const t of e)if(t.tiles.length>=3&&t.tiles.every(i=>i.tile.suit==="dragon"&&i.tile.id===t.tiles[0].tile.id))return!0;for(const t of r.values())if(t>=3)return!0;return!1}function _n(n,e=[]){return[...n,...e.flatMap(t=>t.tiles)].every(t=>t.tile.suit==="souzu"&&t.tile.rank>=2&&t.tile.rank<=8)}function S(n,e){const r=n.map(o=>o.tile),t=e.melds??[];if(!Jn(r,t.length))return{canWin:!1,yaku:[]};const i=[];return e.isRiichi===!0&&i.push("riichi"),e.method==="tsumo"&&i.push("tsumo"),Zn(n,t)&&i.push("yakuhai"),_n(n,t)&&i.push("tanyao"),t.length===0&&Q(r)&&i.push("seven-pairs"),e.isHaitei===!0&&i.push("haitei"),e.isHoutei===!0&&i.push("houtei"),{canWin:i.length>0,yaku:i}}function X(n,e){const r=n.lastDiscard;return n.status==="ended"||r===null||r.actor===e?{canWin:!1,yaku:[]}:S([...Qn(n,e),r.tile],{method:"ron",melds:Xn(n,e),isHoutei:n.isHoutei})}function Z(n,e){const r=X(n,e);if(!r.canWin||n.lastDiscard===null)return n;const t={type:"win",winner:e,loser:n.lastDiscard.actor,method:"ron",yaku:r.yaku,isHaitei:!1,isHoutei:n.isHoutei},i=P(t,n);return{...n,player:{...n.player,points:i.after.player},computer:{...n.computer,points:i.after.computer},status:"ended",currentActor:null,endResult:t,scoreSettlement:i}}function ne(n){var e;return((e=n.lastDiscard)==null?void 0:e.actor)!=="player"?n:Z(n,"computer")}function ee(n){return n==="player"?"computer":"player"}function re(n){return n==="player"?"player-turn":"computer-turn"}function q(n,e){var i;if(e===n||e.status==="ended")return e;const r=(i=e.lastDiscard)==null?void 0:i.actor;if(r===void 0)return e;const t=ee(r);return{...e,currentActor:t,status:re(t)}}function O(n,e,r){const t=kn(n,e,r),i=ne(t);if(i!==t||i.status==="ended")return q(n,i);const o=En(t);if(o!==t){const u=Y(o.computer.hand);return u===null?o:O(o,"computer",u)}return q(n,t)}function te(n,e){return e==="player"?n.player.hand:n.computer.hand}function ie(n,e){return n.currentActor===e&&n.status===(e==="player"?"player-turn":"computer-turn")}function _(n,e){return n.status==="ended"||!ie(n,e)?{canWin:!1,yaku:[]}:S(te(n,e),{method:"tsumo",melds:e==="player"?n.player.melds:n.computer.melds,isHaitei:n.isHaitei})}function nn(n,e){const r=_(n,e);if(!r.canWin)return n;const t={type:"win",winner:e,loser:null,method:"tsumo",yaku:r.yaku,isHaitei:n.isHaitei,isHoutei:!1},i=P(t,n);return{...n,player:{...n.player,points:i.after.player},computer:{...n.computer,points:i.after.computer},status:"ended",currentActor:null,endResult:t,scoreSettlement:i}}function oe(n){return n.currentActor!=="computer"?n:nn(n,"computer")}function ue(n){if(n.status!=="computer-turn"||n.currentActor!=="computer")return n;const e=V(n);if(e.status==="ended")return e;const r=oe(e);if(r.status==="ended")return r;const t=Y(r.computer.hand);return t===null?r:O(r,"computer",t)}const en={player:"玩家",computer:"电脑"},rn={riichi:"立直",tsumo:"自摸",yakuhai:"役牌",tanyao:"断幺九","seven-pairs":"七对子",haitei:"海底摸月",houtei:"河底捞鱼"},le="胡牌",ae={chi:"吃",pon:"碰","open-kan":"明杠","closed-kan":"暗杠"};function s(n,e){const r=pe(e),t=ye(e);n.innerHTML=`
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
            ${ce(e.computer.hand.length)}
          </div>
          <div class="meld-row" aria-label="电脑副露">
            ${R(e.computer.melds)}
          </div>
        </section>

        <section class="center-area" aria-label="对局状态">
          <div class="status-panel">
            <h2>当前状态</h2>
            <p>${de(e)}</p>
            <dl class="status-grid">
              <div>
                <dt>剩余牌山</dt>
                <dd>${e.wall.length} 张</dd>
              </div>
              <div>
                <dt>听牌提示</dt>
                <dd>${ve(e)}</dd>
              </div>
              <div>
                <dt>可胡提示</dt>
                <dd>${be(e,r)}</dd>
              </div>
              <div>
                <dt>副露提示</dt>
                <dd>${Te(t)}</dd>
              </div>
            </dl>
          </div>

          <div class="discard-board">
            <section aria-labelledby="computer-discards-title">
              <h3 id="computer-discards-title">电脑牌河</h3>
              <div class="tile-row discard-row" aria-label="电脑牌河">${B(e.computer.discardPile,"暂无弃牌")}</div>
            </section>
            <section aria-labelledby="player-discards-title">
              <h3 id="player-discards-title">玩家牌河</h3>
              <div class="tile-row discard-row" aria-label="玩家牌河">${B(e.player.discardPile,"暂无弃牌")}</div>
            </section>
          </div>
        </section>

        <section class="player-area" aria-labelledby="player-area-title">
          <div class="section-heading">
            <h2 id="player-area-title">玩家</h2>
            <span>${e.player.hand.length} 张手牌</span>
          </div>
          <div class="tile-row hand-row" aria-label="玩家手牌">
            ${se(e.player.hand)}
          </div>
          <div class="meld-row" aria-label="玩家副露">
            ${R(e.player.melds)}
          </div>
        </section>
      </section>

      <section class="action-panel" aria-label="操作按钮区域">
        <button type="button" data-action="new-game">新对局</button>
        <button type="button" data-action="draw" ${e.status==="player-turn"&&e.currentActor==="player"&&me(e)===13?"":"disabled"}>摸牌</button>
        <button type="button" disabled>打牌</button>
        <button type="button" data-action="chi" ${t.canChi?"":"disabled"}>吃</button>
        <button type="button" data-action="pon" ${t.canPon?"":"disabled"}>碰</button>
        <button type="button" data-action="kan" ${t.canOpenKan||t.canClosedKan?"":"disabled"}>杠</button>
        <button type="button" data-action="win" ${r?"":"disabled"}>${le}</button>
      </section>
      ${Ce(e.scoreSettlement)}
    </main>
  `}function ce(n){return n===0?'<span class="empty-text">暂无手牌</span>':Array.from({length:n},()=>'<span class="tile tile-back">牌背</span>').join("")}function se(n){return n.length===0?'<span class="empty-text">暂无手牌</span>':n.map(e=>`<button type="button" class="tile tile-button" data-tile-id="${e.tile.id}" data-copy-index="${e.copyIndex}" aria-label="打出${e.tile.label}">${e.tile.label}</button>`).join("")}function R(n){return n.length===0?'<span class="empty-text">暂无副露</span>':n.map(e=>`<span class="meld">${ae[e.type]}：${e.tiles.map(r=>r.tile.label).join("")}</span>`).join("")}function B(n,e){return n.length===0?`<span class="empty-text">${e}</span>`:n.map(r=>`<span class="tile">${r.tile.label}</span>`).join("")}function de(n){var e;if(n.endResult)return fe(n.endResult);if(!n.currentActor)return"等待新对局开始。";if(n.currentActor==="player"){const r=n.player.hand.length===13?"请摸牌。":"请打出一张牌。";return`${((e=n.lastDiscard)==null?void 0:e.actor)==="computer"?"电脑已自动行动，":""}当前回合：玩家，${r}`}return"当前回合：电脑"}function fe(n){if(n.type==="exhaustive-draw")return"牌山摸完，本局流局。";const e=n.method==="tsumo"?"自摸":"荣和",r=n.yaku.map(t=>rn[t]).join("、");return`${en[n.winner]}${e}，役种：${r}`}function pe(n){const e=_(n,"player");if(e.canWin)return{method:"tsumo",evaluation:e};const r=X(n,"player");return r.canWin?{method:"ron",evaluation:r}:null}function ye(n){return{canChi:H(n,"player").length>0,canPon:I(n,"player")!==null,canOpenKan:b(n,"player")!==null,canClosedKan:x(n,"player").length>0}}function me(n){return n.player.hand.length+n.player.melds.reduce((e,r)=>e+(r.type==="open-kan"||r.type==="closed-kan"?3:r.tiles.length),0)}function he(n){return n.map(e=>rn[e]).join("、")}function ge(n){return n.status==="ended"||n.player.hand.length!==13?[]:g.filter(e=>S([...n.player.hand,{tile:e,copyIndex:1}],{method:"tsumo",melds:n.player.melds}).canWin).map(e=>e.label)}function ve(n){if(n.status==="ended")return"对局已结束";const e=ge(n);return e.length>0?`玩家听牌，待牌：${e.join("、")}`:"玩家未听牌"}function be(n,e){var r;return((r=n.endResult)==null?void 0:r.type)==="win"?`${en[n.endResult.winner]}已胡牌`:e?`玩家可${e.method==="tsumo"?"自摸":"荣和"}，役种：${he(e.evaluation.yaku)}`:"玩家当前不可胡"}function Te(n){const e=[n.canChi?"玩家可吃":null,n.canPon?"玩家可碰":null,n.canOpenKan?"玩家可明杠":null,n.canClosedKan?"玩家可暗杠":null].filter(r=>r!==null);return e.length>0?e.join("、"):"暂无可用副露"}function Ce(n){return n===null?"":`
    <section class="settlement-panel" aria-label="点数变化">
      <h2>点数变化</h2>
      <p>玩家：${F(n.delta.player)}，结算后 ${n.after.player} 点</p>
      <p>电脑：${F(n.delta.computer)}，结算后 ${n.after.computer} 点</p>
    </section>
  `}function F(n){return n>0?`+${n}`:String(n)}function $e(n,e){const r=e.dataset.tileId,t=e.dataset.copyIndex;if(r===void 0||t===void 0)return null;const i=Number(t);return n.player.hand.find(o=>o.tile.id===r&&o.copyIndex===i)??null}function we(n,e){const r=O(n,"player",e);return r.status!=="computer-turn"?r:ue(r)}function tn(n){return n.player.hand.length+n.player.melds.reduce((e,r)=>e+(r.type==="open-kan"||r.type==="closed-kan"?3:r.tiles.length),0)}function Ae(n){return n.status==="player-turn"&&n.currentActor==="player"&&tn(n)>13}function Pe(n){return n.status==="player-turn"&&n.currentActor==="player"&&tn(n)===13}function ke(n){const e=nn(n,"player");return e!==n?e:Z(n,"player")}function He(n){return b(n,"player")!==null?Wn(n,"player"):x(n,"player").length>0?Ln(n,"player"):n}function Ie(n,e){return e==="chi"?On(n,"player"):e==="pon"?Mn(n,"player"):e==="kan"?He(n):n}function xe(n,e){let r=e;const t=i=>{const o=i.target;if(!(o instanceof HTMLButtonElement))return;if(o.dataset.action==="new-game"){r=G(),s(n,r);return}if(o.dataset.action==="draw"){if(!Pe(r))return;r=V(r),s(n,r);return}if(o.dataset.action==="win"){const l=ke(r);if(l===r)return;r=l,s(n,r);return}if(o.dataset.action==="chi"||o.dataset.action==="pon"||o.dataset.action==="kan"){const l=Ie(r,o.dataset.action);if(l===r)return;r=l,s(n,r);return}if(!o.classList.contains("tile-button")||!Ae(r))return;const u=$e(r,o);u!==null&&(r=we(r,u),s(n,r))};return n.addEventListener("click",t),()=>n.removeEventListener("click",t)}const N=yn(),w=document.querySelector("#app");w&&(s(w,N),xe(w,N));
