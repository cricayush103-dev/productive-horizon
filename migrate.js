// =============================================
// PRODUCTIVE HORIZON
// LOCAL STORAGE -> SUPABASE MIGRATION
// =============================================

async function migrateLocalSubjectsToCloud() {

    try {

        // -----------------------------------------
        // 1. CHECK LOGIN SESSION
        // -----------------------------------------

        const {
            data: { session },
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError) {

            console.error(
                "Session error:",
                sessionError
            );

            alert(
                "Could not verify your login session."
            );

            return;
        }


        if (!session) {

            alert(
                "Please login before migrating data."
            );

            window.location.href =
                "login.html";

            return;
        }


        const userId =
            session.user.id;


        // -----------------------------------------
        // 2. GET LOCAL DATA
        // -----------------------------------------

        const savedData =
            localStorage.getItem(
                "productiveHorizonSubjects"
            );


        if (!savedData) {

            alert(
                "No local subject data found."
            );

            return;
        }


        let localSections;


        try {

            localSections =
                JSON.parse(savedData);

        }

        catch (error) {

            console.error(
                "Invalid localStorage data:",
                error
            );

            alert(
                "Local subject data could not be read."
            );

            return;
        }


        if (
            !Array.isArray(localSections)
        ) {

            alert(
                "Local subject data format is invalid."
            );

            return;
        }


        // -----------------------------------------
        // 3. CHECK IF CLOUD ALREADY HAS SECTIONS
        // -----------------------------------------

        const {
            data: existingSections,
            error: existingError
        } =
        await supabaseClient
            .from("sections")
            .select("id,name")
            .eq("user_id", userId);


        if (existingError) {

            console.error(
                "Cloud check failed:",
                existingError
            );

            alert(
                "Could not check cloud data."
            );

            return;
        }


        if (
            existingSections &&
            existingSections.length > 0
        ) {

            const continueMigration =
                confirm(
                    "Cloud subjects already exist. Running migration again may create duplicates.\n\nContinue anyway?"
                );


            if (!continueMigration) {

                return;

            }

        }


        // -----------------------------------------
        // COUNTERS
        // -----------------------------------------

        let sectionCount = 0;
        let subjectCount = 0;
        let topicCount = 0;
        let subtopicCount = 0;


        // -----------------------------------------
        // 4. MIGRATE EACH SECTION
        // -----------------------------------------

        for (
            let sectionIndex = 0;
            sectionIndex < localSections.length;
            sectionIndex++
        ) {

            const localSection =
                localSections[sectionIndex];


            const {
                data: insertedSection,
                error: sectionError
            } =
            await supabaseClient
                .from("sections")
                .insert({

                    user_id: userId,

                    name:
                        localSection.name ||
                        "Unnamed Section",

                    position:
                        sectionIndex,

                    archived:
                        false

                })
                .select()
                .single();


            if (sectionError) {

                console.error(
                    "Section migration failed:",
                    localSection,
                    sectionError
                );

                throw sectionError;

            }


            sectionCount++;


            const cloudSectionId =
                insertedSection.id;


            const localSubjects =
                Array.isArray(
                    localSection.subjects
                )
                    ? localSection.subjects
                    : [];


            // -------------------------------------
            // 5. MIGRATE SUBJECTS
            // -------------------------------------

            for (
                let subjectIndex = 0;
                subjectIndex < localSubjects.length;
                subjectIndex++
            ) {

                const localSubject =
                    localSubjects[
                        subjectIndex
                    ];


                const {
                    data: insertedSubject,
                    error: subjectError
                } =
                await supabaseClient
                    .from("subjects")
                    .insert({

                        user_id:
                            userId,

                        section_id:
                            cloudSectionId,

                        name:
                            localSubject.name ||
                            "Unnamed Subject",

                        position:
                            subjectIndex,

                        completed:
                            Boolean(
                                localSubject.completed
                            ),

                        archived:
                            false

                    })
                    .select()
                    .single();


                if (subjectError) {

                    console.error(
                        "Subject migration failed:",
                        localSubject,
                        subjectError
                    );

                    throw subjectError;

                }


                subjectCount++;


                const cloudSubjectId =
                    insertedSubject.id;


                const localTopics =
                    Array.isArray(
                        localSubject.topics
                    )
                        ? localSubject.topics
                        : [];


                // ---------------------------------
                // 6. MIGRATE TOPICS
                // ---------------------------------

                for (
                    let topicIndex = 0;
                    topicIndex < localTopics.length;
                    topicIndex++
                ) {

                    const localTopic =
                        localTopics[
                            topicIndex
                        ];


                    const {
                        data: insertedTopic,
                        error: topicError
                    } =
                    await supabaseClient
                        .from("topics")
                        .insert({

                            user_id:
                                userId,

                            subject_id:
                                cloudSubjectId,

                            name:
                                localTopic.name ||
                                "Unnamed Topic",

                            position:
                                topicIndex,

                            completed:
                                Boolean(
                                    localTopic.completed
                                )

                        })
                        .select()
                        .single();


                    if (topicError) {

                        console.error(
                            "Topic migration failed:",
                            localTopic,
                            topicError
                        );

                        throw topicError;

                    }


                    topicCount++;


                    const cloudTopicId =
                        insertedTopic.id;


                    const localSubtopics =
                        Array.isArray(
                            localTopic.subtopics
                        )
                            ? localTopic.subtopics
                            : [];


                    // -----------------------------
                    // 7. MIGRATE SUBTOPICS
                    // -----------------------------

                    for (
                        let subtopicIndex = 0;
                        subtopicIndex <
                        localSubtopics.length;
                        subtopicIndex++
                    ) {

                        const localSubtopic =
                            localSubtopics[
                                subtopicIndex
                            ];


                        const {
                            error:
                                subtopicError
                        } =
                        await supabaseClient
                            .from(
                                "subtopics"
                            )
                            .insert({

                                user_id:
                                    userId,

                                topic_id:
                                    cloudTopicId,

                                name:
                                    localSubtopic.name ||
                                    "Unnamed Subtopic",

                                position:
                                    subtopicIndex,

                                completed:
                                    Boolean(
                                        localSubtopic.completed
                                    )

                            });


                        if (
                            subtopicError
                        ) {

                            console.error(
                                "Subtopic migration failed:",
                                localSubtopic,
                                subtopicError
                            );

                            throw subtopicError;

                        }


                        subtopicCount++;

                    }

                }

            }

        }


        // -----------------------------------------
        // 8. SUCCESS
        // -----------------------------------------

        console.log(
            "Migration complete",
            {
                sections:
                    sectionCount,

                subjects:
                    subjectCount,

                topics:
                    topicCount,

                subtopics:
                    subtopicCount
            }
        );


        alert(
            "Migration successful! ☁️\n\n" +
            "Sections: " +
            sectionCount +
            "\nSubjects: " +
            subjectCount +
            "\nTopics: " +
            topicCount +
            "\nSubtopics: " +
            subtopicCount
        );


        localStorage.setItem(
            "productiveHorizonMigrationComplete",
            "true"
        );

    }

    catch (error) {

        console.error(
            "Migration failed:",
            error
        );


        alert(
            "Migration failed. Your local data is still safe.\n\nCheck console for details."
        );

    }

}


// =============================================
// MIGRATION BUTTON
// =============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const migrationButton =
            document.getElementById(
                "migrationButton"
            );


        if (
            migrationButton
        ) {

            migrationButton.addEventListener(
                "click",
                function () {

                    const confirmed =
                        confirm(
                            "Copy your current local subjects, topics and subtopics to Supabase cloud?\n\nYour existing local data will NOT be deleted."
                        );


                    if (
                        confirmed
                    ) {

                        migrateLocalSubjectsToCloud();

                    }

                }
            );

        }

    }
);