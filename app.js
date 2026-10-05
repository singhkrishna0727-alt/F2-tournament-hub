import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
let currentUser=null, isAdmin=false, tournaments=[];

function msg(id,text){$(id).textContent=text}
function dt(v){try{return new Date(v).toLocaleString()}catch{return v}}

async function loadAll(){
  tournaments=[]; const ts=await getDocs(collection(db,"tournaments"));
  ts.forEach(d=>tournaments.push({id:d.id,...d.data()}));
  tournaments.sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  $("tournamentList").innerHTML=tournaments.length?tournaments.map(t=>`<article class="item"><h3>${esc(t.name)}</h3><p>${esc(dt(t.date))}</p><p>Entry: ₹${esc(t.entryFee)} • Prize: ${esc(t.prize)}</p><p>Status: <b>${esc(t.status)}</b></p><p class="small">ID: ${esc(t.id)}</p></article>`).join(""):"<p>No tournaments yet.</p>";
  $("regTournament").innerHTML='<option value="">Select tournament</option>'+tournaments.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");
  await loadRooms(); await loadResults(); await loadNotices();
  if(isAdmin) await loadAdmin();
}
async function loadRooms(){
  const s=await getDocs(collection(db,"rooms")); let a=[];s.forEach(d=>a.push({id:d.id,...d.data()}));
  $("roomList").innerHTML=a.length?a.map(r=>`<article class="item"><h3>Room</h3><p>Tournament: ${esc(r.tournamentId)}</p><p>Room ID: <b>${esc(r.roomId)}</b></p><p>Password: <b>${esc(r.password)}</b></p></article>`).join(""):"<p>No room published.</p>";
}
async function loadResults(){
  const s=await getDocs(collection(db,"results"));let a=[];s.forEach(d=>a.push(d.data()));
  a.sort((x,y)=>(Number(x.position)||999)-(Number(y.position)||999));
  $("resultList").innerHTML=a.length?a.map(r=>`<article class="item"><h3>#${esc(r.position)} ${esc(r.team)}</h3><p>Tournament: ${esc(r.tournamentId)}</p><p>Points: ${esc(r.points)}</p></article>`).join(""):"<p>No results yet.</p>";
}
async function loadNotices(){
  const s=await getDocs(collection(db,"notices"));let a=[];s.forEach(d=>a.push(d.data()));
  $("home").insertAdjacentHTML("afterend",a.length?`<div class="section"><div class="item"><b>Notice:</b> ${esc(a[a.length-1].text)}</div></div>`:"");
}
async function getRole(uid){const d=await getDoc(doc(db,"users",uid));return d.exists()?d.data().role:"player"}

onAuthStateChanged(auth,async u=>{
  currentUser=u;
  if(u){isAdmin=(await getRole(u.uid))==="admin";msg("authMsg",`Logged in: ${u.email}${isAdmin?" (ADMIN)":""}`);$("adminNav").classList.toggle("hidden",!isAdmin);$("admin").classList.toggle("hidden",!isAdmin);if(isAdmin)msg("adminStatus","Admin access enabled.");}
  else{isAdmin=false;$("adminNav").classList.add("hidden");$("admin").classList.add("hidden");msg("authMsg","Not logged in.");}
  await loadAll();
});

$("authForm").addEventListener("submit",async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$("email").value,$("password").value);msg("authMsg","Login successful.");}catch(e){msg("authMsg",e.message)}});
$("signupBtn").onclick=async()=>{try{const c=await createUserWithEmailAndPassword(auth,$("email").value,$("password").value);await setDoc(doc(db,"users",c.user.uid),{email:c.user.email,role:"player",createdAt:serverTimestamp()});msg("authMsg","Account created. Admin can promote you if required.");}catch(e){msg("authMsg",e.message)}};
$("logoutBtn").onclick=()=>signOut(auth);

