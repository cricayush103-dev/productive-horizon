// =====================================================
// PRODUCTIVE HORIZON
// PYQ TRACKER
// =====================================================


let pyqUserId =
    null;


let pyqSubjects =
    [];


let pyqTopics =
    [];


let pyqRows =
    [];


const P =
    id =>
        document.getElementById(
            id
        );


// =====================================================
// DATE
// =====================================================

function pyqToday() {

    if (
        typeof phLocalDate ===
        "function"
    ) {

        return phLocalDate();

    }


    const date =
        new Date();


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        )
        +
        "-"
        +
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )
    );

}


// =====================================================
// SUBJECT NAME
// =====================================================

function getPyqSubjectName(
    subjectId
) {

    return (
        pyqSubjects.find(
            subject =>
                subject.id ===
                subjectId
        )
        ?.name
        ||
        "Subject"
    );

}


// =====================================================
// TOPIC NAME
// =====================================================

function getPyqTopicName(
    topicId
) {

    return (
        pyqTopics.find(
            topic =>
                topic.id ===
                topicId
        )
        ?.name
        ||
        "Topic"
    );

}


// =====================================================
// LOAD ALL TOPICS
// =====================================================

async function loadAllPyqTopics() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "topics"
        )
        .select(
            "id,subject_id,name,position"
        )
        .eq(
            "user_id",
            pyqUserId
        )
        .order(
            "position",
            {
                ascending:
                    true
            }
        );


    if (
        error
    ) {

        console.error(
            "Could not load PYQ topics:",
            error
        );


        return;

    }


    pyqTopics =
        data ||
        [];

}


// =====================================================
// POPULATE TOPICS FOR SUBJECT
// =====================================================

function populatePyqTopics() {

    const subjectId =
        P(
            "pyqSubject"
        ).value;


    const topics =
        pyqTopics.filter(
            topic =>
                topic.subject_id ===
                subjectId
        );


    if (
        !topics.length
    ) {

        P(
            "pyqTopic"
        ).innerHTML =
            `
            <option value="">
                No topics found
            </option>
            `;


        P(
            "pyqTopic"
        ).disabled =
            true;


        return;

    }


    P(
        "pyqTopic"
    ).disabled =
        false;


    P(
        "pyqTopic"
    ).innerHTML =
        topics
            .map(
                topic =>
                    `

                    <option
                        value="${topic.id}"
                    >
                        ${phEscape(
                            topic.name
                        )}
                    </option>

                    `
            )
            .join("");

}


// =====================================================
// CALCULATE PREVIEW
// =====================================================

function updatePyqPreview() {

    const attempted =
        Number(
            P(
                "pyqAttempted"
            ).value
            ||
            0
        );


    const correct =
        Number(
            P(
                "pyqCorrect"
            ).value
            ||
            0
        );


    const wrong =
        Number(
            P(
                "pyqWrong"
            ).value
            ||
            0
        );


    const skipped =
        Number(
            P(
                "pyqSkipped"
            ).value
            ||
            0
        );


    const accuracy =
        attempted > 0
            ?
            (
                correct /
                attempted
            ) *
            100
            :
            0;


    let className =
        "pyq-critical";


    if (
        accuracy >= 85
    ) {

        className =
            "pyq-good";

    }

    else if (
        accuracy >= 70
    ) {

        className =
            "pyq-medium";

    }

    else if (
        accuracy >= 50
    ) {

        className =
            "pyq-weak";

    }


    P(
        "pyqPreview"
    ).innerHTML =
        `

        Accuracy:

        <strong
            class="${className}"
        >

            ${accuracy.toFixed(1)}%

        </strong>

        &nbsp; • &nbsp;

        Correct:
        ${correct}

        &nbsp; • &nbsp;

        Wrong:
        ${wrong}

        &nbsp; • &nbsp;

        Skipped:
        ${skipped}

        `;

}


// =====================================================
// UPDATE TOPIC STRENGTH FROM ALL PYQ DATA
// =====================================================

