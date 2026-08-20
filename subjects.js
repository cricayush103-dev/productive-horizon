// =====================================================
// PRODUCTIVE HORIZON
// CLOUD SUBJECT MANAGEMENT - SUPABASE
// =====================================================


// =====================================================
// DOM ELEMENTS
// =====================================================

const sectionsContainer =
    document.getElementById("sectionsContainer");

const totalSubjectsElement =
    document.getElementById("totalSubjects");

const totalTopicsElement =
    document.getElementById("totalTopics");

const totalSubtopicsElement =
    document.getElementById("totalSubtopics");

const overallProgressElement =
    document.getElementById("overallProgress");

const modal =
    document.getElementById("subjectModal");

const modalTitle =
    document.getElementById("subjectModalTitle");

const modalSubtitle =
    document.getElementById("subjectModalSubtitle");

const closeModalButton =
    document.getElementById("closeSubjectModal");

const subjectForm =
    document.getElementById("subjectForm");

const itemName =
    document.getElementById("itemName");

const sectionSelectArea =
    document.getElementById("sectionSelectArea");

const sectionSelect =
    document.getElementById("sectionSelect");

const addSectionButton =
    document.getElementById("addSectionButton");

const addSubjectButton =
    document.getElementById("addSubjectButton");

const themeButton =
    document.getElementById("subjectThemeButton");


// =====================================================
// STATE
// =====================================================

let sections = [];

let currentUserId = null;

let currentAction = null;

let currentSectionId = null;
let currentSubjectId = null;
let currentTopicId = null;
let currentSubtopicId = null;




// =====================================================
// COLLAPSIBLE SUBJECTS / TOPICS
// =====================================================

function toggleSubjectTopics(subjectId) {
    const list = document.getElementById(`topics-${subjectId}`);
    const button = document.getElementById(`subject-toggle-${subjectId}`);

    if (!list || !button) return;

    const isCollapsed = list.classList.toggle("collapsed");
    button.textContent = isCollapsed ? "▶" : "▼";
    button.title = isCollapsed ? "Show topics" : "Hide topics";
}


function toggleTopicSubtopics(topicId) {
    const list = document.getElementById(`subtopics-${topicId}`);
    const button = document.getElementById(`topic-toggle-${topicId}`);

    if (!list || !button) return;

    // Topic without subtopics has nothing to expand.
    if (!list.children.length) return;

    const isCollapsed = list.classList.toggle("collapsed");
    button.textContent = isCollapsed ? "▶" : "▼";
    button.title = isCollapsed ? "Show subtopics" : "Hide subtopics";
}


function setAllSubjectVisibility(expand) {
    document.querySelectorAll(".topics-list").forEach(list => {
        list.classList.toggle("collapsed", !expand);
    });

    document.querySelectorAll(".subject-collapse-toggle").forEach(button => {
        button.textContent = expand ? "▼" : "▶";
        button.title = expand ? "Hide topics" : "Show topics";
    });

    document.querySelectorAll(".subtopics-list").forEach(list => {
        if (expand && list.children.length) {
            list.classList.remove("collapsed");
        } else {
            list.classList.add("collapsed");
        }
    });

    document.querySelectorAll(".topic-collapse-toggle").forEach(button => {
        const topicId = button.id.replace("topic-toggle-", "");
        const list = document.getElementById(`subtopics-${topicId}`);
        button.textContent =
            expand && list && list.children.length
                ? "▼"
                : (list && list.children.length ? "▶" : "•");
    });
}


document.getElementById("expandAllSubjects")?.addEventListener(
    "click",
    function () {
        setAllSubjectVisibility(true);
    }
);


document.getElementById("collapseAllSubjects")?.addEventListener(
    "click",
    function () {
        setAllSubjectVisibility(false);
    }
);


// =====================================================
// BULK TOPIC IMPORT - DOM
// =====================================================

const bulkImportModal =
    document.getElementById(
        "bulkImportModal"
    );

const bulkImportTitle =
    document.getElementById(
        "bulkImportTitle"
    );

const bulkImportSubtitle =
    document.getElementById(
        "bulkImportSubtitle"
    );

const bulkImportText =
    document.getElementById(
        "bulkImportText"
    );

const bulkImportPreview =
    document.getElementById(
        "bulkImportPreview"
    );

const closeBulkImportModalButton =
    document.getElementById(
        "closeBulkImportModal"
    );

const cancelBulkImportButton =
    document.getElementById(
        "cancelBulkImport"
    );

const importBulkTopicsButton =
    document.getElementById(
        "importBulkTopicsButton"
    );

let bulkImportSectionId = null;
let bulkImportSubjectId = null;


// =====================================================
// PAGE SAFETY
// =====================================================

if (!sectionsContainer) {

    alert(
        "Subjects page could not load correctly."
    );

    throw new Error(
        "sectionsContainer not found"
    );
}


// =====================================================
// AUTH USER
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
// CLOUD DATA LOADING
// =====================================================

async function loadCloudData() {

    showLoadingState();


    try {

        await getCurrentUser();


        if (!currentUserId) {
            return;
        }


        // -----------------------------------------
        // SECTIONS
        // -----------------------------------------

        const {
            data: sectionRows,
            error: sectionError
        } =
        await supabaseClient
            .from("sections")
            .select("*")
            .eq("user_id", currentUserId)
            .eq("archived", false)
            .order("position", {
                ascending: true
            });


        if (sectionError) {
            throw sectionError;
        }


        // -----------------------------------------
        // SUBJECTS
        // -----------------------------------------

        const {
            data: subjectRows,
            error: subjectError
        } =
        await supabaseClient
            .from("subjects")
            .select("*")
            .eq("user_id", currentUserId)
            .eq("archived", false)
            .order("position", {
                ascending: true
            });


        if (subjectError) {
            throw subjectError;
        }


        // -----------------------------------------
        // TOPICS
        // -----------------------------------------

        const {
            data: topicRows,
            error: topicError
        } =
        await supabaseClient
            .from("topics")
            .select("*")
            .eq("user_id", currentUserId)
            .order("position", {
                ascending: true
            });


        if (topicError) {
            throw topicError;
        }


        // -----------------------------------------
        // SUBTOPICS
        // -----------------------------------------

        const {
            data: subtopicRows,
            error: subtopicError
        } =
        await supabaseClient
            .from("subtopics")
            .select("*")
            .eq("user_id", currentUserId)
            .order("position", {
                ascending: true
            });


        if (subtopicError) {
            throw subtopicError;
        }


        buildHierarchy(
            sectionRows || [],
            subjectRows || [],
            topicRows || [],
            subtopicRows || []
        );


        renderSections();


        console.log(
            "Cloud syllabus loaded successfully"
        );

    }

    catch (error) {

        console.error(
            "Cloud loading failed:",
            error
        );


        sectionsContainer.innerHTML = `
            <div class="panel">
                <div class="empty-state">
                    <div>⚠️</div>
                    <h4>Could not load syllabus</h4>
                    <p>
                        Please refresh the page or check your connection.
                    </p>
                </div>
            </div>
        `;
    }
}


// =====================================================
// BUILD SECTION → SUBJECT → TOPIC → SUBTOPIC
// =====================================================

function buildHierarchy(
    sectionRows,
    subjectRows,
    topicRows,
    subtopicRows
) {

    sections =
        sectionRows.map(
            function (section) {

                const subjectsForSection =
                    subjectRows
                        .filter(
                            subject =>
                                subject.section_id ===
                                section.id
                        )
                        .map(
                            function (subject) {

                                const topicsForSubject =
                                    topicRows
                                        .filter(
                                            topic =>
                                                topic.subject_id ===
                                                subject.id
                                        )
                                        .map(
                                            function (topic) {

                                                const subtopicsForTopic =
                                                    subtopicRows.filter(
                                                        subtopic =>
                                                            subtopic.topic_id ===
                                                            topic.id
                                                    );


                                                return {
                                                    ...topic,
                                                    subtopics:
                                                        subtopicsForTopic
                                                };

                                            }
                                        );


                                return {
                                    ...subject,
                                    topics:
                                        topicsForSubject
                                };

                            }
                        );


                return {
                    ...section,
                    subjects:
                        subjectsForSection
                };

            }
        );
}


