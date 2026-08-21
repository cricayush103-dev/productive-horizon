// =====================================================
// PRODUCTIVE HORIZON
// DAILY TARGET VS ACTUAL
// =====================================================

let dpUserId =
    null;


let dpSubjects =
    [];


let dpChart =
    null;


const DP =
    id =>
        document.getElementById(
            id
        );


// =====================================================
// LOCAL DATE
// =====================================================

function dpToday() {

    if (
        typeof phLocalDate ===
        "function"
    ) {

        return phLocalDate();

    }


    const d =
        new Date();


    return (
        `${d.getFullYear()}-` +
        `${String(
            d.getMonth() + 1
        ).padStart(2,"0")}-` +
        `${String(
            d.getDate()
        ).padStart(2,"0")}`
    );

}


// =====================================================
// MINUTES FORMAT
// =====================================================

function dpFormatMinutes(
    minutes
) {

    minutes =
        Math.max(
            0,
            Math.round(
                Number(
                    minutes ||
                    0
                )
            )
        );


    const hours =
        Math.floor(
            minutes /
            60
        );


    const mins =
        minutes %
        60;


    return (
        `${hours}h ` +
        `${String(
            mins
        ).padStart(2,"0")}m`
    );

}


// =====================================================
// SUBJECT NAME
// =====================================================

function dpSubjectName(
    id
) {

    return (
        dpSubjects.find(
            subject =>
                subject.id ===
                id
        )
        ?.name
        ||
        "No Subject"
    );

}


// =====================================================
// SAFE PERCENT
// =====================================================

function dpPercent(
    value,
    total
) {

    if (
        !total
    ) {

        return value > 0
            ?
            100
            :
            0;

    }


    return Math.round(
        value *
        100 /
        total
    );

}


// =====================================================
// LOAD ONE DAY
// =====================================================

async function loadDailyPerformance() {

    const date =
        DP(
            "dailyPerformanceDate"
        ).value;


    if (
        !date
    ) {

        return;

    }


    DP(
        "dailyVerdict"
    ).textContent =
        "Loading...";


    const [
        taskResponse,
        sessionResponse,
        settingResponse
    ] =
    await Promise.all([

        supabaseClient
            .from(
                "tasks"
            )
            .select(
                "*"
            )
            .eq(
                "user_id",
                dpUserId
            )
            .eq(
                "task_date",
                date
            ),

        supabaseClient
            .from(
                "study_sessions"
            )
            .select(
                "*"
            )
            .eq(
                "user_id",
                dpUserId
            )
            .eq(
                "session_date",
                date
            ),

        supabaseClient
            .from(
                "app_settings"
            )
            .select(
                "*"
            )
            .eq(
                "user_id",
                dpUserId
            )
            .limit(
                1
            )

    ]);


    if (
        taskResponse.error
    ) {

        console.error(
            taskResponse.error
        );

    }


    if (
        sessionResponse.error
    ) {

        console.error(
            sessionResponse.error
        );

    }


    const tasks =
        taskResponse.data ||
        [];


    const sessions =
        sessionResponse.data ||
        [];


    const setting =
        settingResponse.data?.[0]
        ||
        null;


    renderDailyPerformance(
        tasks,
        sessions,
        setting
    );

}


// =====================================================
// MAIN ANALYSIS
// =====================================================

