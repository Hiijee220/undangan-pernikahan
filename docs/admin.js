import{auth,db}from"./firebase.js";
import{GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,setPersistence,browserLocalPersistence,signInWithEmailAndPassword,sendPasswordResetEmail}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import{doc,getDoc,setDoc,deleteDoc}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const fieldGroups=[
  ["Sampul & Nama Tamu",[["groom","Nama pendek mempelai pria"],["bride","Nama pendek mempelai wanita"],["initials","Singkatan nama (contoh: B & J)"],["weddingLabel","Tulisan The Wedding of"],["guestHeading","Sapaan tamu"],["guestNote","Catatan nama tamu","textarea"],["openButtonText","Tulisan tombol buka"]]],
  ["Ayat Alkitab",[["greeting","Isi ayat pembuka","textarea"],["verseReference","Sumber ayat pembuka"],["secondVerse","Isi ayat kedua","textarea"],["secondVerseReference","Sumber ayat kedua"]]],
  ["Mempelai Pria",[["groomRole","Label mempelai pria"],["groomFullName","Nama lengkap mempelai pria"],["groomParents","Nama orang tua mempelai pria","textarea"],["groomInstagramLabel","Tulisan Instagram pria"],["groomInstagramUrl","Link Instagram pria","url"]]],
  ["Mempelai Wanita",[["brideRole","Label mempelai wanita"],["brideFullName","Nama lengkap mempelai wanita"],["brideParents","Nama orang tua mempelai wanita","textarea"],["brideInstagramLabel","Tulisan Instagram wanita"],["brideInstagramUrl","Link Instagram wanita","url"]]],
  ["Pengantar Mempelai",[["coupleLabel","Tulisan The Groom & The Bride"],["coupleTitle","Judul bagian mempelai"],["story","Kalimat undangan","textarea"]]],
  ["Tanggal Utama",[["eventLabel","Tulisan Save the date"],["eventTitle","Judul bagian acara"],["date","Tanggal pernikahan","date"],["eventStartTime","Jam mulai untuk hitung mundur","time"],["mapsButtonText","Tulisan tombol Maps"]]],
  ["Acara Pemberkatan",[["ceremonyTitle","Nama acara"],["ceremonyTime","Waktu pemberkatan"],["ceremonyVenue","Nama tempat pemberkatan"],["ceremonyAddress","Alamat pemberkatan","textarea"],["ceremonyMapsUrl","Link Google Maps pemberkatan","url"]]],
  ["Acara Resepsi",[["receptionTitle","Nama acara"],["receptionTime","Waktu resepsi"],["receptionVenue","Nama tempat resepsi"],["receptionAddress","Alamat resepsi","textarea"],["receptionMapsUrl","Link Google Maps resepsi","url"]]],
  ["Galeri",[["galleryLabel","Tulisan Our Gallery"],["galleryTitle","Judul galeri"]]],
  ["Cerita 1",[["journey1Year","Tahun / tanggal cerita 1"],["journey1Title","Judul cerita 1"],["journey1Text","Isi cerita 1","textarea"]]],
  ["Cerita 2",[["journey2Year","Tahun / tanggal cerita 2"],["journey2Title","Judul cerita 2"],["journey2Text","Isi cerita 2","textarea"]]],
  ["Cerita 3",[["journey3Year","Tahun / tanggal cerita 3"],["journey3Title","Judul cerita 3"],["journey3Text","Isi cerita 3","textarea"]]],
  ["Judul Cerita",[["journeyLabel","Tulisan Our Story"],["journeyTitle","Judul bagian cerita"]]],
  ["Hadiah & Rekening",[["giftLabel","Tulisan Wedding Gift"],["giftTitle","Judul hadiah"],["giftText","Pesan hadiah","textarea"],["showAccountText","Tombol lihat rekening"],["hideAccountText","Tombol sembunyikan rekening"],["bankName","Nama bank"],["accountNumber","Nomor rekening"],["accountPrefix","Awalan pemilik (a.n.)"],["accountHolder","Nama pemilik rekening"],["copyAccountText","Tulisan salin rekening"]]],
  ["Konfirmasi Hadiah",[["giftConfirmationText","Tulisan tombol konfirmasi"],["giftWhatsappNumber","Nomor WhatsApp (awali 62)"],["giftWhatsappMessage","Pesan WhatsApp hadiah","textarea"]]],
  ["Ucapan & RSVP",[["rsvpLabel","Tulisan Ucapan & RSVP"],["rsvpTitle","Judul RSVP"],["rsvpText","Penjelasan RSVP","textarea"],["rsvpButtonText","Tulisan tombol kirim"]]],
  ["Musik",[["musicTitle","Judul musik"],["musicUrl","Link MP3, OGG, YouTube, atau Google Drive","url"]]],
  ["Penutup & Sosial Media",[["closingLabel","Tulisan penutup"],["footerText","Ucapan terima kasih","textarea"],["closingCredit","Tulisan kecil paling bawah"],["whatsappUrl","Link WhatsApp","url"],["instagramUrl","Link Instagram","url"]]],
  ["Menu & Hitung Mundur",[["navHome","Menu Home"],["navCouple","Menu Kami"],["navEvent","Menu Acara"],["navGallery","Menu Galeri"],["navGift","Menu Hadiah"],["countdownDay","Label hari"],["countdownHour","Label jam"],["countdownMinute","Label menit"],["countdownSecond","Label detik"]]]
];