// =====================================================
// LOADING STATE
// =====================================================

function showLoadingState() {

    sectionsContainer.innerHTML = `
        <div class="panel">
            <div class="empty-state">
                <div>☁️</div>
                <h4>Loading your syllabus...</h4>
                <p>
                    Syncing with Productive Horizon cloud.
                </p>
            </div>
        </div>
    `;
}


// =====================================================
// FIND HELPERS
// =====================================================

function findSection(sectionId) {

    return sections.find(
        section =>
            section.id === sectionId
    );
}


function findSubject(
    sectionId,
    subjectId
) {

    const section =
        findSection(sectionId);


    if (!section) {
        return null;
    }


    return section.subjects.find(
        subject =>
            subject.id === subjectId
    );
}


function findTopic(
    sectionId,
    subjectId,
    topicId
) {

    const subject =
        findSubject(
            sectionId,
            subjectId
        );


    if (!subject) {
        return null;
    }


    return subject.topics.find(
        topic =>
            topic.id === topicId
    );
}


function findSubtopic(
    sectionId,
    subjectId,
    topicId,
    subtopicId
) {

    const topic =
        findTopic(
            sectionId,
            subjectId,
            topicId
        );


    if (!topic) {
        return null;
    }


    return topic.subtopics.find(
        subtopic =>
            subtopic.id ===
            subtopicId
    );
}


// =====================================================
// CALCULATE SUBJECT PROGRESS
// =====================================================

function calculateSubjectProgress(
    subject
) {

    if (
        subject.topics.length === 0
    ) {

        return subject.completed
            ? 100
            : 0;
    }


    let total = 0;
    let completed = 0;


    subject.topics.forEach(
        function (topic) {

            if (
                topic.subtopics.length === 0
            ) {

                total++;


                if (topic.completed) {
                    completed++;
                }

            }

            else {

                topic.subtopics.forEach(
                    function (subtopic) {

                        total++;


                        if (
                            subtopic.completed
                        ) {

                            completed++;
                        }

                    }
                );

            }

        }
    );


    if (total === 0) {
        return 0;
    }


    return Math.round(
        (completed / total) * 100
    );
}


// =====================================================
// RENDER SECTIONS
// =====================================================

function renderSections() {

    sectionsContainer.innerHTML = "";


    if (sections.length === 0) {

        sectionsContainer.innerHTML = `
            <div class="panel">
                <div class="empty-state">
                    <div>📚</div>

                    <h4>
                        No sections yet
                    </h4>

                    <p>
                        Create your first section.
                    </p>
                </div>
            </div>
        `;


        updateStatistics();

        return;
    }


    sections.forEach(
        function (section) {

            const sectionElement =
                document.createElement(
                    "section"
                );


            sectionElement.className =
                "syllabus-section";


            sectionElement.innerHTML = `

                <div class="section-header">

                    <div>

                        <p class="section-label">
                            SYLLABUS SECTION
                        </p>

                        <h2>
                            ${escapeHTML(section.name)}
                        </h2>

                    </div>


                    <div class="section-actions">

                        <button
                            class="small-action-button"
                            onclick="
                                renameSection(
                                    '${section.id}'
                                )
                            "
                        >
                            ✏️ Rename
                        </button>


                        <button
                            class="
                                small-action-button
                                danger
                            "
                            onclick="
                                deleteSection(
                                    '${section.id}'
                                )
                            "
                        >
                            🗑️ Delete
                        </button>

                    </div>

                </div>


                <div
                    class="subjects-container"
                    id="subjects-${section.id}"
                >
                </div>
            `;


            sectionsContainer.appendChild(
                sectionElement
            );


            const container =
                document.getElementById(
                    `subjects-${section.id}`
                );


            if (
                section.subjects.length === 0
            ) {

                container.innerHTML = `
                    <div class="subject-empty">
                        No subjects in this section.
                    </div>
                `;
            }


            section.subjects.forEach(
                function (subject) {

                    renderSubject(
                        section,
                        subject,
                        container
                    );

                }
            );

        }
    );


    updateStatistics();
}


// =====================================================
// RENDER SUBJECT
// =====================================================

function renderSubject(
    section,
    subject,
    container
) {

    const progress =
        calculateSubjectProgress(
            subject
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "subject-manager-card";


    card.innerHTML = `

        <div class="subject-manager-header">

            <div class="subject-main-info">

                <button
                    class="subject-collapse-toggle"
                    id="subject-toggle-${subject.id}"
                    type="button"
                    title="Show topics"
                    onclick="
                        toggleSubjectTopics(
                            '${subject.id}'
                        )
                    "
                >
                    ▶
                </button>

                <input
                    type="checkbox"

                    ${
                        subject.completed
                            ? "checked"
                            : ""
                    }

                    onchange="
                        toggleSubject(
                            '${section.id}',
                            '${subject.id}',
                            this.checked
                        )
                    "
                >


                <div>

                    <h3>
                        ${escapeHTML(subject.name)}
                    </h3>


                    <p>
                        ${subject.topics.length}
                        Topics
                        •
                        ${progress}%
                        Complete
                    </p>

                </div>

            </div>


           <div class="subject-card-actions">

    <button
        title="Move subject up"
        onclick="
            moveSubject(
                '${section.id}',
                '${subject.id}',
                -1
            )
        "
    >
        ⬆️
    </button>


    <button
        title="Move subject down"
        onclick="
            moveSubject(
                '${section.id}',
                '${subject.id}',
                1
            )
        "
    >
        ⬇️
    </button>


    <button
        onclick="
            addTopic(
                '${section.id}',
                '${subject.id}'
            )
        "
    >
        + Topic
    </button>


                <button
                    class="bulk-import-button"
                    onclick="
                        openBulkImport(
                            '${section.id}',
                            '${subject.id}'
                        )
                    "
                >
                    ⚡ Bulk Add
                </button>


                <button
                    onclick="
                        renameSubject(
                            '${section.id}',
                            '${subject.id}'
                        )
                    "
                >
                    ✏️
                </button>


                <button
                    class="danger"

                    onclick="
                        deleteSubject(
                            '${section.id}',
                            '${subject.id}'
                        )
                    "
                >
                    🗑️
                </button>

            </div>

        </div>


        <div class="manager-progress-bar">

            <div
                style="
                    width:${progress}%
                "
            ></div>

        </div>


        <div
            class="topics-list collapsed"
            id="topics-${subject.id}"
        ></div>
    `;


    container.appendChild(card);


    const topicsContainer =
        document.getElementById(
            `topics-${subject.id}`
        );


    subject.topics.forEach(
        function (topic) {

            renderTopic(
                section,
                subject,
                topic,
                topicsContainer
            );

        }
    );
}


// =====================================================
// RENDER TOPIC
// =====================================================

function renderTopic(
    section,
    subject,
    topic,
    container
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "topic-manager-row";


    row.innerHTML = `

        <div class="topic-top-row">

            <div class="topic-name-area">

                <button
                    class="topic-collapse-toggle"
                    id="topic-toggle-${topic.id}"
                    type="button"
                    title="Show subtopics"
                    onclick="
                        toggleTopicSubtopics(
                            '${topic.id}'
                        )
                    "
                >
                    ${topic.subtopics.length ? "▶" : "•"}
                </button>

                <input
                    type="checkbox"

                    ${
                        topic.completed
                            ? "checked"
                            : ""
                    }

                    onchange="
                        toggleTopic(
                            '${section.id}',
                            '${subject.id}',
                            '${topic.id}',
                            this.checked
                        )
                    "
                >


                <span>
                    ${escapeHTML(topic.name)}
                </span>

            </div>


            <div class="topic-actions">

                <button
                    onclick="
                        addSubtopic(
                            '${section.id}',
                            '${subject.id}',
                            '${topic.id}'
                        )
                    "
                >
                    + Subtopic
                </button>


                <button
                    onclick="
                        renameTopic(
                            '${section.id}',
                            '${subject.id}',
                            '${topic.id}'
                        )
                    "
                >
                    ✏️
                </button>


                <button
                    class="danger"

                    onclick="
                        deleteTopic(
                            '${section.id}',
                            '${subject.id}',
                            '${topic.id}'
                        )
                    "
                >
                    🗑️
                </button>

            </div>

        </div>


        <div
            class="subtopics-list collapsed"
            id="subtopics-${topic.id}"
        ></div>
    `;


    container.appendChild(row);


    const subtopicsContainer =
        document.getElementById(
            `subtopics-${topic.id}`
        );


    topic.subtopics.forEach(
        function (subtopic) {

            renderSubtopic(
                section,
                subject,
                topic,
                subtopic,
                subtopicsContainer
            );

        }
    );
}


// =====================================================
// RENDER SUBTOPIC
// =====================================================

function renderSubtopic(
    section,
    subject,
    topic,
    subtopic,
    container
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "subtopic-row";


    row.innerHTML = `

        <div class="subtopic-name">

            <input
                type="checkbox"

                ${
                    subtopic.completed
                        ? "checked"
                        : ""
                }

                onchange="
                    toggleSubtopic(
                        '${section.id}',
                        '${subject.id}',
                        '${topic.id}',
                        '${subtopic.id}',
                        this.checked
                    )
                "
            >


            <span>
                ${escapeHTML(subtopic.name)}
            </span>

        </div>


        <div class="subtopic-actions">

            <button
                onclick="
                    renameSubtopic(
                        '${section.id}',
                        '${subject.id}',
                        '${topic.id}',
                        '${subtopic.id}'
                    )
                "
            >
                ✏️
            </button>


            <button
                class="danger"

                onclick="
                    deleteSubtopic(
                        '${section.id}',
                        '${subject.id}',
                        '${topic.id}',
                        '${subtopic.id}'
                    )
                "
            >
                🗑️
            </button>

        </div>
    `;


    container.appendChild(row);
}


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
// MODAL
// =====================================================

function openModal(
    action,
    title,
    subtitle
) {

    currentAction =
        action;


    modalTitle.textContent =
        title;


    modalSubtitle.textContent =
        subtitle;


    itemName.value =
        "";


    sectionSelectArea.classList.add(
        "hidden"
    );


    modal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            itemName.focus();

        },
        50
    );
}


