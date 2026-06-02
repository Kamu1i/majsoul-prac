(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function c(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=c(e);fetch(e.href,t)}})();function u(){return{status:"not-started",title:"单人 PVE 麻将模拟器",subtitle:"模块化结构已建立"}}function l(o,r){o.innerHTML=`
    <main class="app-shell" data-status="${r.status}">
      <h1>${r.title}</h1>
      <p>${r.subtitle}</p>
    </main>
  `}const a=u(),s=document.querySelector("#app");s&&l(s,a);
