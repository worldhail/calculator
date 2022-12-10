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
let reservedLastNumber = '';
let currentTotal = '';
let equalSignWasPressed = false;
let clickEventis = 'off';
let lastUsedOperatorIndex;
let mainScreenLength;
let changedNegativeSign;
let unFinishedTotalLastElement;

//KEYUP EVENT FUNCTION
window.addEventListener('keyup', (event) => {
    const allowedKeys = new RegExp(operator.source + '|[\\d]|[\\.]|[=]|[%]|Enter|[\\–]|[cC]|Backspace');
    const cannotPrevented = 'CapsLock';
    if (event.key === cannotPrevented) {
        return;
    } else if (allowedKeys.test(event.key)) {
        calculator(event);
    }
});

//NEW
//RESET VARIABLES FUNCTION
function switchOffVariables(inputType) {
    if (inputType === 'number') {
        forDisplay = [];
        lastUsedOperator = 'none';
        endsWithOperator = '';
        equalSignWasPressed = false;
        percentageSwitch = 'off';
        unFinishedTotal = [];
        unFinishedTotalLastElement = '';
    } else if (inputType === 'operator') {
        if (percentageSwitch === 'on') {
            percentageSwitch = 'off';
        } else if (equalSignWasPressed) {
            lastUsedOperator = 'none';
            endsWithOperator = '';
            equalSignWasPressed = false;
        }
        unFinishedTotal = [...forDisplay]
    } else if (inputType === 'negativeSign') {
        if (equalSignWasPressed) {
            forDisplay = forDisplay
                .join('')
                .replace(/[\-]/, '–')
                .split('');
            unFinishedTotal = [...forDisplay];
            lastUsedOperator = 'none';
            endsWithOperator = '';
            equalSignWasPressed = false;
        } else if (percentageSwitch === 'on') {
            percentageSwitch = 'off';
            lastUsedOperator = 'none';
            unFinishedTotal = [...forDisplay];
        }
    }
}

//TAKE NUMBER FUNCTION
function takeNumber(input) {
    unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
    if (operator.test(unFinishedTotalLastElement)) { forDisplay = []; }

    const forDisplayFirstIndex = forDisplay[0];
    const forDisplayLength = forDisplay.length;
    if (input === '.' && forDisplayLength === 0) {
        forDisplay.push(0);
        unFinishedTotal.push(0);
    } else if (forDisplayFirstIndex === '0' && forDisplayLength === 1) {
        if (input !== '.') {
            forDisplay.pop();
            unFinishedTotal.pop();
        }
    } else if (unFinishedTotalLastElement === ')') {
        unFinishedTotal.pop();
        unFinishedTotal.push(input, ')');
        forDisplay.push(input);
        return;
    }
    forDisplay.push(input);
    unFinishedTotal.push(input);
}

//MAKE CURRENT DISPLAY AS NEW INPUT WHEN THE NUMBER IS FROM PREVIOUS OPERATION
function makePreviousTotalAsNewInput(displayed) {
    const splitNewInput = displayed
        .join('')
        .replace('-', '–') /* to recognize as negative sign and not an operator(minus) */
        .split('');
    forDisplay = splitNewInput;
    unFinishedTotal = [...forDisplay];
    lastUsedOperator = 'none';
}

//ADD NEGATIVE SIGN FUNCTION
function addNegativeSign(negativeSign) {
    lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
    const unFinishedTotalLastNumber = unFinishedTotal.splice(lastUsedOperatorIndex + 1);
    if (lastUsedOperator === 'none' || unFinishedTotalLastNumber.length === 0) {
        unFinishedTotal.unshift(negativeSign);
    } else {
        unFinishedTotalLastNumber.unshift('(–');
        unFinishedTotalLastNumber.push(')');
    }
    forDisplay.unshift(negativeSign);
    return unFinishedTotalLastNumber;
}

//REMOVE NEGATIVE SIGN FUNCTION
function removeNegativeSign() {
    lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
    const unFinishedTotalLastNumber = unFinishedTotal.splice(lastUsedOperatorIndex + 1);
    if (lastUsedOperator === 'none' || unFinishedTotalLastNumber.length === 0) {
        unFinishedTotal.shift();
    } else {
        unFinishedTotalLastNumber.pop();
    }
    forDisplay.shift();
    unFinishedTotalLastNumber.shift();
    return unFinishedTotalLastNumber;
}

