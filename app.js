/*Note: I use guard clauses on some of the if else statement for oneliner code
that needs to run down before the nested if else statement ends*/

const calculatorScreen = document.querySelector('.input-value');
const toBeEqualledScreen = document.querySelector('.to-be-equalled');
const a = document.querySelectorAll('.ac');
const operator = /[\+]|[\-]|[\*]|[\/]/;
const number = /[\d]|[\.]/;
let unFinishedTotal = [];
let lastUsedOperator = 'none';
let forDisplay = [];
let percentageSwitch = 'off';
let endsWithOperator = '';
let lastNumber = '';
let currentResult = '';
let equalSignWasPressed = false;
let clickEventis = 'off';
let lastUsedOperatorIndex;

//KEYPRESS EVENT LISTENER
window.addEventListener('keypress', (event) => {
    const allowedInput = new RegExp(operator.source + '|[\\d]|[\\.]|[=]|[%]|[Enter]|[\\–]|[c]');
    const cannotPrevented = ['e', 'r', 't', 'n', 'E'];
    if (cannotPrevented.includes(event.key)) {
        event.preventDefault();
        return;
    }
    if (event.key.match(allowedInput)) {
        calculator(event);
    }
    event.preventDefault();
    calculatorScreen.focus();
    return;
});

//DELETE INPUT FUNCTION WITH EVENT LISTENER
calculatorScreen.addEventListener('input', (event) => {
    const screenValueLength = calculatorScreen.value.length;
    if (event.inputType === 'deleteContentBackward') {
        forDisplay.pop();
        lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
        if (unFinishedTotal.join('').includes('%')) {
            forDisplay = [];
            unFinishedTotal = [];
        } else if (unFinishedTotal.slice(-1)[0] === ')') {
            unFinishedTotal.splice(-2);
            unFinishedTotal.push(')');

            if (forDisplay[0] === '–' && forDisplay.length === 1) {
                unFinishedTotal.splice(lastUsedOperatorIndex + 1);
                forDisplay = [];
            }

        } else if (lastUsedOperatorIndex !== -1) {
            const available2Delete = unFinishedTotal.splice(lastUsedOperatorIndex + 1);
            available2Delete.pop();
            unFinishedTotal.push(...available2Delete);
        } else {
            unFinishedTotal.pop();
            if (forDisplay[0] === '–' && forDisplay.length === 1) {
                unFinishedTotal = [];
                forDisplay = [];
            }
        }
        mainScreenValue(useRegularMinusSign(forDisplay));
        toBeEqualledScreen.value = useRegularMinusSign(unFinishedTotal);
    }
    if (forDisplay.length === 0) {
        mainScreenValue('0');
    }
    decreaseFontSize(screenValueLength);
});

//ANYTHING THAT WILL BE CLICK, THE CALCULATOR MAIN SCREEN WILL GET FOCUS SO DELETE FUNCTION WOULD ALWAYS POINT OUT THE SCREEN
window.addEventListener('click', () => {
    calculatorScreen.focus();
});

//CLICK EVENT FUNCTION
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

