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
//TAKE NUMBER FUNCTION
function takeNumber(input) {
    unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
    if (equalSignWasPressed || percentageSwitch === 'on') {
        forDisplay = [];
        lastUsedOperator = 'none';
        endsWithOperator = '';
        equalSignWasPressed = false;
        percentageSwitch = 'off';
        unFinishedTotal = [];
        unFinishedTotalLastElement = '';
    }
    if (operator.test(unFinishedTotalLastElement)) { forDisplay = []; }
    if (unFinishedTotalLastElement === ')') {
        forDisplay.push(input);
        unFinishedTotal.pop();
        unFinishedTotal.push(input);
        return ')';
    }
    return input;
}

//OPERATOR FUNCTION
function calculate() {
    unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
    if (percentageSwitch === 'on') {
        percentageSwitch = 'off';
        unFinishedTotal = [...forDisplay]
    } else if (operator.test(unFinishedTotalLastElement)) {
        unFinishedTotal.pop();
    } else if (equalSignWasPressed) {
        lastUsedOperator = 'none';
        endsWithOperator = '';
        equalSignWasPressed = false;
        unFinishedTotal = [...forDisplay]
    } else if (lastUsedOperator !== 'none') {
        const total = getTotal(unFinishedTotal);
        forDisplay = [];
        return total;
    }
}

//NEGATIVE SIGN FUNCTION
function applyNegativeSign(negativeSign) {
    if (equalSignWasPressed) {
        forDisplay = forDisplay
            .join('')
            .replace(/[\-]/, '–')
            .split('');
        unFinishedTotal = [...forDisplay];
        lastUsedOperator = 'none';
        endsWithOperator = '';
        equalSignWasPressed = false;
    }
    //unFinishedTotal array will reset once apply a negative sign on a current result
    unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
    lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
    const unFinishedTotalLastNumber = unFinishedTotal.splice(lastUsedOperatorIndex + 1);
    const numberOfUsedOperator = unFinishedTotal.filter(usedOperator => operator.test(usedOperator)).length;
    if (numberOfUsedOperator > 1 && operator.test(unFinishedTotalLastElement)) {
        const currentResult = forDisplay
            .toString()
            .replace('-', '–')
            .split('');
        forDisplay = currentResult;
        unFinishedTotal = [...forDisplay];
        lastUsedOperator = 'none';
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
            unFinishedTotal.unshift(negativeSign);
        } else {
            unFinishedTotalLastNumber.unshift('(–');
            unFinishedTotalLastNumber.push(')');
        }
        forDisplay.unshift(negativeSign);
    }
    unFinishedTotal = unFinishedTotal.concat(unFinishedTotalLastNumber);

    if (percentageSwitch === 'on') {
        percentageSwitch = 'off';
        lastUsedOperator = 'none';
        unFinishedTotal = [...forDisplay];
    }
}
//NEW

//CALCULATOR FUNCTION
function calculator(event) {
    let pressedKey = event.key;

    if (clickEventis === 'on') { pressedKey = event; }

    //All numbers goes here including decimal
    if (number.test(pressedKey)) {
        if (forDisplay.includes('.') && pressedKey === '.') { return; }
        const newInput = takeNumber(pressedKey);
        updateMainScreen(newInput);
        hideLetter(a);

        //operator keys will run inside this condition
    } else if (operator.test(pressedKey)) {
        if (forDisplay.length === 0) {
            return;
        }

        const newTotal = calculate();
        if (newTotal !== undefined) {
            updateMainScreen(newTotal);
            unFinishedTotal.pop();
        }
        unFinishedTotal.push(pressedKey);
        lastUsedOperator = pressedKey;

        //for numbers that needed a negative sign (alt-minus)
    } else if (pressedKey === '–') {
        applyNegativeSign(pressedKey);
        updateMainScreen(forDisplay);

        //percentage condition
    } else if (pressedKey === '%') {
        percentageSwitch = 'on';
        const currentNumber = calculatorScreen.value * 1;
        let percentageOf = currentNumber / 100;
        lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
        endsWithOperator = '';
        equalSignWasPressed = false;

        //if the array unFinishedTotal last element is an operator or doesn't have any operator
        unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
        if (operator.test(unFinishedTotalLastElement) || !operator.test(unFinishedTotal)) {
            forDisplay = [];
            updateMainScreen(percentageOf);
            forDisplay = forDisplay.join('').replace(/[\-]/, '–').split('');
            unFinishedTotal = ['% of ', currentNumber.toString().replace(/[\-]/, '–')];
        } else if (unFinishedTotal.includes('%')) {
            percentageOf = eval(forDisplay.join('').replace(/[\–]/, '-')) / 100;
            const currentResult = forDisplay;
            forDisplay = [];
            updateMainScreen(percentageOf);
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
            changedNegativeSign = useRegularMinusSign(forDisplay);
            calculatorScreen.value = changedNegativeSign;
        }

        //get total with equal sign or enter key
    } else if (pressedKey === '=' || pressedKey === 'Enter') {
        equalSignWasPressed = true;

        //avoiding unFinishedTotalLastElement not to return true when it's value is like '2.5425123512e+13'
        unFinishedTotalLastElement = unFinishedTotal.slice(-1)[0];
        if (operator.test(unFinishedTotalLastElement) && !unFinishedTotalLastElement.includes('e')) {
            unFinishedTotal.pop();
            endsWithOperator = 'yes';
            lastNumber = forDisplay.join('') * 1;
            const total = getTotal(unFinishedTotal).toString();
            forDisplay = [];
            updateMainScreen(total);
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
            updateMainScreen(total);
            if (lastNumber < 0) {
                const lastNumberWithNegativeSign = lastNumber.toString().replace(/[\-]/, '–');
                unFinishedTotal = [currentResult.toString(), lastUsedOperator, '(', lastNumberWithNegativeSign, ')'];
            } else {
                unFinishedTotal = [currentResult.toString(), lastUsedOperator, lastNumber.toString()];
            }
        } else if (lastUsedOperator === 'none' || percentageSwitch === 'on') {
            unFinishedTotal = [];
        } else {
            endsWithOperator = 'no';
            lastUsedOperatorIndex = getLastUsedOperatorIndex(unFinishedTotal);
            lastNumber = eval(unFinishedTotal
                .slice(lastUsedOperatorIndex + 1)
                .join('')
                .replace(/[\–]/, '-'));
            const total = getTotal(unFinishedTotal).toString();
            forDisplay = [];
            updateMainScreen(total);
            unFinishedTotal = [];
        }
    } else if (pressedKey === 'c' || pressedKey === 'C') {
        unFinishedTotal = [];
        lastUsedOperator = 'none';
        forDisplay = [];
        percentageSwitch = 'off';
        endsWithOperator = '';
        lastNumber = '';
        currentResult = '';
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
function updateMainScreen(input) {
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
    if (typeof input !== 'object') {
        unFinishedTotal.push(input);
    }
    changedNegativeSign = useRegularMinusSign(forDisplay);
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