function closeModal() {

    modal.classList.remove(
        "show"
    );
}


// =====================================================
// ADD SECTION BUTTON
// =====================================================

addSectionButton.addEventListener(
    "click",
    function () {

        openModal(
            "addSection",
            "Add Section",
            "Create a new syllabus section."
        );

    }
);


// =====================================================
// ADD SUBJECT BUTTON
// =====================================================

addSubjectButton.addEventListener(
    "click",
    function () {

        openModal(
            "addSubject",
            "Add Subject",
            "Add a new subject to your syllabus."
        );


        sectionSelect.innerHTML =
            "";


        sections.forEach(
            function (section) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    section.id;


                option.textContent =
                    section.name;


                sectionSelect.appendChild(
                    option
                );

            }
        );


        sectionSelectArea.classList.remove(
            "hidden"
        );

    }
);


// =====================================================
// ADD TOPIC
// =====================================================

function addTopic(
    sectionId,
    subjectId
) {

    currentSectionId =
        sectionId;

    currentSubjectId =
        subjectId;


    openModal(
        "addTopic",
        "Add Topic",
        "Create a topic inside this subject."
    );
}


// =====================================================
// ADD SUBTOPIC
// =====================================================

function addSubtopic(
    sectionId,
    subjectId,
    topicId
) {

    currentSectionId =
        sectionId;

    currentSubjectId =
        subjectId;

    currentTopicId =
        topicId;


    openModal(
        "addSubtopic",
        "Add Subtopic",
        "Create a subtopic inside this topic."
    );
}


// =====================================================
// FORM SUBMIT → CLOUD
// =====================================================

subjectForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            itemName.value.trim();


        if (!name) {
            return;
        }


        const saveButton =
            subjectForm.querySelector(
                ".save-button"
            );


        saveButton.disabled =
            true;


        saveButton.textContent =
            "Saving...";


        try {

            // =====================================
            // ADD SECTION
            // =====================================

            if (
                currentAction ===
                "addSection"
            ) {

                const position =
                    sections.length;


                const {
                    error
                } =
                await supabaseClient
                    .from("sections")
                    .insert({

                        user_id:
                            currentUserId,

                        name:
                            name,

                        position:
                            position,

                        archived:
                            false

                    });


                if (error) {
                    throw error;
                }
            }


            // =====================================
            // ADD SUBJECT
            // =====================================

            else if (
                currentAction ===
                "addSubject"
            ) {

                const sectionId =
                    sectionSelect.value;


                const section =
                    findSection(
                        sectionId
                    );


                const position =
                    section
                        ? section.subjects.length
                        : 0;


                const {
                    error
                } =
                await supabaseClient
                    .from("subjects")
                    .insert({

                        user_id:
                            currentUserId,

                        section_id:
                            sectionId,

                        name:
                            name,

                        position:
                            position,

                        completed:
                            false,

                        archived:
                            false

                    });


                if (error) {
                    throw error;
                }
            }


            // =====================================
            // ADD TOPIC
            // =====================================

            else if (
                currentAction ===
                "addTopic"
            ) {

                const subject =
                    findSubject(
                        currentSectionId,
                        currentSubjectId
                    );


                const position =
                    subject
                        ? subject.topics.length
                        : 0;


                const {
                    error
                } =
                await supabaseClient
                    .from("topics")
                    .insert({

                        user_id:
                            currentUserId,

                        subject_id:
                            currentSubjectId,

                        name:
                            name,

                        position:
                            position,

                        completed:
                            false

                    });


                if (error) {
                    throw error;
                }
            }


            // =====================================
            // ADD SUBTOPIC
            // =====================================

            else if (
                currentAction ===
                "addSubtopic"
            ) {

                const topic =
                    findTopic(
                        currentSectionId,
                        currentSubjectId,
                        currentTopicId
                    );


                const position =
                    topic
                        ? topic.subtopics.length
                        : 0;


                const {
                    error
                } =
                await supabaseClient
                    .from("subtopics")
                    .insert({

                        user_id:
                            currentUserId,

                        topic_id:
                            currentTopicId,

                        name:
                            name,

                        position:
                            position,

                        completed:
                            false

                    });


                if (error) {
                    throw error;
                }
            }


            // =====================================
            // RENAME SECTION
            // =====================================

            else if (
                currentAction ===
                "renameSection"
            ) {

                const {
                    error
                } =
                await supabaseClient
                    .from("sections")
                    .update({
                        name:
                            name
                    })
                    .eq(
                        "id",
                        currentSectionId
                    );


                if (error) {
                    throw error;
                }
            }


            // =====================================
            // RENAME SUBJECT
            // =====================================

            else if (
                currentAction ===
                "renameSubject"
            ) {

                const {
                    error
                } =
                await supabaseClient
                    .from("subjects")
                    .update({
                        name:
                            name
                    })
                    .eq(
                        "id",
                        currentSubjectId
                    );


                if (error) {
                    throw error;
                }
            }


            // =====================================
            // RENAME TOPIC
            // =====================================

            else if (
                currentAction ===
                "renameTopic"
            ) {

                const {
                    error
                } =
                await supabaseClient
                    .from("topics")
                    .update({
                        name:
                            name
                    })
                    .eq(
                        "id",
                        currentTopicId
                    );


                if (error) {
                    throw error;
                }
            }


            // =====================================
            // RENAME SUBTOPIC
            // =====================================

            else if (
                currentAction ===
                "renameSubtopic"
            ) {

                const {
                    error
                } =
                await supabaseClient
                    .from("subtopics")
                    .update({
                        name:
                            name
                    })
                    .eq(
                        "id",
                        currentSubtopicId
                    );


                if (error) {
                    throw error;
                }
            }


            closeModal();


            await loadCloudData();

        }

        catch (error) {

            console.error(
                "Save failed:",
                error
            );


            alert(
                "Could not save this change."
            );
        }

        finally {

            saveButton.disabled =
                false;


            saveButton.textContent =
                "Save";
        }

    }
);


