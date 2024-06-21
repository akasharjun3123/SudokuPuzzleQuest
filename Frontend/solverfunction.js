const sudokuGrid = document.querySelector(".sudoku-grid");          // SUDOKU GRID
const numPad = document.querySelectorAll(".num-pad")                // NUMPAD
const eraseButton = document.querySelector(".erase-cell");          // ERASE BUTTON
const clearButton = document.querySelector(".clear-cell");          // CLEAR BUTTON
const reset = document.querySelector(".reset-cell");                // RESET PUZZLE
const solve = document.querySelector(".solve-cell");                // BACKTRACK SOLVING 
const newGame = document.querySelector(".third-sub-grid");          // NEW GAME BUTTON
const uploadImage = document.getElementById('uploadForm')           // IMAGE SUBMIT BUTTON

for(let row=0;row<9;row++){
    for(let col=0;col<9;col++){
        const cell = document.createElement("div");
        cell.setAttribute("id",`C${row}${col}`);
        cell.classList.add("sudoku-cell");
        cell.setAttribute('tabindex', (row*9)+col)
        sudokuGrid.appendChild(cell);
    }
}

const sudokuCells = document.querySelectorAll(".sudoku-cell")
let PreUnSolvedSudoku = [];
for (let i = 0; i < 9; i++) PreUnSolvedSudoku.push(Array(9).fill(0));

