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

exports["CoxaY-FemurZ-TibiaZ"] = {

  // q1xq34: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServo, mockFemurServo, mockTibiaServo ],
  //   }, [6, 4, 2]);
  //
  //   test.equal(angles[0].toPrecision(5), 18.435);
  //   test.equal(angles[1].toPrecision(5), 53.218);
  //   test.equal(angles[2].toPrecision(5), -134.06);
  //
  //   test.done();
  // },

  // q2xq34: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
  //   }, [-6, 4, 2]);
  //
  //   test.equal(angles[0].toPrecision(5), 161.57);
  //   test.equal(angles[1].toPrecision(5), 164.91);
  //   test.equal(angles[2].toPrecision(5), 293.10);
  //
  //   test.done();
  // },

  // q3xq34: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
  //   }, [-6, 4, -2]);
  //
  //   test.equal(angles[0].toPrecision(5), 161.57);
  //   test.equal(angles[1].toPrecision(5), 164.91);
  //   test.equal(angles[2].toPrecision(5), 293.10);
  //
  //   test.done();
  // },

  // q4xq34: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
  //   }, [6, 4, -2]);
  //
  //   test.equal(angles[0].toPrecision(5), 161.57);
  //   test.equal(angles[1].toPrecision(5), 164.91);
  //   test.equal(angles[2].toPrecision(5), 293.10);
  //
  //   test.done();
  // },
  //
  // q1xq12: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServo, mockFemurServo, mockTibiaServo ],
  //   }, [6, -4, 2]);
  //
  //   test.equal(angles[0].toPrecision(5), 18.435);
  //   test.equal(angles[1].toPrecision(5), 15.094);
  //   test.equal(angles[2].toPrecision(5), -113.10);
  //
  //   test.done();
  // },

  // q2xq12: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
  //   }, [-6, -4, 2]);
  //
  //   test.equal(angles[0].toPrecision(5), 161.57);
  //   test.equal(angles[1].toPrecision(5), 164.91);
  //   test.equal(angles[2].toPrecision(5), 293.10);
  //
  //   test.done();
  // },

  // q3xq12: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
  //   }, [-6, -4, -2]);
  //
  //   test.equal(angles[0].toPrecision(5), 161.57);
  //   test.equal(angles[1].toPrecision(5), 164.91);
  //   test.equal(angles[2].toPrecision(5), 293.10);
  //
  //   test.done();
  // },

  // q4xq12: function(test) {
  //
  //   test.expect(3);
  //
  //   var angles = tharp.ikSolvers["CoxaY-FemurZ-TibiaZ"]({
  //     segments: { femur: 7.6125, tibia: 10.4 },
  //     devices: [ mockCoxaServoLeft, mockFemurServoLeft, mockTibiaServoLeft ],
  //   }, [6, -4, -2]);
  //
  //   test.equal(angles[0].toPrecision(5), 161.57);
  //   test.equal(angles[1].toPrecision(5), 164.91);
  //   test.equal(angles[2].toPrecision(5), 293.10);
  //
  //   test.done();
  // }
};
