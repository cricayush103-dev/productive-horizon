// =====================================================
// PRODUCTIVE HORIZON
// MISTAKE NOTEBOOK
// =====================================================

let mnUserId = null;

let mnSubjects = [];

let mnTopics = [];

let mnRows = [];


const MN =
    id =>
        document.getElementById(
            id
        );


// =====================================================
// DATE
// =====================================================

function mnToday() {

    if (
        typeof phLocalDate ===
        "function"
    ) {

        return phLocalDate();

    }

    const d =
        new Date();

    return (
        d.getFullYear()
        +
        "-"
        +
        String(
            d.getMonth() + 1
        ).padStart(
            2,
            "0"
        )
        +
        "-"
        +
        String(
            d.getDate()
        ).padStart(
            2,
            "0"
        )
    );

}


function mnAddDays(
    days
) {

    const d =
        new Date();

    d.setDate(
        d.getDate() +
        days
    );

    return phLocalDate(
        d
    );

}


// =====================================================
// SUBJECT / TOPIC NAMES
// =====================================================

function mnSubjectName(
    id
) {

    return (
        mnSubjects.find(
            item =>
                item.id ===
                id
        )
        ?.name
        ||
        "Subject"
    );

}


function mnTopicName(
    id
) {

    return (
        mnTopics.find(
            item =>
                item.id ===
                id
        )
        ?.name
        ||
        "Topic"
    );

}


// =====================================================
// TOPIC DROPDOWN
// =====================================================

function populateMnTopics() {

    const subjectId =
        MN(
            "mnSubject"
        ).value;


    const topics =
        mnTopics.filter(
            item =>
                item.subject_id ===
                subjectId
        );


    MN(
        "mnTopic"
    ).innerHTML =
        topics.length
            ?
            topics.map(
                topic =>
                    `
                    <option value="${topic.id}">
                        ${phEscape(topic.name)}
                    </option>
                    `
            )
            .join("")
            :
            `
            <option value="">
                No topics found
            </option>
            `;


    MN(
        "mnTopic"
    ).disabled =
        topics.length ===
        0;

}


// =====================================================
// LOAD MISTAKES
// =====================================================

async function loadMistakeNotebook() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "mistakes"
        )
        .select(
            "*"
        )
        .eq(
            "user_id",
            mnUserId
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
            error
        );

        return;

    }


    mnRows =
        data ||
        [];


    renderMistakeStats();

    renderMistakeRows();

}


// =====================================================
// STATS
// =====================================================

function renderMistakeStats() {

    const resolved =
        mnRows.filter(
            row =>
                row.resolved
        ).length;


    const reviewed =
        mnRows.filter(
            row =>
                Number(
                    row.times_reviewed ||
                    0
                ) > 0
        ).length;


    MN(
        "mnOpen"
    ).textContent =
        mnRows.length -
        resolved;


    MN(
        "mnReviewed"
    ).textContent =
        reviewed;


    MN(
        "mnTotal"
    ).textContent =
        mnRows.length;


    MN(
        "mnResolved"
    ).textContent =
        resolved;

}


// =====================================================
// RENDER
// =====================================================

