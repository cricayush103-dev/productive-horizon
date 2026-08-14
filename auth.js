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


// ----------------------------------------
// CHECK IF ALREADY LOGGED IN
// ----------------------------------------

async function checkExistingSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        window.location.href =
            "index.html";

    }

}

checkExistingSession();


// ----------------------------------------
// LOGIN
// ----------------------------------------

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginMessage.textContent = "";

        loginButton.disabled = true;

        loginButton.textContent =
            "Signing In...";


        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        const {
            data,
            error
        } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


        if (error) {

            loginMessage.textContent =
                error.message;

            loginMessage.classList.add(
                "error-message"
            );

            loginButton.disabled = false;

            loginButton.textContent =
                "Sign In";

            return;

        }


        if (data.session) {

            loginMessage.textContent =
                "Login successful!";

            loginMessage.classList.remove(
                "error-message"
            );

            loginMessage.classList.add(
                "success-message"
            );


            setTimeout(function () {

                window.location.href =
                    "index.html";

            }, 500);

        }

    }
);