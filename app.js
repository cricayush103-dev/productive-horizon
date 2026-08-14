// -----------------------------
// PRODUCTIVE HORIZON
// -----------------------------

const taskModal = document.getElementById("taskModal");
const addTaskButton = document.getElementById("addTaskButton");
const closeModal = document.getElementById("closeModal");

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

const themeButton = document.getElementById("themeButton");


// -----------------------------
// TASK MODAL
// -----------------------------

addTaskButton.addEventListener("click", function () {
    taskModal.classList.add("show");
});


closeModal.addEventListener("click", function () {
    taskModal.classList.remove("show");
});


taskModal.addEventListener("click", function (event) {

    if (event.target === taskModal) {
        taskModal.classList.remove("show");
    }

});


// -----------------------------
// EMPTY STATE FUNCTION
// -----------------------------

function showEmptyStateIfNeeded() {

    const tasks = taskList.querySelectorAll(".task");

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <h4>No tasks yet</h4>
                <p>Add your first task for today.</p>
            </div>
        `;
    }

}


// -----------------------------
// ADD TASK
// -----------------------------

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name =
        document.getElementById("taskName").value;

    const subject =
        document.getElementById("taskSubject").value;

    const minutes =
        document.getElementById("plannedMinutes").value;

    const priority =
        document.getElementById("taskPriority").value;


    // Remove empty message
    const emptyState =
        taskList.querySelector(".empty-state");

    if (emptyState) {
        emptyState.remove();
    }


    // Create task
    const task = document.createElement("div");

    task.className = "task";

    task.innerHTML = `
        <input type="checkbox" class="task-checkbox">

        <div class="task-content">
            <strong>${name}</strong>

            <span>
                ${subject}
                ${minutes ? " • " + minutes + " min" : ""}
            </span>
        </div>

        <span class="priority">
            ${priority}
        </span>

        <button
            class="delete-task"
            title="Delete Task"
            type="button"
        >
            <i class="fa-solid fa-trash"></i>
        </button>
    `;


    // -----------------------------
    // DELETE TASK
    // -----------------------------

    const deleteButton =
        task.querySelector(".delete-task");

    deleteButton.addEventListener("click", function () {

        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (confirmDelete) {

            task.remove();

            showEmptyStateIfNeeded();

        }

    });


    // -----------------------------
    // TASK COMPLETE
    // -----------------------------

    const checkbox =
        task.querySelector(".task-checkbox");

    const taskTitle =
        task.querySelector(".task-content strong");


    checkbox.addEventListener("change", function () {

        if (checkbox.checked) {

            taskTitle.style.textDecoration = "line-through";
            taskTitle.style.opacity = "0.5";

        } else {

            taskTitle.style.textDecoration = "none";
            taskTitle.style.opacity = "1";

        }

    });


    // Add task to list
    taskList.appendChild(task);


    // Reset form
    taskForm.reset();


    // Close modal
    taskModal.classList.remove("show");

});


// -----------------------------
// DARK MODE
// -----------------------------

themeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeButton.textContent = "☀️";

    } else {

        themeButton.textContent = "🌙";

    }

});


// -----------------------------
// PRODUCTIVITY CHART
// -----------------------------

const productivityCanvas =
    document.getElementById("productivityChart");


new Chart(productivityCanvas, {

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
                label: "Productivity Score",

                data: [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],

                borderWidth: 2,

                tension: 0.4,

                fill: false
            }

        ]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        scales: {

            y: {

                beginAtZero: true,

                max: 10

            }

        },

        plugins: {

            legend: {
                display: false
            }

        }

    }

});


// -----------------------------
// SUBJECT CHART
// -----------------------------

const subjectCanvas =
    document.getElementById("subjectChart");


new Chart(subjectCanvas, {

    type: "doughnut",

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

                borderWidth: 0
            }

        ]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "72%",

        plugins: {

            legend: {

                position: "bottom",

                labels: {
                    boxWidth: 10,
                    padding: 20
                }

            }

        }

    }

});