function renderMistakeRows() {

    if (
        !mnRows.length
    ) {

        MN(
            "mnList"
        ).innerHTML =
            `
            <div class="empty-mini">
                No mistakes logged yet.
            </div>
            `;

        return;

    }


    MN(
        "mnList"
    ).innerHTML =
        mnRows.map(
            row => {

                const question =
                    row.question_text
                    ||
                    row.title
                    ||
                    "Mistake";


                return `

                <div class="module-row">

                    <input
                        type="checkbox"

                        ${
                            row.resolved
                                ?
                                "checked"
                                :
                                ""
                        }

                        onchange="
                            mnResolve(
                                '${row.id}',
                                this.checked
                            )
                        "
                    >


                    <div class="module-row-main">

                        <strong>

                            ${
                                phEscape(
                                    mnSubjectName(
                                        row.subject_id
                                    )
                                )
                            }

                            •

                            ${
                                phEscape(
                                    mnTopicName(
                                        row.topic_id
                                    )
                                )
                            }

                        </strong>


                        <span>

                            ${
                                phEscape(
                                    row.source ||
                                    "Practice"
                                )
                            }

                            •

                            ${
                                phEscape(
                                    row.error_type ||
                                    row.status ||
                                    "Mistake"
                                )
                            }

                            ${
                                row.review_date
                                    ?
                                    ` • Review: ${
                                        row.review_date
                                    }`
                                    :
                                    ""
                            }

                            • Reviewed:
                            ${
                                Number(
                                    row.times_reviewed ||
                                    0
                                )
                            }×

                        </span>


                        <div class="mistake-question">

                            ${
                                phEscape(
                                    question
                                )
                            }

                        </div>


                        <div class="mistake-details">

                            <div class="mistake-detail">

                                <strong>
                                    My Answer
                                </strong>

                                ${
                                    phEscape(
                                        row.my_answer ||
                                        "—"
                                    )
                                }

                            </div>


                            <div class="mistake-detail">

                                <strong>
                                    Correct Answer
                                </strong>

                                ${
                                    phEscape(
                                        row.correct_answer ||
                                        "—"
                                    )
                                }

                            </div>


                            <div class="mistake-detail">

                                <strong>
                                    Correct Concept
                                </strong>

                                ${
                                    phEscape(
                                        row.correct_concept ||
                                        "—"
                                    )
                                }

                            </div>


                            <div class="mistake-detail">

                                <strong>
                                    Exam Trap
                                </strong>

                                ${
                                    phEscape(
                                        row.exam_trap ||
                                        row.description ||
                                        "—"
                                    )
                                }

                            </div>

                        </div>

                    </div>


                    <div class="mistake-actions">

                        <button

                            type="button"

                            class="module-btn"

                            onclick="
                                mnReviewed(
                                    '${row.id}'
                                )
                            "

                        >
                            🔁 Reviewed
                        </button>


                        <button

                            type="button"

                            class="
                                module-btn
                                danger
                            "

                            onclick="
                                mnDelete(
                                    '${row.id}'
                                )
                            "

                        >
                            🗑️
                        </button>

                    </div>

                </div>

                `;

            }
        )
        .join("");

}


// =====================================================
// SAVE
// =====================================================

MN(
    "mistakeNotebookForm"
)
.addEventListener(
    "submit",
    async function (
        event
    ) {

        event.preventDefault();


        const subjectId =
            MN(
                "mnSubject"
            ).value;


        const topicId =
            MN(
                "mnTopic"
            ).value;


        const question =
            MN(
                "mnQuestion"
            )
                .value
                .trim();


        if (
            !subjectId ||
            !topicId ||
            !question
        ) {

            alert(
                "Subject, Topic and Question are required."
            );

            return;

        }


        const {
            error
        } =
        await supabaseClient
            .from(
                "mistakes"
            )
            .insert({

                user_id:
                    mnUserId,

                subject_id:
                    subjectId,

                topic_id:
                    topicId,

                title:
                    question
                        .slice(
                            0,
                            120
                        ),

                question_text:
                    question,

                my_answer:
                    MN(
                        "mnMyAnswer"
                    )
                        .value
                        .trim()
                    ||
                    null,

                correct_answer:
                    MN(
                        "mnCorrectAnswer"
                    )
                        .value
                        .trim()
                    ||
                    null,

                correct_concept:
                    MN(
                        "mnConcept"
                    )
                        .value
                        .trim()
                    ||
                    null,

                exam_trap:
                    MN(
                        "mnTrap"
                    )
                        .value
                        .trim()
                    ||
                    null,

                source:
                    MN(
                        "mnSource"
                    ).value,

                error_type:
                    MN(
                        "mnErrorType"
                    ).value,

                status:
                    MN(
                        "mnStatus"
                    ).value,

                review_date:
                    MN(
                        "mnReviewDate"
                    ).value
                    ||
                    null,

                times_reviewed:
                    0,

                resolved:
                    false

            });


        if (error) {

            console.error(
                error
            );


            alert(
                "Could not save mistake."
            );


            return;

        }


        // =============================================
        // MARK TOPIC WEAK
        // =============================================

        const critical =
            MN(
                "mnErrorType"
            ).value ===
            "Concept Error";


        await supabaseClient
            .from(
                "topics"
            )
            .update({

                strength:
                    critical
                        ?
                        "Critical"
                        :
                        "Weak",

                strength_score:
                    critical
                        ?
                        30
                        :
                        45

            })
            .eq(
                "id",
                topicId
            )
            .eq(
                "user_id",
                mnUserId
            );


        // =============================================
        // RESET TEXT ONLY
        // KEEP SUBJECT / TOPIC
        // =============================================

        MN(
            "mnQuestion"
        ).value =
            "";


        MN(
            "mnMyAnswer"
        ).value =
            "";


        MN(
            "mnCorrectAnswer"
        ).value =
            "";


        MN(
            "mnConcept"
        ).value =
            "";


        MN(
            "mnTrap"
        ).value =
            "";


        MN(
            "mnReviewDate"
        ).value =
            mnAddDays(
                3
            );


        await loadMistakeNotebook();

    }
);