async function updateTopicFromPyq(
    topicId
) {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "pyq_sessions"
        )
        .select(
            "attempted,correct"
        )
        .eq(
            "user_id",
            pyqUserId
        )
        .eq(
            "topic_id",
            topicId
        );


    if (
        error
    ) {

        console.error(
            "Could not calculate topic PYQ score:",
            error
        );


        return;

    }


    const rows =
        data ||
        [];


    const attempted =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.attempted ||
                    0
                ),
            0
        );


    const correct =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.correct ||
                    0
                ),
            0
        );


    if (
        attempted === 0
    ) {

        return;

    }


    const score =
        Math.round(
            (
                correct /
                attempted
            ) *
            100
        );


    let strength =
        "Critical";


    if (
        score >= 85
    ) {

        strength =
            "Strong";

    }

    else if (
        score >= 70
    ) {

        strength =
            "Medium";

    }

    else if (
        score >= 50
    ) {

        strength =
            "Weak";

    }


    const {
        error:
            updateError
    } =
    await supabaseClient
        .from(
            "topics"
        )
        .update({

            strength_score:
                score,

            strength:
                strength

        })
        .eq(
            "id",
            topicId
        )
        .eq(
            "user_id",
            pyqUserId
        );


    if (
        updateError
    ) {

        console.error(
            "Could not update topic strength:",
            updateError
        );

    }

}


// =====================================================
// LOAD PYQ HISTORY
// =====================================================

async function loadPyqHistory() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "pyq_sessions"
        )
        .select(
            "*"
        )
        .eq(
            "user_id",
            pyqUserId
        )
        .order(
            "practice_date",
            {
                ascending:
                    false
            }
        )
        .order(
            "created_at",
            {
                ascending:
                    false
            }
        );


    if (
        error
    ) {

        console.error(
            "Could not load PYQ history:",
            error
        );


        return;

    }


    pyqRows =
        data ||
        [];


    renderPyqStats();


    renderPyqHistory();

}


// =====================================================
// STATS
// =====================================================

function renderPyqStats() {

    const attempted =
        pyqRows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.attempted ||
                    0
                ),
            0
        );


    const correct =
        pyqRows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.correct ||
                    0
                ),
            0
        );


    const accuracy =
        attempted > 0
            ?
            Math.round(
                (
                    correct /
                    attempted
                ) *
                100
            )
            :
            0;


    P(
        "pyqTotalAttempted"
    ).textContent =
        attempted;


    P(
        "pyqTotalCorrect"
    ).textContent =
        correct;


    P(
        "pyqAccuracy"
    ).textContent =
        `${accuracy}%`;


    P(
        "pyqSessions"
    ).textContent =
        pyqRows.length;

}


// =====================================================
// HISTORY UI
// =====================================================

