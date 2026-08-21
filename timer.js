// =====================================================
// PRODUCTIVE HORIZON
// PERSISTENT STUDY TIMER + DAILY PROGRESS
// =====================================================

const $ = id =>
    document.getElementById(id);


// =====================================================
// STATE
// =====================================================

let timerUser = null;

let subjects = [];

let savedTodayMinutes = 0;

let dailyGoalMinutes = 480;


// Persistent timer state
let timerState = {

    running: false,

    type: "Stopwatch",

    subjectId: "",

    startedAt: null,

    accumulatedSeconds: 0,

    pomodoroStudyMinutes: 25,

    pomodoroBreakMinutes: 5,

    notes: ""
};


// =====================================================
// STORAGE
// =====================================================

const TIMER_STORAGE_KEY =
    "productiveHorizonActiveTimer";


function saveTimerState() {

    timerState.type =
        $("timerType").value;


    timerState.subjectId =
        $("timerSubject").value;


    timerState.pomodoroStudyMinutes =
        Math.max(
            1,
            Number(
                $("pomodoroStudy").value ||
                25
            )
        );


    timerState.pomodoroBreakMinutes =
        Math.max(
            1,
            Number(
                $("pomodoroBreak").value ||
                5
            )
        );


    timerState.notes =
        $("timerNotes").value;


    localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify(
            timerState
        )
    );
}


function loadTimerState() {

    const saved =
        localStorage.getItem(
            TIMER_STORAGE_KEY
        );


    if (!saved) {
        return;
    }


    try {

        const parsed =
            JSON.parse(saved);


        timerState = {
            ...timerState,
            ...parsed
        };

    }

    catch (error) {

        console.error(
            "Timer state could not be restored:",
            error
        );

    }
}


// =====================================================
// CURRENT ELAPSED SECONDS
// =====================================================

function getElapsedSeconds() {

    let seconds =
        Number(
            timerState.accumulatedSeconds ||
            0
        );


    if (
        timerState.running &&
        timerState.startedAt
    ) {

        const started =
            new Date(
                timerState.startedAt
            ).getTime();


        const now =
            Date.now();


        seconds +=
            Math.max(
                0,
                Math.floor(
                    (
                        now -
                        started
                    ) /
                    1000
                )
            );

    }


    return seconds;
}


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(
    seconds
) {

    seconds =
        Math.max(
            0,
            Math.floor(
                seconds
            )
        );


    const hours =
        Math.floor(
            seconds /
            3600
        );


    const minutes =
        Math.floor(
            (
                seconds %
                3600
            ) /
            60
        );


    const secs =
        seconds %
        60;


    return (
        String(hours)
            .padStart(
                2,
                "0"
            )
        +
        ":"
        +
        String(minutes)
            .padStart(
                2,
                "0"
            )
        +
        ":"
        +
        String(secs)
            .padStart(
                2,
                "0"
            )
    );
}


// =====================================================
// CURRENT SESSION MINUTES
// =====================================================

function getCurrentSessionMinutes() {

    const seconds =
        getElapsedSeconds();


    return seconds /
        60;
}


// =====================================================
// DISPLAY
// =====================================================

function renderTimer() {

    const type =
        $("timerType").value;


    const elapsedSeconds =
        getElapsedSeconds();


    $("timerModeLabel")
        .textContent =
        type.toUpperCase();


    $("modeCard")
        .textContent =
        type;


    // =========================================
    // STOPWATCH
    // =========================================

    if (
        type ===
        "Stopwatch"
    ) {

        $("timerDisplay")
            .textContent =
            formatTime(
                elapsedSeconds
            );


        $("timerProgress")
            .style.width =
            "0%";

    }


    // =========================================
    // POMODORO
    // =========================================

    else {

        const totalSeconds =
            Math.max(
                60,
                Number(
                    $("pomodoroStudy")
                        .value ||
                    25
                ) *
                60
            );


        const remaining =
            Math.max(
                0,
                totalSeconds -
                elapsedSeconds
            );


        $("timerDisplay")
            .textContent =
            formatTime(
                remaining
            );


        const progress =
            Math.min(
                100,
                (
                    elapsedSeconds /
                    totalSeconds
                ) *
                100
            );


        $("timerProgress")
            .style.width =
            `${progress}%`;


        // Pomodoro finished
        if (
            remaining <= 0 &&
            timerState.running
        ) {

            pauseTimer();

            alert(
                "Pomodoro complete 🎯"
            );

        }

    }


    // =========================================
    // SUBJECT CARD
    // =========================================

    const selectedSubject =
        subjects.find(
            subject =>
                subject.id ===
                $("timerSubject")
                    .value
        );


    $("subjectCard")
        .textContent =
        selectedSubject
            ?
            selectedSubject.name
            :
            "—";


    // =========================================
    // DAILY PROGRESS
    // =========================================

    updateDailyProgress();

}


