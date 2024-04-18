const sudokuGrid = document.querySelector(".sudoku-grid");
const dbutns = document.querySelectorAll(".btn");
for(let row=0;row<9;row++){
    for(let col=0;col<9;col++){
        const cell = document.createElement("div");
        cell.setAttribute("id",`C${row}${col}`);
        cell.classList.add("sudoku-cell");
        sudokuGrid.appendChild(cell);
    }
}
dbutns.forEach(button =>{
    button.addEventListener('click', function(){
        const getLevel = button.textContent;
        document.querySelector(".game-mode").classList.add("throw-model");
        Ready(getLevel);
        document.getElementById(getLevel).classList.add("active-lev");
    })
})



function Ready(x){
    fetch('https://raw.githubusercontent.com/akasharjun3123/Sudoku_Puzzles/main/akash.json').then(function(response){
    return response.json();
}).then(function(data){
    const puzzles = data;
    const diff = puzzles[x];
    const puzzleIndex = getIndex(diff);
    const unsolvedSudoku = diff[puzzleIndex].unsolved;
    const solvedSudoku = diff[puzzleIndex].solved;
    mainFunction(unsolvedSudoku, solvedSudoku);
    
}).catch(function(error){
    console.error("You are offline")
    console.error(error);
})
}





function getIndex(puzzles){
    return Math.floor(Math.random()*(puzzles.length-1) +1)
}

function converIdtoNumber(id){
    return parseInt(id.substring(1));
}

