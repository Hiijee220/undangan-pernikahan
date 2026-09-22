import{auth,db}from"./firebase.js";
import{GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import{doc,getDoc,setDoc,deleteDoc}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const ADMIN="remajasilo.rs@gmail.com";
const keys=[["groom","Nama mempelai pria"],["bride","Nama mempelai wanita"],["initials","Singkatan nama (contoh: J & C)"],["greeting","Teks ayat Alkitab","textarea"],["verseReference","Sumber ayat (contoh: Pengkhotbah 3:11)"],["date","Tanggal","date"],["time","Waktu"],["venue","Nama lokasi"],["address","Alamat"],["mapsUrl","Link Google Maps"],["story","Cerita / kalimat undangan","textarea"],["musicTitle","Judul musik"],["musicUrl","Link musik MP3, OGG, atau YouTube"],["bankName","Nama bank"],["accountNumber","Nomor rekening"],["accountHolder","Nama pemilik rekening"]];
const defaults={bride:"Charine",groom:"Jeivan",initials:"J & C",greeting:"Tuhan membuat segala sesuatu indah pada waktunya.",verseReference:"Pengkhotbah 3:11",date:"2026-12-12",time:"14.00 WITA",venue:"Gereja & Aula Pernikahan",address:"Manado, Sulawesi Utara",mapsUrl:"https://www.google.com/maps/search/?api=1&query=Manado%2C%20Sulawesi%20Utara",story:"Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir, mendoakan, dan menjadi bagian dari hari bahagia kami.",musicTitle:"Wedding March — Mendelssohn",musicUrl:"https://upload.wikimedia.org/wikipedia/commons/c/cb/A_Midsummer_Night%27s_Dream_Op._61_Wedding_March_%28Mendelssohn%29_European_Archive.ogg",bankName:"Bank Mandiri",accountNumber:"0000 0000 0000",accountHolder:"Jeivan S. Momongan",theme:"forest",galleryIds:[],heroId:"hero",coupleId:"couple"};let data={...defaults};
const $=s=>document.querySelector(s),status=(t,bad=false)=>{const el=$("#status");el.textContent=t;el.classList.toggle("error",bad)};

$("#loginBtn").onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>status(`Login gagal: ${e.message}`,true));
$("#logoutBtn").onclick=()=>signOut(auth);
onAuthStateChanged(auth,async user=>{const ok=user?.email?.toLowerCase()===ADMIN;$("#login").hidden=ok;$("#editor").hidden=!ok;$("#user").textContent=user?.email||"Silakan masuk";if(user&&!ok){await signOut(auth);alert("Akun ini bukan admin undangan.");return}if(ok){try{const snap=await getDoc(doc(db,"invitation","content"));const saved=snap.exists()?snap.data():{};data={...defaults};for(const[k,v]of Object.entries(saved))if(v!==""&&v!==null&&v!==undefined)data[k]=v;await render()}catch(e){status(`Data belum dapat dibuka: ${e.message}`,true)}}});

function esc(v=""){return String(v).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}
async function imageUrl(id){if(!id)return"";try{const snap=await getDoc(doc(db,"invitation",id));return snap.exists()?snap.data().dataUrl||"":""}catch{return""}}
async function render(){
  $("#fields").innerHTML=keys.map(([k,l,t])=>`<label class="field"><span>${l}</span>${t==="textarea"?`<textarea name="${k}">${esc(data[k])}</textarea>`:`<input name="${k}" type="${t||"text"}" value="${esc(data[k])}">`}</label>`).join("");
  $("#theme").value=data.theme||"forest";document.documentElement.dataset.theme=data.theme||"forest";
  const [heroUrl,coupleUrl]=await Promise.all([imageUrl(data.heroId||"hero"),imageUrl(data.coupleId||"couple")]);
  [["#heroPreview",heroUrl],["#couplePreview",coupleUrl]].forEach(([selector,url])=>{const preview=$(selector);preview.hidden=!url;if(url)preview.src=url});
  const ids=data.galleryIds||[],urls=await Promise.all(ids.map(imageUrl));
  $("#thumbs").innerHTML=urls.map((url,i)=>`<div>${url?`<img src="${url}" alt="Galeri">`:""}<button type="button" data-del="${i}">Hapus</button></div>`).join("");
  document.querySelectorAll("[data-del]").forEach(btn=>btn.onclick=async()=>{const i=+btn.dataset.del,id=ids[i];if(id)await deleteDoc(doc(db,"invitation",id));data.galleryIds.splice(i,1);await setDoc(doc(db,"invitation","content"),data,{merge:true});await render()});
}

