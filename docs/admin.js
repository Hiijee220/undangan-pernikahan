import{auth,db}from"./firebase.js";
import{GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import{doc,getDoc,setDoc,deleteDoc}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const ADMIN="remajasilo.rs@gmail.com";
const keys=[["groom","Nama mempelai pria"],["bride","Nama mempelai wanita"],["greeting","Ayat / kutipan"],["date","Tanggal","date"],["time","Waktu"],["venue","Nama lokasi"],["address","Alamat"],["mapsUrl","Link Google Maps"],["story","Cerita / kalimat undangan","textarea"],["bankName","Nama bank"],["accountNumber","Nomor rekening"],["accountHolder","Nama pemilik rekening"]];
const defaults={theme:"forest",galleryIds:[]};let data={...defaults};
const $=s=>document.querySelector(s),status=(t,bad=false)=>{const el=$("#status");el.textContent=t;el.classList.toggle("error",bad)};

$("#loginBtn").onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>status(`Login gagal: ${e.message}`,true));
$("#logoutBtn").onclick=()=>signOut(auth);
onAuthStateChanged(auth,async user=>{const ok=user?.email?.toLowerCase()===ADMIN;$("#login").hidden=ok;$("#editor").hidden=!ok;$("#user").textContent=user?.email||"Silakan masuk";if(user&&!ok){await signOut(auth);alert("Akun ini bukan admin undangan.");return}if(ok){try{const snap=await getDoc(doc(db,"invitation","content"));data={...defaults,...(snap.exists()?snap.data():{})};render()}catch(e){status(`Data belum dapat dibuka: ${e.message}`,true)}}});

function esc(v=""){return String(v).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}
async function imageUrl(id){if(!id)return"";const snap=await getDoc(doc(db,"invitation",id));return snap.exists()?snap.data().dataUrl:""}
async function render(){
  $("#fields").innerHTML=keys.map(([k,l,t])=>`<label class="field"><span>${l}</span>${t==="textarea"?`<textarea name="${k}">${esc(data[k])}</textarea>`:`<input name="${k}" type="${t||"text"}" value="${esc(data[k])}">`}</label>`).join("");
  $("#theme").value=data.theme||"forest";document.body.dataset.theme=data.theme||"forest";
  const ids=data.galleryIds||[],urls=await Promise.all(ids.map(imageUrl));
  $("#thumbs").innerHTML=urls.map((url,i)=>`<div>${url?`<img src="${url}" alt="Galeri">`:""}<button type="button" data-del="${i}">Hapus</button></div>`).join("");
  document.querySelectorAll("[data-del]").forEach(btn=>btn.onclick=async()=>{const i=+btn.dataset.del,id=ids[i];if(id)await deleteDoc(doc(db,"invitation",id));data.galleryIds.splice(i,1);await setDoc(doc(db,"invitation","content"),data,{merge:true});await render()});
}

async function compress(file){
  const bitmap=await createImageBitmap(file),max=1400,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  let quality=.78,blob;do{blob=await new Promise(r=>canvas.toBlob(r,"image/webp",quality));quality-=.1}while(blob.size>650000&&quality>.38);
  if(!blob||blob.size>750000)throw new Error("Foto masih terlalu besar. Gunakan foto di bawah 8 MB.");
  return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)});
}
async function saveImage(id,file){const dataUrl=await compress(file);await setDoc(doc(db,"invitation",id),{dataUrl,updatedAt:new Date().toISOString()});return id}
async function upload(input,kind){const files=[...input.files];if(!files.length)return;try{status("Mengompres dan mengunggah foto...");if(kind==="gallery"){for(const file of files.slice(0,6-(data.galleryIds?.length||0))){const id=`gallery-${crypto.randomUUID()}`;await saveImage(id,file);data.galleryIds=[...(data.galleryIds||[]),id]}}else{await saveImage(kind,file);data[kind+"Id"]=kind}await setDoc(doc(db,"invitation","content"),data,{merge:true});await render();status("Foto berhasil diunggah dan langsung aktif.")}catch(e){status(e.message,true)}finally{input.value=""}}
$("#heroUpload").onchange=e=>upload(e.target,"hero");$("#coupleUpload").onchange=e=>upload(e.target,"couple");$("#galleryUpload").onchange=e=>upload(e.target,"gallery");
$("#theme").onchange=e=>{data.theme=e.target.value;document.body.dataset.theme=data.theme};
$("#copyBtn").onclick=async()=>{const name=$("#guestName").value.trim();if(!name)return status("Masukkan nama tamu terlebih dahulu.",true);const url=`${location.href.replace(/admin\.html.*$/,'')}?to=${encodeURIComponent(name)}`;await navigator.clipboard.writeText(url);status("Link tamu berhasil disalin.")};
$("#form").onsubmit=async e=>{e.preventDefault();try{new FormData(e.target).forEach((v,k)=>data[k]=v);data.theme=$("#theme").value;status("Menyimpan perubahan...");await setDoc(doc(db,"invitation","content"),data,{merge:true});status("Semua perubahan berhasil disimpan dan langsung tampil.")}catch(err){status(err.message,true)}};
