// PRODUCTIVE HORIZON - ADVANCED ANALYTICS
let analyticsUser=null,analyticsSubjects=[],dailyChart=null,subjectChart=null,daySubjectChart=null,dailyGoalMinutes=480;
const TIMER_STORAGE_KEY="productiveHorizonActiveTimer";
const A=id=>document.getElementById(id);

function formatMinutes(m){m=Math.max(0,Math.floor(Number(m||0)));return `${Math.floor(m/60)}h ${m%60}m`;}
function formatClock(v){if(!v)return "--:--";const d=new Date(v);return Number.isNaN(d.getTime())?"--:--":d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});}
function parseLocalDate(v){const [y,m,d]=v.split("-").map(Number);return new Date(y,m-1,d);}
function subjectName(id){return analyticsSubjects.find(s=>s.id===id)?.name||"Unknown Subject";}
function rangeDates(days){const end=new Date(),start=new Date();start.setDate(end.getDate()-(days-1));return {start:phLocalDate(start),end:phLocalDate(end)};}

function getActiveTimer(){
  const raw=localStorage.getItem(TIMER_STORAGE_KEY); if(!raw)return null;
  try{
    const s=JSON.parse(raw); let sec=Number(s.accumulatedSeconds||0);
    if(s.running&&s.startedAt){const st=new Date(s.startedAt).getTime();if(Number.isFinite(st))sec+=Math.max(0,Math.floor((Date.now()-st)/1000));}
    return {...s,elapsedSeconds:sec,elapsedMinutes:sec/60};
  }catch(e){console.error("Active timer read failed",e);return null;}
}

async function loadAnalyticsSettings(){
  const {data,error}=await supabaseClient.from("app_settings").select("daily_study_goal_minutes").eq("user_id",analyticsUser).limit(1);
  if(error){console.error(error);return;}
  dailyGoalMinutes=Number(data?.[0]?.daily_study_goal_minutes||480);
}

