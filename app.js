const calculatorScreen = document.querySelector('.input-value');
const toBeEqualledScreen = document.querySelector('.to-be-equalled');
const operator = /[\+]|[\-]|[\*]|[\/]/;
const operatorWithFlag = /[\+]|[\-]|[\*]|[\/]/g;
let forDisplay = [];
const unFinishedTotal = [''];
let lastUsedOperator = '';

//KEYPRESS EVENT LISTENER
window.addEventListener('keypress', function (event) {
    const number = /[\d]|[\.]/;
    const pressedKey = event.key;
    const lastUsedOperatorLength = lastUsedOperator.length;
    const unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];

    if (number.test(pressedKey)) {
        if (unFinishedTotalLastElement.match(operator)) {
            forDisplay = [];
        }
        if (forDisplay.includes('.') && pressedKey === '.') { return }
        display(pressedKey);

    } else if (operator.test(pressedKey)) {
        if (unFinishedTotalLastElement.match(operator)) {
            unFinishedTotal.pop();
        } else if (lastUsedOperator !== '' && unFinishedTotalLastElement.match(number)) {
            const total = calculate(unFinishedTotal);
            forDisplay = [];
            display(total);
            unFinishedTotal.pop();
        }
        unFinishedTotal.push(pressedKey);
        lastUsedOperator = pressedKey;
    }

    const starAndSlash = { '*': 'x', '/': '÷' };
    const pressedKeys = unFinishedTotal
        .join('')
        .replace(/[\*]|[\/]/g, (match) => {
            return starAndSlash[match]
        });
    toBeEqualledScreen.value = pressedKeys;
});

//DISPLAY FUNCTION
function display(number) {
    const forDisplayFirstIndex = forDisplay[0];
    const forDisplayLength = forDisplay.length;

    if (number === '.' && forDisplayLength === 0) {
        forDisplay.push(0);

    } else if (forDisplayFirstIndex === '0' && forDisplayLength === 1) {
        if (number !== '.') {
            forDisplay.pop();
            unFinishedTotal.pop();
        }
    }

    unFinishedTotal.push(number);
    forDisplay.push(number);
    const joinedNumbers = forDisplay.join('');
    calculatorScreen.value = joinedNumbers;
}

//CALCULATE FUNCTION
function calculate(unFinishedTotalArray) {
    const combinedPressedKeys = unFinishedTotalArray.join('');
    const getToTal = eval(combinedPressedKeys);
    return getToTal;
}