// =====================================================
// DAILY PROGRESS
// =====================================================

function updateDailyProgress() {

    const activeMinutes =
        getCurrentSessionMinutes();


    const totalTodayMinutes =
        savedTodayMinutes +
        activeMinutes;


    const roundedMinutes =
        Math.floor(
            totalTodayMinutes
        );


    if (
        roundedMinutes >=
        60
    ) {

        const hours =
            Math.floor(
                roundedMinutes /
                60
            );


        const minutes =
            roundedMinutes %
            60;


        $("todayMinutes")
            .textContent =
            `${hours}h ${minutes}m`;

    }

    else {

        $("todayMinutes")
            .textContent =
            `${roundedMinutes}m`;

    }


    const progressPercent =
        Math.min(
            100,
            Math.round(
                (
                    totalTodayMinutes /
                    Math.max(
                        1,
                        dailyGoalMinutes
                    )
                ) *
                100
            )
        );


    // Existing text below Study Today card
    const studyCard =
        $("todayMinutes")
            .closest(
                ".module-card"
            );


    const subtitle =
        studyCard
            ?.querySelector(
                ".muted"
            );


    if (subtitle) {

        const goalHours =
            Math.floor(
                dailyGoalMinutes /
                60
            );


        const goalMinutes =
            dailyGoalMinutes %
            60;


        let goalText =
            `${goalHours}h`;


        if (
            goalMinutes >
            0
        ) {

            goalText +=
                ` ${goalMinutes}m`;

        }


        subtitle.textContent =
            `Goal: ${goalText} • ${progressPercent}% complete`;

    }

}


// =====================================================
// START
// =====================================================

function startTimer() {

    if (
        timerState.running
    ) {
        return;
    }


    timerState.running =
        true;


    timerState.startedAt =
        new Date()
            .toISOString();


    saveTimerState();

    renderTimer();

}


// =====================================================
// PAUSE
// =====================================================

function pauseTimer() {

    if (
        !timerState.running
    ) {
        return;
    }


    timerState.accumulatedSeconds =
        getElapsedSeconds();


    timerState.running =
        false;


    timerState.startedAt =
        null;


    saveTimerState();

    renderTimer();

}


// =====================================================
// RESET
// =====================================================

function resetTimer() {

    timerState.running =
        false;


    timerState.startedAt =
        null;


    timerState.accumulatedSeconds =
        0;


    timerState.notes =
        "";


    $("timerNotes").value =
        "";


    saveTimerState();

    renderTimer();

}


// =====================================================
// BUTTONS
// =====================================================

$("startTimer")
    .addEventListener(
        "click",
        startTimer
    );


$("pauseTimer")
    .addEventListener(
        "click",
        pauseTimer
    );


$("resetTimer")
    .addEventListener(
        "click",
        function () {

            const elapsed =
                getElapsedSeconds();


            if (
                elapsed >
                0
            ) {

                const confirmed =
                    confirm(
                        "Reset the current timer?"
                    );


                if (
                    !confirmed
                ) {
                    return;
                }

            }


            resetTimer();

        }
    );


// =====================================================
// MODE CHANGE
// =====================================================

