// =====================================================
// PRODUCTIVE HORIZON - WEAK TOPICS
// Subject -> Topic linked weak-area tracking
// =====================================================

let wu = null;
let ws = [];
let wt = [];

const W = id => document.getElementById(id);


// =====================================================
// LOAD TOPICS FOR SELECTED SUBJECT
// =====================================================

async function loadTopicsForSubject(subjectId) {

    const topicSelect = W("mistakeTopic");

    if (!topicSelect) return;

    topicSelect.innerHTML =
        `<option value="">Loading topics...</option>`;

    topicSelect.disabled = true;

    if (!subjectId) {

        topicSelect.innerHTML =
            `<option value="">Select subject first</option>`;

        return;
    }

    try {

        const { data, error } = await supabaseClient
            .from("topics")
            .select("id,name,subject_id")
            .eq("user_id", wu)
            .eq("subject_id", subjectId)
            .order("position", { ascending: true });

        if (error) throw error;

        wt = data || [];

        if (!wt.length) {

            topicSelect.innerHTML =
                `<option value="">No topics found</option>`;

            topicSelect.disabled = true;

            return;
        }

        topicSelect.innerHTML =
            `<option value="">Select Topic</option>` +
            wt.map(topic => `
                <option value="${topic.id}">
                    ${phEscape(topic.name)}
                </option>
            `).join("");

        topicSelect.disabled = false;

    }

    catch (error) {

        console.error(
            "Could not load topics:",
            error
        );

        topicSelect.innerHTML =
            `<option value="">Could not load topics</option>`;

        topicSelect.disabled = true;
    }
}


// =====================================================
// LOAD WEAK TOPICS
// =====================================================

async function loadMistakes() {

    const { data, error } = await supabaseClient
        .from("mistakes")
        .select("*")
        .eq("user_id", wu)
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(error);
        return;
    }

    const rows = data || [];

    const resolved =
        rows.filter(x => x.resolved).length;


    // ===============================================
    // STATS
    // ===============================================

    W("wOpen").textContent =
        rows.length - resolved;

    W("wResolved").textContent =
        resolved;

    W("wTotal").textContent =
        rows.length;

    W("wRate").textContent =
        rows.length
            ? `${Math.round(
                resolved * 100 / rows.length
            )}%`
            : "0%";


    // ===============================================
    // EMPTY STATE
    // ===============================================

    if (!rows.length) {

        W("mistakeList").innerHTML =
            `<div class="empty-mini">
                No weak topics logged.
            </div>`;

        return;
    }


    // ===============================================
    // GET TOPIC NAMES
    // ===============================================

    const topicIds = [
        ...new Set(
            rows
                .map(x => x.topic_id)
                .filter(Boolean)
        )
    ];

    let topicMap = {};


    if (topicIds.length) {

        const { data: topics, error: topicError } =
            await supabaseClient
                .from("topics")
                .select("id,name")
                .eq("user_id", wu)
                .in("id", topicIds);

        if (topicError) {

            console.error(
                "Could not load weak-topic names:",
                topicError
            );

        }

        else {

            (topics || []).forEach(topic => {

                topicMap[topic.id] =
                    topic.name;

            });
        }
    }


    // ===============================================
    // RENDER LOG
    // ===============================================

    W("mistakeList").innerHTML =
        rows.map(x => {

            const subjectName =
                ws.find(
                    subject =>
                        subject.id === x.subject_id
                )?.name || "Subject";

            const topicName =
                x.topic_id
                    ? (
                        topicMap[x.topic_id] ||
                        "Topic"
                    )
                    : null;

            return `

                <div class="module-row">

                    <input
                        type="checkbox"
                        ${x.resolved ? "checked" : ""}
                        onchange="
                            resolveMistake(
                                '${x.id}',
                                this.checked
                            )
                        "
                    >

                    <div class="module-row-main">

                        <strong>
                            ${phEscape(x.title)}
                        </strong>

                        <span>

                            ${phEscape(subjectName)}

                            ${
                                topicName
                                    ? ` • ${phEscape(topicName)}`
                                    : ""
                            }

                            • ${phEscape(
                                x.status || "Weak"
                            )}

                            ${
                                x.source
                                    ? ` • ${phEscape(x.source)}`
                                    : ""
                            }

                            ${
                                x.description
                                    ? `<br>${phEscape(
                                        x.description
                                    )}`
                                    : ""
                            }

                        </span>

                    </div>


                    <span
                        class="
                            status-pill
                            ${x.resolved ? "done" : ""}
                        "
                    >

                        ${
                            x.resolved
                                ? "Resolved"
                                : "Open"
                        }

                    </span>


                    <button
                        class="module-btn danger"
                        onclick="
                            deleteMistake('${x.id}')
                        "
                    >
                        🗑️
                    </button>

                </div>

            `;

        }).join("");
}


