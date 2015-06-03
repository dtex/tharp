# tharp

## Tharp is not ready for you! Check back soon.
Tharp is an inverse kinematics solver and robot controller for Johnny-Five. Tharp makes hard things easy.

To use Tharp you first define your kinematic system using Tharp.Chain. Once you have each chain defined you can group them under a Tharp.Robot. Once all that is done you can position the end effector of each chain and call Robot.Render. If all the chains can be solved the robot will move all the end effectors to their desired positions.

### Installation
````bash
npm install tharp
````

### Example
````js
// This is a simple excerpt, illustrating the configuration
// of robot with two legs
var five = require("johnny-five"),
  Tharp = require("tharp");

var board = new five.Board().on("ready", function() {

  /* === Begin robot configuration === */

  // Tharp.Chain() wraps our actuators and adds properties
  // that define the kinematic system. The "type" property defines
  // the joint/segment configuration.
  var leftLeg = new tharp.Chain({
    actuators: [
      {pin:40, offset: 24, startAt: 0, range: [0, 90] },
      {pin:39, offset: 87, startAt: 78, range: [-80, 78] },
      {pin:38, offset: 165, invert: true, startAt: -140, range: [-160, -10] }
    ],
    chainType: "CoxaY-FemurZ-TibiaZ",
    origin: [4.25, 2.875, 0.15],
    segments: { femur: 7.6125, tibia: 10.4 }
  });

  var rightLeg = new tharp.Chain({
    actuators: [
      {pin:27, offset: -31, startAt: 180, range: [90, 180] },
      {pin:26, offset: -77, startAt: 102, range: [110, 260] },
      {pin:25, offset: -176, invert: true, startAt: 320, range: [180, 340]}
    ],
    chainType: "CoxaY-FemurZ-TibiaZ",
    origin: [-4.25, 2.875, 0.15],
    segments: { femur: 7.6125, tibia: 10.4 }
  });

  // Robot() wraps our chains, gives us a place to orient the
  // robot chassis and ensures that all chains can be rendered
  // before rendering the entire robot move
  var robot = new tharp.Robot({
    chains: [leftLeg, rightLeg]
  });

  /* === End robot configuration === */

  // Now we can orient the chassis
  robot.orientation({ pitch: 0.1, roll: -0.08, yaw: -0.13 });
  robot.offset({ x: 1, y: -0.2, z: -1 });

  // And position our end effectors
  leftLegChain.position([8.25, -5.0, 12.25]);
  rightLegChain.position([-8.25, -5.0, 12.25]);

  // Move everything
  robot.render();

});

````
________________

# API

## Robot()

#### **new Tharp.Robot(opts)**

A Tharp Robot() will group chains, giving you a single object for managing the robot's orientation and making sure that all required chains can be solved before rendering the movement.

**@param {Object} opts** Options
- **opts.chains** {Array of Tharp.Chains()}: The chains in the robot.
- **opts.robotType** {String}: One of the pre-defined robot types. Don't see your robot? Open an issue, or better yet make a Pull Request!
- **opts.orientation** {Object} Chassis rotation about the Robot's origin.
 - **opts.orientation.roll** {Number} Rotation about the Z axis
 - **opts.orientation.pitch** {Number} Rotation about the X axis
 - **opts.orientation.yaw** {Number} Rotation about the Y axis
- **opts.offset** {Object} Chassis translation relative to the Robot's origin
 - **opts.offset.x** {Number} Chassis offset on the X axis
 - **opts.offset.y** {Number} Chassis offset on the Y axis
 - **opts.offset.z** {Number} Chassis offset on the Z axis

 Example:

 ````js
 var myRobot = new tharp.Robot({
   chains: [R1, L1, R2, L2, R3, L3],
   robotType: "hexapod"
 });
 ````

### Robot Methods

#### Robot.render(opts)
Robot.render() will solve and render (if possible) the chains associated with the robot. You can also update the orientation and offset when calling this method.

**@param {Object} opts** Options
- **opts.orientation** {Object} Chassis rotation about the Robot's origin.
 - **opts.orientation.roll** {Number} Rotation about the Z axis
 - **opts.orientation.pitch** {Number} Rotation about the X axis
 - **opts.orientation.yaw** {Number} Rotation about the Y axis
- **opts.offset** {Object} Chassis translation relative to the Robot's origin
 - **opts.offset.x** {Number} Chassis offset on the X axis
 - **opts.offset.y** {Number} Chassis offset on the Y axis
 - **opts.offset.z** {Number} Chassis offset on the Z axis

### Robot Properties

#### Robot.offset {x: n, y: n, z: n}
Offset will shift the physical origin point for the robot relative to the origin point for the global coordinate system. This is helpful for making to robot lean or raise up without repositioning the end effectors.
- Robot.offset.x - Distance to shift on the x axis
- Robot.offset.y - Distance to shift on the y axis
- Robot.offset.z - Distance to shift on the z axis

