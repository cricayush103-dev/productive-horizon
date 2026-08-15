
let timerUser=null, subjects=[], running=false, startedAt=null, elapsed=0, interval=null, pomoRemaining=25*60, pomoInitial=25*60;
const $=id=>document.getElementById(id);
function format(sec){sec=Math.max(0,Math.floor(sec));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;}
function render(){
  const type=$("timerType").value;
  $("timerModeLabel").textContent=type.toUpperCase();
  $("modeCard").textContent=type;
  if(type==="Stopwatch") $("timerDisplay").textContent=format(elapsed);
  else $("timerDisplay").textContent=format(pomoRemaining);
  const sel=subjects.find(s=>s.id===$("timerSubject").value);
  $("subjectCard").textContent=sel?sel.name:"—";
  if(type==="Pomodoro") $("timerProgress").style.width=`${Math.min(100,100*(pomoInitial-pomoRemaining)/pomoInitial)}%`;
  else $("timerProgress").style.width="0%";
}
function tick(){
  if(!running)return;
  if($("timerType").value==="Stopwatch") elapsed++;
  else {pomoRemaining--; if(pomoRemaining<=0){running=false;clearInterval(interval);alert("Pomodoro complete 🎯");}}
  render();
}
$("startTimer").onclick=()=>{if(running)return;running=true;if(!startedAt)startedAt=new Date();interval=setInterval(tick,1000);}
$("pauseTimer").onclick=()=>{running=false;clearInterval(interval);}
$("resetTimer").onclick=()=>{running=false;clearInterval(interval);elapsed=0;startedAt=null;pomoInitial=Number($("pomodoroStudy").value||25)*60;pomoRemaining=pomoInitial;render();}
$("pomodoroStudy").onchange=()=>{if(!running){pomoInitial=Number($("pomodoroStudy").value||25)*60;pomoRemaining=pomoInitial;render();}}
$("timerType").onchange=()=>{running=false;clearInterval(interval);startedAt=null;elapsed=0;pomoInitial=Number($("pomodoroStudy").value||25)*60;pomoRemaining=pomoInitial;render();}
$("timerSubject").onchange=render;

async function saveSession(){
  const subject_id=$("timerSubject").value;
  if(!subject_id)return alert("Select a subject.");
  let duration;
  if($("timerType").value==="Stopwatch") duration=Math.max(1,Math.round(elapsed/60));
  else duration=Math.max(1,Math.round((pomoInitial-pomoRemaining)/60));
  if(duration<=0)return alert("Run the timer first.");
  const start=startedAt||new Date(Date.now()-duration*60000), end=new Date();
  const {error}=await supabaseClient.from("study_sessions").insert({
    user_id:timerUser,subject_id,session_date:phLocalDate(),start_time:start.toISOString(),end_time:end.toISOString(),
    duration_minutes:duration,session_type:$("timerType").value,notes:$("timerNotes").value.trim()||null
  });
  if(error){console.error(error);return alert("Session could not be saved.");}
  $("timerNotes").value=""; $("resetTimer").click(); await loadToday();
}
$("saveTimer").onclick=saveSession;

async function loadToday(){
  const {data,error}=await supabaseClient.from("study_sessions").select("*").eq("user_id",timerUser).eq("session_date",phLocalDate()).order("created_at",{ascending:false});
  if(error){console.error(error);return;}
  const rows=data||[], total=rows.reduce((a,r)=>a+Number(r.duration_minutes||0),0);
  $("todayMinutes").textContent=total>=60?`${Math.floor(total/60)}h ${total%60}m`:`${total}m`;
  $("todaySessions").textContent=rows.length;
  $("sessionList").innerHTML=rows.length?rows.map(r=>`<div class="module-row"><div class="module-row-main"><strong>${phEscape(subjects.find(s=>s.id===r.subject_id)?.name||"Subject")}</strong><span>${phEscape(r.session_type||"Study")} • ${r.duration_minutes||0} min${r.notes?` • ${phEscape(r.notes)}`:""}</span></div></div>`).join(""):`<div class="empty-mini">No sessions saved today.</div>`;
}
(async()=>{
  const s=await phSession(); if(!s)return; timerUser=s.user.id; subjects=await phSubjects(timerUser);
  $("timerSubject").innerHTML=subjects.map(x=>`<option value="${x.id}">${phEscape(x.name)}</option>`).join("");
  await loadToday(); render();
})();
