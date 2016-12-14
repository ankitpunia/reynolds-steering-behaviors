import p5 from 'p5';
import Vehicle from './vehicle';
import Path from './path';
import FlowField from './flowfield';


export default class World {

  constructor() {
    this.vehicles = [];

    this.flowField = new FlowField(20);
    this.scene = {
      currentIndex: 0,
      renderForceMap: false,
      applyAlignment: true,
      applySeparation: true,
      applyCohesion: true,
      mouseAttracts: false,
      list: ['free motion', 'mouse', 'flowField', 'path'],
      getCurrent: function() {
        return this.list[this.currentIndex];
      },
      toggle: function() {
        this.currentIndex = (this.currentIndex + 1) % this.list.length;
      },
      toggleProperty: function(property) {
        this[property] = !this[property];
      }
    };

    this.path = new Path(20);

    for (let i = 0; i < this.vehicles.length; i++)
      this.vehicles[i] = new Vehicle();
  }


  ////////////////////////////////////////////////////////////////////////////
  // Private methods
  ////////////////////////////////////////////////////////////////////////////
  _desiredVelocityTowardsMouse(vehicle) {
    const mouse = createVector(mouseX, mouseY);

    const desiredVel = p5.Vector.sub(mouse, vehicle.location);
    const d = desiredVel.mag();
    const decelDist = 2 * sq(vehicle.maxSpeed) / vehicle.maxForce;

    if (d < decelDist) {
      desiredVel.setMag(map(d, 0, decelDist, 0, vehicle.maxSpeed));
    } else {
      desiredVel.setMag(vehicle.maxSpeed);
    }

    return desiredVel;
  }

  _desiredVelocityAwayFromMouse(vehicle) {
    const mouse = createVector(mouseX, mouseY);

    let desiredVel = p5.Vector.sub(vehicle.location, mouse);
    const d = desiredVel.mag();
    const repelDist = 200; // 5 * sq(vehicle.maxSpeed) / vehicle.maxForce;

    if (d < repelDist) {
      desiredVel.setMag(vehicle.maxSpeed);
    } else {
      desiredVel = vehicle.velocity.copy().setMag(vehicle.maxSpeed);
    }

    return desiredVel;
  }

  _desiredVelocityInFlowField(vehicle) {
    const desiredVel = this.flowField.fieldAt(vehicle.location).setMag(vehicle.maxSpeed);

    return desiredVel;
  }

  _desiredVelocityForPath(vehicle) {
    const predictedLoc = p5.Vector.add(vehicle.location, vehicle.velocity.copy().setMag(50));
    const target = this.path.getTarget(predictedLoc);
    let desiredVel = createVector(0, 0);

    if (target !== null) { // predictedLoc is outside the path
      desiredVel = p5.Vector.sub(target, vehicle.location).setMag(vehicle.maxSpeed);
    } else { // predictedLoc is within the path
      desiredVel = vehicle.velocity.copy().setMag(vehicle.maxSpeed);
    }

    return desiredVel;
  }

  _desiredVelocityForAlignment(vehicle) {
    const sum = createVector(0, 0),
      alignmentDist = 50;
    let count = 0,
      desiredVel;

    for (let i = 0; i < this.vehicles.length; i++) {
      let currentVehicle = this.vehicles[i];
      if (currentVehicle !== vehicle) {
        const d = p5.Vector.dist(vehicle.location, currentVehicle.location);
        if (d < alignmentDist) {
          sum.add(currentVehicle.velocity);
          count++;
        }
      }
    }

    if (count > 0) {
      desiredVel = sum.div(count).setMag(vehicle.maxSpeed);
    } else {
      desiredVel = vehicle.velocity.copy(); //.setMag(vehicle.maxSpeed);
    }

    return desiredVel;
  }

  _desiredVelocityForSeparation(vehicle) {
    const sum = createVector(0, 0),
      separationDist = 20;
    let count = 0,
      desiredVel;

    for (let i = 0; i < this.vehicles.length; i++) {
      let currentVehicle = this.vehicles[i];
      if (currentVehicle !== vehicle) {
        const d = p5.Vector.dist(vehicle.location, currentVehicle.location);
        if (d < separationDist) {
          const diff = p5.Vector.sub(vehicle.location, currentVehicle.location);
          sum.add(diff.normalize().div(d));
          count++;
        }
      }
    }

    if (count > 0) {
      desiredVel = sum.div(count).setMag(vehicle.maxSpeed);
    } else {
      desiredVel = vehicle.velocity.copy().setMag(vehicle.maxSpeed);
    }

    return desiredVel;
  }

