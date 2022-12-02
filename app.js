/*Note: I use guard clauses on some of the if else statement for oneliner code
that needs to run down before the nested if else statement ends*/

const calculatorScreen = document.querySelector('.input-value');
const toBeEqualledScreen = document.querySelector('.to-be-equalled');
const a = document.querySelectorAll('.ac');
const operator = /[\+]|[\-]|[\*]|[\/]/;
let unFinishedTotal = [''];
let lastUsedOperator = 'none';
let forDisplay = [];
let percentageSwitch = 'off';
let endsWithOperator = '';
let lastNumber = '';
let currentResult = '';
let lastPressed = '';
let clickEventis = 'off';

//KEYPRESS EVENT LISTENER
window.addEventListener('keypress', (event) => {
    calculator(event);
});

function calculator(event) {
    const number = /[\d]|[\.]/;
    let pressedKey = event.key;
    let unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
    
    if (clickEventis === 'on') { pressedKey = event; }

    //decimal is added on this condition
    if (number.test(pressedKey)) {
        if (lastPressed === '=' || percentageSwitch === 'on') {
            forDisplay = [];
            lastUsedOperator = 'none';
            endsWithOperator = '';
            lastPressed = '';
            percentageSwitch = 'off';
            unFinishedTotal = [''];
            unFinishedTotalLastElement = '';
        } else if (unFinishedTotalLastElement.match(operator)) { forDisplay = []; }
        if (forDisplay.includes('.') && pressedKey === '.') { return; }
        if (unFinishedTotalLastElement === ')') {
            unFinishedTotal.pop();
            unFinishedTotal.push(pressedKey);
            pressedKey = ')';
        }
        display(pressedKey);
        hideLetter(a);

        //operator keys will run inside this condition
    } else if (operator.test(pressedKey)) {
        if (percentageSwitch === 'on') {
            percentageSwitch = 'off';
            unFinishedTotal = [...forDisplay, '']
        } else if (unFinishedTotalLastElement.match(operator)) {
            unFinishedTotal.pop();
        } else if (forDisplay.length === 0) {
            return;
        } else if (lastPressed === '=') {
            lastUsedOperator = 'none';
            endsWithOperator = '';
            lastPressed = '';
            unFinishedTotal = [...forDisplay, '']
        } else if (lastUsedOperator !== 'none') {
            const total = getTotal(unFinishedTotal);
            forDisplay = [];
            display(total);
            unFinishedTotal.pop();
        }
        unFinishedTotal.push(pressedKey);
        lastUsedOperator = pressedKey;

        //for numbers that needed a negative sign (alt-minus)
    } else if (pressedKey === '–') {
        if (forDisplay.length === 0) { return; }
        if (lastPressed === '=') {
            forDisplay = forDisplay.join('').replace(/[\-]/, '–').split('');
            unFinishedTotal = [...forDisplay, ''];
            lastUsedOperator = 'none';
            endsWithOperator = '';
            lastPressed = '';
        }
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
            lastUsedOperator = 'none';
            unFinishedTotal = [...forDisplay, ''];
        }
        const changedAltMinus = useRegularMinusSign(forDisplay);
        calculatorScreen.value = changedAltMinus;

        //percentage condition
    } else if (pressedKey === '%') {
        percentageSwitch = 'on';
        const currentNumber = calculatorScreen.value * 1;
        let percentageOf = currentNumber / 100;
        const unFinishedTotalLastOperatorIndex = unFinishedTotal.findLastIndex(usedOperator => usedOperator.match(operator));
        lastUsedOperator = 'none';
        endsWithOperator = '';
        lastPressed = '';

        if (unFinishedTotalLastElement.match(operator) || !unFinishedTotal.join('').match(operator)) {
            forDisplay = [];
            display(percentageOf);
            forDisplay = forDisplay.join('').replace(/[\-]/, '–').split('');
            unFinishedTotal = ['', '% of ', currentNumber.toString().replace(/[\-]/, '–')];
        } else if (unFinishedTotal.includes('%')) {
            percentageOf = eval(forDisplay.join('').replace(/[\–]/, '-')) / 100;
            const currentResult = forDisplay;
            forDisplay = [];
            display(percentageOf);
            unFinishedTotal = ['% of ', ...currentResult, ''];
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

        //get total with equal sign or enter key
    } else if (pressedKey === '=' || pressedKey === 'Enter') {
        lastPressed = '=';
        if (unFinishedTotalLastElement.match(operator)) {
            unFinishedTotal.pop();
            endsWithOperator = 'yes';
            lastNumber = forDisplay.join('') * 1;
            const total = getTotal(unFinishedTotal).toString();
            forDisplay = [];
            display(total);
            unFinishedTotal = [''];
        } else if (endsWithOperator === 'yes' || endsWithOperator === 'no') {
            currentResult = [...forDisplay].join('') * 1;
            let newResult = '';
            if (lastUsedOperator === '+') {
                newResult = currentResult + lastNumber;
            } else if (lastUsedOperator === '-') {
                newResult = currentResult - lastNumber;
            } else if (lastUsedOperator === '*') {
                newResult = currentResult * lastNumber;
            } else if (lastUsedOperator === '/') {
                newResult = currentResult / lastNumber;
            }
            unFinishedTotal = [newResult];
            const total = getTotal(unFinishedTotal).toString();
            forDisplay = [];
            display(total);
            if (lastNumber < 0) {
                const lastNumberWithNegativeSign = lastNumber.toString().replace(/[\-]/, '–');
                unFinishedTotal = ['', currentResult.toString(), lastUsedOperator, '(', lastNumberWithNegativeSign, ')'];
            } else {
                unFinishedTotal = ['', currentResult.toString(), lastUsedOperator, lastNumber.toString()];
            }
        } else if (lastUsedOperator === 'none' || percentageSwitch === 'on') {
            return;
        } else {
            endsWithOperator = 'no';
            const unFinishedTotalLastOperatorIndex = unFinishedTotal.findLastIndex(usedOperator => usedOperator === lastUsedOperator);
            lastNumber = eval(unFinishedTotal
                .slice(unFinishedTotalLastOperatorIndex + 1)
                .join('')
                .replace(/[\–]/, '-'));
            const total = getTotal(unFinishedTotal).toString();
            forDisplay = [];
            display(total);
            unFinishedTotal = [''];
            display2(unFinishedTotal);
            decreaseFontSize(inputLength);
            return;
        }
    } else if (pressedKey === 'c') {
        unFinishedTotal = [''];
        lastUsedOperator = 'none';
        forDisplay = [];
        percentageSwitch = 'off';
        endsWithOperator = '';
        lastNumber = '';
        currentResult = '';
        lastPressed = '';
        calculatorScreen.value = '0';
        a[0].style.opacity = '1';
        a[1].style.position = 'static';
    }

    function display2(unFinishedTotal) {
        const operatorOutput = { '–': '-', '*': 'x', '/': '÷' };
        const pressedKeys = unFinishedTotal
            .join('')
            .replace(/[\–]|[\*]|[\/]/g, (values) => {
                return operatorOutput[values]
            });
        toBeEqualledScreen.value = pressedKeys;
    }
    display2(unFinishedTotal);

    if (clickEventis === 'on') {
        clickEventis = 'off';
        decreaseFontSize(inputLength);
        return;
    }
    const inputLength = calculatorScreen.value.length;
    decreaseFontSize(inputLength);
    interactiveButton(pressedKey);
};

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