$("timerType")
    .addEventListener(
        "change",
        function () {

            // Don't accidentally destroy an active session.
            if (
                getElapsedSeconds() >
                0
            ) {

                const confirmed =
                    confirm(
                        "Changing timer mode will reset the current timer. Continue?"
                    );


                if (
                    !confirmed
                ) {

                    $("timerType").value =
                        timerState.type;

                    return;

                }


                timerState.running =
                    false;


                timerState.startedAt =
                    null;


                timerState.accumulatedSeconds =
                    0;

            }


            timerState.type =
                $("timerType")
                    .value;


            saveTimerState();

            renderTimer();

        }
    );


// =====================================================
// SUBJECT CHANGE
// =====================================================

$("timerSubject")
    .addEventListener(
        "change",
        function () {

            timerState.subjectId =
                $("timerSubject")
                    .value;


            saveTimerState();

            renderTimer();

        }
    );


// =====================================================
// SETTINGS CHANGE
// =====================================================

$("pomodoroStudy")
    .addEventListener(
        "change",
        function () {

            timerState.pomodoroStudyMinutes =
                Math.max(
                    1,
                    Number(
                        $("pomodoroStudy")
                            .value ||
                        25
                    )
                );


            saveTimerState();

            renderTimer();

        }
    );


$("pomodoroBreak")
    .addEventListener(
        "change",
        function () {

            timerState.pomodoroBreakMinutes =
                Math.max(
                    1,
                    Number(
                        $("pomodoroBreak")
                            .value ||
                        5
                    )
                );


            saveTimerState();

        }
    );


$("timerNotes")
    .addEventListener(
        "input",
        function () {

            timerState.notes =
                $("timerNotes")
                    .value;


            saveTimerState();

        }
    );


// =====================================================
// SAVE SESSION
// =====================================================

async function saveSession() {

    const subjectId =
        $("timerSubject")
            .value;


    if (!subjectId) {

        alert(
            "Select a subject."
        );

        return;

    }


    const elapsedSeconds =
        getElapsedSeconds();


    if (
        elapsedSeconds <=
        0
    ) {

        alert(
            "Run the timer first."
        );

        return;

    }


    // Pause before saving
    if (
        timerState.running
    ) {

        pauseTimer();

    }


    const durationMinutes =
        Math.max(
            1,
            Math.round(
                timerState
                    .accumulatedSeconds /
                60
            )
        );


    const endTime =
        new Date();


    const startTime =
        new Date(
            endTime.getTime() -
            (
                timerState
                    .accumulatedSeconds *
                1000
            )
        );


    const {
        error
    } =
    await supabaseClient
        .from(
            "study_sessions"
        )
        .insert({

            user_id:
                timerUser,

            subject_id:
                subjectId,

            session_date:
                phLocalDate(),

            start_time:
                startTime
                    .toISOString(),

            end_time:
                endTime
                    .toISOString(),

            duration_minutes:
                durationMinutes,

            session_type:
                $("timerType")
                    .value,

            notes:
                $("timerNotes")
                    .value
                    .trim()
                ||
                null

        });


    if (error) {

        console.error(
            "Session save failed:",
            error
        );


        alert(
            "Session could not be saved."
        );

        return;

    }


    // Clear active timer only AFTER successful cloud save
    timerState.running =
        false;


    timerState.startedAt =
        null;


    timerState.accumulatedSeconds =
        0;


    timerState.notes =
        "";


    $("timerNotes").value =
        "";


    saveTimerState();


    await loadToday();


    renderTimer();


    alert(
        `Study session saved ✅\n${durationMinutes} minutes`
    );

}


// =====================================================
// SAVE BUTTON
// =====================================================

$("saveTimer")
    .addEventListener(
        "click",
        saveSession
    );


// =====================================================
// LOAD TODAY'S SESSIONS
// =====================================================