// =====================================================
// RENAME FUNCTIONS
// =====================================================

function renameSection(
    sectionId
) {

    const section =
        findSection(
            sectionId
        );


    if (!section) {
        return;
    }


    currentSectionId =
        sectionId;


    openModal(
        "renameSection",
        "Rename Section",
        "Change section name."
    );


    itemName.value =
        section.name;
}


function renameSubject(
    sectionId,
    subjectId
) {

    const subject =
        findSubject(
            sectionId,
            subjectId
        );


    if (!subject) {
        return;
    }


    currentSectionId =
        sectionId;

    currentSubjectId =
        subjectId;


    openModal(
        "renameSubject",
        "Rename Subject",
        "Change subject name."
    );


    itemName.value =
        subject.name;
}


function renameTopic(
    sectionId,
    subjectId,
    topicId
) {

    const topic =
        findTopic(
            sectionId,
            subjectId,
            topicId
        );


    if (!topic) {
        return;
    }


    currentSectionId =
        sectionId;

    currentSubjectId =
        subjectId;

    currentTopicId =
        topicId;


    openModal(
        "renameTopic",
        "Rename Topic",
        "Change topic name."
    );


    itemName.value =
        topic.name;
}


function renameSubtopic(
    sectionId,
    subjectId,
    topicId,
    subtopicId
) {

    const subtopic =
        findSubtopic(
            sectionId,
            subjectId,
            topicId,
            subtopicId
        );


    if (!subtopic) {
        return;
    }


    currentSectionId =
        sectionId;

    currentSubjectId =
        subjectId;

    currentTopicId =
        topicId;

    currentSubtopicId =
        subtopicId;


    openModal(
        "renameSubtopic",
        "Rename Subtopic",
        "Change subtopic name."
    );


    itemName.value =
        subtopic.name;
}


// =====================================================
// DELETE SECTION
// =====================================================

async function deleteSection(
    sectionId
) {

    const confirmed =
        confirm(
            "Delete this section and everything inside it?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
        await supabaseClient
            .from("sections")
            .delete()
            .eq(
                "id",
                sectionId
            );


        if (error) {
            throw error;
        }


        await loadCloudData();

    }

    catch (error) {

        console.error(
            "Delete section failed:",
            error
        );


        alert(
            "Could not delete section."
        );
    }
}


// =====================================================
// DELETE SUBJECT
// =====================================================

async function deleteSubject(
    sectionId,
    subjectId
) {

    const confirmed =
        confirm(
            "Delete this subject and all its topics?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
        await supabaseClient
            .from("subjects")
            .delete()
            .eq(
                "id",
                subjectId
            );


        if (error) {
            throw error;
        }


        await loadCloudData();

    }

    catch (error) {

        console.error(
            "Delete subject failed:",
            error
        );


        alert(
            "Could not delete subject."
        );
    }
}


// =====================================================
// DELETE TOPIC
// =====================================================

async function deleteTopic(
    sectionId,
    subjectId,
    topicId
) {

    const confirmed =
        confirm(
            "Delete this topic and its subtopics?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
        await supabaseClient
            .from("topics")
            .delete()
            .eq(
                "id",
                topicId
            );


        if (error) {
            throw error;
        }


        await loadCloudData();

    }

    catch (error) {

        console.error(
            "Delete topic failed:",
            error
        );


        alert(
            "Could not delete topic."
        );
    }
}


// =====================================================
// DELETE SUBTOPIC
// =====================================================

async function deleteSubtopic(
    sectionId,
    subjectId,
    topicId,
    subtopicId
) {

    const confirmed =
        confirm(
            "Delete this subtopic?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
        await supabaseClient
            .from("subtopics")
            .delete()
            .eq(
                "id",
                subtopicId
            );


        if (error) {
            throw error;
        }


        await updateTopicParentState(
            topicId
        );


        await loadCloudData();

    }

    catch (error) {

        console.error(
            "Delete subtopic failed:",
            error
        );


        alert(
            "Could not delete subtopic."
        );
    }
}


// =====================================================
// COMPLETE SUBJECT
// =====================================================

async function toggleSubject(
    sectionId,
    subjectId,
    checked
) {

    try {

        const subject =
            findSubject(
                sectionId,
                subjectId
            );


        if (!subject) {
            return;
        }


        // Update subject
        const {
            error: subjectError
        } =
        await supabaseClient
            .from("subjects")
            .update({
                completed:
                    checked
            })
            .eq(
                "id",
                subjectId
            );


        if (subjectError) {
            throw subjectError;
        }


        // Update topics
        if (
            subject.topics.length > 0
        ) {

            const topicIds =
                subject.topics.map(
                    topic =>
                        topic.id
                );


            const {
                error: topicError
            } =
            await supabaseClient
                .from("topics")
                .update({
                    completed:
                        checked
                })
                .in(
                    "id",
                    topicIds
                );


            if (topicError) {
                throw topicError;
            }


            // Update all subtopics
            const subtopicIds =
                subject.topics.flatMap(
                    topic =>
                        topic.subtopics.map(
                            subtopic =>
                                subtopic.id
                        )
                );


            if (
                subtopicIds.length > 0
            ) {

                const {
                    error:
                        subtopicError
                } =
                await supabaseClient
                    .from("subtopics")
                    .update({
                        completed:
                            checked
                    })
                    .in(
                        "id",
                        subtopicIds
                    );


                if (
                    subtopicError
                ) {
                    throw subtopicError;
                }
            }

        }


        await loadCloudData();

    }

    catch (error) {

        console.error(
            "Subject completion failed:",
            error
        );


        alert(
            "Could not update subject."
        );
    }
}


// =====================================================
// COMPLETE TOPIC
// =====================================================

async function toggleTopic(
    sectionId,
    subjectId,
    topicId,
    checked
) {

    try {

        const topic =
            findTopic(
                sectionId,
                subjectId,
                topicId
            );


        if (!topic) {
            return;
        }


        const {
            error: topicError
        } =
        await supabaseClient
            .from("topics")
            .update({
                completed:
                    checked
            })
            .eq(
                "id",
                topicId
            );


        if (topicError) {
            throw topicError;
        }


        if (
            topic.subtopics.length > 0
        ) {

            const subtopicIds =
                topic.subtopics.map(
                    subtopic =>
                        subtopic.id
                );


            const {
                error:
                    subtopicError
            } =
            await supabaseClient
                .from("subtopics")
                .update({
                    completed:
                        checked
                })
                .in(
                    "id",
                    subtopicIds
                );


            if (
                subtopicError
            ) {
                throw subtopicError;
            }
        }


        await updateSubjectParentState(
            subjectId
        );


        await loadCloudData();

    }

    catch (error) {

        console.error(
            "Topic completion failed:",
            error
        );


        alert(
            "Could not update topic."
        );
    }
}


// =====================================================
// COMPLETE SUBTOPIC
// =====================================================

