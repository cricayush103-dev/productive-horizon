// =====================================================
// PRODUCTIVE HORIZON - DASHBOARD CLOUD WIRING
// Study stats + tasks + countdown + syllabus progress
// =====================================================

(async function () {
    try {
        const {
            data: { session },
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError) {
            console.error(
                "Dashboard session error:",
                sessionError
            );
            return;
        }

        if (!session) {
            return;
        }

        const uid = session.user.id;

        // =============================================
        // LOCAL DATE
        // =============================================

        const localDate = (date = new Date()) => {

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    date.getDate()
                ).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };


        const today =
            localDate();


        const start =
            new Date();

        start.setDate(
            start.getDate() - 59
        );

        const startStr =
            localDate(start);


        // =============================================
        // LOAD CLOUD DATA
        // =============================================

        const [
            sessionsResult,
            tasksResult,
            settingsResult,
            sectionsResult,
            subjectsResult,
            topicsResult,
            subtopicsResult
        ] = await Promise.all([

            supabaseClient
                .from("study_sessions")
                .select("*")
                .eq("user_id", uid)
                .gte(
                    "session_date",
                    startStr
                )
                .lte(
                    "session_date",
                    today
                ),

            supabaseClient
                .from("tasks")
                .select("*")
                .eq("user_id", uid)
                .gte(
                    "task_date",
                    startStr
                )
                .lte(
                    "task_date",
                    today
                ),

            supabaseClient
                .from("app_settings")
                .select("*")
                .eq("user_id", uid)
                .limit(1),

            supabaseClient
                .from("sections")
                .select("*")
                .eq("user_id", uid)
                .eq(
                    "archived",
                    false
                )
                .order(
                    "position",
                    {
                        ascending: true
                    }
                ),

            supabaseClient
                .from("subjects")
                .select("*")
                .eq("user_id", uid)
                .eq(
                    "archived",
                    false
                )
                .order(
                    "position",
                    {
                        ascending: true
                    }
                ),

            supabaseClient
                .from("topics")
                .select("*")
                .eq("user_id", uid)
                .order(
                    "position",
                    {
                        ascending: true
                    }
                ),

            supabaseClient
                .from("subtopics")
                .select("*")
                .eq("user_id", uid)
                .order(
                    "position",
                    {
                        ascending: true
                    }
                )

        ]);


        // =============================================
        // ERRORS
        // =============================================

        if (sessionsResult.error) {
            console.error(
                "Dashboard sessions error:",
                sessionsResult.error
            );
        }

        if (tasksResult.error) {
            console.error(
                "Dashboard tasks error:",
                tasksResult.error
            );
        }

        if (settingsResult.error) {
            console.error(
                "Dashboard settings error:",
                settingsResult.error
            );
        }

        if (sectionsResult.error) {
            console.error(
                "Dashboard sections error:",
                sectionsResult.error
            );
        }

        if (subjectsResult.error) {
            console.error(
                "Dashboard subjects error:",
                subjectsResult.error
            );
        }

        if (topicsResult.error) {
            console.error(
                "Dashboard topics error:",
                topicsResult.error
            );
        }

        if (subtopicsResult.error) {
            console.error(
                "Dashboard subtopics error:",
                subtopicsResult.error
            );
        }


        // =============================================
        // DATA
        // =============================================

        const sessions =
            sessionsResult.data || [];

        const allTasks =
            tasksResult.data || [];

        const setting =
            settingsResult.data?.[0] ||
            null;

        const sectionRows =
            sectionsResult.data || [];

        const subjectRows =
            subjectsResult.data || [];

        const topicRows =
            topicsResult.data || [];

        const subtopicRows =
            subtopicsResult.data || [];


        // =============================================
        // TODAY STATS
        // =============================================

        const todaysSessions =
            sessions.filter(
                session =>
                    session.session_date ===
                    today
            );


        const todayTasks =
            allTasks.filter(
                task =>
                    task.task_date ===
                    today
            );


        const studyMinutes =
            todaysSessions.reduce(
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


        const completedTasks =
            todayTasks.filter(
                task =>
                    task.status ===
                    "Completed"
            ).length;


        const taskCompletionPercentage =
            todayTasks.length > 0
                ?
                Math.round(
                    (
                        completedTasks /
                        todayTasks.length
                    ) *
                    100
                )
                :
                0;


        // =============================================
        // EXAM COUNTDOWN
        // =============================================

        const examDays =
            document.getElementById(
                "examDays"
            );


        if (examDays) {

            if (
                setting &&
                setting.exam_date
            ) {

                const [
                    year,
                    month,
                    day
                ] =
                setting.exam_date
                    .split("-")
                    .map(Number);


                const examDate =
                    new Date(
                        year,
                        month - 1,
                        day
                    );


                const now =
                    new Date();


                const todayMidnight =
                    new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                    );


                const millisecondsPerDay =
                    24 *
                    60 *
                    60 *
                    1000;


                const daysLeft =
                    Math.ceil(
                        (
                            examDate -
                            todayMidnight
                        ) /
                        millisecondsPerDay
                    );


                if (daysLeft > 0) {

                    examDays.textContent =
                        daysLeft;

                }

                else if (
                    daysLeft === 0
                ) {

                    examDays.textContent =
                        "TODAY";

                }

                else {

                    examDays.textContent =
                        "0";

                }

            }

            else {

                examDays.textContent =
                    "--";

            }

        }


        // =============================================
        // EXAM NAME
        // =============================================

        const examCardTitle =
            document.querySelector(
                ".exam-card p"
            );


        if (
            examCardTitle &&
            setting?.exam_name
        ) {

            examCardTitle.textContent =
                `🎯 ${setting.exam_name}`;

        }


        // =============================================
        // DASHBOARD CARDS
        // =============================================

        const cards =
            document.querySelectorAll(
                ".stat-card"
            );


        // =============================================
        // CURRENT STREAK
        // =============================================

        if (cards[0]) {

            let streak = 0;


            for (
                let i = 0;
                i < 60;
                i++
            ) {

                const date =
                    new Date();


                date.setDate(
                    date.getDate() -
                    i
                );


                const dateString =
                    localDate(date);


                const studied =
                    sessions.some(
                        session =>
                            session.session_date ===
                            dateString &&
                            Number(
                                session.duration_minutes ||
                                0
                            ) > 0
                    )
                    ||
                    allTasks.some(
                        task =>
                            task.task_date ===
                            dateString &&
                            task.status ===
                            "Completed"
                    );


                if (studied) {

                    streak++;

                }

                else if (
                    i > 0
                ) {

                    break;

                }

            }


            const heading =
                cards[0]
                    .querySelector(
                        "h2"
                    );


            if (heading) {

                heading.textContent =
                    `${streak} Days`;

            }

        }


        // =============================================
        // STUDY TODAY
        // =============================================

        if (cards[1]) {

            const heading =
                cards[1]
                    .querySelector(
                        "h2"
                    );


            const subtitle =
                cards[1]
                    .querySelector(
                        "span"
                    );


            if (heading) {

                heading.textContent =
                    `${
                        Math.floor(
                            studyMinutes /
                            60
                        )
                    }h ${
                        String(
                            studyMinutes %
                            60
                        ).padStart(
                            2,
                            "0"
                        )
                    }m`;

            }


            const dailyGoal =
                Number(
                    setting
                        ?.daily_study_goal_minutes
                    ||
                    480
                );


            if (subtitle) {

                subtitle.textContent =
                    `Goal: ${
                        Math.floor(
                            dailyGoal /
                            60
                        )
                    }h ${
                        dailyGoal %
                        60
                    }m`;

            }

        }


        // =============================================
        // TASK COMPLETION
        // =============================================

        if (cards[2]) {

            const heading =
                cards[2]
                    .querySelector(
                        "h2"
                    );


            const subtitle =
                cards[2]
                    .querySelector(
                        "span"
                    );


            if (heading) {

                heading.textContent =
                    `${taskCompletionPercentage}%`;

            }


            if (subtitle) {

                subtitle.textContent =
                    `${completedTasks} of ${todayTasks.length} tasks`;

            }

        }


        // =============================================
        // PRODUCTIVITY SCORE
        // =============================================

        if (cards[3]) {

            const heading =
                cards[3]
                    .querySelector(
                        "h2"
                    );


            const dailyGoal =
                Math.max(
                    1,
                    Number(
                        setting
                            ?.daily_study_goal_minutes
                        ||
                        480
                    )
                );


            const studyScore =
                Math.min(
                    5,
                    (
                        studyMinutes /
                        dailyGoal
                    ) *
                    5
                );


            const taskScore =
                todayTasks.length > 0
                    ?
                    (
                        completedTasks /
                        todayTasks.length
                    ) *
                    5
                    :
                    0;


            const productivityScore =
                Math.min(
                    10,
                    studyScore +
                    taskScore
                );


            if (heading) {

                heading.textContent =
                    `${
                        productivityScore
                            .toFixed(1)
                    } / 10`;

            }

        }

// =============================================
// 7-DAY PRODUCTIVITY TREND
// Same formula as today's card:
// 5 points Study + 5 points Tasks
// =============================================

const trendDailyGoal =
    Math.max(
        1,
        Number(
            setting
                ?.daily_study_goal_minutes
            ||
            480
        )
    );


function getProductivityForDate(
    dateString
) {

    const daySessions =
        sessions.filter(
            session =>
                session.session_date ===
                dateString
        );


    const dayTasks =
        allTasks.filter(
            task =>
                task.task_date ===
                dateString
        );


    const dayStudyMinutes =
        daySessions.reduce(
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


    const completedTasks =
        dayTasks.filter(
            task =>
                task.status ===
                "Completed"
        ).length;


    const studyScore =
        Math.min(
            5,
            (
                dayStudyMinutes /
                trendDailyGoal
            ) *
            5
        );


    const taskScore =
        dayTasks.length > 0
            ?
            (
                completedTasks /
                dayTasks.length
            ) *
            5
            :
            0;


    const productivityScore =
        Math.min(
            10,
            studyScore +
            taskScore
        );


    return Number(
        productivityScore
            .toFixed(1)
    );
}


// =============================================
// BUILD LAST 7 DAYS DATA
// =============================================

const trendLabels =
    [];

const trendScores =
    [];


for (
    let offset = 6;
    offset >= 0;
    offset--
) {

    const trendDate =
        new Date();


    // Noon avoids timezone/date-edge problems
    trendDate.setHours(
        12,
        0,
        0,
        0
    );


    trendDate.setDate(
        trendDate.getDate() -
        offset
    );


    const trendDateString =
        localDate(
            trendDate
        );


    const dayLabel =
        trendDate
            .toLocaleDateString(
                undefined,
                {
                    weekday:
                        "short"
                }
            );


    trendLabels.push(
        dayLabel
    );


    trendScores.push(
        getProductivityForDate(
            trendDateString
        )
    );
}


// =============================================
// UPDATE PRODUCTIVITY BAR CHART
// =============================================

const productivityCanvas =
    document.getElementById(
        "productivityChart"
    );


if (
    productivityCanvas &&
    typeof Chart !==
    "undefined"
) {

    const productivityChart =
        Chart.getChart(
            productivityCanvas
        );


    if (
        productivityChart
    ) {

        productivityChart
            .data
            .labels =
            trendLabels;


        if (
            productivityChart
                .data
                .datasets?.[0]
        ) {

            productivityChart
                .data
                .datasets[0]
                .data =
                trendScores;

        }


        productivityChart.update();

    }

}
        // =============================================
        // SUBJECT PROGRESS LOGIC
        // SAME LOGIC AS subjects.js
        // =============================================

        function calculateSubjectProgress(
            subject
        ) {

            const subjectTopics =
                topicRows.filter(
                    topic =>
                        topic.subject_id ===
                        subject.id
                );


            if (
                subjectTopics.length ===
                0
            ) {

                return {
                    percentage:
                        subject.completed
                            ? 100
                            : 0,

                    completedUnits:
                        subject.completed
                            ? 1
                            : 0,

                    totalUnits:
                        1
                };

            }


            let completedUnits = 0;
            let totalUnits = 0;


            subjectTopics.forEach(
                function (topic) {

                    const topicSubtopics =
                        subtopicRows.filter(
                            subtopic =>
                                subtopic.topic_id ===
                                topic.id
                        );


                    // Topic without subtopics
                    if (
                        topicSubtopics.length ===
                        0
                    ) {

                        totalUnits++;


                        if (
                            topic.completed
                        ) {

                            completedUnits++;

                        }

                    }

                    // Topic with subtopics
                    else {

                        topicSubtopics.forEach(
                            function (
                                subtopic
                            ) {

                                totalUnits++;


                                if (
                                    subtopic.completed
                                ) {

                                    completedUnits++;

                                }

                            }
                        );

                    }

                }
            );


            const percentage =
                totalUnits > 0
                    ?
                    Math.round(
                        (
                            completedUnits /
                            totalUnits
                        ) *
                        100
                    )
                    :
                    0;


            return {
                percentage:
                    percentage,

                completedUnits:
                    completedUnits,

                totalUnits:
                    totalUnits
            };

        }


        // =============================================
        // SECTION PROGRESS
        // =============================================

        function calculateSectionProgress(
            section
        ) {

            const sectionSubjects =
                subjectRows.filter(
                    subject =>
                        subject.section_id ===
                        section.id
                );


            if (
                sectionSubjects.length ===
                0
            ) {

                return {
                    percentage: 0,
                    completedUnits: 0,
                    totalUnits: 0
                };

            }


            let completedUnits = 0;
            let totalUnits = 0;


            sectionSubjects.forEach(
                function (subject) {

                    const progress =
                        calculateSubjectProgress(
                            subject
                        );


                    completedUnits +=
                        progress.completedUnits;


                    totalUnits +=
                        progress.totalUnits;

                }
            );


            const percentage =
                totalUnits > 0
                    ?
                    Math.round(
                        (
                            completedUnits /
                            totalUnits
                        ) *
                        100
                    )
                    :
                    0;


            return {
                percentage:
                    percentage,

                completedUnits:
                    completedUnits,

                totalUnits:
                    totalUnits
            };

        }


        // =============================================
        // OVERALL SYLLABUS
        // =============================================

        let overallCompleted =
            0;

        let overallTotal =
            0;


        sectionRows.forEach(
            function (section) {

                const progress =
                    calculateSectionProgress(
                        section
                    );


                overallCompleted +=
                    progress.completedUnits;


                overallTotal +=
                    progress.totalUnits;

            }
        );


        const overallPercentage =
            overallTotal > 0
                ?
                Math.round(
                    (
                        overallCompleted /
                        overallTotal
                    ) *
                    100
                )
                :
                0;


        // =============================================
        // SAFE HTML
        // =============================================

        function escapeDashboardHTML(
            value
        ) {

            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                value || "";


            return div.innerHTML;

        }


        // =============================================
        // RENDER SYLLABUS PROGRESS
        // =============================================

        const subjectProgressContainer =
            document.querySelector(
                ".subject-progress"
            );


        if (
            subjectProgressContainer
        ) {

            subjectProgressContainer
                .innerHTML =
                "";


            // =========================================
            // EACH SECTION
            // =========================================

            sectionRows.forEach(
                function (section) {

                    const progress =
                        calculateSectionProgress(
                            section
                        );


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "progress-item";


                    item.innerHTML = `

                        <div
                            class="progress-info"
                        >

                            <span>
                                ${
                                    escapeDashboardHTML(
                                        section.name
                                    )
                                }
                            </span>

                            <strong>
                                ${
                                    progress.percentage
                                }%
                            </strong>

                        </div>


                        <div
                            class="progress-bar"
                        >

                            <div
                                class="progress-fill"
                                style="
                                    width:
                                    ${
                                        progress.percentage
                                    }%
                                "
                            ></div>

                        </div>
                    `;


                    subjectProgressContainer
                        .appendChild(
                            item
                        );

                }
            );


            // =========================================
            // OVERALL SYLLABUS
            // =========================================

            const overallItem =
                document.createElement(
                    "div"
                );


            overallItem.className =
                "progress-item";


            overallItem.innerHTML = `

                <div
                    class="progress-info"
                >

                    <span>
                        <strong>
                            Overall Syllabus
                        </strong>
                    </span>

                    <strong>
                        ${
                            overallPercentage
                        }%
                    </strong>

                </div>


                <div
                    class="progress-bar"
                >

                    <div
                        class="progress-fill"
                        style="
                            width:
                            ${
                                overallPercentage
                            }%
                        "
                    ></div>

                </div>
            `;


            subjectProgressContainer
                .appendChild(
                    overallItem
                );

        }


        console.log(
            "Dashboard countdown + syllabus progress ready",
            {
                overallPercentage:
                    overallPercentage,

                sections:
                    sectionRows.length,

                subjects:
                    subjectRows.length
            }
        );

    }

    catch (error) {

        console.error(
            "Dashboard extra wiring failed:",
            error
        );

    }

})();