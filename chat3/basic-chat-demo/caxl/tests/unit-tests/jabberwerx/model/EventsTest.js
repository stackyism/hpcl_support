jabberwerx.$(document).ready(function() {
    var mock;
    module("jabberwerx/model/event", {
        setup: function() {
            mock = new MockEventSource();
        }
    });
    
    MockEventSource = jabberwerx.JWModel.extend({
        init: function() {
            this.applyEvent('mock');
        }
    }, "MockEventSource");
    
    test("test local simple register/unregister", function() {
        var notifier = mock.event('mock');
        
        ok(notifier, "notifier exists");
        
        var data;
        var cb = function(evt) {
            arguments.callee.fired = true;
            ok(evt, "event object defined");
            ok(evt.name == 'mock', "name as expected");
            ok(evt.notifier === mock.event(evt.name), "notifier as expected");
            ok(evt.source === mock, "source as expected");
            ok(evt.data === data, "data as expected");
        };
        
        notifier.bind(cb);
        
        cb.fired = false;
        data = undefined;
        notifier.trigger();
        ok(cb.fired, "event fired as expected");
        
        cb.fired = false;
        data = {'jid': 'user-a@example.com', 'groups': []};
        notifier.trigger(data);
        ok(cb.fired, "event fired as expected");
        
        notifier.unbind(cb);
        
        cb.fired = false;
        notifier.trigger();
        ok(!cb.fired, "event not fired as expected");
    });
    test("test global simple register/unregister", function() {
        var notifier = mock.event('mock');
        
        var data;
        var lcb = function(evt) {
            arguments.callee.fired = true;
            ok(evt, "[local] event object defined");
            ok(evt.name == 'mock', "[local] name as expected");
            ok(evt.notifier === mock.event(evt.name), "[local] notifier as expected");
            ok(evt.source === mock, "[local] source as expected");
            ok(evt.data === data, "[local] data as expected");
        };
        var gcb = function(evt) {
            arguments.callee.fired = true;
            ok(evt, "[global] event object defined");
            ok(evt.name == 'mock', "[global] name as expected");
            ok(evt.notifier === jabberwerx.globalEvents['on:' + evt.name], "[global] notifier as expected");
            ok(evt.source === mock, "[global] source as expected");
            ok(evt.data === data, "[global] data as expected");
        };
        
        notifier.bind(lcb);
        
        gcb.fired = lcb.fired = false;
        data = undefined;
        notifier.trigger();
        ok(lcb.fired, "[local] event fired as expected");
        ok(!gcb.fired, "[global] event not fired as expected");

        gcb.fired = lcb.fired = false;
        data = {'jid': 'user-a@example.com', 'groups': []};
        notifier.trigger(data);
        ok(lcb.fired, "[local] event fired as expected");
        ok(!gcb.fired, "[global] event not fired as expected");
        
        jabberwerx.globalEvents.bind('mock', gcb);
        
        gcb.fired = lcb.fired = false;
        data = undefined;
        notifier.trigger();
        ok(lcb.fired, "[local] event fired as expected");
        ok(gcb.fired, "[global] event fired as expected");

        gcb.fired = lcb.fired = false;
        data = {'jid': 'user-a@example.com', 'groups': []};
        notifier.trigger(data);
        ok(lcb.fired, "[local] event fired as expected");
        ok(gcb.fired, "[global] event fired as expected");
        
        notifier.unbind(lcb);
        
        gcb.fired = lcb.fired = false;
        data = undefined;
        notifier.trigger();
        ok(!lcb.fired, "[local] event not fired as expected");
        ok(gcb.fired, "[global] event fired as expected");

        gcb.fired = lcb.fired = false;
        data = {'jid': 'user-a@example.com', 'groups': []};
        notifier.trigger(data);
        ok(!lcb.fired, "[local] event not fired as expected");
        ok(gcb.fired, "[global] event fired as expected");
        
        jabberwerx.globalEvents.unbind('mock', gcb);
        
        gcb.fired = lcb.fired = false;
        data = undefined;
        notifier.trigger();
        ok(!lcb.fired, "[local] event not fired as expected");
        ok(!gcb.fired, "[global] event not fired as expected");

        gcb.fired = lcb.fired = false;
        data = {'jid': 'user-a@example.com', 'groups': []};
        notifier.trigger(data);
        ok(!lcb.fired, "[local] event not fired as expected");
        ok(!gcb.fired, "[global] event not fired as expected");
    });
    
    test("test selector function", function() {
        var data = undefined;
        var selected = undefined;
        var cb = function(evt) {
            arguments.callee.fired = true;
            ok(evt, "event object defined");
            ok(evt.notifier === mock.event(evt.name), "notifier as expected");
            ok(evt.name == 'mock', "name as expected");
            ok(evt.source === mock, "source as expected");
            ok(evt.data === data, "data as expected");
            ok(evt.selected === selected, "selected as expected");
        };
        var sel = function(data) {
            var retval;
        
            if (data) {
                retval = jabberwerx.$('message[type="chat"]', data);
                switch (retval.length) {
                    case 0:
                        retval = undefined;
                        break;
                    case 1:
                        retval = retval[0];
                        break;
                }
            }
            
            return retval;
        };
        
        var notifier = mock.event('mock');
        notifier.bindWhen(sel, cb);
        
        data = undefined;
        selected = undefined;
        cb.fired = false;
        notifier.trigger();
        ok(!cb.fired, "event not fired as expected");
        
        data = '<message type="chat"><body>test message</body></message>';
        data = jabberwerx.util.unserializeXMLDoc(data);
        selected = jabberwerx.$('message[type="chat"]', data)[0];
        cb.fired = false;
        notifier.trigger(data);
        ok(cb.fired, "event fired as expected");
        
        data = '<message type="normal"><pubsub xmlns="http://jabber.org/protocol/pubsub"><item id="current"/></pubsub></message>';
        data = jabberwerx.util.unserializeXMLDoc(data);
        selected = jabberwerx.$('message[type="chat"]', data)[0];
        cb.fired = false;
        notifier.trigger(data);
        ok(!cb.fired, "event not fired as expected");
    });
    test("test selector string", function() {
        var data = undefined;
        var selected = undefined;
        var cb = function(evt) {
            arguments.callee.fired = true;
            ok(evt, "event object defined");
            ok(evt.notifier === mock.event(evt.name), "notifier as expected");
            ok(evt.name == 'mock', "name as expected");
            ok(evt.source === mock, "source as expected");
            ok(evt.data === data, "data as expected");
            ok(evt.selected === selected, "selected as expected");
        };
        
        var notifier = mock.event('mock');
        notifier.bindWhen('message[type="chat"]', cb);

        data = undefined;
        selected = undefined;
        cb.fired = false;
        notifier.trigger();
        ok(!cb.fired, "event not fired as expected");

        data = '<message type="chat"><body>test message</body></message>';
        data = jabberwerx.util.unserializeXMLDoc(data);
        selected = jabberwerx.$('message[type="chat"]', data)[0];
        cb.fired = false;
        notifier.trigger(data);
        ok(cb.fired, "event fired as expected");
        
        data = jabberwerx.Stanza.createWithNode(data.documentElement);
        selected = jabberwerx.$('message[type="chat"]', data.getDoc())[0];
        cb.fired = false;
        notifier.trigger(data);
        ok(cb.fired, "event fired as expected");
        
        data = '<message type="normal"><pubsub xmlns="http://jabber.org/protocols/pubsub"><item id="current"/></pubsub></message>';
        data = jabberwerx.util.unserializeXMLDoc(data);
        selected = undefined;
        cb.fired = false;
        notifier.trigger(data);
        ok(!cb.fired, "event not fired as expected");
        
        data = jabberwerx.Stanza.createWithNode(data.documentElement);
        selected = undefined;
        cb.fired = false;
        notifier.trigger(data);
        ok(!cb.fired, "event not fired as expected");
    });
    
    MockEventSink = jabberwerx.JWModel.extend({
        init: function(src, args) {
            this.eventSource = src;
            this.arguments = args;
            
            var fn;
            fn = this.invocation('handleMock');
            fn = this.invocation('handleMockArgs');
            fn = this.invocation('handleMockBoundArgs',
                                 [args[0], args[1]]);
            fn = this.invocation('handleMockAllArgs',
                                 [args[0], args[1]]);

            this.reset();
        },
        
        reset: function() {
            this.fired = {'handleMock' : false,
                          'handleMockArgs' : false,
                          'handleMockBoundArgs' : false,
                          'handleMockAllArgs' : false};
        },

        register: function(local, methods) {
            this.unregister();
        
            var src = this.eventSource;
            var args = this.arguments;
            
            if (!methods) {
                methods = jabberwerx.$.makeArray(this);
            }
            var     doit = function(cb, inc) {
                if (local) {
                    src.event('mock').bind(cb);
                } else {
                    jabberwerx.globalEvents.bind('mock', cb);
                }
            };
            if (jabberwerx.$.inArray('handleMock', methods) != -1) {
                doit(   this.invocation('handleMock'),
                        false);
            }

            if (jabberwerx.$.inArray('handleMockBoundArgs', methods) != -1) {
                doit(   this.invocation('handleMockBoundArgs', [args[0], args[1]]),
                        false);
            }
        },
        unregister: function() {
            var src = this.eventSource;
            for (var key in this.fired) {
                var cb = this.invocation(key);
                src && src.event('mock').unbind(cb);
                jabberwerx.globalEvents.unbind('mock', cb);
            }
        },

        handleMock: function(evt) {
            this._handleDetails(    'handleMock',
                                    undefined,
                                    undefined,
                                    evt);
        },
        handleMockBoundArgs: function(arg1, arg2, evt) {
            this._handleDetails(    'handleMockBoundArgs',
                                    arg1,
                                    arg2,
                                    evt);
        },
        _handleDetails: function(method, arg1, arg2, evt) {
            var prefix = "[" + method + "] -- ";
            this.fired[method] = true;
            ok(evt, prefix  + "event object defined");
            ok(evt.name == 'mock', prefix  + "name as expected");
            ok(evt.source === this.eventSource, prefix  + "source as expected");
            ok(evt.data === this.eventData, prefix  + "data as expected");
            if (arg1 !== undefined && arg2 !== undefined) {
                ok(arg1 === this.arguments[0], prefix  + "bound argument 1 as expected");
                ok(arg2 === this.arguments[1], prefix  + "bound argument 2 as expected");
            }
        }
    }, "MockEventSink");
    
    test("test local invocations", function() {
        var data;
        var args = ['bound 1', 'bound 2'];
        var sink = new MockEventSink(mock, args);
        
        var methods;
        methods = ['handleMock',
                   'handleMockBoundArgs'];
        sink.register(true, methods);

        sink.eventData = data = undefined;        
        mock.event('mock').trigger();
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }
        
        sink.eventData = data = {'jid': 'user-a@example.com', 'groups': []};
        mock.event('mock').trigger(data);
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }

        methods = [];
        sink.register(true, methods);

        sink.eventData = data = undefined;        
        sink.reset();
        mock.event('mock').trigger();
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }

        sink.eventData = data = {'jid': 'user-a@example.com', 'groups': []};
        sink.reset();
        mock.event('mock').trigger(data);
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }
    });
    test("test global invocations", function() {
        var data;
        var args = ['bound 1', 'bound 2'];
        var sink = new MockEventSink(mock, args);
        
        var methods;
        methods = ['handleMock',
                   'handleMockBoundArgs'];
        sink.register(false, methods);

        sink.eventData = data = undefined;        
        mock.event('mock').trigger();
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }
        
        sink.eventData = data = {'jid': 'user-a@example.com', 'groups': []};
        mock.event('mock').trigger(data);
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }

        methods = [];
        sink.register(false, methods);

        sink.eventData = data = undefined;        
        sink.reset();
        mock.event('mock').trigger();
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }

        sink.eventData = data = {'jid': 'user-a@example.com', 'groups': []};
        sink.reset();
        mock.event('mock').trigger(data);
        for (var key in sink.fired) {
            var expected = jabberwerx.$.inArray(key, methods) != -1;
            var actual = sink.fired[key];
            ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
        }
    });
    
    test("test specified delegation", function() {
        var data;
        var args = ['bound 1', 'bound 2'];
        var sinkMock = new MockEventSink(mock, args);
        var delegate = new MockEventSource();
        var sinkDelegate = new MockEventSink(delegate, args);
        
        var methods;
        methods = ['handleMock',
                   'handleMockBoundArgs'];
        sinkMock.register(true, methods);
        sinkDelegate.register(true, methods);

        var verifyFn = function(sink, triggered) {
            for (var key in sink.fired) {
                var expected = jabberwerx.$.inArray(key, methods) != -1 && triggered;
                var actual = sink.fired[key];
                ok(expected == actual, "event fired: expected=" + expected + " vs actual=" + actual);
            }
        };

        data = undefined;        
        sinkMock.eventData = data;
        sinkMock.eventSource = delegate;    // delegate is actual source!
        sinkMock.reset();
        sinkDelegate.eventData = data;
        sinkDelegate.reset();
        delegate.event('mock').trigger(data, mock.event("mock"));
        verifyFn(sinkDelegate, true);
        verifyFn(sinkMock, true);
        
        var caught;
        try {
            caught = false;
            delegate.trigger(data, "bad data");
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "ex is TypeError");
        }
        ok(caught, "expected exception caught");
    });
    
    test("test nested events", function() {
        var mock = new MockEventSource();
        mock.applyEvent("nested");
        
        var fired = [];
        var evtBaseCB1 = function(evt) {
            mock.event("nested").trigger();
        
            arguments.callee.fired = true;
        };
        var evtBaseCB2 = function(evt) {
            arguments.callee.fired = true;
        };
        var evtDeferCB = function(evt) {
            ok(evtBaseCB1.fired, "base callback #1 fired before nested");
            ok(evtBaseCB2.fired, "base callback #2 fired before nested");
        
            arguments.callee.fired = true;
        };
        
        mock.event("nested").bind(evtDeferCB);
        mock.event("mock").bind(evtBaseCB1);
        mock.event("mock").bind(evtBaseCB2);
        mock.event("mock").trigger();
        
        ok(evtBaseCB1.fired, "base callback #1 fired");
        ok(evtBaseCB2.fired, "base callback #2 fired");
        ok(evtDeferCB.fired, "nested callback fired");
    });
    test("test callback results (simple)", function() {
        var mock = new MockEventSource();
        var evtCB1 = function(evt) {
            return true;
        };
        mock.event("mock").bind(evtCB1);
        
        var evtCB2 = function(evt) {
            return true;
        };
        mock.event("mock").bind(evtCB2);
        
        var resultCB = function(results) {
            ok(typeof(results) == "boolean", "results is boolean");
            ok(results, "results is true");
            
            arguments.callee.fired = true;
        };
        mock.event("mock").trigger(undefined, undefined, resultCB);
        ok(resultCB.fired == true, "result callback fired");
    });
    test("test callback results (nested)", function() {
        var mock = new MockEventSource();

        mock.applyEvent("nested");
        var evtNestedCB1 = function(evt) {
            return true;
        };
        mock.event("nested").bind(evtNestedCB1);
        var evtNestedCB2 = function(evt) {
            return true;
        };
        mock.event("nested").bind(evtNestedCB2);
        var resultNestedCB = function(results) {
            ok(typeof(results) == "boolean", "nested results is boolean");
            ok(results, "nested results is true");

            arguments.callee.fired = true;
        };
        
        var evtBaseCB = function(evt) {
            mock.event("nested").trigger(null, null, resultNestedCB);
            
            return resultNestedCB.fired || false;
        };
        mock.event("mock").bind(evtBaseCB);
        var resultBaseCB = function(results) {
            ok(typeof(results) == "boolean", "base results is boolean");
            ok(!results, "base results is false");
            
            arguments.callee.fired = true;
        };
        
        mock.event("mock").trigger(null, null, resultBaseCB);
        ok(resultNestedCB.fired, "nested results callback fired");
        ok(resultBaseCB.fired, "base results callback fired");
    });
