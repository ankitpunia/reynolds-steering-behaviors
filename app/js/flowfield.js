export default class FlowField {

  constructor(res) {
    this.grid = [];
    this.resolution = res;
  }

  ////////////////////////////////////////////////////////////////////////////
  // Public methods
  ////////////////////////////////////////////////////////////////////////////

  update() {
    for (let x = 0; x < width / this.resolution; x++) {
      this.grid[x] = [];
      for (let y = 0; y < height / this.resolution; y++) {
        this.grid[x][y] = map(noise(x * 0.1, y * 0.1, millis() / 10000), 0, 1, 0, TWO_PI);
      }
    }
  }


  render() {
    for (let x = 0; x < width / this.resolution; x++) {
      for (let y = 0; y < height / this.resolution; y++) {
        stroke(0);
        fill(0);
        ellipseMode(CENTER);
        ellipse(x * this.resolution + this.resolution / 2,
          y * this.resolution + this.resolution / 2,
          1, 1);
        stroke(200);
        line(x * this.resolution + this.resolution / 2,
          y * this.resolution + this.resolution / 2,
          x * this.resolution + this.resolution / 2 + this.resolution * cos(this.grid[x][y]) / 3,
          y * this.resolution + this.resolution / 2 + this.resolution * sin(this.grid[x][y]) / 3);
      }
    }
  }


  fieldAt(location) {
    const x = floor(location.x / this.resolution);
    const y = floor(location.y / this.resolution);

    return createVector(cos(this.grid[x][y]), sin(this.grid[x][y]));
  }
};