async function toggleSubtopic(
    sectionId,
    subjectId,
    topicId,
    subtopicId,
    checked
) {

    try {

        const {
            error
        } =
        await supabaseClient
            .from("subtopics")
            .update({
                completed:
                    checked
            })
            .eq(
                "id",
                subtopicId
            );


        if (error) {
            throw error;
        }


        await updateTopicParentState(
            topicId
        );


        await updateSubjectParentState(
            subjectId
        );


        await loadCloudData();

    }

    catch (error) {

        console.error(
            "Subtopic completion failed:",
            error
        );


        alert(
            "Could not update subtopic."
        );
    }
}


// =====================================================
// UPDATE TOPIC FROM SUBTOPICS
// =====================================================

async function updateTopicParentState(
    topicId
) {

    const {
        data: subtopics,
        error
    } =
    await supabaseClient
        .from("subtopics")
        .select(
            "id,completed"
        )
        .eq(
            "topic_id",
            topicId
        );


    if (error) {
        throw error;
    }


    // If topic has no subtopics,
    // don't automatically change its state.
    if (
        !subtopics ||
        subtopics.length === 0
    ) {
        return;
    }


    const completed =
        subtopics.every(
            item =>
                item.completed
        );


    const {
        error: updateError
    } =
    await supabaseClient
        .from("topics")
        .update({
            completed:
                completed
        })
        .eq(
            "id",
            topicId
        );


    if (updateError) {
        throw updateError;
    }
}


// =====================================================
// UPDATE SUBJECT FROM TOPICS
// =====================================================

async function updateSubjectParentState(
    subjectId
) {

    const {
        data: topics,
        error
    } =
    await supabaseClient
        .from("topics")
        .select(
            "id,completed"
        )
        .eq(
            "subject_id",
            subjectId
        );


    if (error) {
        throw error;
    }


    // Subject with no topics:
    // don't automatically change it.
    if (
        !topics ||
        topics.length === 0
    ) {
        return;
    }


    const completed =
        topics.every(
            item =>
                item.completed
        );


    const {
        error: updateError
    } =
    await supabaseClient
        .from("subjects")
        .update({
            completed:
                completed
        })
        .eq(
            "id",
            subjectId
        );


    if (updateError) {
        throw updateError;
    }
}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    let subjectCount = 0;
    let topicCount = 0;
    let subtopicCount = 0;

    let progressTotal = 0;


    sections.forEach(
        function (section) {

            subjectCount +=
                section.subjects.length;


            section.subjects.forEach(
                function (subject) {

                    topicCount +=
                        subject.topics.length;


                    progressTotal +=
                        calculateSubjectProgress(
                            subject
                        );


                    subject.topics.forEach(
                        function (topic) {

                            subtopicCount +=
                                topic.subtopics.length;

                        }
                    );

                }
            );

        }
    );


    totalSubjectsElement.textContent =
        subjectCount;


    totalTopicsElement.textContent =
        topicCount;


    totalSubtopicsElement.textContent =
        subtopicCount;


    overallProgressElement.textContent =
        subjectCount > 0
            ?
            Math.round(
                progressTotal /
                subjectCount
            ) + "%"
            :
            "0%";
}


// =====================================================
// MODAL CLOSE
// =====================================================

closeModalButton.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            modal
        ) {

            closeModal();
        }

    }
);


// =====================================================
// ESCAPE CLOSE
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeModal();
        }

    }
);


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


// =====================================================
// LOAD SAVED THEME
// =====================================================

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
// BULK TOPIC IMPORT
// =====================================================

function normalizeImportName(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        );
}


function importNameKey(
    value
) {

    return normalizeImportName(
        value
    )
        .toLocaleLowerCase();
}


// -----------------------------------------------------
// PARSER
//
// Normal line:
//     Topic
//
// Bullet line:
//     - Subtopic
//     • Subtopic
//     * Subtopic
//
// Repeated topics inside the same paste are merged.
// -----------------------------------------------------

function parseBulkImportText(
    text
) {

    const lines =
        String(
            text || ""
        )
            .replace(
                /\r/g,
                ""
            )
            .split("\n");


    const topicMap =
        new Map();


    let currentTopic =
        null;


    lines.forEach(
        rawLine => {

            const trimmed =
                rawLine.trim();


            if (!trimmed) {
                return;
            }


            const bulletMatch =
                trimmed.match(
                    /^[-•*]\s*(.+)$/
                );


            // SUBTOPIC
            if (bulletMatch) {

                if (!currentTopic) {

                    // Ignore orphan subtopic because
                    // there is no topic above it.
                    return;
                }


                const subtopicName =
                    normalizeImportName(
                        bulletMatch[1]
                    );


                if (!subtopicName) {
                    return;
                }


                const subtopicKey =
                    importNameKey(
                        subtopicName
                    );


                if (
                    !currentTopic
                        .subtopicKeys
                        .has(
                            subtopicKey
                        )
                ) {

                    currentTopic
                        .subtopicKeys
                        .add(
                            subtopicKey
                        );


                    currentTopic
                        .subtopics
                        .push(
                            subtopicName
                        );

                }


                return;
            }


            // TOPIC
            const topicName =
                normalizeImportName(
                    trimmed
                        .replace(
                            /:$/,
                            ""
                        )
                );


            if (!topicName) {
                return;
            }


            const topicKey =
                importNameKey(
                    topicName
                );


            if (
                !topicMap.has(
                    topicKey
                )
            ) {

                topicMap.set(
                    topicKey,
                    {
                        name:
                            topicName,

                        subtopics:
                            [],

                        subtopicKeys:
                            new Set()
                    }
                );

            }


            currentTopic =
                topicMap.get(
                    topicKey
                );

        }
    );


    return Array.from(
        topicMap.values()
    )
        .map(
            topic => ({
                name:
                    topic.name,

                subtopics:
                    topic.subtopics
            })
        );
}


// -----------------------------------------------------
// OPEN / CLOSE
// -----------------------------------------------------

function openBulkImport(
    sectionId,
    subjectId
) {

    const subject =
        findSubject(
            sectionId,
            subjectId
        );


    if (!subject) {
        return;
    }


    bulkImportSectionId =
        sectionId;


    bulkImportSubjectId =
        subjectId;


    bulkImportTitle.textContent =
        `Bulk Add Topics — ${subject.name}`;


    bulkImportSubtitle.textContent =
        "Paste topics and subtopics. Existing duplicates will be skipped automatically.";


    bulkImportText.value =
        "";


    updateBulkImportPreview();


    bulkImportModal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            bulkImportText.focus();

        },
        50
    );
}


function closeBulkImport() {

    bulkImportModal.classList.remove(
        "show"
    );


    bulkImportSectionId =
        null;


    bulkImportSubjectId =
        null;


    bulkImportText.value =
        "";

}


// -----------------------------------------------------
// PREVIEW
// -----------------------------------------------------

function updateBulkImportPreview() {

    const parsed =
        parseBulkImportText(
            bulkImportText.value
        );


    const topicCount =
        parsed.length;


    const subtopicCount =
        parsed.reduce(
            (
                total,
                topic
            ) =>
                total +
                topic.subtopics.length,
            0
        );


    if (
        topicCount === 0
    ) {

        bulkImportPreview.innerHTML =
            "Paste your syllabus to see the preview.";


        return;
    }


    const previewNames =
        parsed
            .slice(
                0,
                4
            )
            .map(
                topic =>
                    escapeHTML(
                        topic.name
                    )
            )
            .join(
                ", "
            );


    bulkImportPreview.innerHTML =
        `
            <strong>
                ${topicCount}
                Topic${
                    topicCount === 1
                        ? ""
                        : "s"
                }
                •
                ${subtopicCount}
                Subtopic${
                    subtopicCount === 1
                        ? ""
                        : "s"
                }
            </strong>

            <br>

            <span>
                Preview:
                ${previewNames}
                ${
                    topicCount > 4
                        ? "..."
                        : ""
                }
            </span>

            <br>

            <span>
                Duplicate topics/subtopics already present in this subject
                will be skipped.
            </span>
        `;
}


