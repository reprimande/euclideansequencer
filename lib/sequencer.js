var Bjorklund = require("./bjorklund");

var Sequencer = function() {
  this.current = 0;
  this.length = 16;
  this.pulses = 4;
  this.rhythm = [];
  this.onchange = null
  this.ontrigger = null;
  this.onstep = null;
  this.build();
};

Sequencer.prototype = {
  step: function(index) {
    this.onstep && this.onstep.apply(this, [index, this.rhythm[index]]);
    if (this.rhythm[index] === 1) {
      this.ontrigger && this.ontrigger.apply(this);
    }
  },
  next: function() {
    this.step(this.current);
    this.current++;
    if (this.current >= this.length) {
      this.current = 0;
    }
  },
  reset: function() {
    this.current = 0;
    this.step(this.current);
  },
  setLength: function(length) {
    this.length = parseInt(length, 10);
    this.build();
  },
  setPulses: function(pulses) {
    this.pulses = parseInt(pulses, 10);
    this.build();
  },
  build: function() {
    this.rhythm = Bjorklund.compute(this.pulses, this.length);
    this.onchange && this.onchange.apply(this, [this.rhythm, this.pulses, this.length]);
  }
};

module.exports = Sequencer;