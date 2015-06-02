var vector = require("vektor").vector,
  rotate = require("vektor").rotate,
  matrix = require("vektor").matrix;

// Wrap our chains into a single object we can control
//
// @param {Object} opts Options: {chains, offset, orientation}
//  - opts.chains {Array} An array of chains that makeup this robot
//  - opts.offset {Array} A three element array describing an offset
//    for the robot's origin point. This can be used to shift the
//    robot's position relative to its origin point (picture the
//    robot shifting it's weight along the x/z plane or stretching
//    to be taller without moving the end effectors)
//  - opts.orientation {Array} A three element array of Numbers
//    giving the rotation of the robot's chassis around its
//    origin point (make it dance! )
Robot(opts) {

  if (!(this instanceof Chain)) {
    return new Chain(opts);
  }

  Object.defineProperties(this, opts);

}

// Wrap our servos object so that we have all the info and
// methods we need to define and solve our the kinematic system
//
// @param {Object} opts Options: {actuators, systemType, origin, bones }
//  - opts.actuators {Servos}: The Servos() object that contains the chain's actuators
//  - opts.systemType {String}: One of the pre-defined system types. Don't see your
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

  actuators = opts.actuators;
  actuators.origin = opts.origin;
  acutators.segments = opts.segments;
  actuators["@@render"] = this.render;

  // Move all the servos so our end effectors are at the
  // target position. This method is bound to the Servos()
  // object as its @@render method.
  //
  // returns the Servos() object this was called upon
  Chain.prototype.render = function( ) {
    if (this.angles) {
      this.forEach(function(device, index) {
        // This will call the device's render method
        device["@@render"](angles[index]);
      });
    }
  };

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

    var solution;
    var invalid = false;
    var posMatrix = new matrix(1,3);

    // Find the end effector position relative to the chain origin
    var offsetPosition = eePosition({
      position: opts.position,
      origin: chain.origin,
      orientation: orientation
    });

    this.angles = doIK[opts.systemType](opts, offsetPosition);

    if (opts.immediate) {
      this.render();
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

  Chain.prototype.doIK = {
    A: function(opts, offsetPosition) {

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
      var tibiaAngle = solveAngle(chain.bones.FEMUR, chain.bones.TIBIA, hypot);

      // Our last triangle solve
      var femurAngle = solveAngle(chain.bones.FEMUR, hypot, chain.bones.TIBIA);

      // But wait! The femur angle returned represents the angle between the
      // femur and the 2D hypoteneuse but we actually want the angle between
      // the femur servo's axis of rotation and the femur so we need to
      // subtract the angle described by the end effector, the femur origin
      // and the femur's axis of rotation.
      // It really is easier than I make it sound.
      femurAngle -= Math.sin(yd/hypot2d);

      // Just two things left: The angles are in radians (we need degrees
      // for our servo) and the angles may or may not be within our servo's
      // range. Fix that with findValidAngle().
      var coxaDegrees = findValidAngle(coxaAngle, opts.chain[0].range);
      var femurDegrees = findValidAngle(femurAngle, opts.chain[1].range);
      var tibiaDegrees = findValidAngle(tibiaAngle, opts.chain[2].range);

      // Our solution Array
      var angles = [coxaDegrees, femurDegrees, tibiaDegrees];

      return angles;
    }
  };

  // Convert radians to degrees
  Chain.prototype.radToDeg = function(x) {
    return x / Math.PI * 180;
  };

  // Convert degrees to radians
  Chain.prototype.degToRad = function(x) {
    return x / 180 * Math.PI;
  };

  // Given three sides this will solve a triangle using law of cosines
  //
  // @param {Number} a: An adjacent side's length
  // @param {Number} b: THe other adjacent side's length
  // @param {Number} c: The opposite side's length
  //
  // Returns the angle in radians
  Chain.prototype.solveAngle = function(a, b, c) {
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
  Chain.prototype.findValidAngle = function(angle, range) {
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

  return this;

}

module.exports = {
  Tharp.Robot,
  Tharp.Chain
};
