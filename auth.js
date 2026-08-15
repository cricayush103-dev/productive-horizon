// ========================================
// PRODUCTIVE HORIZON - AUTHENTICATION
// ========================================

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");

const loginStatus =
    document.getElementById("loginStatus");


// ========================================
// MESSAGE HELPER
// ========================================

function showLoginMessage(
    message,
    type = "normal"
) {

    loginMessage.textContent =
        message;


    loginMessage.classList.remove(
        "error-message",
        "success-message"
    );


    if (type === "error") {

        loginMessage.classList.add(
            "error-message"
        );

    }

    else if (
        type === "success"
    ) {

        loginMessage.classList.add(
            "success-message"
        );

    }
}


// ========================================
// CHECK SUPABASE
// ========================================

function supabaseReady() {

    if (
        window.supabaseLoadError ||
        typeof window.supabaseClient ===
            "undefined"
    ) {

        showLoginMessage(
            "Connection library could not load. Please refresh or try another network.",
            "error"
        );


        if (loginStatus) {

            loginStatus.textContent =
                "Connection problem";

            loginStatus.className =
                "connection-status status-error";

        }


        return false;
    }


    if (loginStatus) {

        loginStatus.textContent =
            "Secure connection ready";

        loginStatus.className =
            "connection-status status-ready";

    }


    return true;
}


// ========================================
// CHECK EXISTING SESSION
// ========================================

async function checkExistingSession() {

    if (!supabaseReady()) {
        return;
    }


    try {

        const {
            data: { session },
            error
        } =
        await window.supabaseClient
            .auth
            .getSession();


        if (error) {

            console.error(
                "Session check error:",
                error
            );

            return;
        }


        if (session) {

            window.location.href =
                "index.html";

        }

    }

    catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }
}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!supabaseReady()) {

            return;
        }


        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        if (!email || !password) {

            showLoginMessage(
                "Please enter email and password.",
                "error"
            );

            return;
        }


        loginButton.disabled =
            true;

        loginButton.textContent =
            "Signing In...";

        showLoginMessage(
            "Connecting..."
        );


        try {

            const {
                data,
                error
            } =
            await window.supabaseClient
                .auth
                .signInWithPassword({
                    email: email,
                    password: password
                });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );


                showLoginMessage(
                    error.message ||
                    "Login failed.",
                    "error"
                );


                return;
            }


            if (
                data &&
                data.session
            ) {

                showLoginMessage(
                    "Login successful!",
                    "success"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    400
                );

            }

            else {

                showLoginMessage(
                    "Login could not create a session.",
                    "error"
                );

            }

        }

        catch (error) {

            console.error(
                "Unexpected login failure:",
                error
            );


            showLoginMessage(
                "Something went wrong while signing in. Please refresh and try again.",
                "error"
            );

        }

        finally {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Sign In";

        }

    }
);


// ========================================
// START
// ========================================

window.addEventListener(
    "load",
    function () {

        supabaseReady();

        checkExistingSession();

    }
);
