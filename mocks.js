// =====================================================
// PRODUCTIVE HORIZON
// MOCK PERFORMANCE INTELLIGENCE
// =====================================================

let mockUserId =
    null;


let mockRows =
    [];


let mockChart =
    null;


const M =
    id =>
        document.getElementById(
            id
        );


// =====================================================
// NUMBER
// =====================================================

function num(
    id
) {

    return Number(
        M(id).value ||
        0
    );

}


// =====================================================
// OPTIONAL NUMBER
// =====================================================

function optionalNumber(
    id
) {

    const value =
        M(id).value;


    return value === ""
        ?
        null
        :
        Number(value);

}


// =====================================================
// DATE
// =====================================================

function mockToday() {

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


// =====================================================
// AVERAGE
// =====================================================

function average(
    values
) {

    if (
        !values.length
    ) {

        return 0;

    }


    return (

        values.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(
                    value ||
                    0
                ),
            0
        )

        /

        values.length

    );

}


// =====================================================
// PREPARATION STATUS
// =====================================================

function getTargetStatus(
    score,
    target
) {

    const gap =
        target -
        score;


    if (
        score >
        target + 5
    ) {

        return {
            label:
                "🔥 Above Target",

            detail:
                `You are ${Math.abs(
                    gap
                ).toFixed(1)} marks above your target.`
        };

    }


    if (
        Math.abs(
            gap
        ) <=
        5
    ) {

        return {
            label:
                "🟢 Target Zone",

            detail:
                "Your current performance is around your target score."
        };

    }


    if (
        gap <=
        14
    ) {

        return {
            label:
                "🟡 Getting Closer",

            detail:
                `${gap.toFixed(
                    1
                )} marks still needed to reach your target.`
        };

    }


    if (
        gap <=
        25
    ) {

        return {
            label:
                "🟠 Needs Improvement",

            detail:
                `${gap.toFixed(
                    1
                )} marks below target. Focus on weak sections and avoidable errors.`
        };

    }


    return {
        label:
            "🔴 Far From Target",

        detail:
            `${gap.toFixed(
                1
            )} marks below target. Significant improvement is still required.`
    };

}


// =====================================================
// LOAD MOCKS
// =====================================================

async function loadMocks() {

    const {
        data,
        error
    } =
    await supabaseClient
        .from(
            "mock_results"
        )
        .select(
            "*"
        )
        .eq(
            "user_id",
            mockUserId
        )
        .order(
            "mock_date",
            {
                ascending:
                    true
            }
        )
        .order(
            "created_at",
            {
                ascending:
                    true
            }
        );


    if (
        error
    ) {

        console.error(
            "Could not load mock results:",
            error
        );


        return;

    }


    mockRows =
        data ||
        [];


    renderMockAnalysis();

    renderMockChart();

    renderMockHistory();

}


// =====================================================
// ANALYSIS
// =====================================================