async function loadAnalytics(){
  const days=Number(A("analyticsRange").value),{start,end}=rangeDates(days);
  const [sr,tr]=await Promise.all([
    supabaseClient.from("study_sessions").select("*").eq("user_id",analyticsUser).gte("session_date",start).lte("session_date",end),
    supabaseClient.from("tasks").select("id,status,task_date").eq("user_id",analyticsUser).gte("task_date",start).lte("task_date",end)
  ]);
  if(sr.error||tr.error){console.error(sr.error||tr.error);return;}
  const sessions=sr.data||[],tasks=tr.data||[],active=getActiveTimer(),activeMin=active?.elapsedSeconds>0?active.elapsedMinutes:0;
  const saved=sessions.reduce((a,r)=>a+Number(r.duration_minutes||0),0),total=saved+activeMin;
  A("aStudy").textContent=formatMinutes(total);
  A("aSessions").textContent=sessions.length+(activeMin>0?1:0);
  const done=tasks.filter(t=>t.status==="Completed").length;
  A("aCompletion").textContent=tasks.length?`${Math.round(done*100/tasks.length)}%`:"0%";
  const daySet=new Set(sessions.filter(x=>Number(x.duration_minutes||0)>0).map(x=>x.session_date));if(activeMin>0)daySet.add(phLocalDate());
  A("aConsistency").textContent=`${Math.round(daySet.size*100/days)}%`;

  const labels=[],mins=[];
  for(let i=days-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=phLocalDate(d);labels.push(d.toLocaleDateString(undefined,{day:"numeric",month:"short"}));let m=sessions.filter(x=>x.session_date===k).reduce((a,r)=>a+Number(r.duration_minutes||0),0);if(k===phLocalDate())m+=activeMin;mins.push(m);}
  if(dailyChart)dailyChart.destroy();
  dailyChart=new Chart(A("dailyChart"),{type:"line",data:{labels,datasets:[{data:mins,label:"Minutes",borderWidth:2,tension:.35,fill:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});

  const by={};sessions.forEach(r=>by[r.subject_id]=(by[r.subject_id]||0)+Number(r.duration_minutes||0));
  if(active?.subjectId&&activeMin>0)by[active.subjectId]=(by[active.subjectId]||0)+activeMin;
  const e=Object.entries(by).sort((a,b)=>b[1]-a[1]),names=e.map(([id])=>subjectName(id)),vals=e.map(x=>x[1]);
  if(subjectChart)subjectChart.destroy();
  subjectChart=new Chart(A("subjectAnalyticsChart"),{type:"doughnut",data:{labels:names,datasets:[{data:vals,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"70%",plugins:{legend:{position:"bottom"}}}});
  A("subjectBreakdown").innerHTML=e.length?e.map(([id,m])=>`<div class="module-row"><div class="module-row-main"><strong>${phEscape(subjectName(id))}</strong><span>${Math.floor(m)} minutes</span></div><strong>${formatMinutes(m)}</strong></div>`).join(""):`<div class="empty-mini">No study sessions in this period.</div>`;
}

async function loadDayAnalytics(){
  const date=A("analyticsDate").value;if(!date)return;
  const [sr,tr]=await Promise.all([
    supabaseClient.from("study_sessions").select("*").eq("user_id",analyticsUser).eq("session_date",date).order("start_time"),
    supabaseClient.from("tasks").select("*").eq("user_id",analyticsUser).eq("task_date",date).order("created_at")
  ]);
  if(sr.error||tr.error){console.error(sr.error||tr.error);return;}
  const sessions=sr.data||[],tasks=tr.data||[],today=date===phLocalDate(),active=today?getActiveTimer():null,activeMin=active?.elapsedSeconds>0?active.elapsedMinutes:0;
  const total=sessions.reduce((a,r)=>a+Number(r.duration_minutes||0),0)+activeMin,done=tasks.filter(t=>t.status==="Completed").length;
  const studyRatio=Math.min(1,total/Math.max(1,dailyGoalMinutes)),taskRatio=tasks.length?done/tasks.length:0,studyScore=studyRatio*5,taskScore=taskRatio*5,prod=Math.min(10,studyScore+taskScore);
  const subjectIds=new Set(sessions.filter(s=>Number(s.duration_minutes||0)>0).map(s=>s.subject_id));if(active?.subjectId&&activeMin>0)subjectIds.add(active.subjectId);

  A("dayStudyTime").textContent=formatMinutes(total);A("dayProductivity").textContent=`${prod.toFixed(1)} / 10`;A("dayTasks").textContent=`${done} / ${tasks.length}`;A("daySessions").textContent=sessions.length+(activeMin>0?1:0);A("daySubjects").textContent=subjectIds.size;
  A("dayHeading").textContent=parseLocalDate(date).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  const rows=sessions.map(s=>`<div class="timeline-item"><div class="timeline-time">${formatClock(s.start_time)} – ${formatClock(s.end_time)}</div><div class="timeline-main"><strong>${phEscape(subjectName(s.subject_id))}</strong><span>${phEscape(s.session_type||"Study")}${s.notes?` • ${phEscape(s.notes)}`:""}</span></div><div class="timeline-duration">${s.duration_minutes||0} min</div></div>`);
  if(active&&activeMin>0)rows.push(`<div class="timeline-item"><div class="timeline-time">${formatClock(active.startedAt)} – NOW</div><div class="timeline-main"><strong>${phEscape(subjectName(active.subjectId))}<span class="live-badge"><span class="live-dot"></span>LIVE</span></strong><span>${phEscape(active.type||"Study")}${active.notes?` • ${phEscape(active.notes)}`:""}</span></div><div class="timeline-duration">${Math.floor(activeMin)} min</div></div>`);
  A("dayTimeline").innerHTML=rows.length?rows.join(""):`<div class="empty-mini">No study sessions recorded for this day.</div>`;

  const by={};sessions.forEach(s=>by[s.subject_id]=(by[s.subject_id]||0)+Number(s.duration_minutes||0));if(active?.subjectId&&activeMin>0)by[active.subjectId]=(by[active.subjectId]||0)+activeMin;
  const e=Object.entries(by).sort((a,b)=>b[1]-a[1]),names=e.map(([id])=>subjectName(id)),vals=e.map(x=>x[1]);
  if(daySubjectChart)daySubjectChart.destroy();
  daySubjectChart=new Chart(A("daySubjectChart"),{type:"doughnut",data:{labels:names,datasets:[{data:vals,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"70%",plugins:{legend:{position:"bottom"}}}});
  const max=e.length?Math.max(...e.map(x=>x[1])):0;
  A("daySubjectBreakdown").innerHTML=e.length?e.map(([id,m])=>`<div class="subject-day-row"><div>${phEscape(subjectName(id))}</div><div class="subject-day-bar"><div class="subject-day-fill" style="width:${max?m/max*100:0}%"></div></div><strong>${formatMinutes(m)}</strong></div>`).join(""):`<div class="empty-mini">No subject study data for this day.</div>`;

  A("productivityExplanation").innerHTML=`<div class="module-row"><div class="module-row-main"><strong>Study Goal Achievement</strong><span>${formatMinutes(total)} of ${formatMinutes(dailyGoalMinutes)} goal</span></div><strong>${Math.round(studyRatio*100)}% → ${studyScore.toFixed(1)}/5</strong></div><div class="module-row"><div class="module-row-main"><strong>Task Completion</strong><span>${done} of ${tasks.length} tasks completed</span></div><strong>${Math.round(taskRatio*100)}% → ${taskScore.toFixed(1)}/5</strong></div><div class="module-row"><div class="module-row-main"><strong>Daily Productivity Score</strong><span>50% study goal + 50% task completion</span></div><strong>${prod.toFixed(1)} / 10</strong></div>${today&&activeMin>0?`<p class="muted" style="margin-top:10px">⏱️ Running timer is included live.</p>`:""}`;
}

function showOverview(){A("overviewView").classList.remove("analytics-hidden");A("dayView").classList.add("analytics-hidden");A("overviewViewButton").classList.add("active");A("dayViewButton").classList.remove("active");loadAnalytics();}
function showDayView(){A("overviewView").classList.add("analytics-hidden");A("dayView").classList.remove("analytics-hidden");A("overviewViewButton").classList.remove("active");A("dayViewButton").classList.add("active");loadDayAnalytics();}
function changeDay(n){const d=parseLocalDate(A("analyticsDate").value);d.setDate(d.getDate()+n);A("analyticsDate").value=phLocalDate(d);loadDayAnalytics();}

A("overviewViewButton").onclick=showOverview;A("dayViewButton").onclick=showDayView;A("analyticsRange").onchange=loadAnalytics;A("refreshAnalytics").onclick=loadAnalytics;A("analyticsDate").onchange=loadDayAnalytics;A("previousAnalyticsDay").onclick=()=>changeDay(-1);A("nextAnalyticsDay").onclick=()=>changeDay(1);A("analyticsTodayButton").onclick=()=>{A("analyticsDate").value=phLocalDate();loadDayAnalytics();};A("refreshDayAnalytics").onclick=loadDayAnalytics;

setInterval(()=>{if(!A("dayView").classList.contains("analytics-hidden")&&A("analyticsDate").value===phLocalDate())loadDayAnalytics();if(!A("overviewView").classList.contains("analytics-hidden"))loadAnalytics();},5000);
document.addEventListener("visibilitychange",()=>{if(document.hidden)return;A("dayView").classList.contains("analytics-hidden")?loadAnalytics():loadDayAnalytics();});

(async()=>{const s=await phSession();if(!s)return;analyticsUser=s.user.id;analyticsSubjects=await phSubjects(analyticsUser);await loadAnalyticsSettings();A("analyticsDate").value=phLocalDate();await loadAnalytics();console.log("Advanced Analytics ready");})();
