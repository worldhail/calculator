/*Note: I use guard clauses on some of the if else statement for oneliner code
that needs to run down before the nested if else statement ends*/

const calculatorScreen = document.querySelector('.input-value');
const toBeEqualledScreen = document.querySelector('.to-be-equalled');
const operator = /[\+]|[\-]|[\*]|[\/]/;
let unFinishedTotal = [''];
let lastUsedOperator = 'none';
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
        } else if (lastUsedOperator !== 'none') {
            const total = calculate(unFinishedTotal);
            forDisplay = [];
            display(total);
            unFinishedTotal.pop();
        }
        unFinishedTotal.push(pressedKey);
        lastUsedOperator = pressedKey;

        //for numbers that needed a negative sign
    } else if (event.altKey === true && event.code === 'Minus') {
        if (forDisplay.length === 0) { return; }

        //unFinishedTotal array will reset once apply a negative sign on a current result
        const unFinishedTotalLastOperatorIndex = unFinishedTotal.findLastIndex(usedOperator => usedOperator === lastUsedOperator);
        const unFinishedTotalLastNumber = unFinishedTotal.splice(unFinishedTotalLastOperatorIndex + 1);
        const numberOfUsedOperator = unFinishedTotal.filter(usedOperator => operator.test(usedOperator)).length;
        if (numberOfUsedOperator > 1 && unFinishedTotalLastElement.match(operator)) {
            const currentResult = forDisplay.toString().replace('-', '–').split('');
            forDisplay = currentResult;
            unFinishedTotal = currentResult.concat('');
        }
        if (forDisplay[0] === '–') {
            if (lastUsedOperator === 'none' || unFinishedTotalLastNumber.length === 0) {
                unFinishedTotal.shift();
            } else {
                unFinishedTotalLastNumber.shift();
                unFinishedTotalLastNumber.pop();
            }
            forDisplay.shift();
        } else {
            if (lastUsedOperator === 'none' || unFinishedTotalLastNumber.length === 0) {
                unFinishedTotal.unshift(pressedKey);
            } else {
                unFinishedTotalLastNumber.unshift('(–');
                unFinishedTotalLastNumber.push(')');
            }
            forDisplay.unshift(pressedKey);
        }
        unFinishedTotal = unFinishedTotal.concat(unFinishedTotalLastNumber);
        const forDisplaywithRegularMinusSign = forDisplay
            .join('')
            .replace(/[\–]/g, '-');
        calculatorScreen.value = forDisplaywithRegularMinusSign;
    }

    const operatorOutput = { '–': '-', '*': 'x', '/': '÷' };
    const pressedKeys = unFinishedTotal
        .join('')
        .replace(/[\–]|[\*]|[\/]/g, (values) => {
            return operatorOutput[values]
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
    const combinedPressedKeys = unFinishedTotalArray
        .join('')
        .replace(/[\–]/g, '-');
    const getToTal = eval(combinedPressedKeys);
    return getToTal;
}