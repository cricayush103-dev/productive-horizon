// =====================================================
// PRODUCTIVE HORIZON
// PHASE 1 - LIGHTWEIGHT SUBJECT INTELLIGENCE
//
// NO MutationObserver
// NO controls created until user asks for them
//
// Features:
// • High / Medium / Low Priority
// • Critical / Weak / Medium / Strong Strength
// • Revision information
// • Quick filters
// • Per-subject Intelligence toggle
// • Auto Revision 1 after completed topic is saved
// =====================================================

(function () {

    "use strict";


    // =================================================
    // CONFIG
    // =================================================

    const PRIORITIES = [
        "High",
        "Medium",
        "Low"
    ];


    const STRENGTHS = [
        "Critical",
        "Weak",
        "Medium",
        "Strong"
    ];


    let activeFilter =
        "all";


    /*
        Stores which subjects currently have
        intelligence controls open.
    */

    const openSubjects =
        new Set();


    // =================================================
    // DATE HELPERS
    // =================================================

    function getToday() {

        const date =
            new Date();


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            `${year}-${month}-${day}`
        );

    }


    function addDays(
        dateString,
        days
    ) {

        const parts =
            dateString
                .split("-")
                .map(
                    Number
                );


        const date =
            new Date(
                parts[0],
                parts[1] - 1,
                parts[2],
                12,
                0,
                0
            );


        date.setDate(
            date.getDate() +
            days
        );


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            `${year}-${month}-${day}`
        );

    }


    // =================================================
    // DATA HELPERS
    // =================================================

    function getTopicContext(
        topicId
    ) {

        if (
            typeof sections ===
            "undefined"
        ) {

            return null;

        }


        for (
            const section
            of sections
        ) {

            for (
                const subject
                of (
                    section.subjects ||
                    []
                )
            ) {

                const topic =
                    (
                        subject.topics ||
                        []
                    )
                        .find(
                            item =>
                                item.id ===
                                topicId
                        );


                if (
                    topic
                ) {

                    return {

                        section:
                            section,

                        subject:
                            subject,

                        topic:
                            topic

                    };

                }

            }

        }


        return null;

    }


    function getSubjectData(
        subjectId
    ) {

        if (
            typeof sections ===
            "undefined"
        ) {

            return null;

        }


        for (
            const section
            of sections
        ) {

            const subject =
                (
                    section.subjects ||
                    []
                )
                    .find(
                        item =>
                            item.id ===
                            subjectId
                    );


            if (
                subject
            ) {

                return subject;

            }

        }


        return null;

    }


    function topicIsDue(
        topic
    ) {

        return Boolean(

            topic.next_revision_at &&

            topic.next_revision_at <=
            getToday()

        );

    }


    // =================================================
    // STYLES
    // =================================================

    function injectStyles() {

        if (
            document.getElementById(
                "phLiteIntelligenceStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "phLiteIntelligenceStyles";


        style.textContent = `

        /* ==========================================
           QUICK FILTERS
        ========================================== */

        .ph-intelligence-toolbar{

            display:flex;
            align-items:center;
            gap:8px;
            flex-wrap:wrap;

            margin-bottom:16px;

            padding:12px 14px;

            border:
                1px solid
                var(--border);

            border-radius:14px;

            background:
                var(--card);

        }


        .ph-intelligence-toolbar strong{

            font-size:13px;

        }


        .ph-intelligence-toolbar button{

            border:
                1px solid
                var(--border);

            background:
                var(--card);

            color:
                var(--text);

            padding:
                8px 11px;

            border-radius:
                9px;

            font-size:
                12px;

            cursor:pointer;

        }


        .ph-intelligence-toolbar button.active{

            background:
                var(--text);

            color:
                var(--card);

        }



        /* ==========================================
           INTELLIGENCE BUTTON
        ========================================== */

        .ph-intelligence-btn{

            white-space:
                nowrap;

        }


        .ph-intelligence-btn.active{

            border-color:
                #6366f1 !important;

            background:
                rgba(
                    99,
                    102,
                    241,
                    .16
                ) !important;

        }



        /* ==========================================
           TOPIC INTELLIGENCE
        ========================================== */

        .ph-topic-intelligence{

            display:flex;

            align-items:center;

            gap:10px;

            flex-wrap:wrap;

            margin:
                8px
                0
                5px
                34px;

            padding:
                9px
                10px;

            border:
                1px dashed
                var(--border);

            border-radius:
                10px;

            background:
                var(--background);

        }


        .ph-topic-intelligence label{

            font-size:
                11px;

            font-weight:
                700;

            color:
                var(--secondary);

        }


        .ph-topic-intelligence select{

            min-width:
                110px;

            border:
                1px solid
                var(--border);

            background:
                var(--card);

            color:
                var(--text);

            padding:
                6px 8px;

            border-radius:
                8px;

        }


        .ph-topic-meta{

            margin-left:
                auto;

            font-size:
                11px;

            color:
                var(--secondary);

        }


        .ph-topic-meta.due{

            color:
                #f59e0b;

            font-weight:
                700;

        }


        @media(
            max-width:
                700px
        ){

            .ph-topic-intelligence{

                margin-left:
                    0;

            }


            .ph-topic-meta{

                width:
                    100%;

                margin-left:
                    0;

            }

        }

        `;


        document.head.appendChild(
            style
        );

    }


    // =================================================
    // QUICK FILTER TOOLBAR
    // =================================================

    function createToolbar() {

        if (
            document.getElementById(
                "phIntelligenceToolbar"
            )
        ) {

            return;

        }


        const syllabusContainer =
            document.getElementById(
                "sectionsContainer"
            );


        if (
            !syllabusContainer
        ) {

            return;

        }


        const toolbar =
            document.createElement(
                "div"
            );


        toolbar.id =
            "phIntelligenceToolbar";


        toolbar.className =
            "ph-intelligence-toolbar";


        toolbar.innerHTML = `

            <strong>
                Quick View:
            </strong>


            <button
                type="button"
                data-filter="all"
                class="active"
            >
                All
            </button>


            <button
                type="button"
                data-filter="high"
            >
                🔥 High Priority
            </button>


            <button
                type="button"
                data-filter="weak"
            >
                🧠 Weak / Critical
            </button>


            <button
                type="button"
                data-filter="due"
            >
                🔄 Revision Due
            </button>

        `;


        syllabusContainer
            .parentElement
            .insertBefore(

                toolbar,

                syllabusContainer

            );


        toolbar.addEventListener(
            "click",
            function (
                event
            ) {

                const button =
                    event.target.closest(
                        "[data-filter]"
                    );


                if (
                    !button
                ) {

                    return;

                }


                activeFilter =
                    button.dataset.filter;


                toolbar
                    .querySelectorAll(
                        "[data-filter]"
                    )
                    .forEach(
                        item => {

                            item
                                .classList
                                .toggle(

                                    "active",

                                    item ===
                                    button

                                );

                        }
                    );


                applyTopicFilter();

            }
        );

    }


    // =================================================
    // ADD INTELLIGENCE BUTTON TO SUBJECT
    // =================================================

    function enhanceSubjectHeaders() {

        document
            .querySelectorAll(
                ".subject-manager-card"
            )
            .forEach(
                function (
                    card
                ) {

                    if (
                        card.querySelector(
                            ".ph-intelligence-btn"
                        )
                    ) {

                        return;

                    }


                    const subjectToggle =
                        card.querySelector(
                            ".subject-collapse-toggle"
                        );


                    if (
                        !subjectToggle
                    ) {

                        return;

                    }


                    const subjectId =
                        subjectToggle.id
                            .replace(
                                "subject-toggle-",
                                ""
                            );


                    const actions =
                        card.querySelector(
                            ".subject-card-actions"
                        );


                    if (
                        !actions
                    ) {

                        return;

                    }


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "ph-intelligence-btn";


                    button.dataset.subjectId =
                        subjectId;


                    button.innerHTML =
                        "🧠 Intelligence";


                    button.title =
                        "Priority, Strength and Revision settings";


                    button.addEventListener(
                        "click",
                        function (
                            event
                        ) {

                            event.preventDefault();

                            event.stopPropagation();


                            toggleIntelligence(
                                subjectId,
                                card,
                                button
                            );

                        }
                    );


                    /*
                        Place before Edit/Delete.
                    */

                    const dangerButton =
                        actions.querySelector(
                            ".danger"
                        );


                    if (
                        dangerButton
                    ) {

                        actions.insertBefore(
                            button,
                            dangerButton
                        );

                    }

                    else {

                        actions.appendChild(
                            button
                        );

                    }


                    if (
                        openSubjects.has(
                            subjectId
                        )
                    ) {

                        showIntelligence(
                            subjectId,
                            card,
                            button
                        );

                    }

                }
            );

    }


    // =================================================
    // TOGGLE INTELLIGENCE
    // =================================================

    function toggleIntelligence(
        subjectId,
        card,
        button
    ) {

        if (
            openSubjects.has(
                subjectId
            )
        ) {

            hideIntelligence(
                subjectId,
                card,
                button
            );

        }

        else {

            showIntelligence(
                subjectId,
                card,
                button
            );

        }

    }


    // =================================================
    // SHOW
    // =================================================

    function showIntelligence(
        subjectId,
        card,
        button
    ) {

        openSubjects.add(
            subjectId
        );


        button.classList.add(
            "active"
        );


        button.innerHTML =
            "🧠 Hide";


        /*
            Open topics automatically because user
            explicitly asked to see intelligence.
        */

        const topicsList =
            card.querySelector(
                ".topics-list"
            );


        const subjectToggle =
            card.querySelector(
                ".subject-collapse-toggle"
            );


        if (
            topicsList
        ) {

            topicsList.classList.remove(
                "collapsed"
            );

        }


        if (
            subjectToggle
        ) {

            subjectToggle.textContent =
                "▼";

        }


        /*
            Important:
            Controls are created ONLY NOW.
        */

        createSubjectTopicControls(
            subjectId,
            card
        );

    }


    // =================================================
    // HIDE
    // =================================================

    function hideIntelligence(
        subjectId,
        card,
        button
    ) {

        openSubjects.delete(
            subjectId
        );


        button.classList.remove(
            "active"
        );


        button.innerHTML =
            "🧠 Intelligence";


        /*
            Remove controls completely.

            This keeps DOM light even when
            subject has hundreds of topics.
        */

        card
            .querySelectorAll(
                ".ph-topic-intelligence"
            )
            .forEach(
                box =>
                    box.remove()
            );

    }


    // =================================================
    // CREATE CONTROLS FOR ONE SUBJECT ONLY
    // =================================================

    function createSubjectTopicControls(
        subjectId,
        card
    ) {

        const subject =
            getSubjectData(
                subjectId
            );


        if (
            !subject
        ) {

            return;

        }


        card
            .querySelectorAll(
                ".topic-manager-row"
            )
            .forEach(
                function (
                    row
                ) {

                    if (
                        row.querySelector(
                            ".ph-topic-intelligence"
                        )
                    ) {

                        return;

                    }


                    const topicToggle =
                        row.querySelector(
                            ".topic-collapse-toggle"
                        );


                    if (
                        !topicToggle
                    ) {

                        return;

                    }


                    const topicId =
                        topicToggle.id
                            .replace(
                                "topic-toggle-",
                                ""
                            );


                    const context =
                        getTopicContext(
                            topicId
                        );


                    if (
                        !context ||
                        context.subject.id !==
                        subjectId
                    ) {

                        return;

                    }


                    createTopicControl(
                        row,
                        context.topic
                    );

                }
            );

    }


    // =================================================
    // ONE TOPIC CONTROL
    // =================================================

    function createTopicControl(
        row,
        topic
    ) {

        const box =
            document.createElement(
                "div"
            );


        box.className =
            "ph-topic-intelligence";


        const priority =
            topic.priority ||
            "Medium";


        const strength =
            topic.strength ||
            "Medium";


        const revisionCount =
            Number(
                topic.revision_count ||
                0
            );


        const lastRevision =
            topic.last_revised_at
                ?
                new Date(
                    topic.last_revised_at
                )
                    .toLocaleDateString()
                :
                "Never";


        const nextRevision =
            topic.next_revision_at ||
            "Not scheduled";


        box.innerHTML = `

            <label>
                Priority
            </label>


            <select
                class="ph-topic-priority"
            >

                ${

                    PRIORITIES
                        .map(
                            item => `

                                <option
                                    value="${item}"

                                    ${
                                        item ===
                                        priority
                                            ?
                                            "selected"
                                            :
                                            ""
                                    }
                                >

                                    ${item}

                                </option>

                            `
                        )
                        .join("")

                }

            </select>


            <label>
                Strength
            </label>


            <select
                class="ph-topic-strength"
            >

                ${

                    STRENGTHS
                        .map(
                            item => `

                                <option
                                    value="${item}"

                                    ${
                                        item ===
                                        strength
                                            ?
                                            "selected"
                                            :
                                            ""
                                    }
                                >

                                    ${item}

                                </option>

                            `
                        )
                        .join("")

                }

            </select>


            <span
                class="
                    ph-topic-meta
                    ${
                        topicIsDue(
                            topic
                        )
                            ?
                            "due"
                            :
                            ""
                    }
                "
            >

                🔄 Rev ${revisionCount}

                •

                Last:
                ${lastRevision}

                •

                Next:
                ${nextRevision}

            </span>

        `;


        // =============================================
        // PRIORITY CHANGE
        // =============================================

        box
            .querySelector(
                ".ph-topic-priority"
            )
            .addEventListener(
                "change",
                async function (
                    event
                ) {

                    await updateTopicValue(

                        topic,

                        "priority",

                        event.target.value

                    );

                }
            );


        // =============================================
        // STRENGTH CHANGE
        // =============================================

        box
            .querySelector(
                ".ph-topic-strength"
            )
            .addEventListener(
                "change",
                async function (
                    event
                ) {

                    await updateTopicValue(

                        topic,

                        "strength",

                        event.target.value

                    );

                }
            );


        row.appendChild(
            box
        );

    }


    // =================================================
    // SAVE PRIORITY / STRENGTH
    // =================================================

    async function updateTopicValue(
        topic,
        field,
        value
    ) {

        if (
            !topic ||
            !currentUserId
        ) {

            return;

        }


        const oldValue =
            topic[
                field
            ];


        topic[
            field
        ] =
            value;


        try {

            const {
                error
            } =
            await supabaseClient

                .from(
                    "topics"
                )

                .update({

                    [field]:
                        value

                })

                .eq(
                    "id",
                    topic.id
                )

                .eq(
                    "user_id",
                    currentUserId
                );


            if (
                error
            ) {

                throw error;

            }


            applyTopicFilter();

        }

        catch (
            error
        ) {

            topic[
                field
            ] =
                oldValue;


            console.error(
                "Topic intelligence save failed:",
                error
            );


            alert(
                "Could not save topic setting."
            );

        }

    }


    // =================================================
    // QUICK FILTER
    // =================================================

    function applyTopicFilter() {

        document
            .querySelectorAll(
                ".subject-manager-card"
            )
            .forEach(
                function (
                    card
                ) {

                    let visibleTopics =
                        0;


                    card
                        .querySelectorAll(
                            ".topic-manager-row"
                        )
                        .forEach(
                            function (
                                row
                            ) {

                                const toggle =
                                    row.querySelector(
                                        ".topic-collapse-toggle"
                                    );


                                if (
                                    !toggle
                                ) {

                                    return;

                                }


                                const topicId =
                                    toggle.id
                                        .replace(
                                            "topic-toggle-",
                                            ""
                                        );


                                const context =
                                    getTopicContext(
                                        topicId
                                    );


                                if (
                                    !context
                                ) {

                                    return;

                                }


                                const topic =
                                    context.topic;


                                let show =
                                    true;


                                if (
                                    activeFilter ===
                                    "high"
                                ) {

                                    show =
                                        (
                                            topic.priority ||
                                            "Medium"
                                        ) ===
                                        "High";

                                }


                                else if (
                                    activeFilter ===
                                    "weak"
                                ) {

                                    show =
                                        [
                                            "Critical",
                                            "Weak"
                                        ]
                                            .includes(
                                                topic.strength ||
                                                "Medium"
                                            );

                                }


                                else if (
                                    activeFilter ===
                                    "due"
                                ) {

                                    show =
                                        topicIsDue(
                                            topic
                                        );

                                }


                                row.style.display =
                                    show
                                        ?
                                        ""
                                        :
                                        "none";


                                if (
                                    show
                                ) {

                                    visibleTopics++;

                                }

                            }
                        );


                    if (
                        activeFilter ===
                        "all"
                    ) {

                        card.style.display =
                            "";

                    }

                    else {

                        card.style.display =
                            visibleTopics > 0
                                ?
                                ""
                                :
                                "none";


                        if (
                            visibleTopics > 0
                        ) {

                            const list =
                                card.querySelector(
                                    ".topics-list"
                                );


                            const toggle =
                                card.querySelector(
                                    ".subject-collapse-toggle"
                                );


                            if (
                                list
                            ) {

                                list.classList.remove(
                                    "collapsed"
                                );

                            }


                            if (
                                toggle
                            ) {

                                toggle.textContent =
                                    "▼";

                            }

                        }

                    }

                }
            );

    }


    // =================================================
    // AUTO FIRST REVISION
    // =================================================

    async function createMissingFirstRevisions() {

        if (
            !currentUserId ||
            typeof sections ===
            "undefined"
        ) {

            return;

        }


        const today =
            getToday();


        const tomorrow =
            addDays(
                today,
                1
            );


        for (
            const section
            of sections
        ) {

            for (
                const subject
                of (
                    section.subjects ||
                    []
                )
            ) {

                for (
                    const topic
                    of (
                        subject.topics ||
                        []
                    )
                ) {

                    /*
                        Only first time completed topic.
                    */

                    if (
                        !topic.completed ||
                        topic.learned_at
                    ) {

                        continue;

                    }


                    try {

                        const learnedAt =
                            new Date()
                                .toISOString();


                        // =================================
                        // UPDATE TOPIC
                        // =================================

                        const {
                            error:
                                updateError
                        } =
                        await supabaseClient

                            .from(
                                "topics"
                            )

                            .update({

                                learned_at:
                                    learnedAt,

                                next_revision_at:
                                    tomorrow

                            })

                            .eq(
                                "id",
                                topic.id
                            )

                            .eq(
                                "user_id",
                                currentUserId
                            );


                        if (
                            updateError
                        ) {

                            throw updateError;

                        }


                        topic.learned_at =
                            learnedAt;


                        topic.next_revision_at =
                            tomorrow;


                        // =================================
                        // CHECK EXISTING REVISION 1
                        // =================================

                        const {
                            data:
                                existing,

                            error:
                                checkError
                        } =
                        await supabaseClient

                            .from(
                                "revisions"
                            )

                            .select(
                                "id"
                            )

                            .eq(
                                "user_id",
                                currentUserId
                            )

                            .eq(
                                "topic_id",
                                topic.id
                            )

                            .eq(
                                "revision_stage",
                                1
                            )

                            .limit(
                                1
                            );


                        if (
                            checkError
                        ) {

                            throw checkError;

                        }


                        if (
                            existing &&
                            existing.length > 0
                        ) {

                            continue;

                        }


                        // =================================
                        // INSERT FIRST REVISION
                        // =================================

                        const {
                            error:
                                revisionError
                        } =
                        await supabaseClient

                            .from(
                                "revisions"
                            )

                            .insert({

                                user_id:
                                    currentUserId,

                                subject_id:
                                    subject.id,

                                topic_id:
                                    topic.id,

                                revision_number:
                                    1,

                                revision_stage:
                                    1,

                                scheduled_date:
                                    tomorrow,

                                completed:
                                    false,

                                notes:
                                    "Auto-scheduled first revision"

                            });


                        if (
                            revisionError
                        ) {

                            throw revisionError;

                        }

                    }

                    catch (
                        error
                    ) {

                        console.error(

                            "First revision scheduling failed:",

                            topic.name,

                            error

                        );

                    }

                }

            }

        }

    }


    // =================================================
    // WAIT UNTIL BATCH SAVE FINISHES
    // =================================================

    function waitForProgressSave() {

        let attempts =
            0;


        const timer =
            setInterval(
                function () {

                    attempts++;


                    const panel =
                        document.getElementById(
                            "progressSavePanel"
                        );


                    const button =
                        document.getElementById(
                            "saveProgressBatchButton"
                        );


                    const saveFinished =
                        (
                            !panel ||
                            panel.style.display ===
                            "none"
                        )
                        &&
                        (
                            !button ||
                            button.textContent
                                .includes(
                                    "Save Progress"
                                )
                        );


                    if (
                        saveFinished ||
                        attempts >= 40
                    ) {

                        clearInterval(
                            timer
                        );


                        createMissingFirstRevisions();

                    }

                },
                250
            );

    }


    // =================================================
    // SAVE PROGRESS CLICK LISTENER
    // =================================================

    document.addEventListener(
        "click",
        function (
            event
        ) {

            const button =
                event.target.closest(
                    "#saveProgressBatchButton"
                );


            if (
                !button
            ) {

                return;

            }


            waitForProgressSave();

        }
    );


    // =================================================
    // SAFE RENDER HOOK
    //
    // Very important:
    // Instead of MutationObserver, we wrap the existing
    // renderSections() only once.
    // =================================================

    const originalRenderSections =
        window.renderSections;


    if (
        typeof originalRenderSections ===
        "function"
    ) {

        window.renderSections =
            function (
                ...args
            ) {

                const result =
                    originalRenderSections
                        .apply(
                            this,
                            args
                        );


                /*
                    The original render is finished now.
                    Add only lightweight subject buttons.
                */

                enhanceSubjectHeaders();


                applyTopicFilter();


                return result;

            };

    }


    // =================================================
    // START
    // =================================================

    injectStyles();


    createToolbar();


    /*
        Existing loadCloudData() may still be running
        when this addon loads.

        renderSections wrapper above handles that.

        These retries only cover an already-rendered page.
        They do NOT mutate repeatedly.
    */

    setTimeout(
        function () {

            enhanceSubjectHeaders();

            applyTopicFilter();

        },
        500
    );


    setTimeout(
        function () {

            enhanceSubjectHeaders();

        },
        1500
    );


    console.log(
        "Lightweight Subject Intelligence ready ✅"
    );

})();