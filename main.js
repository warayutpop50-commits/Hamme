// LOY KRATHONG 2026 — mobile-first interactive experience
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = {name:"", photo:"", photoX:50, photoY:50, zoom:120, wish:"", decorations:[], viewX:0, viewY:0, launched:false};
const STORAGE_KEY = "loyKrathong2026_local";
const itemInfo = {
  marigold:{emoji:"🌼",name:"ดาวเรือง",spots:[[24,31],[76,31],[19,53],[81,53],[34,76],[66,76]]},
  jasmine:{emoji:"🌸",name:"มะลิ",spots:[[34,25],[66,25],[17,47],[83,47],[31,76],[69,76]]},
  hibiscus:{emoji:"🌺",name:"ชบา",spots:[[50,17],[22,42],[78,42],[30,72],[70,72]]},
  lotus:{emoji:"🪷",name:"ดอกบัว",spots:[[50,20],[20,50],[80,50],[50,79]]},
  whiteflower:{emoji:"💮",name:"ดอกไม้ขาว",spots:[[38,38],[62,38],[38,65],[62,65]]},
  candle:{emoji:"🕯️",name:"เทียน",spots:[[50,28],[28,50],[72,50],[50,72]]},
  lamp:{emoji:"🪔",name:"ประทีป",spots:[[35,31],[65,31],[25,66],[75,66]]},
  heart:{emoji:"💛",name:"หัวใจ",spots:[[50,38],[29,61],[71,61]]},
  sparkle:{emoji:"✨",name:"ประกาย",spots:[[25,25],[75,25],[15,65],[85,65]]},
  leaf:{emoji:"🌿",name:"ใบไม้",spots:[[20,35],[80,35],[28,70],[72,70]]}
};
const screens = ["homeScreen","profileScreen","builderScreen","wishScreen","riverScreen","friendsScreen"];
function go(id){screens.forEach(s=>$("#"+s).classList.toggle("active",s===id));window.scrollTo({top:0,behavior:"smooth"});}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),2200);}
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function photoMarkup(){return state.photo?`<img src="${state.photo}" alt="รูปของ ${escapeHTML(state.name)}" style="object-position:${state.photoX}% ${state.photoY}%;transform:scale(${state.zoom/100})">`:"<span>รูปคุณ</span>";}
function flowerArt(type){
 const palettes={
  marigold:['#fff1a1','#f3a928','#b96a16'], jasmine:['#fffdf0','#f4e9c9','#d9c99f'],
  hibiscus:['#ff9bb4','#e83f79','#a91e59'], lotus:['#ffc0d4','#ed6a9b','#a82d69'],
  whiteflower:['#fffef7','#eee7d5','#c9bfa7']
 };
 const c=palettes[type]; if(!c)return '';
 const petals=type==='marigold'?14:type==='jasmine'?9:type==='hibiscus'?5:type==='lotus'?10:8;
 const rx=type==='hibiscus'?17:type==='marigold'?11:13;
 const ry=type==='hibiscus'?24:type==='marigold'?19:22;
 const angle=360/petals;
 const outer=Array.from({length:petals},(_,i)=>`<ellipse cx="0" cy="-19" rx="${rx}" ry="${ry}" transform="rotate(${i*angle})" fill="url(#petal-${type})" stroke="${c[2]}" stroke-opacity=".38" stroke-width="1.2"/>`).join('');
 const inner=type==='lotus'?Array.from({length:7},(_,i)=>`<ellipse cx="0" cy="-11" rx="8" ry="16" transform="rotate(${i*51.4+25})" fill="#ffe1e9" opacity=".9"/>`).join(''):'';
 const center=type==='marigold'?'#8b4a12':type==='jasmine'||type==='whiteflower'?'#e8b84b':'#f8c84d';
 const pollen=Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9;return `<circle cx="${Math.cos(a)*5}" cy="${Math.sin(a)*5}" r="1.25" fill="#fff0a2"/>`}).join('');
 return `<svg viewBox="-42 -43 84 86" aria-hidden="true" focusable="false"><defs><radialGradient id="petal-${type}" cx="35%" cy="25%"><stop stop-color="${c[0]}"/><stop offset=".7" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient></defs><g>${outer}${inner}</g><circle r="8.5" fill="${center}" stroke="#fff1b4" stroke-width="1.5"/>${pollen}</svg>`;
}
function decorationMarkup(d){
 const flowers=['marigold','jasmine','hibiscus','lotus','whiteflower'];
 const art=flowers.includes(d.type)?flowerArt(d.type):itemInfo[d.type].emoji;
 return `<span class="placed-decor ${d.type}" style="left:${d.x}%;top:${d.y}%">${art}</span>`;
}
function modelMarkup(extraClass=""){
 const decos=state.decorations.map(decorationMarkup).join("");
 const safeId=extraClass.replace(/\\W/g,'')||'main';
 return `<div class="krathong-model ${extraClass}"><svg class="krathong-base" viewBox="0 0 420 420" role="img" aria-label="กระทงใบตองพับกลีบทรงดอกบัว">
 <defs>
  <linearGradient id="leaf-${safeId}" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#d0e58a"/><stop offset=".28" stop-color="#6d9d4e"/><stop offset=".72" stop-color="#28613b"/><stop offset="1" stop-color="#103a2a"/></linearGradient>
  <linearGradient id="rim-${safeId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0b5"/><stop offset=".2" stop-color="#d6a64e"/><stop offset=".53" stop-color="#9a682d"/><stop offset=".78" stop-color="#e5bd69"/><stop offset="1" stop-color="#70451f"/></linearGradient>
  <radialGradient id="bowl-${safeId}" cx="48%" cy="32%"><stop stop-color="#5f9651"/><stop offset=".55" stop-color="#28613d"/><stop offset="1" stop-color="#0b3027"/></radialGradient>
  <linearGradient id="shadow-${safeId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#061d16"/><stop offset="1" stop-color="#020e0d"/></linearGradient>
 </defs>
 <!-- soft cast shadow and woven banana-leaf petals -->
 <ellipse cx="210" cy="259" rx="176" ry="128" fill="#031b17" opacity=".52"/>
 <g stroke="#c2d987" stroke-width="2.4" stroke-linejoin="round">
  <path d="M210 218Q18 80 37 170Q83 258 210 218Z" fill="url(#leaf-${safeId})"/><path d="M210 218Q402 80 383 170Q337 258 210 218Z" fill="url(#leaf-${safeId})"/>
  <path d="M210 218Q72 12 139 23Q199 61 210 218Z" fill="url(#leaf-${safeId})"/><path d="M210 218Q348 12 281 23Q221 61 210 218Z" fill="url(#leaf-${safeId})"/>
  <path d="M210 218Q58 292 132 390Q197 330 210 218Z" fill="url(#leaf-${safeId})"/><path d="M210 218Q362 292 288 390Q223 330 210 218Z" fill="url(#leaf-${safeId})"/>
  <path d="M210 218Q112 52 175 38Q207 91 210 218Z" fill="#477c43"/><path d="M210 218Q308 52 245 38Q213 91 210 218Z" fill="#477c43"/>
 </g>
 <g fill="none" stroke="#d7e7a0" stroke-width="2" opacity=".72"><path d="M210 218L37 170M210 218L383 170M210 218L139 23M210 218L281 23M210 218L132 390M210 218L288 390"/><path d="M210 218L175 38M210 218L245 38" opacity=".55"/></g>
 <!-- deep folded bowl and layered raised rim -->
 <ellipse cx="210" cy="232" rx="151" ry="116" fill="url(#shadow-${safeId})" opacity=".9"/>
 <ellipse cx="210" cy="214" rx="148" ry="119" fill="url(#rim-${safeId})" stroke="#f8df9a" stroke-width="3"/>
 <ellipse cx="210" cy="207" rx="133" ry="105" fill="#173f2d" stroke="#f6d98c" stroke-width="4"/>
 <ellipse cx="210" cy="202" rx="119" ry="91" fill="url(#bowl-${safeId})" stroke="#9a7139" stroke-width="8"/>
 <ellipse cx="210" cy="197" rx="108" ry="81" fill="none" stroke="#e8c778" stroke-width="3" opacity=".9"/>
 <!-- folded inner banana-leaf braid -->
 <g fill="none" stroke="#c7d98a" stroke-width="3" opacity=".78"><path d="M111 180Q210 118 309 180"/><path d="M111 220Q210 280 309 220"/><path d="M135 151Q210 115 285 151" stroke="#f4dda0" stroke-width="2"/><path d="M135 246Q210 282 285 246" stroke="#f4dda0" stroke-width="2"/></g>
 <g fill="#f7e7b7" stroke="#fff4d3" stroke-width="2"><ellipse cx="210" cy="130" rx="9" ry="20"/><ellipse cx="210" cy="263" rx="9" ry="20"/><ellipse cx="143" cy="197" rx="20" ry="9"/><ellipse cx="277" cy="197" rx="20" ry="9"/><ellipse cx="163" cy="151" rx="9" ry="20" transform="rotate(-45 163 151)"/><ellipse cx="257" cy="151" rx="9" ry="20" transform="rotate(45 257 151)"/><ellipse cx="163" cy="243" rx="9" ry="20" transform="rotate(45 163 243)"/><ellipse cx="257" cy="243" rx="9" ry="20" transform="rotate(-45 257 243)"/></g>
 <ellipse cx="210" cy="198" rx="39" ry="32" fill="url(#rim-${safeId})" stroke="#ffeab0" stroke-width="3"/><ellipse cx="210" cy="194" rx="27" ry="21" fill="#f6d98b" stroke="#b27c38" stroke-width="2"/>
 <ellipse cx="210" cy="187" rx="18" ry="9" fill="#fff0c2" opacity=".35"/>
 </svg><div class="decor-layer">${decos}</div><div class="owner-medallion"><div class="owner-photo">${photoMarkup()}</div><b>${escapeHTML(state.name||"คุณ")}</b></div></div>`;
}
function updateModel(){
  // Re-render the complete model. The photo and owner name are already
  // included by modelMarkup(), so do not query child IDs that get replaced.
  const model = $("#krathongModel");
  if (model) model.innerHTML = modelMarkup();

  const count = $("#decorCount");
  if (count) count.textContent = state.decorations.length + " ชิ้น";

  const chips = $("#selectedChips");
  if (chips) {
    chips.innerHTML = state.decorations.length
      ? state.decorations.map((d,i)=>`<button class="chip" data-remove="${i}">${itemInfo[d.type].emoji} ${itemInfo[d.type].name} ×</button>`).join("")
      : "<small>ยังไม่ได้เลือกของตกแต่ง</small>";
  }
}
function addDecoration(type){const info=itemInfo[type];const used=state.decorations.filter(d=>d.type===type).length;const spot=info.spots[used%info.spots.length];state.decorations.push({type,x:spot[0],y:spot[1]});updateModel();toast("เพิ่ม"+info.name+"บนกระทงแล้ว");}
function setPhotoPosition(){ $$(".owner-photo").forEach(el=>{const img=$("img",el);if(img){img.style.objectPosition=`${state.photoX}% ${state.photoY}%`;img.style.transform=`scale(${state.zoom/100})`;}});const preview=$("#profilePreview");if(state.photo){preview.innerHTML=`<img src="${state.photo}" style="object-position:${state.photoX}% ${state.photoY}%;transform:scale(${state.zoom/100})">`;} }
function saveLocal(item){let list=[];try{list=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{};list.unshift(item);localStorage.setItem(STORAGE_KEY,JSON.stringify(list.slice(0,60)));return list;}
function getSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}}
function makeKrathongCard(item, mine=false){const old={...state};state.name=item.name;state.photo=item.photo;state.photoX=item.photoX??50;state.photoY=item.photoY??50;state.zoom=item.zoom??120;state.decorations=item.decorations||[];const html=modelMarkup();Object.assign(state,old);return `<div class="river-krathong ${mine?"mine":""}" data-id="${escapeHTML(item.id)}">${html}</div>`;}
function showFloating(){const layer=$("#floatingLayer");const list=getSaved();$("#friendsCount").textContent=list.length;$("#riverEmpty").style.display=list.length?"none":"flex";layer.innerHTML=list.map((it,i)=>makeKrathongCard(it,it.id===state.lastId)).join("");$$(".river-krathong",layer).forEach((el,i)=>{el.style.top=(8+(i*29)%74)+"%";el.style.setProperty("--duration",(21+(i%5)*4)+"s");el.addEventListener("click",()=>openDetail(list.find(x=>x.id===el.dataset.id)));el.addEventListener("animationiteration",()=>{el.style.top=(8+Math.random()*74)+"%";});});}
function renderDragSource(){const source=$("#dragSource");source.innerHTML=modelMarkup();source.dataset.launched=state.launched?"true":"false";source.style.opacity=state.launched?".25":"1";source.style.pointerEvents=state.launched?"none":"auto";}
function openDetail(item){if(!item)return;const old={...state};state.name=item.name;state.photo=item.photo;state.photoX=item.photoX??50;state.photoY=item.photoY??50;state.zoom=item.zoom??120;state.decorations=item.decorations||[];$("#detailKrathong").innerHTML=modelMarkup();Object.assign(state,old);$("#detailName").textContent=item.name;$("#detailWish").textContent=item.wish||"เจ้าของกระทงยังไม่ได้เขียนคำอธิษฐาน";$("#detailDate").textContent=new Date(item.date).toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"});$("#detailOverlay").classList.add("open");$("#detailOverlay").setAttribute("aria-hidden","false");}
function closeDetail(){$("#detailOverlay").classList.remove("open");$("#detailOverlay").setAttribute("aria-hidden","true");}
function renderFriends(){const list=getSaved();$("#friendsGrid").innerHTML=list.length?list.map(it=>`<button class="friend-tile" data-id="${escapeHTML(it.id)}"><span class="friend-mini">${makeMini(it)}</span><span><strong>${escapeHTML(it.name)}</strong><small>แตะเพื่ออ่านคำอธิษฐาน</small></span></button>`).join(""):`<div class="empty-friends"><span>🪷</span><p>ยังไม่มีกระทงลอยอยู่ในเบราว์เซอร์นี้</p></div>`;$$(".friend-tile").forEach(b=>b.onclick=()=>openDetail(list.find(x=>x.id===b.dataset.id)));}
function makeMini(item){const old={...state};state.name=item.name;state.photo=item.photo;state.photoX=item.photoX??50;state.photoY=item.photoY??50;state.zoom=item.zoom??120;state.decorations=item.decorations||[];const h=modelMarkup();Object.assign(state,old);return h;}
function launch(){if(state.launched)return;const item={id:"wish-"+Date.now()+"-"+Math.random().toString(16).slice(2),name:state.name,photo:state.photo,photoX:state.photoX,photoY:state.photoY,zoom:state.zoom,wish:state.wish,decorations:JSON.parse(JSON.stringify(state.decorations)),date:new Date().toISOString()};state.lastId=item.id;saveLocal(item);state.launched=true;$("#riverOwnerName").textContent=state.name;renderDragSource();showFloating();toast("กระทงของคุณลอยสู่สายน้ำแล้ว ✨");const r=$("#riverWater").getBoundingClientRect();for(let i=0;i<15;i++){const sp=document.createElement("span");sp.className="sparkle-burst";sp.textContent=i%2?"✦":"✧";sp.style.left=(15+Math.random()*70)+"%";sp.style.top=(20+Math.random()*60)+"%";$("#riverWater").append(sp);setTimeout(()=>sp.remove(),1600);}const ripple=document.createElement("div");ripple.className="launch-ripple";ripple.style.left="50%";ripple.style.top="50%";$("#riverWater").append(ripple);setTimeout(()=>ripple.remove(),1600);$("#riverEmpty").style.display="none";$("#friendsCount").textContent=getSaved().length;}
function setupRiverDrag(){const source=$("#dragSource");let active=false,pid=null,start={x:0,y:0,left:0,top:0};source.addEventListener("pointerdown",e=>{if(state.launched||active)return;e.preventDefault();active=true;pid=e.pointerId;const r=source.getBoundingClientRect();start={x:e.clientX,y:e.clientY,left:r.left,top:r.top};source.style.position="fixed";source.style.left=r.left+"px";source.style.top=r.top+"px";source.style.width=r.width+"px";source.style.height=r.height+"px";source.style.margin="0";source.style.zIndex="2000";source.classList.add("dragging");source.setPointerCapture(pid);});source.addEventListener("pointermove",e=>{if(!active||e.pointerId!==pid)return;e.preventDefault();source.style.left=(start.left+e.clientX-start.x)+"px";source.style.top=(start.top+e.clientY-start.y)+"px";});function finish(e){if(!active||e.pointerId!==pid)return;active=false;const w=$("#riverWater").getBoundingClientRect(),r=source.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;source.classList.remove("dragging");source.style.position="";source.style.left="";source.style.top="";source.style.width="";source.style.height="";source.style.margin="";source.style.zIndex="";pid=null;if(x>=w.left&&x<=w.right&&y>=w.top&&y<=w.bottom){launch();}else toast("ลองลากกระทงให้ลงบนผิวน้ำอีกครั้งนะ");}source.addEventListener("pointerup",finish);source.addEventListener("pointercancel",e=>{if(!active)return;active=false;pid=null;source.classList.remove("dragging");source.removeAttribute("style");renderDragSource();});}
function setupViewer(){const viewer=$("#krathongViewer"),tilt=$("#krathongTilt");let down=false,sx=0,sy=0,rx=0,ry=0;viewer.addEventListener("pointerdown",e=>{down=true;sx=e.clientX;sy=e.clientY;viewer.setPointerCapture(e.pointerId);});viewer.addEventListener("pointermove",e=>{if(!down)return;ry=Math.max(-32,Math.min(32,ry+(e.clientX-sx)*.35));rx=Math.max(-24,Math.min(24,rx-(e.clientY-sy)*.25));sx=e.clientX;sy=e.clientY;tilt.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;});["pointerup","pointercancel"].forEach(ev=>viewer.addEventListener(ev,()=>down=false));$("#rotateLeft").onclick=()=>{ry-=25;tilt.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`};$("#rotateRight").onclick=()=>{ry+=25;tilt.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`};$("#resetView").onclick=()=>{rx=0;ry=0;tilt.style.transform="";};}
$("#beginBtn").onclick=()=>go("profileScreen");
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
$("#profileInput").addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith("image/"))return toast("กรุณาเลือกไฟล์รูปภาพ");if(f.size>6*1024*1024)return toast("รูปภาพต้องมีขนาดไม่เกิน 6 MB");const reader=new FileReader();reader.onload=()=>{state.photo=reader.result;setPhotoPosition();};reader.readAsDataURL(f);});
$("#toBuilderBtn").onclick=()=>{state.name=$("#nicknameInput").value.trim();if(!state.name)return toast("กรุณากรอกชื่อก่อนนะ");$("#riverOwnerName").textContent=state.name;updateModel();go("builderScreen");};
$$(".decor-option").forEach(b=>b.onclick=()=>addDecoration(b.dataset.item));
$("#selectedChips").onclick=e=>{const b=e.target.closest("[data-remove]");if(!b)return;state.decorations.splice(Number(b.dataset.remove),1);updateModel();};
$("#clearDecor").onclick=()=>{state.decorations=[];updateModel();toast("ล้างของตกแต่งแล้ว");};
$("#photoZoom").oninput=e=>{state.zoom=Number(e.target.value);setPhotoPosition();updateModel();};
$("#cropLeft").onclick=()=>{state.photoX=Math.max(0,state.photoX-5);setPhotoPosition();updateModel();};
$("#cropRight").onclick=()=>{state.photoX=Math.min(100,state.photoX+5);setPhotoPosition();updateModel();};
$("#cropUp").onclick=()=>{state.photoY=Math.max(0,state.photoY-5);setPhotoPosition();updateModel();};
$("#cropDown").onclick=()=>{state.photoY=Math.min(100,state.photoY+5);setPhotoPosition();updateModel();};
$("#toWishBtn").onclick=()=>go("wishScreen");
$("#wishInput").oninput=e=>$("#wishCount").textContent=e.target.value.length+"/240";
$("#toRiverBtn").onclick=()=>{state.wish=$("#wishInput").value.trim();if(!state.wish)return toast("เขียนคำอธิษฐานก่อนนะ");state.launched=false;go("riverScreen");$("#riverOwnerName").textContent=state.name;renderDragSource();showFloating();};
$("#friendsBtn").onclick=()=>{renderFriends();go("friendsScreen");};
$("#closeDetail").onclick=closeDetail;$("#detailOverlay").addEventListener("click",e=>{if(e.target.id==="detailOverlay")closeDetail();});
setupViewer();setupRiverDrag();updateModel();