function renderMockAnalysis() {

    if (
        !mockRows.length
    ) {

        M(
            "mockTargetCard"
        ).textContent =
            M(
                "mockTarget"
            ).value;


        return;

    }


    const latest =
        mockRows[
            mockRows.length -
            1
        ];


    const scores =
        mockRows.map(
            row =>
                Number(
                    row.score ||
                    0
                )
        );


    const last3 =
        scores.slice(
            -3
        );


    const last5 =
        scores.slice(
            -5
        );


    const target =
        Number(
            latest.target_score ||
            150
        );


    const latestScore =
        Number(
            latest.score ||
            0
        );


    const gap =
        target -
        latestScore;


    const attempted =
        mockRows.reduce(
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
        mockRows.reduce(
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


    const totalQuestions =
        mockRows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.total_questions ||
                    0
                ),
            0
        );


    const totalMinutes =
        mockRows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.time_taken_minutes ||
                    0
                ),
            0
        );


    const accuracy =
        attempted
            ?
            correct *
            100 /
            attempted
            :
            0;


    const attemptRate =
        totalQuestions
            ?
            attempted *
            100 /
            totalQuestions
            :
            0;


    const best =
        Math.max(
            ...scores
        );


    const overallAverage =
        average(
            scores
        );


    const last3Average =
        average(
            last3
        );


    const last5Average =
        average(
            last5
        );


    let improvement =
        0;


    if (
        scores.length >
        1
    ) {

        improvement =
            scores[
                scores.length -
                1
            ]
            -
            scores[0];

    }


    const marksMinute =
        totalMinutes
            ?
            scores.reduce(
                (
                    a,
                    b
                ) =>
                    a + b,
                0
            )
            /
            totalMinutes
            :
            0;


    const secondsQuestion =
        attempted
            ?
            totalMinutes *
            60 /
            attempted
            :
            0;


    M(
        "mockTargetCard"
    ).textContent =
        target.toFixed(
            1
        );


    M(
        "mockLatestCard"
    ).textContent =
        latestScore.toFixed(
            1
        );


    M(
        "mockAverageCard"
    ).textContent =
        last5Average.toFixed(
            1
        );


    M(
        "mockGapCard"
    ).textContent =
        gap > 0
            ?
            `-${gap.toFixed(
                1
            )}`
            :
            `+${Math.abs(
                gap
            ).toFixed(
                1
            )}`;


    M(
        "mockAccuracy"
    ).textContent =
        `${accuracy.toFixed(
            1
        )}%`;


    M(
        "mockAttemptRate"
    ).textContent =
        `${attemptRate.toFixed(
            1
        )}%`;


    M(
        "mockBest"
    ).textContent =
        best.toFixed(
            1
        );


    M(
        "mockOverallAverage"
    ).textContent =
        overallAverage.toFixed(
            1
        );


    M(
        "mockLast3"
    ).textContent =
        last3Average.toFixed(
            1
        );


    M(
        "mockImprovement"
    ).textContent =
        improvement >= 0
            ?
            `+${improvement.toFixed(
                1
            )}`
            :
            improvement.toFixed(
                1
            );


    M(
        "mockMarksMinute"
    ).textContent =
        marksMinute.toFixed(
            2
        );


    M(
        "mockSecondsQuestion"
    ).textContent =
        `${secondsQuestion.toFixed(
            1
        )}s`;


    const verdict =
        getTargetStatus(
            last5Average,
            target
        );


    M(
        "mockVerdict"
    ).textContent =
        verdict.label;


    M(
        "mockVerdictDetail"
    ).textContent =
        (
            `${verdict.detail} ` +
            `Latest: ${latestScore.toFixed(
                1
            )}, ` +
            `Last-5 average: ${last5Average.toFixed(
                1
            )}, ` +
            `Best: ${best.toFixed(
                1
            )}.`
        );

}


// =====================================================
// BAR CHART
// =====================================================

function renderMockChart() {

    const canvas =
        M(
            "mockTrendChart"
        );


    if (
        !canvas
    ) {

        return;

    }


    if (
        mockChart
    ) {

        mockChart.destroy();

    }


    const labels =
        mockRows.map(
            (
                row,
                index
            ) =>
                row.mock_name ||
                `Mock ${index + 1}`
        );


    const scores =
        mockRows.map(
            row =>
                Number(
                    row.score ||
                    0
                )
        );


    const targets =
        mockRows.map(
            row =>
                Number(
                    row.target_score ||
                    150
                )
        );


    mockChart =
        new Chart(
            canvas,
            {

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            type:
                                "bar",

                            label:
                                "Mock Score",

                            data:
                                scores,

                            borderWidth:
                                1,

                            borderRadius:
                                7,

                            borderSkipped:
                                false,

                            barPercentage:
                                0.68,

                            categoryPercentage:
                                0.72

                        },


                        {

                            type:
                                "line",

                            label:
                                "Target",

                            data:
                                targets,

                            pointRadius:
                                0,

                            tension:
                                0,

                            borderWidth:
                                2,

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
                                true

                        }

                    }

                }

            }
        );

}


// =====================================================
// HISTORY
// =====================================================

