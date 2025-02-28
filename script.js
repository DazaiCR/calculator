let num1, operator, num2;

let operations = {
    "+": (a,b) => Number(a)+Number(b),
    "-": (a,b) => a-b,
    "×": (a,b) => a*b,
    "÷": (a,b) => a/b
}

const operate = function(num1, operator, num2){
    return operations[operator](num1, num2);
}

const input = document.querySelector(".input");
const buttons = document.querySelector(".buttons");

let precedence = {
    "+": 0,
    "-": 0,
    "×": 1,
    "÷": 1
}

let postfixPrecedence = {
    "(": 0,
    ")": 0,
    "+": 1,
    "-": 1,
    "×": 2,
    "÷": 2
}

document.addEventListener("keydown", (event) => {
    let clicked = event.key;
    let expression = input.textContent;

    const validChars = /[0-9()+\-*/]/;
    
    if(clicked === "Backspace"){
        expression = expression.slice(0, -1);
        if(!expression)
            expression = "0";
        input.textContent = expression;
    }
    else if(clicked === "Enter"){
        let result = handleEqual(expression);
        input.textContent = result.toString();
    }
    else if(clicked === "."){
        expression = handleDot(expression);
        input.textContent = expression;
    }
    else if(clicked.match(validChars)){
        if(clicked === "/")
            clicked = "÷";
        else if(clicked === "*")
            clicked = "×";

        // error message as previous result
        if (expression.endsWith("!")) {
            if(clicked.match(/[0-9(-]/))
                expression = clicked;
        }
        // expression == 0 && clicked could be first
        else if(clicked.match(/[0-9(-]/) && expression === "0")
            expression = clicked;
        // do not allow parentheses nor operators to come directly after a dot
        else if(!(expression.at(-1) === "." && clicked in postfixPrecedence)) {
            expression += clicked;
            expression = handleOperators(expression);
        }

        input.textContent = expression;
    }
});

buttons.addEventListener("click", (event) => {
    let clicked = event.target;
    let expression = input.textContent;

    if (clicked.classList.contains("ce")){
        expression = "0";
        input.textContent = expression;
    }
    else if(clicked.classList.contains("del")){
        expression = expression.slice(0, -1);
        if(!expression)
            expression = "0";
        input.textContent = expression;
    }
    else if(clicked.classList.contains("equal")){
        let result = handleEqual(expression);
        input.textContent = result.toString();
    }
    else if(clicked.classList.contains("dot")){
        expression = handleDot(expression);
        input.textContent = expression;
    }
    else if(clicked.matches("button")){
        // error message as previous result
        if (expression.endsWith("!")) {
            if(clicked.classList.contains("first"))
                expression = clicked.textContent;
        }
        // expression == 0 && clicked could be first
        else if (clicked.classList.contains("first") && expression === "0")
            expression = clicked.textContent;
        // do not allow parentheses nor operators to come directly after a dot
        else if (!(expression.at(-1) === "." && clicked.textContent in postfixPrecedence)){
            expression += clicked.textContent;
            expression = handleOperators(expression);
        }

        input.textContent = expression;
    }
});

function handleOperators(expression){
    // three operators
    if(expression.at(-1) in precedence && expression.at(-2) in precedence && expression.at(-3) in precedence)
        expression = expression.slice(0, -1);
    // two operators
    else if(expression.at(-1) in precedence && expression.at(-2) in precedence){
        let op1 = expression.at(-2);
        let op2 = expression.at(-1);

        if(op1 === expression.at(0) && op1 === "-")
            expression = expression.slice(0, -1);
        else if(op1 === op2)
            expression = expression.slice(0, -1);
        else if (precedence[op1] === precedence[op2])
            expression = expression.slice(0, -2) + expression.slice(-1);
        else if(op2 != "-")
            expression = expression.slice(0, -2) + expression.slice(-1);
    }
    return expression;
}

function handleDot(expression){
    let lastChar = expression.at(-1);

    if (!(lastChar>='0' && lastChar<='9')){
        return expression;
    }

    for (let i = expression.length-1; i>=0; i--){
        let currChar = expression[i];
        if (i === 0 || currChar in precedence){
            expression += ".";
            break;
        }
        else if (currChar === "."){
            break;
        }
    }
    return expression;
}

function convertToArray(expression){
    let unary = false;
    let r = 0, i = 0;
    const arr = [];

    while(r < expression.length) {
        let curr = expression[r];
        if(curr in postfixPrecedence && curr != "-"){
            arr[i] = curr;
            r++;
            i++;
        } 
        else if(curr == "-"){
            if(r == 0 || (r>=1 && (expression[r-1] === "×" || expression[r-1] === "÷" || expression[r-1] === "(")) ){
                unary = true;
                if(expression[r+1] === "("){
                    arr[i] = -1;
                    arr[i+1] = "×";
                    i += 2;
                    unary = false;
                }

            }
            else {
                arr[i] = curr;
                i++;
            }
            r++;
        }
        else {
            let number;
            if(unary){
                number = "-" + curr;
                unary = false;
            }
            else{   
                number = curr;
            }
            r++;

            while(r != expression.length && !(expression[r].match(/[()+\-×÷]/))){
                number += expression[r];
                r++;
            }

            number = Number(number);
            arr[i] = number;
            i++;
        }
    }

    if(unary)
        arr[arr.length] = "-";

    return arr;
}

function checkOperatorsNumber(arr){
    let operators = 0, numbers = 0;

    for(let i=0; i<arr.length; i++){
        if(Number(arr[i]) || arr[i] === 0)
            numbers++;
        else if(typeof arr[i] === 'string' && arr[i].match(/[+\-×÷]/))
            operators++;
    }

    return (operators == (numbers - 1));
}

function checkParentheses(arr){
    const parentheses = [];

    for(let i=0; i<arr.length; i++){
        if(arr[i] === "(")
            parentheses.push(arr[i]);
        else if(arr[i] === ")"){
            if (parentheses.length === 0)
                return false;
            parentheses.pop();
        }
    }

    return parentheses.length === 0 ? true : false;
}

function convertToPostfix(arr){
    const stack = [];
    const postfix = [];

    for(let i=0; i<arr.length; i++){
        if (arr[i] === "("){
            stack.push(arr[i]);
        }
        else if (arr[i] === ")"){
            while(true){
                let operator = stack.pop();
                if(operator === "(" || operator === undefined) {
                    break;
                }
                else {
                    postfix.push(operator);
                }
            }
        }
        else if (Number(arr[i]) || arr[i] === 0){
            postfix.push(arr[i]);
        }
        else{
            let currOperator = arr[i];
            let topOperator = stack.at(-1);

            if (stack.length === 0 || postfixPrecedence[currOperator] > postfixPrecedence[topOperator])
                stack.push(arr[i]);
            else {
                while(stack.length != 0 && (postfixPrecedence[currOperator] <= postfixPrecedence[topOperator] && topOperator != "(")){
                    let operator = stack.pop();
                    postfix.push(operator);
                    topOperator = stack.at(-1);
                }
                stack.push(arr[i]);
            }
        }
    }

    while (stack.length != 0){
        let operator = stack.pop();
        postfix.push(operator);
    }

    return postfix;
}

function evaluatePostfix(postfix){
    let stack = [];

    for(let i=0; i<postfix.length; i++){
        if(Number(postfix[i]) || postfix[i] === 0){
            stack.push(postfix[i]);
        }
        else {
            let num2 = stack.pop();
            let num1 = stack.pop();
            let result = operate(num1, postfix[i], num2);
            stack.push(result);
        }

    }

    return stack.at(0);
}

function handleEqual(expression){
    let arr = convertToArray(expression);

    let balancedInOperators = checkOperatorsNumber(arr);
    if(!balancedInOperators){
        return "Invalid expression!";
    }
    
    let balancedParentheses = checkParentheses(arr);
    if(!balancedParentheses){
        return "Unbalanced parentheses!";
    }

    let postfix = convertToPostfix(arr);
    let result = evaluatePostfix(postfix);
    
    return result;
}