//HIDE LETTER 'A' AND CENTERS LETTER 'C'
function hideLetter(a) {
    const a_Opacity = a[0].style.opacity;
    if (a_Opacity === '0') {
        return;
    } else {
        a[0].style.opacity = '0';
        a[1].style.cssText = 'position: absolute; transform: translateX(-16px);';
    }
}

//PRESSED EFFECT FUNCTION
function interactiveButton(value) {

    const pressedKey = {
        '0': 'zero',
        '1': 'one',
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five',
        '6': 'six',
        '7': 'seven',
        '8': 'eight',
        '9': 'nine',
        '.': 'decimal',
        '+': 'addition',
        '-': 'subtraction',
        '*': 'multiplication',
        '/': 'division',
        '=': 'equal',
        '%': 'percent',
        '–': 'plus-minus-sign',
        'Enter': 'equal',
        'c': 'reset'
    };

    const button = document.querySelector(`.${pressedKey[value]}`);
    button.classList.toggle('active');
    setTimeout(function () {
        button.classList.toggle('active');
    }, 50);
}

//click event
const buttons = document.querySelectorAll('button');
for (let i = 0; i < 20; i++) {
    buttons[i].addEventListener('click', (event) => {
        let target = event.target.textContent;

        switch (target) {
            case 'A':
            case 'C':
            case 'AC':
                target = 'c';
                break;
            case '+/-':
                target = '–';
                break;
            case 'x':
                target = '*';
                break;
            case '÷':
                target = '/';
        };

        clickEventis = 'on';
        calculator(target);
    });
};

//decrease font-size function
let stopper = 0;
function decreaseFontSize(inputLength) {
    let currentFontSize = getComputedStyle(calculatorScreen).fontSize.replace('px', '') * 1;
    if (stopper === 2) {
        forDisplay.pop();
        forDisplay.push('0');
        const greaterZero = forDisplay.findLastIndex(number => number !== '0');
        const zero = forDisplay.splice(greaterZero + 1);
        forDisplay.pop();
        forDisplay = [...forDisplay, ...zero];
        calculatorScreen.value = forDisplay.join('');
        if (forDisplay.every(item => item === '0')) {
            forDisplay = [];
            calculatorScreen.value = '0'
            calculatorScreen.style.fontSize = '2.5rem';
        }
        unFinishedTotal = ['', ...forDisplay];
        toBeEqualledScreen.value = unFinishedTotal.join('');
    } else if (inputLength > 11) {
        let difference = inputLength - 11;
        for (let i = 4; i < difference; i++) {
            difference--;
        }
        for (let j = 7; j < difference; j++) {
            difference--;
        }
        for (let k = 9; k < difference; k++) {
            difference -= 1;
            stopper++;
        }
        const fontSizeReduction = difference * 3;
        const newFontSize = 40 - fontSizeReduction;
        calculatorScreen.style.fontSize = `${newFontSize}px`;
    } else if (currentFontSize !== 40) {
        calculatorScreen.style.fontSize = '2.5rem';
    }
};