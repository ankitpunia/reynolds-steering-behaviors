export default class Vehicle {

  constructor(x, y) {
    this.location = createVector(x || random(width), y || random(height));
    this.velocity = createVector(random(-3, 3), random(-3, 3));
    this.acceleration = createVector(0, 0);

    this.maxSpeed = random(3, 8);
    this.maxForce = random(0.5, 1);
  }

  ////////////////////////////////////////////////////////////////////////////
  // Private methods
  ////////////////////////////////////////////////////////////////////////////

  _keepWithinEdges() {
    this.location.x = (this.location.x + width) % width;
    this.location.y = (this.location.y + height) % height;
  }


  ////////////////////////////////////////////////////////////////////////////
  // Public methods
  ////////////////////////////////////////////////////////////////////////////

  update() {
    this.location.add(this.velocity);
    this.velocity.add(this.acceleration);

    this._keepWithinEdges();
    this.acceleration.mult(0);
  }


  applyForce(f) {
    this.acceleration.add(f);
  }


  render() {
    push();
    translate(this.location.x, this.location.y);
    rotate(Math.atan2(this.velocity.y, this.velocity.x));

    noStroke();
    fill(127, 0, 0);
    ellipse(2, 0, 4, 4);
    fill(191, 0, 0);
    ellipse(-2, 0, 6, 6);

    // stroke(200);
    // noFill();
    // ellipseMode(CENTER);
    // ellipse(0, 0, 50, 50);
    pop();
  }
}
