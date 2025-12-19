import axios from "axios";

const API_LOGIN = "http://localhost:8000/api-v1/login/";
const API_PAIEMENT = "http://localhost:8000/api-v1/paiement/";

// :closed_lock_with_key: Identifiants TEST — remplace plus tard
const TEST_USERNAME = "user_2@gmail.com";
const TEST_PASSWORD = "test1234";

/*
────────────────────────────────────────
 :closed_lock_with_key: Login automatique + récupération JWT
────────────────────────────────────────
*/
const autoLogin = async () => {
    try {
        const res = await axios.post(API_LOGIN, {
            email: TEST_USERNAME,
            password: TEST_PASSWORD,
        });

        const token = res.data.access;
        localStorage.setItem("token", token);
        return token;

    } catch (error) {
        console.error("Erreur login automatique :", error);
        throw new Error("Impossible de se connecter automatiquement");
    }
};

/*
────────────────────────────────────────
 :large_purple_circle: CyberSource Secure Acceptance
 → Formulaire POST auto-submit
────────────────────────────────────────
*/

const redirectToCyberSource = (paymentUrl, fields) => {
    console.log("fields",fields)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.keys(fields).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
};

/*
────────────────────────────────────────
 :credit_card: Création de paiement Stripe + CyberSource
────────────────────────────────────────
*/
export const createPayment = async (payload) => {
    try {
        let token = localStorage.getItem("token");
        if (!token) token = await autoLogin();

        const response = await axios.post(API_PAIEMENT, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("response",response);

        // :large_blue_circle: 1) Stripe Checkout
        if (response.data.checkout_url) {
            window.location.href = response.data.checkout_url;
            return;
        }

        // :large_blue_circle: 2) CyberSource Secure Acceptance
        if (response.data.provider_payload.paymentUrl && response.data.provider_payload.fields) {
            console.log("response.data.fields",response.data.provider_payload.fields)
            redirectToCyberSource(response.data.provider_payload.paymentUrl, response.data.provider_payload.fields);
            return;
        }

        return response;

    } catch (err) {

        // 401 → token expiré → refaire login
        if (err.response && err.response.status === 401) {
            console.log("Token expiré → relog automatique…");

            const token = await autoLogin();

            const response = await axios.post(API_PAIEMENT, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Re-check Stripe
            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
                return;
            }

            // Re-check CyberSource
            if (response.data.paymentUrl && response.data.fields) {
                console.log("response.data.fields",response.data.fields)
                redirectToCyberSource(response.data.paymentUrl, response.data.fields);
                return;
            }

            return response;
        }

        throw err;
    }
};