function highlighitingCells(row, col){

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



function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function solveFillingCells(sudokuCells,solvedSudoku){
    for(let i=0;i<sudokuCells.length;i++){
        let cell = sudokuCells[i];
        if(cell.classList.contains("empty-cell")){
            let rowNum = Math.floor(converIdtoNumber(cell.id)/10);
            let colNum = converIdtoNumber(cell.id)%10;
    
            cell.textContent = solvedSudoku[rowNum][colNum];
    
            const focusedCell = document.querySelector(".focused-sudoku-cell");
            focusedCell.classList.remove("focused-sudoku-cell");
            cell.classList.add("focused-sudoku-cell");
    
    
            highlighitingCells(rowNum,colNum);
    
            const sameNumHighCells = document.querySelectorAll(".same-num-high");
            sameNumHighCells.forEach(sameNumCell => {
                sameNumCell.classList.remove("same-num-high");
            });
    
            sudokuCells.forEach(eachCell =>{
                if(eachCell.textContent == cell.textContent){
                    eachCell.classList.add("same-num-high");
                }
            })
            cell.classList.add("fixed-cell-color");
            cell.classList.remove("empty-cell");
            await delay(80);
            
        }
    }
}


function isSafe(board, row, col, set){
    for(let i=0;i<9;i++) if(board[row][i] == set || board[i][col] == set) return false;
        let newRow = Math.floor(row/3)*3, newCol = Math.floor(col/3)*3;
        for(let i=newRow;i<newRow+3;i++)for(let j=newCol;j<newCol+3;j++) if(board[i][j] == set) return false;
        return true;
}

function sudokuSolver(sudokuCells, unsolvedSudoku, row, col) {
    return new Promise(async (resolve, reject) => {
      if (col == 9) {
        row++;
        col = 0;
      }
      if (row == 9) {
        resolve(true);
        return;
      }
      if (unsolvedSudoku[row][col] == 0) {
        for (let i = 1; i <= 9; i++) {
          if (isSafe(unsolvedSudoku, row, col, i)) {
            const cell = document.getElementById(`C${row}${col}`);
            unsolvedSudoku[row][col] = i;


            const focusedCell = document.querySelector(".focused-sudoku-cell");
            focusedCell.classList.remove("focused-sudoku-cell");
            cell.classList.add("focused-sudoku-cell");
            highlighitingCells(row,col);
            
            cell.textContent = unsolvedSudoku[row][col];
            //await delay(1);
            if (await sudokuSolver(sudokuCells, unsolvedSudoku, row, col + 1)) {
              resolve(true);
              return;
            }
            unsolvedSudoku[row][col] = 0;
            cell.textContent = "";
            const secfocusedCell = document.querySelector(".focused-sudoku-cell");
            secfocusedCell.classList.remove("focused-sudoku-cell");
            cell.classList.add("focused-sudoku-cell");
            highlighitingCells(row,col);
            //await delay(1);
          }
        }
      } else {
        if (await sudokuSolver(sudokuCells, unsolvedSudoku, row, col + 1)) {
          resolve(true);
          return;
        }
      }
      resolve(false);
    });
  }
  




function mainFunction(unsolvedSudoku , solvedSudoku){
    

    
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
    
    highlighitingCells(0,0);
    document.getElementById("C00").classList.add("focused-sudoku-cell");
    

   
    var numOfWrongInputs =0;
    const sudokuCells = document.querySelectorAll(".sudoku-cell");
    const numPad = document.querySelectorAll(".num-pad");


    numPad.forEach(pad => {
        pad.addEventListener("click", function () {
          const activeCell = document.querySelector(".focused-sudoku-cell");
          if (!activeCell.classList.contains("fixed-cell") && !activeCell.classList.contains("filled-cell")) {
            activeCell.textContent = pad.textContent;
            const activeId = converIdtoNumber(activeCell.id);
            if(parseInt(pad.textContent) !== solvedSudoku[Math.floor(activeId/10)][activeId%10]){
                activeCell.classList.add("wrong-input");
                numOfWrongInputs += 1;
                const counter = document.querySelector(".mistakes-counter");
                counter.innerHTML="Mistakes: "+numOfWrongInputs+"/5";
                if(numOfWrongInputs == 5){
                    counter.innerHTML="Mistakes: "+numOfWrongInputs+"/5";
                    location.reload();
                }
            }else if(parseInt(pad.textContent) === solvedSudoku[Math.floor(activeId/10)][activeId%10]){
                activeCell.classList.remove("empty-cell");
                activeCell.classList.add("filled-cell");
                activeCell.classList.add("fixed-cell-color");
                sudokuCells.forEach(cell =>{
                    if(pad.textContent === cell.textContent){
                        cell.classList.add("same-num-high");
                    }
                })
            }
          }
        });
      });




    const erase = document.querySelector(".erase-cell");
    erase.addEventListener("click", function(){
        const activeCell = document.querySelector(".focused-sudoku-cell");
        if(activeCell.classList.contains("wrong-input")){
            activeCell.textContent="";
            activeCell.classList.remove("wrong-input");
        }
    })

    

    const removeH = document.querySelector(".notes-cell");
    removeH.addEventListener("click", function(){
        sudokuCells.forEach(cell =>{
            if(cell.classList.contains("same-num-high")) cell.classList.remove("same-num-high");
            if(cell.classList.contains("rcg")) cell.classList.remove("rcg");
            if(cell.classList.contains("focused-sudoku-cell")) cell.classList.remove("focused-sudoku-cell");
            })
    })
    
    const solveC = document.querySelector(".solve-cell");
    solveC.addEventListener("click", function(){
    solveFillingCells(sudokuCells,solvedSudoku);
    })

    const backT = document.querySelector(".backT-cell");
    backT.addEventListener("click",function () {
        const copiedArray = unsolvedSudoku.map(row => [...row]);
        
        sudokuSolver(sudokuCells, copiedArray, 0,0,);

        const emptyCells = document.querySelectorAll(".empty-cell");
        emptyCells.forEach(cell=>{
            cell.classList.add("fixed-cell-color")
            cell.classList.remove("empty-cell")
        })
    })


    
    
    for(let i=0;i<sudokuCells.length;i++){

        sudokuCells[i].addEventListener('focus', function(event){
            const existedFocusedcell = document.querySelector(".focused-sudoku-cell");
            if(existedFocusedcell) existedFocusedcell.classList.remove("focused-sudoku-cell");
            this.classList.add("focused-sudoku-cell");


            const fixedNumber = parseInt(this.textContent); // getting the value of focused cell to highilight the same numbered cells

            const sameNumHighCells = document.querySelectorAll(".same-num-high");  // highlighting the cells with the same number as focused cell number
            sameNumHighCells.forEach(sameNumHighCell => sameNumHighCell.classList.remove("same-num-high"));
            if(!this.classList.contains("wrong-input")){
                if(!isNaN(fixedNumber)) sudokuCells.forEach(cell => {if(parseInt(cell.textContent) == fixedNumber) cell.classList.add("same-num-high")});
            }


            const idNum = converIdtoNumber(this.id);   // highlighting the row col and grid cells of the focused cell
            const prevHighCells = document.querySelectorAll(".rcg");
            prevHighCells.forEach(hCells =>{ hCells.classList.remove("rcg");})
            highlighitingCells(Math.floor(idNum/10),idNum%10);

     
        })

        

        sudokuCells[i].addEventListener("keydown", function(event){
            const pressedKey = event.key;
            const pressedKeyVal = parseInt(pressedKey); // getting the input key and its numeric value


            if(!this.classList.contains("filled-cell") && !this.classList.contains("fixed-cell")){
                if(pressedKey == "Backspace"){
                    const sameNumHighCells = document.querySelectorAll(".same-num-high");
                    sameNumHighCells.forEach(sameNumHighCell => sameNumHighCell.classList.remove("same-num-high"));
                    if(this.classList.contains("wrong-input")) this.classList.remove("wrong-input");
                    this.innerHTML = "";
                }
                
                else if(!isNaN(pressedKeyVal) && pressedKeyVal<=9 && pressedKeyVal>=1){
                    this.innerHTML = pressedKeyVal;
                    const idNum = converIdtoNumber(this.id);
                    if(pressedKeyVal != solvedSudoku[Math.floor(idNum/10)][idNum%10]){
                        this.classList.add("wrong-input");
                        numOfWrongInputs += 1;
                        const counter = document.querySelector(".mistakes-counter");
                        counter.innerHTML="Mistakes: "+numOfWrongInputs+"/5";
                        if(numOfWrongInputs == 5){
                            counter.innerHTML="Mistakes: "+numOfWrongInputs+"/5";
                            location.reload();
                        }
                    }
                    
                    else{
                        this.classList.remove("empty-cell");
                        this.classList.add("filled-cell");
                        sudokuCells.forEach(cell => {if(parseInt(cell.textContent) == pressedKeyVal) cell.classList.add("same-num-high");})
                        this.classList.add("fixed-cell-color");
                    }
                    
                }
                event.preventDefault();
            }


        })



    }
    
    const newGame = document.querySelector(".third-sub-grid");
    newGame.addEventListener("click", function(){
        location.reload();
    })
    
    

    
}








