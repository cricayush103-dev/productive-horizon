
let ju=null,currentId=null;
const J=id=>document.getElementById(id);
async function loadDay(){
 const date=J("journalDate").value;
 const {data,error}=await supabaseClient.from("journal_entries").select("*").eq("user_id",ju).eq("entry_date",date).order("created_at",{ascending:false}).limit(1);
 if(error){console.error(error);return;}
 const x=(data||[])[0]; currentId=x?.id||null;
 J("focusScore").value=x?.focus_score??7;J("energyScore").value=x?.energy_score??7;J("wentWell").value=x?.what_went_well??"";J("wentWrong").value=x?.what_went_wrong??"";J("journalNotes").value=x?.notes??"";
}
async function loadRecent(){
 const {data,error}=await supabaseClient.from("journal_entries").select("*").eq("user_id",ju).order("entry_date",{ascending:false}).limit(14);
 if(error){console.error(error);return;}
 const rows=data||[];J("journalList").innerHTML=rows.length?rows.map(x=>`<div class="module-row"><div class="module-row-main"><strong>${x.entry_date} • Focus ${x.focus_score||"-"}/10 • Energy ${x.energy_score||"-"}/10</strong><span>${x.what_went_well?`✅ ${phEscape(x.what_went_well)}<br>`:""}${x.what_went_wrong?`⚠️ ${phEscape(x.what_went_wrong)}<br>`:""}${x.notes?phEscape(x.notes):""}</span></div></div>`).join(""):`<div class="empty-mini">No journal entries yet.</div>`;
}
J("journalDate").onchange=loadDay;
J("journalForm").onsubmit=async e=>{e.preventDefault();const payload={user_id:ju,entry_date:J("journalDate").value,what_went_well:J("wentWell").value.trim()||null,what_went_wrong:J("wentWrong").value.trim()||null,focus_score:Number(J("focusScore").value||0)||null,energy_score:Number(J("energyScore").value||0)||null,notes:J("journalNotes").value.trim()||null};let error;if(currentId){({error}=await supabaseClient.from("journal_entries").update(payload).eq("id",currentId).eq("user_id",ju));}else{({error}=await supabaseClient.from("journal_entries").insert(payload));}if(error){console.error(error);return alert("Journal could not be saved.");}alert("Journal saved ✅");await loadDay();await loadRecent();}
(async()=>{const s=await phSession();if(!s)return;ju=s.user.id;J("journalDate").value=phLocalDate();await loadDay();await loadRecent();})();
