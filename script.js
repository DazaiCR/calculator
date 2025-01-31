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

document.addEventListener("keydown", (event) => {
    const validChars = /[0-9()+\-*/.]/;

    if(event.key.match(validChars)){
        input.textContent += event.key;
    }
    else if(event.key === "Backspace"){
        input.textContent = input.textContent.slice(0, -1);
    }
});

buttons.addEventListener("click", (event) => {
    let clicked = event.target;
    let expression = input.textContent;

    if (clicked.classList.contains("ce")){
        expression = "0";
    }
    else if(clicked.classList.contains("del")){
        expression = expression.slice(0, -1);
        if(!expression)
            expression = "0";    
    }
    else if(clicked.classList.contains("equal")){
        // ...
    }
    else if(clicked.classList.contains("dot")){
        expression = handleDot(expression);
    }
    else if(clicked.matches("button")){
        if(clicked.classList.contains("first") && expression === "0")
            expression = clicked.textContent;
        else
            expression += clicked.textContent;

        expression = handleOperators(expression);
    }

    input.textContent = expression;
});

function handleOperators(expression){
    // there were two operators before
    if(expression.at(-1) in precedence && expression.at(-2) in precedence && expression.at(-3) in precedence)
        expression = expression.slice(0, -1);
    // there was only one operator before
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

    for (let i = expression.length-1; i>=0; i--){
        let currChar = expression[i];
        if ((i === 0 || currChar in precedence) && (lastChar>='0' && lastChar<='9')){
            expression += ".";
            break;
        }
        else if (currChar === "."){
            break;
        }
    }
    return expression;
}