const defaults={
  groom:"Benvica",bride:"Jeyta",initials:"B & J",weddingLabel:"The Wedding of",guestHeading:"Kepada Yth.",guestNote:"Mohon maaf apabila ada kesalahan penulisan nama atau gelar",openButtonText:"Buka Undangan",
  greeting:"Tuhan membuat segala sesuatu indah pada waktunya.",verseReference:"Pengkhotbah 3:11",secondVerse:"Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",secondVerseReference:"Matius 19:6",
  coupleLabel:"The Groom & The Bride",coupleTitle:"Mempelai",story:"Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir, mendoakan, dan menjadi bagian dari hari bahagia kami.",
  groomRole:"Mempelai Pria",groomFullName:"Harly Benvica Tombeng",groomParents:"Putra dari Bapak ... & Ibu ...",groomInstagramLabel:"Instagram mempelai pria",groomInstagramUrl:"",brideRole:"Mempelai Wanita",brideFullName:"Jeyta",brideParents:"Putri dari Bapak ... & Ibu ...",brideInstagramLabel:"Instagram mempelai wanita",brideInstagramUrl:"",
  eventLabel:"Save the date",eventTitle:"Hari Bahagia Kami",date:"2026-10-03",eventStartTime:"14:00",mapsButtonText:"Google Maps",
  ceremonyTitle:"Pemberkatan",ceremonyTime:"14.00 WITA - Selesai",ceremonyVenue:"Gereja",ceremonyAddress:"Watuliney Tengah, Kecamatan Belang",ceremonyMapsUrl:"https://maps.app.goo.gl/oXJB7VAhikkaxsZ26",
  receptionTitle:"Resepsi",receptionTime:"18.00 WITA - Selesai",receptionVenue:"Kediaman Mempelai",receptionAddress:"Watuliney Tengah, Kecamatan Belang",receptionMapsUrl:"https://maps.app.goo.gl/oXJB7VAhikkaxsZ26",
  galleryLabel:"Our Gallery",galleryTitle:"Galeri Kasih",journeyLabel:"Our Story",journeyTitle:"Cerita Kami",journey1Year:"2022",journey1Title:"Awal Bertemu",journey1Text:"Dua pribadi dipertemukan dalam rencana Tuhan yang indah.",journey2Year:"2025",journey2Title:"Lamaran",journey2Text:"Hari demi hari, kasih dan keyakinan kami semakin dikuatkan.",journey3Year:"2026",journey3Title:"Pernikahan",journey3Text:"Kini kami melangkah bersama dalam ikatan pernikahan kudus.",
  giftLabel:"Wedding Gift",giftTitle:"Tanda Kasih",giftText:"Doa dan kehadiran Anda adalah hadiah terindah. Jika ingin memberikan tanda kasih, dapat melalui fitur berikut.",showAccountText:"Lihat Rekening",hideAccountText:"Sembunyikan Rekening",copyAccountText:"Salin Rekening",giftConfirmationText:"Konfirmasi Hadiah",bankName:"Bank Mandiri",accountNumber:"",accountPrefix:"a.n.",accountHolder:"",giftWhatsappNumber:"",giftWhatsappMessage:"Halo, saya ingin mengonfirmasi hadiah pernikahan.",
  rsvpLabel:"Ucapan & RSVP",rsvpTitle:"Doa dan Kehadiran",rsvpText:"Tuliskan ucapan dan konfirmasi kehadiran Anda.",rsvpButtonText:"Kirim Ucapan",musicTitle:"Wedding music",musicUrl:"",closingLabel:"Thank You",footerText:"Terima kasih atas doa dan restu Anda.",closingCredit:"Made with love",whatsappUrl:"",instagramUrl:"",
  navHome:"Home",navCouple:"Kami",navEvent:"Acara",navGallery:"Galeri",navGift:"Hadiah",countdownDay:"Hari",countdownHour:"Jam",countdownMinute:"Menit",countdownSecond:"Detik",theme:"sky",
  coverId:"hero",heroId:"hero",groomImageId:"groom",brideImageId:"bride",story1ImageId:"",story2ImageId:"",story3ImageId:"",closingImageId:"hero",openingIds:[],galleryIds:[]
};
const imageSlots=[
  ["coverId","Foto sampul utama","hero"],["groomImageId","Foto mempelai pria","groom"],["brideImageId","Foto mempelai wanita","bride"],["story1ImageId","Foto cerita 1","story-1"],["story2ImageId","Foto cerita 2","story-2"],["story3ImageId","Foto cerita 3","story-3"],["closingImageId","Foto penutup","closing"]
];

