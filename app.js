// =====================================================
// PRODUCTIVE HORIZON
// DASHBOARD + CLOUD TASK MANAGEMENT
// =====================================================


// =====================================================
// DOM
// =====================================================

const taskModal =
    document.getElementById("taskModal");

const addTaskButton =
    document.getElementById("addTaskButton");

const closeModal =
    document.getElementById("closeModal");

const taskForm =
    document.getElementById("taskForm");

const taskList =
    document.getElementById("taskList");

const themeButton =
    document.getElementById("themeButton");

const taskSubjectSelect =
    document.getElementById("taskSubject");

const taskNameInput =
    document.getElementById("taskName");

const plannedMinutesInput =
    document.getElementById("plannedMinutes");

const taskPrioritySelect =
    document.getElementById("taskPriority");


// =====================================================
// STATE
// =====================================================

let currentUserId = null;

let cloudSubjects = [];

let todayTasks = [];


// =====================================================
// LOCAL DATE
// =====================================================

function getLocalDateString() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// =====================================================
// HTML SAFETY
// =====================================================

function escapeHTML(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value || "";

    return element.innerHTML;
}


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    const {
        data: { session },
        error
    } =
    await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        return null;
    }


    if (!session) {

        window.location.href =
            "login.html";

        return null;
    }


    currentUserId =
        session.user.id;


    return session.user;
}


// =====================================================
// TASK MODAL
// =====================================================

addTaskButton.addEventListener(
    "click",
    function () {

        taskModal.classList.add(
            "show"
        );

        taskNameInput.focus();
    }
);


closeModal.addEventListener(
    "click",
    function () {

        taskModal.classList.remove(
            "show"
        );
    }
);


taskModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            taskModal
        ) {

            taskModal.classList.remove(
                "show"
            );
        }
    }
);


// ESC closes modal

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            taskModal.classList.remove(
                "show"
            );
        }
    }
);


// =====================================================
// LOAD SUBJECTS FROM CLOUD
// =====================================================

async function loadSubjects() {

    try {

        const {
            data,
            error
        } =
        await supabaseClient
            .from("subjects")
            .select(
                "id,name,position,section_id"
            )
            .eq(
                "user_id",
                currentUserId
            )
            .eq(
                "archived",
                false
            )
            .order(
                "position",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        cloudSubjects =
            data || [];


        populateSubjectDropdown();

    }

    catch (error) {

        console.error(
            "Could not load subjects:",
            error
        );


        taskSubjectSelect.innerHTML =
            `
            <option value="">
                Could not load subjects
            </option>
            `;
    }
}


// =====================================================
// SUBJECT DROPDOWN
// =====================================================

function populateSubjectDropdown() {

    taskSubjectSelect.innerHTML =
        "";


    if (
        cloudSubjects.length === 0
    ) {

        taskSubjectSelect.innerHTML =
            `
            <option value="">
                No subjects available
            </option>
            `;

        return;
    }


    cloudSubjects.forEach(
        function (subject) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject.id;


            option.textContent =
                subject.name;


            taskSubjectSelect.appendChild(
                option
            );
        }
    );
}


// =====================================================
// SUBJECT NAME HELPER
// =====================================================

function getSubjectName(
    subjectId
) {

    if (!subjectId) {
        return "No Subject";
    }


    const subject =
        cloudSubjects.find(
            item =>
                item.id ===
                subjectId
        );


    return subject
        ? subject.name
        : "Unknown Subject";
}


// =====================================================
// LOAD TODAY TASKS
// =====================================================

async function loadTodayTasks() {

    showTaskLoading();


    try {

        const today =
            getLocalDateString();


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
                today
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        todayTasks =
            data || [];


        renderTasks();

        updateTaskStatistics();

    }

    catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );


        taskList.innerHTML =
            `
            <div class="empty-state">
                <div>⚠️</div>

                <h4>
                    Could not load tasks
                </h4>

                <p>
                    Check your internet connection
                    and refresh.
                </p>
            </div>
            `;
    }
}


// =====================================================
// TASK LOADING
// =====================================================

