
let au=null, subs=[], dailyChart=null, subjectChart=null;
const A=id=>document.getElementById(id);
function rangeDates(days){const end=new Date(),start=new Date();start.setDate(end.getDate()-(days-1));return {start:phLocalDate(start),end:phLocalDate(end)}}
async function loadAnalytics(){
  const days=Number(A("analyticsRange").value),{start,end}=rangeDates(days);
  const [sRes,tRes]=await Promise.all([
    supabaseClient.from("study_sessions").select("*").eq("user_id",au).gte("session_date",start).lte("session_date",end),
    supabaseClient.from("tasks").select("id,status,task_date").eq("user_id",au).gte("task_date",start).lte("task_date",end)
  ]);
  if(sRes.error||tRes.error){console.error(sRes.error||tRes.error);return alert("Analytics could not load.");}
  const sessions=sRes.data||[],tasks=tRes.data||[];
  const total=sessions.reduce((a,r)=>a+Number(r.duration_minutes||0),0);
  A("aStudy").textContent=`${Math.floor(total/60)}h ${total%60}m`;
  A("aSessions").textContent=sessions.length;
  const done=tasks.filter(t=>t.status==="Completed").length;
  A("aCompletion").textContent=tasks.length?`${Math.round(done*100/tasks.length)}%`:"0%";
  const daySet=new Set(sessions.filter(x=>Number(x.duration_minutes||0)>0).map(x=>x.session_date));
  A("aConsistency").textContent=`${Math.round(daySet.size*100/days)}%`;

  const labels=[],mins=[];
  for(let i=days-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=phLocalDate(d);labels.push(d.toLocaleDateString(undefined,{day:"numeric",month:"short"}));mins.push(sessions.filter(x=>x.session_date===k).reduce((a,r)=>a+Number(r.duration_minutes||0),0));}
  if(dailyChart)dailyChart.destroy();
  dailyChart=new Chart(A("dailyChart"),{type:"line",data:{labels,datasets:[{label:"Minutes",data:mins,borderWidth:2,tension:.35,fill:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});

  const by={}; sessions.forEach(r=>by[r.subject_id]=(by[r.subject_id]||0)+Number(r.duration_minutes||0));
  const entries=Object.entries(by).sort((a,b)=>b[1]-a[1]), names=entries.map(([id])=>subs.find(s=>s.id===id)?.name||"Subject"), vals=entries.map(x=>x[1]);
  if(subjectChart)subjectChart.destroy();
  subjectChart=new Chart(A("subjectAnalyticsChart"),{type:"doughnut",data:{labels:names,datasets:[{data:vals,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"70%",plugins:{legend:{position:"bottom"}}}});
  A("subjectBreakdown").innerHTML=entries.length?entries.map(([id,m])=>`<div class="module-row"><div class="module-row-main"><strong>${phEscape(subs.find(s=>s.id===id)?.name||"Subject")}</strong><span>${m} minutes</span></div><strong>${Math.floor(m/60)}h ${m%60}m</strong></div>`).join(""):`<div class="empty-mini">No study sessions in this period.</div>`;
}
A("analyticsRange").onchange=loadAnalytics;A("refreshAnalytics").onclick=loadAnalytics;
(async()=>{const s=await phSession();if(!s)return;au=s.user.id;subs=await phSubjects(au);await loadAnalytics();})();
