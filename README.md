# tharp is not ready to use!
An inverse kinematics solver for robotic legs controlled by Johnny-Five.

### Installation
````bash
npm install tharp
````

### Usage
````js
// This is a simple excerpt, illustrating the configuration
// of one leg on a typical hexapod
var five = require("johnny-five"),
  tharp = require("tharp");

var board = new five.Board().on("ready", function() {

  // Initialize the servos. The servos must be configured so that they are
  // oriented in a global coordinate space (see diagram below) and the servo
  // must be aligned perfectly using the offset properly to trim it
  var leg = new five.Servos([
    {pin:40, offset: 24, startAt: 0, range: [0, 90] },
    {pin:39, offset: 87, startAt: 78, range: [-80, 78] },
    {pin:38, offset: 165, invert: true, startAt: -140, range: [-160, -10] }
  ]);

  // chain() wraps our Servos() object with some properties
  // that define the kinematic system. The "type" property defines
  // the joint/segment configuration.
  var legChain = new tharp.Chain({
    actuators: leg,
    type: "A",
    origin: [4.25, 2.875, 8.15],
    bones: { femur: 7.6125, tibia: 10.4 }
  });

  // render() will move the leg so that the end effector
  // is in the target position given the chassis' current
  // orientation
  legChain.render({
    position: [11.25, -4, 12.15],
    orientation: [0.1, -0.08, -0.13]
  });

});

````

### Methods