function showTaskLoading() {

    taskList.innerHTML =
        `
        <div class="empty-state">

            <div>☁️</div>

            <h4>
                Loading tasks...
            </h4>

            <p>
                Syncing with cloud.
            </p>

        </div>
        `;
}


// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks() {

    taskList.innerHTML =
        "";


    if (
        todayTasks.length === 0
    ) {

        showEmptyState();

        return;
    }


    todayTasks.forEach(
        function (taskData) {

            const task =
                document.createElement(
                    "div"
                );


            task.className =
                "task";


            const completed =
                taskData.status ===
                "Completed";


            const subjectName =
                getSubjectName(
                    taskData.subject_id
                );


            task.innerHTML = `

                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${completed ? "checked" : ""}
                >


                <div class="task-content">

                    <strong
                        style="
                            ${
                                completed
                                ?
                                "text-decoration:line-through;opacity:0.5;"
                                :
                                ""
                            }
                        "
                    >
                        ${escapeHTML(taskData.title)}
                    </strong>


                    <span>

                        ${escapeHTML(subjectName)}

                        ${
                            taskData.planned_minutes
                            ?
                            " • " +
                            taskData.planned_minutes +
                            " min"
                            :
                            ""
                        }

                    </span>

                </div>


                <span class="priority">

                    ${escapeHTML(
                        taskData.priority ||
                        "Medium"
                    )}

                </span>


                <button
                    class="delete-task"
                    title="Delete Task"
                    type="button"
                >

                    <i
                        class="fa-solid fa-trash"
                    ></i>

                </button>
            `;


            // -------------------------------------
            // CHECKBOX
            // -------------------------------------

            const checkbox =
                task.querySelector(
                    ".task-checkbox"
                );


            checkbox.addEventListener(
                "change",
                async function () {

                    checkbox.disabled =
                        true;


                    await toggleTaskCompletion(
                        taskData.id,
                        checkbox.checked
                    );


                    checkbox.disabled =
                        false;
                }
            );


            // -------------------------------------
            // DELETE
            // -------------------------------------

            const deleteButton =
                task.querySelector(
                    ".delete-task"
                );


            deleteButton.addEventListener(
                "click",
                async function () {

                    await deleteCloudTask(
                        taskData.id,
                        taskData.title
                    );
                }
            );


            taskList.appendChild(
                task
            );
        }
    );
}


// =====================================================
// EMPTY TASK STATE
// =====================================================

function showEmptyState() {

    taskList.innerHTML =
        `
        <div class="empty-state">

            <div>📋</div>

            <h4>
                No tasks yet
            </h4>

            <p>
                Add your first task for today.
            </p>

        </div>
        `;
}


// =====================================================
// ADD TASK TO SUPABASE
// =====================================================

taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            taskNameInput.value.trim();


        const subjectId =
            taskSubjectSelect.value;


        const plannedMinutes =
            Number(
                plannedMinutesInput.value
            ) || 0;


        const priority =
            taskPrioritySelect.value;


        if (!title) {

            return;
        }


        if (!subjectId) {

            alert(
                "Please select a subject."
            );

            return;
        }


        const saveButton =
            taskForm.querySelector(
                ".save-button"
            );


        saveButton.disabled =
            true;


        saveButton.textContent =
            "Saving...";


        try {

            const {
                error
            } =
            await supabaseClient
                .from("tasks")
                .insert({

                    user_id:
                        currentUserId,

                    subject_id:
                        subjectId,

                    title:
                        title,

                    priority:
                        priority,

                    status:
                        "Not Started",

                    planned_minutes:
                        plannedMinutes,

                    task_date:
                        getLocalDateString()

                });


            if (error) {
                throw error;
            }


            taskForm.reset();


            taskModal.classList.remove(
                "show"
            );


            await loadTodayTasks();

        }

        catch (error) {

            console.error(
                "Task save failed:",
                error
            );


            alert(
                "Task could not be saved."
            );
        }

        finally {

            saveButton.disabled =
                false;


            saveButton.textContent =
                "Add Task";
        }
    }
);


// =====================================================
// COMPLETE / UNCOMPLETE TASK
// =====================================================