highlighitingCells(0,0)
uploadImage.addEventListener('submit', function(event){
    event.preventDefault();
    const apiUrl = 'https://predict-digits.onrender.com/predict';   // URL of the Flask API endpoint
    const formData = new FormData();                                // Create a new FormData object
    const imageInput = document.getElementById('imageInput');       // Get the selected image file from the input field
    const imageFile = imageInput.files[0];
    formData.append('image', imageFile);                            // Append the image file to the FormData object
    
    fetch(apiUrl, {                                                 // Make a POST request to the Flask API endpoint with the FormData
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(jsonData => {
        processPredictDigitJSON(jsonData, PreUnSolvedSudoku)  
    })
    .catch(error => {
        console.error('Error:', error);
    });
    })

//Primary Event Handling:
function mainProcess(unsolvedSudoku, originalPredictedSudoku){

    fillUnsolvedPuzzleData(unsolvedSudoku)
    highlighitingCells(0,0)
    sudokuCells.forEach(currCell=>{  
        currCell.addEventListener('focus', function(){
            let rowNum = getRowColNumber(currCell.id).row
            let colNum = getRowColNumber(currCell.id).col
            highlighitingCells(rowNum, colNum)
            sameNumberHighlighting(this.textContent)
        })
        currCell.addEventListener("keydown", function(event){
            
            if(event.key = "Backspace") manageBackSpace()
            const pressedKeyVal = parseInt(event.key)
            let rowNum = getRowColNumber(currCell.id).row
            let colNum = getRowColNumber(currCell.id).col
            fillPressedKey(unsolvedSudoku, currCell, pressedKeyVal, rowNum, colNum)
        })
    })

    numPad.forEach(key =>{
        key.addEventListener("click", function(){
            const currCell = document.querySelector(".focused-sudoku-cell")
            let rowNum = getRowColNumber(currCell.id).row
            let colNum = getRowColNumber(currCell.id).col
            fillPressedKey(unsolvedSudoku, currCell, key.textContent, rowNum, colNum)
        })

    })

    eraseButton.addEventListener("click", manageBackSpace)
    clearButton.addEventListener("click",removeHighlighting)
    reset.addEventListener("click", ()=> resetPuzzle(originalPredictedSudoku, unsolvedSudoku))
    solve.addEventListener("click", () => manageBacktrack(unsolvedSudoku))
    newGame.addEventListener("click", () => location.reload())
   
}


// Digit Extraction and Its Functions:

function processPredictDigitJSON(jsonData, PreUnSolvedSudoku){
    const originalPredictedSudoku = [];
    for (let i = 0; i < 9; i++) originalPredictedSudoku.push(jsonData.slice(i * 9, (i + 1) * 9));
    for(let i=0;i<9;i++) for(let j = 0;j<9;j++) PreUnSolvedSudoku[i][j] = originalPredictedSudoku[i][j]
    mainProcess(PreUnSolvedSudoku, originalPredictedSudoku)
    console.log("Detected Digits: ")
    console.log(PreUnSolvedSudoku);
}



// Solver and Backtracking Functions:

function manageBacktrack(unsolvedSudoku){
    const copiedArray = unsolvedSudoku.map(row => [...row]);
    let s = prompt('Enter the speed in ms: ');
    let countObj = { 
        count: 0,
        backTrackCount :0
     };
    sudokuSolver(sudokuCells, copiedArray, s, 0, 0, countObj).then(() => {
        console.log("Number of times function being called: " + countObj.count);  
    });
    const emptyCells = document.querySelectorAll(".empty-cell");
        emptyCells.forEach(cell=>{
            cell.classList.add("fixed-cell-color")
            cell.classList.remove("empty-cell")
        })
}


function sudokuSolver(sudokuCells, unsolvedSudoku, s, row, col, countObj) {
    return new Promise(async (resolve, reject) => {
      if (col == 9) {
        row++;
        col = 0;
      }
      if (row == 9) {
        resolve(true);
        return;
      }
      const cell = document.getElementById(`C${row}${col}`);
      if (unsolvedSudoku[row][col] == 0 ) {
        for (let i = 1; i <= 9; i++) {
          if (isSafe(unsolvedSudoku, row, col, i)) {
            unsolvedSudoku[row][col] = i;
            cell.textContent = unsolvedSudoku[row][col];
            if(s != 0){
                await delay(s);
                highlighitingCells(row,col);
                sameNumberHighlighting(i);
            }
            countObj.count += 1;
            if (await sudokuSolver(sudokuCells, unsolvedSudoku, s, row, col + 1, countObj)){
              resolve(true);
              return;
            }
            cell.textContent = "";
            unsolvedSudoku[row][col] = 0;
            countObj.count += 1;
            
            if(s!= 0){
                await delay(s/2);
                removeSameNumHigh()
                highlighitingCells(row,col);
            }
          }
        }
      } else {
        if (await sudokuSolver(sudokuCells, unsolvedSudoku, s, row, col + 1, countObj)) {
          resolve(true);
          return;
        }
      }
      resolve(false);
    });
}


function isSafe(board, row, col, set){
    for(let i=0;i<9;i++) if(board[row][i] == set || board[i][col] == set) return false;
        let newRow = Math.floor(row/3)*3, newCol = Math.floor(col/3)*3;
        for(let i=newRow;i<newRow+3;i++)for(let j=newCol;j<newCol+3;j++) if(board[i][j] == set) return false;
        return true;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Primary Utility and Pre Processing Functions:



function fillUnsolvedPuzzleData(unsolvedSudoku){
    for(let row=0;row<9;row++){
        for(let col=0;col<9;col++){
            const cell = document.getElementById(`C${row}${col}`);
            if(unsolvedSudoku[row][col] != 0){
                cell.classList.add("fixed-cell");
                cell.textContent = unsolvedSudoku[row][col];} 
            else {
                cell.classList.add("empty-cell");
                cell.textContent = ""; }
            cell.tabIndex = 0;
        }
    }
}

function fillPressedKey(unsolvedSudoku, currCell, pressedKeyVal, rowNum, colNum){
    if(!isNaN(pressedKeyVal)){ 
        currCell.innerHTML = pressedKeyVal      
        unsolvedSudoku[rowNum][colNum] = pressedKeyVal;
        currCell.classList.add("fixed-cell-color", "filled-cell")
        currCell.classList.remove("empty-cell");
        sameNumberHighlighting(pressedKeyVal)      
    } 
}

function editCells(PreUnSolvedSudoku, currCell, pressedKeyVal, rowNum, colNum){
    if(!isNaN(pressedKeyVal)){
        currCell.innerHTML = pressedKeyVal
        PreUnSolvedSudoku[rowNum][colNum] = pressedKeyVal;
        sameNumberHighlighting(pressedKeyVal)  
    }
}

function resetPuzzle(originalPredictedSudoku, unsolvedSudoku){
    removeSameNumHigh()
    sudokuCells.forEach(cell =>{
        if(cell.classList.contains("filled-cell")) cell.classList.remove("filled-cell")
        if(cell.classList.contains("fixed-cell-color")) cell.classList.remove("fixed-cell-color")
        if(cell.classList.contains("fixed-cell")) cell.classList.remove("fixed-cell")

        let rowNum = getRowColNumber(cell.id).row
        let colNum = getRowColNumber(cell.id).col
        let currVal = originalPredictedSudoku[rowNum][colNum]
        unsolvedSudoku[rowNum][colNum] = currVal
        if(currVal != 0) {
            cell.classList.add("fixed-cell")
            cell.textContent = currVal
        }
        else {
            cell.textContent = "";
            cell.classList.add("empty-cell")
        }

    })
    highlighitingCells(0,0)
}

// Utility Helper Functions:

function getIndex(puzzles){
    return Math.floor(Math.random()*(puzzles.length-1) +1)
}

function getRowColNumber(cellID){
    let rowNum = Math.floor(parseInt(cellID.substring(1))/10)
    let colNum = Math.floor(parseInt(cellID.substring(1))%10)
    return {
        "row": rowNum,
        "col": colNum
    }
}

function manageBackSpace(){
    const focusedCell = document.querySelector(".focused-sudoku-cell")
    focusedCell.innerHTML = "";
}




//Presentation of UI Functions:


function highlighitingCells(row, col){
    const prevCell = document.querySelector(".focused-sudoku-cell")
    if (prevCell !== null ) prevCell.classList.remove("focused-sudoku-cell")
    const currCell = document.getElementById(`C${row}${col}`);
    currCell.classList.add("focused-sudoku-cell")

    const highCells = document.querySelectorAll(".rcg");
    highCells.forEach(hcell => hcell.classList.remove("rcg"));


    for(let i=0;i<9;i++){
        const r = document.getElementById(`C${row}${i}`);
        const c = document.getElementById(`C${i}${col}`);
        if(!r.classList.contains("rcg")) r.classList.add("rcg");
        if(!c.classList.contains("rcg")) c.classList.add("rcg");
    }

    let sr = Math.floor(row/3)*3;
    let sc = Math.floor(col/3)*3;
    for(i=sr;i<sr+3;i++){
        for(j=sc;j<sc+3;j++){
            const g = document.getElementById(`C${i}${j}`);
            if(!g.classList.contains("rcg")) g.classList.add("rcg");
        }
    }
}

function sameNumberHighlighting(fixedNumber){
    const prevHighCells = document.querySelectorAll(".same-num-high");  // highlighting the cells with the same number as focused cell number
    prevHighCells.forEach(sameNumHighCell => sameNumHighCell.classList.remove("same-num-high"));
    if(!isNaN(fixedNumber)) sudokuCells.forEach(cell => {if(parseInt(cell.textContent) == fixedNumber) cell.classList.add("same-num-high")});
}

function removeHighlighting(){
    sudokuCells.forEach(cell =>{
        removeSameNumHigh()
        if(cell.classList.contains("rcg")) cell.classList.remove("rcg");
        if(cell.classList.contains("focused-sudoku-cell")) cell.classList.remove("focused-sudoku-cell");
        })
}

function removeSameNumHigh(){
    const cells = document.querySelectorAll(".same-num-high");
    cells.forEach(cell =>{
        cell.classList.remove("same-num-high")
    })
}

function setUnsolvedSudoku(PreUnSolvedSudoku){
    console.log("Modified Sudoku Digits")
    console.log(PreUnSolvedSudoku)
    fillUnsolvedPuzzleData(PreUnSolvedSudoku)
}

function printSudoku(sudoku) {
    for (let i = 0; i < sudoku.length; i++) {
        if (i > 0 && i % 3 === 0) {
            console.log("------+-------+------");
        }
        for (let j = 0; j < sudoku[i].length; j++) {
            if (j > 0 && j % 3 === 0) {
                process.stdout.write("| ");
            }
            process.stdout.write(sudoku[i][j] + " ");
        }
        console.log();
    }
}