function renderDailyPerformance(
    tasks,
    sessions,
    setting
) {

    // =============================================
    // TOTAL PLANNED
    // =============================================

    const plannedMinutes =
        tasks.reduce(
            (
                total,
                task
            ) =>
                total +
                Number(
                    task.planned_minutes ||
                    0
                ),
            0
        );


    // =============================================
    // TOTAL ACTUAL
    // =============================================

    const actualMinutes =
        sessions.reduce(
            (
                total,
                session
            ) =>
                total +
                Number(
                    session.duration_minutes ||
                    0
                ),
            0
        );


    // =============================================
    // TASKS
    // =============================================

    const completedTasks =
        tasks.filter(
            task =>
                task.status ===
                "Completed"
        ).length;


    const taskPercent =
        dpPercent(
            completedTasks,
            tasks.length
        );


    // =============================================
    // TIME ACHIEVEMENT
    // =============================================

    const timeAchievement =
        dpPercent(
            actualMinutes,
            plannedMinutes
        );


    // =============================================
    // DAILY GOAL
    // =============================================

    const dailyGoal =
        Number(
            setting
                ?.daily_study_goal_minutes
            ||
            480
        );


    // =============================================
    // CARDS
    // =============================================

    DP(
        "dailyPlanned"
    ).textContent =
        dpFormatMinutes(
            plannedMinutes
        );


    DP(
        "dailyActual"
    ).textContent =
        dpFormatMinutes(
            actualMinutes
        );


    DP(
        "dailyGoalText"
    ).textContent =
        `Daily goal: ${
            dpFormatMinutes(
                dailyGoal
            )
        }`;


    DP(
        "dailyAchievement"
    ).textContent =
        `${timeAchievement}%`;


    DP(
        "dailyAchievementBar"
    ).style.width =
        `${
            Math.min(
                100,
                timeAchievement
            )
        }%`;


    DP(
        "dailyTasks"
    ).textContent =
        `${completedTasks} / ${tasks.length}`;


    DP(
        "dailyTaskPercent"
    ).textContent =
        `${taskPercent}% completed`;


    // =============================================
    // SUBJECT DATA
    // =============================================

    const subjectMap =
        new Map();


    tasks.forEach(
        task => {

            const subjectId =
                task.subject_id ||
                "none";


            if (
                !subjectMap.has(
                    subjectId
                )
            ) {

                subjectMap.set(
                    subjectId,
                    {
                        subjectId:
                            subjectId,

                        planned:
                            0,

                        actual:
                            0
                    }
                );

            }


            subjectMap
                .get(
                    subjectId
                )
                .planned +=
                Number(
                    task.planned_minutes ||
                    0
                );

        }
    );


    sessions.forEach(
        session => {

            const subjectId =
                session.subject_id ||
                "none";


            if (
                !subjectMap.has(
                    subjectId
                )
            ) {

                subjectMap.set(
                    subjectId,
                    {
                        subjectId:
                            subjectId,

                        planned:
                            0,

                        actual:
                            0
                    }
                );

            }


            subjectMap
                .get(
                    subjectId
                )
                .actual +=
                Number(
                    session.duration_minutes ||
                    0
                );

        }
    );


    const subjectRows =
        [
            ...subjectMap.values()
        ];


    renderSubjectBreakdown(
        subjectRows
    );


    renderDailyChart(
        subjectRows
    );


    renderTaskBreakdown(
        tasks
    );


    renderVerdict({

        plannedMinutes:
            plannedMinutes,

        actualMinutes:
            actualMinutes,

        completedTasks:
            completedTasks,

        totalTasks:
            tasks.length,

        taskPercent:
            taskPercent,

        timeAchievement:
            timeAchievement,

        dailyGoal:
            dailyGoal

    });

}


// =====================================================
// SUBJECT BREAKDOWN
// =====================================================

