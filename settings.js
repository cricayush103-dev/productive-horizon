// =====================================================
// PRODUCTIVE HORIZON - SETTINGS (CLOUD PERSISTENT)
// =====================================================

let settingsUser = null;
const S = id => document.getElementById(id);

async function loadSettings() {
    const { data, error } = await supabaseClient
        .from("app_settings")
        .select("*")
        .eq("user_id", settingsUser);

    if (error) {
        console.error("Settings load failed:", error);
        alert("Settings could not be loaded.");
        return;
    }

    const rows = data || [];
    const x = rows[0];

    if (!x) {
        S("examName").value = "DSSSB TGT COMPUTER SCIENCE";
        S("dailyGoal").value = 480;
        S("pomodoroStudySetting").value = 25;
        S("pomodoroBreakSetting").value = 5;
        S("pomodoroLongBreak").value = 15;
        S("pomodoroCycles").value = 4;
        S("themeSetting").value =
            localStorage.getItem("productiveHorizonTheme") || "light";
        return;
    }

    S("examName").value = x.exam_name || "DSSSB TGT COMPUTER SCIENCE";
    S("examDate").value = x.exam_date || "";
    S("dailyGoal").value = x.daily_study_goal_minutes ?? 480;
    S("pomodoroStudySetting").value = x.pomodoro_study_minutes ?? 25;
    S("pomodoroBreakSetting").value = x.pomodoro_break_minutes ?? 5;
    S("pomodoroLongBreak").value = x.pomodoro_long_break_minutes ?? 15;
    S("pomodoroCycles").value = x.pomodoro_cycles ?? 4;
    S("themeSetting").value =
        x.theme ||
        localStorage.getItem("productiveHorizonTheme") ||
        "light";
}

S("settingsForm").addEventListener("submit", async event => {
    event.preventDefault();

    const examDate = S("examDate").value;

    if (!examDate) {
        alert("Please select an exam date.");
        return;
    }

    const payload = {
        exam_name: S("examName").value.trim() || "DSSSB TGT COMPUTER SCIENCE",
        exam_date: examDate,
        daily_study_goal_minutes: Math.max(1, Number(S("dailyGoal").value || 480)),
        pomodoro_study_minutes: Math.max(1, Number(S("pomodoroStudySetting").value || 25)),
        pomodoro_break_minutes: Math.max(1, Number(S("pomodoroBreakSetting").value || 5)),
        pomodoro_long_break_minutes: Math.max(1, Number(S("pomodoroLongBreak").value || 15)),
        pomodoro_cycles: Math.max(1, Number(S("pomodoroCycles").value || 4)),
        theme: S("themeSetting").value || "light"
    };

    const updateResult = await supabaseClient
        .from("app_settings")
        .update(payload)
        .eq("user_id", settingsUser)
        .select("*");

    if (updateResult.error) {
        console.error("Settings update failed:", updateResult.error);
        alert("Settings could not be saved.");
        return;
    }

    if (!updateResult.data || updateResult.data.length === 0) {
        const insertResult = await supabaseClient
            .from("app_settings")
            .insert({
                user_id: settingsUser,
                ...payload
            })
            .select("*")
            .single();

        if (insertResult.error) {
            console.error("Settings insert failed:", insertResult.error);
            alert("Settings could not be saved.");
            return;
        }
    }

    const verify = await supabaseClient
        .from("app_settings")
        .select("*")
        .eq("user_id", settingsUser)
        .limit(1);

    if (verify.error || !verify.data || verify.data.length === 0) {
        console.error("Settings verification failed:", verify.error);
        alert("Settings were sent but could not be verified.");
        return;
    }

    const saved = verify.data[0];

    if (
        saved.exam_date !== payload.exam_date ||
        Number(saved.daily_study_goal_minutes) !== payload.daily_study_goal_minutes ||
        Number(saved.pomodoro_study_minutes) !== payload.pomodoro_study_minutes ||
        Number(saved.pomodoro_break_minutes) !== payload.pomodoro_break_minutes
    ) {
        console.error("Settings verification mismatch:", { saved, payload });
        alert("Settings verification failed. Please try again.");
        return;
    }

    localStorage.setItem("productiveHorizonTheme", payload.theme);
    document.body.classList.toggle("dark", payload.theme === "dark");
    S("moduleThemeButton").textContent =
        payload.theme === "dark" ? "☀️" : "🌙";

    alert("Settings saved to cloud ✅");
});

(async () => {
    const session = await phSession();
    if (!session) return;

    settingsUser = session.user.id;
    await loadSettings();
})();
