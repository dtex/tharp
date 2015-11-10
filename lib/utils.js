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

module.exports = {
  radToDeg: radToDeg,
  degToRad: degToRad,
  solveAngle: solveAngle,
  findValidAngle: findValidAngle
};