let data={...defaults};const $=selector=>document.querySelector(selector);
function setStatus(message,bad=false){const element=$("#status");element.textContent=message;element.classList.toggle("error",bad)}
function setLoginStatus(message,bad=false){const element=$("#loginStatus");element.textContent=message;element.classList.toggle("error",bad)}
function esc(value=""){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}

async function prepareAuth(){await setPersistence(auth,browserLocalPersistence)}
$("#loginBtn").onclick=async()=>{try{setLoginStatus("Membuka login Google...");await prepareAuth();const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:"select_account"});await signInWithPopup(auth,provider)}catch(error){setLoginStatus("Login Google gagal di browser ini. Gunakan login email atau buka halaman admin langsung dari Safari/Chrome.",true)}};
$("#emailLoginForm").onsubmit=async event=>{event.preventDefault();try{setLoginStatus("Sedang masuk...");await prepareAuth();await signInWithEmailAndPassword(auth,$("#adminEmail").value.trim(),$("#adminPassword").value)}catch{setLoginStatus("Email atau password belum benar. Gunakan reset password jika diperlukan.",true)}};
$("#resetPasswordBtn").onclick=async()=>{const email=$("#adminEmail").value.trim();if(!email)return setLoginStatus("Masukkan email admin terlebih dahulu.",true);try{await sendPasswordResetEmail(auth,email);setLoginStatus("Link reset password telah dikirim ke email admin.")}catch(error){setLoginStatus(`Reset password gagal: ${error.message}`,true)}};
$("#logoutBtn").onclick=()=>signOut(auth);

