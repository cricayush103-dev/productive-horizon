// =====================================================
// PRODUCTIVE HORIZON - CLOUD PLANNER
// =====================================================

const plannerDate =
    document.getElementById("plannerDate");

const plannerTaskList =
    document.getElementById("plannerTaskList");

const plannerTotal =
    document.getElementById("plannerTotal");

const plannerCompleted =
    document.getElementById("plannerCompleted");

const plannerPending =
    document.getElementById("plannerPending");

const plannerMinutes =
    document.getElementById("plannerMinutes");

const plannerHeading =
    document.getElementById("plannerHeading");

const previousDayButton =
    document.getElementById("previousDayButton");

const nextDayButton =
    document.getElementById("nextDayButton");

const todayButton =
    document.getElementById("todayButton");

const plannerThemeButton =
    document.getElementById("plannerThemeButton");


let currentUserId = null;

let plannerTasks = [];

let subjectMap = {};


// =====================================================
// DATE HELPERS
// =====================================================

function toLocalDateString(date) {

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
}


function parseLocalDate(value) {

    const [
        year,
        month,
        day
    ] =
    value.split("-").map(Number);


    return new Date(
        year,
        month - 1,
        day
    );
}


// =====================================================
// AUTH
// =====================================================

async function getCurrentUser() {

    const {
        data: { session },
        error
    } =
    await supabaseClient
        .auth
        .getSession();


    if (error) {

        console.error(error);

        return false;
    }


    if (!session) {

        window.location.href =
            "login.html";

        return false;
    }


    currentUserId =
        session.user.id;


    return true;
}


// =====================================================
// SUBJECTS
// =====================================================

async function loadSubjects() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from("subjects")
        .select("id,name")
        .eq(
            "user_id",
            currentUserId
        );


    if (error) {

        console.error(
            "Subject loading failed:",
            error
        );

        return;
    }


    subjectMap = {};


    (data || []).forEach(
        subject => {

            subjectMap[
                subject.id
            ] =
                subject.name;

        }
    );
}


// =====================================================
// LOAD TASKS
// =====================================================

async function loadPlannerTasks() {

    plannerTaskList.innerHTML =
        `
        <div class="empty-state">
            <div>☁️</div>
            <h4>Loading planner...</h4>
        </div>
        `;


    const selectedDate =
        plannerDate.value;


    const {
        data,
        error
    } =
    await supabaseClient
        .from("tasks")
        .select("*")
        .eq(
            "user_id",
            currentUserId
        )
        .eq(
            "task_date",
            selectedDate
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Planner loading failed:",
            error
        );


        plannerTaskList.innerHTML =
            `
            <div class="empty-state">
                <div>⚠️</div>
                <h4>Could not load planner</h4>
            </div>
            `;

        return;
    }


    plannerTasks =
        data || [];


    renderPlanner();

    updatePlannerStats();

    updateHeading();
}


// =====================================================
// RENDER
// =====================================================

