var Sampler = function(url) {
  if (url) {
    this.load(url);
  }
};
Sampler.prototype = {
  load: function(url) {
    var audio = new Audio(url);
    this.audio = audio;
  },
  play: function() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play();
    }
  }
};

var Track = function(name, url) {
  var self = this;
  this.name = name;
  this.sequencer = new euclid.Sequencer();
  this.sampler = new Sampler(url);
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

var tracks = [],
    clock = new Clock();
tracks.push(new Track("kick", "audio/kick.mp3"));
tracks.push(new Track("snare", "audio/snare.mp3"));
tracks.push(new Track("cl hat", "audio/close_hat.mp3"));
tracks.push(new Track("op hat", "audio/open_hat.mp3"));
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
  $scope.bpm = 120;
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