onAuthStateChanged(auth,async user=>{const loggedIn=!!user;$("#login").hidden=loggedIn;$("#editor").hidden=!loggedIn;$("#user").textContent=user?.email||"Silakan masuk";if(!loggedIn)return;try{const snapshot=await getDoc(doc(db,"invitation","content")),saved=snapshot.exists()?snapshot.data():{};data={...defaults,...saved};await migrateLegacy(saved);await render()}catch(error){setStatus(`Data belum dapat dibuka: ${error.message}`,true)}});
async function migrateLegacy(saved){
  if(!saved.ceremonyTitle&&saved.eventName)data.ceremonyTitle=saved.eventName;
  if(!saved.ceremonyTime&&saved.time)data.ceremonyTime=saved.time;
  if(!saved.ceremonyVenue&&saved.venue)data.ceremonyVenue=saved.venue;
  if(!saved.ceremonyAddress&&saved.address)data.ceremonyAddress=saved.address;
  if(!saved.ceremonyMapsUrl&&saved.mapsUrl)data.ceremonyMapsUrl=saved.mapsUrl;
  if(!saved.receptionMapsUrl&&saved.mapsUrl)data.receptionMapsUrl=saved.mapsUrl;
  if(!saved.coverId&&saved.heroId)data.coverId=saved.heroId;
  if(!saved.groomImageId&&saved.coupleId)data.groomImageId=saved.coupleId;
  if(!saved.brideImageId&&saved.coupleId)data.brideImageId=saved.coupleId;
  if(!data.groomImageId)data.groomImageId="groom";
  if(!data.brideImageId)data.brideImageId="bride";
  if(data.groomImageId===data.brideImageId){
    const sharedId=data.groomImageId;
    const snapshot=await getDoc(doc(db,"invitation",sharedId));
    const dataUrl=snapshot.exists()?snapshot.data().dataUrl||"":"";
    if(dataUrl)await Promise.all([
      setDoc(doc(db,"invitation","groom"),{dataUrl,updatedAt:new Date().toISOString()}),
      setDoc(doc(db,"invitation","bride"),{dataUrl,updatedAt:new Date().toISOString()})
    ]);
    data.groomImageId="groom";
    data.brideImageId="bride";
    await setDoc(doc(db,"invitation","content"),{groomImageId:"groom",brideImageId:"bride"},{merge:true});
  }
}

function renderFields(){$("#fields").innerHTML=fieldGroups.map(([title,fields])=>`<section class="field-group"><h3>${esc(title)}</h3><div class="field-group-grid">${fields.map(([key,label,type])=>`<label class="field ${type==="textarea"?"field-wide":""}"><span>${esc(label)}</span>${type==="textarea"?`<textarea name="${key}">${esc(data[key])}</textarea>`:`<input name="${key}" type="${type||"text"}" value="${esc(data[key])}">`}</label>`).join("")}</div></section>`).join("")}
async function imageUrl(id){if(!id)return"";try{const snapshot=await getDoc(doc(db,"invitation",id));return snapshot.exists()?snapshot.data().dataUrl||"":""}catch{return""}}
async function render(){renderFields();$("#theme").value=data.theme||"sky";document.documentElement.dataset.theme=data.theme||"sky";$("#imageSlots").innerHTML=imageSlots.map(([key,label])=>`<label class="upload-card"><span>${esc(label)}</span><input type="file" data-image-slot="${key}" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"><img class="single-preview" data-preview="${key}" alt="Pratinjau ${esc(label)}" hidden></label>`).join("");
  await Promise.all(imageSlots.map(async([key])=>{const url=await imageUrl(data[key]);const preview=document.querySelector(`[data-preview="${key}"]`);preview.hidden=!url;if(url)preview.src=url}));
  document.querySelectorAll("[data-image-slot]").forEach(input=>input.onchange=event=>uploadSingle(event.target));await renderCollection("openingIds","#openingThumbs");await renderCollection("galleryIds","#galleryThumbs");
}
async function renderCollection(key,selector){const ids=Array.isArray(data[key])?data[key]:[],urls=await Promise.all(ids.map(imageUrl));$(selector).innerHTML=urls.map((url,index)=>`<div>${url?`<img src="${url}" alt="Foto">`:""}<button type="button" data-remove="${key}:${index}">Hapus</button></div>`).join("");document.querySelectorAll(`[data-remove^="${key}:"]`).forEach(button=>button.onclick=()=>removeCollectionImage(key,Number(button.dataset.remove.split(":")[1])))}
async function removeCollectionImage(key,index){const ids=Array.isArray(data[key])?data[key]:[],id=ids[index];try{if(id)await deleteDoc(doc(db,"invitation",id));ids.splice(index,1);data[key]=ids;await setDoc(doc(db,"invitation","content"),data,{merge:true});await renderCollection(key,key==="openingIds"?"#openingThumbs":"#galleryThumbs");setStatus("Foto berhasil dihapus.")}catch(error){setStatus(error.message,true)}}

