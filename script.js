const COLS=[{id:"prospek",t:"Prospek"},{id:"nego",t:"Negosiasi"},{id:"proses",t:"Diproses"},{id:"kirim",t:"Dikirim"},{id:"lunas",t:"Lunas"}];
const KEY="kanban-umkm-v1";
const SAMPLE=[
 {id:1,nama:"Bu Sari",produk:"Keripik tempe 50 bungkus",nilai:750000,status:"prospek"},
 {id:2,nama:"Kafe Senja",produk:"Kopi bubuk 20 kg",nilai:2400000,status:"nego"},
 {id:3,nama:"Pak Dedi",produk:"Sambal botol 100 pcs",nilai:1500000,status:"proses"},
 {id:4,nama:"Toko Maju",produk:"Kerupuk udang 30 kg",nilai:1350000,status:"kirim"},
 {id:5,nama:"Katering Ibu Rina",produk:"Bumbu rendang 40 pak",nilai:1200000,status:"lunas"}
];
let cards=load(), editId=null, dragId=null, q="";
const $=s=>document.querySelector(s);
const rp=n=>"Rp"+Number(n).toLocaleString("id-ID");

function load(){
  try{const r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);if(Array.isArray(d))return d}}catch(e){}
  return SAMPLE.map(c=>({...c}));
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cards))}catch(e){}}
function h(tag,props={},...kids){
  const el=document.createElement(tag);
  for(const k in props){if(k==="class")el.className=props[k];else if(k.startsWith("on"))el.addEventListener(k.slice(2),props[k]);else el.setAttribute(k,props[k])}
  kids.forEach(x=>el.append(x));return el;
}
function move(id,to){const c=cards.find(x=>x.id===id);if(c&&c.status!==to){c.status=to;save();render()}}

function render(){
  const b=$("#board");b.replaceChildren();
  const f=q.toLowerCase();
  COLS.forEach((col,i)=>{
    const list=cards.filter(c=>c.status===col.id&&(c.nama+" "+c.produk).toLowerCase().includes(f));
    const total=list.reduce((s,c)=>s+Number(c.nilai),0);
    const el=h("section",{class:"col",style:"--cc:var(--c"+i+")","aria-label":col.t});
    el.append(h("h2",{},col.t,h("span",{},String(list.length))),h("p",{class:"sum"},rp(total)));
    if(!list.length)el.append(h("div",{class:"empty"},"Belum ada pesanan"));
    list.forEach(c=>el.append(cardEl(c,i)));
    el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("over")});
    el.addEventListener("dragleave",()=>el.classList.remove("over"));
    el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("over");if(dragId!=null)move(dragId,col.id)});
    b.append(el);
  });
  $("#omzet").textContent=rp(cards.filter(c=>c.status==="lunas").reduce((s,c)=>s+Number(c.nilai),0));
}
function cardEl(c,i){
  const el=h("article",{class:"card",draggable:"true"});
  el.addEventListener("dragstart",()=>{dragId=c.id;el.classList.add("drag")});
  el.addEventListener("dragend",()=>{dragId=null;el.classList.remove("drag")});
  const prev=h("button",{"aria-label":"Pindah ke tahap sebelumnya",onclick:()=>move(c.id,COLS[i-1].id)},"←");
  const next=h("button",{"aria-label":"Pindah ke tahap berikutnya",onclick:()=>move(c.id,COLS[i+1].id)},"→");
  if(i===0)prev.disabled=true;if(i===COLS.length-1)next.disabled=true;
  el.append(h("strong",{},c.nama),h("span",{class:"p"},c.produk),h("div",{class:"v"},rp(c.nilai)),
    h("div",{class:"acts"},prev,h("div",{class:"r"},
      h("button",{onclick:()=>openForm(c)},"Ubah"),
      h("button",{class:"del",onclick:()=>{if(confirm("Hapus pesanan "+c.nama+"?")){cards=cards.filter(x=>x.id!==c.id);save();render()}}},"Hapus"),next)));
  return el;
}
function openForm(c){
  editId=c?c.id:null;
  $("#jdl").textContent=c?"Ubah pesanan":"Pesanan baru";
  $("#fn").value=c?c.nama:"";$("#fp").value=c?c.produk:"";$("#fv").value=c?c.nilai:"";
  $("#fs").value=c?c.status:"prospek";
  $("#dlg").showModal();$("#fn").focus();
}
COLS.forEach(c=>$("#fs").append(h("option",{value:c.id},c.t)));
$("#frm").addEventListener("submit",()=>{
  const d={nama:$("#fn").value.trim(),produk:$("#fp").value.trim(),nilai:Math.max(0,Number($("#fv").value)||0),status:$("#fs").value};
  if(!d.nama||!d.produk)return;
  if(editId!=null)Object.assign(cards.find(x=>x.id===editId),d);
  else cards.push({id:Date.now(),...d});
  save();render();
});
$("#batal").onclick=()=>$("#dlg").close();
$("#tambah").onclick=()=>openForm(null);
$("#cari").oninput=e=>{q=e.target.value;render()};
$("#reset").onclick=()=>{if(confirm("Ganti semua data dengan contoh data?")){cards=SAMPLE.map(c=>({...c}));save();render()}};
render();
