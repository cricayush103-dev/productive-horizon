let ru =
    null;

let rs =
    [];

let rt =
    [];

let revisionRows =
    [];


const R =
    id =>
        document.getElementById(
            id
        );


const STAGE_DELAYS =
    {
        1: 1,
        2: 3,
        3: 7,
        4: 15,
        5: 30
    };


function addDays(
    dateString,
    days
) {

    const [
        year,
        month,
        day
    ] =
    dateString
        .split("-")
        .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day,
            12
        );


    date.setDate(
        date.getDate() +
        days
    );


    return phLocalDate(
        date
    );

}


function topicName(
    id
) {

    return (
        rt.find(
            topic =>
                topic.id ===
                id
        )
        ?.name
        ||
        "Topic"
    );

}


function subjectName(
    id
) {

    return (
        rs.find(
            subject =>
                subject.id ===
                id
        )
        ?.name
        ||
        "Subject"
    );

}


function populateTopics() {

    const subjectId =
        R(
            "revisionSubject"
        )
            .value;


    const rows =
        rt.filter(
            topic =>
                topic.subject_id ===
                subjectId
        );


    R(
        "revisionTopic"
    ).innerHTML =
        rows.length
            ?
            rows.map(
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
                No topics available
            </option>
            `;

}


async function loadRevisions() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "revisions"
        )
        .select(
            "*"
        )
        .eq(
            "user_id",
            ru
        )
        .order(
            "scheduled_date"
        )
        .order(
            "revision_stage"
        );


    if (error) {

        console.error(
            error
        );

        return;

    }


    revisionRows =
        data ||
        [];


    const today =
        phLocalDate();


    R(
        "rToday"
    ).textContent =
        revisionRows.filter(
            row =>
                !row.completed &&
                row.scheduled_date ===
                today
        ).length;


    R(
        "rOverdue"
    ).textContent =
        revisionRows.filter(
            row =>
                !row.completed &&
                row.scheduled_date <
                today
        ).length;


    R(
        "rUpcoming"
    ).textContent =
        revisionRows.filter(
            row =>
                !row.completed &&
                row.scheduled_date >
                today
        ).length;


    R(
        "rCompleted"
    ).textContent =
        revisionRows.filter(
            row =>
                row.completed
        ).length;


    R(
        "revisionList"
    ).innerHTML =
        revisionRows.length
            ?
            revisionRows
                .map(
                    row => {

                        const label =
                            row.completed
                                ?
                                "Completed"
                                :
                                row.scheduled_date <
                                today
                                    ?
                                    "Overdue"
                                    :
                                    row.scheduled_date ===
                                    today
                                        ?
                                        "Due Today"
                                        :
                                        "Upcoming";


                        const cssClass =
                            row.completed
                                ?
                                "done"
                                :
                                (
                                    !row.completed &&
                                    row.scheduled_date <
                                    today
                                )
                                    ?
                                    "overdue"
                                    :
                                    "";


                        const topic =
                            row.topic_id
                                ?
                                topicName(
                                    row.topic_id
                                )
                                :
                                "General subject revision";


                        return `
                        <div
                            class="
                                module-row
                                ${
                                    row.completed
                                        ?
                                        "revision-complete"
                                        :
                                        ""
                                }
                            "
                        >

                            <input
                                type="checkbox"

                                ${
                                    row.completed
                                        ?
                                        "checked"
                                        :
                                        ""
                                }

                                onchange="
                                    toggleRevision(
                                        '${row.id}',
                                        this.checked
                                    )
                                "
                            >


                            <div class="module-row-main">

                                <strong>
                                    ${
                                        phEscape(
                                            subjectName(
                                                row.subject_id
                                            )
                                        )
                                    }
                                    •
                                    ${
                                        phEscape(
                                            topic
                                        )
                                    }
                                    • Revision
                                    ${
                                        row.revision_stage ||
                                        row.revision_number ||
                                        1
                                    }
                                </strong>


                                <span>
                                    ${row.scheduled_date}

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


                            <span
                                class="
                                    status-pill
                                    ${cssClass}
                                "
                            >
                                ${label}
                            </span>


                            <button
                                class="
                                    module-btn
                                    danger
                                "
                                onclick="
                                    deleteRevision(
                                        '${row.id}'
                                    )
                                "
                            >
                                🗑️
                            </button>

                        </div>
                        `;

                    }
                )
                .join("")
            :
            `
            <div class="empty-mini">
                No revisions scheduled.
            </div>
            `;

}


R(
    "revisionSubject"
).addEventListener(
    "change",
    populateTopics
);


// =====================================================
// ADD REVISION
// =====================================================

R(
    "revisionForm"
).onsubmit =
async function (
    event
) {

    event.preventDefault();


    const stage =
        Number(
            R(
                "revisionStage"
            ).value ||
            1
        );


    const topicId =
        R(
            "revisionTopic"
        ).value;


    if (!topicId) {

        alert(
            "Select a topic."
        );

        return;

    }


    const scheduledDate =
        R(
            "revisionDate"
        ).value;


    const {
        error
    } =
    await supabaseClient
        .from(
            "revisions"
        )
        .insert({

            user_id:
                ru,

            subject_id:
                R(
                    "revisionSubject"
                ).value,

            topic_id:
                topicId,

            revision_number:
                stage,

            revision_stage:
                stage,

            scheduled_date:
                scheduledDate,

            completed:
                false,

            notes:
                R(
                    "revisionNotes"
                )
                    .value
                    .trim()
                ||
                null

        });


    if (error) {

        console.error(
            error
        );


        alert(
            "Could not add revision."
        );

        return;

    }


    await supabaseClient
        .from(
            "topics"
        )
        .update({

            next_revision_at:
                scheduledDate

        })
        .eq(
            "id",
            topicId
        )
        .eq(
            "user_id",
            ru
        );


    event.target.reset();


    R(
        "revisionDate"
    ).value =
        phLocalDate();


    R(
        "revisionStage"
    ).value =
        "1";


    populateTopics();


    await loadRevisions();

};


// =====================================================
// COMPLETE REVISION
// =====================================================

window.toggleRevision =
async function (
    id,
    done
) {

    const row =
        revisionRows.find(
            item =>
                item.id ===
                id
        );


    if (!row) {
        return;
    }


    const now =
        new Date()
            .toISOString();


    const {
        error
    } =
    await supabaseClient
        .from(
            "revisions"
        )
        .update({

            completed:
                done,

            completed_at:
                done
                    ?
                    now
                    :
                    null

        })
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            ru
        );


    if (error) {

        console.error(
            error
        );


        alert(
            "Could not update revision."
        );

        return;

    }


    if (
        done &&
        row.topic_id
    ) {

        const stage =
            Number(
                row.revision_stage ||
                row.revision_number ||
                1
            );


        const {
            data:
                topic,

            error:
                topicError
        } =
        await supabaseClient
            .from(
                "topics"
            )
            .select(
                "revision_count,strength_score"
            )
            .eq(
                "id",
                row.topic_id
            )
            .eq(
                "user_id",
                ru
            )
            .single();


        if (!topicError) {

            const revisionCount =
                Math.max(

                    Number(
                        topic
                            ?.revision_count ||
                        0
                    ),

                    stage

                );


            const strengthScore =
                Math.min(

                    100,

                    Number(
                        topic
                            ?.strength_score ||
                        50
                    )
                    +
                    10

                );


            const strength =
                strengthScore >= 80
                    ?
                    "Strong"
                    :
                    strengthScore >= 60
                        ?
                        "Medium"
                        :
                        strengthScore >= 40
                            ?
                            "Weak"
                            :
                            "Critical";


            let nextDate =
                null;


            if (
                stage <
                5
            ) {

                const nextStage =
                    stage +
                    1;


                nextDate =
                    addDays(

                        phLocalDate(),

                        STAGE_DELAYS[
                            nextStage
                        ]

                    );


                const {
                    data:
                        existing
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
                        ru
                    )
                    .eq(
                        "topic_id",
                        row.topic_id
                    )
                    .eq(
                        "revision_stage",
                        nextStage
                    )
                    .eq(
                        "completed",
                        false
                    )
                    .limit(
                        1
                    );


                if (
                    !existing?.length
                ) {

                    await supabaseClient
                        .from(
                            "revisions"
                        )
                        .insert({

                            user_id:
                                ru,

                            subject_id:
                                row.subject_id,

                            topic_id:
                                row.topic_id,

                            revision_number:
                                nextStage,

                            revision_stage:
                                nextStage,

                            scheduled_date:
                                nextDate,

                            completed:
                                false,

                            notes:
                                "Auto-scheduled next revision"

                        });

                }

            }


            await supabaseClient
                .from(
                    "topics"
                )
                .update({

                    last_revised_at:
                        now,

                    next_revision_at:
                        nextDate,

                    revision_count:
                        revisionCount,

                    strength_score:
                        strengthScore,

                    strength:
                        strength

                })
                .eq(
                    "id",
                    row.topic_id
                )
                .eq(
                    "user_id",
                    ru
                );

        }

    }


    await loadRevisions();

};


// =====================================================
// DELETE
// =====================================================

window.deleteRevision =
async function (
    id
) {

    if (
        !confirm(
            "Delete this revision?"
        )
    ) {

        return;

    }


    await supabaseClient
        .from(
            "revisions"
        )
        .delete()
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            ru
        );


    await loadRevisions();

};


// =====================================================
// START
// =====================================================

(async function () {

    const session =
        await phSession();


    if (!session) {
        return;
    }


    ru =
        session.user.id;


    rs =
        await phSubjects(
            ru
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
            ru
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


    rt =
        data ||
        [];


    R(
        "revisionSubject"
    ).innerHTML =
        rs.map(
            subject =>
                `
                <option value="${subject.id}">
                    ${phEscape(subject.name)}
                </option>
                `
        )
        .join("");


    populateTopics();


    R(
        "revisionDate"
    ).value =
        phLocalDate();


    await loadRevisions();

})();