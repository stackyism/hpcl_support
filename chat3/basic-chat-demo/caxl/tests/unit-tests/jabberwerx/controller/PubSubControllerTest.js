/**
 * filename:        PubSubControllerTest.js
 * created at:      2009/11/13T13:50:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    var client = new jabberwerx.Client();
    var pubsub = new jabberwerx.PubSubController(client);

    module("jabberwerx/controller/pubsubcontroller");
    
    test("Test node creation/access", function() {
        var node;
        
        var entityCB = function(evt) {
            var fn = arguments.callee;
            
            evt.notifier.unbind(fn);
            equals(evt.name, fn.eventName.toLowerCase());
            ok(evt.data instanceof jabberwerx.PubSubNode, "event data is PubSubNode");
            fn.triggered = true;
        }
        entityCB.reset = function(name) {
            entityCB.clear();
            this.eventName = name;
            this.triggered = false;
            client.entitySet.event(name).bind(this);
        };
        entityCB.clear = function() {
            if (this.eventName) {
                client.entitySet.event(this.eventName).unbind(this);
            }
        };
        
        entityCB.reset("entityCreated");
        node = pubsub.node("test/some-node", "info-broker.example.com");
        ok(node instanceof jabberwerx.PubSubNode, "node is PubSubNode");
        ok(node === client.entitySet.entity("info-broker.example.com", "test/some-node"),
                "node in client.entitySet");
        ok(entityCB.triggered, "entityCreated event triggered");
        entityCB.clear();
        
        entityCB.reset("entityCreated");
        ok(node === pubsub.node("test/some-node", "info-broker.example.com"),
                "node is same as previous");
        ok(!entityCB.triggered, "entityCreated event NOT triggered");
            client.entitySet.event("entityCreated").unbind(this);
        entityCB.clear();
        
        entityCB.reset("entityDestroyed");
        node.remove();
        ok(!client.entitySet.entity("info-broker.example.com", "test/some-node"),
                "node NOT in client.entitySet");
        ok(entityCB.triggered, "entityDestroyed event triggered");
        entityCB.clear();
        
        var caught;
        try {
            caught = false;
            pubsub.node("test/bad-node");
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "exception is InvalidJIDError");
        }
        ok(caught, "expected error caught");
    });
    test("test cleanup", function() {
        var nodes = [];
        
        nodes.push(new jabberwerx.PubSubNode(null, "test/root-node", pubsub));
        nodes.push(new jabberwerx.PubSubNode("jwtest1@example.com", "test/root-node", nodes[0]));
        nodes.push(new jabberwerx.PubSubNode("jwtest2@example.com", "test/root-node", nodes[0]));
        nodes.push(new jabberwerx.PubSubNode("info-broker.example.com", "test/other-node", pubsub));
        for (var idx = 0; idx < nodes.length; idx++) {
            client.entitySet.register(nodes[idx]);
        }
        
        var expected;
        var entityCB = function(evt) {
            var fn = arguments.callee;
            
            equals(evt.name, fn.eventName.toLowerCase());
            var idx = jabberwerx.$.inArray(evt.data, expected);
            ok(idx != -1, "node " + evt.data.toString() + " present in expected list");
            if (fn.delegateExpected) {
                ok(evt.data.delegate, "node has a delegate");
            }
            
            fn.triggered++;
        }
        entityCB.reset = function(name, delegate) {
            this.clear();
            this.eventName = name;
            this.triggered = 0;
            this.delegateExpected = Boolean(delegate);
            client.entitySet.event(name).bind(this);
        };
        entityCB.clear = function() {
            if (this.eventName) {
                client.entitySet.event(this.eventName).unbind(this);
            }
        };
        
        expected = [ nodes[1], nodes[2] ];
        entityCB.reset("entityDestroyed", true);
        pubsub._removeNodesFromEntitySet(jabberwerx.PubSubController.CLEANUP_DELEGATES);
        equals(entityCB.triggered, expected.length, "callback triggered expected number of times");
        for (var idx = 0; idx < expected.length; idx++) {
            client.entitySet.register(expected[idx]);
        }
        entityCB.clear();
        
        expected = nodes.concat();
        entityCB.reset("entityDestroyed", false);
        pubsub._removeNodesFromEntitySet(jabberwerx.PubSubController.CLEANUP_ALL);
        equals(entityCB.triggered, expected.length, "callback triggered expected number of times");
        for (var idx = 0; idx < expected.length; idx++) {
            client.entitySet.register(expected[idx]);
        }
        entityCB.clear();
        
        expected = [ nodes[1], nodes[2] ];
        entityCB.reset("entityDestroyed", true);
        pubsub._cleanupMode = jabberwerx.PubSubController.CLEANUP_DELEGATES;
        pubsub._removeNodesFromEntitySet();
        equals(entityCB.triggered, expected.length, "callback triggered expected number of times");
        for (var idx = 0; idx < expected.length; idx++) {
            client.entitySet.register(expected[idx]);
        }
        entityCB.clear();
        
        expected = nodes.concat();
        entityCB.reset("entityDestroyed", false);
        pubsub._cleanupMode = jabberwerx.PubSubController.CLEANUP_ALL;
        pubsub._removeNodesFromEntitySet();
        equals(entityCB.triggered, expected.length, "callback triggered expected number of times");
        for (var idx = 0; idx < expected.length; idx++) {
            client.entitySet.register(expected[idx]);
        }
        entityCB.clear();
    });
});
