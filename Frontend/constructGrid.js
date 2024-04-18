
var numOfWrongInputs = 0                                            // COUNTER
const sudokuGrid = document.querySelector(".sudoku-grid");          // SUDOKU GRID
const dbutns = document.querySelectorAll(".btn");                   // DIFFICULTY BUTTONS
const numPad = document.querySelectorAll(".num-pad")                // NUMPAD
const counter = document.querySelector(".mistakes-counter-change"); // MISTAKES COUNTER
const eraseButton = document.querySelector(".erase-cell");          // ERASE BUTTON
const clearButton = document.querySelector(".clear-cell");          // CLEAR BUTTON
const reset = document.querySelector(".reset-cell");                // RESET PUZZLE
const solve = document.querySelector(".solve-cell");                // BACKTRACK SOLVING 
const newGame = document.querySelector(".third-sub-grid");          // NEW GAME BUTTON


for(let row=0;row<9;row++){
    for(let col=0;col<9;col++){
        const cell = document.createElement("div");
        cell.setAttribute("id",`C${row}${col}`);
        cell.classList.add("sudoku-cell");
        cell.setAttribute('tabindex', (row*9)+col)
        sudokuGrid.appendChild(cell);
    }
}



