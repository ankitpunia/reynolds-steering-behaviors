'use strict';

import p5 from 'p5';
import World from './world';


let world;

window.setup = () => {
  createCanvas(window.innerWidth, window.innerHeight);
  world = new World();
}

window.draw = () => {
  world.update();
  world.render();
}

window.mouseDragged = () => {
    world.addVehicle(mouseX, mouseY);
}

window.keyPressed = () => {
    if (key === ' ') {
        world.toggleScene();
    } else if (key === 'R') {
        world.toggleForceMapRendering();
    } else if (key === 'A') {
        world.toggleAlignment();
    } else if (key === 'S') {
        world.toggleSeparation();
    } else if (key === 'C') {
        world.toggleCohesion();
    } else if (key === 'M') {
        world.toggleMouseAttraction();
    }
}
