let settingsUser = null;
let settingsRowId = null;
const S = id => document.getElementById(id);

async function loadSettings() {
    const { data, error } = await supabaseClient
        .from("app_settings")
        .select("*")
        .eq("user_id", settingsUser)
        .limit(1);

    if (error) {
        console.error("Settings load failed:", error);
        return;
    }

    const x = (data || [])[0];
    if (!x) return;

    settingsRowId = x.id;
    S("examName").value = x.exam_name || "";
    S("examDate").value = x.exam_date || "";
    S("dailyGoal").value = x.daily_study_goal_minutes || 480;
    S("pomodoroStudySetting").value = x.pomodoro_study_minutes || 25;
    S("pomodoroBreakSetting").value = x.pomodoro_break_minutes || 5;
    S("pomodoroLongBreak").value = x.pomodoro_long_break_minutes || 15;
    S("pomodoroCycles").value = x.pomodoro_cycles || 4;
    S("themeSetting").value = x.theme || localStorage.getItem("productiveHorizonTheme") || "light";
}

S("settingsForm").addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
        user_id: settingsUser,
        exam_name: S("examName").value.trim() || null,
        exam_date: S("examDate").value || null,
        daily_study_goal_minutes: Number(S("dailyGoal").value || 480),
        pomodoro_study_minutes: Number(S("pomodoroStudySetting").value || 25),
        pomodoro_break_minutes: Number(S("pomodoroBreakSetting").value || 5),
        pomodoro_long_break_minutes: Number(S("pomodoroLongBreak").value || 15),
        pomodoro_cycles: Number(S("pomodoroCycles").value || 4),
        theme: S("themeSetting").value
    };

    let error;
    if (settingsRowId) {
        ({ error } = await supabaseClient
            .from("app_settings")
            .update(payload)
            .eq("id", settingsRowId)
            .eq("user_id", settingsUser));
    } else {
        const result = await supabaseClient
            .from("app_settings")
            .insert(payload)
            .select("id")
            .single();
        error = result.error;
        if (!error) settingsRowId = result.data.id;
    }

    if (error) {
        console.error("Settings save failed:", error);
        alert("Settings could not be saved.");
        return;
    }

    localStorage.setItem("productiveHorizonTheme", payload.theme);
    document.body.classList.toggle("dark", payload.theme === "dark");
    S("moduleThemeButton").textContent = payload.theme === "dark" ? "☀️" : "🌙";
    alert("Settings saved ✅");
});

(async () => {
    const session = await phSession();
    if (!session) return;
    settingsUser = session.user.id;
    await loadSettings();
})();
