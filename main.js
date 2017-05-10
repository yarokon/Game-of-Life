(() => {
  const canvas = document.getElementById('game'),
        ctx = canvas.getContext('2d');

  const gridSettings = {
    percent: 25,
    step: 5,
    lineWidth: 1,
    lineColor: '#9e9e9e',
    get xN() {
      return (window.innerWidth - this.borderWidth * 2 + this.lineWidth) / this.step ^ 0
    },
    get yN() {
      return (window.innerHeight - this.borderWidth * 2 + this.lineWidth) / this.step ^ 0
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

  console.log(gridSettings.xN, gridSettings.yN);

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
    constructor() {
      this.resurrect();
    }

    isAlive() {
      return this._alive;
    }

    resurrect() {
      this._alive = true;
    }

    kill() {
      this._alive = false;
    }

    drawCell(x, y, options) {
      const { pixel, step } = options;
      ctx.fillRect(x * step, y * step, pixel, pixel);
    }

    eraseCell(x, y, options) {
      const { pixel, step } = options;

      this.kill();
      ctx.clearRect(x * step, y * step, pixel, pixel);
    }
  }

  const state = createInitialState(gridSettings);

  setCanvasSize(gridSettings);
  drawLines(gridSettings, ctx);
  seedState(gridSettings, state);
  display(gridSettings);

  function createInitialState(options) {
    const { xN, yN } = options,
          state = [];

    for (let i = 0; i < yN; i++) {
      state[i] = new Array(xN).fill(null);
    }

    return state;
  }

  function setCanvasSize(options) {
    const { boardWidth, boardHeight } = options;

    canvas.width = boardWidth;
    canvas.height = boardHeight;
  }

  function drawLines(options, ctx) {
    const { boardWidth: w, boardHeight: h, step, lineWidth, lineColor } = options;

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

  // generates a random unique position cells on the board
  function generateRandomArr(options) {
    const { xN, yN, percent } = options,
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

  function seedState(options, state) {
    const randArr = generateRandomArr(options)

    randArr.forEach(id => {
      const point = Point.toXY(id);
      state[point.y][point.x] = new Cell();
    });
  }

  function display(options) {
    const { xN, yN } = options;

    for (let y = 0; y < yN; y++) {
      for (let x = 0; x < xN; x++) {
        const cell = state[y][x];

        if (cell && cell.isAlive()) {
          cell.drawCell(x, y, options);
        }
      }
    }
  }
})();