  _desiredVelocityForCohesion(vehicle) {
    const sum = createVector(0, 0),
      cohesionDist = 50;
    let count = 0,
      desiredVel;

    for (let i = 0; i < this.vehicles.length; i++) {
      const d = p5.Vector.dist(vehicle.location, this.vehicles[i].location);
      if (d < cohesionDist) {
        sum.add(this.vehicles[i].location);
        count++;
      }
    }

    if (count > 0) {
      desiredVel = p5.Vector.sub(sum.div(count).sub(vehicle.location)).setMag(vehicle.maxSpeed);
    } else {
      desiredVel = vehicle.velocity.copy().setMag(vehicle.maxSpeed);
    }

    return desiredVel;
  }


  ////////////////////////////////////////////////////////////////////////////
  // Public methods
  ////////////////////////////////////////////////////////////////////////////

  update() {
    if (this.scene.getCurrent() === 'flowField') {
      this.flowField.update();
    }

    if (this.scene.getCurrent() === 'path') {
      this.path.update();
    }

    this.applyForce();

    for (let i = 0; i < this.vehicles.length; i++) {
      this.vehicles[i].update();
    }
  }


  applyForce() {
    for (let i = 0; i < this.vehicles.length; i++) {
      let desiredVel = createVector(0, 0);
      let currentVehicle = this.vehicles[i];
      let vehicleVelocity = currentVehicle.velocity;
      let vehicleMaxForce = currentVehicle.maxForce;

      // Scene behavior
      switch (this.scene.getCurrent()) {
        case 'mouse':
          desiredVel = this.scene.mouseAttracts ? this._desiredVelocityTowardsMouse(currentVehicle) : this._desiredVelocityAwayFromMouse(currentVehicle);
          currentVehicle.applyForce(desiredVel.sub(vehicleVelocity).setMag(vehicleMaxForce));
          break;
        case 'flowField':
          desiredVel = this._desiredVelocityInFlowField(currentVehicle);
          currentVehicle.applyForce(desiredVel.sub(vehicleVelocity).setMag(vehicleMaxForce));
          break;
        case 'path':
          desiredVel = this._desiredVelocityForPath(currentVehicle);
          currentVehicle.applyForce(desiredVel.sub(vehicleVelocity).setMag(vehicleMaxForce));
          break;
        default:
          break;
      }

      // Group steering behavior
      if (this.scene.applyAlignment) {
        desiredVel = this._desiredVelocityForAlignment(currentVehicle);
        currentVehicle.applyForce(desiredVel.sub(vehicleVelocity).setMag(vehicleMaxForce));
      }
      if (this.scene.applySeparation) {
        desiredVel = this._desiredVelocityForSeparation(currentVehicle);
        currentVehicle.applyForce(desiredVel.sub(vehicleVelocity).setMag(vehicleMaxForce));
      }
      if (this.scene.applyCohesion) {
        desiredVel = this._desiredVelocityForCohesion(currentVehicle);
        currentVehicle.applyForce(desiredVel.sub(vehicleVelocity).setMag(vehicleMaxForce));
      }
    }
  }


  render() {
    background(255);

    textSize(32);
    text(this.scene.getCurrent(), 5, 32);
    textSize(16);
    text('Alignment: ' + this.scene.applyAlignment, 5, 64);
    text('Separation: ' + this.scene.applySeparation, 5, 84);
    text('Cohesion: ' + this.scene.applyCohesion, 5, 104);

    if (this.scene.renderForceMap) {
      if (this.scene.getCurrent() === 'flowField') {
        this.flowField.render();
      }

      if (this.scene.getCurrent() === 'path') {
        this.path.render();
      }
    }

    for (let i = 0; i < this.vehicles.length; i++) {
      this.vehicles[i].render();
    }
  }


  addVehicle(x, y) {
    this.vehicles.push(new Vehicle(x, y));
  }


  toggleScene() {
    this.scene.toggle();
  }


  toggleForceMapRendering() {
    this.scene.toggleProperty('renderForceMap');
  }


  toggleAlignment() {
    this.scene.toggleProperty('applyAlignment');
  }


  toggleSeparation() {
    this.scene.toggleProperty('applySeparation');
  }


  toggleCohesion() {
    this.scene.toggleProperty('applyCohesion');
  }


  toggleMouseAttraction() {
    this.scene.toggleProperty('mouseAttracts');
  }

}
