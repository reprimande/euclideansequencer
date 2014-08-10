var Timer = function() {
  this.interval = 100;
  this.prev = this.getCurrentTime();
  this.timer = null;
};
Timer.prototype = {
  getCurrentTime: function() {
    return (new Date()).getTime();
  },
  start: function() {
    var that = this;
    if (!that.timer) {
      that.prev = that.getCurrentTime();
      that.timer = setInterval(function() {
        var current = that.getCurrentTime();
        if (current > that.prev + that.interval) {
          if (that.ontick) that.ontick.apply(that, []);
          that.prev = current;
        }
      }, 1);
    }
  },
  stop: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  setInterval: function(interval) {
    this.interval = parseInt(interval, 10);
    this.prev = this.getCurrentTime();
  }
};
var timer = new Timer();
timer.ontick = function() {
  self.postMessage("tick");
}
self.onmessage = function(e) {
  if (e.data.message === "start") {
    timer.start();
  } else if (e.data.message === "stop") {
    timer.stop();
  } else if (e.data.message === "interval") {
    timer.setInterval(e.data.value);
  }
};