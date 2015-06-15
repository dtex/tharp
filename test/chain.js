var sinon = require("sinon"),
  tharp = require("../index.js");

var protoProperties = [{
  name: "solve"
},{
  name: "eePosition"
}];

var instanceProperties = [{
  name: "devices"
},{
  name: "chainType"
},{
  name: "segments"
},{
  name: "origin"
},{
  name: "position"
},{
  name: "require"
}];

var mockServo = {
  "@@render": function(angles) {
    return angles;
  }
};

exports["Chain"] = {
  setUp: function(done) {

    this.chain = new tharp.Chain({
      actuators: [ mockServo, mockServo, mockServo ],
      chainType: "CoxaY-FemurZ-TibiaZ",
      origin: [4, 2, 8],
      segments: { femur: 7.6125, tibia: 10.4 },
      position: [11.25, 0, 12.15]
    });

    this.renderSpy = sinon.spy(mockServo, "@@render");
    this.eePositionSpy = sinon.spy(this.chain, "eePosition");

    done();
  },

  tearDown: function(done) {
    this.renderSpy.restore();
    this.eePositionSpy.restore();
    done();
  },

  shape: function(test) {
    test.expect(protoProperties.length + instanceProperties.length);

    protoProperties.forEach(function(method) {
      test.equal(typeof this.chain[method.name], "function");
    }, this);

    instanceProperties.forEach(function(property) {
      test.notEqual(typeof this.chain[property.name], "undefined");
    }, this);

    test.done();

  },

  eePositionFlat: function(test) {

    test.expect(3);

    var eePos = this.chain.eePosition({
      position: [10, 10, 10],
      origin: [4, 2, 8]
    });

    test.equal(eePos[0], 6);
    test.equal(eePos[1], 8);
    test.equal(eePos[2], 2);
    test.done();
  },

  eePositionRoll: function(test) {

    test.expect(3);

    var eePos = this.chain.eePosition({
      position: [10, 10, 10],
      origin: [4, 2, 8],
      orientation: {
        roll: 0.2
      }
    });

    test.equal(eePos[0].toPrecision(5), 4.2910);
    test.equal(eePos[1].toPrecision(5), 9.0325);
    test.equal(eePos[2], 2);
    test.done();
  },

  eePositionPitch: function(test) {

    test.expect(3);

    var eePos = this.chain.eePosition({
      position: [10, 10, 10],
      origin: [4, 2, 8],
      orientation: {
        pitch: 0.2
      }
    });

    test.equal(eePos[0].toPrecision(5), 6);
    test.equal(eePos[1].toPrecision(5), 7.4432);
    test.equal(eePos[2].toPrecision(5), 3.5495);
    test.done();
  },

  eePositionYaw: function(test) {

    test.expect(3);

    var eePos = this.chain.eePosition({
      position: [10, 10, 10],
      origin: [4, 2, 8],
      orientation: {
        yaw: 0.2
      }
    });

    test.equal(eePos[0].toPrecision(5), 6.2777);
    test.equal(eePos[1].toPrecision(5), 8);
    test.equal(eePos[2].toPrecision(5), 0.76812);
    test.done();
  },

  eePositionCompound: function(test) {

    test.expect(3);

    var eePos = this.chain.eePosition({
      position: [10, 10, 10],
      origin: [4, 2, 8],
      orientation: {
        roll: 0.2,
        pitch: 0.2,
        yaw: 0.2
      }
    });

    test.equal(eePos[0].toPrecision(5), 4.9514);
    test.equal(eePos[1].toPrecision(5), 8.4552);
    test.equal(eePos[2].toPrecision(5), 2.8273);
    test.done();
  }
};
