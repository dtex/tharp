var sinon = require("sinon"),
  tharp = require("../index.js");


  var protoProperties = [{
    name: "@@normalize"
  }];

  var instanceProperties = [{
    name: "chains"
  },{
    name: "@@render"
  },{
    name: "offset"
  },{
    name: "orientation"
  }];

  // Doesn't actually do anything. We just spy on it.
  var mockChain = {
    devices: {
      "@@normalize": function(keyFrames) {
        if(keyFrames) {
          return keyFrames;
        }
      },
      "@@render": function(keyFrames) {
        if(keyFrames) {
          return keyFrames;
        }
      }
    },
    solve: function() {
      var angles = [1,0,1];
      return angles;
    }
  };


exports["Robot"] = {
  setUp: function(done) {

    this.robot = new tharp.Robot({
      chains: [mockChain, mockChain],
      robotType: "hexapod"
    });

    this.normalizeSpy = sinon.spy(mockChain.devices, "@@normalize");
    this.chainSolveSpy = sinon.spy(mockChain, "solve");
    this.solveSpy = sinon.spy(this.robot, "@@render");

    done();
  },

  tearDown: function(done) {
    this.normalizeSpy.restore();
    this.chainSolveSpy.restore();
    this.solveSpy.restore();
    done();
  },

  shape: function(test) {
    test.expect(protoProperties.length + instanceProperties.length);

    protoProperties.forEach(function(method) {
      test.equal(typeof this.robot[method.name], "function");
    }, this);

    instanceProperties.forEach(function(property) {
      test.notEqual(typeof this.robot[property.name], "undefined");
    }, this);

    test.done();

  },

  normalize: function(test) {

    test.expect(1);

    this.robot["@@normalize"]([
      [0, 1, 2, 3],
      [0, 1, 2, 3]
    ]);

    test.equal(this.normalizeSpy.callCount, 2);
    test.done();
  },

  render: function(test) {

    test.expect(2);

    this.robot["@@render"]([
      [0, 1, 2, 3],
      [0, 1, 2, 3]
    ]);

    test.equal(this.solveSpy.callCount, 1);
    test.equal(this.chainSolveSpy.callCount, 2);
    test.done();
  }
};
