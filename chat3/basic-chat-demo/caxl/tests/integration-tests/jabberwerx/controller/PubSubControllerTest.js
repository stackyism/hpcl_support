/**
 * filename:        PubSubControllerTest.js
 * created at:      2009/11/11T13:50:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    var client = new jabberwerx.Client("pubsub-tests");
    var pubsub = new jabberwerx.PubSubController(client);
    var psnode = pubsub.node("test/dummy-node",
                             "info-broker." + defaults.domain);
    var testCount = 0;

    var onConnected = function() {
        start();
    };
    var onClientError = function(err) {
        alert("Authentication error: " + err.xml);
    };
    
    var compareElementTree = function(act, exp) {
        equals(act.nodeName, exp.nodeName, "element nodeName");
        for (var idx = 0; idx < exp.attributes.length; idx++) {
            var atname = exp.attributes[idx].name;
            var atval = exp.attributes[idx].value;
            
            equals(act.getAttribute(atname), atval, "attribute[" + atval + "]");
        }
        
        var actContent = jabberwerx.$(act).contents();
        var expContent = jabberwerx.$(exp).contents();
        equals(actContent.length, expContent.length, "element content count");
        for (var idx = 0; idx < expContent.length; idx++) {
            compareElementTree(actContent.get(idx), expContent.get(idx));
        }
    };
    module("jabberwerx/controller/pubsubcontroller", {
        setup: function() {
            if (!client.isConnected()) {
                client.connect(
                        testUserJID(1),
                        defaults.password,
                        {
                            httpBindingURL: defaults.httpBindingURL,
                            successCallback: onConnected,
                            errorCallback: onClientError
                        });
                stop();
            }
        },
        teardown: function() {
            if (testCount == 0) {
                client.disconnect();
            }
        }
    });
    
    testCount++;
    test("Test node.createNode", function() {
        stop();
        psnode.createNode(function(err) {
            testCount--;
            ok(!err, "pubsub node created successfully");
            start();
        });
    });
    
    testCount++;
    test("Test node.subscribe", function() {
        stop();
        
        var cb = function(err) {
            testCount--;
            same(this, psnode);
            equals(psnode.properties.subscription, "explicit");
            ok(!err, "subscribe succeeded");
            start();
        };
        psnode.subscribe(cb);
    });
    
    testCount++;
    test("Test node.retrieve(empty)", function() {
        stop();
        psnode.retrieve(function(err) {
            testCount--;
            same(this, psnode);
            ok(!err, "retrieve succeeded");
            var items = psnode.getItems();
            equals(items.length, 0);
            start();
        });
    });
    
    testCount++;
    test("Test node.publish (add)", function() {
        stop();
        var payload = new jabberwerx.NodeBuilder("{jabberwerx:test}payload");
        payload.element("property").
                attribute("name", "prop-1").
                attribute("value", "value one");
        payload.element("property").
                attribute("name", "prop-2").
                attribute("value", "value two");
        payload = payload.data;
        
        var pending = function() {
            var p = arguments.callee.count - 1;
            arguments.callee.count = p;
            if (!p) {
                testCount--;
                start();
            }
        };
        pending.count = 0;
        
        var notifyCB = function(evt) {
            evt.notifier.unbind(arguments.callee);
            same(evt.source, psnode);
            equals(evt.data.operation, "added");
            equals(evt.data.items.length, 1);
            
            var it = evt.data.items[0];
            equals(it.id, "item-id");
            compareElementTree(
                    it.data,
                    jabberwerx.util.unserializeXML('<payload xmlns="jabberwerx:test"><property name="prop-1" value="value one"/><property name="prop-2" value="value two"/></payload>'));
            pending();
        };
        pending.count++;
        psnode.event("pubsubItemsChanged").bind(notifyCB);

        pending.count++;
        psnode.publish("item-id", payload, function(err) {
            same(this, psnode);
            ok(!err, "publish succeeded");
            pending();
        });
    });
    
    testCount++;
    test("Test node.retrieve(non-empty)", function() {
        stop();
        psnode.retrieve(function(err) {
            testCount--;
            same(this, psnode);
            ok(!err, "retrieve succeeded");
            var items = psnode.getItems();
            equals(items.length, 1);
            start();
        });
    });
    
    testCount++;
    test("Test node.publish (update)", function() {
        stop();
        var payload = new jabberwerx.NodeBuilder("{jabberwerx:test}payload");
        payload.element("property").
                attribute("name", "prop-1").
                attribute("value", "value uno");
        payload.element("property").
                attribute("name", "prop-2").
                attribute("value", "value dos");
        payload = payload.data;
        
        var pending = function() {
            var p = arguments.callee.count - 1;
            arguments.callee.count = p;
            if (!p) {
                testCount--;
                start();
            }
        };
        pending.count = 2;
        var notifyCB = function(evt) {
            evt.notifier.unbind(arguments.callee);
            same(evt.source, psnode);
            equals(evt.data.operation, "updated");
            equals(evt.data.items.length, 1);
            
            var it = evt.data.items[0];
            equals(it.id, "item-id");
            compareElementTree(
                    it.data,
                    jabberwerx.util.unserializeXML('<payload xmlns="jabberwerx:test"><property name="prop-1" value="value uno"/><property name="prop-2" value="value dos"/></payload>'));
            pending();
        };
        psnode.event("pubsubItemsChanged").bind(notifyCB);
        
        psnode.publish("item-id", payload, function(err) {
            same(this, psnode);
            ok(!err, "publish succeeded");
            pending();
        });
    });
    
    testCount++;
    test("Test node.retrieve(non-empty)", function() {
        stop();
        psnode.retrieve(function(err) {
            testCount--;
            same(this, psnode);
            ok(!err, "retrieve succeeded");
            var items = psnode.getItems();
            equals(items.length, 1);
            start();
        });
    });
    
    testCount++;
    test("Test node.unsubscribe", function() {
        stop();
        
        var cb = function(err) {
            testCount--;
            same(this, psnode);
            ok(!psnode.properties.subscription);
            ok(!err, "unsubscribe succeeded");
            start();
        };
        psnode.unsubscribe(cb);
    });
    
    testCount++;
    test("Test node.subscribe (auto-retrieve)", function() {
        stop();
        
        var pending = function() {
            var p = arguments.callee.count - 1;
            arguments.callee.count = p;
            if (!p) {
                testCount--;
                start();
            }
        };
        pending.count = 0;
        
        var cb = function(err) {
            psnode.autoRetrieve = false;
            same(this, psnode);
            equals(psnode.properties.subscription, "explicit");
            ok(!err, "subscribe succeeded");
            pending();
        };
        var notifyCB = function(evt) {
            evt.notifier.unbind(arguments.callee);
            same(evt.source, psnode);
            equals(evt.data.items.length, 1);
            equals(evt.data.operation, "added");
            
            var it = evt.data.items[0];
            equals(it.id, "item-id");
            compareElementTree(
                    it.data,
                    jabberwerx.util.unserializeXML('<payload xmlns="jabberwerx:test"><property name="prop-1" value="value uno"/><property name="prop-2" value="value dos"/></payload>'));
            pending();
        };
        pending.count++;
        psnode.event("pubsubItemsChanged").bind(notifyCB);
        
        psnode.autoRetrieve = true;
        pending.count++;
        psnode.subscribe(cb);
    });
    
    testCount++;
    test("Test node.retract", function() {
        stop();
        var pending = function() {
            var p = arguments.callee.count - 1;
            arguments.callee.count = p;
            if (!p) {
                testCount--;
                start();
            }
        };
        pending.count = 2;
        var notifyCB = function(evt) {
            evt.notifier.unbind(arguments.callee);
            same(evt.source, psnode);
            equals(evt.data.operation, "removed");
            equals(evt.data.items.length, 1);
            
            var it = evt.data.items[0];
            equals(it.id, "item-id");
            pending();
        };
        psnode.event("pubsubItemsChanged").bind(notifyCB);
        
        psnode.retract("item-id", function(err) {
            same(this, psnode);
            ok(!err, "retract succeeded");
            pending();
        });
    });
    test("Test node.retract (bad id)", function() {
        var caught;
        try {
            psnode.retract("", function(err) {
                same(this, psnode);
                ok(!err, "retract succeeded");
            });
            caught = false;
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
    });
    
    testCount++;
    test("Test node.retrieve(empty)", function() {
        stop();
        psnode.retrieve(function(err) {
            testCount--;
            same(this, psnode);
            ok(!err, "retrieve succeeded");
            var items = psnode.getItems();
            equals(items.length, 0);
            start();
        });
    });
    
    testCount++;
    test("Test node.unsubscribe", function() {
        stop();
        
        var cb = function(err) {
            testCount--;
            same(this, psnode);
            ok(!psnode.properties.subscription);
            ok(!err, "unsubscribe succeeded");
            start();
        };
        psnode.unsubscribe(cb);
    });
    
    testCount++;
    test("Test node.unsubscribe (already unsubscribed)", function() {
        stop();
        
        var cb = function(err) {
            testCount--;
            same(this, psnode);
            ok(!psnode.properties.subscription);
            ok(!err, "unsubscribe succeeded");
            start();
        };
        psnode.unsubscribe(cb);
    });
    
    testCount++;
    test("Test node.deleteNode", function() {
        stop();
        psnode.deleteNode(function(err) {
            testCount--;
            same(this, psnode);
            ok(!err, "pubsub node deleted successfully");
            start();
        });
    });
});
