var test = require('tape');
var SBS = require('./');
test('works', function (t) {
  t.plan(2);
  var answers = [6, 3, 104];
  t.plan(answers.length);
  var i = -1;
  var sbs = new SBS(100);
  sbs.on('data', function (d) {
    t.equals(d.length, answers[++i], answers[i]);
  });
  sbs.write('abc');
  sbs.write('123');
  process.nextTick(function () {
    sbs.write('xyz');
    process.nextTick(function () {
      sbs.write('pqr');
      var buff = new Buffer(101);
      buff.fill(8);
      sbs.write(buff);
      sbs.end();
    });
  });
});