function renderMockHistory() {

    if (
        !mockRows.length
    ) {

        M(
            "mockHistory"
        ).innerHTML =
            `

            <div class="empty-mini">

                No mocks logged yet.

            </div>

            `;


        return;

    }


    M(
        "mockHistory"
    ).innerHTML =
        [
            ...mockRows
        ]
        .reverse()
        .map(
            row => {

                const attempted =
                    Number(
                        row.attempted ||
                        0
                    );


                const correct =
                    Number(
                        row.correct ||
                        0
                    );


                const accuracy =
                    attempted
                        ?
                        correct *
                        100 /
                        attempted
                        :
                        0;


                return `

                <div class="module-row">


                    <div class="module-row-main">

                        <strong>

                            ${
                                phEscape(
                                    row.mock_name
                                )
                            }

                            •

                            ${row.score}
                            /
                            ${row.maximum_marks}

                        </strong>


                        <span>

                            ${row.mock_date}

                            •

                            ${
                                phEscape(
                                    row.source ||
                                    "Testbook"
                                )
                            }

                            •

                            ${
                                phEscape(
                                    row.difficulty ||
                                    "Moderate"
                                )
                            }

                        </span>


                        <div class="mock-history-details">


                            <span class="mock-chip">

                                🎯 Target:
                                ${row.target_score}

                            </span>


                            <span class="mock-chip">

                                ✅ Correct:
                                ${row.correct}

                            </span>


                            <span class="mock-chip">

                                ❌ Wrong:
                                ${row.wrong}

                            </span>


                            <span class="mock-chip">

                                Accuracy:
                                ${accuracy.toFixed(
                                    1
                                )}%

                            </span>


                            <span class="mock-chip">

                                ⏱️
                                ${row.time_taken_minutes}
                                min

                            </span>


                            ${
                                row.percentile != null
                                    ?
                                    `

                                    <span class="mock-chip">

                                        Percentile:
                                        ${row.percentile}

                                    </span>

                                    `
                                    :
                                    ""
                            }

                        </div>

                    </div>


                    <button

                        type="button"

                        class="
                            module-btn
                            danger
                        "

                        onclick="
                            deleteMock(
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
        .join("");

}


// =====================================================
// SAVE
// =====================================================

M(
    "mockForm"
)
.addEventListener(
    "submit",
    async function (
        event
    ) {

        event.preventDefault();


        const totalQuestions =
            num(
                "mockTotalQuestions"
            );


        const attempted =
            num(
                "mockAttempted"
            );


        const correct =
            num(
                "mockCorrect"
            );


        const wrong =
            num(
                "mockWrong"
            );


        if (
            attempted >
            totalQuestions
        ) {

            alert(
                "Attempted cannot exceed Total Questions."
            );

            return;

        }


        if (
            correct +
            wrong
            >
            attempted
        ) {

            alert(
                "Correct + Wrong cannot exceed Attempted."
            );

            return;

        }


        const unattempted =
            Math.max(
                0,
                totalQuestions -
                attempted
            );


        const button =
            event.currentTarget
                .querySelector(
                    "button[type='submit']"
                );


        button.disabled =
            true;


        button.textContent =
            "Saving...";


        try {

            const {
                error
            } =
            await supabaseClient
                .from(
                    "mock_results"
                )
                .insert({

                    user_id:
                        mockUserId,

                    mock_date:
                        M(
                            "mockDate"
                        ).value,

                    mock_name:
                        M(
                            "mockName"
                        )
                            .value
                            .trim(),

                    source:
                        M(
                            "mockSource"
                        )
                            .value
                            .trim()
                        ||
                        "Testbook",

                    mock_type:
                        M(
                            "mockType"
                        ).value,

                    difficulty:
                        M(
                            "mockDifficulty"
                        ).value,

                    maximum_marks:
                        num(
                            "mockMaximum"
                        ),

                    target_score:
                        num(
                            "mockTarget"
                        ),

                    score:
                        num(
                            "mockScore"
                        ),

                    total_questions:
                        totalQuestions,

                    attempted:
                        attempted,

                    correct:
                        correct,

                    wrong:
                        wrong,

                    unattempted:
                        unattempted,

                    time_taken_minutes:
                        num(
                            "mockTime"
                        ),

                    rank:
                        optionalNumber(
                            "mockRank"
                        ),

                    percentile:
                        optionalNumber(
                            "mockPercentile"
                        ),

                    average_score:
                        optionalNumber(
                            "mockPlatformAverage"
                        ),

                    topper_score:
                        optionalNumber(
                            "mockTopper"
                        ),

                    gs_score:
                        num(
                            "mockGS"
                        ),

                    reasoning_score:
                        num(
                            "mockReasoning"
                        ),

                    maths_score:
                        num(
                            "mockMaths"
                        ),

                    english_score:
                        num(
                            "mockEnglish"
                        ),

                    hindi_score:
                        num(
                            "mockHindi"
                        ),

                    computer_science_score:
                        num(
                            "mockCS"
                        ),

                    silly_mistakes:
                        num(
                            "mockSilly"
                        ),

                    concept_errors:
                        num(
                            "mockConcept"
                        ),

                    calculation_errors:
                        num(
                            "mockCalculation"
                        ),

                    question_misread:
                        num(
                            "mockMisread"
                        ),

                    guessing_errors:
                        num(
                            "mockGuess"
                        ),

                    time_pressure_errors:
                        num(
                            "mockPressure"
                        ),

                    unknown_concepts:
                        num(
                            "mockUnknown"
                        ),

                    focus_score:
                        num(
                            "mockFocus"
                        ),

                    confidence_score:
                        num(
                            "mockConfidence"
                        ),

                    time_management_score:
                        num(
                            "mockTimeManagement"
                        ),

                    satisfaction_score:
                        num(
                            "mockSatisfaction"
                        ),

                    strong_areas:
                        M(
                            "mockStrongAreas"
                        )
                            .value
                            .trim()
                        ||
                        null,

                    weak_areas:
                        M(
                            "mockWeakAreas"
                        )
                            .value
                            .trim()
                        ||
                        null,

                    revise_topics:
                        M(
                            "mockRevise"
                        )
                            .value
                            .trim()
                        ||
                        null,

                    practice_topics:
                        M(
                            "mockPractice"
                        )
                            .value
                            .trim()
                        ||
                        null,

                    lessons_learned:
                        M(
                            "mockLessons"
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


            await loadMocks();


            alert(
                "Mock performance saved ✅"
            );


            /*
                Keep target/default settings.
                Clear mock-specific text.
            */

            M(
                "mockName"
            ).value =
                "";


            M(
                "mockStrongAreas"
            ).value =
                "";


            M(
                "mockWeakAreas"
            ).value =
                "";


            M(
                "mockRevise"
            ).value =
                "";


            M(
                "mockPractice"
            ).value =
                "";


            M(
                "mockLessons"
            ).value =
                "";

        }

        catch (
            error
        ) {

            console.error(
                "Could not save mock:",
                error
            );


            alert(
                "Could not save mock performance."
            );

        }

        finally {

            button.disabled =
                false;


            button.textContent =
                "💾 Save Mock Performance";

        }

    }
);


// =====================================================
// DELETE
// =====================================================

window.deleteMock =
async function (
    id
) {

    if (
        !confirm(
            "Delete this mock record?"
        )
    ) {

        return;

    }


    const {
        error
    } =
    await supabaseClient
        .from(
            "mock_results"
        )
        .delete()
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            mockUserId
        );


    if (
        error
    ) {

        console.error(
            error
        );

        return;

    }


    await loadMocks();

};


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


    mockUserId =
        session.user.id;


    M(
        "mockDate"
    ).value =
        mockToday();


    await loadMocks();


    /*
        Preserve most recent target
        automatically.
    */

    if (
        mockRows.length
    ) {

        const latest =
            mockRows[
                mockRows.length -
                1
            ];


        M(
            "mockTarget"
        ).value =
            latest.target_score ||
            150;


        M(
            "mockMaximum"
        ).value =
            latest.maximum_marks ||
            200;

    }


    console.log(
        "Mock Performance Intelligence ready ✅"
    );

})();