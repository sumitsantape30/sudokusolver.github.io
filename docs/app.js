class cellObject {
  constructor(row, position) {
    this.div = "";
    this.selected = false;
    //as with the rules of sudoku you are able to note a cell before confirming an answer
    this.number = 0;
    this.noteNumber = 0;
    this.final = false;
    this.row = row;
    this.position = position;
  }
  select() {
    this.selected = true;
    this.div.classList.add("selected");
  }
  deselect() {
    this.selected = false;
    this.div.classList.remove("selected");
  }
}

class SudokuBoard {
  constructor(values) {
    this.boardElement = document.querySelector(".board");
    this.crosses = document.querySelectorAll(".cross");
    this.failPopUp = document.querySelector(".fail-pop-up-container");
    //values board is an two dimensional array with the correct values for each cell in the board
    let valuesBoard = [];
    values.forEach((row, index) => {
      valuesBoard.push([]);
      row.forEach((cell) => {
        valuesBoard[index].push(cell);
      });
    });
    this.values = valuesBoard;
    this.mistakeTally = 0;
    this.board = [];
    this.rows;
    this.selectedCell;
    this.generateBoard();
    //this.solveValues() fills this.values
    this.solveValues();
    this.running = false;
    this.maxMistakes = false;
    this.speed = Math.floor(
      1000 / document.querySelector(".speed-slider").value
    );
  }

  //The following functions are used for adjusting the visual aspects of the program, like creating the board

  //removes the croses on the mistake tally
  removeCrosses() {
    this.crosses.forEach((cross) => {
      cross.style.display = "none";
    });
    this.mistakeTally = 0;
  }

  //adds a cross to the mistakes tally on the control panel
  addCross() {
    if (this.mistakeTally < 3) {
      this.crosses[this.mistakeTally].style.display = "inline";
      this.mistakeTally += 1;
    }
    //this if statement checks whether the user has reached the max ammount of mistakes
    //and if they have it pops up the game over panel
    if ((this.maxMistakes === false) & (this.mistakeTally > 2)) {
      this.maxMistakes = true;
      this.failPopUp.classList.add("active");
      this.failPopUp.children[0].children[0].addEventListener("click", () => {
        this.failPopUp.classList.remove("active");
      });
      this.failPopUp.children[0].children[4].addEventListener("click", () => {
        this.failPopUp.classList.remove("active");
        this.animationController();
      });
    }
  }

  //generate board creates the grid of cells on the screen
  generateBoard() {
    //this function is called every time the user 'generates a new board'
    //this means that the selected cell needs to be reset and any mistake crosses
    //neeed to be removed
    this.selectedCell = [];
    this.removeCrosses();
    //the first time the program runs there will be no row divs in the html documet's board
    //section however after this the rows will be here, cells will just be added and removed from
    //them when a new board is generated
    if (typeof this.rows === "undefined") {
      this.createRows();
    }
    //this for loop adds 9 cell divs to each div row as well as adding
    //9 cell objects to each array of the this.board array's 9 arrays
    this.rows.forEach((row, index) => {
      while (row.firstChild) {
        row.removeChild(row.lastChild);
      }
      for (let i = 0; i < 9; i++) {
        let cell = new cellObject(index, i);
        cell.div = document.createElement("div");
        cell.div.classList.add("cell");
        row.appendChild(cell.div);
        this.board[index].push(cell);
        //this event listener just makes sure every cell can be selected
        cell.div.addEventListener("click", (event) => {
          if (this.running === false) {
            this.board.forEach((row) => {
              row.forEach((cell) => {
                if (cell.div === event.target) {
                  cell.select();
                  this.selectedCell = cell;
                } else {
                  cell.deselect();
                }
              });
            });
          }
        });
      }
    });
    //load board simply fills each cell with a number, if it is ment to have one
    this.loadBoard();
  }

  //create row divs in the board container
  createRows() {
    for (let i = 0; i < 9; i++) {
      let row = document.createElement("div");
      row.classList.add("row");
      row.classList.add(`row${i}`);
      this.boardElement.appendChild(row);
      this.board.push([]);
    }
    this.rows = document.querySelectorAll(".row");
  }

  //load board puts all the numbers in the board on screen before a user starts playing
  loadBoard() {
    this.values.forEach((row, rowIndex) => {
      row.forEach((number, numberIndex) => {
        if (number != 0) {
          let cell = this.board[rowIndex][numberIndex];
          cell.number = number;
          cell.final = true;
          this.addText(number, "h2", cell);
        }
      });
    });
  }