// -----------------------------------------------------
// IMPORT TO SUPABASE
// -----------------------------------------------------

async function importBulkTopics() {

    if (
        !bulkImportSectionId ||
        !bulkImportSubjectId
    ) {
        return;
    }


    const parsed =
        parseBulkImportText(
            bulkImportText.value
        );


    if (
        parsed.length === 0
    ) {

        alert(
            "Paste at least one topic."
        );


        return;
    }


    const subject =
        findSubject(
            bulkImportSectionId,
            bulkImportSubjectId
        );


    if (!subject) {

        alert(
            "Subject could not be found."
        );


        return;
    }


    const confirmed =
        confirm(
            `Import ${parsed.length} topics into "${subject.name}"?\n\nExisting duplicates will be skipped.`
        );


    if (!confirmed) {
        return;
    }


    importBulkTopicsButton.disabled =
        true;


    importBulkTopicsButton.textContent =
        "Importing...";


    try {

        // =============================================
        // EXISTING TOPIC MAP
        // =============================================

        const topicByKey =
            new Map();


        subject.topics.forEach(
            topic => {

                topicByKey.set(
                    importNameKey(
                        topic.name
                    ),
                    topic
                );

            }
        );


        // =============================================
        // NEW TOPICS TO INSERT
        // =============================================

        const missingTopics =
            [];


        parsed.forEach(
            topic => {

                const key =
                    importNameKey(
                        topic.name
                    );


                if (
                    !topicByKey.has(
                        key
                    )
                ) {

                    missingTopics.push(
                        topic
                    );

                }

            }
        );


        if (
            missingTopics.length >
            0
        ) {

            const topicRows =
                missingTopics.map(
                    (
                        topic,
                        index
                    ) => ({

                        user_id:
                            currentUserId,

                        subject_id:
                            bulkImportSubjectId,

                        name:
                            topic.name,

                        position:
                            subject.topics.length +
                            index,

                        completed:
                            false

                    })
                );


            const {
                data:
                    insertedTopics,

                error:
                    topicInsertError
            } =
            await supabaseClient
                .from(
                    "topics"
                )
                .insert(
                    topicRows
                )
                .select(
                    "id,name,position,completed"
                );


            if (
                topicInsertError
            ) {

                throw topicInsertError;

            }


            (
                insertedTopics ||
                []
            )
                .forEach(
                    topic => {

                        topicByKey.set(
                            importNameKey(
                                topic.name
                            ),
                            {
                                ...topic,
                                subtopics:
                                    []
                            }
                        );

                    }
                );

        }


        // =============================================
        // BUILD SUBTOPICS TO INSERT
        // =============================================

        const newSubtopicRows =
            [];


        let skippedTopicDuplicates =
            parsed.length -
            missingTopics.length;


        let skippedSubtopicDuplicates =
            0;


        parsed.forEach(
            parsedTopic => {

                const topic =
                    topicByKey.get(
                        importNameKey(
                            parsedTopic.name
                        )
                    );


                if (!topic) {
                    return;
                }


                const existingSubtopics =
                    topic.subtopics ||
                    [];


                const existingKeys =
                    new Set(
                        existingSubtopics.map(
                            subtopic =>
                                importNameKey(
                                    subtopic.name
                                )
                        )
                    );


                let nextPosition =
                    existingSubtopics.length;


                parsedTopic
                    .subtopics
                    .forEach(
                        subtopicName => {

                            const key =
                                importNameKey(
                                    subtopicName
                                );


                            if (
                                existingKeys.has(
                                    key
                                )
                            ) {

                                skippedSubtopicDuplicates++;

                                return;
                            }


                            existingKeys.add(
                                key
                            );


                            newSubtopicRows.push(
                                {

                                    user_id:
                                        currentUserId,

                                    topic_id:
                                        topic.id,

                                    name:
                                        subtopicName,

                                    position:
                                        nextPosition++,

                                    completed:
                                        false

                                }
                            );

                        }
                    );

            }
        );


        // =============================================
        // INSERT ALL MISSING SUBTOPICS
        // =============================================

        if (
            newSubtopicRows.length >
            0
        ) {

            const {
                error:
                    subtopicInsertError
            } =
            await supabaseClient
                .from(
                    "subtopics"
                )
                .insert(
                    newSubtopicRows
                );


            if (
                subtopicInsertError
            ) {

                throw subtopicInsertError;

            }

        }


        // =============================================
        // REFRESH SUBJECTS PAGE
        // =============================================

        closeBulkImport();


        await loadCloudData();


        alert(
            `Bulk import complete ✅\n\n` +
            `New topics: ${missingTopics.length}\n` +
            `New subtopics: ${newSubtopicRows.length}\n` +
            `Skipped existing topics: ${skippedTopicDuplicates}\n` +
            `Skipped existing subtopics: ${skippedSubtopicDuplicates}`
        );

    }

    catch (error) {

        console.error(
            "Bulk topic import failed:",
            error
        );


        alert(
            "Bulk import could not be completed. No existing syllabus data was removed."
        );

    }

    finally {

        importBulkTopicsButton.disabled =
            false;


        importBulkTopicsButton.textContent =
            "Import Topics";

    }
}


// -----------------------------------------------------
// BULK IMPORT EVENTS
// -----------------------------------------------------

bulkImportText.addEventListener(
    "input",
    updateBulkImportPreview
);


closeBulkImportModalButton.addEventListener(
    "click",
    closeBulkImport
);


cancelBulkImportButton.addEventListener(
    "click",
    closeBulkImport
);


importBulkTopicsButton.addEventListener(
    "click",
    importBulkTopics
);


bulkImportModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            bulkImportModal
        ) {

            closeBulkImport();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape" &&
            bulkImportModal
                .classList
                .contains(
                    "show"
                )
        ) {

            closeBulkImport();

        }

    }
);


// =====================================================
// START APP
// =====================================================

loadCloudData();
// =====================================================
// SUBJECT PRIORITY / REORDER
// =====================================================

let subjectMoveInProgress = false;


