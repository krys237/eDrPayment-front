// payement.js
// Current selected payment method
let selectedPayment = 'card';

// Regex patterns
const patterns = {
    cardNumber: /^(\d{4}\s){3}\d{4}$/,
    cardExpiry: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
    cardCVV: /^\d{3,4}$/,
    cardName: /^[a-zA-ZÀ-ÿ\s]{3,}$/,
    phone: /^\d{9,15}$/,
    amount: /^\d+(\.\d{1,2})?$/
};

// Function to select payment method
function selectPayment(method) {
    // Remove selected class from all options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    document.getElementById(method).classList.add('selected');
    
    // Update selected payment
    selectedPayment = method;
    
    // Update payment details based on selection
    updatePaymentDetails();
    
    // Update summary
    updateSummary();
}

// Function to update payment details based on selection
function updatePaymentDetails() {
    const detailsContainer = document.getElementById('payment-details');
    let detailsHTML = '';
    
    if (selectedPayment === 'orange-money') {
        detailsHTML = `
            <div class="mb-6">
                <label class="block text-gray-700 font-medium mb-2">
                    <i class="fas fa-mobile-alt mr-2"></i>Informations Orange Money
                </label>
                <div class="input-wrapper mb-4">
                    <input 
                        type="text" 
                        id="orange-phone" 
                        class="input-field w-full" 
                        placeholder="+237 07 00 00 00 00"
                        maxlength="20"
                        oninput="formatPhone(this, 'orange')">
                    <i class="fas fa-phone input-icon" id="orange-phone-icon"></i>
                </div>
                <p class="error-message" id="orange-phone-error">Numéro invalide (10-15 chiffres requis)</p>
                <p class="text-sm text-gray-500 mt-2">Vous recevrez un SMS pour confirmer la transaction</p>
            </div>
        `;
    } else if (selectedPayment === 'mobile-money') {
        detailsHTML = `
            <div class="mb-6">
                <label class="block text-gray-700 font-medium mb-2">
                    <i class="fas fa-sim-card mr-2"></i>Informations Mobile Money
                </label>
                <div class="input-wrapper mb-4">
                    <input 
                        type="text" 
                        id="mobile-phone" 
                        class="input-field w-full" 
                        placeholder="+237 07 00 00 00 00"
                        maxlength="20"
                        oninput="formatPhone(this, 'mobile')">
                    <i class="fas fa-phone input-icon" id="mobile-phone-icon"></i>
                </div>
                <p class="error-message" id="mobile-phone-error">Numéro invalide (10-15 chiffres requis)</p>
                <p class="text-sm text-gray-500 mt-2">Sélectionnez votre opérateur et saisissez votre numéro</p>
            </div>
        `;
    } else {
        // Pour le paiement par carte, on affiche un message de redirection
        detailsHTML = `
            <div class="mb-6 text-center p-4 bg-gray-100 rounded-lg">
                <i class="fas fa-shield-alt text-3xl text-purple-500 mb-2"></i>
                <p class="text-gray-700 font-medium">Vous allez être redirigé vers une page de paiement sécurisée pour finaliser votre transaction.</p>
            </div>
        `;
    }
    
    detailsContainer.innerHTML = detailsHTML;
    
    // Update method summary
    updateMethodSummary();
}

// Format card number with spaces
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    input.value = formattedValue;
    validateField(input, 'card-number', patterns.cardNumber.test(formattedValue));
    
    // Detect card type
    detectCardType(value);
}

// Detect card type (Visa or MasterCard)
function detectCardType(number) {
    const visaIcon = document.getElementById('visa-icon');
    const mastercardIcon = document.getElementById('mastercard-icon');
    
    if (visaIcon && mastercardIcon) {
        visaIcon.classList.remove('active');
        mastercardIcon.classList.remove('active');
        
        if (/^4/.test(number)) {
            visaIcon.classList.add('active');
        } else if (/^5[1-5]/.test(number)) {
            mastercardIcon.classList.add('active');
        }
    }
}

// Format card expiry date
function formatCardExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        let month = parseInt(value.substring(0, 2));
        if (month > 12) month = 12;
        if (month < 1 && value.length >= 2) month = '0' + value[1];
        value = month.toString().padStart(2, '0') + value.substring(2);
    }
    
    if (value.length >= 3) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    input.value = value;
    validateField(input, 'card-expiry', patterns.cardExpiry.test(value));
}

