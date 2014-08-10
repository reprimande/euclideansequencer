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