/**
 * Two sources(s1, s2) trigger events resulting in callbacks. s1--ev1-->s2,
 * s2--ev2-->s1, s1--ev3-->s2.
 * The callbacks for evt3 should not execute until all of the callbacks
 * for evt1 and evt2 have been executed.
 */
   test("test multi-source events", function() {
        var s1 = new MockEventSource();
        s1.applyEvent("ev1");
        s1.applyEvent("ev3");
        
        var s2 = new MockEventSource();
        s2.applyEvent("ev2");
       
        var fired = [];
        var log = new Array();
        
        var evtcbA = function(evt) {
            
            log.push("Callback A fired");
            s2.event("ev2").trigger();
            arguments.callee.fired = true;
        };
        var evtcbB = function(evt) {
           
            log.push("Callback B fired");
            arguments.callee.fired = true;
        };
        var evtcbC = function(evt) {
            log.push("Callback C fired");
            s1.event("ev3").trigger();
            arguments.callee.fired = true;
        };
       var evtcbD = function(evt) {
            log.push("Callback D fired");
            arguments.callee.fired = true;
        };
           
        s1.event("ev1").bind(evtcbA);
        s2.event("ev2").bind(evtcbC);
        s1.event("ev3").bind(evtcbB);
        s2.event("ev2").bind(evtcbD); 
        s1.event("ev1").trigger();
         
        equals(log[0], "Callback A fired", "cbA fired");
        equals(log[1], "Callback C fired", "cbC fired");
        equals(log[2], "Callback D fired", "cbD fired");
        equals(log[3], "Callback B fired", "cbB fired");
    });
