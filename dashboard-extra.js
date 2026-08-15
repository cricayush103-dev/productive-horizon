
// PRODUCTIVE HORIZON - FINAL DASHBOARD CLOUD WIRING
(async function(){
  try{
    const {data:{session}}=await supabaseClient.auth.getSession(); if(!session)return;
    const uid=session.user.id, today=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`})();
    const start=new Date();start.setDate(start.getDate()-6);const startStr=`${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,"0")}-${String(start.getDate()).padStart(2,"0")}`;
    const [sess,tasks,settings]=await Promise.all([
      supabaseClient.from("study_sessions").select("*").eq("user_id",uid).gte("session_date",startStr).lte("session_date",today),
      supabaseClient.from("tasks").select("*").eq("user_id",uid).gte("task_date",startStr).lte("task_date",today),
      supabaseClient.from("app_settings").select("*").eq("user_id",uid).limit(1)
    ]);
    const sessions=sess.data||[], allTasks=tasks.data||[], todays=sessions.filter(x=>x.session_date===today), todayTasks=allTasks.filter(x=>x.task_date===today);
    const mins=todays.reduce((a,r)=>a+Number(r.duration_minutes||0),0), done=todayTasks.filter(x=>x.status==="Completed").length, pct=todayTasks.length?Math.round(done*100/todayTasks.length):0;
    const cards=document.querySelectorAll(".stat-card");
    if(cards[1]){cards[1].querySelector("h2").textContent=`${Math.floor(mins/60)}h ${String(mins%60).padStart(2,"0")}m`;const goal=settings.data?.[0]?.daily_study_goal_minutes||480;cards[1].querySelector("span").textContent=`Goal: ${Math.floor(goal/60)}h ${goal%60}m`;}
    if(cards[2]){cards[2].querySelector("h2").textContent=`${pct}%`;cards[2].querySelector("span").textContent=`${done} of ${todayTasks.length} tasks`;}
    if(cards[3]){const studyScore=Math.min(5,mins/60),taskScore=todayTasks.length?5*done/todayTasks.length:0,score=Math.min(10,studyScore+taskScore);cards[3].querySelector("h2").textContent=`${score.toFixed(1)} / 10`;}
    if(cards[0]){let streak=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;const studied=sessions.some(x=>x.session_date===k)||allTasks.some(x=>x.task_date===k&&x.status==="Completed");if(studied)streak++;else if(i>0)break;}cards[0].querySelector("h2").textContent=`${streak} Days`;}
  }catch(e){console.error("Dashboard extra wiring failed:",e)}
})();