async function moveSubject(
    sectionId,
    subjectId,
    direction
) {

    // Prevent double click / multiple updates
    if (subjectMoveInProgress) {
        return;
    }


    const section =
        findSection(
            sectionId
        );


    if (!section) {

        console.error(
            "Section not found:",
            sectionId
        );

        return;
    }


    const subjects =
        section.subjects;


    const currentIndex =
        subjects.findIndex(
            subject =>
                subject.id ===
                subjectId
        );


    if (currentIndex === -1) {

        console.error(
            "Subject not found:",
            subjectId
        );

        return;
    }


    const targetIndex =
        currentIndex +
        direction;


    // Already highest priority
    if (targetIndex < 0) {
        return;
    }


    // Already lowest priority
    if (
        targetIndex >=
        subjects.length
    ) {
        return;
    }


    const currentSubject =
        subjects[
            currentIndex
        ];


    const targetSubject =
        subjects[
            targetIndex
        ];


    /*
        IMPORTANT:

        We swap the ACTUAL database
        position values.

        We do NOT assume that array
        index = database position.

        This keeps the system safe
        even if positions have gaps.
    */

    const currentPosition =
        Number(
            currentSubject.position ??
            currentIndex
        );


    const targetPosition =
        Number(
            targetSubject.position ??
            targetIndex
        );


    subjectMoveInProgress =
        true;


    try {

        // =============================================
        // TEMPORARILY MOVE CURRENT SUBJECT
        // =============================================

        const temporaryPosition =
            -1000000;


        const {
            error:
                temporaryError
        } =
        await supabaseClient
            .from(
                "subjects"
            )
            .update({

                position:
                    temporaryPosition

            })
            .eq(
                "id",
                currentSubject.id
            )
            .eq(
                "user_id",
                currentUserId
            );


        if (temporaryError) {

            throw temporaryError;

        }


        // =============================================
        // MOVE TARGET SUBJECT
        // TO CURRENT SUBJECT'S POSITION
        // =============================================

        const {
            error:
                targetError
        } =
        await supabaseClient
            .from(
                "subjects"
            )
            .update({

                position:
                    currentPosition

            })
            .eq(
                "id",
                targetSubject.id
            )
            .eq(
                "user_id",
                currentUserId
            );


        if (targetError) {

            /*
                Try restoring current subject
                before throwing error.
            */

            await supabaseClient
                .from(
                    "subjects"
                )
                .update({

                    position:
                        currentPosition

                })
                .eq(
                    "id",
                    currentSubject.id
                )
                .eq(
                    "user_id",
                    currentUserId
                );


            throw targetError;

        }


        // =============================================
        // MOVE CURRENT SUBJECT
        // TO TARGET SUBJECT'S POSITION
        // =============================================

        const {
            error:
                currentError
        } =
        await supabaseClient
            .from(
                "subjects"
            )
            .update({

                position:
                    targetPosition

            })
            .eq(
                "id",
                currentSubject.id
            )
            .eq(
                "user_id",
                currentUserId
            );


        if (currentError) {

            /*
                Try restoring both positions
                if final update fails.
            */

            await supabaseClient
                .from(
                    "subjects"
                )
                .update({

                    position:
                        targetPosition

                })
                .eq(
                    "id",
                    targetSubject.id
                )
                .eq(
                    "user_id",
                    currentUserId
                );


            await supabaseClient
                .from(
                    "subjects"
                )
                .update({

                    position:
                        currentPosition

                })
                .eq(
                    "id",
                    currentSubject.id
                )
                .eq(
                    "user_id",
                    currentUserId
                );


            throw currentError;

        }


        // =============================================
        // UPDATE LOCAL DATA
        // =============================================

        currentSubject.position =
            targetPosition;


        targetSubject.position =
            currentPosition;


        // Swap array positions
        subjects[
            currentIndex
        ] =
            targetSubject;


        subjects[
            targetIndex
        ] =
            currentSubject;


        // =============================================
        // REDRAW SUBJECTS
        // =============================================

        renderSections();


        console.log(
            "Subject priority updated:",
            currentSubject.name
        );

    }

    catch (error) {

        console.error(
            "Subject priority update failed:",
            error
        );


        alert(
            "Could not change subject priority. Please try again."
        );


        /*
            Reload actual Supabase order
            so UI and cloud stay synced.
        */

        try {

            await loadCloudData();

        }

        catch (
            reloadError
        ) {

            console.error(
                "Could not reload subjects:",
                reloadError
            );

        }

    }

    finally {

        subjectMoveInProgress =
            false;

    }

}
// =====================================================
// PRODUCTIVE HORIZON
// FAST BATCH PROGRESS SYSTEM
//
// Tick as many Subjects / Topics / Subtopics as you want.
// NOTHING is sent to Supabase on each tick.
//
// Press "Save Progress" once to save everything.
// =====================================================