async function loadToday() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "study_sessions"
        )
        .select("*")
        .eq(
            "user_id",
            timerUser
        )
        .eq(
            "session_date",
            phLocalDate()
        )
        .order(
            "created_at",
            {
                ascending:
                    false
            }
        );


    if (error) {

        console.error(
            "Today's sessions load failed:",
            error
        );

        return;

    }


    const rows =
        data || [];


    savedTodayMinutes =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.duration_minutes ||
                    0
                ),
            0
        );


    $("todaySessions")
        .textContent =
        rows.length;


    $("sessionList")
        .innerHTML =
        rows.length
            ?
            rows.map(
                row => {

                    const subject =
                        subjects.find(
                            item =>
                                item.id ===
                                row.subject_id
                        );


                    return `
                        <div class="module-row">

                            <div class="module-row-main">

                                <strong>
                                    ${
                                        phEscape(
                                            subject
                                                ?.name
                                            ||
                                            "Subject"
                                        )
                                    }
                                </strong>

                                <span>
                                    ${
                                        phEscape(
                                            row.session_type
                                            ||
                                            "Study"
                                        )
                                    }

                                    •
                                    ${
                                        row.duration_minutes
                                        ||
                                        0
                                    } min

                                    ${
                                        row.notes
                                            ?
                                            ` • ${
                                                phEscape(
                                                    row.notes
                                                )
                                            }`
                                            :
                                            ""
                                    }
                                </span>

                            </div>

                        </div>
                    `;

                }
            )
            .join("")
            :
            `
                <div class="empty-mini">
                    No sessions saved today.
                </div>
            `;


    updateDailyProgress();

}


// =====================================================
// LOAD DAILY GOAL
// =====================================================

async function loadDailyGoal() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "app_settings"
        )
        .select(
            "daily_study_goal_minutes,pomodoro_study_minutes,pomodoro_break_minutes"
        )
        .eq(
            "user_id",
            timerUser
        )
        .limit(1);


    if (error) {

        console.error(
            "Timer settings load failed:",
            error
        );

        return;

    }


    const settings =
        data?.[0];


    if (!settings) {
        return;
    }


    dailyGoalMinutes =
        Number(
            settings
                .daily_study_goal_minutes
            ||
            480
        );


    // Only use Settings defaults if there isn't
    // already an active/restored timer.
    if (
        getElapsedSeconds() ===
        0
    ) {

        if (
            settings
                .pomodoro_study_minutes
        ) {

            timerState
                .pomodoroStudyMinutes =
                Number(
                    settings
                        .pomodoro_study_minutes
                );

        }


        if (
            settings
                .pomodoro_break_minutes
        ) {

            timerState
                .pomodoroBreakMinutes =
                Number(
                    settings
                        .pomodoro_break_minutes
                );

        }

    }

}


// =====================================================
// RESTORE UI
// =====================================================

function restoreTimerUI() {

    $("timerType").value =
        timerState.type ||
        "Stopwatch";


    $("pomodoroStudy").value =
        timerState
            .pomodoroStudyMinutes ||
        25;


    $("pomodoroBreak").value =
        timerState
            .pomodoroBreakMinutes ||
        5;


    $("timerNotes").value =
        timerState.notes ||
        "";


    if (
        timerState.subjectId &&
        subjects.some(
            subject =>
                subject.id ===
                timerState.subjectId
        )
    ) {

        $("timerSubject").value =
            timerState.subjectId;

    }


    renderTimer();

}


// =====================================================
// LIVE UI REFRESH
//
// Important:
// We do NOT depend on this interval for actual time.
// Actual elapsed time comes from Date.now() - startedAt.
// So background tab throttling cannot lose study time.
// =====================================================

setInterval(
    function () {

        renderTimer();

    },
    1000
);


// Re-render instantly when returning to tab
document.addEventListener(
    "visibilitychange",
    function () {

        if (
            !document.hidden
        ) {

            renderTimer();

        }

    }
);


// Save current selections before leaving page
window.addEventListener(
    "beforeunload",
    saveTimerState
);


// =====================================================
// START TIMER PAGE
// =====================================================

(async function startTimerPage() {

    const session =
        await phSession();


    if (!session) {
        return;
    }


    timerUser =
        session.user.id;


    subjects =
        await phSubjects(
            timerUser
        );


    $("timerSubject")
        .innerHTML =
        subjects
            .map(
                subject =>
                    `
                    <option
                        value="${
                            subject.id
                        }"
                    >
                        ${
                            phEscape(
                                subject.name
                            )
                        }
                    </option>
                    `
            )
            .join("");


    // Restore active timer FIRST
    loadTimerState();


    await loadDailyGoal();


    restoreTimerUI();


    await loadToday();


    renderTimer();


    console.log(
        "Persistent Study Timer ready"
    );

})();