//CALCULATOR FUNCTION
function calculator(event) {
    let pressedKey = event.key;
    let unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];

    if (clickEventis === 'on') { pressedKey = event; }

    //decimal is added on this condition
    if (number.test(pressedKey)) {
        if (equalSignWasPressed || percentageSwitch === 'on') {
            forDisplay = [];
            lastUsedOperator = 'none';
            endsWithOperator = '';
            equalSignWasPressed = false;
            percentageSwitch = 'off';
            unFinishedTotal = [];
            unFinishedTotalLastElement = '';
        } else if (operator.test(unFinishedTotalLastElement)) { forDisplay = []; }
        if (forDisplay.includes('.') && pressedKey === '.') { return; }
        if (unFinishedTotalLastElement === ')') {
            forDisplay.push(pressedKey);
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
            unFinishedTotal = [...forDisplay]
        } else if (operator.test(unFinishedTotalLastElement)) {
            unFinishedTotal.pop();
        } else if (forDisplay.length === 0) {
            return;
        } else if (equalSignWasPressed) {
            lastUsedOperator = 'none';
            endsWithOperator = '';
            equalSignWasPressed = false;
            unFinishedTotal = [...forDisplay]
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
        if (equalSignWasPressed) {
            forDisplay = forDisplay.join('').replace(/[\-]/, '–').split('');
            unFinishedTotal = [...forDisplay];
            lastUsedOperator = 'none';
            endsWithOperator = '';
            equalSignWasPressed = false;
        }
        //unFinishedTotal array will reset once apply a negative sign on a current result
        lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
        const unFinishedTotalLastNumber = unFinishedTotal.splice(lastUsedOperatorIndex + 1);
        const numberOfUsedOperator = unFinishedTotal.filter(usedOperator => operator.test(usedOperator)).length;
        if (numberOfUsedOperator > 1 && operator.test(unFinishedTotalLastElement)) {
            const currentResult = forDisplay.toString().replace('-', '–').split('');
            forDisplay = currentResult;
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
            unFinishedTotal = [...forDisplay];
        }
        const changedAltMinus = useRegularMinusSign(forDisplay);
        mainScreenValue(changedAltMinus);

        //percentage condition
    } else if (pressedKey === '%') {
        percentageSwitch = 'on';
        const currentNumber = calculatorScreen.value * 1;
        let percentageOf = currentNumber / 100;
        lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
        lastUsedOperator = 'none';
        endsWithOperator = '';
        equalSignWasPressed = false;

        if (operator.test(unFinishedTotalLastElement) || !operator.test(unFinishedTotal)) {
            forDisplay = [];
            display(percentageOf);
            forDisplay = forDisplay.join('').replace(/[\-]/, '–').split('');
            unFinishedTotal = ['% of ', currentNumber.toString().replace(/[\-]/, '–')];
        } else if (unFinishedTotal.includes('%')) {
            percentageOf = eval(forDisplay.join('').replace(/[\–]/, '-')) / 100;
            const currentResult = forDisplay;
            forDisplay = [];
            display(percentageOf);
            unFinishedTotal = ['% of ', ...currentResult];
        } else {
            const previousSet = unFinishedTotal
                .slice(0, lastUsedOperatorIndex)
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
            mainScreenValue(changedNegativeSign);
        }

        //get total with equal sign or enter key
    } else if (pressedKey === '=' || pressedKey === 'Enter') {
        equalSignWasPressed = true;
        if (operator.test(unFinishedTotalLastElement)) {
            unFinishedTotal.pop();
            endsWithOperator = 'yes';
            lastNumber = forDisplay.join('') * 1;
            const total = getTotal(unFinishedTotal).toString();
            forDisplay = [];
            display(total);
            unFinishedTotal = [];
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
                unFinishedTotal = [currentResult.toString(), lastUsedOperator, '(', lastNumberWithNegativeSign, ')'];
            } else {
                unFinishedTotal = [currentResult.toString(), lastUsedOperator, lastNumber.toString()];
            }
        } else if (lastUsedOperator === 'none' || percentageSwitch === 'on') {
            return;
        } else {
            endsWithOperator = 'no';
            lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
            lastNumber = eval(unFinishedTotal
                .slice(lastUsedOperatorIndex + 1)
                .join('')
                .replace(/[\–]/, '-'));
            const total = getTotal(unFinishedTotal).toString();
            forDisplay = [];
            display(total);
            unFinishedTotal = [];
            smallScreenDisplay(unFinishedTotal);
            decreaseFontSize(calculatorScreen.value.length);
            return;
        }
    } else if (pressedKey === 'c') {
        unFinishedTotal = [];
        lastUsedOperator = 'none';
        forDisplay = [];
        percentageSwitch = 'off';
        endsWithOperator = '';
        lastNumber = '';
        currentResult = '';
        equalSignWasPressed = false;
        mainScreenValue('0');
        a[0].style.opacity = '1';
        a[1].style.position = 'static';
    }

    function smallScreenDisplay(unFinishedTotal) {
        const operatorOutput = { '–': '-', '*': 'x', '/': '÷' };
        const pressedKeys = unFinishedTotal
            .join('')
            .replace(/[\–]|[\*]|[\/]/g, (values) => {
                return operatorOutput[values]
            });
        toBeEqualledScreen.value = pressedKeys;
    }
    smallScreenDisplay(unFinishedTotal);
    const inputLength = calculatorScreen.value.length;
    if (clickEventis === 'on') {
        clickEventis = 'off';
        decreaseFontSize(inputLength);
        return;
    }
    decreaseFontSize(inputLength);
    interactiveButton(event.key);
};

//DISPLAY FUNCTION
function display(input) {
    const forDisplayFirstIndex = forDisplay[0];
    const forDisplayLength = forDisplay.length;
    if (number.test(input)) {
        if (input === '.' && forDisplayLength === 0) {
            forDisplay.push(0);
            unFinishedTotal.push(0);
        } else if (forDisplayFirstIndex === '0' && forDisplayLength === 1) {
            if (input !== '.') {
                forDisplay.pop();
                unFinishedTotal.pop();
            }
        }
        forDisplay.push(input);
    }
    unFinishedTotal.push(input);
    const changedNegativeSign = useRegularMinusSign(forDisplay);
    mainScreenValue(changedNegativeSign);
}

//GET THE INDEX OF LAST USED OPERATOR IN UNFINISH TOTAL ARRAY
function getLastUsedOperatorIndex(array) {
    const unFinishedTotalLastOperatorIndex = unFinishedTotal.findLastIndex(usedOperator => operator.test(usedOperator));
    return unFinishedTotalLastOperatorIndex;
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

//FONT SIZE REDUCTION FUNCTION
let stopper = 0;
function decreaseFontSize(inputLength) {
    let currentFontSize = getComputedStyle(calculatorScreen).fontSize.replace('px', '') * 1;
    if (stopper === 2 && inputLength === 35) {
        forDisplay.pop();
        forDisplay.push('0');
        const greaterZero = forDisplay.findLastIndex(number => number !== '0');
        const zero = forDisplay.splice(greaterZero + 1);
        forDisplay.pop();
        forDisplay = [...forDisplay, ...zero];
        calculatorScreen.value = forDisplay.join('');
        if (forDisplay.every(item => item === '0')) {
            forDisplay = [];
            stopper = 0;
            mainScreenValue('0');
            calculatorScreen.style.fontSize = '2.5rem';
        }
        unFinishedTotal = [...forDisplay];
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

//RETURN CALCULATOR SCREEN VALUE
function mainScreenValue(displayed) {
    return calculatorScreen.value = displayed;
}