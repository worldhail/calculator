/*Note: I use guard clauses on some of the if else statement for oneliner code
that needs to run down before the nested if else statement ends*/

const calculatorScreen = document.querySelector('.input-value');
const toBeEqualledScreen = document.querySelector('.to-be-equalled');
const operator = /[\+]|[\-]|[\*]|[\/]/;
let unFinishedTotal = [''];
let lastUsedOperator = 'none';
let forDisplay = [];
let percentageSwitch = 'off';

//KEYPRESS EVENT LISTENER
window.addEventListener('keypress', function (event) {
    const number = /[\d]|[\.]/;
    let pressedKey = event.key;
    const unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];

    //decimal is added on this condition
    if (number.test(pressedKey)) {
        if (unFinishedTotalLastElement.match(operator)) { forDisplay = []; }
        if (forDisplay.includes('.') && pressedKey === '.') { return; }
        if (unFinishedTotalLastElement === ')') {
            unFinishedTotal.pop();
            unFinishedTotal.push(pressedKey);
            pressedKey = ')';
        }
        display(pressedKey);

        //operator keys will run inside this condition
    } else if (operator.test(pressedKey)) {
        if (unFinishedTotalLastElement.match(operator)) {
            unFinishedTotal.pop();
        } else if (forDisplay.length === 0) {
            return;
        } else if (lastUsedOperator !== 'none') {
            const total = getTotal(unFinishedTotal);
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
                unFinishedTotalLastNumber.pop();
            }
            unFinishedTotalLastNumber.shift();
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
        
        if (percentageSwitch === 'on') {
            percentageSwitch = 'off';
            unFinishedTotal = ['', ...forDisplay];
        }
        const changedAltMinus = useRegularMinusSign(forDisplay);
        calculatorScreen.value = changedAltMinus;

        //percentage condition
    } else if (pressedKey === '%') {
        percentageSwitch = 'on';
        const currentNumber = calculatorScreen.value * 1;
        let percentageOf = currentNumber / 100;
        const unFinishedTotalLastOperatorIndex = unFinishedTotal.findLastIndex(usedOperator => usedOperator === lastUsedOperator);
        
        if (unFinishedTotalLastElement.match(operator) || !unFinishedTotal.join('').match(operator)) {
            forDisplay = [];
            display(percentageOf);
            unFinishedTotal = ['', '% of ', currentNumber];
        } else {
            const previousSet = unFinishedTotal
                .slice(0, unFinishedTotalLastOperatorIndex)
                .join('')
                .replace(/[\–]/, '-');
            const previousResult = eval(previousSet);
            if (percentageOf < 0) { percentageOf = `(${percentageOf})`; }
            if (unFinishedTotalLastElement === ')') {
                unFinishedTotal.pop();
                unFinishedTotal.push(pressedKey);
                pressedKey = ')';
            }

            let newResult = eval(`${percentageOf} * ${previousResult}`);
            if (lastUsedOperator === '+') {
                newResult = previousResult + newResult;
            } else if (lastUsedOperator === '-') {
                newResult = previousResult - newResult;
            } else if (lastUsedOperator === '/') {
                newResult = eval(`${previousResult} / ${percentageOf}`);
            }
            unFinishedTotal.push(pressedKey);
            const split = newResult.toString().replace('-', '–').split('');
            forDisplay = split;
            const changedNegativeSign = useRegularMinusSign(forDisplay);
            calculatorScreen.value = changedNegativeSign;
        }
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
    if (number === ')') { number = unFinishedTotal.slice(-2, -1)[0]; }
    forDisplay.push(number);
    const changedNegativeSign = useRegularMinusSign(forDisplay);
    calculatorScreen.value = changedNegativeSign;
}

//CALCULATE FUNCTION
function getTotal(unFinishedTotalArray) {
    const validInputs = useRegularMinusSign(unFinishedTotalArray);
    const total = eval(validInputs);
    return total;
}

//REPLACE ALT-MINUS WITH REGULAR MINUS FUNCTION
function useRegularMinusSign(toDisplay) {
    const combinedPressedKeys = toDisplay
        .join('')
        .replace(/[\–]/g, '-');
    return combinedPressedKeys;
}