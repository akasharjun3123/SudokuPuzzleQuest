


// Initialization and Preprocessing:
getDifficultyLevel(dbutns)
const sudokuCells = document.querySelectorAll(".sudoku-cell")


//Primary Event Handling:
function mainFunction(unsolvedSudoku, originalUnsolvedSudoku, solvedSudoku){

    fillUnsolvedPuzzleData(unsolvedSudoku)
    highlighitingCells(0,0)
    sudokuCells.forEach(currCell=>{
        currCell.addEventListener("focus", function(event){
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
            fillPressedKey(unsolvedSudoku,solvedSudoku, currCell, pressedKeyVal, rowNum, colNum)
        })
    })

    numPad.forEach(key =>{
        key.addEventListener("click", function(){
            const currCell = document.querySelector(".focused-sudoku-cell")
            let rowNum = getRowColNumber(currCell.id).row
            let colNum = getRowColNumber(currCell.id).col
            fillPressedKey(unsolvedSudoku, solvedSudoku, currCell, key.textContent, rowNum, colNum)
        })

    })

    eraseButton.addEventListener("click", manageBackSpace)
    clearButton.addEventListener("click",removeHighlighting)
    reset.addEventListener("click", ()=> resetPuzzle(originalUnsolvedSudoku, unsolvedSudoku))
    solve.addEventListener("click", () => manageBacktrack(unsolvedSudoku, solvedSudoku))
    newGame.addEventListener("click", () => location.reload())
   
}


// JSON Extraction and Its Functions:

function getDifficultyLevel(dbutns){
    dbutns.forEach(button =>{
        button.addEventListener('click', function(){
            const getLevel = button.textContent;
            document.querySelector(".game-mode").classList.add("throw-model");
            document.getElementById(getLevel).classList.add("active-lev");
            getPuzzleDataMongo(getLevel)
        })
    })
}

async function getPuzzleDataMongo(getLevel){
    
    apiUrl = `https://sudoku-puzzle-quest-server.onrender.com/api/data/${getLevel}`
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        console.log("Conntected to MongoDB Succesfuly")
        return response.json();
    })
    .then(data => {
        sudokuId = data._id
        unsolvedSudoku =  data["unsolved"]
        solvedSudoku =  data["solved"]
        const copyArray = unsolvedSudoku.map(row => [...row])
        console.log("This current puzzle data is of "+getLevel+" Level with ID of "+sudokuId)
        console.log("Unsolved Sudoku: ")
        console.log(unsolvedSudoku)
        console.log("Solved Sudoku: ")
        console.log(solvedSudoku)
        mainFunction(copyArray, unsolvedSudoku, solvedSudoku)
    })
    .catch(error => {
        console.error('Error fetching puzzle data:', error);
    });
    
}

// Solver and Backtracking Functions:

function manageBacktrack(unsolvedSudoku){
    const copiedArray = unsolvedSudoku.map(row => [...row]);
    let s = prompt('Enter the speed in ms: ');
    let countObj = { 
        count: 0,
        backTrackCount :0
     };
    const loader = document.getElementById("loader");

    loader.classList.add("preloader");
    loader.classList.remove("preloader.hide");
    sudokuSolver(sudokuCells, copiedArray, s, 0, 0, countObj).then(() => {
        loader.classList.remove("preloader");
        loader.classList.add("preloader.hide");
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

function fillPressedKey(unsolvedSudoku, solvedSudoku, currCell, pressedKeyVal, rowNum, colNum){
    if(currCell.classList.contains("wrong-input")) currCell.classList.remove("wrong-input")
    if(!currCell.classList.contains("filled-cell") && !currCell.classList.contains("fixed-cell")){
        if(!isNaN(pressedKeyVal)){
            currCell.innerHTML = pressedKeyVal
            if(pressedKeyVal != solvedSudoku[rowNum][colNum]){
                currCell.classList.add("wrong-input");
                numOfWrongInputs += 1;
                counter.textContent="Mistakes: "+numOfWrongInputs+"/5";
                if(numOfWrongInputs == 5){
                    location.reload();
                }
            }else{
                unsolvedSudoku[rowNum][colNum] = pressedKeyVal;
                currCell.classList.add("fixed-cell-color", "filled-cell")
                currCell.classList.remove("empty-cell");
                sameNumberHighlighting(pressedKeyVal)
            }
        }
    }
}

function resetPuzzle(originalUnsolvedSudoku, unsolvedSudoku){
    numOfWrongInputs = 0;
    counter.innerHTML="Mistakes: "+numOfWrongInputs+"/5";
    removeSameNumHigh()
    sudokuCells.forEach(cell =>{
        if(cell.classList.contains("filled-cell")) cell.classList.remove("filled-cell")
        if(cell.classList.contains("fixed-cell-color")) cell.classList.remove("fixed-cell-color")
        if(cell.classList.contains("fixed-cell")) cell.classList.remove("fixed-cell")

        let rowNum = getRowColNumber(cell.id).row
        let colNum = getRowColNumber(cell.id).col
        let currVal = originalUnsolvedSudoku[rowNum][colNum]
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
    if(!focusedCell.classList.contains("filled-cell") && !focusedCell.classList.contains("fixed-cell")) focusedCell.innerHTML = "";
    if(focusedCell.classList.contains("wrong-input")) focusedCell.classList.remove("wrong-input")
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