// =====================================================
// SUBJECT CHANGE -> LOAD ITS TOPICS
// =====================================================

W("mistakeSubject").addEventListener(
    "change",
    async function () {

        await loadTopicsForSubject(
            this.value
        );

    }
);


// =====================================================
// ADD WEAK TOPIC
// =====================================================

W("mistakeForm").onsubmit =
async event => {

    event.preventDefault();


    const subjectId =
        W("mistakeSubject").value;

    const topicId =
        W("mistakeTopic").value;


    if (!subjectId) {

        alert(
            "Please select a subject."
        );

        return;
    }


    if (!topicId) {

        alert(
            "Please select a topic."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("mistakes")
            .insert({

                user_id:
                    wu,

                subject_id:
                    subjectId,

                topic_id:
                    topicId,

                title:
                    W("mistakeTitle")
                        .value
                        .trim(),

                description:
                    W("mistakeDescription")
                        .value
                        .trim() || null,

                source:
                    W("mistakeSource")
                        .value
                        .trim() || null,

                status:
                    W("mistakeStatus")
                        .value,

                resolved:
                    false
            });


    if (error) {

        console.error(
            "Could not add weak topic:",
            error
        );

        alert(
            "Could not add weak topic."
        );

        return;
    }


    // ===============================================
    // RESET TEXT FIELDS
    // ===============================================

    W("mistakeTitle").value =
        "";

    W("mistakeSource").value =
        "";

    W("mistakeDescription").value =
        "";

    W("mistakeStatus").value =
        "Weak";


    /*
        Keep current subject selected.

        This is faster when adding several weak
        topics from the same subject.
    */

    await loadTopicsForSubject(
        subjectId
    );


    await loadMistakes();
};


// =====================================================
// RESOLVE / REOPEN
// =====================================================

window.resolveMistake =
async (
    id,
    done
) => {

    const { error } =
        await supabaseClient
            .from("mistakes")
            .update({

                resolved:
                    done,

                resolved_at:
                    done
                        ? new Date().toISOString()
                        : null

            })
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                wu
            );


    if (error) {

        console.error(
            "Could not update weak topic:",
            error
        );

        alert(
            "Could not update weak topic."
        );

        return;
    }


    await loadMistakes();
};


// =====================================================
// DELETE
// =====================================================

window.deleteMistake =
async id => {

    if (
        !confirm(
            "Delete this weak topic?"
        )
    ) {

        return;
    }


    const { error } =
        await supabaseClient
            .from("mistakes")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                wu
            );


    if (error) {

        console.error(
            "Could not delete weak topic:",
            error
        );

        alert(
            "Could not delete weak topic."
        );

        return;
    }


    await loadMistakes();
};


// =====================================================
// INITIALIZE
// =====================================================

(async () => {

    const session =
        await phSession();


    if (!session) return;


    wu =
        session.user.id;


    // ===============================================
    // LOAD SUBJECTS
    // ===============================================

    ws =
        await phSubjects(wu);


    const subjectSelect =
        W("mistakeSubject");


    if (!ws.length) {

        subjectSelect.innerHTML =
            `<option value="">
                No subjects found
            </option>`;

        W("mistakeTopic").innerHTML =
            `<option value="">
                No topics available
            </option>`;

        return;
    }


    subjectSelect.innerHTML =

        `<option value="">
            Select Subject
        </option>`

        +

        ws.map(subject => `

            <option value="${subject.id}">
                ${phEscape(subject.name)}
            </option>

        `).join("");


    // ===============================================
    // INITIAL TOPIC STATE
    // ===============================================

    W("mistakeTopic").innerHTML =
        `<option value="">
            Select subject first
        </option>`;


    W("mistakeTopic").disabled =
        true;


    // ===============================================
    // LOAD EXISTING WEAK TOPICS
    // ===============================================

    await loadMistakes();


    console.log(
        "Weak Topics ready ✅"
    );

})();