function renderPlanner() {

    plannerTaskList.innerHTML =
        "";


    if (
        plannerTasks.length === 0
    ) {

        plannerTaskList.innerHTML =
            `
            <div class="empty-state">

                <div>📅</div>

                <h4>
                    No tasks planned
                </h4>

                <p>
                    Add tasks from the Dashboard
                    for this date.
                </p>

            </div>
            `;

        return;
    }


    plannerTasks.forEach(
        function (task) {

            const completed =
                task.status ===
                "Completed";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "planner-task-item";


            item.innerHTML = `

                <input
                    type="checkbox"
                    class="planner-checkbox"
                    ${completed ? "checked" : ""}
                >


                <div class="planner-task-content">

                    <strong
                        style="
                            ${
                                completed
                                ?
                                "text-decoration:line-through;opacity:.5;"
                                :
                                ""
                            }
                        "
                    >
                        ${escapeHTML(task.title)}
                    </strong>


                    <span>

                        ${
                            escapeHTML(
                                subjectMap[
                                    task.subject_id
                                ] ||
                                "No Subject"
                            )
                        }

                        ${
                            task.planned_minutes
                            ?
                            ` • ${task.planned_minutes} min`
                            :
                            ""
                        }

                    </span>

                </div>


                <span class="priority">

                    ${
                        escapeHTML(
                            task.priority ||
                            "Medium"
                        )
                    }

                </span>


                <button
                    class="carry-button"
                    title="Move to next day"
                >
                    →
                </button>


                <button
                    class="delete-task planner-delete"
                    title="Delete"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;


            const checkbox =
                item.querySelector(
                    ".planner-checkbox"
                );


            checkbox.addEventListener(
                "change",
                async function () {

                    await toggleTask(
                        task.id,
                        checkbox.checked
                    );

                }
            );


            const carryButton =
                item.querySelector(
                    ".carry-button"
                );


            carryButton.addEventListener(
                "click",
                async function () {

                    await carryTaskForward(
                        task
                    );

                }
            );


            const deleteButton =
                item.querySelector(
                    ".planner-delete"
                );


            deleteButton.addEventListener(
                "click",
                async function () {

                    await deleteTask(
                        task
                    );

                }
            );


            plannerTaskList.appendChild(
                item
            );

        }
    );
}


// =====================================================
// COMPLETE
// =====================================================

async function toggleTask(
    taskId,
    completed
) {

    const {
        error
    } =
    await supabaseClient
        .from("tasks")
        .update({

            status:
                completed
                ? "Completed"
                : "Not Started",

            completed_at:
                completed
                ?
                new Date().toISOString()
                :
                null

        })
        .eq(
            "id",
            taskId
        )
        .eq(
            "user_id",
            currentUserId
        );


    if (error) {

        alert(
            "Could not update task."
        );

        console.error(error);

        return;
    }


    await loadPlannerTasks();
}


// =====================================================
// CARRY FORWARD
// =====================================================

async function carryTaskForward(
    task
) {

    const currentDate =
        parseLocalDate(
            plannerDate.value
        );


    currentDate.setDate(
        currentDate.getDate() + 1
    );


    const nextDate =
        toLocalDateString(
            currentDate
        );


    const confirmed =
        confirm(
            `Move "${task.title}" to ${nextDate}?`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
    await supabaseClient
        .from("tasks")
        .update({

            task_date:
                nextDate,

            carried_forward:
                true

        })
        .eq(
            "id",
            task.id
        )
        .eq(
            "user_id",
            currentUserId
        );


    if (error) {

        console.error(error);

        alert(
            "Could not move task."
        );

        return;
    }


    await loadPlannerTasks();
}


// =====================================================
// DELETE
// =====================================================

async function deleteTask(
    task
) {

    const confirmed =
        confirm(
            `Delete "${task.title}"?`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
    await supabaseClient
        .from("tasks")
        .delete()
        .eq(
            "id",
            task.id
        )
        .eq(
            "user_id",
            currentUserId
        );


    if (error) {

        console.error(error);

        alert(
            "Could not delete task."
        );

        return;
    }


    await loadPlannerTasks();
}


// =====================================================
// STATS
// =====================================================

function updatePlannerStats() {

    const total =
        plannerTasks.length;


    const completed =
        plannerTasks.filter(
            task =>
                task.status ===
                "Completed"
        ).length;


    const pending =
        total - completed;


    const minutes =
        plannerTasks.reduce(
            (sum, task) =>
                sum +
                Number(
                    task.planned_minutes ||
                    0
                ),
            0
        );


    plannerTotal.textContent =
        total;


    plannerCompleted.textContent =
        completed;


    plannerPending.textContent =
        pending;


    if (minutes >= 60) {

        const hours =
            Math.floor(
                minutes / 60
            );


        const remaining =
            minutes % 60;


        plannerMinutes.textContent =
            `${hours}h ${remaining}m`;

    }

    else {

        plannerMinutes.textContent =
            `${minutes}m`;

    }
}


// =====================================================
// HEADING
// =====================================================

function updateHeading() {

    const date =
        parseLocalDate(
            plannerDate.value
        );


    plannerHeading.textContent =
        date.toLocaleDateString(
            undefined,
            {
                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long"
            }
        );
}


// =====================================================
// DATE NAVIGATION
// =====================================================

plannerDate.addEventListener(
    "change",
    loadPlannerTasks
);


previousDayButton.addEventListener(
    "click",
    function () {

        const date =
            parseLocalDate(
                plannerDate.value
            );


        date.setDate(
            date.getDate() - 1
        );


        plannerDate.value =
            toLocalDateString(
                date
            );


        loadPlannerTasks();

    }
);


nextDayButton.addEventListener(
    "click",
    function () {

        const date =
            parseLocalDate(
                plannerDate.value
            );


        date.setDate(
            date.getDate() + 1
        );


        plannerDate.value =
            toLocalDateString(
                date
            );


        loadPlannerTasks();

    }
);


todayButton.addEventListener(
    "click",
    function () {

        plannerDate.value =
            toLocalDateString(
                new Date()
            );


        loadPlannerTasks();

    }
);


// =====================================================
// HTML SAFETY
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value || "";


    return div.innerHTML;
}


// =====================================================
// DARK MODE
// =====================================================

plannerThemeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        plannerThemeButton.textContent =
            dark
                ? "☀️"
                : "🌙";


        localStorage.setItem(
            "productiveHorizonTheme",
            dark
                ? "dark"
                : "light"
        );

    }
);


if (
    localStorage.getItem(
        "productiveHorizonTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    plannerThemeButton.textContent =
        "☀️";
}


// =====================================================
// START
// =====================================================

async function startPlanner() {

    const authenticated =
        await getCurrentUser();


    if (!authenticated) {
        return;
    }


    plannerDate.value =
        toLocalDateString(
            new Date()
        );


    await loadSubjects();

    await loadPlannerTasks();


    console.log(
        "Productive Horizon Planner ready"
    );
}


startPlanner();