  //delete board removes all of the divs from the board containter, this allows a new board to be generated there
  deleteBoard() {
    while (this.boardElement.firstChild) {
      this.boardElement.removeChild(this.boardElement.lastChild);
    }
    this.board = [];
  }

  //the following functions are used to manage user inputs

  //keypress manager tests whether a number was pressed or the enter key and then runs the
  //corroborating function
  keyPressManager(code) {
    for (let i = 49; i < 58; i++) {
      if (i === code) {
        this.numberPressed(i - 48);
      }
    }
    if (code === 13) {
      this.enterPressed();
    }
  }

  //number pressed updates the note number in the selected cell
  numberPressed(number) {
    let numberText = document.createElement("h3");
    numberText.innerText = number;
    if (
      (typeof this.selectedCell != "undefined") &
      (this.selectedCell.final === false) &
      (this.maxMistakes === false)
    ) {
      this.selectedCell.noteNumber = number;
      while (this.selectedCell.div.firstChild) {
        this.selectedCell.div.removeChild(this.selectedCell.div.lastChild);
      }
      this.selectedCell.div.appendChild(numberText);
    }
  }

  enterPressed() {
    if (typeof this.selectedCell != "undefined") {
      if (
        (this.selectedCell.noteNumber != 0) &
        (this.selectedCell.final === false) &
        (this.maxMistakes === false)
      ) {
        while (this.selectedCell.div.firstChild) {
          this.selectedCell.div.removeChild(this.selectedCell.div.lastChild);
        }
        let numberText = document.createElement("h2");
        numberText.innerText = this.selectedCell.noteNumber;
        //prettier-ignore
        if (this.selectedCell.noteNumber === this.values[this.selectedCell.row][this.selectedCell.position]) {
          this.selectedCell.final = true;
          this.selectedCell.number = this.selectedCell.noteNumber;
        } else {
          numberText.style.color = "red";
          this.addCross();
        }
        this.selectedCell.div.appendChild(numberText);
      }
    }
  }

  //The following fucntions are used to manage the animation for solving the sudoku board

  //Only used in simple casses of adding text to cells for example loading the board and the algorithm animation
  //It uses polymorphism so that It can be used in more situations
  addText(number, type, cell = this.selectedCell) {
    let text;
    if (type === "h2") {
      text = document.createElement("h2");
    } else {
      text = document.createElement("h3");
    }
    text.innerText = number;
    cell.div.appendChild(text);
  }

  //this function prepares the board for the solving animation and then calls the animations
  //It needs to for example clear the notes out of all of the cells and any numbers that were
  //enetered incorrectly
  async animationController() {
    this.running = true;
    if (this.findEmptyCell() != "completed") {
      this.board.forEach((row) => {
        row.forEach((cell) => {
          if ((cell.final === false) & (cell.noteNumber > 0)) {
            this.selectedCell.deselect();
            cell.noteNumber = 0;
            while (cell.div.firstChild) {
              cell.div.removeChild(cell.div.lastChild);
            }
          }
        });
      });
      //this function will run untill the board is solved
      await this.solveBoardAnimated();
      await this.postSolveAnimation();
    }
    this.running = false;
  }

  //this function is an animated version of the recursive backtracking algorithm to show users how the algorithm works
  //it is probably the 5th or 6th revision, making the algorithm work was not too difficult however coming from python
  //I assumed I would be able to use a function like time.sleep(xseconds) however I learned that javascript does not handle
  //code in this manor, learning how to effectively use async functions to create this animation was difficult but really rewarding.
  async solveBoardAnimated() {
    //empty cell will find the next cell in the grid without a number, if there are no more numbers cells then the algorithm is finished
    let emptyCell = this.findEmptyCell();
    if (emptyCell === "completed") {
      return true;
    } else {
      this.selectedCell = emptyCell;
      this.selectedCell.div.classList.remove("good");
      await pause(this.speed);
    }
    //this for loop checks each number from 1 to 9 to see if it will work in the selected cell, according to sodoku rules
    for (let i = 1; i < 10; i++) {
      this.selectedCell.noteNumber = i;
      this.selectedCell.number = i;
      this.selectedCell.div.innerText = "";
      this.addText(i, "h2");
      if (this.safePlacement()) {
        //if the number fits then this function is called again, and numbers are tried in the next cell on the board
        this.selectedCell.div.classList.add("good");
        let result = await this.solveBoardAnimated();
        //if the result === true then board has been solved, it means that either all of the cells infront of the current cells
        //have been filled in or that there is no more cells to be filled
        if (result) {
          this.selectedCell.noteNumber = i;
          this.selectedCell.number = i;
          this.selectedCell.final = true;
          return true;
        } else {
          //if it is false then this.selectedcell is adjusted so that the correct cell is selected, this is necessary because the
          //cell currently selected is the next cell in the grid not the current one.
          this.selectedCell.div.innerHTML = "";
          while (true) {
            let pos = this.selectedCell.position;
            let row = this.selectedCell.row;
            if (pos != 0) {
              this.selectedCell = this.board[row][pos - 1];
            } else if (row != 0) {
              this.selectedCell = this.board[row - 1][8];
            }
            if (this.selectedCell.final != true) {
              break;
            }
          }
        }
      }
      //if the number is not valid in that position then there is a short pause for the animation and the next number is tried
      this.selectedCell.div.classList.remove("good");
      this.selectedCell.div.classList.add("bad");
      await pause(this.speed);
      this.selectedCell.number = 0;
      this.selectedCell.noteNumber = 0;
      this.selectedCell.div.classList.remove("bad");
    }
    //if all numbers are checked and none work then one of the previouse cells have the wrong value and so this function will return false
    return false;
  }

