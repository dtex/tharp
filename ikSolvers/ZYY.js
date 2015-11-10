var utils = require("../lib/utils.js");

module.exports = function(chain, offsetPosition) {

  var angles = [], degrees = [];

  // Put the coordinates into seperate variables for readability
  var xd = offsetPosition[0];
  var yd = offsetPosition[1];
  var zd = offsetPosition[2];

  // Calculate the first joint angle in radians.
  // This is a simple 2D right triangle solve (yay)
  angles[0] = Math.atan(yd/xd);

  // Make sure we have a the correct solution
  degrees[0] = utils.findValidAngle(angles[0], chain.devices[0].range);

  // We still need this in radians
  angles[0] = utils.degToRad(degrees[0]);

  // Subtract the first segment from our offset
  yd = yd - Math.cos(angles[0]) * chain.segments[0];
  xd = xd - Math.sin(angles[0]) * chain.segments[0];

  // We use the squares of these a lot so let's store the result
  var xd_sq = xd * xd;
  var yd_sq = yd * yd;
  var zd_sq = zd * zd;

  // This is the 3D hypoteneuse from the 2nd joint to the end effector
  var hypot = Math.sqrt(xd_sq + yd_sq + zd_sq);

  // This is the 2D hypoteneuse on the x/y plane.
  var hypot2d = Math.sqrt(xd_sq + yd_sq);

  // This is a slightly tougher triangle solve
  angles[2] = utils.solveAngle(chain.segments[1], chain.segments[2], hypot);

  // Our last triangle solve
  angles[1] = utils.solveAngle(chain.segments[1], hypot, chain.segments[2]);

  // But wait! The 2nd joint angle returned represents the angle between the
  // 2nd joint and the 2D hypoteneuse but we actually want the angle between
  // the 2nd joint servo's axis of rotation and the 2nd joint so we need to
  // subtract the angle described by the end effector, the 2nd joint origin
  // and the 2nd joint's axis of rotation.
  // It really is easier than I make it sound.
  angles[1] += Math.sin(zd/hypot2d);

  // If the chain is on the left side we need to modify our solutions
  if (offsetPosition[0] < 0) {
    angles[1] = Math.PI - angles[1];
    angles[2] = Math.PI - angles[2];
  }

  // Just two things left: The angles are in radians (we need degrees
  // for our servo) and the angles may or may not be within our servo's
  // range. Fix that with findValidAngle().
  degrees[1] = utils.findValidAngle(angles[1], chain.devices[1].range);
  degrees[2] = utils.findValidAngle(angles[2], chain.devices[2].range);

  return degrees;
};
