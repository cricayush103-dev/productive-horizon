
let ru=null,rs=[];
const R=id=>document.getElementById(id);
async function loadRevisions(){
 const {data,error}=await supabaseClient.from("revisions").select("*").eq("user_id",ru).order("scheduled_date");
 if(error){console.error(error);return;}
 const rows=data||[],today=phLocalDate();
 R("rToday").textContent=rows.filter(x=>!x.completed&&x.scheduled_date===today).length;
 R("rOverdue").textContent=rows.filter(x=>!x.completed&&x.scheduled_date<today).length;
 R("rUpcoming").textContent=rows.filter(x=>!x.completed&&x.scheduled_date>today).length;
 R("rCompleted").textContent=rows.filter(x=>x.completed).length;
 R("revisionList").innerHTML=rows.length?rows.map(x=>{
   const sub=rs.find(s=>s.id===x.subject_id)?.name||"Subject";
   const cls=x.completed?"done":(!x.completed&&x.scheduled_date<today?"overdue":"");
   const label=x.completed?"Completed":(x.scheduled_date<today?"Overdue":x.scheduled_date===today?"Due Today":"Upcoming");
   return `<div class="module-row"><input type="checkbox" ${x.completed?"checked":""} onchange="toggleRevision('${x.id}',this.checked)"><div class="module-row-main"><strong>${phEscape(sub)} • Revision ${x.revision_number||1}</strong><span>${x.scheduled_date}${x.notes?` • ${phEscape(x.notes)}`:""}</span></div><span class="status-pill ${cls}">${label}</span><button class="module-btn danger" onclick="deleteRevision('${x.id}')">🗑️</button></div>`;
 }).join(""):`<div class="empty-mini">No revisions scheduled.</div>`;
}
R("revisionForm").onsubmit=async e=>{e.preventDefault();const {error}=await supabaseClient.from("revisions").insert({user_id:ru,subject_id:R("revisionSubject").value,revision_number:Number(R("revisionNumber").value||1),scheduled_date:R("revisionDate").value,completed:false,notes:R("revisionNotes").value.trim()||null});if(error){console.error(error);return alert("Could not add revision.");}e.target.reset();R("revisionNumber").value=1;R("revisionDate").value=phLocalDate();await loadRevisions();}
window.toggleRevision=async(id,done)=>{const {error}=await supabaseClient.from("revisions").update({completed:done,completed_at:done?new Date().toISOString():null}).eq("id",id).eq("user_id",ru);if(error)console.error(error);await loadRevisions();}
window.deleteRevision=async id=>{if(!confirm("Delete this revision?"))return;await supabaseClient.from("revisions").delete().eq("id",id).eq("user_id",ru);await loadRevisions();}
(async()=>{const s=await phSession();if(!s)return;ru=s.user.id;rs=await phSubjects(ru);R("revisionSubject").innerHTML=rs.map(x=>`<option value="${x.id}">${phEscape(x.name)}</option>`).join("");R("revisionDate").value=phLocalDate();await loadRevisions();})();
