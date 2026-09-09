const content={
  bride:"Charine",groom:"Jeivan",date:"2026-12-12",time:"14.00 WITA",
  venue:"Gereja & Aula Pernikahan",address:"Manado, Sulawesi Utara",
  mapsUrl:"https://www.google.com/maps/search/?api=1&query=Manado%2C%20Sulawesi%20Utara",
  greeting:"Tuhan membuat segala sesuatu indah pada waktunya.",
  story:"Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir, mendoakan, dan menjadi bagian dari hari bahagia kami.",
  bankName:"Bank Mandiri",accountNumber:"0000 0000 0000",accountHolder:"Jeivan S. Momongan",
  heroImage:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=88",
  coupleImage:"https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1100&q=88",
  gallery:[
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85"
  ]
};

const weddingDate=new Date(`${content.date}T14:00:00+08:00`);
content.dateText=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(weddingDate);
document.querySelectorAll("[data-k]").forEach(el=>el.textContent=content[el.dataset.k]||"");
document.querySelector(".hero").style.backgroundImage=`linear-gradient(180deg,#17201933,#172019cc),url('${content.heroImage}')`;
document.querySelector("#coupleImage").src=content.coupleImage;
document.querySelector("#guest").textContent=new URLSearchParams(location.search).get("to")||"Bapak/Ibu/Saudara/i";
document.querySelector("#month").textContent=weddingDate.toLocaleDateString("id-ID",{month:"short"});
document.querySelector("#day").textContent=weddingDate.getDate();
document.querySelector("#year").textContent=weddingDate.getFullYear();
document.querySelector("#mapsLink").href=content.mapsUrl;
document.querySelector("#map").src=`https://www.google.com/maps?q=${encodeURIComponent(content.address)}&output=embed`;
document.querySelector("#gallery").innerHTML=content.gallery.map((url,i)=>`<img src="${url}" alt="Foto galeri ${i+1}" loading="lazy">`).join("");

const cover=document.createElement("div");
cover.className="cover-screen";
cover.style.backgroundImage=`linear-gradient(180deg,#17201955,#172019e8),url('${content.heroImage}')`;
cover.innerHTML=`<div class="cover-content"><p class="eyebrow">The Wedding of</p><h1>${content.groom} <i>&</i> ${content.bride}</h1><p>Kepada Yth.</p><strong>${document.querySelector("#guest").textContent}</strong><small>Dengan hormat kami mengundang Anda ke hari bahagia kami</small><button id="openInvitation" class="pill">✉ Buka Undangan</button></div>`;
document.body.append(cover);
document.body.classList.add("locked");
document.querySelector("#openInvitation").onclick=()=>{cover.classList.add("opened");document.body.classList.remove("locked");setTimeout(()=>cover.remove(),900)};

const countdown=document.createElement("div");countdown.className="countdown";
document.querySelector(".event-section h2").after(countdown);
function tick(){const diff=Math.max(0,weddingDate-Date.now());const units=[864e5,36e5,6e4,1];const labels=["Hari","Jam","Menit","Detik"];let left=diff;countdown.innerHTML=units.map((u,i)=>{const val=i===3?Math.floor(left/1000):Math.floor(left/u);left%=u;return `<span><b>${String(val).padStart(2,"0")}</b><small>${labels[i]}</small></span>`}).join("")};tick();setInterval(tick,1000);

const journey=document.createElement("section");journey.className="journey";journey.innerHTML=`<p class="eyebrow gold">Our journey</p><h2>Cerita Kami</h2><div class="story-cards"><article><b>Awal Bertemu</b><p>Dua pribadi dipertemukan dalam rencana Tuhan yang indah.</p></article><article><b>Bertumbuh Bersama</b><p>Hari demi hari, kasih dan keyakinan kami semakin dikuatkan.</p></article><article><b>Menuju Selamanya</b><p>Kini kami melangkah bersama dalam ikatan pernikahan kudus.</p></article></div></section>`;
document.querySelector("#galeri").before(journey);

const nav=document.createElement("div");nav.className="bottom-nav";nav.innerHTML=`<a href="#home">⌂<small>Home</small></a><a href="#cerita">♡<small>Kami</small></a><a href="#acara">▣<small>Acara</small></a><a href="#galeri">▦<small>Galeri</small></a><a href="#hadiah">♧<small>Hadiah</small></a>`;document.body.append(nav);

const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.12});document.querySelectorAll("main section").forEach(s=>observer.observe(s));
