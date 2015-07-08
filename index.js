var vector = require("vektor").vector,
  rotate = require("vektor").rotate;

// Wrap our chains into a single object we can control
//
// @param {Object} opts Options: {chains, offset, orientation}
//  - opts.chains {Array} An array of chains that makeup this robot
//  - opts.robotType {String} One of the predefined robot types.
//  - opts.offset {Array} A three element array describing an offset
//    for the robot's origin point. This can be used to shift the
//    robot's position relative to its origin point (picture the
//    robot shifting it's weight along the x/z plane or stretching
//    to be taller without moving the end effectors)
//  - opts.orientation {Array} A three element array of Numbers
//    giving the rotation of the robot's chassis around its
//    origin point (make it dance! )
function Robot(opts) {

  if (!(this instanceof Robot)) {
    return new Robot(opts);
  }

  this.chains = opts.chains;

  this.offset = opts.offset || [0, 0, 0];

  if (!opts.orientation) {
    opts.orientation = {};
  }

  this.orientation = {
    pitch: opts.orientation.pitch || 0,
    yaw: opts.orientation.yaw || 0,
    roll: opts.orientation.roll || 0
  };

}

// Call the @@normalize function on each of the chains
Robot.prototype["@@normalize"] = function(keyFrameSet) {
  keyFrameSet.forEach(function( keyFrames, index ) {
    keyFrames = this.chains[index]["@@normalize"](keyFrames);
  }, this);

  return keyFrameSet;
};

// Find the solution for each chain. Make sure that all requied chains
// have a valid solution before rendering the robot movement
Robot.prototype["@@render"] = function(opts) {

  var passed = true;

  opts = opts || {};

  this.chains.forEach( function(chain, index) {
    if (opts.length < index - 1) {
      opts[index] = chain.position;
    }
    if (!(chain.solve({position: opts[index], orientation: this.orientation, offset: this.offset }))) {
      passed = false;
    }

  }, this);

  if (passed) {
    this.chains.forEach( function(chain) {
      chain.devices["@@render"](chain.angles);
    });
  }

};

// Wrap our servos object so that we have all the info and
// methods we need to define and solve our the kinematic system
//
// @param {Object} opts Options: {actuators, systemType, origin, bones }
//  - opts.actuators {Servos}: The Servos() object that contains the chain's actuators
//  - opts.chainType {String}: One of the pre-defined chain types. Don't see your
//    system type? Open an issue, or better yet a Pull Request!
//  - opts.origin {Array}: A three-tuple representing the x, y and z offset of the
//    chain's origin point from the robot's origin point.
//  - opts.segments {Object}: An object with the segment names and lengths for our system
//    The names vary with the systemType
//
// returns this chain
function Chain(opts) {

  if (!(this instanceof Chain)) {
    return new Chain(opts);
  }

  if (opts.constructor) {
    this.devices = new opts.constructor(opts.actuators);
  } else {
    this.devices = opts.actuators;
  }

  this.chainType = opts.chainType;

  this.segments = opts.segments;

  this.origin = opts.origin || [0, 0, 0];
  this.position = opts.startAt || [0, 0, 0];

  this.require = opts.require || true;

}

// // Move all the servos so our end effector is at the
// // target position.
// //
// // returns the Servos() object this was called upon
// Chain.prototype.render = function( opts ) {
//   this.solve();
//   this.forEach(function(device, index) {
//     // This will call the device's render method
//     device["@@render"](this.angles[index]);
//   });
// };

// Find the angles needed to position the end effector
// at a desired point
//
// @param {Object} opts Options: {chain, position, orientation, type}
//  - opts.chain {Servos*}: Typically a Johnny-Five Servos() instance
//    that contains the servos used in the chain. Prior to using this
//    method the Servos must be run through tharp.makeChain().
//  - opts.origin {Array}: Three tuple of kinematic chain origin relative
//    to the robots origin point
//  - opts.orientation {Object}: {[pitch][, roll][, yaw]}
//    pitch, roll and yaw are given in radians
//  - opts.type {String}: The type of chain (see the readme for
//    a list of types)
//  - opts.immediate {Boolean}: Will move the servos immediately this
//    is usually a bad idea since other legs (chains) of your robot
//    may not have a valid solution and will not move.
//
// returns a three tuple [x, y, z]
Chain.prototype.solve = function( opts ) {

  opts = opts || {};

  if (opts) {
    this.position = opts.position || this.position;
    this.orientation = opts.orientation || this.orientation;
    this.offset = opts.offset || this.offset;
  }

  // Find the end effector position relative to the chain origin
  var offsetPosition = this.eePosition({
    position: this.position,
    origin: this.origin,
    offset: this.offset,
    orientation: this.orientation
  });

  this.angles = ikSolvers[this.chainType](this, offsetPosition);

  if (opts.immediate) {
    this.devices["@@render"](this.angles);
  }

  // If all the joints could be solved, return true and update last
  if (this.angles.indexOf(false) === -1) {
    this.devices.last = {
      target: this.position
    };
    return true;
  } else {
    return false;
  }

};

