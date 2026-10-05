import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app=initializeApp(firebaseConfig);
const db=getFirestore(app);

const list=document.getElementById("tournaments");
const select=document.getElementById("tournament");

async function loadTournaments(){
  try{
    const snap=await getDocs(query(collection(db,"tournaments"),orderBy("date","asc")));
    list.innerHTML="";
    select.innerHTML='<option value="">Select Tournament</option>';
    snap.forEach(d=>{
      const t=d.data();
      list.innerHTML += `<div class="tournament"><b>${t.name}</b><br>Date: ${t.date}<br>Entry: ₹${t.entryFee}<br>Prize: ${t.prize}</div>`;
      select.innerHTML += `<option value="${d.id}">${t.name}</option>`;
    });
  }catch(e){ list.innerHTML="<p>Firebase is not configured yet. Add your Firebase config.</p>"; }
}
loadTournaments();

document.getElementById("registrationForm").addEventListener("submit",async(e)=>{
 e.preventDefault();
 try{
  await addDoc(collection(db,"registrations"),{
   teamName:teamName.value,captain:captain.value,uid:uid.value,phone:phone.value,
   tournament:tournament.value,createdAt:new Date().toISOString()
  });
  message.textContent="✅ Registration submitted successfully!";
  e.target.reset();
 }catch(err){message.textContent="❌ Firebase configuration required.";}
});