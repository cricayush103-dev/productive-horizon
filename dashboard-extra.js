// =====================================================
// PRODUCTIVE HORIZON - DASHBOARD CLOUD WIRING
// Study stats + task stats + exam countdown
// =====================================================

(async function () {
    try {
        const {
            data: { session },
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError) {
            console.error("Dashboard session error:", sessionError);
            return;
        }

        if (!session) return;

        const uid = session.user.id;

        const localDate = (date = new Date()) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        };

        const today = localDate();

        const start = new Date();
        start.setDate(start.getDate() - 59);
        const startStr = localDate(start);

        const [sess, tasks, settings] = await Promise.all([
            supabaseClient
                .from("study_sessions")
                .select("*")
                .eq("user_id", uid)
                .gte("session_date", startStr)
                .lte("session_date", today),

            supabaseClient
                .from("tasks")
                .select("*")
                .eq("user_id", uid)
                .gte("task_date", startStr)
                .lte("task_date", today),

            supabaseClient
                .from("app_settings")
                .select("*")
                .eq("user_id", uid)
                .limit(1)
        ]);

        if (sess.error) console.error("Dashboard sessions error:", sess.error);
        if (tasks.error) console.error("Dashboard tasks error:", tasks.error);
        if (settings.error) console.error("Dashboard settings error:", settings.error);

        const sessions = sess.data || [];
        const allTasks = tasks.data || [];
        const setting = settings.data?.[0] || null;

        const todays = sessions.filter(x => x.session_date === today);
        const todayTasks = allTasks.filter(x => x.task_date === today);

        const mins = todays.reduce(
            (sum, row) => sum + Number(row.duration_minutes || 0),
            0
        );

        const done = todayTasks.filter(
            task => task.status === "Completed"
        ).length;

        const pct = todayTasks.length
            ? Math.round((done * 100) / todayTasks.length)
            : 0;

        const examDays = document.getElementById("examDays");

        if (examDays) {
            if (setting?.exam_date) {
                const [year, month, day] =
                    setting.exam_date.split("-").map(Number);

                const examDate = new Date(year, month - 1, day);
                const now = new Date();
                const todayMidnight = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                );

                const millisecondsPerDay = 24 * 60 * 60 * 1000;
                const daysLeft = Math.ceil(
                    (examDate - todayMidnight) / millisecondsPerDay
                );

                examDays.textContent =
                    daysLeft > 0 ? daysLeft :
                    daysLeft === 0 ? "TODAY" : "0";
            } else {
                examDays.textContent = "--";
            }
        }

        const examCardTitle =
            document.querySelector(".exam-card p");

        if (examCardTitle && setting?.exam_name) {
            examCardTitle.textContent = `🎯 ${setting.exam_name}`;
        }

        const cards = document.querySelectorAll(".stat-card");

        if (cards[1]) {
            const h2 = cards[1].querySelector("h2");
            const span = cards[1].querySelector("span");

            if (h2) {
                h2.textContent =
                    `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
            }

            const goal =
                Number(setting?.daily_study_goal_minutes || 480);

            if (span) {
                span.textContent =
                    `Goal: ${Math.floor(goal / 60)}h ${goal % 60}m`;
            }
        }

        if (cards[2]) {
            const h2 = cards[2].querySelector("h2");
            const span = cards[2].querySelector("span");

            if (h2) h2.textContent = `${pct}%`;
            if (span) span.textContent = `${done} of ${todayTasks.length} tasks`;
        }

        if (cards[3]) {
            const h2 = cards[3].querySelector("h2");

            const goalMinutes =
                Math.max(1, Number(setting?.daily_study_goal_minutes || 480));

            const studyScore =
                Math.min(5, (mins / goalMinutes) * 5);

            const taskScore =
                todayTasks.length
                    ? (done / todayTasks.length) * 5
                    : 0;

            const score =
                Math.min(10, studyScore + taskScore);

            if (h2) h2.textContent = `${score.toFixed(1)} / 10`;
        }

        if (cards[0]) {
            let streak = 0;

            for (let i = 0; i < 60; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = localDate(d);

                const studied =
                    sessions.some(
                        x =>
                            x.session_date === key &&
                            Number(x.duration_minutes || 0) > 0
                    ) ||
                    allTasks.some(
                        x =>
                            x.task_date === key &&
                            x.status === "Completed"
                    );

                if (studied) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
            }

            const h2 = cards[0].querySelector("h2");
            if (h2) h2.textContent = `${streak} Days`;
        }

        console.log("Dashboard settings + countdown ready");

    } catch (error) {
        console.error("Dashboard extra wiring failed:", error);
    }
})();
