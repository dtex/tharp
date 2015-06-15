var tharp = require("../index.js");

exports["Utils"] = {

  radToDeg: function(test) {

    test.expect(1);

    var deg = tharp.radToDeg(1);
    test.equal(deg.toPrecision(5), 57.296);

    test.done();
  },

  degToRad: function(test) {

    test.expect(1);

    var rad = tharp.degToRad(90);
    test.equal(rad.toPrecision(5), 1.5708);

    test.done();
  },

  solveAngle: function(test) {

    test.expect(1);

    var angle = tharp.solveAngle(1, 1, Math.sqrt(2));
    test.equal(angle.toPrecision(5), 1.5708);

    test.done();
  },

  findValidAngle: function(test) {

    test.expect(3);

    var angle = tharp.findValidAngle(1.5708, [0,180]);
    test.equal(angle.toPrecision(5), 90);

    angle = tharp.findValidAngle(1.5708, [180,360]);
    test.equal(angle.toPrecision(5), 270);

    angle = tharp.findValidAngle(1.5708, [-180,0]);
    test.equal(angle.toPrecision(5), -90);

    test.done();
  }

};
