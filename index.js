var vector = require("vektor").vector,
  rotate = require("vektor").rotate;

var ikSolvers = {
  ZYY: require("./ikSolvers/ZYY.js")
};

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
    keyFrames = this.chains[index]["@@normalize"]([keyFrames])[0];
    keyFrames = this.chains[index].devices["@@normalize"]([keyFrames])[0];
  }, this);
  return keyFrameSet;
};

// Find the solution for each chain. Make sure that all requied chains
// have a valid solution before rendering the robot movement
Robot.prototype["@@render"] = function(opts) {

  var passed = true;

  opts = opts || {};

  this.chains.forEach( function(chain, index) {
    if (typeof opts[index] === "undefined") {
      opts[index] = chain.devices.last.target;
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

Chain.prototype["@@normalize"] = function(keyFrameSet) {
  keyFrameSet.forEach( function(keyFrames) {
    var last;

    // If first element is null, use last position
    if (keyFrames[0] === null) {
      keyFrames[0] = { position: this.position };
    }

    keyFrames.forEach( function(keyFrame, keyFrameIndex) {

      // If false is passed, use prior keyFrame value
      if (keyFrame === false) {
        keyFrames[keyFrameIndex] = last;
        keyFrame = last;
      }

      // Handle false being passed in a three tuple
      if (keyFrame !== null && Array.isArray(keyFrame.position)) {
        keyFrame.position.forEach ( function(vector, vectorIndex) {
          if (vector === false) {
            keyFrames[keyFrameIndex].position[vectorIndex] = keyFrames[keyFrameIndex - 1].position[vectorIndex];
          }
        });
      }

      if (keyFrame !== null) {
        last = keyFrame;
      }
    });

    // If last element is null, use last position
    if (keyFrames[keyFrames.length - 1] === null) {
      keyFrames[keyFrames.length - 1] = last;
    }

  }, this);
  return keyFrameSet;
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

  var rotationMatrix = new rotate.RotY(roll);
  posVector = rotationMatrix.dot(posVector);
  oPosVector = rotationMatrix.dot(oPosVector);

  rotationMatrix = new rotate.RotX(pitch);
  posVector = rotationMatrix.dot(posVector);
  oPosVector = rotationMatrix.dot(oPosVector);

  rotationMatrix = new rotate.RotZ(yaw);
  posVector = rotationMatrix.dot(posVector);
  oPosVector = rotationMatrix.dot(oPosVector);

  // We need to subtract the chain origin from the desired position
  // but there is no vector.subtract() so let's invert the origin
  // and then add the vectors together
  oPosVector = oPosVector.scale(-1);
  posVector = posVector.add(oPosVector);

  return posVector.v;

};

module.exports = {
  Chain: Chain,
  Robot: Robot,
  ikSolvers: ikSolvers
};
