// ========================================
// PRODUCTIVE HORIZON - PAGE PROTECTION
// ========================================

async function protectPage() {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session check error:",
                error
            );

            window.location.href =
                "login.html";

            return;
        }


        // User is NOT logged in
        if (!session) {

            window.location.href =
                "login.html";

            return;
        }


        // User logged in
        console.log(
            "Authenticated user:",
            session.user.email
        );


        // Show email if element exists
        const userEmail =
            document.getElementById(
                "userEmail"
            );


        if (userEmail) {

            userEmail.textContent =
                session.user.email;

        }

    }

    catch (error) {

        console.error(
            "Authentication protection error:",
            error
        );

        window.location.href =
            "login.html";

    }

}


// ========================================
// LOGOUT
// ========================================

async function logoutUser() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.disabled =
            true;

        logoutButton.textContent =
            "Logging out...";

    }


    const {
        error
    } =
    await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "Logout failed. Please try again."
        );


        if (logoutButton) {

            logoutButton.disabled =
                false;

            logoutButton.textContent =
                "Logout";

        }


        return;
    }


    window.location.href =
        "login.html";

}


// ========================================
// BUTTON LISTENER
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );

        }

    }
);


// ========================================
// RUN PAGE PROTECTION
// ========================================

protectPage();