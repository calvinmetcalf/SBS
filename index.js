var Transform = require('readable-stream').Transform;
var inherits = require('inherits');
module.exports = SyncBuffer;
inherits(SyncBuffer, Transform);
function SyncBuffer(max){
  Transform.call(this);
  this._inprogress = false;
  this._cache = [];
  this._clen = 0;
  this._max = max || Infinity;
}
SyncBuffer.prototype._drain = function () {
  if (this._inprogress) {
    return;
  }
  var self = this;
  this._inprogress = true;
  process.nextTick(function () {
    if (!self._inprogress) {
      return;
    }
    self._ondrain();
  });
};
SyncBuffer.prototype._ondrain = function () {
  if (!this._clen) {
    return;
  }
  var len = this._clen;
  this._clen = 0;
  var cache = this._cache;
  this._cache = [];
  this.push(Buffer.concat(cache, len));
  this._inprogress = false;
};
SyncBuffer.prototype._transform = function (chunk, _, next) {
  this._cache.push(chunk);
  this._clen += chunk.length;
  if (this._clen > this._max) {
    this._ondrain();
  } else {
   this._drain();
  }
  next();
};

SyncBuffer.prototype._flush = function (next) {
  this._ondrain();
  next();
};