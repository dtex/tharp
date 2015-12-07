var //sinon = require("sinon"),
  tharp = require("../index.js");

var mockServo = function(opts) {
  this["@@render"] = function(angles) {
    return angles;
  };

  this.range = opts.range;
};

var mockCoxaServo = new mockServo({ range: [-45, 45]});
var mockFemurServo = new mockServo({ range: [-80, 78]});
var mockTibiaServo = new mockServo({ range: [-160, -10]});

var mockCoxaServoLeft = new mockServo({ range: [135, 225]});
var mockFemurServoLeft = new mockServo({ range: [102, 260]});
var mockTibiaServoLeft = new mockServo({ range: [190, 340]});

exports["ZYY"] = {

  // Quadrant 1 on the XY plane, quadrant 1 or 2 on the XZ plane
  q1xq12: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServo, mockFemurServo, mockTibiaServo ],
    }, [12, 2, 1]);

    test.equal(angles[0].toPrecision(5), 9.4623);
    test.equal(angles[1].toPrecision(5), 66.237);
    test.equal(angles[2].toPrecision(5), -101.24);

    test.done();
  },

  // Quadrant 2 on the XY plane, quadrant 1 or 2 on the XZ plane
  q2xq12: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, 2, 1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 124.26);
    test.equal(angles[2].toPrecision(5), 266.32);

    test.done();
  },

  // Quadrant 3 on the XY plane, quadrant 1 or 2 on the XZ plane
  q3xq12: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, -2, 1]);

    test.equal(angles[0].toPrecision(5), 189.46);
    test.equal(angles[1].toPrecision(5), 113.76);
    test.equal(angles[2].toPrecision(5), 281.24);

    test.done();
  },

  // Quadrant 4 on the XY plane, quadrant 1 or 2 on the XZ plane
  q4xq12: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [12, -2, 1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 246.24);
    test.equal(angles[2].toPrecision(5), 258.76);

    test.done();
  },

  // Quadrant 1 on the XY plane, quadrant 3 or 4 on the XZ plane
  q1xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServo, mockFemurServo, mockTibiaServo ],
    }, [12, 2, -1]);

    test.equal(angles[0].toPrecision(5), 9.4623);
    test.equal(angles[1].toPrecision(5), 56.359);
    test.equal(angles[2].toPrecision(5), -101.24);

    test.done();
  },

  // Quadrant 2 on the XY plane, quadrant 3 or 4 on the XZ plane
  q2xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, 2, -1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 132.91);
    test.equal(angles[2].toPrecision(5), 266.32);

    test.done();
  },

  // Quadrant 3 on the XY plane, quadrant 3 or 4 on the XZ plane
  q3xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, -2, -1]);

    test.equal(angles[0].toPrecision(5), 189.46);
    test.equal(angles[1].toPrecision(5), 123.64);
    test.equal(angles[2].toPrecision(5), 281.24);

    test.done();
  },

  // Quadrant 4 on the XY plane, quadrant 3 or 4 on the XZ plane
  q4xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      links: [ 2.6, 7.6125, 10.4 ],
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [12, -2, -1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 236.36);
    test.equal(angles[2].toPrecision(5), 258.76);

    test.done();
  },
};
