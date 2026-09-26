/* ========================================
   ELEMENTS
======================================== */

const resultElement = document.getElementById("result");
const expressionElement = document.getElementById("expression");
const displayLabel = document.getElementById("displayLabel");

const buttons = document.querySelectorAll(".key");

const historyPanel = document.getElementById("history");
const historyList = document.getElementById("historyList");

const historyToggle = document.getElementById("historyToggle");
const historyClose = document.getElementById("historyClose");
const clearHistoryButton = document.getElementById("clearHistory");


/* ========================================
   STATE
======================================== */

let currentValue = "0";

let previousValue = null;

let currentOperator = null;

let waitingForNewValue = false;

let calculationHistory = [];


/* ========================================
   OPERATOR SYMBOLS
======================================== */

const operatorSymbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
    "%": "%"
};


/* ========================================
   DISPLAY
======================================== */

function updateDisplay() {

    resultElement.textContent = formatNumber(currentValue);

    if (
        previousValue !== null &&
        currentOperator !== null
    ) {

        expressionElement.textContent =
            `${formatNumber(previousValue)} ${operatorSymbols[currentOperator]}`;

    } else {

        expressionElement.textContent = "0";
    }
}


/* ========================================
   FORMAT NUMBER
======================================== */

function formatNumber(value) {

    if (value === "Error") {
        return "Error";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Error";
    }

    if (String(value).includes(".") && !String(value).endsWith(".")) {

        return number.toLocaleString("en-US", {
            maximumFractionDigits: 10
        });
    }

    return String(value)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


/* ========================================
   INPUT NUMBER
======================================== */

function inputNumber(number) {

    if (currentValue === "Error") {
        clearCalculator();
    }


    if (waitingForNewValue) {

        currentValue = number;

        waitingForNewValue = false;

    } else {

        if (currentValue === "0") {

            currentValue = number;

        } else {

            currentValue += number;
        }
    }


    displayLabel.textContent = "INPUT";

    updateDisplay();
}


/* ========================================
   DECIMAL
======================================== */

function inputDecimal() {

    if (currentValue === "Error") {
        clearCalculator();
    }


    if (waitingForNewValue) {

        currentValue = "0.";

        waitingForNewValue = false;

    } else if (!currentValue.includes(".")) {

        currentValue += ".";
    }


    displayLabel.textContent = "INPUT";

    updateDisplay();
}


/* ========================================
   CALCULATE
======================================== */

function calculate(first, second, operator) {

    const a = Number(first);
    const b = Number(second);


    switch (operator) {

        case "+":
            return a + b;

        case "-":
            return a - b;

        case "*":
            return a * b;

        case "/":

            if (b === 0) {
                return "Error";
            }

            return a / b;

        case "%":

            return a % b;

        default:
            return b;
    }
}


/* ========================================
   CHOOSE OPERATOR
======================================== */

function chooseOperator(operator) {

    if (currentValue === "Error") {
        return;
    }


    if (
        currentOperator !== null &&
        previousValue !== null &&
        !waitingForNewValue
    ) {

        const result = calculate(
            previousValue,
            currentValue,
            currentOperator
        );


        if (result === "Error") {

            showError();

            return;
        }


        currentValue = String(result);

        previousValue = result;
    }


    previousValue = Number(currentValue);

    currentOperator = operator;

    waitingForNewValue = true;

    displayLabel.textContent = "OPERATOR";

    updateDisplay();
}


/* ========================================
   EQUAL
======================================== */

function calculateResult() {

    if (
        currentOperator === null ||
        previousValue === null
    ) {
        return;
    }


    const firstNumber = previousValue;

    const secondNumber = Number(currentValue);

    const operator = currentOperator;


    const result = calculate(
        firstNumber,
        secondNumber,
        operator
    );


    if (result === "Error") {

        showError();

        return;
    }


    const equation =
        `${formatNumber(firstNumber)} ${operatorSymbols[operator]} ${formatNumber(secondNumber)}`;


    currentValue = String(result);

    previousValue = null;

    currentOperator = null;

    waitingForNewValue = true;


    expressionElement.textContent = equation;

    resultElement.textContent = formatNumber(currentValue);

    displayLabel.textContent = "RESULT";


    addToHistory(
        equation,
        formatNumber(currentValue)
    );
}


/* ========================================
   ERROR
======================================== */

function showError() {

    currentValue = "Error";

    previousValue = null;

    currentOperator = null;

    waitingForNewValue = true;

    expressionElement.textContent = "INVALID OPERATION";

    resultElement.textContent = "Error";

    displayLabel.textContent = "ERROR";
}


/* ========================================
   CLEAR
======================================== */

function clearCalculator() {

    currentValue = "0";

    previousValue = null;

    currentOperator = null;

    waitingForNewValue = false;

    displayLabel.textContent = "READY";

    updateDisplay();
}


/* ========================================
   DELETE
======================================== */

function deleteNumber() {

    if (
        currentValue === "Error" ||
        waitingForNewValue
    ) {
        return;
    }


    if (currentValue.length <= 1) {

        currentValue = "0";

    } else {

        currentValue =
            currentValue.slice(0, -1);
    }


    displayLabel.textContent = "INPUT";

    updateDisplay();
}


/* ========================================
   HISTORY
======================================== */

function addToHistory(equation, answer) {

    calculationHistory.unshift({
        equation,
        answer
    });


    if (calculationHistory.length > 10) {

        calculationHistory.pop();
    }


    renderHistory();
}


/* ========================================
   RENDER HISTORY
======================================== */

function renderHistory() {

    if (calculationHistory.length === 0) {

        historyList.innerHTML = `
            <div class="history__empty">

                <span>∑</span>

                <p>No calculations yet</p>

            </div>
        `;

        return;
    }


    historyList.innerHTML = "";


    calculationHistory.forEach((item, index) => {

        const historyItem =
            document.createElement("div");


        historyItem.className =
            "history__item";


        historyItem.innerHTML = `
            <div class="history__equation">
                ${item.equation}
            </div>

            <div class="history__answer">
                = ${item.answer}
            </div>
        `;


        historyItem.addEventListener(
            "click",
            () => {

                currentValue =
                    String(
                        item.answer
                            .replace(/,/g, "")
                    );

                previousValue = null;

                currentOperator = null;

                waitingForNewValue = true;

                displayLabel.textContent =
                    "HISTORY";

                updateDisplay();

                closeHistory();
            }
        );


        historyList.appendChild(historyItem);
    });
}


/* ========================================
   OPEN HISTORY
======================================== */

function openHistory() {

    historyPanel.classList.add("active");
}


/* ========================================
   CLOSE HISTORY
======================================== */

function closeHistory() {

    historyPanel.classList.remove("active");
}


/* ========================================
   CLEAR HISTORY
======================================== */

function clearHistory() {

    calculationHistory = [];

    renderHistory();
}


/* ========================================
   BUTTON EVENTS
======================================== */

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;

        const action = button.dataset.action;


        /* Numbers */

        if (value !== undefined) {

            if (
                value >= "0" &&
                value <= "9"
            ) {

                inputNumber(value);

                return;
            }


            /* Decimal */

            if (value === ".") {

                inputDecimal();

                return;
            }


            /* Operators */

            if (
                value === "+" ||
                value === "-" ||
                value === "*" ||
                value === "/" ||
                value === "%"
            ) {

                chooseOperator(value);

                return;
            }
        }


        /* Clear */

        if (action === "clear") {

            clearCalculator();

            return;
        }


        /* Delete */

        if (action === "delete") {

            deleteNumber();

            return;
        }


        /* Equal */

        if (action === "equal") {

            calculateResult();

            return;
        }

    });

});


/* ========================================
   HISTORY EVENTS
======================================== */

historyToggle.addEventListener(
    "click",
    openHistory
);


historyClose.addEventListener(
    "click",
    closeHistory
);


clearHistoryButton.addEventListener(
    "click",
    clearHistory
);


/* ========================================
   KEYBOARD
======================================== */

document.addEventListener(
    "keydown",
    (event) => {

        const key = event.key;


        /* Numbers */

        if (
            key >= "0" &&
            key <= "9"
        ) {

            inputNumber(key);

            return;
        }


        /* Decimal */

        if (key === ".") {

            inputDecimal();

            return;
        }


        /* Operators */

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/" ||
            key === "%"
        ) {

            chooseOperator(key);

            return;
        }


        /* Enter */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculateResult();

            return;
        }


        /* Backspace */

        if (key === "Backspace") {

            deleteNumber();

            return;
        }


        /* Escape */

        if (key === "Escape") {

            clearCalculator();

            closeHistory();

            return;
        }

    }
);


/* ========================================
   INITIALIZE
======================================== */

updateDisplay();

renderHistory();