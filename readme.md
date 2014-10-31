Sync Buffer Stream [![Build Status](https://travis-ci.org/calvinmetcalf/SBS.svg)](https://travis-ci.org/calvinmetcalf/SBS)
====

A stream that synchronously buffers and then drains on the next tick. For use when you want to consolidate the chunks that get passed to another stream.  Accepts an optional size argument which will trigger a synchronous drain.

```js
var SBS = require('SBS');
var sbs = new SBS(1024);

sbs.on('data', function (d) {
  console.log('chunk is %s bytes long', d.length);
});
sbs.write('foo');
sbs.write('bar');
process.nextTick(function (){
  sbs.write('baz');
});
// chunk is 6 bytes long
// chunk is 3 bytes long
```

why
---

take the stream created by this function

```js
function createHmacer(key) {
  return through2.obj(function (chunk, _, next) {
    var out = {data: chunk};
    out.hash = crypto.createHmac('sha512', key).update(chunk).digest();
    next(null, out);
  });
}
```

it generates an hmac for each chunk it gets and outputs it as an object, as a sha512 hash is 64 bytes this adds a bit of overhead so we'd like to consolidate message as much as possible, but that being said if we get a small standalone message we'd still like that to be sent, i.e. something like.

```js
var stream = new PassThrough();
var i = 0;
while (i++ < 200) {
  stream.write(i.toString());
}
var int = setInterval(function (){
  
    stream.write(i.toString());
  if (++i > 210) {
    clearInterval(int);
  }
}, 1000);
```

if you pipe that directly to createHmacer it'll compute 210 hmacs, you pipe it through this and it'll compute 11, if you don't want to buffer more then 100 bytes worth of stuff, you can set the max cache  to 100 and it'll compute 15 hmacs.

```js
// 210
stream.pipe().pipe(createHmacer('key'));
// 11
stream.pipe(new SyncBufferStream()).pipe(createHmacer('key'));
// 15
stream.pipe(new SyncBufferStream(100)).pipe(createHmacer('key'));
```