function renderPyqHistory() {

    if (
        !pyqRows.length
    ) {

        P(
            "pyqHistory"
        ).innerHTML =
            `

            <div class="empty-mini">
                No PYQ practice logged yet.
            </div>

            `;


        return;

    }


    P(
        "pyqHistory"
    ).innerHTML =
        pyqRows
            .map(
                row => {

                    const accuracy =
                        Number(
                            row.accuracy ||
                            0
                        );


                    let strength =
                        "Critical";


                    if (
                        accuracy >= 85
                    ) {

                        strength =
                            "Strong";

                    }

                    else if (
                        accuracy >= 70
                    ) {

                        strength =
                            "Medium";

                    }

                    else if (
                        accuracy >= 50
                    ) {

                        strength =
                            "Weak";

                    }


                    return `

                    <div
                        class="module-row"
                    >


                        <div
                            class="module-row-main"
                        >

                            <strong>

                                ${
                                    phEscape(
                                        getPyqSubjectName(
                                            row.subject_id
                                        )
                                    )
                                }

                                •

                                ${
                                    phEscape(
                                        getPyqTopicName(
                                            row.topic_id
                                        )
                                    )
                                }

                            </strong>


                            <span>

                                ${row.practice_date}

                                •

                                ${
                                    phEscape(
                                        row.source ||
                                        "PYQ"
                                    )
                                }

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


                            <div
                                class="pyq-history-meta"
                            >

                                <span class="pyq-chip">

                                    Attempted:
                                    ${row.attempted}

                                </span>


                                <span class="pyq-chip">

                                    ✅
                                    ${row.correct}

                                </span>


                                <span class="pyq-chip">

                                    ❌
                                    ${row.wrong}

                                </span>


                                <span class="pyq-chip">

                                    ⏭️
                                    ${row.skipped}

                                </span>

                            </div>

                        </div>


                        <span
                            class="status-pill"
                        >

                            ${accuracy.toFixed(1)}%

                            •

                            ${strength}

                        </span>


                        <button

                            type="button"

                            class="
                                module-btn
                                danger
                            "

                            onclick="
                                deletePyqSession(
                                    '${row.id}',
                                    '${row.topic_id || ""}'
                                )
                            "

                        >

                            🗑️

                        </button>


                    </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// SAVE PYQ RESULT
// =====================================================

P(
    "pyqForm"
).addEventListener(
    "submit",
    async function (
        event
    ) {

        event.preventDefault();


        const subjectId =
            P(
                "pyqSubject"
            ).value;


        const topicId =
            P(
                "pyqTopic"
            ).value;


        const attempted =
            Number(
                P(
                    "pyqAttempted"
                ).value
                ||
                0
            );


        const correct =
            Number(
                P(
                    "pyqCorrect"
                ).value
                ||
                0
            );


        const wrong =
            Number(
                P(
                    "pyqWrong"
                ).value
                ||
                0
            );


        const skipped =
            Number(
                P(
                    "pyqSkipped"
                ).value
                ||
                0
            );


        if (
            !subjectId ||
            !topicId
        ) {

            alert(
                "Select Subject and Topic."
            );


            return;

        }


        if (
            attempted <= 0
        ) {

            alert(
                "Attempted questions must be greater than 0."
            );


            return;

        }


        if (
            correct +
            wrong +
            skipped
            !==
            attempted
        ) {

            alert(

                "Correct + Wrong + Skipped must equal Attempted."

            );


            return;

        }


        const accuracy =
            (
                correct /
                attempted
            ) *
            100;


        const saveButton =
            event.currentTarget
                .querySelector(
                    "button[type='submit']"
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
                .from(
                    "pyq_sessions"
                )
                .insert({

                    user_id:
                        pyqUserId,

                    subject_id:
                        subjectId,

                    topic_id:
                        topicId,

                    practice_date:
                        P(
                            "pyqDate"
                        ).value,

                    source:
                        P(
                            "pyqSource"
                        ).value,

                    attempted:
                        attempted,

                    correct:
                        correct,

                    wrong:
                        wrong,

                    skipped:
                        skipped,

                    accuracy:
                        Number(
                            accuracy.toFixed(
                                2
                            )
                        ),

                    notes:
                        P(
                            "pyqNotes"
                        )
                            .value
                            .trim()
                        ||
                        null

                });


            if (
                error
            ) {

                throw error;

            }


            // =========================================
            // UPDATE TOPIC STRENGTH
            // =========================================

            await updateTopicFromPyq(
                topicId
            );


            // =========================================
            // RESET ONLY SCORE FIELDS
            // KEEP SUBJECT + TOPIC FOR FAST ENTRY
            // =========================================

            P(
                "pyqCorrect"
            ).value =
                0;


            P(
                "pyqWrong"
            ).value =
                0;


            P(
                "pyqSkipped"
            ).value =
                0;


            P(
                "pyqNotes"
            ).value =
                "";


            updatePyqPreview();


            await loadPyqHistory();

        }

        catch (
            error
        ) {

            console.error(
                "Could not save PYQ session:",
                error
            );


            alert(
                "Could not save PYQ result."
            );

        }

        finally {

            saveButton.disabled =
                false;


            saveButton.textContent =
                "+ Save PYQ Result";

        }

    }
);


// =====================================================
// DELETE
// =====================================================

window.deletePyqSession =
async function (
    id,
    topicId
) {

    if (
        !confirm(
            "Delete this PYQ result?"
        )
    ) {

        return;

    }


    const {
        error
    } =
    await supabaseClient
        .from(
            "pyq_sessions"
        )
        .delete()
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            pyqUserId
        );


    if (
        error
    ) {

        console.error(
            error
        );


        alert(
            "Could not delete PYQ result."
        );


        return;

    }


    if (
        topicId
    ) {

        await updateTopicFromPyq(
            topicId
        );

    }


    await loadPyqHistory();

};


// =====================================================
// EVENTS
// =====================================================

P(
    "pyqSubject"
).addEventListener(
    "change",
    populatePyqTopics
);


[
    "pyqAttempted",
    "pyqCorrect",
    "pyqWrong",
    "pyqSkipped"
]
.forEach(
    id => {

        P(
            id
        ).addEventListener(
            "input",
            updatePyqPreview
        );

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


    pyqUserId =
        session.user.id;


    pyqSubjects =
        await phSubjects(
            pyqUserId
        );


    await loadAllPyqTopics();


    // =============================================
    // SUBJECTS
    // =============================================

    P(
        "pyqSubject"
    ).innerHTML =
        pyqSubjects.length
            ?
            pyqSubjects
                .map(
                    subject =>
                        `

                        <option
                            value="${subject.id}"
                        >

                            ${phEscape(
                                subject.name
                            )}

                        </option>

                        `
                )
                .join("")
            :
            `

            <option value="">
                No subjects found
            </option>

            `;


    populatePyqTopics();


    // =============================================
    // DATE
    // =============================================

    P(
        "pyqDate"
    ).value =
        pyqToday();


    updatePyqPreview();


    await loadPyqHistory();


    console.log(
        "PYQ Tracker ready ✅"
    );

})();