const MAX_INPUT_SIZE=10*1024*1024;
function loadPhoto(uploadFile){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error("Foto tidak dapat dibaca."));reader.onload=()=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Format foto tidak didukung. Gunakan JPG, PNG, atau WebP."));image.src=reader.result};reader.readAsDataURL(uploadFile)})}
function canvasBlob(canvas,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Foto gagal dikompres.")),"image/jpeg",quality))}
async function compress(uploadFile){
  if(!uploadFile)throw new Error("Tidak ada foto yang dipilih.");
  if(uploadFile.size>MAX_INPUT_SIZE)throw new Error(`Ukuran ${uploadFile.name} melebihi batas 10 MB.`);
  const image=await loadPhoto(uploadFile),max=1600,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const context=canvas.getContext("2d");context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  let quality=.82,blob=await canvasBlob(canvas,quality);while(blob.size>620000&&quality>.32){quality-=.1;blob=await canvasBlob(canvas,quality)}
  if(blob.size>700000)throw new Error("Foto tidak dapat diperkecil. Coba gunakan foto lain.");
  return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Hasil foto tidak dapat diproses."));reader.readAsDataURL(blob)});
}
function uniqueId(){return window.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`}
async function saveImage(id,uploadFile){const dataUrl=await compress(uploadFile);await setDoc(doc(db,"invitation",id),{dataUrl,updatedAt:new Date().toISOString()});return id}
async function upload(input,kind){const selectedFiles=Array.from(input.files||[]);if(!selectedFiles.length)return;try{const allowed=kind==="gallery"?selectedFiles.slice(0,Math.max(0,6-(data.galleryIds?.length||0))):selectedFiles.slice(0,1);if(!allowed.length)throw new Error("Galeri sudah berisi maksimal 6 foto.");for(let i=0;i<allowed.length;i++){const uploadFile=allowed[i];status(`Memproses foto ${i+1}/${allowed.length} (${(uploadFile.size/1048576).toFixed(1)} MB)...`);if(kind==="gallery"){const id=`gallery-${uniqueId()}`;await saveImage(id,uploadFile);data.galleryIds=[...(data.galleryIds||[]),id]}else{await saveImage(kind,uploadFile);data[kind+"Id"]=kind}}await setDoc(doc(db,"invitation","content"),data,{merge:true});await render();status("Foto berhasil diunggah dan langsung aktif.")}catch(error){console.error(error);status(error?.message||"Foto gagal diunggah.",true)}finally{input.value=""}}
$("#heroUpload").onchange=e=>upload(e.target,"hero");$("#coupleUpload").onchange=e=>upload(e.target,"couple");$("#galleryUpload").onchange=e=>upload(e.target,"gallery");
$("#theme").onchange=e=>{data.theme=e.target.value;document.documentElement.dataset.theme=data.theme};
$("#copyBtn").onclick=async()=>{const name=$("#guestName").value.trim();if(!name)return status("Masukkan nama tamu terlebih dahulu.",true);const url=`${location.href.replace(/admin\.html.*$/,'')}?to=${encodeURIComponent(name)}`;await navigator.clipboard.writeText(url);status("Link tamu berhasil disalin.")};
$("#form").onsubmit=async e=>{e.preventDefault();try{new FormData(e.target).forEach((v,k)=>data[k]=v);data.theme=$("#theme").value;status("Menyimpan perubahan...");await setDoc(doc(db,"invitation","content"),data,{merge:true});status("Semua perubahan berhasil disimpan dan langsung tampil.")}catch(err){status(err.message,true)}};
