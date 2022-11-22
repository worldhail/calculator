/*Note: I use guard clauses on some of the if else statement for oneliner code
that needs to run down before the nested if else statement ends*/

const calculatorScreen = document.querySelector('.input-value');
const toBeEqualledScreen = document.querySelector('.to-be-equalled');
const operator = /[\+]|[\-]|[\*]|[\/]/;
const unFinishedTotal = [''];
let lastUsedOperator = '';
let forDisplay = [];

//KEYPRESS EVENT LISTENER
window.addEventListener('keypress', function (event) {
    const number = /[\d]|[\.]/;
    let pressedKey = event.key;
    const unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];

    //decimal is added on this condition
    if (number.test(pressedKey)) {
        if (unFinishedTotalLastElement.match(operator)) { forDisplay = []; }
        if (forDisplay.includes('.') && pressedKey === '.') { return; }
        display(pressedKey);

    //operator keys will run inside this condition
    } else if (operator.test(pressedKey)) {
        if (unFinishedTotalLastElement.match(operator)) {
            unFinishedTotal.pop();
        } else if (forDisplay.length === 0) {
            return;
        } else if (lastUsedOperator !== '') {
            const total = calculate(unFinishedTotal);
            forDisplay = [];
            display(total);
            unFinishedTotal.pop();
        }
        unFinishedTotal.push(pressedKey);
        lastUsedOperator = pressedKey;

        //for numbers that needed a negative sign
    } else if (event.altKey === true && event.code === 'Minus') {
        const unFinishedTotalLastOperatorIndex = unFinishedTotal.findLastIndex(usedOperator => usedOperator === lastUsedOperator);
        if (forDisplay.length === 0) { return; }
        if (lastUsedOperator === '') {
            if (forDisplay[0] === '–') {
                unFinishedTotal.shift();
                forDisplay.shift();
            } else {
                unFinishedTotal.unshift(pressedKey);
                forDisplay.unshift(pressedKey);
            }
        } else {
            const unFinishedTotalLastNumber = unFinishedTotal.splice(unFinishedTotalLastOperatorIndex + 1);
            if (forDisplay[0] === '–') {
                forDisplay.shift();
                unFinishedTotalLastNumber.shift();
                unFinishedTotalLastNumber.pop();
                unFinishedTotal.push(unFinishedTotalLastNumber);
                calculatorScreen.value = forDisplay.join('');
            } else {
                forDisplay.unshift(pressedKey);
                unFinishedTotalLastNumber.unshift('(-');
                unFinishedTotalLastNumber.push(')');
                unFinishedTotal.push(unFinishedTotalLastNumber);
            }
        }
        const forDisplaywithRegularMinusSign = forDisplay.join('').replace(/[\–]/g, '-');
        calculatorScreen.value = forDisplaywithRegularMinusSign;
    }

    const starAndSlash = { '*': 'x', '/': '÷' };
    const pressedKeys = unFinishedTotal
        .join('')
        .replace(/[\*]|[\/]/g, (values) => {
            return starAndSlash[values]
        });
    toBeEqualledScreen.value = pressedKeys;
});

//DISPLAY FUNCTION
function display(number) {
    const forDisplayFirstIndex = forDisplay[0];
    const forDisplayLength = forDisplay.length;

    if (number === '.' && forDisplayLength === 0) {
        forDisplay.push(0);
        unFinishedTotal.push(0);
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