// Find an end effector's position relative to the kinematic chain origin
//
// @param {Object} opts Options: {position[, origin][, orientation] }
//  - opts.position {Array}: Three tuple of end effector position
//    relative to the robots origin point
//  - opts.origin {Array}: Three tuple of kinematic chain origin relative
//    to the robots origin point
//  - opts.orientation {Object}: {[pitch][, roll][, yaw]}
//    pitch, roll and yaw are given in radians
//
// returns a three tuple [x, y, z]
Chain.prototype.eePosition = function(opts) {

  var pos = opts.position || [0, 0, 0];
  var oPos = opts.origin || [0, 0, 0];
  var orientation = opts.orientation || {};
  var roll = orientation.roll || 0;
  var pitch = orientation.pitch || 0;
  var yaw = orientation.yaw || 0;
  var offset = opts.offset || [0, 0, 0];

  var xOffset = offset[0] || 0;
  var yOffset = offset[1] || 0;
  var zOffset = offset[2] || 0;

  pos = [pos[0] - xOffset, pos[1] - yOffset, pos[2] - zOffset];

  // End effector position
  var posVector = new vector(pos);

  // Chain origin position
  var oPosVector = new vector(oPos);

  var rotationMatrix = new rotate.RotZ(roll);
  posVector = rotationMatrix.dot(posVector);
  oPosVector = rotationMatrix.dot(oPosVector);

  rotationMatrix = new rotate.RotX(pitch);
  posVector = rotationMatrix.dot(posVector);
  oPosVector = rotationMatrix.dot(oPosVector);

  rotationMatrix = new rotate.RotY(yaw);
  posVector = rotationMatrix.dot(posVector);
  oPosVector = rotationMatrix.dot(oPosVector);

  // We need to subtract the chain origin from the desired position
  // but there is no vector.subtract() so let's invert the origin
  // and then add the vectors together
  oPosVector = oPosVector.scale(-1);
  posVector = posVector.add(oPosVector);

  return posVector.v;

};

// Call the @@normalize function on the chain
Chain.prototype["@@normalize"] = function(keyFrames) {

  if (keyFrames[0] === null ) {
    keyFrames[0] = {
      position: this.position
    };
  }

  keyFrames.forEach(function(keyFrame) {
    if (typeof keyFrame.position !== "undefined") {
      keyFrame.value = keyFrame.position;
    }
  });

  keyFrames = this.devices["@@normalize"]([keyFrames])[0];
  return keyFrames;
};

// Convert radians to degrees
var radToDeg = function(x) {
  return x / Math.PI * 180;
};

// Convert degrees to radians
var degToRad = function(x) {
  return x / 180 * Math.PI;
};

// Given three sides this will solve a triangle using law of cosines
//
// @param {Number} a: An adjacent side's length
// @param {Number} b: THe other adjacent side's length
// @param {Number} c: The opposite side's length
//
// Returns the angle in radians
var solveAngle = function(a, b, c) {
  return Math.acos((a * a + b * b - c * c) / (2 * a * b));
};

// Given an angle in radian and a range in degrees will find the correct
// quadrant for the servo to hit that angle.
//
// @param {Number} a: An adjacent side's length
// @param {Number} b: THe other adjacent side's length
// @param {Number} c: The opposite side's length
//
// Returns the angle in degrees unless no solution can be found. In which
// case false is returned.
var findValidAngle = function(angle, range) {
  var degrees = radToDeg(angle);

  if (degrees > range[1] || degrees < range[0]) {

    // Try adding 180
    if (degrees + 180 >= range[0] && degrees + 180 <= range[1]) {
      degrees = degrees + 180;
      return degrees;
    }

    // Try subtracting 180
    if (degrees - 180 >= range[0] && degrees - 180 <= range[1]) {
      degrees = degrees - 180;
      return degrees;
    }

    // No solution was found
    return false;
  }

  // The angle passed in was valid so just return that in degrees
  return degrees;

};

var ikSolvers = {
  "CoxaY-FemurZ-TibiaZ": function(chain, offsetPosition) {

    // Put the coordinates into seperate variables for readability
    var xd = offsetPosition[0];
    var yd = offsetPosition[1];
    var zd = offsetPosition[2];

    // We use the squares of these a lot so let's store the result
    var xd_sq = xd * xd;
    var yd_sq = yd * yd;
    var zd_sq = zd * zd;

    // This is the 3D hypoteneuse from the origin point to the end effector
    var hypot = Math.sqrt(xd_sq + yd_sq + zd_sq);

    // This is the 2D hypoteneuse on the x/z plane.
    var hypot2d = Math.sqrt(xd_sq + zd_sq);

    // Calculate the coxa angle in radians.
    // This is a simple 2D right triangle solve (yay)
    var coxaAngle = Math.atan(offsetPosition[2]/offsetPosition[0]);

    // This is a slightly tougher triangle solve
    var tibiaAngle = solveAngle(chain.segments.femur, chain.segments.tibia, hypot);

    // Our last triangle solve
    var femurAngle = solveAngle(chain.segments.femur, hypot, chain.segments.tibia);

    // But wait! The femur angle returned represents the angle between the
    // femur and the 2D hypoteneuse but we actually want the angle between
    // the femur servo's axis of rotation and the femur so we need to
    // subtract the angle described by the end effector, the femur origin
    // and the femur's axis of rotation.
    // It really is easier than I make it sound.
    femurAngle += Math.sin(yd/hypot2d);

    // If the chain is on the left side we need to modify our solutions
    if (offsetPosition[0] < 0) {
      femurAngle = Math.PI - femurAngle;
      tibiaAngle = Math.PI - tibiaAngle;
    }

    // Just two things left: The angles are in radians (we need degrees
    // for our servo) and the angles may or may not be within our servo's
    // range. Fix that with findValidAngle().
    var coxaDegrees = findValidAngle(coxaAngle, chain.devices[0].range);
    var femurDegrees = findValidAngle(femurAngle, chain.devices[1].range);
    var tibiaDegrees = findValidAngle(tibiaAngle, chain.devices[2].range);

    // Our solution Array
    var angles = [coxaDegrees, femurDegrees, tibiaDegrees];

    return angles;
  }
};

module.exports = {
  Chain: Chain,
  Robot: Robot,
  ikSolvers: ikSolvers,
  radToDeg: radToDeg,
  degToRad: degToRad,
  solveAngle: solveAngle,
  findValidAngle: findValidAngle
};