// =====================================================
// REVIEWED
// =====================================================

window.mnReviewed =
async function (
    id
) {

    const row =
        mnRows.find(
            item =>
                item.id ===
                id
        );


    if (!row) {
        return;
    }


    const count =
        Number(
            row.times_reviewed ||
            0
        ) +
        1;


    const {
        error
    } =
    await supabaseClient
        .from(
            "mistakes"
        )
        .update({

            times_reviewed:
                count,

            review_date:
                mnAddDays(
                    count >= 3
                        ?
                        15
                        :
                        count === 2
                            ?
                            7
                            :
                            3
                )

        })
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            mnUserId
        );


    if (error) {

        console.error(
            error
        );

        return;

    }


    await loadMistakeNotebook();

};


// =====================================================
// RESOLVE
// =====================================================

window.mnResolve =
async function (
    id,
    done
) {

    const {
        error
    } =
    await supabaseClient
        .from(
            "mistakes"
        )
        .update({

            resolved:
                done,

            resolved_at:
                done
                    ?
                    new Date()
                        .toISOString()
                    :
                    null

        })
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            mnUserId
        );


    if (error) {

        console.error(
            error
        );

    }


    await loadMistakeNotebook();

};


// =====================================================
// DELETE
// =====================================================

window.mnDelete =
async function (
    id
) {

    if (
        !confirm(
            "Delete this mistake?"
        )
    ) {

        return;

    }


    const {
        error
    } =
    await supabaseClient
        .from(
            "mistakes"
        )
        .delete()
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            mnUserId
        );


    if (error) {

        console.error(
            error
        );

    }


    await loadMistakeNotebook();

};


// =====================================================
// EVENTS
// =====================================================

MN(
    "mnSubject"
).addEventListener(
    "change",
    populateMnTopics
);


// =====================================================
// START
// =====================================================

(async function () {

    const session =
        await phSession();


    if (!session) {
        return;
    }


    mnUserId =
        session.user.id;


    mnSubjects =
        await phSubjects(
            mnUserId
        );


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
            mnUserId
        )
        .order(
            "position"
        );


    if (error) {

        console.error(
            error
        );

        return;

    }


    mnTopics =
        data ||
        [];


    MN(
        "mnSubject"
    ).innerHTML =
        mnSubjects
            .map(
                subject =>
                    `
                    <option value="${subject.id}">
                        ${phEscape(subject.name)}
                    </option>
                    `
            )
            .join("");


    populateMnTopics();


    MN(
        "mnReviewDate"
    ).value =
        mnAddDays(
            3
        );


    await loadMistakeNotebook();


    console.log(
        "Mistake Notebook ready ✅"
    );

})();