  //find empty cell finds the next cell without a number in it
  findEmptyCell() {
    for (let row = 0; row < 9; row++) {
      for (let pos = 0; pos < 9; pos++) {
        if (
          (this.board[row][pos].noteNumber === 0) &
          (row > this.selectedCell.row ||
            pos > this.selectedCell.position ||
            (row === 0) & (pos === 0)) &
          (this.board[row][pos].final === false)
        ) {
          return this.board[row][pos];
        }
      }
    }
    //if there are no empty cells the the board is sovled
    return "completed";
  }

  //safe placement checks according to the rules of sudoku if a number is allowed to be plaecd in a certain place, it used by the solving animation to check a cell's validity
  safePlacement() {
    //check columns and rows
    for (let i = 0; i < 9; i++) {
      //column check:
      if (
        //prettier-ignore
        (this.board[i][this.selectedCell.position].number === this.selectedCell.noteNumber) & 
          (this.board[i][this.selectedCell.position] != this.selectedCell) &
          (this.board[i][this.selectedCell.position].number != 0)
      ) {
        return false;
      }
      //row check:
      if (
        //prettier-ignore
        (this.board[this.selectedCell.row][i].number === this.selectedCell.noteNumber) & 
          (this.board[this.selectedCell.row][i] != this.selectedCell) &
          (this.board[this.selectedCell.row][i].number != 0)
      ) {
        return false;
      }
    }
    //the following code checks if there is any duplicates in the same box (its 3x3 grid)
    let selectedBoxX = Math.floor(this.selectedCell.position / 3);
    let selectedBoxY = Math.floor(this.selectedCell.row / 3);
    for (let row = selectedBoxY * 3; row < selectedBoxY * 3 + 3; row++) {
      //prettier-ignore
      for (let column = selectedBoxX * 3; column < selectedBoxX * 3 + 3; column++){
            if (this.board[row][column].number === this.selectedCell.noteNumber & this.board[row][column] != this.selectedCell){
                return false
            }
        }
    }
    return true;
  }

  //this function removes the green highlight from all of the squares once the board has been sovled
  async postSolveAnimation() {
    for (let row = 0; row < 9; row++) {
      for (let pos = 0; pos < 9; pos++) {
        if (this.board[row][pos].div.classList.contains("good")) {
          this.board[row][pos].div.style.transition = "all 1s ease";
          this.board[row][pos].div.style.background = "white";
          await pause(10);
          this.board[row][pos].div.classList.remove("good");
        }
      }
    }
    this.board.forEach((row) => {
      row.forEach((cell) => {
        cell.div.style.transition = "all 0s ease";
      });
    });
    await pause(100);
  }

  //the following functions are used to get a solved version of the board, except without an animation
  //they are very similar to the functions above, they are just far simpler stripped down versions that
  //are used to fill the this.values array

  //finds the next 0 in the values array
  findEmptyFromValue() {
    for (let row = 0; row < 9; row++) {
      for (let pos = 0; pos < 9; pos++) {
        if (this.values[row][pos] === 0) {
          return [row, pos];
        }
      }
    }
    return "none";
  }