// Format CVV
function formatCVV(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value.substring(0, 4);
    validateField(input, 'card-cvv', patterns.cardCVV.test(value));
}

// Validate card name
function validateCardName(input) {
    let value = input.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    input.value = value;
    validateField(input, 'card-name', patterns.cardName.test(value));
}

// Format phone number
function formatPhone(input, type) {
    let value = input.value.replace(/\D/g, '');
    
    // Format: +237 XX XX XX XX XX or +1 XXX XXX XXXX
    if (value.length > 0) {
        if (!value.startsWith('237') && !value.startsWith('1') && !value.startsWith('33')) {
            // Default to 237 (Côte d'Ivoire)
            value = '237' + value;
        }
    }
    
    input.value = '+' + value;
    validateField(input, type + '-phone', patterns.phone.test(value.substring(value.length > 3 ? 3 : 0)));
}

// Update operator prefixe
function updateOperatorPrefix() {
    const operator = document.getElementById('mobile-operator').value;
    const phoneInput = document.getElementById('mobile-phone');
    
    if (phoneInput) {
        const prefixes = {
            'orange': '+237 07',
            'mtn': '+237 05',
            'moov': '+237 01',
            'wave': '+237 07'
        };
        
        if (prefixes[operator]) {
            phoneInput.value = prefixes[operator];
        } else {
            phoneInput.value = '+237 ';
        }
    }
}

// Generic field validation
function validateField(input, fieldId, isValid) {
    const errorElement = document.getElementById(fieldId + '-error');
    const iconElement = document.getElementById(fieldId + '-icon');
    
    if (input.value.length === 0) {
        input.classList.remove('error', 'success');
        if (errorElement) errorElement.classList.remove('show');
        if (iconElement) {
            iconElement.classList.remove('success', 'error');
            iconElement.className = iconElement.className.replace(/text-(green|red)-500/, '');
        }
        return false;
    }
    
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('success');
        if (errorElement) errorElement.classList.remove('show');
        if (iconElement) {
            iconElement.classList.remove('error');
            iconElement.classList.add('success');
        }
        return true;
    } else {
        input.classList.remove('success');
        input.classList.add('error');
        if (errorElement) errorElement.classList.add('show');
        if (iconElement) {
            iconElement.classList.remove('success');
            iconElement.classList.add('error');
        }
        return false;
    }
}

// Format amount
function formatAmount(input) {
    let value = input.value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    input.value = value;
    updateAmountSummary();
    
    // Validate amount
    if (value.length > 0) {
        const isValid = patterns.amount.test(value) && parseFloat(value) > 0;
        if (isValid) {
            input.classList.remove('error');
            input.classList.add('success');
        } else {
            input.classList.remove('success');
            input.classList.add('error');
        }
    } else {
        input.classList.remove('error', 'success');
    }
}

// Function to update method summary
function updateMethodSummary() {
    let methodText = '';
    
    switch(selectedPayment) {
        case 'orange-money':
            methodText = 'Orange Money';
            break;
        case 'mobile-money':
            methodText = 'Mobile Money';
            break;
        case 'card':
            methodText = 'Carte Bancaire';
            break;
    }
    
    document.getElementById('method-summary').textContent = methodText;
}

// Function to update amount summary
function updateAmountSummary() {
    const amountInput = document.getElementById('amount');
    const currencySelect = document.getElementById('currency');
    
    let amount = amountInput.value || '0';
    let currency = currencySelect.value;
    
    if (amount && parseFloat(amount) > 0) {
        document.getElementById('amount-summary').textContent = `${parseFloat(amount).toFixed(2)} ${currency}`;
        document.getElementById('total-summary').textContent = `${parseFloat(amount).toFixed(2)} ${currency}`;
    } else {
        document.getElementById('amount-summary').textContent = `0.00 ${currency}`;
        document.getElementById('total-summary').textContent = `0.00 ${currency}`;
    }
}

// Function to update the entire summary
function updateSummary() {
    updateMethodSummary();
    updateAmountSummary();
}

