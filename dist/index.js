(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Bees = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function symbolObservablePonyfill(root) {
    	var result;
    	var Symbol = root.Symbol;

    	if (typeof Symbol === 'function') {
    		if (Symbol.observable) {
    			result = Symbol.observable;
    		} else {
    			result = Symbol('observable');
    			Symbol.observable = result;
    		}
    	} else {
    		result = '@@observable';
    	}

    	return result;
    }

    /* global window */

    var root;

    if (typeof self !== 'undefined') {
      root = self;
    } else if (typeof window !== 'undefined') {
      root = window;
    } else if (typeof global !== 'undefined') {
      root = global;
    } else if (typeof module !== 'undefined') {
      root = module;
    } else {
      root = Function('return this')();
    }

    var result = symbolObservablePonyfill(root);

    var xstream = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    var NO = {};
    exports.NO = NO;
    function noop() { }
    function cp(a) {
        var l = a.length;
        var b = Array(l);
        for (var i = 0; i < l; ++i)
            b[i] = a[i];
        return b;
    }
    function and(f1, f2) {
        return function andFn(t) {
            return f1(t) && f2(t);
        };
    }
    function _try(c, t, u) {
        try {
            return c.f(t);
        }
        catch (e) {
            u._e(e);
            return NO;
        }
    }
    var NO_IL = {
        _n: noop,
        _e: noop,
        _c: noop,
    };
    exports.NO_IL = NO_IL;
    // mutates the input
    function internalizeProducer(producer) {
        producer._start = function _start(il) {
            il.next = il._n;
            il.error = il._e;
            il.complete = il._c;
            this.start(il);
        };
        producer._stop = producer.stop;
    }
    var StreamSub = /** @class */ (function () {
        function StreamSub(_stream, _listener) {
            this._stream = _stream;
            this._listener = _listener;
        }
        StreamSub.prototype.unsubscribe = function () {
            this._stream._remove(this._listener);
        };
        return StreamSub;
    }());
    var Observer = /** @class */ (function () {
        function Observer(_listener) {
            this._listener = _listener;
        }
        Observer.prototype.next = function (value) {
            this._listener._n(value);
        };
        Observer.prototype.error = function (err) {
            this._listener._e(err);
        };
        Observer.prototype.complete = function () {
            this._listener._c();
        };
        return Observer;
    }());
    var FromObservable = /** @class */ (function () {
        function FromObservable(observable) {
            this.type = 'fromObservable';
            this.ins = observable;
            this.active = false;
        }
        FromObservable.prototype._start = function (out) {
            this.out = out;
            this.active = true;
            this._sub = this.ins.subscribe(new Observer(out));
            if (!this.active)
                this._sub.unsubscribe();
        };
        FromObservable.prototype._stop = function () {
            if (this._sub)
                this._sub.unsubscribe();
            this.active = false;
        };
        return FromObservable;
    }());
    var Merge = /** @class */ (function () {
        function Merge(insArr) {
            this.type = 'merge';
            this.insArr = insArr;
            this.out = NO;
            this.ac = 0;
        }
        Merge.prototype._start = function (out) {
            this.out = out;
            var s = this.insArr;
            var L = s.length;
            this.ac = L;
            for (var i = 0; i < L; i++)
                s[i]._add(this);
        };
        Merge.prototype._stop = function () {
            var s = this.insArr;
            var L = s.length;
            for (var i = 0; i < L; i++)
                s[i]._remove(this);
            this.out = NO;
        };
        Merge.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            u._n(t);
        };
        Merge.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Merge.prototype._c = function () {
            if (--this.ac <= 0) {
                var u = this.out;
                if (u === NO)
                    return;
                u._c();
            }
        };
        return Merge;
    }());
    var CombineListener = /** @class */ (function () {
        function CombineListener(i, out, p) {
            this.i = i;
            this.out = out;
            this.p = p;
            p.ils.push(this);
        }
        CombineListener.prototype._n = function (t) {
            var p = this.p, out = this.out;
            if (out === NO)
                return;
            if (p.up(t, this.i)) {
                var a = p.vals;
                var l = a.length;
                var b = Array(l);
                for (var i = 0; i < l; ++i)
                    b[i] = a[i];
                out._n(b);
            }
        };
        CombineListener.prototype._e = function (err) {
            var out = this.out;
            if (out === NO)
                return;
            out._e(err);
        };
        CombineListener.prototype._c = function () {
            var p = this.p;
            if (p.out === NO)
                return;
            if (--p.Nc === 0)
                p.out._c();
        };
        return CombineListener;
    }());
    var Combine = /** @class */ (function () {
        function Combine(insArr) {
            this.type = 'combine';
            this.insArr = insArr;
            this.out = NO;
            this.ils = [];
            this.Nc = this.Nn = 0;
            this.vals = [];
        }
        Combine.prototype.up = function (t, i) {
            var v = this.vals[i];
            var Nn = !this.Nn ? 0 : v === NO ? --this.Nn : this.Nn;
            this.vals[i] = t;
            return Nn === 0;
        };
        Combine.prototype._start = function (out) {
            this.out = out;
            var s = this.insArr;
            var n = this.Nc = this.Nn = s.length;
            var vals = this.vals = new Array(n);
            if (n === 0) {
                out._n([]);
                out._c();
            }
            else {
                for (var i = 0; i < n; i++) {
                    vals[i] = NO;
                    s[i]._add(new CombineListener(i, out, this));
                }
            }
        };
        Combine.prototype._stop = function () {
            var s = this.insArr;
            var n = s.length;
            var ils = this.ils;
            for (var i = 0; i < n; i++)
                s[i]._remove(ils[i]);
            this.out = NO;
            this.ils = [];
            this.vals = [];
        };
        return Combine;
    }());
    var FromArray = /** @class */ (function () {
        function FromArray(a) {
            this.type = 'fromArray';
            this.a = a;
        }
        FromArray.prototype._start = function (out) {
            var a = this.a;
            for (var i = 0, n = a.length; i < n; i++)
                out._n(a[i]);
            out._c();
        };
        FromArray.prototype._stop = function () {
        };
        return FromArray;
    }());
    var FromPromise = /** @class */ (function () {
        function FromPromise(p) {
            this.type = 'fromPromise';
            this.on = false;
            this.p = p;
        }
        FromPromise.prototype._start = function (out) {
            var prod = this;
            this.on = true;
            this.p.then(function (v) {
                if (prod.on) {
                    out._n(v);
                    out._c();
                }
            }, function (e) {
                out._e(e);
            }).then(noop, function (err) {
                setTimeout(function () { throw err; });
            });
        };
        FromPromise.prototype._stop = function () {
            this.on = false;
        };
        return FromPromise;
    }());
    var Periodic = /** @class */ (function () {
        function Periodic(period) {
            this.type = 'periodic';
            this.period = period;
            this.intervalID = -1;
            this.i = 0;
        }
        Periodic.prototype._start = function (out) {
            var self = this;
            function intervalHandler() { out._n(self.i++); }
            this.intervalID = setInterval(intervalHandler, this.period);
        };
        Periodic.prototype._stop = function () {
            if (this.intervalID !== -1)
                clearInterval(this.intervalID);
            this.intervalID = -1;
            this.i = 0;
        };
        return Periodic;
    }());
    var Debug = /** @class */ (function () {
        function Debug(ins, arg) {
            this.type = 'debug';
            this.ins = ins;
            this.out = NO;
            this.s = noop;
            this.l = '';
            if (typeof arg === 'string')
                this.l = arg;
            else if (typeof arg === 'function')
                this.s = arg;
        }
        Debug.prototype._start = function (out) {
            this.out = out;
            this.ins._add(this);
        };
        Debug.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
        };
        Debug.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            var s = this.s, l = this.l;
            if (s !== noop) {
                try {
                    s(t);
                }
                catch (e) {
                    u._e(e);
                }
            }
            else if (l)
                console.log(l + ':', t);
            else
                console.log(t);
            u._n(t);
        };
        Debug.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Debug.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        return Debug;
    }());
    var Drop = /** @class */ (function () {
        function Drop(max, ins) {
            this.type = 'drop';
            this.ins = ins;
            this.out = NO;
            this.max = max;
            this.dropped = 0;
        }
        Drop.prototype._start = function (out) {
            this.out = out;
            this.dropped = 0;
            this.ins._add(this);
        };
        Drop.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
        };
        Drop.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            if (this.dropped++ >= this.max)
                u._n(t);
        };
        Drop.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Drop.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        return Drop;
    }());
    var EndWhenListener = /** @class */ (function () {
        function EndWhenListener(out, op) {
            this.out = out;
            this.op = op;
        }
        EndWhenListener.prototype._n = function () {
            this.op.end();
        };
        EndWhenListener.prototype._e = function (err) {
            this.out._e(err);
        };
        EndWhenListener.prototype._c = function () {
            this.op.end();
        };
        return EndWhenListener;
    }());
    var EndWhen = /** @class */ (function () {
        function EndWhen(o, ins) {
            this.type = 'endWhen';
            this.ins = ins;
            this.out = NO;
            this.o = o;
            this.oil = NO_IL;
        }
        EndWhen.prototype._start = function (out) {
            this.out = out;
            this.o._add(this.oil = new EndWhenListener(out, this));
            this.ins._add(this);
        };
        EndWhen.prototype._stop = function () {
            this.ins._remove(this);
            this.o._remove(this.oil);
            this.out = NO;
            this.oil = NO_IL;
        };
        EndWhen.prototype.end = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        EndWhen.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            u._n(t);
        };
        EndWhen.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        EndWhen.prototype._c = function () {
            this.end();
        };
        return EndWhen;
    }());
    var Filter = /** @class */ (function () {
        function Filter(passes, ins) {
            this.type = 'filter';
            this.ins = ins;
            this.out = NO;
            this.f = passes;
        }
        Filter.prototype._start = function (out) {
            this.out = out;
            this.ins._add(this);
        };
        Filter.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
        };
        Filter.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            var r = _try(this, t, u);
            if (r === NO || !r)
                return;
            u._n(t);
        };
        Filter.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Filter.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        return Filter;
    }());
    var FlattenListener = /** @class */ (function () {
        function FlattenListener(out, op) {
            this.out = out;
            this.op = op;
        }
        FlattenListener.prototype._n = function (t) {
            this.out._n(t);
        };
        FlattenListener.prototype._e = function (err) {
            this.out._e(err);
        };
        FlattenListener.prototype._c = function () {
            this.op.inner = NO;
            this.op.less();
        };
        return FlattenListener;
    }());
    var Flatten = /** @class */ (function () {
        function Flatten(ins) {
            this.type = 'flatten';
            this.ins = ins;
            this.out = NO;
            this.open = true;
            this.inner = NO;
            this.il = NO_IL;
        }
        Flatten.prototype._start = function (out) {
            this.out = out;
            this.open = true;
            this.inner = NO;
            this.il = NO_IL;
            this.ins._add(this);
        };
        Flatten.prototype._stop = function () {
            this.ins._remove(this);
            if (this.inner !== NO)
                this.inner._remove(this.il);
            this.out = NO;
            this.open = true;
            this.inner = NO;
            this.il = NO_IL;
        };
        Flatten.prototype.less = function () {
            var u = this.out;
            if (u === NO)
                return;
            if (!this.open && this.inner === NO)
                u._c();
        };
        Flatten.prototype._n = function (s) {
            var u = this.out;
            if (u === NO)
                return;
            var _a = this, inner = _a.inner, il = _a.il;
            if (inner !== NO && il !== NO_IL)
                inner._remove(il);
            (this.inner = s)._add(this.il = new FlattenListener(u, this));
        };
        Flatten.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Flatten.prototype._c = function () {
            this.open = false;
            this.less();
        };
        return Flatten;
    }());
    var Fold = /** @class */ (function () {
        function Fold(f, seed, ins) {
            var _this = this;
            this.type = 'fold';
            this.ins = ins;
            this.out = NO;
            this.f = function (t) { return f(_this.acc, t); };
            this.acc = this.seed = seed;
        }
        Fold.prototype._start = function (out) {
            this.out = out;
            this.acc = this.seed;
            out._n(this.acc);
            this.ins._add(this);
        };
        Fold.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
            this.acc = this.seed;
        };
        Fold.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            var r = _try(this, t, u);
            if (r === NO)
                return;
            u._n(this.acc = r);
        };
        Fold.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Fold.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        return Fold;
    }());
    var Last = /** @class */ (function () {
        function Last(ins) {
            this.type = 'last';
            this.ins = ins;
            this.out = NO;
            this.has = false;
            this.val = NO;
        }
        Last.prototype._start = function (out) {
            this.out = out;
            this.has = false;
            this.ins._add(this);
        };
        Last.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
            this.val = NO;
        };
        Last.prototype._n = function (t) {
            this.has = true;
            this.val = t;
        };
        Last.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Last.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            if (this.has) {
                u._n(this.val);
                u._c();
            }
            else
                u._e(new Error('last() failed because input stream completed'));
        };
        return Last;
    }());
    var MapOp = /** @class */ (function () {
        function MapOp(project, ins) {
            this.type = 'map';
            this.ins = ins;
            this.out = NO;
            this.f = project;
        }
        MapOp.prototype._start = function (out) {
            this.out = out;
            this.ins._add(this);
        };
        MapOp.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
        };
        MapOp.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            var r = _try(this, t, u);
            if (r === NO)
                return;
            u._n(r);
        };
        MapOp.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        MapOp.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        return MapOp;
    }());
    var Remember = /** @class */ (function () {
        function Remember(ins) {
            this.type = 'remember';
            this.ins = ins;
            this.out = NO;
        }
        Remember.prototype._start = function (out) {
            this.out = out;
            this.ins._add(out);
        };
        Remember.prototype._stop = function () {
            this.ins._remove(this.out);
            this.out = NO;
        };
        return Remember;
    }());
    var ReplaceError = /** @class */ (function () {
        function ReplaceError(replacer, ins) {
            this.type = 'replaceError';
            this.ins = ins;
            this.out = NO;
            this.f = replacer;
        }
        ReplaceError.prototype._start = function (out) {
            this.out = out;
            this.ins._add(this);
        };
        ReplaceError.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
        };
        ReplaceError.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            u._n(t);
        };
        ReplaceError.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            try {
                this.ins._remove(this);
                (this.ins = this.f(err))._add(this);
            }
            catch (e) {
                u._e(e);
            }
        };
        ReplaceError.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        return ReplaceError;
    }());
    var StartWith = /** @class */ (function () {
        function StartWith(ins, val) {
            this.type = 'startWith';
            this.ins = ins;
            this.out = NO;
            this.val = val;
        }
        StartWith.prototype._start = function (out) {
            this.out = out;
            this.out._n(this.val);
            this.ins._add(out);
        };
        StartWith.prototype._stop = function () {
            this.ins._remove(this.out);
            this.out = NO;
        };
        return StartWith;
    }());
    var Take = /** @class */ (function () {
        function Take(max, ins) {
            this.type = 'take';
            this.ins = ins;
            this.out = NO;
            this.max = max;
            this.taken = 0;
        }
        Take.prototype._start = function (out) {
            this.out = out;
            this.taken = 0;
            if (this.max <= 0)
                out._c();
            else
                this.ins._add(this);
        };
        Take.prototype._stop = function () {
            this.ins._remove(this);
            this.out = NO;
        };
        Take.prototype._n = function (t) {
            var u = this.out;
            if (u === NO)
                return;
            var m = ++this.taken;
            if (m < this.max)
                u._n(t);
            else if (m === this.max) {
                u._n(t);
                u._c();
            }
        };
        Take.prototype._e = function (err) {
            var u = this.out;
            if (u === NO)
                return;
            u._e(err);
        };
        Take.prototype._c = function () {
            var u = this.out;
            if (u === NO)
                return;
            u._c();
        };
        return Take;
    }());
    var Stream = /** @class */ (function () {
        function Stream(producer) {
            this._prod = producer || NO;
            this._ils = [];
            this._stopID = NO;
            this._dl = NO;
            this._d = false;
            this._target = NO;
            this._err = NO;
        }
        Stream.prototype._n = function (t) {
            var a = this._ils;
            var L = a.length;
            if (this._d)
                this._dl._n(t);
            if (L == 1)
                a[0]._n(t);
            else if (L == 0)
                return;
            else {
                var b = cp(a);
                for (var i = 0; i < L; i++)
                    b[i]._n(t);
            }
        };
        Stream.prototype._e = function (err) {
            if (this._err !== NO)
                return;
            this._err = err;
            var a = this._ils;
            var L = a.length;
            this._x();
            if (this._d)
                this._dl._e(err);
            if (L == 1)
                a[0]._e(err);
            else if (L == 0)
                return;
            else {
                var b = cp(a);
                for (var i = 0; i < L; i++)
                    b[i]._e(err);
            }
            if (!this._d && L == 0)
                throw this._err;
        };
        Stream.prototype._c = function () {
            var a = this._ils;
            var L = a.length;
            this._x();
            if (this._d)
                this._dl._c();
            if (L == 1)
                a[0]._c();
            else if (L == 0)
                return;
            else {
                var b = cp(a);
                for (var i = 0; i < L; i++)
                    b[i]._c();
            }
        };
        Stream.prototype._x = function () {
            if (this._ils.length === 0)
                return;
            if (this._prod !== NO)
                this._prod._stop();
            this._err = NO;
            this._ils = [];
        };
        Stream.prototype._stopNow = function () {
            // WARNING: code that calls this method should
            // first check if this._prod is valid (not `NO`)
            this._prod._stop();
            this._err = NO;
            this._stopID = NO;
        };
        Stream.prototype._add = function (il) {
            var ta = this._target;
            if (ta !== NO)
                return ta._add(il);
            var a = this._ils;
            a.push(il);
            if (a.length > 1)
                return;
            if (this._stopID !== NO) {
                clearTimeout(this._stopID);
                this._stopID = NO;
            }
            else {
                var p = this._prod;
                if (p !== NO)
                    p._start(this);
            }
        };
        Stream.prototype._remove = function (il) {
            var _this = this;
            var ta = this._target;
            if (ta !== NO)
                return ta._remove(il);
            var a = this._ils;
            var i = a.indexOf(il);
            if (i > -1) {
                a.splice(i, 1);
                if (this._prod !== NO && a.length <= 0) {
                    this._err = NO;
                    this._stopID = setTimeout(function () { return _this._stopNow(); });
                }
                else if (a.length === 1) {
                    this._pruneCycles();
                }
            }
        };
        // If all paths stemming from `this` stream eventually end at `this`
        // stream, then we remove the single listener of `this` stream, to
        // force it to end its execution and dispose resources. This method
        // assumes as a precondition that this._ils has just one listener.
        Stream.prototype._pruneCycles = function () {
            if (this._hasNoSinks(this, []))
                this._remove(this._ils[0]);
        };
        // Checks whether *there is no* path starting from `x` that leads to an end
        // listener (sink) in the stream graph, following edges A->B where B is a
        // listener of A. This means these paths constitute a cycle somehow. Is given
        // a trace of all visited nodes so far.
        Stream.prototype._hasNoSinks = function (x, trace) {
            if (trace.indexOf(x) !== -1)
                return true;
            else if (x.out === this)
                return true;
            else if (x.out && x.out !== NO)
                return this._hasNoSinks(x.out, trace.concat(x));
            else if (x._ils) {
                for (var i = 0, N = x._ils.length; i < N; i++)
                    if (!this._hasNoSinks(x._ils[i], trace.concat(x)))
                        return false;
                return true;
            }
            else
                return false;
        };
        Stream.prototype.ctor = function () {
            return this instanceof MemoryStream ? MemoryStream : Stream;
        };
        /**
         * Adds a Listener to the Stream.
         *
         * @param {Listener} listener
         */
        Stream.prototype.addListener = function (listener) {
            listener._n = listener.next || noop;
            listener._e = listener.error || noop;
            listener._c = listener.complete || noop;
            this._add(listener);
        };
        /**
         * Removes a Listener from the Stream, assuming the Listener was added to it.
         *
         * @param {Listener<T>} listener
         */
        Stream.prototype.removeListener = function (listener) {
            this._remove(listener);
        };
        /**
         * Adds a Listener to the Stream returning a Subscription to remove that
         * listener.
         *
         * @param {Listener} listener
         * @returns {Subscription}
         */
        Stream.prototype.subscribe = function (listener) {
            this.addListener(listener);
            return new StreamSub(this, listener);
        };
        /**
         * Add interop between most.js and RxJS 5
         *
         * @returns {Stream}
         */
        Stream.prototype[result.default] = function () {
            return this;
        };
        /**
         * Creates a new Stream given a Producer.
         *
         * @factory true
         * @param {Producer} producer An optional Producer that dictates how to
         * start, generate events, and stop the Stream.
         * @return {Stream}
         */
        Stream.create = function (producer) {
            if (producer) {
                if (typeof producer.start !== 'function'
                    || typeof producer.stop !== 'function')
                    throw new Error('producer requires both start and stop functions');
                internalizeProducer(producer); // mutates the input
            }
            return new Stream(producer);
        };
        /**
         * Creates a new MemoryStream given a Producer.
         *
         * @factory true
         * @param {Producer} producer An optional Producer that dictates how to
         * start, generate events, and stop the Stream.
         * @return {MemoryStream}
         */
        Stream.createWithMemory = function (producer) {
            if (producer)
                internalizeProducer(producer); // mutates the input
            return new MemoryStream(producer);
        };
        /**
         * Creates a Stream that does nothing when started. It never emits any event.
         *
         * Marble diagram:
         *
         * ```text
         *          never
         * -----------------------
         * ```
         *
         * @factory true
         * @return {Stream}
         */
        Stream.never = function () {
            return new Stream({ _start: noop, _stop: noop });
        };
        /**
         * Creates a Stream that immediately emits the "complete" notification when
         * started, and that's it.
         *
         * Marble diagram:
         *
         * ```text
         * empty
         * -|
         * ```
         *
         * @factory true
         * @return {Stream}
         */
        Stream.empty = function () {
            return new Stream({
                _start: function (il) { il._c(); },
                _stop: noop,
            });
        };
        /**
         * Creates a Stream that immediately emits an "error" notification with the
         * value you passed as the `error` argument when the stream starts, and that's
         * it.
         *
         * Marble diagram:
         *
         * ```text
         * throw(X)
         * -X
         * ```
         *
         * @factory true
         * @param error The error event to emit on the created stream.
         * @return {Stream}
         */
        Stream.throw = function (error) {
            return new Stream({
                _start: function (il) { il._e(error); },
                _stop: noop,
            });
        };
        /**
         * Creates a stream from an Array, Promise, or an Observable.
         *
         * @factory true
         * @param {Array|PromiseLike|Observable} input The input to make a stream from.
         * @return {Stream}
         */
        Stream.from = function (input) {
            if (typeof input[result.default] === 'function')
                return Stream.fromObservable(input);
            else if (typeof input.then === 'function')
                return Stream.fromPromise(input);
            else if (Array.isArray(input))
                return Stream.fromArray(input);
            throw new TypeError("Type of input to from() must be an Array, Promise, or Observable");
        };
        /**
         * Creates a Stream that immediately emits the arguments that you give to
         * *of*, then completes.
         *
         * Marble diagram:
         *
         * ```text
         * of(1,2,3)
         * 123|
         * ```
         *
         * @factory true
         * @param a The first value you want to emit as an event on the stream.
         * @param b The second value you want to emit as an event on the stream. One
         * or more of these values may be given as arguments.
         * @return {Stream}
         */
        Stream.of = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            return Stream.fromArray(items);
        };
        /**
         * Converts an array to a stream. The returned stream will emit synchronously
         * all the items in the array, and then complete.
         *
         * Marble diagram:
         *
         * ```text
         * fromArray([1,2,3])
         * 123|
         * ```
         *
         * @factory true
         * @param {Array} array The array to be converted as a stream.
         * @return {Stream}
         */
        Stream.fromArray = function (array) {
            return new Stream(new FromArray(array));
        };
        /**
         * Converts a promise to a stream. The returned stream will emit the resolved
         * value of the promise, and then complete. However, if the promise is
         * rejected, the stream will emit the corresponding error.
         *
         * Marble diagram:
         *
         * ```text
         * fromPromise( ----42 )
         * -----------------42|
         * ```
         *
         * @factory true
         * @param {PromiseLike} promise The promise to be converted as a stream.
         * @return {Stream}
         */
        Stream.fromPromise = function (promise) {
            return new Stream(new FromPromise(promise));
        };
        /**
         * Converts an Observable into a Stream.
         *
         * @factory true
         * @param {any} observable The observable to be converted as a stream.
         * @return {Stream}
         */
        Stream.fromObservable = function (obs) {
            if (obs.endWhen)
                return obs;
            var o = typeof obs[result.default] === 'function' ? obs[result.default]() : obs;
            return new Stream(new FromObservable(o));
        };
        /**
         * Creates a stream that periodically emits incremental numbers, every
         * `period` milliseconds.
         *
         * Marble diagram:
         *
         * ```text
         *     periodic(1000)
         * ---0---1---2---3---4---...
         * ```
         *
         * @factory true
         * @param {number} period The interval in milliseconds to use as a rate of
         * emission.
         * @return {Stream}
         */
        Stream.periodic = function (period) {
            return new Stream(new Periodic(period));
        };
        Stream.prototype._map = function (project) {
            return new (this.ctor())(new MapOp(project, this));
        };
        /**
         * Transforms each event from the input Stream through a `project` function,
         * to get a Stream that emits those transformed events.
         *
         * Marble diagram:
         *
         * ```text
         * --1---3--5-----7------
         *    map(i => i * 10)
         * --10--30-50----70-----
         * ```
         *
         * @param {Function} project A function of type `(t: T) => U` that takes event
         * `t` of type `T` from the input Stream and produces an event of type `U`, to
         * be emitted on the output Stream.
         * @return {Stream}
         */
        Stream.prototype.map = function (project) {
            return this._map(project);
        };
        /**
         * It's like `map`, but transforms each input event to always the same
         * constant value on the output Stream.
         *
         * Marble diagram:
         *
         * ```text
         * --1---3--5-----7-----
         *       mapTo(10)
         * --10--10-10----10----
         * ```
         *
         * @param projectedValue A value to emit on the output Stream whenever the
         * input Stream emits any value.
         * @return {Stream}
         */
        Stream.prototype.mapTo = function (projectedValue) {
            var s = this.map(function () { return projectedValue; });
            var op = s._prod;
            op.type = 'mapTo';
            return s;
        };
        /**
         * Only allows events that pass the test given by the `passes` argument.
         *
         * Each event from the input stream is given to the `passes` function. If the
         * function returns `true`, the event is forwarded to the output stream,
         * otherwise it is ignored and not forwarded.
         *
         * Marble diagram:
         *
         * ```text
         * --1---2--3-----4-----5---6--7-8--
         *     filter(i => i % 2 === 0)
         * ------2--------4---------6----8--
         * ```
         *
         * @param {Function} passes A function of type `(t: T) => boolean` that takes
         * an event from the input stream and checks if it passes, by returning a
         * boolean.
         * @return {Stream}
         */
        Stream.prototype.filter = function (passes) {
            var p = this._prod;
            if (p instanceof Filter)
                return new Stream(new Filter(and(p.f, passes), p.ins));
            return new Stream(new Filter(passes, this));
        };
        /**
         * Lets the first `amount` many events from the input stream pass to the
         * output stream, then makes the output stream complete.
         *
         * Marble diagram:
         *
         * ```text
         * --a---b--c----d---e--
         *    take(3)
         * --a---b--c|
         * ```
         *
         * @param {number} amount How many events to allow from the input stream
         * before completing the output stream.
         * @return {Stream}
         */
        Stream.prototype.take = function (amount) {
            return new (this.ctor())(new Take(amount, this));
        };
        /**
         * Ignores the first `amount` many events from the input stream, and then
         * after that starts forwarding events from the input stream to the output
         * stream.
         *
         * Marble diagram:
         *
         * ```text
         * --a---b--c----d---e--
         *       drop(3)
         * --------------d---e--
         * ```
         *
         * @param {number} amount How many events to ignore from the input stream
         * before forwarding all events from the input stream to the output stream.
         * @return {Stream}
         */
        Stream.prototype.drop = function (amount) {
            return new Stream(new Drop(amount, this));
        };
        /**
         * When the input stream completes, the output stream will emit the last event
         * emitted by the input stream, and then will also complete.
         *
         * Marble diagram:
         *
         * ```text
         * --a---b--c--d----|
         *       last()
         * -----------------d|
         * ```
         *
         * @return {Stream}
         */
        Stream.prototype.last = function () {
            return new Stream(new Last(this));
        };
        /**
         * Prepends the given `initial` value to the sequence of events emitted by the
         * input stream. The returned stream is a MemoryStream, which means it is
         * already `remember()`'d.
         *
         * Marble diagram:
         *
         * ```text
         * ---1---2-----3---
         *   startWith(0)
         * 0--1---2-----3---
         * ```
         *
         * @param initial The value or event to prepend.
         * @return {MemoryStream}
         */
        Stream.prototype.startWith = function (initial) {
            return new MemoryStream(new StartWith(this, initial));
        };
        /**
         * Uses another stream to determine when to complete the current stream.
         *
         * When the given `other` stream emits an event or completes, the output
         * stream will complete. Before that happens, the output stream will behaves
         * like the input stream.
         *
         * Marble diagram:
         *
         * ```text
         * ---1---2-----3--4----5----6---
         *   endWhen( --------a--b--| )
         * ---1---2-----3--4--|
         * ```
         *
         * @param other Some other stream that is used to know when should the output
         * stream of this operator complete.
         * @return {Stream}
         */
        Stream.prototype.endWhen = function (other) {
            return new (this.ctor())(new EndWhen(other, this));
        };
        /**
         * "Folds" the stream onto itself.
         *
         * Combines events from the past throughout
         * the entire execution of the input stream, allowing you to accumulate them
         * together. It's essentially like `Array.prototype.reduce`. The returned
         * stream is a MemoryStream, which means it is already `remember()`'d.
         *
         * The output stream starts by emitting the `seed` which you give as argument.
         * Then, when an event happens on the input stream, it is combined with that
         * seed value through the `accumulate` function, and the output value is
         * emitted on the output stream. `fold` remembers that output value as `acc`
         * ("accumulator"), and then when a new input event `t` happens, `acc` will be
         * combined with that to produce the new `acc` and so forth.
         *
         * Marble diagram:
         *
         * ```text
         * ------1-----1--2----1----1------
         *   fold((acc, x) => acc + x, 3)
         * 3-----4-----5--7----8----9------
         * ```
         *
         * @param {Function} accumulate A function of type `(acc: R, t: T) => R` that
         * takes the previous accumulated value `acc` and the incoming event from the
         * input stream and produces the new accumulated value.
         * @param seed The initial accumulated value, of type `R`.
         * @return {MemoryStream}
         */
        Stream.prototype.fold = function (accumulate, seed) {
            return new MemoryStream(new Fold(accumulate, seed, this));
        };
        /**
         * Replaces an error with another stream.
         *
         * When (and if) an error happens on the input stream, instead of forwarding
         * that error to the output stream, *replaceError* will call the `replace`
         * function which returns the stream that the output stream will replicate.
         * And, in case that new stream also emits an error, `replace` will be called
         * again to get another stream to start replicating.
         *
         * Marble diagram:
         *
         * ```text
         * --1---2-----3--4-----X
         *   replaceError( () => --10--| )
         * --1---2-----3--4--------10--|
         * ```
         *
         * @param {Function} replace A function of type `(err) => Stream` that takes
         * the error that occurred on the input stream or on the previous replacement
         * stream and returns a new stream. The output stream will behave like the
         * stream that this function returns.
         * @return {Stream}
         */
        Stream.prototype.replaceError = function (replace) {
            return new (this.ctor())(new ReplaceError(replace, this));
        };
        /**
         * Flattens a "stream of streams", handling only one nested stream at a time
         * (no concurrency).
         *
         * If the input stream is a stream that emits streams, then this operator will
         * return an output stream which is a flat stream: emits regular events. The
         * flattening happens without concurrency. It works like this: when the input
         * stream emits a nested stream, *flatten* will start imitating that nested
         * one. However, as soon as the next nested stream is emitted on the input
         * stream, *flatten* will forget the previous nested one it was imitating, and
         * will start imitating the new nested one.
         *
         * Marble diagram:
         *
         * ```text
         * --+--------+---------------
         *   \        \
         *    \       ----1----2---3--
         *    --a--b----c----d--------
         *           flatten
         * -----a--b------1----2---3--
         * ```
         *
         * @return {Stream}
         */
        Stream.prototype.flatten = function () {
            this._prod;
            return new Stream(new Flatten(this));
        };
        /**
         * Passes the input stream to a custom operator, to produce an output stream.
         *
         * *compose* is a handy way of using an existing function in a chained style.
         * Instead of writing `outStream = f(inStream)` you can write
         * `outStream = inStream.compose(f)`.
         *
         * @param {function} operator A function that takes a stream as input and
         * returns a stream as well.
         * @return {Stream}
         */
        Stream.prototype.compose = function (operator) {
            return operator(this);
        };
        /**
         * Returns an output stream that behaves like the input stream, but also
         * remembers the most recent event that happens on the input stream, so that a
         * newly added listener will immediately receive that memorised event.
         *
         * @return {MemoryStream}
         */
        Stream.prototype.remember = function () {
            return new MemoryStream(new Remember(this));
        };
        /**
         * Returns an output stream that identically behaves like the input stream,
         * but also runs a `spy` function for each event, to help you debug your app.
         *
         * *debug* takes a `spy` function as argument, and runs that for each event
         * happening on the input stream. If you don't provide the `spy` argument,
         * then *debug* will just `console.log` each event. This helps you to
         * understand the flow of events through some operator chain.
         *
         * Please note that if the output stream has no listeners, then it will not
         * start, which means `spy` will never run because no actual event happens in
         * that case.
         *
         * Marble diagram:
         *
         * ```text
         * --1----2-----3-----4--
         *         debug
         * --1----2-----3-----4--
         * ```
         *
         * @param {function} labelOrSpy A string to use as the label when printing
         * debug information on the console, or a 'spy' function that takes an event
         * as argument, and does not need to return anything.
         * @return {Stream}
         */
        Stream.prototype.debug = function (labelOrSpy) {
            return new (this.ctor())(new Debug(this, labelOrSpy));
        };
        /**
         * *imitate* changes this current Stream to emit the same events that the
         * `other` given Stream does. This method returns nothing.
         *
         * This method exists to allow one thing: **circular dependency of streams**.
         * For instance, let's imagine that for some reason you need to create a
         * circular dependency where stream `first$` depends on stream `second$`
         * which in turn depends on `first$`:
         *
         * <!-- skip-example -->
         * ```js
         * import delay from 'xstream/extra/delay'
         *
         * var first$ = second$.map(x => x * 10).take(3);
         * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
         * ```
         *
         * However, that is invalid JavaScript, because `second$` is undefined
         * on the first line. This is how *imitate* can help solve it:
         *
         * ```js
         * import delay from 'xstream/extra/delay'
         *
         * var secondProxy$ = xs.create();
         * var first$ = secondProxy$.map(x => x * 10).take(3);
         * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
         * secondProxy$.imitate(second$);
         * ```
         *
         * We create `secondProxy$` before the others, so it can be used in the
         * declaration of `first$`. Then, after both `first$` and `second$` are
         * defined, we hook `secondProxy$` with `second$` with `imitate()` to tell
         * that they are "the same". `imitate` will not trigger the start of any
         * stream, it just binds `secondProxy$` and `second$` together.
         *
         * The following is an example where `imitate()` is important in Cycle.js
         * applications. A parent component contains some child components. A child
         * has an action stream which is given to the parent to define its state:
         *
         * <!-- skip-example -->
         * ```js
         * const childActionProxy$ = xs.create();
         * const parent = Parent({...sources, childAction$: childActionProxy$});
         * const childAction$ = parent.state$.map(s => s.child.action$).flatten();
         * childActionProxy$.imitate(childAction$);
         * ```
         *
         * Note, though, that **`imitate()` does not support MemoryStreams**. If we
         * would attempt to imitate a MemoryStream in a circular dependency, we would
         * either get a race condition (where the symptom would be "nothing happens")
         * or an infinite cyclic emission of values. It's useful to think about
         * MemoryStreams as cells in a spreadsheet. It doesn't make any sense to
         * define a spreadsheet cell `A1` with a formula that depends on `B1` and
         * cell `B1` defined with a formula that depends on `A1`.
         *
         * If you find yourself wanting to use `imitate()` with a
         * MemoryStream, you should rework your code around `imitate()` to use a
         * Stream instead. Look for the stream in the circular dependency that
         * represents an event stream, and that would be a candidate for creating a
         * proxy Stream which then imitates the target Stream.
         *
         * @param {Stream} target The other stream to imitate on the current one. Must
         * not be a MemoryStream.
         */
        Stream.prototype.imitate = function (target) {
            if (target instanceof MemoryStream)
                throw new Error('A MemoryStream was given to imitate(), but it only ' +
                    'supports a Stream. Read more about this restriction here: ' +
                    'https://github.com/staltz/xstream#faq');
            this._target = target;
            for (var ils = this._ils, N = ils.length, i = 0; i < N; i++)
                target._add(ils[i]);
            this._ils = [];
        };
        /**
         * Forces the Stream to emit the given value to its listeners.
         *
         * As the name indicates, if you use this, you are most likely doing something
         * The Wrong Way. Please try to understand the reactive way before using this
         * method. Use it only when you know what you are doing.
         *
         * @param value The "next" value you want to broadcast to all listeners of
         * this Stream.
         */
        Stream.prototype.shamefullySendNext = function (value) {
            this._n(value);
        };
        /**
         * Forces the Stream to emit the given error to its listeners.
         *
         * As the name indicates, if you use this, you are most likely doing something
         * The Wrong Way. Please try to understand the reactive way before using this
         * method. Use it only when you know what you are doing.
         *
         * @param {any} error The error you want to broadcast to all the listeners of
         * this Stream.
         */
        Stream.prototype.shamefullySendError = function (error) {
            this._e(error);
        };
        /**
         * Forces the Stream to emit the "completed" event to its listeners.
         *
         * As the name indicates, if you use this, you are most likely doing something
         * The Wrong Way. Please try to understand the reactive way before using this
         * method. Use it only when you know what you are doing.
         */
        Stream.prototype.shamefullySendComplete = function () {
            this._c();
        };
        /**
         * Adds a "debug" listener to the stream. There can only be one debug
         * listener, that's why this is 'setDebugListener'. To remove the debug
         * listener, just call setDebugListener(null).
         *
         * A debug listener is like any other listener. The only difference is that a
         * debug listener is "stealthy": its presence/absence does not trigger the
         * start/stop of the stream (or the producer inside the stream). This is
         * useful so you can inspect what is going on without changing the behavior
         * of the program. If you have an idle stream and you add a normal listener to
         * it, the stream will start executing. But if you set a debug listener on an
         * idle stream, it won't start executing (not until the first normal listener
         * is added).
         *
         * As the name indicates, we don't recommend using this method to build app
         * logic. In fact, in most cases the debug operator works just fine. Only use
         * this one if you know what you're doing.
         *
         * @param {Listener<T>} listener
         */
        Stream.prototype.setDebugListener = function (listener) {
            if (!listener) {
                this._d = false;
                this._dl = NO;
            }
            else {
                this._d = true;
                listener._n = listener.next || noop;
                listener._e = listener.error || noop;
                listener._c = listener.complete || noop;
                this._dl = listener;
            }
        };
        /**
         * Blends multiple streams together, emitting events from all of them
         * concurrently.
         *
         * *merge* takes multiple streams as arguments, and creates a stream that
         * behaves like each of the argument streams, in parallel.
         *
         * Marble diagram:
         *
         * ```text
         * --1----2-----3--------4---
         * ----a-----b----c---d------
         *            merge
         * --1-a--2--b--3-c---d--4---
         * ```
         *
         * @factory true
         * @param {Stream} stream1 A stream to merge together with other streams.
         * @param {Stream} stream2 A stream to merge together with other streams. Two
         * or more streams may be given as arguments.
         * @return {Stream}
         */
        Stream.merge = function merge() {
            var streams = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                streams[_i] = arguments[_i];
            }
            return new Stream(new Merge(streams));
        };
        /**
         * Combines multiple input streams together to return a stream whose events
         * are arrays that collect the latest events from each input stream.
         *
         * *combine* internally remembers the most recent event from each of the input
         * streams. When any of the input streams emits an event, that event together
         * with all the other saved events are combined into an array. That array will
         * be emitted on the output stream. It's essentially a way of joining together
         * the events from multiple streams.
         *
         * Marble diagram:
         *
         * ```text
         * --1----2-----3--------4---
         * ----a-----b-----c--d------
         *          combine
         * ----1a-2a-2b-3b-3c-3d-4d--
         * ```
         *
         * @factory true
         * @param {Stream} stream1 A stream to combine together with other streams.
         * @param {Stream} stream2 A stream to combine together with other streams.
         * Multiple streams, not just two, may be given as arguments.
         * @return {Stream}
         */
        Stream.combine = function combine() {
            var streams = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                streams[_i] = arguments[_i];
            }
            return new Stream(new Combine(streams));
        };
        return Stream;
    }());
    exports.Stream = Stream;
    var MemoryStream = /** @class */ (function (_super) {
        __extends(MemoryStream, _super);
        function MemoryStream(producer) {
            var _this = _super.call(this, producer) || this;
            _this._has = false;
            return _this;
        }
        MemoryStream.prototype._n = function (x) {
            this._v = x;
            this._has = true;
            _super.prototype._n.call(this, x);
        };
        MemoryStream.prototype._add = function (il) {
            var ta = this._target;
            if (ta !== NO)
                return ta._add(il);
            var a = this._ils;
            a.push(il);
            if (a.length > 1) {
                if (this._has)
                    il._n(this._v);
                return;
            }
            if (this._stopID !== NO) {
                if (this._has)
                    il._n(this._v);
                clearTimeout(this._stopID);
                this._stopID = NO;
            }
            else if (this._has)
                il._n(this._v);
            else {
                var p = this._prod;
                if (p !== NO)
                    p._start(this);
            }
        };
        MemoryStream.prototype._stopNow = function () {
            this._has = false;
            _super.prototype._stopNow.call(this);
        };
        MemoryStream.prototype._x = function () {
            this._has = false;
            _super.prototype._x.call(this);
        };
        MemoryStream.prototype.map = function (project) {
            return this._map(project);
        };
        MemoryStream.prototype.mapTo = function (projectedValue) {
            return _super.prototype.mapTo.call(this, projectedValue);
        };
        MemoryStream.prototype.take = function (amount) {
            return _super.prototype.take.call(this, amount);
        };
        MemoryStream.prototype.endWhen = function (other) {
            return _super.prototype.endWhen.call(this, other);
        };
        MemoryStream.prototype.replaceError = function (replace) {
            return _super.prototype.replaceError.call(this, replace);
        };
        MemoryStream.prototype.remember = function () {
            return this;
        };
        MemoryStream.prototype.debug = function (labelOrSpy) {
            return _super.prototype.debug.call(this, labelOrSpy);
        };
        return MemoryStream;
    }(Stream));
    exports.MemoryStream = MemoryStream;
    var xs = Stream;
    exports.default = xs;

    });

    var xs = unwrapExports(xstream);
    xstream.NO;
    xstream.NO_IL;
    xstream.Stream;
    xstream.MemoryStream;

    var BeesLoadStatus;
    (function (BeesLoadStatus) {
        BeesLoadStatus["Loading"] = "loading";
        BeesLoadStatus["Failed"] = "failed";
        BeesLoadStatus["Completed"] = "completed";
    })(BeesLoadStatus || (BeesLoadStatus = {}));
    var BeesLoadError;
    (function (BeesLoadError) {
        // request
        BeesLoadError["IncompleteAddress"] = "The address is incomplete";
        BeesLoadError["ChainNotFound"] = "Blockchain not found";
        BeesLoadError["MissingBlockchainData"] = "Missing data from the blockchain";
        BeesLoadError["RecordNotFound"] = "Record not found";
        // not found
        BeesLoadError["ResourceNotFound"] = "Contract not found";
        // server error
        BeesLoadError["ServerError"] = "Server error";
        // resolver
        BeesLoadError["InsufficientNumberOfNodes"] = "Insufficient number of nodes";
        BeesLoadError["OutOfNodes"] = "Out of nodes";
        BeesLoadError["UnstableState"] = "Unstable state";
        BeesLoadError["UnaccurateState"] = "Unaccurate state";
        // parsing
        BeesLoadError["FailedToParseResponse"] = "Failed to parse response";
        BeesLoadError["InvalidManifest"] = "Invalid manifest";
        BeesLoadError["InvalidSignature"] = "Invalid signature";
        BeesLoadError["InvalidRecords"] = "Invalid records";
        BeesLoadError["InvalidNodes"] = "Invalid nodes"; // for nodes
    })(BeesLoadError || (BeesLoadError = {}));

    var indexData = function (data, existingData, comparer) {
        var _a;
        var found = false;
        var stringToCompare = data.data;
        if (typeof comparer === "function") {
            try {
                stringToCompare = comparer(data.data);
            }
            catch (err) {
                throw err;
            }
        }
        Object.keys(existingData).forEach(function (key) {
            var _a;
            if (stringToCompare === existingData[key].stringToCompare) {
                found = true;
                existingData = __assign(__assign({}, existingData), (_a = {}, _a[key] = __assign(__assign({}, existingData[key]), { nodeUrls: existingData[key].nodeUrls.concat(data.nodeUrl) }), _a));
            }
        });
        if (!found) {
            existingData = __assign(__assign({}, existingData), (_a = {}, _a[Object.keys(existingData).length + 1] = {
                nodeUrls: [data.nodeUrl],
                data: data.data,
                stringToCompare: stringToCompare
            }, _a));
        }
        if (!Object.keys(existingData).length) {
            existingData = {
                "1": {
                    nodeUrls: [data.nodeUrl],
                    data: data.data || "",
                    stringToCompare: stringToCompare
                }
            };
        }
        return existingData;
    };
    var createStream = function (queryHandler, urlsToQuery) {
        var streams = urlsToQuery.map(function (urlToQuery) {
            return xs.fromPromise(queryHandler(urlToQuery));
        });
        return xs.merge.apply(xs, streams);
    };
    var resolver = function (queryHandler, nodeUrls, resolverMode, resolverAccuracy, resolverAbsolute, comparer) {
        var loadErrors = {};
        var loadState = {};
        var loadPending = [];
        return xs.create({
            start: function (listener) {
                listener.next({
                    loadErrors: loadErrors,
                    loadState: loadState,
                    loadPending: loadPending,
                    status: BeesLoadStatus.Loading
                });
                if (resolverMode === "absolute") {
                    if (resolverAbsolute > nodeUrls.length) {
                        listener.next({
                            loadErrors: loadErrors,
                            loadState: loadState,
                            loadPending: loadPending,
                            loadError: {
                                error: BeesLoadError.InsufficientNumberOfNodes,
                                args: {
                                    expected: resolverAbsolute,
                                    got: nodeUrls.length
                                }
                            },
                            status: BeesLoadStatus.Failed
                        });
                        listener.complete();
                        return;
                    }
                    var i = 0;
                    var callBatch_1 = function (i) {
                        var urlsToQuery = nodeUrls.slice(i, i + resolverAbsolute);
                        if (urlsToQuery.length === 0) {
                            listener.next({
                                loadErrors: loadErrors,
                                loadState: loadState,
                                loadPending: loadPending,
                                loadError: {
                                    error: BeesLoadError.OutOfNodes,
                                    args: {
                                        alreadyQueried: i - Object.keys(loadErrors).length,
                                        resolverAbsolute: resolverAbsolute
                                    }
                                },
                                status: BeesLoadStatus.Failed
                            });
                            listener.complete();
                            return;
                        }
                        i += urlsToQuery.length;
                        loadPending = loadPending.concat(urlsToQuery);
                        listener.next({
                            loadErrors: loadErrors,
                            loadState: loadState,
                            loadPending: loadPending,
                            status: BeesLoadStatus.Loading
                        });
                        var stream = createStream(queryHandler, urlsToQuery);
                        stream.take(urlsToQuery.length).subscribe({
                            next: function (data) {
                                var _a, _b;
                                loadPending = loadPending.filter(function (url) { return url !== data.nodeUrl; });
                                if (data.type === "SUCCESS") {
                                    try {
                                        var newLoadState = indexData(data, loadState, comparer);
                                        loadState = newLoadState;
                                    }
                                    catch (err) {
                                        loadErrors = __assign(__assign({}, loadErrors), (_a = {}, _a[data.nodeUrl] = {
                                            nodeUrl: data.nodeUrl,
                                            status: err.message ? parseInt(err.message, 10) : 400
                                        }, _a));
                                    }
                                }
                                else {
                                    loadErrors = __assign(__assign({}, loadErrors), (_b = {}, _b[data.nodeUrl] = {
                                        nodeUrl: data.nodeUrl,
                                        status: data.status
                                    }, _b));
                                }
                                listener.next({
                                    loadErrors: loadErrors,
                                    loadState: loadState,
                                    loadPending: loadPending,
                                    status: BeesLoadStatus.Loading
                                });
                            },
                            error: function (e) {
                                console.error(e);
                                listener.error("UnknownError");
                            },
                            complete: function () {
                                // 5 or more load errors
                                if (Object.keys(loadErrors).length > 4) {
                                    listener.next({
                                        loadErrors: loadErrors,
                                        loadState: loadState,
                                        loadPending: loadPending,
                                        loadError: {
                                            error: BeesLoadError.ServerError,
                                            args: {
                                                numberOfLoadErrors: Object.keys(loadErrors).length
                                            }
                                        },
                                        status: BeesLoadStatus.Failed
                                    });
                                    listener.complete();
                                    return;
                                    // 3 or more different groups
                                }
                                else if (Object.keys(loadState).length > 2) {
                                    listener.next({
                                        loadErrors: loadErrors,
                                        loadState: loadState,
                                        loadPending: loadPending,
                                        loadError: {
                                            error: BeesLoadError.UnstableState,
                                            args: {
                                                numberOfLoadStates: Object.keys(loadState).length
                                            }
                                        },
                                        status: BeesLoadStatus.Failed
                                    });
                                    listener.complete();
                                    return;
                                }
                                else {
                                    var totalOkResponses_1 = Object.keys(loadState).reduce(function (total, k) {
                                        return total + loadState[k].nodeUrls.length;
                                    }, 0);
                                    for (var i_1 = 0; i_1 < Object.keys(loadState).length; i_1 += 1) {
                                        var key = Object.keys(loadState)[i_1];
                                        var nodesWithOkResponses = loadState[key].nodeUrls.length;
                                        // at least [resolverAbsolute] responses of the same
                                        // resolver must Complete or Fail
                                        if (nodesWithOkResponses >= resolverAbsolute) {
                                            if (resolverAccuracy / 100 >
                                                loadState[key].nodeUrls.length / totalOkResponses_1) {
                                                listener.next({
                                                    loadErrors: loadErrors,
                                                    loadState: loadState,
                                                    loadPending: loadPending,
                                                    loadError: {
                                                        error: BeesLoadError.UnaccurateState,
                                                        args: {
                                                            totalOkResponses: totalOkResponses_1,
                                                            loadStates: Object.keys(loadState).map(function (k) {
                                                                return {
                                                                    key: k,
                                                                    okResponses: loadState[k].nodeUrls.length,
                                                                    percent: Math.round((100 *
                                                                        (100 * loadState[k].nodeUrls.length)) /
                                                                        totalOkResponses_1) / 100
                                                                };
                                                            })
                                                        }
                                                    },
                                                    status: BeesLoadStatus.Failed
                                                });
                                                listener.complete();
                                                return;
                                            }
                                            listener.next({
                                                loadErrors: loadErrors,
                                                loadState: loadState,
                                                loadPending: loadPending,
                                                status: BeesLoadStatus.Completed
                                            });
                                            listener.complete();
                                            return;
                                        }
                                    }
                                }
                                callBatch_1(i);
                            }
                        });
                    };
                    callBatch_1(i);
                }
            },
            stop: function () { }
        });
    };

    exports.resolver = resolver;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