//GET PERCENTAGE FUNCTION
function getPercentage(displayedNumber) {
    lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
    unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
    let percentage = displayedNumber / 100;

    //if the array unFinishedTotal last element is an operator or doesn't have any operator
    if (operator.test(unFinishedTotalLastElement) || !operator.test(unFinishedTotal)) {
        forDisplay = percentage
            .toString()
            .replace(/[\-]/, '–')
            .split('');
        unFinishedTotal = ['% of ', displayedNumber.toString().replace(/[\-]/, '–')];
    } else if (unFinishedTotal.includes('%')) {
        forDisplay = [...percentage.toString().replace(/[\-]/, '–')];
        unFinishedTotal = ['% of ', displayedNumber];
    } else {
        //get percentage with a number after an operator
        const previousSetBeforeLastOperator = unFinishedTotal.slice(0, lastUsedOperatorIndex);
        const previousSetTotal = getTotal(previousSetBeforeLastOperator);
        if (percentage < 0) { percentage = `(${percentage})`; }
        if (unFinishedTotalLastElement === ')') {
            unFinishedTotal.pop();
            unFinishedTotal.push('%', ')');
        } else {
            unFinishedTotal.push('%');
        }

        //percentage of currentDisplay multiplied by the previous set result,
        //then find the last operatorand to calculate the percentage from previous set.
        let getPercentageFromPreviousSet = eval(`${percentage} * ${previousSetTotal}`);
        if (lastUsedOperator === '+') {
            getPercentageFromPreviousSet = previousSetTotal + getPercentageFromPreviousSet;
        } else if (lastUsedOperator === '-') {
            getPercentageFromPreviousSet = previousSetTotal - getPercentageFromPreviousSet;
        } else if (lastUsedOperator === '/') {
            getPercentageFromPreviousSet = eval(`${previousSetTotal} / ${percentage}`);
        }
        forDisplay = getPercentageFromPreviousSet
            .toString()
            .replace('-', '–')
            .split('');
    }
}

//GET OVERALL TOTAL FUNCTION
function getOverallTotal(overallTotal) {
    //avoiding unFinishedTotalLastElement not to return true when it's value is like '2.5425123512e+13'(considered as last element)
    unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
    if (operator.test(unFinishedTotalLastElement) && !unFinishedTotalLastElement.includes('e')) {
        unFinishedTotal.pop();
        endsWithOperator = 'yes';
        reservedLastNumber = overallTotal;
        overallTotal = getTotal(unFinishedTotal);
        unFinishedTotal = [];
    } else if (endsWithOperator === 'yes' || endsWithOperator === 'no') {
        currentTotal = overallTotal;

        let newTotal = lastUsedOperator === '+' ? currentTotal + reservedLastNumber
            : lastUsedOperator === '-' ? currentTotal - reservedLastNumber
                : lastUsedOperator === '*' ? currentTotal * reservedLastNumber
                    : currentTotal / reservedLastNumber;

        unFinishedTotal = [newTotal];
        overallTotal = getTotal(unFinishedTotal);

        const lastNumberWithNegativeSign = reservedLastNumber.toString().replace(/[\-]/, '–');
        unFinishedTotal = reservedLastNumber < 0
            ? [currentTotal.toString(), lastUsedOperator, '(', lastNumberWithNegativeSign, ')']
            : [currentTotal.toString(), lastUsedOperator, reservedLastNumber.toString()];

    } else if (lastUsedOperator === 'none' || percentageSwitch === 'on') {
        unFinishedTotal = [];
    } else {
        endsWithOperator = 'no';
        lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
        reservedLastNumber = eval(unFinishedTotal
            .slice(lastUsedOperatorIndex + 1)
            .join('')
            .replace(/[\–]/, '-'));
        overallTotal = getTotal(unFinishedTotal)
        unFinishedTotal = [];
    }
    return overallTotal;
}
//NEW