function renderSubjectBreakdown(
    rows
) {

    const container =
        DP(
            "dailySubjectBreakdown"
        );


    const header = `

        <div
            class="
                daily-subject-row
                daily-subject-header
            "
        >

            <div>
                Subject
            </div>

            <div>
                Planned
            </div>

            <div>
                Actual
            </div>

            <div>
                Achievement
            </div>

        </div>

    `;


    if (
        !rows.length
    ) {

        container.innerHTML =
            header +
            `

            <div class="empty-mini">
                No subject data for this day.
            </div>

            `;


        return;

    }


    container.innerHTML =
        header +
        rows
            .sort(
                (
                    a,
                    b
                ) =>
                    (
                        b.planned +
                        b.actual
                    )
                    -
                    (
                        a.planned +
                        a.actual
                    )
            )
            .map(
                row => {

                    const pct =
                        dpPercent(
                            row.actual,
                            row.planned
                        );


                    let css =
                        "daily-danger";


                    if (
                        pct >= 100
                    ) {

                        css =
                            "daily-positive";

                    }

                    else if (
                        pct >= 70
                    ) {

                        css =
                            "daily-warning";

                    }


                    return `

                    <div
                        class="
                            daily-subject-row
                        "
                    >

                        <div
                            class="
                                daily-subject-name
                            "
                        >

                            ${
                                row.subjectId ===
                                "none"
                                    ?
                                    "Unassigned"
                                    :
                                    phEscape(
                                        dpSubjectName(
                                            row.subjectId
                                        )
                                    )
                            }

                        </div>


                        <div>

                            ${
                                dpFormatMinutes(
                                    row.planned
                                )
                            }

                        </div>


                        <div>

                            ${
                                dpFormatMinutes(
                                    row.actual
                                )
                            }

                        </div>


                        <div
                            class="${css}"
                        >

                            ${pct}%

                        </div>

                    </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// BAR CHART
// =====================================================

function renderDailyChart(
    rows
) {

    const canvas =
        DP(
            "dailyPerformanceChart"
        );


    if (
        dpChart
    ) {

        dpChart.destroy();

    }


    const sorted =
        [
            ...rows
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    (
                        b.planned +
                        b.actual
                    )
                    -
                    (
                        a.planned +
                        a.actual
                    )
            );


    const labels =
        sorted.map(
            row =>
                row.subjectId ===
                "none"
                    ?
                    "Unassigned"
                    :
                    dpSubjectName(
                        row.subjectId
                    )
        );


    dpChart =
        new Chart(
            canvas,
            {

                type:
                    "bar",


                data: {

                    labels:
                        labels,


                    datasets: [

                        {

                            label:
                                "Planned Minutes",

                            data:
                                sorted.map(
                                    row =>
                                        row.planned
                                ),

                            borderWidth:
                                1,

                            borderRadius:
                                6,

                            borderSkipped:
                                false

                        },


                        {

                            label:
                                "Actual Minutes",

                            data:
                                sorted.map(
                                    row =>
                                        row.actual
                                ),

                            borderWidth:
                                1,

                            borderRadius:
                                6,

                            borderSkipped:
                                false

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            title: {

                                display:
                                    true,

                                text:
                                    "Minutes"

                            }

                        }

                    }

                }

            }
        );

}


// =====================================================
// TASK LIST
// =====================================================

function renderTaskBreakdown(
    tasks
) {

    const container =
        DP(
            "dailyTaskList"
        );


    if (
        !tasks.length
    ) {

        container.innerHTML =
            `

            <div class="empty-mini">
                No tasks planned for this date.
            </div>

            `;


        return;

    }


    container.innerHTML =
        tasks
            .map(
                task => {

                    const done =
                        task.status ===
                        "Completed";


                    return `

                    <div
                        class="
                            daily-task-row
                        "
                    >

                        <div
                            class="
                                daily-task-title
                            "
                        >

                            <strong>

                                ${
                                    done
                                        ?
                                        "✅"
                                        :
                                        "⬜"
                                }

                                ${
                                    phEscape(
                                        task.title
                                    )
                                }

                            </strong>


                            <span>

                                ${
                                    phEscape(
                                        dpSubjectName(
                                            task.subject_id
                                        )
                                    )
                                }

                                ${
                                    task.priority
                                        ?
                                        ` • ${
                                            phEscape(
                                                task.priority
                                            )
                                        }`
                                        :
                                        ""
                                }

                            </span>

                        </div>


                        <div>

                            ${
                                dpFormatMinutes(
                                    task.planned_minutes ||
                                    0
                                )
                            }

                        </div>


                        <div>

                            ${
                                done
                                    ?
                                    "Completed"
                                    :
                                    task.status ||
                                    "Not Started"
                            }

                        </div>

                    </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// DAILY VERDICT
// =====================================================

function renderVerdict(
    data
) {

    const {
        plannedMinutes,
        actualMinutes,
        taskPercent,
        timeAchievement,
        dailyGoal
    } =
    data;


    if (
        plannedMinutes ===
        0
        &&
        actualMinutes ===
        0
    ) {

        DP(
            "dailyVerdict"
        ).textContent =
            "No data yet";


        DP(
            "dailyVerdictDetail"
        ).textContent =
            "No planned tasks or study sessions exist for this date.";


        return;

    }


    /*
        Combined execution:

        60% study-time execution
        40% task completion

        Time score capped at 100 so
        overstudying does not hide task misses.
    */

    const execution =
        Math.round(

            Math.min(
                100,
                timeAchievement
            )
            *
            0.60

            +

            taskPercent *
            0.40

        );


    let verdict =
        "🔴 Poor Execution";


    if (
        execution >=
        90
    ) {

        verdict =
            "🔥 Excellent Execution";

    }

    else if (
        execution >=
        75
    ) {

        verdict =
            "🟢 Strong Day";

    }

    else if (
        execution >=
        60
    ) {

        verdict =
            "🟡 Decent, But Improve";

    }

    else if (
        execution >=
        40
    ) {

        verdict =
            "🟠 Behind Plan";

    }


    DP(
        "dailyVerdict"
    ).textContent =
        `${verdict} • ${execution}/100`;


    const timeGap =
        actualMinutes -
        plannedMinutes;


    let gapText =
        "";


    if (
        plannedMinutes >
        0
    ) {

        if (
            timeGap >=
            0
        ) {

            gapText =
                `You studied ${
                    dpFormatMinutes(
                        timeGap
                    )
                } more than planned.`;

        }

        else {

            gapText =
                `You studied ${
                    dpFormatMinutes(
                        Math.abs(
                            timeGap
                        )
                    )
                } less than planned.`;

        }

    }


    const goalGap =
        actualMinutes -
        dailyGoal;


    const goalText =
        goalGap >= 0
            ?
            `Daily study goal crossed by ${
                dpFormatMinutes(
                    goalGap
                )
            }.`
            :
            `Daily study goal short by ${
                dpFormatMinutes(
                    Math.abs(
                        goalGap
                    )
                )
            }.`;


    DP(
        "dailyVerdictDetail"
    ).textContent =
        (
            `${gapText} ` +
            `${taskPercent}% of tasks completed. ` +
            goalText
        );

}


// =====================================================
// DATE CHANGE
// =====================================================

DP(
    "dailyPerformanceDate"
)
.addEventListener(
    "change",
    loadDailyPerformance
);


// =====================================================
// TODAY
// =====================================================

DP(
    "dailyTodayButton"
)
.addEventListener(
    "click",
    function () {

        DP(
            "dailyPerformanceDate"
        ).value =
            dpToday();


        loadDailyPerformance();

    }
);


// =====================================================
// START
// =====================================================

(async function () {

    const session =
        await phSession();


    if (
        !session
    ) {

        return;

    }


    dpUserId =
        session.user.id;


    dpSubjects =
        await phSubjects(
            dpUserId
        );


    DP(
        "dailyPerformanceDate"
    ).value =
        dpToday();


    await loadDailyPerformance();


    console.log(
        "Daily Target vs Actual ready ✅"
    );

})();