#### Robot.orientation ({pitch: n, roll: n, yaw: n})
Orientation will rotate the robot's axes relative to the global coordinate space without affecting the position of the end effectors. This is useful for making the robot tilt, roll or twist without repositioning the end effectors.
- Robot.orientation.tilt - Rotation about the x axis in radians
- Robot.orientation.roll - Rotation about the z axis in radians
- Robot.orientation.yaw - Rotation about the y axis in radians

## Chain()

#### **new Tharp.Chain(opts)**

A Tharp chain will Wrap the actuators so that we have all the info and methods we need to define and solve for our the kinematic chain.

**@param {Object} opts** Options
- **opts.actuators** {Servos, Servo.Array, Array of Servo Objects, or a Servos initialization array} The object or device array that contains the chain's actuators, or an array of Servo opts to create a new Servos() object [Required]
- **opts.chainType** {String}: One of the pre-defined leg types described in the readme. Don't see your system type? Open an issue, or better yet make a Pull Request! [Required]
- **opts.segments** {Object}: An object with the segment names and lengths for our system. These names vary with the chainType [Required]
- **opts.origin** {Array}: A three-tuple representing the x, y and z offset of the chain's origin point from the robot's origin point.
[Optional. Default: [{x: 0, y:0 , z: 0}] ]
- **opts.require** {Boolean}: If true then calls to Robot.render() will error if this chain cannot be solved for the given position. [Optional. Default: true]

returns this Chain()

Example:

````js
var frontRight = new tharp.Chain({
  actuators: [
    {pin:40, offset: 24, startAt: 0, range: [0, 90] },
    {pin:39, offset: 87, startAt: 78, range: [-80, 78] },
    {pin:38, offset: 165, invert: true, startAt: -140, range: [-160, -10] }
  ],
  chainType: "CoxaY-FemurZ-TibiaZ",
  origin: { x: 4.25, y: 2.875, z: 8.15],
  segments: { femur: 7.6125, tibia: 10.4 }
});
````
 ________________

### Chain Methods

#### **Chain.render(opts)**

Move all the servos so the end effector is at the target position. In most cases you would want to call Chain.solve() on all your chains and make sure they can all reach the desired end effector position before rendering the movement. Tharp.Robot can handle this extra step for you so you should not need to use ```Chain.render()``` directly.

**@param {Object} opts** Options: {[x][, y][, z]}
- **opts.x** {Number}: The desired position of the end effector along the x axis [Optional].
- **opts.y** {Number}: The desired position of the end effector along the y axis [Optional].
- **opts.z** {Number}: The desired position of the end effector along the z axis [Optional].

returns this Chain()

Example:

````js
frontRight.render({
  position: { x: 12.5, y: -4, z: 8.2 }
});
````

#### **Chain.solve(opts)**
Find the angles needed to position the end effector at a desired point. The angles are written to chain.position.

**@param {Object} opts** Options: {[x][, y][, z]}
- **opts.x** {Number}: The desired position of the end effector along the x axis [Optional].
- **opts.y** {Number}: The desired position of the end effector along the y axis [Optional].
- **opts.z** {Number}: The desired position of the end effector along the z axis [Optional].

Returns array of angles (in radians) or position

Example:

````js
var angles = frontRight.solve({
  position: { x: 12.5, y: -4, z: 8.2 }
});
// returns th[0.4, -0.2, 0.8]
````

#### **Chain.eePosition**
Find an end effector's position relative to the kinematic chain origin
- **@param {Object} opts** Options: {position[, origin][, orientation] }
- **opts.position {Object}** position: {[x][, y][, z]} The end effector position relative to the robots origin point
- **opts.origin {Object}**: origin: {[x][, y][, z]} The kinematic chain origin relative to the robots origin point
- **opts.orientation {Object}**: orientation: {[pitch][, roll][, yaw]} pitch, roll and yaw given in radians

returns a position {x, y, z}

Example:

````js
var offset = frontRight.eePosition({
  position: { x: 12.5, y: -4, z: 8.2 }
});
// returns { x: 8.25, y: -1.125, z: 0.05],
````

### Tharp Helper Methods

#### **Tharp.radToDeg(radians)**
Convert radians to degrees

#### **Tharp.degToRad(degrees)**
Convert degrees to radians

#### **Tharp.solveAngle(a, b, c)**
Given three sides this will solve a triangle using law of cosines
- **@param {Number} a**: An adjacent side's length
- **@param {Number} b**: The other adjacent side's length
- **@param {Number} c**: The opposite side's length

Returns the angle in radians

#### **Tharp.findValidAngle(radians, range)**
Given an angle in radians and a range in degrees this will find the correct quadrant for the servo to return the correct angle.

Returns the angle in degrees unless no solution can be found. In which case an error is returned.