(function () {

    // =================================================
    // PENDING CHANGES
    // =================================================

    const pendingProgressChanges = {

        subjects:
            new Map(),

        topics:
            new Map(),

        subtopics:
            new Map()

    };


    let progressSaveInProgress =
        false;


    // =================================================
    // CREATE FLOATING SAVE BUTTON
    // =================================================

    const progressSavePanel =
        document.createElement(
            "div"
        );


    progressSavePanel.id =
        "progressSavePanel";


    progressSavePanel.style.position =
        "fixed";


    progressSavePanel.style.right =
        "24px";


    progressSavePanel.style.bottom =
        "24px";


    progressSavePanel.style.zIndex =
        "99999";


    progressSavePanel.style.display =
        "none";


    progressSavePanel.style.alignItems =
        "center";


    progressSavePanel.style.gap =
        "10px";


    progressSavePanel.style.padding =
        "10px 12px";


    progressSavePanel.style.borderRadius =
        "14px";


    progressSavePanel.style.boxShadow =
        "0 8px 28px rgba(0,0,0,.18)";


    progressSavePanel.style.background =
        "var(--card, #ffffff)";


    progressSavePanel.style.border =
        "1px solid var(--border, #ddd)";


    progressSavePanel.innerHTML = `

        <span
            id="pendingProgressCount"
            style="
                font-size:12px;
                font-weight:600;
                white-space:nowrap;
            "
        >
            0 Unsaved Changes
        </span>


        <button
            id="saveProgressBatchButton"
            type="button"
            style="
                border:none;
                border-radius:10px;
                padding:10px 14px;
                cursor:pointer;
                font-weight:700;
            "
        >
            💾 Save Progress
        </button>
    `;


    document.body.appendChild(
        progressSavePanel
    );


    const pendingProgressCount =
        document.getElementById(
            "pendingProgressCount"
        );


    const saveProgressBatchButton =
        document.getElementById(
            "saveProgressBatchButton"
        );


    // =================================================
    // COUNT CHANGES
    // =================================================

    function getPendingChangeCount() {

        return (
            pendingProgressChanges
                .subjects
                .size
            +
            pendingProgressChanges
                .topics
                .size
            +
            pendingProgressChanges
                .subtopics
                .size
        );

    }


    function updateProgressSavePanel() {

        const count =
            getPendingChangeCount();


        pendingProgressCount
            .textContent =
            `${count} Unsaved Change${
                count === 1
                    ? ""
                    : "s"
            }`;


        progressSavePanel.style.display =
            count > 0
                ? "flex"
                : "none";

    }


    // =================================================
    // MARK CHANGE
    // =================================================

    function markProgressChange(
        type,
        id,
        completed
    ) {

        pendingProgressChanges[
            type
        ].set(
            id,
            Boolean(
                completed
            )
        );


        updateProgressSavePanel();

    }


    // =================================================
    // FIND SUBJECT CHECKBOX
    // =================================================

    function getSubjectCheckbox(
        subjectId
    ) {

        const toggleButton =
            document.getElementById(
                `subject-toggle-${subjectId}`
            );


        const card =
            toggleButton
                ?.closest(
                    ".subject-manager-card"
                );


        return card
            ?.querySelector(
                ".subject-main-info input[type='checkbox']"
            )
            ||
            null;

    }


    // =================================================
    // FIND TOPIC CHECKBOX
    // =================================================

    function getTopicCheckbox(
        topicId
    ) {

        const toggleButton =
            document.getElementById(
                `topic-toggle-${topicId}`
            );


        const row =
            toggleButton
                ?.closest(
                    ".topic-manager-row"
                );


        return row
            ?.querySelector(
                ".topic-name-area input[type='checkbox']"
            )
            ||
            null;

    }


    // =================================================
    // UPDATE SUBJECT PARENT STATE LOCALLY
    // =================================================

    function updateSubjectStateLocally(
        subject
    ) {

        if (
            !subject ||
            subject.topics.length === 0
        ) {

            return;

        }


        const completed =
            subject.topics.every(
                topic =>
                    topic.completed
            );


        subject.completed =
            completed;


        markProgressChange(
            "subjects",
            subject.id,
            completed
        );


        const checkbox =
            getSubjectCheckbox(
                subject.id
            );


        if (checkbox) {

            checkbox.checked =
                completed;

        }

    }


    // =================================================
    // UPDATE TOPIC PARENT STATE LOCALLY
    // =================================================

    function updateTopicStateLocally(
        topic
    ) {

        if (
            !topic ||
            topic.subtopics.length === 0
        ) {

            return;

        }


        const completed =
            topic.subtopics.every(
                subtopic =>
                    subtopic.completed
            );


        topic.completed =
            completed;


        markProgressChange(
            "topics",
            topic.id,
            completed
        );


        const checkbox =
            getTopicCheckbox(
                topic.id
            );


        if (checkbox) {

            checkbox.checked =
                completed;

        }

    }


    // =================================================
    // NEW FAST SUBJECT TOGGLE
    // =================================================

    window.toggleSubject =
        function (
            sectionId,
            subjectId,
            checked
        ) {

            const subject =
                findSubject(
                    sectionId,
                    subjectId
                );


            if (!subject) {
                return;
            }


            subject.completed =
                checked;


            markProgressChange(
                "subjects",
                subjectId,
                checked
            );


            // =========================================
            // UPDATE ALL TOPICS
            // =========================================

            subject.topics.forEach(
                function (
                    topic
                ) {

                    topic.completed =
                        checked;


                    markProgressChange(
                        "topics",
                        topic.id,
                        checked
                    );


                    const topicCheckbox =
                        getTopicCheckbox(
                            topic.id
                        );


                    if (
                        topicCheckbox
                    ) {

                        topicCheckbox.checked =
                            checked;

                    }


                    // =================================
                    // UPDATE ALL SUBTOPICS
                    // =================================

                    topic.subtopics.forEach(
                        function (
                            subtopic
                        ) {

                            subtopic.completed =
                                checked;


                            markProgressChange(
                                "subtopics",
                                subtopic.id,
                                checked
                            );


                            const subtopicRow =
                                document
                                    .querySelector(
                                        `
                                        input[
                                            onchange*="'${subtopic.id}'"
                                        ]
                                        `
                                    );


                            if (
                                subtopicRow
                            ) {

                                subtopicRow.checked =
                                    checked;

                            }

                        }
                    );

                }
            );

        };


    // =================================================
    // NEW FAST TOPIC TOGGLE
    // =================================================

    window.toggleTopic =
        function (
            sectionId,
            subjectId,
            topicId,
            checked
        ) {

            const subject =
                findSubject(
                    sectionId,
                    subjectId
                );


            const topic =
                findTopic(
                    sectionId,
                    subjectId,
                    topicId
                );


            if (
                !subject ||
                !topic
            ) {

                return;

            }


            topic.completed =
                checked;


            markProgressChange(
                "topics",
                topicId,
                checked
            );


            // =========================================
            // UPDATE SUBTOPICS LOCALLY
            // =========================================

            topic.subtopics.forEach(
                function (
                    subtopic
                ) {

                    subtopic.completed =
                        checked;


                    markProgressChange(
                        "subtopics",
                        subtopic.id,
                        checked
                    );


                    /*
                        Find subtopic checkbox from
                        existing onchange attribute.
                    */

                    const checkboxes =
                        document.querySelectorAll(
                            ".subtopic-row input[type='checkbox']"
                        );


                    checkboxes.forEach(
                        function (
                            checkbox
                        ) {

                            const onchange =
                                checkbox
                                    .getAttribute(
                                        "onchange"
                                    )
                                ||
                                "";


                            if (
                                onchange.includes(
                                    subtopic.id
                                )
                            ) {

                                checkbox.checked =
                                    checked;

                            }

                        }
                    );

                }
            );


            // =========================================
            // UPDATE SUBJECT STATE
            // =========================================

            updateSubjectStateLocally(
                subject
            );

        };


    // =================================================
    // NEW FAST SUBTOPIC TOGGLE
    // =================================================

    window.toggleSubtopic =
        function (
            sectionId,
            subjectId,
            topicId,
            subtopicId,
            checked
        ) {

            const subject =
                findSubject(
                    sectionId,
                    subjectId
                );


            const topic =
                findTopic(
                    sectionId,
                    subjectId,
                    topicId
                );


            const subtopic =
                findSubtopic(
                    sectionId,
                    subjectId,
                    topicId,
                    subtopicId
                );


            if (
                !subject ||
                !topic ||
                !subtopic
            ) {

                return;

            }


            subtopic.completed =
                checked;


            markProgressChange(
                "subtopics",
                subtopicId,
                checked
            );


            // =========================================
            // UPDATE TOPIC STATE
            // =========================================

            updateTopicStateLocally(
                topic
            );


            // =========================================
            // UPDATE SUBJECT STATE
            // =========================================

            updateSubjectStateLocally(
                subject
            );

        };


    // =================================================
    // SAVE IDS BY COMPLETION VALUE
    // =================================================

    async function saveMapToCloud(
        table,
        map
    ) {

        const completedIds =
            [];


        const incompleteIds =
            [];


        map.forEach(
            function (
                completed,
                id
            ) {

                if (
                    completed
                ) {

                    completedIds.push(
                        id
                    );

                }

                else {

                    incompleteIds.push(
                        id
                    );

                }

            }
        );


        // =============================================
        // SAVE CHECKED
        // =============================================

        if (
            completedIds.length >
            0
        ) {

            const {
                error
            } =
            await supabaseClient
                .from(
                    table
                )
                .update({

                    completed:
                        true

                })
                .in(
                    "id",
                    completedIds
                )
                .eq(
                    "user_id",
                    currentUserId
                );


            if (error) {

                throw error;

            }

        }


        // =============================================
        // SAVE UNCHECKED
        // =============================================

        if (
            incompleteIds.length >
            0
        ) {

            const {
                error
            } =
            await supabaseClient
                .from(
                    table
                )
                .update({

                    completed:
                        false

                })
                .in(
                    "id",
                    incompleteIds
                )
                .eq(
                    "user_id",
                    currentUserId
                );


            if (error) {

                throw error;

            }

        }

    }


    // =================================================
    // SAVE ALL PROGRESS
    // =================================================

    async function saveAllPendingProgress() {

        if (
            progressSaveInProgress
        ) {

            return;

        }


        const count =
            getPendingChangeCount();


        if (
            count === 0
        ) {

            return;

        }


        progressSaveInProgress =
            true;


        saveProgressBatchButton.disabled =
            true;


        saveProgressBatchButton.textContent =
            "Saving...";


        try {

            /*
                Maximum requests:

                Subjects checked
                Subjects unchecked

                Topics checked
                Topics unchecked

                Subtopics checked
                Subtopics unchecked

                So even 100 ticks =
                maximum around 6 update requests.
            */


            await saveMapToCloud(
                "subjects",
                pendingProgressChanges
                    .subjects
            );


            await saveMapToCloud(
                "topics",
                pendingProgressChanges
                    .topics
            );


            await saveMapToCloud(
                "subtopics",
                pendingProgressChanges
                    .subtopics
            );


            // =========================================
            // CLEAR PENDING CHANGES
            // =========================================

            pendingProgressChanges
                .subjects
                .clear();


            pendingProgressChanges
                .topics
                .clear();


            pendingProgressChanges
                .subtopics
                .clear();


            updateProgressSavePanel();


            // =========================================
            // ONLY ONE CLOUD RELOAD
            // =========================================

            await loadCloudData();


            console.log(
                "Batch progress saved successfully"
            );

        }

        catch (
            error
        ) {

            console.error(
                "Batch progress save failed:",
                error
            );


            alert(
                "Progress could not be saved. Your unsaved changes are still available — press Save Progress again."
            );

        }

        finally {

            progressSaveInProgress =
                false;


            saveProgressBatchButton.disabled =
                false;


            saveProgressBatchButton.textContent =
                "💾 Save Progress";

        }

    }


    // =================================================
    // SAVE BUTTON
    // =================================================

    saveProgressBatchButton
        .addEventListener(
            "click",
            saveAllPendingProgress
        );


    // =================================================
    // WARN BEFORE LEAVING WITH UNSAVED CHANGES
    // =================================================

    window.addEventListener(
        "beforeunload",
        function (
            event
        ) {

            if (
                getPendingChangeCount() ===
                0
            ) {

                return;

            }


            event.preventDefault();


            event.returnValue =
                "";

        }
    );


    console.log(
        "Fast Batch Progress System ready"
    );

})();
