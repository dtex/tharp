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
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServo, mockFemurServo, mockTibiaServo ],
    }, [12, 2, 1]);

    test.equal(angles[0].toPrecision(5), 9.4623);
    test.equal(angles[1].toPrecision(5), 62.593);
    test.equal(angles[2].toPrecision(5), -96.203);

    test.done();
  },

  // Quadrant 2 on the XY plane, quadrant 1 or 2 on the XZ plane
  q2xq12: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, 2, 1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 117.41);
    test.equal(angles[2].toPrecision(5), 276.20);

    test.done();
  },

  // Quadrant 3 on the XY plane, quadrant 1 or 2 on the XZ plane
  q3xq12: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, -2, 1]);

    test.equal(angles[0].toPrecision(5), 189.46);
    test.equal(angles[1].toPrecision(5), 117.41);
    test.equal(angles[2].toPrecision(5), 276.20);

    test.done();
  },

  // Quadrant 4 on the XY plane, quadrant 1 or 2 on the XZ plane
  q4xq12: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [12, -2, 1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 242.59);
    test.equal(angles[2].toPrecision(5), 263.80);

    test.done();
  },

  // Quadrant 1 on the XY plane, quadrant 3 or 4 on the XZ plane
  q1xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServo, mockFemurServo, mockTibiaServo ],
    }, [12, 2, -1]);

    test.equal(angles[0].toPrecision(5), 9.4623);
    test.equal(angles[1].toPrecision(5), 53.184);
    test.equal(angles[2].toPrecision(5), -96.203);

    test.done();
  },

  // Quadrant 2 on the XY plane, quadrant 3 or 4 on the XZ plane
  q2xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, 2, -1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 126.82);
    test.equal(angles[2].toPrecision(5), 276.20);

    test.done();
  },

  // Quadrant 3 on the XY plane, quadrant 3 or 4 on the XZ plane
  q3xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [-12, -2, -1]);

    test.equal(angles[0].toPrecision(5), 189.46);
    test.equal(angles[1].toPrecision(5), 126.82);
    test.equal(angles[2].toPrecision(5), 276.20);

    test.done();
  },

  // Quadrant 4 on the XY plane, quadrant 3 or 4 on the XZ plane
  q4xq34: function(test) {

    test.expect(3);

    var angles = tharp.ikSolvers["ZYY"]({
      segments: { femur: 7.6125, tibia: 10.4 },
      devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
    }, [12, -2, -1]);

    test.equal(angles[0].toPrecision(5), 170.54);
    test.equal(angles[1].toPrecision(5), 233.18);
    test.equal(angles[2].toPrecision(5), 263.80);

    test.done();
  },
};