const MAX_INPUT_SIZE=10*1024*1024;
function loadPhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error("Foto tidak dapat dibaca."));reader.onload=()=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Format foto belum didukung browser. Gunakan JPG, PNG, atau WebP."));image.src=reader.result};reader.readAsDataURL(file)})}
function canvasBlob(canvas,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Foto gagal dikompres.")),"image/jpeg",quality))}
async function compress(file){if(!file)throw new Error("Tidak ada foto yang dipilih.");if(file.size>MAX_INPUT_SIZE)throw new Error(`Ukuran ${file.name} melebihi batas 10 MB.`);const image=await loadPhoto(file),max=1500,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const context=canvas.getContext("2d");context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);let quality=.82,blob=await canvasBlob(canvas,quality);while(blob.size>560000&&quality>.32){quality-=.1;blob=await canvasBlob(canvas,quality)}if(blob.size>650000)throw new Error("Foto masih terlalu besar setelah dikompres. Pilih foto lain.");return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Hasil foto tidak dapat diproses."));reader.readAsDataURL(blob)})}
function uniqueId(prefix){return`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
async function saveImage(id,file){const dataUrl=await compress(file);await setDoc(doc(db,"invitation",id),{dataUrl,updatedAt:new Date().toISOString()});return id}
async function uploadSingle(input){const file=input.files?.[0],key=input.dataset.imageSlot;if(!file)return;try{setStatus(`Memproses ${file.name}...`);const defaultId=imageSlots.find(slot=>slot[0]===key)?.[2]||uniqueId("photo"),isCoupleSlot=key==="groomImageId"||key==="brideImageId",id=isCoupleSlot?defaultId:(data[key]||defaultId);await saveImage(id,file);data[key]=id;if(key==="coverId")data.heroId=id;await setDoc(doc(db,"invitation","content"),data,{merge:true});await render();setStatus("Foto berhasil diunggah dan langsung aktif.")}catch(error){setStatus(error.message,true)}finally{input.value=""}}
async function uploadCollection(input,key,limit){const files=Array.from(input.files||[]);if(!files.length)return;try{const current=Array.isArray(data[key])?data[key]:[],allowed=files.slice(0,Math.max(0,limit-current.length));if(!allowed.length)throw new Error(`Batas maksimal ${limit} foto sudah tercapai.`);for(let index=0;index<allowed.length;index++){setStatus(`Memproses foto ${index+1}/${allowed.length}...`);const id=uniqueId(key==="galleryIds"?"gallery":"opening");await saveImage(id,allowed[index]);current.push(id)}data[key]=current;await setDoc(doc(db,"invitation","content"),data,{merge:true});await renderCollection(key,key==="openingIds"?"#openingThumbs":"#galleryThumbs");setStatus("Semua foto berhasil diunggah.")}catch(error){setStatus(error.message,true)}finally{input.value=""}}
$("#openingUpload").onchange=event=>uploadCollection(event.target,"openingIds",4);$("#galleryUpload").onchange=event=>uploadCollection(event.target,"galleryIds",10);
$("#theme").onchange=event=>{data.theme=event.target.value;document.documentElement.dataset.theme=data.theme};
$("#copyGuestLink").onclick=async()=>{const name=$("#guestNameInput").value.trim();if(!name)return setStatus("Masukkan nama tamu terlebih dahulu.",true);const base=location.href.replace(/admin\.html.*$/,'');const url=`${base}?to=${encodeURIComponent(name)}`;try{await navigator.clipboard.writeText(url);setStatus("Link tamu berhasil disalin.")}catch{setStatus(url)}};
$("#contentForm").onsubmit=async event=>{event.preventDefault();try{new FormData(event.currentTarget).forEach((value,key)=>data[key]=value);data.theme=$("#theme").value;setStatus("Menyimpan semua perubahan...");await setDoc(doc(db,"invitation","content"),data,{merge:true});setStatus("Semua perubahan berhasil disimpan dan langsung aktif.")}catch(error){setStatus(error.message,true)}};