//CALCULATOR FUNCTION
function calculator(event) {
    let pressedKey = event.key;
    const [negativeSign, percent, equal] = ['–', '%', '='];

    if (clickEventis === 'on') { pressedKey = event; }

    //All numbers goes here including decimal
    if (number.test(pressedKey)) {
        if (forDisplay.includes('.') && pressedKey === '.') { return; }
        if (equalSignWasPressed || percentageSwitch === 'on') { switchOffVariables('number'); }
        takeNumber(pressedKey);
        updateMainScreen(forDisplay);
        hideLetter(a);

        //operator keys will run inside this condition
    } else if (operator.test(pressedKey)) {
        unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
        if (forDisplay.length === 0) { return; }
        if (equalSignWasPressed || percentageSwitch === 'on') { switchOffVariables('operator'); }
        if (operator.test(unFinishedTotalLastElement)) { unFinishedTotal.pop(); }
        if (lastUsedOperator.match(operator)) {
            forDisplay = [getTotal(unFinishedTotal)];

            updateMainScreen(forDisplay);
        }
        unFinishedTotal.push(pressedKey);
        lastUsedOperator = pressedKey;

        //for numbers that needed a negative sign (alt-minus)
    } else if (pressedKey === negativeSign) {
        unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
        const operatorCount = unFinishedTotal.filter(usedOperator => operator.test(usedOperator)).length;
        if (equalSignWasPressed || percentageSwitch === 'on') { switchOffVariables('negativeSign') };

        //if current number on main screen is a total number from previous operation,
        //then it will be a new input if negative sign is removed/applied.
        if (operator.test(unFinishedTotalLastElement) && operatorCount > 1) {
            makePreviousTotalAsNewInput(forDisplay);
        }

        let newNumber = forDisplay[0] === negativeSign ? removeNegativeSign() : addNegativeSign(pressedKey);
        updateMainScreen(forDisplay);
        unFinishedTotal.push(...newNumber);

        //percentage condition
    } else if (pressedKey === percent) {
        const currentDisplayedNumber = calculatorScreen.value * 1;
        equalSignWasPressed = false;
        percentageSwitch = 'on';
        endsWithOperator = '';

        getPercentage(currentDisplayedNumber);
        updateMainScreen(forDisplay);

        //get total with equal sign or enter key
    } else if (pressedKey === equal || pressedKey === 'Enter') {
        equalSignWasPressed = true;
        const newOverallTotal = getOverallTotal(forDisplay
            .join('') * 1)
            .toString()
            .split('');
        forDisplay = newOverallTotal;
        updateMainScreen(newOverallTotal);
    } else if (pressedKey === 'c' || pressedKey === 'C') {
        unFinishedTotal = [];
        lastUsedOperator = 'none';
        forDisplay = [];
        percentageSwitch = 'off';
        endsWithOperator = '';
        reservedLastNumber = '';
        currentTotal = '';
        equalSignWasPressed = false;
        calculatorScreen.value = '0';
        a[0].style.opacity = '1';
        a[1].style.position = 'static';
    } else if (pressedKey === 'Backspace') {
        deleteLastInput(pressedKey);
        if (forDisplay.length === 0) {
            calculatorScreen.value = '0';
        } else {
            calculatorScreen.value = useRegularMinusSign(forDisplay);
        }
    }

    updateSubScreen(unFinishedTotal);
    mainScreenLength = calculatorScreen.value.length;
    if (clickEventis === 'on') {
        clickEventis = 'off';
        decreaseFontSize(mainScreenLength);
        return;
    }
    decreaseFontSize(mainScreenLength);
    interactTheButton(event.key);
};

//DELETE FUNCTION
function deleteLastInput(withDeleteKey) {
    let onDisplay = [...forDisplay];
    if (withDeleteKey === 'Backspace') {
        forDisplay.pop();
        lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
        if (equalSignWasPressed || percentageSwitch === 'on') {
            forDisplay = onDisplay;
        } else if (unFinishedTotal.slice(-1)[0] === ')') {
            unFinishedTotal.splice(-2);
            unFinishedTotal.push(')');

            if (forDisplay[0] === '–' && forDisplay.length === 1) {
                unFinishedTotal.splice(lastUsedOperatorIndex + 1);
                forDisplay = [];
            }

        } else if (lastUsedOperatorIndex !== -1) {
            const available2Delete = unFinishedTotal.splice(lastUsedOperatorIndex + 1);
            if (available2Delete.length === 0) {
                forDisplay = onDisplay;
            } else {
                available2Delete.pop();
                unFinishedTotal.push(...available2Delete);
            }

        } else {
            unFinishedTotal.pop();
            if (forDisplay[0] === '–' && forDisplay.length === 1) {
                unFinishedTotal = [];
                forDisplay = [];
            }
        }
    }
};

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
                break;
            case 'Del':
                target = 'Backspace';
                deleteLastInput(target);
                return;
        };
        clickEventis = 'on';
        calculator(target);
    });
};

