import p5 from 'p5';


export default class Path {

  constructor(pointCount) {
    this.points = [];
    this.radius = random(10, 20);
    this.pointCount = pointCount;
  }

  ////////////////////////////////////////////////////////////////////////////
  // Private methods
  ////////////////////////////////////////////////////////////////////////////

  _scalarProjection(p, a, b) {
    const ap = p5.Vector.sub(p, a);
    const ab = p5.Vector.sub(b, a);

    ab.normalize();
    ab.mult(ap.dot(ab));

    const normalPoint = ab.add(a);

    // check if the normal point lies on the segment; if not, return a far point
    if (p5.Vector.sub(a, normalPoint).mag() + p5.Vector.sub(normalPoint, b).mag() - p5.Vector.sub(a, b).mag() <= 0.01) {
      return normalPoint;
    } else {
      return p5.Vector.sub(p, a).mag() < p5.Vector.sub(p, b).mag() ? a : b;
    }
  }


  ////////////////////////////////////////////////////////////////////////////
  // Public methods
  ////////////////////////////////////////////////////////////////////////////

  update() {
    for (let i = 0; i < this.pointCount; i++) {
      let x = i * width / this.pointCount;
      let y = map(noise(x * 0.002, millis() / 10000), 0, 1, 0, height);
      this.points[i] = createVector(x, y);
    }
  }


  render() {
    for (let i = 0; i < this.points.length - 1; i++) {
      strokeWeight(this.radius * 2);
      stroke(200);
      line(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
    }
    line(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y, this.points[0].x + width, this.points[0].y);

    for (let i = 0; i < this.points.length - 1; i++) {
      strokeWeight(1);
      stroke(127);
      line(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
    }
    line(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y, this.points[0].x + width, this.points[0].y);
  }


  getTarget(p) {
    let closestPoint = this._scalarProjection(p, this.points[this.points.length - 1], createVector(this.points[0].x + width, this.points[0].y));
    let closestDist = p5.Vector.sub(closestPoint, p).mag();
    let direction = p5.Vector.sub(this.points[this.points.length - 1], createVector(this.points[0].x + width, this.points[0].y)).setMag(20);
    for (let i = 0; i < this.points.length - 1; i++) {
      let projection = this._scalarProjection(p, this.points[i], this.points[i + 1]);
      let dist = p5.Vector.sub(projection, p).mag();

      if (dist < closestDist) {
        closestPoint = projection;
        closestDist = dist;
        direction = p5.Vector.sub(this.points[i], this.points[i + 1]).setMag(20);
      }
    }

    const target = p5.Vector.add(closestPoint, direction);

    if (closestDist < this.radius) {
      return null;
    } else {
      return target;
    }
  }
}