async function toggleTaskCompletion(
    taskId,
    completed
) {

    try {

        const newStatus =
            completed
                ? "Completed"
                : "Not Started";


        const completedAt =
            completed
                ? new Date().toISOString()
                : null;


        const {
            error
        } =
        await supabaseClient
            .from("tasks")
            .update({

                status:
                    newStatus,

                completed_at:
                    completedAt

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
            throw error;
        }


        await loadTodayTasks();

    }

    catch (error) {

        console.error(
            "Task update failed:",
            error
        );


        alert(
            "Task status could not be updated."
        );


        await loadTodayTasks();
    }
}


// =====================================================
// DELETE CLOUD TASK
// =====================================================

async function deleteCloudTask(
    taskId,
    taskTitle
) {

    const confirmed =
        confirm(
            `Delete "${taskTitle}"?`
        );


    if (!confirmed) {

        return;
    }


    try {

        const {
            error
        } =
        await supabaseClient
            .from("tasks")
            .delete()
            .eq(
                "id",
                taskId
            )
            .eq(
                "user_id",
                currentUserId
            );


        if (error) {
            throw error;
        }


        await loadTodayTasks();

    }

    catch (error) {

        console.error(
            "Task deletion failed:",
            error
        );


        alert(
            "Task could not be deleted."
        );
    }
}


// =====================================================
// DASHBOARD TASK STATISTICS
// =====================================================

function updateTaskStatistics() {

    const total =
        todayTasks.length;


    const completed =
        todayTasks.filter(
            task =>
                task.status ===
                "Completed"
        ).length;


    const percentage =
        total > 0
            ?
            Math.round(
                (completed / total) *
                100
            )
            :
            0;


    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (
        statCards.length >= 3
    ) {

        const targetCard =
            statCards[2];


        const value =
            targetCard.querySelector(
                "h2"
            );


        const description =
            targetCard.querySelector(
                "span"
            );


        if (value) {

            value.textContent =
                percentage + "%";
        }


        if (description) {

            description.textContent =
                `${completed} of ${total} tasks`;
        }
    }
}


// =====================================================
// DARK MODE
// =====================================================

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const darkMode =
            document.body.classList.contains(
                "dark"
            );


        themeButton.textContent =
            darkMode
                ? "☀️"
                : "🌙";


        localStorage.setItem(
            "productiveHorizonTheme",
            darkMode
                ? "dark"
                : "light"
        );
    }
);


// LOAD THEME

const savedTheme =
    localStorage.getItem(
        "productiveHorizonTheme"
    );


if (
    savedTheme ===
    "dark"
) {

    document.body.classList.add(
        "dark"
    );

    themeButton.textContent =
        "☀️";
}


// =====================================================
// PRODUCTIVITY CHART
// =====================================================

const productivityCanvas =
    document.getElementById(
        "productivityChart"
    );


new Chart(
    productivityCanvas,
    {

        type: "line",

        data: {

            labels: [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
            ],

            datasets: [

                {

                    label:
                        "Productivity Score",

                    data: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],

                    borderWidth:
                        2,

                    tension:
                        0.4,

                    fill:
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

                    max:
                        10

                }

            },

            plugins: {

                legend: {

                    display:
                        false

                }

            }

        }

    }
);


// =====================================================
// SUBJECT CHART
// =====================================================

const subjectCanvas =
    document.getElementById(
        "subjectChart"
    );


new Chart(
    subjectCanvas,
    {

        type:
            "doughnut",

        data: {

            labels: [
                "Section A",
                "Section B"
            ],

            datasets: [

                {

                    data: [
                        50,
                        50
                    ],

                    borderWidth:
                        0

                }

            ]

        },

        options: {

            responsive:
                true,

            maintainAspectRatio:
                false,

            cutout:
                "72%",

            plugins: {

                legend: {

                    position:
                        "bottom",

                    labels: {

                        boxWidth:
                            10,

                        padding:
                            20

                    }

                }

            }

        }

    }
);


// =====================================================
// START DASHBOARD
// =====================================================

async function startDashboard() {

    const user =
        await getCurrentUser();


    if (!user) {
        return;
    }


    await loadSubjects();

    await loadTodayTasks();


    console.log(
        "Productive Horizon dashboard cloud tasks ready"
    );
}


startDashboard();
