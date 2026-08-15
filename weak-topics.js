let wu=null,ws=[];
const W=id=>document.getElementById(id);

async function loadMistakes(){
  const {data,error}=await supabaseClient
    .from("mistakes")
    .select("*")
    .eq("user_id",wu)
    .order("created_at",{ascending:false});

  if(error){console.error(error);return;}

  const rows=data||[];
  const resolved=rows.filter(x=>x.resolved).length;

  W("wOpen").textContent=rows.length-resolved;
  W("wResolved").textContent=resolved;
  W("wTotal").textContent=rows.length;
  W("wRate").textContent=rows.length?`${Math.round(resolved*100/rows.length)}%`:"0%";

  W("mistakeList").innerHTML=rows.length
    ? rows.map(x=>`<div class="module-row"><input type="checkbox" ${x.resolved?"checked":""} onchange="resolveMistake('${x.id}',this.checked)"><div class="module-row-main"><strong>${phEscape(x.title)}</strong><span>${phEscape(ws.find(s=>s.id===x.subject_id)?.name||"Subject")} • ${phEscape(x.status||"Weak")}${x.source?` • ${phEscape(x.source)}`:""}${x.description?`<br>${phEscape(x.description)}`:""}</span></div><span class="status-pill ${x.resolved?"done":""}">${x.resolved?"Resolved":"Open"}</span><button class="module-btn danger" onclick="deleteMistake('${x.id}')">🗑️</button></div>`).join("")
    : `<div class="empty-mini">No weak topics logged.</div>`;
}

W("mistakeForm").onsubmit=async e=>{
  e.preventDefault();

  const {error}=await supabaseClient.from("mistakes").insert({
    user_id:wu,
    subject_id:W("mistakeSubject").value,
    title:W("mistakeTitle").value.trim(),
    description:W("mistakeDescription").value.trim()||null,
    source:W("mistakeSource").value.trim()||null,
    status:W("mistakeStatus").value,
    resolved:false
  });

  if(error){
    console.error(error);
    return alert("Could not add weak topic.");
  }

  e.target.reset();
  await loadMistakes();
};

window.resolveMistake=async(id,done)=>{
  const {error}=await supabaseClient
    .from("mistakes")
    .update({resolved:done,resolved_at:done?new Date().toISOString():null})
    .eq("id",id)
    .eq("user_id",wu);

  if(error)console.error(error);
  await loadMistakes();
};

window.deleteMistake=async id=>{
  if(!confirm("Delete this weak topic?"))return;
  const {error}=await supabaseClient
    .from("mistakes")
    .delete()
    .eq("id",id)
    .eq("user_id",wu);

  if(error)console.error(error);
  await loadMistakes();
};

(async()=>{
  const s=await phSession();
  if(!s)return;
  wu=s.user.id;
  ws=await phSubjects(wu);
  W("mistakeSubject").innerHTML=ws.map(x=>`<option value="${x.id}">${phEscape(x.name)}</option>`).join("");
  await loadMistakes();
})();