/**
 * Two sources trigger events with callback results. s1--ev1(rb1)-->s2,
 * s2--ev2(rb2)-->s1, s1--ev3(rb3)-->s2.
 * The callbacks for evt3 should not execute until all of the callbacks
 * for evt1 and evt2 have been executed.
 */
   test("test multi-source events with results", function() {
        var s1 = new MockEventSource();
        s1.applyEvent("ev1");
        s1.applyEvent("ev3");
        
        var s2 = new MockEventSource();
        s2.applyEvent("ev2");
       
        var fired = [];
        var log = new Array();
        
        var evtcbA = function(evt) {
            s2.event("ev2").trigger(undefined, undefined, rb2);
        };
        var evtcbB = function(evt) {
            return true;
        };
        var evtcbC = function(evt) {
            s1.event("ev3").trigger(undefined, undefined, rb3);
            };
        var evtcbD = function(evt) {
            arguments.callee.fired = true; 
        };
        var rb1 = function(results) {
            log.push("rb1 fired");
            ok(typeof(results) == "boolean", "results1 is boolean");
            arguments.callee.fired = true;
            ok(rb1.fired == true, "rb1 fired");
            ok(!results, "rb2 is false");
        };
        var rb2 = function(results) {
            log.push("rb2 fired");
            ok(typeof(results) == "boolean", "results2 is boolean");
            arguments.callee.fired = true;
            ok(rb2.fired == true, "rb2 fired");
        };
        var rb3 = function(results) {
            log.push("rb3 fired");
            ok(typeof(results) == "boolean", "results3 is boolean");
            ok(results, "rb1 is true");
            ok(results, "rb2 is true");
            arguments.callee.fired = true;
            ok(rb3.fired == true, "rb3 fired");
        };
        s1.event("ev1").bind(evtcbA);
        s2.event("ev2").bind(evtcbC);
        s1.event("ev3").bind(evtcbB);
        s2.event("ev2").bind(evtcbD); 
        s1.event("ev1").trigger(undefined, undefined, rb1);
        
        equals(log[0], "rb2 fired", "rb2 fired first");
        equals(log[1], "rb1 fired", "rb1 fired second");
        equals(log[2], "rb3 fired", "rb3 fired last");
    }); 
});
