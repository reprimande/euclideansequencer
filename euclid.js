(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Sequencer = require('./lib/sequencer');
global.euclid = {
  Sequencer: Sequencer
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/sequencer":3}],2:[function(require,module,exports){
var Bjorklund = {
  compute: function(pulses, steps) {
    if (steps <= 0) {
      return [];
    }
    if (pulses <= 0) {
      return (new Array(steps)).map(function() {return 0;});
    }
    if (pulses > steps) {
      pulses = steps;
    }
    var pattern = [],
        counts = [],
        reminders = [],
        divisor = steps - pulses,
        level = 0, i = 0;

    var build = function(level) {
      if (level === -1) {
        pattern.push(0);
      } else if (level === -2) {
        pattern.push(1);
      } else {
        for (var i = 0; i < counts[level]; i++) {
          build(level - 1);
        }
        if (reminders[level] !== 0) {
          build(level - 2);
        }
      }
    };
    reminders.push(pulses);
    while (true) {
      counts.push((divisor / reminders[level]) | 0);
      reminders.push(divisor % reminders[level]);
      divisor = reminders[level];
      level++;
      if (reminders[level] <= 1) {
        break;
      }
    }
    counts.push(divisor);

    build(level);
    i = pattern.indexOf(1);
    return pattern.slice(i).concat(pattern.slice(0, i));
  }
};

module.exports = Bjorklund;
},{}],3:[function(require,module,exports){
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
},{"./bjorklund":2}]},{},[1])