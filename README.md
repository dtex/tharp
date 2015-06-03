# tharp

[![Join the chat at https://gitter.im/dtex/tharp](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dtex/tharp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Tharp is not ready for you! Check back soon.
An inverse kinematics solver and robot controller for Johnny-Five.

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

  // Initialize the servos. The servos must be configured so that they are
  // oriented in a global coordinate space (see diagram below) and the servo
  // must be aligned perfectly using the offset property to trim it.
  // The servos must also be in the correct order to match the
  // chain type
  var leftLeg = new five.Servos([
    {pin:40, offset: 24, startAt: 0, range: [0, 90] },
    {pin:39, offset: 87, startAt: 78, range: [-80, 78] },
    {pin:38, offset: 165, invert: true, startAt: -140, range: [-160, -10] }
  ]);

  var rightLeg = new five.Servos([
    {pin:27, offset: -31, startAt: 180, range: [90, 180] },
    {pin:26, offset: -77, startAt: 102, range: [110, 260] },
    {pin:25, offset: -176, invert: true, startAt: 320, range: [180, 340] }
  ]);


  // configuredhain() wraps our Servos() object with some properties
  // that define the kinematic system. The "type" property defines
  // the joint/segment configuration.
  var leftLegChain = new tharp.Chain({
    actuators: leftLeg,
    chainType: "CFTyzz",
    origin: [4.25, 2.875, 8.15],
    bones: { femur: 7.6125, tibia: 10.4 }
  });

  var rightLegChain = new tharp.Chain({
    actuators: rightLeg,
    chainType: "CFTyzz",
    origin: [-4.25, 2.875, 8.15],
    bones: { femur: 7.6125, tibia: 10.4 }
  });

  // Robot() wraps our chains, gives us a place to orient the
  // robot chassis and ensures that all chains can be rendered
  // before rendering the entire robot move
  var robot = new tharp.Robot({
    chains: [leftLegChain, rightLegChain]
  });

  /* === End robot configuration === */

  // Now we can orient the chassis
  robot.orientation({ pitch: 0.1, roll: -0.08, yaw: -0.13 });
  robot.offset({ x: 1, y: -0.2, z: -1 });

  // And position our end effectors
  leftLegChain.position([8.25, -5.0, 12.25]);
  rightLegChain.position([-8.25, -5.0, 12.25]);

  robot.render();

});

````

### Constructor

#### **new Tharp.Chain(opts)**

A Tharp chain will Wrap the Servos object so that we have all the info and methods we need to define and solve our the kinematic system.

**@param {Object} opts** Options
- **opts.actuators** {Servos or Array}: The Servos() object or device array that contains the chain's actuators.
- **opts.chainType** {String}: One of the pre-defined leg types. Don't see your system type? Open an issue, or better yet make a Pull Request!
- **opts.origin** {Array}: A three-tuple representing the x, y and z offset of the chain's origin point from the robot's origin point.
- **opts.segments** {Object}: An object with the segment names and lengths for our system. These names vary with the chainType
- **opts.require** {Boolean}: If true then calls to Robot.render() will error if this chain cannot be solved for the given position.

returns this Chain()

Example:

````js
var legChain = new tharp.Chain({
  actuators: leg,
  chainType: "CFTyzz",
  origin: [4.25, 2.875, 8.15],
  bones: { femur: 7.6125, tibia: 10.4 }
});
````

#### **new Tharp.Robot(opts)**

A Tharp Robot() will group the chains, giving you a single object for managing the robot's orientation and making sure that all required chains can be solved before rendering the movement.

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

### Methods

#### **Chain.render**

Move all the servos so our end effector is at the target position. This method is bound to the Servos() object as its @@render method. In most cases  you would call Chain.solve() on all your chains and make sure they can all reach the desired end effector position before rendering the movement.

**@param {Object} opts** Options: {position, orientation}
- **opts.position** {Array}: Three tuple of desired end effector position in x,y,z coordinates
- **opts.orientation** {Object}: {[pitch][, roll][, yaw]}: pitch, roll and yaw are given in radians

returns this Chain()

#### **Chain.solve**
Find the angles needed to position the end effector at a desired point.

**@param {Object} opts** Options: {chain, position, orientation, type}

Returns the Chain object

#### **Chain.eePosition**
Find an end effector's position relative to the kinematic chain origin
- **@param {Object} opts** Options: {position[, origin][, orientation] }
- **opts.position {Array}**: Three tuple of end effector position relative to the robots origin point
- **opts.origin {Array}**: Three tuple of kinematic chain origin relative to the robots origin point
- **opts.orientation {Object}**: {[pitch][, roll][, yaw]} pitch, roll and yaw are given in radians

returns a three tuple [x, y, z]

#### **Chain.doIK**

#### **Robot.offset**

#### **Robot.orient**

#### **Robot.render**

#### **Tharp.radToDeg**
Convert radians to degrees

#### **Tharp.degToRad**
Convert degrees to radians

#### **Tharp.solveAngle**
Given three sides this will solve a triangle using law of cosines
- **@param {Number} a**: An adjacent side's length
- **@param {Number} b**: The other adjacent side's length
- **@param {Number} c**: The opposite side's length

Returns the angle in radians

#### **Tharp.findValidAngle**
Given an angle in radian and a range in degrees will find the correct quadrant for the servo to hit that angle.

Returns the angle in degrees unless no solution can be found. In which case an error is returned.
