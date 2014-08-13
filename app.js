var Sampler = function(ctx, url) {
  this.ctx = ctx;
  this.buffer = null;
  if (url) {
    this.load(url);
  }
};
Sampler.prototype = {
  load: function(url) {
    var that = this,
        req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.onload = function() {
      that.ctx.decodeAudioData(req.response, function(buffer) {
        that.buffer = buffer
      });
    };
    req.send();
  },
  play: function() {
    if (this.buffer) {
      var source = this.ctx.createBufferSource();
      source.buffer = this.buffer;
      source.connect(this.ctx.destination);
      source.start(0);
    }
  }
};

var Track = function(ctx, name, url) {
  var self = this;
  this.ctx = ctx;
  this.name = name;
  this.sequencer = new euclid.Sequencer();
  this.sampler = new Sampler(ctx, url);
  this.sequencer.ontrigger = function() {
    self.sampler.play();
  }
};

var Clock = function() {
  var that = this;
  this.worker = new Worker("timer.js");
  this.worker.addEventListener("message", function(e) {
    if (e.data === "tick") {
      if (that.ontick) that.ontick.apply(that, []);
    }
  });
};
Clock.prototype = {
  start: function() {
    this.worker.postMessage({"message": "start"});
  },
  stop: function() {
    this.worker.postMessage({"message": "stop"});
  },
  setInterval: function(interval) {
    this.interval = interval;
    this.worker.postMessage({"message": "interval", "value": interval});
  }
};

var ctx = (window.AudioContext !== (void 0)) ? new AudioContext() : new webkitAudioContext(),
    tracks = [],
    clock = new Clock();
tracks.push(new Track(ctx, "kick", "audio/kick.mp3"));
tracks.push(new Track(ctx, "snare", "audio/snare.mp3"));
tracks.push(new Track(ctx, "cl hat", "audio/close_hat.mp3"));
tracks.push(new Track(ctx, "op hat", "audio/open_hat.mp3"));
clock.ontick = function() {
  tracks.forEach(function(track) {
    track.sequencer.next();
  });
};

var app = angular.module("euclidRhythmApp", ['vr.directives.slider']);
app.controller("MasterCtrl", function($scope) {
  var bpm2ms = function(bpm) {
    return ((60 * 1000) / bpm) / 8;
  };
  $scope.bpm = 80;
  clock.setInterval(bpm2ms($scope.bpm));
  $scope.onoff = false;
  $scope.resetting = false;
  $scope.$on("changeBpm", function() {
    clock.setInterval(bpm2ms($scope.bpm));
  });
  $scope.$on("seqOnOff", function() {
    $scope.onoff = $scope.onoff === false ? true: false;
    if ($scope.onoff) {
      clock.start();
    } else {
      clock.stop();
    }
  });
  $scope.$on("resetMousedown", function() {
    tracks.forEach(function(track) {
      track.sequencer.reset();
    });
    $scope.resetting = true;
  });
  $scope.$on("resetMouseup", function() {
    $scope.resetting = false;
  });
  $scope.isSeqon = function() {
    return $scope.onoff;
  };
  $scope.isResetting = function() {
    return $scope.resetting;
  };
});

app.controller("TrackListCtrl", function($scope) {
  $scope.tracks = tracks;
});
app.controller("TrackCtrl", function($scope) {
  var track = $scope.track,
      sequencer = track.sequencer;
  $scope.steps = sequencer.rhythm;
  $scope.length = sequencer.length;
  $scope.pulses = sequencer.pulses;
  $scope.current = sequencer.current;

  sequencer.onstep = function(current, val) {
    $scope.current = current;
    $scope.$$phase || $scope.$apply();
  };

  $scope.$on("changeLength", function() {
    sequencer.setLength($scope.length);
    $scope.steps = sequencer.rhythm;
  });
  $scope.$on("changePulses", function() {
    sequencer.setPulses($scope.pulses);
    $scope.steps = sequencer.rhythm;
  });

  $scope.isCurrent = function(index) {
    return $scope.current === index;
  };
  $scope.isActive = function(index) {
    return sequencer.rhythm[index] === 1;
  };
});
