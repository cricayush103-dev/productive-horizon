
function phLocalDate(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function phEscape(value){const d=document.createElement("div");d.textContent=value??"";return d.innerHTML;}
async function phSession(){
  const {data:{session},error}=await supabaseClient.auth.getSession();
  if(error) throw error;
  if(!session){location.href="login.html";return null;}
  return session;
}
async function phSubjects(userId){
  const {data,error}=await supabaseClient.from("subjects").select("id,name").eq("user_id",userId).eq("archived",false).order("position");
  if(error) throw error; return data||[];
}
function phTheme(){
  const b=document.getElementById("moduleThemeButton");
  const saved=localStorage.getItem("productiveHorizonTheme");
  if(saved==="dark"){document.body.classList.add("dark"); if(b)b.textContent="☀️";}
  if(b)b.addEventListener("click",()=>{
    document.body.classList.toggle("dark");
    const dark=document.body.classList.contains("dark");
    b.textContent=dark?"☀️":"🌙";
    localStorage.setItem("productiveHorizonTheme",dark?"dark":"light");
  });
}
phTheme();