  //recursive backtracking algorithm to solve the values array, the solved board is used to check user's imputs
  solveValues() {
    let row;
    let column;
    let emptyPosition = this.findEmptyFromValue();
    if (emptyPosition === "none") {
      return true;
    } else {
      row = emptyPosition[0];
      column = emptyPosition[1];
    }
    for (let i = 1; i < 10; i++) {
      if (this.safePlacementValue(i, [row, column])) {
        this.values[row][column] = i;
        if (this.solveValues()) {
          return true;
        }
        this.values[row][column] = 0;
      }
    }
    return false;
  }

  //checks if the value given in the position given is allowed with the sudoku rules
  safePlacementValue(value, position) {
    for (let i = 0; i < 9; i++) {
      if ((this.values[position[0]][i] === value) & (position[1] != i)) {
        return false;
      }
      if ((this.values[i][position[1]] === value) & (position[0] != i)) {
        return false;
      }
    }
    let xPos = Math.floor(position[0] / 3);
    let yPos = Math.floor(position[1] / 3);
    for (let y = yPos * 3; y < yPos * 3 + 3; y++) {
      for (let x = xPos * 3; x < xPos * 3 + 3; x++) {
        if ((this.values[x][y] === value) & ((x, y) != position)) {
          return false;
        }
      }
    }
    return true;
  }
}

//this is where I store board layouts:
const board1 = [
  [0, 3, 2, 9, 4, 0, 6, 0, 0],
  [5, 9, 0, 0, 0, 6, 7, 0, 0],
  [7, 0, 4, 0, 5, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 6, 0],
  [0, 0, 5, 7, 6, 0, 3, 4, 2],
  [6, 0, 3, 4, 0, 0, 0, 9, 0],
  [2, 0, 0, 1, 8, 9, 0, 7, 0],
  [0, 0, 9, 0, 0, 0, 8, 5, 1],
  [8, 0, 0, 0, 3, 4, 0, 2, 0],
];
const board2 = [
  [0, 1, 0, 0, 3, 4, 0, 0, 0],
  [0, 0, 0, 0, 7, 0, 0, 2, 0],
  [3, 4, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 8, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 5, 6, 0],
  [0, 0, 0, 0, 4, 9, 0, 0, 0],
  [8, 0, 0, 7, 0, 0, 0, 0, 9],
  [0, 0, 0, 9, 0, 5, 1, 0, 7],
  [9, 0, 3, 0, 0, 0, 0, 0, 0],
];
const board3 = [
  [, , , , , , , ,],
  [, , , , , , , ,],
  [, , , , , , , ,],
  [, , , , , , , ,],
  [, , , , , , , ,],
  [, , , , , , , ,],
  [, , , , , , , ,],
  [, , , , , , , ,],
  [, , , , , , , ,],
];

//global vairiables:
const boards = [board1, board2];
const generateBtn = document.querySelector(".generate");
const solveBtn = document.querySelector(".solve");
const checkBtn = document.querySelector(".checkAnswers");
const speedSlider = document.querySelector(".speed-slider");
let boardObject = new SudokuBoard(board1);
let boardIndex = 0;

//eventListeners
generateBtn.addEventListener("click", () => {
  //when a user clicks generate board it is first checked that an animation is not already running it then creates a new board
  //using the next board in the boards array which is full of layouts
  if (boardObject.running === false) {
    boardObject.deleteBoard();
    if (boardIndex === boards.length - 1) {
      boardIndex = 0;
    } else {
      boardIndex += 1;
    }
    boardObject = new SudokuBoard(boards[boardIndex]);
  } else {
    alert(
      "Sorry you can not perform this function while the solving algorithm is running"
    );
  }
});

//this function checks for users subiting answers or notes
document.onkeypress = function (event) {
  boardObject.keyPressManager(event.keyCode);
};

//this funtion triggers the solve animation when the solve button is pressed
solveBtn.addEventListener("click", () => {
  if (boardObject.running === false) {
    boardObject.animationController();
  } else {
    alert(
      "Sorry you can not perform this function while the solving algorithm is running"
    );
  }
});

//the speeed slider alows the user to change the speed of the animation, this is useful becuase the animation takes a lot of calculations
//so if you want to see how it works, and see it finish a board you have to adjust the speed live
speedSlider.addEventListener("input", function (event) {
  changeSpeed(event);
});

//function to pause the async functions
function pause(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//function to update the speed text for the speed slider
function changeSpeed(event) {
  //get the temp number from the document
  const tempoText = document.querySelector(".speed-number");
  let speed = event.target.value;
  tempoText.innerText = speed;
  boardObject.speed = Math.floor(1000 / speed);
}