//DISPLAY FUNCTION
function updateMainScreen(inputs) {
    changedNegativeSign = useRegularMinusSign(inputs);
    calculatorScreen.value = changedNegativeSign;
}

// DISPLAY FUNCTION FOR SMALL SCREEN WHICH TO BE TOTALLED
function updateSubScreen(array) {
    const operatorOutput = { '–': '-', '*': 'x', '/': '÷' };
    const pressedKeys = array
        .join('')
        .replace(/[\–]|[\*]|[\/]/g, (values) => {
            return operatorOutput[values]
        });
    toBeEqualledScreen.value = pressedKeys;
}

//GET THE INDEX OF LAST USED OPERATOR IN UNFINISH TOTAL ARRAY
function getLastUsedOperatorIndex(array) {
    //const unFinishedTotalLastOperatorIndex = array.findLastIndex(usedOperator => operator.test(usedOperator));
    const unFinishedTotalLastOperatorIndex = array.lastIndexOf(lastUsedOperator);
    return unFinishedTotalLastOperatorIndex;
}

//CALCULATE FUNCTION
function getTotal(unFinishedTotalArray) {
    const validInputs = useRegularMinusSign(unFinishedTotalArray);
    const total = eval(validInputs);
    return total;
}

//REPLACE ALT-MINUS WITH REGULAR MINUS FUNCTION
function useRegularMinusSign(whenNegativeIsPresent) {
    const combinedPressedKeys = whenNegativeIsPresent
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
function interactTheButton(value) {

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
        'c': 'reset',
        'C': 'reset',
        'Backspace': 'delete'
    };

    const button = document.querySelector(`.${pressedKey[value]}`);
    button.classList.toggle('active');
    setTimeout(function () {
        button.classList.toggle('active');
    }, 50);
}

//FONT SIZE REDUCTION FUNCTION
function decreaseFontSize(inputLength) {
    let currentFontSize = getComputedStyle(calculatorScreen).fontSize.replace('px', '') * 1;
    if (inputLength >= 35) {
        forDisplay.pop();
        forDisplay.push('0');
        //const greaterZero = forDisplay.findLastIndex(number => number !== '0');
        const greaterZeroIndex = forDisplay
            .slice()
            .reverse()
            .findIndex(number => number !== '0');
        const lastGreaterZero = forDisplay.splice(forDisplay.length - greaterZeroIndex);
        forDisplay.pop();
        forDisplay = [...forDisplay, ...lastGreaterZero];
        changedNegativeSign = useRegularMinusSign(forDisplay);
        calculatorScreen.value = changedNegativeSign;
        if (forDisplay.every(item => item === '0')) {
            forDisplay = [];
            calculatorScreen.value = '0';
            calculatorScreen.style.fontSize = '2.5rem';
        }
        unFinishedTotal = [...forDisplay];
        toBeEqualledScreen.value = unFinishedTotal.join('');
    } else if (inputLength > 11) {
        let difference = inputLength - 11;
        const breakPoint1 = 4;
        const breakPoint2 = 7;
        const breakPoint3 = 9;
        for (let i = breakPoint1; i < difference; i++) {
            difference--;
        }
        for (let j = breakPoint2; j < difference; j++) {
            difference--;
        }
        for (let k = breakPoint3; k < difference; k++) {
            difference -= 1;
        }
        const fontSizeReduction = difference * 3;
        const newFontSize = 40 - fontSizeReduction;
        calculatorScreen.style.fontSize = `${newFontSize}px`;
    } else if (currentFontSize !== 40) {
        calculatorScreen.style.fontSize = '2.5rem';
    }
};