$("registrationForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!currentUser){msg("regMsg","Please login first.");location.hash="login";return}
 try{await addDoc(collection(db,"registrations"),{uid:currentUser.uid,email:currentUser.email,tournamentId:$("regTournament").value,teamName:$("teamName").value,captainName:$("captainName").value,freeFireUid:$("uid").value,phone:$("phone").value,status:"pending",paymentStatus:"unverified",createdAt:serverTimestamp()});msg("regMsg","Registration submitted successfully.");e.target.reset();if(isAdmin)loadAdmin()}catch(e){msg("regMsg",e.message)}
});

$("tournamentForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!isAdmin)return;
 const data={name:$("tName").value,date:$("tDate").value,entryFee:Number($("tFee").value),prize:$("tPrize").value,status:$("tStatus").value};
 try{const id=$("tournamentId").value;if(id)await updateDoc(doc(db,"tournaments",id),data);else await addDoc(collection(db,"tournaments"),data);e.target.reset();$("tournamentId").value="";await loadAll();}catch(e){msg("adminStatus",e.message)}
});
$("cancelEdit").onclick=()=>{$("tournamentForm").reset();$("tournamentId").value=""};

async function loadAdmin(){
 const wrap=$("adminTournaments");wrap.innerHTML=tournaments.map(t=>`<div class="item"><b>${esc(t.name)}</b> — ${esc(t.status)} <button class="btn secondary" data-edit="${t.id}">Edit</button><button class="btn danger" data-del="${t.id}">Delete</button></div>`).join("");
 wrap.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const t=tournaments.find(x=>x.id===b.dataset.edit);$("tournamentId").value=t.id;$("tName").value=t.name||"";$("tDate").value=t.date||"";$("tFee").value=t.entryFee||0;$("tPrize").value=t.prize||"";$("tStatus").value=t.status||"Open";location.hash="admin"});
 wrap.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this tournament?")){await deleteDoc(doc(db,"tournaments",b.dataset.del));await loadAll()}});
 const rs=await getDocs(collection(db,"registrations"));let html="";
 rs.forEach(d=>{const r=d.data();html+=`<div class="item"><b>${esc(r.teamName)}</b><p>${esc(r.captainName)} • UID ${esc(r.freeFireUid)}</p><p>Tournament: ${esc(r.tournamentId)} • Status: ${esc(r.status)} • Payment: ${esc(r.paymentStatus)}</p><button class="btn" data-reg="${d.id}" data-status="approved">Approve</button><button class="btn secondary" data-reg="${d.id}" data-status="rejected">Reject</button><button class="btn danger" data-regdel="${d.id}">Delete</button></div>`});
 $("registrationList").innerHTML=html||"<p>No registrations.</p>";
 document.querySelectorAll("[data-reg]").forEach(b=>b.onclick=async()=>{await updateDoc(doc(db,"registrations",b.dataset.reg),{status:b.dataset.status});loadAdmin()});
 document.querySelectorAll("[data-regdel]").forEach(b=>b.onclick=async()=>{if(confirm("Delete registration?")){await deleteDoc(doc(db,"registrations",b.dataset.regdel));loadAdmin()}});
}
$("roomForm").addEventListener("submit",async e=>{e.preventDefault();if(!isAdmin)return;await setDoc(doc(db,"rooms",$("rTournamentId").value),{tournamentId:$("rTournamentId").value,roomId:$("roomId").value,password:$("roomPass").value,updatedAt:serverTimestamp()});e.target.reset();loadRooms()});
$("resultForm").addEventListener("submit",async e=>{e.preventDefault();if(!isAdmin)return;await addDoc(collection(db,"results"),{tournamentId:$("resTournamentId").value,team:$("resTeam").value,position:Number($("resPosition").value),points:Number($("resPoints").value),createdAt:serverTimestamp()});e.target.reset();loadResults()});
$("noticeForm").addEventListener("submit",async e=>{e.preventDefault();if(!isAdmin)return;await addDoc(collection(db,"notices"),{text:$("noticeText").value,createdAt:serverTimestamp()});e.target.reset();location.reload()});
loadAll().catch(e=>console.error(e));