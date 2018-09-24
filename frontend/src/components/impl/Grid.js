export default class Grid {
  constructor(rowCount, columnCount, cellWidth) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.cellWidth = cellWidth;
    this.tiles = [];
    for (let i = 0; i < rowCount * columnCount; i++) {
      this.tiles[i] = { tombs: [] };
    }
  }

  insertGrid = (row, col, val) => {
    if (row < 0 || row > this.rowCount || col < 0 || col > this.columnCount) {
      return;
    }

    this.tiles[this.columnCount * row + col].tombs.push(val);
  };

  insertWorld = (xWorld, yWorld, val) => {
    const row = Math.floor(yWorld / this.cellWidth);
    const col = Math.floor(xWorld / this.cellWidth);

    this.insertGrid(row, col, val);
  };

  retrieveGrid = (row, col) => {
    if (row < 0 || row > this.rowCount || col < 0 || col > this.columnCount) {
      return [];
    }

    return this.tiles[this.columnCount * row + col].tombs;
  };

  retrieveWorld = (xWorld, yWorld) => {
    const row = Math.floor(yWorld / this.cellWidth);
    const col = Math.floor(xWorld / this.cellWidth);

    return this.retrieveGrid(row, col);
  };

  retrieveNeighborsGrid = (row, col, offset = 1) => {
    let neighbors = [];
    for (let r = -offset; r <= offset; r++) {
      for (let c = -offset; c <= offset; c++) {
        neighbors = neighbors.concat(this.retrieveGrid(row + r, col + c));
      }
    }
    return neighbors;
  };

  retrieveNeighborsWorld = (xWorld, yWorld, offset = 1) => {
    const row = Math.floor(yWorld / this.cellWidth);
    const col = Math.floor(xWorld / this.cellWidth);

    return this.retrieveNeighborsGrid(row, col, offset);
  };
}
