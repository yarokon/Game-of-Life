window.onload = () => {
  const canvas = document.getElementById('game');

  const screen = {
    w: window.innerWidth,
    h: window.innerHeight
  }

  const gridSettings = {
    percent: 15,
    step: 12,
    lineWidth: 2,
    lineColor: '#9e9e9e',
    get xN() {
      return (screen.w - this.borderWidth * 2 + this.lineWidth) / this.step ^ 0
    },
    get yN() {
      return (screen.h - this.borderWidth * 2 + this.lineWidth) / this.step ^ 0
    },
    get pixel() {
      return this.step - this.lineWidth;
    },
    get boardWidth() {
      return this.step * this.xN - this.lineWidth;
    },
    get boardHeight() {
      return this.step * this.yN - this.lineWidth;
    },
    get borderWidth() {
      return parseInt( getComputedStyle(canvas).borderWidth );
    }
  };

  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    static toId (point) {
      return point.x + point.y * gridSettings.xN;
    }

    static toXY(id) {
      return new Point( id % gridSettings.xN, Math.floor(id / gridSettings.xN) )
    }
  }

  class Cell {
    constructor(id) {
      const xy = Point.toXY(id);
      this.id = id;
      this.x = xy.x;
      this.y = xy.y;

      state[xy.y][xy.x] = this;
      this._alive = false;
    }

    isAlive() {
      return this._alive;
    }

    drawCell() {
      const { pixel, step } = gridSettings;
      ctx.fillStyle = 'black';
      ctx.fillRect(this.x * step, this.y * step, pixel, pixel);

      this._alive = true;
    }

    eraseCell() {
      const { pixel, step } = gridSettings;
      ctx.fillStyle = '#f5fa73';
      ctx.fillRect(this.x * step, this.y * step, pixel, pixel);

      this._alive = false;
    }
  }

  /*** Initialize the Game ***/

  setCanvasSize();

  const ctx = canvas.getContext('2d'),
        state = createState(null);

  drawLines();
  fillState();
  breatheLife();

  setTimeout(() => {
    document.getElementById('cover').remove();
  }, 500);

  function setCanvasSize() {
    const { boardWidth, boardHeight } = gridSettings;

    canvas.width = boardWidth;
    canvas.height = boardHeight;
  }

  function drawLines() {
    const { boardWidth: w, boardHeight: h, step, lineWidth, lineColor } = gridSettings;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;

    for (let x = step - lineWidth / 2; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }

    for (let y = step - lineWidth / 2; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }

    ctx.stroke();
  }

  function createState(stuffing) {
    const { xN, yN } = gridSettings,
          state = [];

    for (let i = 0; i < yN; i++) {
      state[i] = new Array(xN).fill(stuffing);
    }

    return state;
  }

  function fillState() {
      const { xN, yN } = gridSettings,
      N = xN * yN;

      for (let i = 0; i < N; i++) {
        new Cell(i);
      }
  }

  function breatheLife() {
    const randArr = generateRandomArr(gridSettings);

    randArr.forEach( id => {
      const { x, y } = Point.toXY(id);
      state[y][x].drawCell();
    });
  }

  // generates a random unique position cells on the board
  function generateRandomArr() {
    const { xN, yN, percent } = gridSettings,
          randomArr = [],
          N = xN * yN;

    for (let i = 0; i < N; i++) {
      randomArr[i] = i;
    }

    for (let i = 0; i < 3; i++) {
      randomArr.sort( () => Math.random() - 0.5 );
    }

    return randomArr.slice(-N * percent / 100);
  }

  /*** Game cycle ***/

  function tick() {
    const neighbours = countAllNeighbours();
    updateState(neighbours);
  }

  tick.click = true;

  canvas.onclick = () => {
    if (tick.click) {
      setInterval(tick, 100);
      tick.click = false;
    }
  }

  function countAllNeighbours() {
    const {xN, yN} = gridSettings,
          neighbours = createState(0);

    for (let y = 0; y < yN; y++) {
      for (let x = 0; x < xN; x++) {
        if (state[y][x]) {
          neighbours[y][x] = countCellNeighbours(new Point(x, y), state);
        }
      }
    }

    return neighbours;
  }

  function countCellNeighbours(point, state) {
    let { x, y } = point,
        count = 0;

    // left top cell
    x--; y--;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3;  j++) {

        if (i === 1 && j === 1) {
          x++;
          continue;
        }

        if (!state[y]) {
          x += 3;
          break;;
        }

        if (state[y][x]) {
          count += state[y][x].isAlive();
        }

        x++;
      }

      y += 1;
      x -= 3;
    }

    return count;
  }

  // main logic
  function updateState(neighbours) {
    const { xN, yN } = gridSettings;

    for (let y = 0; y < yN; y++) {
      for (let x = 0; x < xN; x++) {
        const cellNeighbours = neighbours[y][x];
        const cell = state[y][x];

        if (cell.isAlive() && cellNeighbours < 2 || cellNeighbours > 3) {
          cell.eraseCell();
        }

        if (!cell.isAlive() && cellNeighbours === 3) {
          cell.drawCell();
        }
      }
    }
  }

};