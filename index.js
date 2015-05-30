var vector = require("vektor").vector,
  rotate = require("vektor").rotate,
  matrix = require("vektor").matrix;

module.exports = {

  // Move all the servos so our end effectors are at the
  // target position
  //
  // @param {Object} opts Options: {chain, position, orientation}
  //  - opts.chain {Servos}: This must be a Johnny-Five Servos() instance
  //    that contains the servos used in the chain. Prior to using this
  //    method the Servos object must be run through tharp.makeChain().
  //  - opts.origin {Array}: Three tuple of kinematic chain origin relative
  //    to the robots origin point
  //  - opts.orientation {Object}: {[pitch][, roll][, yaw]}
  //    pitch, roll and yaw are given in radians
  //
  // returns the Servos() object this was called upon
  render: function( opts ) {
    var angles = solve(opts);
    opts.chain.forEach(function(device, index) {
      device["@@render"](angles[index]);
    });
  },

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
  //
  // returns a three tuple [x, y, z]
  solve: function( opts ) {

    var solution;
    var invalid = false;
    var posMatrix = new matrix(1,3);

    // Find the end effector position relative to the chain origin
    var offsetPosition = eePosition({
      position: opts.position,
      origin: chain.origin,
      orientation: orientation
    });

    return doIK[opts.type](opts, offsetPosition);

  },


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
  eePosition: function(opts) {

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

  },

  doIK: {
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
  },

  // Convert radians to degrees
  radToDeg: function(x) {
    return x / Math.PI * 180;
  },

  // Convert degrees to radians
  degToRad: function(x) {
    return x / 180 * Math.PI;
  },

  // Given three sides this will solve a triangle using law of cosines
  //
  // @param {Number} a: An adjacent side's length
  // @param {Number} b: THe other adjacent side's length
  // @param {Number} c: The opposite side's length
  //
  // Returns the angle in radians
  solveAngle: function(a, b, c) {
    return Math.acos((a * a + b * b - c * c) / (2 * a * b));
  },

  // Given an angle in radian and a range in degrees will find the correct
  // quadrant for the servo to hit that angle.
  //
  // @param {Number} a: An adjacent side's length
  // @param {Number} b: THe other adjacent side's length
  // @param {Number} c: The opposite side's length
  //
  // Returns the angle in degrees unless no solution can be found. In which
  // case false is returned.
  findValidAngle: function(angle, range) {
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

  }

};
