/**
 * filename:        StreamTest.js
 * created at:      2009/12/04T10:45:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/stream");
    
    var stream = new jabberwerx.Stream();
    test("Test open", function() {
        stop();
        
        ok(!stream.isOpen(), "stream NOT open");
        var cb = function(evt) {
            var feats = evt.data;
            
            ok(jabberwerx.isElement(feats), "data element present");
            equals(feats.nodeName, "stream:features", "element is stream:features");
            ok(stream.isOpen(), "stream IS open");
            evt.notifier.unbind(arguments.callee);
            
            start();
        };
        stream.event("streamOpened").bind(cb);

        stream.open({
            domain: defaults.domain,
            httpBindingURL: defaults.httpBindingURL
        });
    });
    
    test("Test send/receive", function() {
        stop();
        
        // for this test, we'll use SASL
        // since it's 99.999% likely to succeed
        var sasl = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}auth").
                   attribute("mechanism", "PLAIN").
                   text(jabberwerx.util.crypto.b64Encode("\u0000jwtest0\u0000test")).
                   data;
        var txCB = function(evt) {
            ok(true, "streamElementsSent callback triggered");
            
            equals(1, evt.data.length, "number of sent elements correct");
            equals(sasl.xml, evt.data.get(0).xml, "sent element as expected");
            
            arguments.callee.triggered = true;
            evt.notifier.unbind(arguments.callee);
        };
        var rxCB = function(evt) {
            ok(true, "streamElementsReceived callback triggered");
            
            ok(txCB.triggered, "sent callback triggered first!");
            equals(1, evt.data.length, "number of received elements correct");
            
            evt.notifier.unbind(arguments.callee);
            start();
        };
        
        stream.event("streamElementsSent").bind(txCB);
        stream.event("streamElementsReceived").bind(rxCB);
        
        stream.send(sasl);
    });
    
    test("Test close", function() {
        stop();
        
        ok(stream.isOpen(), "stream IS open");
        
        var cb = function(evt) {
            if (evt.name == "streamclosed") {
                ok(true, "streamClosed event triggered");
                ok(!stream.isOpen(), "stream NOT open");
                ok(!evt.data, "no error element");
            } else {
                ok(false, "streamClosed NOT triggered!");
            }
            stream.event("streamclosed").unbind(arguments.callee);
            stream.event("streamopened").unbind(arguments.callee);
            
            start();
        };
        stream.event("streamClosed").bind(cb);
        stream.event("streamOpened").bind(cb);
        
        setTimeout(function() {
            stream.close();
        }, 1000);
    });
    
    test("Test failed open", function() {
        stop();
        
        ok(!stream.isOpen(), "stream is NOT open");
        
        var cb = function(evt) {
            if (evt.name == "streamclosed") {
                ok(true, "streamClosed event triggered");
                ok(!stream.isOpen(), "stream NOT open");
                ok(jabberwerx.isElement(evt.data), "error element provided");
            } else {
                ok(false, "streamClosed NOT triggered");
            }
            stream.event("streamClosed").unbind(arguments.callee);
            stream.event("streamOpened").unbind(arguments.callee);
            
            start();
        };
        stream.event("streamClosed").bind(cb);
        stream.event("streamOpened").bind(cb);
        
        stream.open({
            domain: defaults.domain,
            httpBindingURL: "/some-random-binding-that-shouldnt-exist"
        });
    });
});