// Validate all fields before payment
function validateAllFields() {
    const amount = document.getElementById('amount').value;
    const justification = document.getElementById('justification').value;
    let isValid = true;
    
    // Validate amount
    if (!amount || !patterns.amount.test(amount) || parseFloat(amount) <= 0) {
        document.getElementById('amount').classList.add('error');
        isValid = false;
    }
    
    // Validate justification
    if (!justification.trim()) {
        alert('Veuillez décrire le justificatif du paiement');
        isValid = false;
    }
    
    // Validate payment details based on selected method
    if (selectedPayment === 'orange-money') {
        const orangePhone = document.getElementById('orange-phone');
        if (!patterns.phone.test(orangePhone.value.replace(/\+/g, ''))) {
            orangePhone.classList.add('error');
            document.getElementById('orange-phone-error').classList.add('show');
            isValid = false;
        }
    } else if (selectedPayment === 'mobile-money') {
        const mobilePhone = document.getElementById('mobile-phone');
        
        if (!patterns.phone.test(mobilePhone.value.replace(/\+/g, ''))) {
            mobilePhone.classList.add('error');
            document.getElementById('mobile-phone-error').classList.add('show');
            isValid = false;
        }
    }
    
    return isValid;
}

// Function to process payment
function processPayment() {
    if (!validateAllFields()) {
        return;
    }
    
    const amount = document.getElementById('amount').value;
    const justification = document.getElementById('justification').value;
    const currency = document.getElementById('currency').value;
    
    // Show loading state
    const payButton = document.querySelector('.btn-primary');
    const originalText = payButton.innerHTML;
    payButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Traitement en cours...';
    payButton.disabled = true;
    
    // Déterminer le provider_id
    let providerId;
    if (selectedPayment === 'orange-money') {
        providerId = 1;
    } else if (selectedPayment === 'mobile-money') {
        providerId = 2;
    } else if (selectedPayment === 'card') {
        providerId = 3;
    }

    if (!providerId) {
        alert('Méthode de paiement invalide');
        payButton.innerHTML = originalText;
        payButton.disabled = false;
        return;
    }

    // Récupérer les informations utilisateur
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        alert('Erreur : Informations utilisateur non trouvées. Veuillez vous reconnecter.');
        window.location.href = 'auth-login-basic.html';
        return;
    }

    const data = {
        module_origin: justification,
        amount: amount,
        provider_id: providerId,
        currency: currency,
        account: {
            "balance": "string",
            "currency": currency,
            "user": {
                "telephone": user.telephone,
                "email": user.email,
                "last_name": user.last_name
            }
        },
        provider: {
            "account": {
                "balance": "string",
                "currency": currency,
                "user": {
                    "telephone": "+881292694",
                    "email": "user@example.com",
                    "last_name": "string"
                }
            }
        }
    };

    // Récupérer le token
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Erreur : Utilisateur non connecté. Veuillez vous reconnecter.');
        window.location.href = 'auth-login-basic.html';
        return;
    }

    fetch('http://192.168.100.175:8001/api-v1/paiement/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(err => { 
                throw new Error(JSON.stringify(err)) 
            });
        }
    })
    .then(responseData => {
        // 🔹 CAS 1 : Paiement par Carte Bancaire (CyberSource)
        if (providerId === 3) {
            // // Option A : Si l'API retourne directement { paymentUrl, fields }
            if (responseData.paymentUrl && responseData.fields) {
                console.log("🔵 Redirection CyberSource (structure directe)");
                redirectToCyberSource(responseData.paymentUrl, responseData.fields);
                return;
            }
            // Si aucune structure ne correspond
            console.error("❌ Structure de réponse CyberSource introuvable :", responseData);
            alert('Erreur : Structure de réponse invalide pour le paiement par carte');
            return;
        }

        // 🔹 CAS 2 : Paiement Mobile Money / Orange Money
        alert('✅ Paiement initié avec succès ! Veuillez suivre les instructions sur votre téléphone.');
        console.log('Success:', responseData);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        alert('Une erreur est survenue lors de l\'initiation du paiement : ' + error.message);
    })
    .finally(() => {
        // Reset button
        payButton.innerHTML = originalText;
        payButton.disabled = false;
    });
}

// 🔹 Fonction de redirection CyberSource (IDENTIQUE au code fonctionnel)
function redirectToCyberSource(paymentUrl, fields) {
    console.log("🚀 Redirection vers CyberSource...");
    console.log("URL:", paymentUrl);
    console.log("Fields:", fields);

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
}


// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Format and validate amount on input
    document.getElementById('amount').addEventListener('input', function(e) {
        formatAmount(this);
    });
    
    // Update summary when currency changes
    document.getElementById('currency').addEventListener('change', updateAmountSummary);
    
    // Initialize summary
    updateSummary();
});