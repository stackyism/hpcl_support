/**
 * filename:        PubSubItemTest.js
 * created at:      2009/11/10T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/pubsub:node");
    
    test("Test Create", function() {
        var client = new jabberwerx.Client();
        var ctrl = client.controllers.pubsub || new jabberwerx.PubSubController(client); 
        var node;
        
        node = new jabberwerx.PubSubNode("info-broker.example.com", "test/bookmarks", ctrl);
        equals(node.jid, "info-broker.example.com");
        equals(node.node, "test/bookmarks");
        equals(node.delegate, null);
        same(node.controller, ctrl);
        
        node = new jabberwerx.PubSubNode(null, "test/tunes", ctrl);
        equals(node.jid, null);
        equals(node.node, "test/tunes");
        same(node.controller, ctrl);
        
        var delegate = node;
        node = new jabberwerx.PubSubNode("jwtest1@example.com", "test/tunes", delegate);
        equals(node.jid, "jwtest1@example.com");
        equals(node.node, "test/tunes");
        same(node.delegate, delegate);
        same(node.controller, ctrl);
        
        var caught;
        try {
            node = new jabberwerx.PubSubNode("info-broker.example.com", "test/bookmarks", null);
            caught = false;
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");

        try {
            node = new jabberwerx.PubSubNode("info-broker.example.com", "", ctrl);
            caught = false;
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
        
        try {
            node = new jabberwerx.PubSubNode("info-broker.example.com", null, ctrl);
            caught = false;
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
    });
    test("Test Destroy", function() {
        var client = new jabberwerx.Client();
        var ctrl = client.controllers.pubsub || new jabberwerx.PubSubController(client); 
        var node = new jabberwerx.PubSubNode(null, "http://jabber.org/protocol/tune", ctrl);
        client.entitySet.register(node);
        
        var delegates = new Array(5);
        for (var idx = 0; idx < delegates.length; idx++) {
            var d = new jabberwerx.PubSubNode("jwtest" + idx +"@example.com", node.node, node);
            client.entitySet.register(d);
            node.properties.delegated[d.jid] = true;
            delegates[idx] = {
                jid: d.jid,
                node: d.node
            };
        }
        
        node.destroy();
        ok(!client.entitySet.entity(null, "http://jabber.org/protocol/tune"), "no entity");
        for (var idx = 0; idx < delegates.length; idx++) {
            var d = delegates[idx];
            ok(!client.entitySet.entity(d.jid, d.node), "no entity for " + d.jid + ":" + d.node);
        }
    });
    
    test("Test Delegation Lookup", function() {
        var client = new jabberwerx.Client();
        var ctrl = client.controllers.pubsub || new jabberwerx.PubSubController(client); 
        var node;
        node = new jabberwerx.PubSubNode("info-broker.example.com", "test/jabberwerx", ctrl);
        client.entitySet.register(node);
        
        var delegated;
        delegated = node.getDelegatedFor("info-broker.example.com");
        same(delegated, node, "delegated is node");
        
        node.destroy();
        node = new jabberwerx.PubSubNode(null, "test/jabberwerx", ctrl);
        client.entitySet.register(node);
        
        delegated = node.getDelegatedFor("jwtest0@example.com");
        ok(delegated instanceof jabberwerx.PubSubNode, "delegated is a PubSubNode");
        same(delegated.delegate, node, "node is delegate");
        same(delegated.controller, ctrl, "controller as expected");
        ok(node.properties.delegated["jwtest0@example.com"], "marked delegated present");
        
        same(node.getDelegatedFor("jwtest0@example.com"), delegated, "same delegated instance");
        
        var caught;
        try {
            caught = false;
            delegated = node.getDelegatedFor(null);
        } catch(ex) {
            caught = true;
            ok(ex instanceof TypeError, "exception is TypeError");
        }
        ok(caught, "expected error thrown");

        try {
            caught = false;
            delegated = delegated.getDelegatedFor("jwtest1@example.com");
        } catch(ex) {
            caught = true;
            ok(ex instanceof jabberwerx.PubSubNode.DelegatedNodeError, "exception is DelegatedNodeError");
        }
        ok(caught, "expected error thrown");
    });
    
    test("Test Notifications (simple)", function() {
        var client = new jabberwerx.Client();
        var ctrl = client.controllers.pubsub || new jabberwerx.PubSubController(client); 
        var node = ctrl.node("test/jabberwerx", "info-broker.example.com");
        
        var callback = function(evt) {
            var fn = arguments.callee;
            
            fn.triggered = true;
            ok(evt.source instanceof jabberwerx.PubSubNode, "event source is PubSubNode");
            same(evt.source, node, "event source is node");
            equals(evt.data.operation, fn.eventOp, "event operation matches");
            equals(evt.data.items.length, fn.eventItems.length, "matching items length");
            for (var idx = 0; idx < Math.min(evt.data.items.length, fn.eventItems.length); idx++) {
                var exp = fn.eventItems[idx];
                var act = evt.data.items[idx];
                
                equals(act.id, exp.id, "item IDs match");
                equals(act.data.xml, exp.data.xml, "payload matches");
            }
        };
        callback.reset = function(op, items) {
            this.triggered = false;
            this.eventOp = op;
            this.eventItems = items;
        };
        node.event("pubsubItemsChanged").bind(callback);
        
        var stanza, builder, item;
        stanza = new jabberwerx.Message();
        stanza.setType("headline");
        stanza.setFrom("info-broker.example.com");
        builder = new jabberwerx.NodeBuilder(stanza.getNode());
        item = builder.element("{http://jabber.org/protocol/pubsub#event}event").
                       element("items", {"node": "test/jabberwerx"}).
                       element("item", {"id": "current"});
                
        item.element("{test/jabberwerx}payload").text("the payload");
        item = new jabberwerx.PubSubItem(item.data.cloneNode(true));

        // notification triggered on beforeMessageReceived
        var evt = new jabberwerx.EventObject(client.event("beforeMessageReceived"), stanza);
        evt.selected = jabberwerx.$(stanza.getNode()).
                       find("event[xmlns=http://jabber.org/protocol/pubsub#event]>*[node=test/jabberwerx]").
                       get(0);
        callback.reset("added", [item]);
        var result = node._handleNotify(evt);
        ok(result, "notification event handled");
        ok(callback.triggered, "event callback triggered");
        
        stanza = new jabberwerx.Message();
        stanza.setType("headline");
        stanza.setFrom("info-broker.example.com");
        builder = new jabberwerx.NodeBuilder(stanza.getNode());
        item = builder.element("{http://jabber.org/protocol/pubsub#event}event").
                       element("items", {"node": "test/jabberwerx"}).
                       element("item", {"id": "current"});
                
        item.element("{test/jabberwerx}payload").text("new payload");
        item = new jabberwerx.PubSubItem(item.data.cloneNode(true));

        // notification triggered on beforeMessageReceived
        var evt = new jabberwerx.EventObject(client.event("beforeMessageReceived"), stanza);
        evt.selected = jabberwerx.$(stanza.getNode()).
                       find("event[xmlns=http://jabber.org/protocol/pubsub#event]>*[node=test/jabberwerx]").
                       get(0);
        callback.reset("updated", [item]);
        var result = node._handleNotify(evt);
        ok(result, "notification event handled");
        ok(callback.triggered, "event callback triggered");

        
        stanza = new jabberwerx.Message();
        stanza.setType("headline");
        stanza.setFrom("info-broker.example.com");
        builder = new jabberwerx.NodeBuilder(stanza.getNode());
        builder.element("{http://jabber.org/protocol/pubsub#event}event").
                element("items", {"node": "test/jabberwerx"}).
                element("retract", {"id": "current"});
                
        // item from previous run still counts for remove

        // notification triggered on beforeMessageReceived
        var evt = new jabberwerx.EventObject(client.event("beforeMessageReceived"), stanza);
        evt.selected = jabberwerx.$(stanza.getNode()).
                       find("event[xmlns=http://jabber.org/protocol/pubsub#event]>*[node=test/jabberwerx]").
                       get(0);
        callback.reset("removed", [item]);
        var result = node._handleNotify(evt);
        ok(result, "notification event handled");
        ok(callback.triggered, "event callback triggered");
    });
    test("Test Notifications (delegated)", function() {
        var client = new jabberwerx.Client();
        var ctrl = client.controllers.pubsub || new jabberwerx.PubSubController(client); 
        var node = new jabberwerx.PubSubNode(null, "test/jabberwerx", ctrl);
        client.entitySet.register(node);
        
        var callback = function(evt) {
            var fn = arguments.callee;
            
            fn.triggered = true;
            ok(evt.source instanceof jabberwerx.PubSubNode, "event source is PubSubNode");
            ok(evt.source !== node, "event source is NOT originating node");
            equals(evt.data.operation, fn.eventOp, "event operation matches");
            equals(evt.data.items.length, fn.eventItems.length, "matching items length");
            for (var idx = 0; idx < Math.min(evt.data.items.length, fn.eventItems.length); idx++) {
                var exp = fn.eventItems[idx];
                var act = evt.data.items[idx];
                
                equals(act.id, exp.id, "item IDs match");
                equals((act.publisher || "").toString(), (exp.publisher || "").toString(), "item publishers match");
                equals(act.data.xml, exp.data.xml, "payload matches");
            }
        };
        callback.reset = function(op, items) {
            this.triggered = false;
            this.eventOp = op;
            this.eventItems = items;
        };
        node.event("pubsubItemsChanged").bind(callback);
        
        var stanza, builder, item;
        stanza = new jabberwerx.Message();
        stanza.setType("headline");
        stanza.setFrom("jwtest1@example.com");
        builder = new jabberwerx.NodeBuilder(stanza.getNode());
        builder.element("{http://jabber.org/protocol/address}addresses").
                element("address").attribute("type", "replyto").
                                   attribute("jid", "jwtest1@example.com/publisher");
        item = builder.element("{http://jabber.org/protocol/pubsub#event}event").
                       element("items", {"node": "test/jabberwerx"}).
                       element("item", {"id": "current"});
                
        item.element("{test/jabberwerx}payload").text("the payload");
        item = item.data.cloneNode(true);
        jabberwerx.$(item).attr("publisher", "jwtest1@example.com/publisher");
        item = new jabberwerx.PubSubItem(item);

        // notification triggered on beforeMessageReceived
        var evt = new jabberwerx.EventObject(client.event("beforeMessageReceived"), stanza);
        evt.selected = jabberwerx.$(stanza.getNode()).
                       find("event[xmlns=http://jabber.org/protocol/pubsub#event]>*[node=test/jabberwerx]").
                       get(0);
        callback.reset("added", [item]);
        var result = node._handleNotify(evt);
        ok(result, "notification event handled");
        ok(callback.triggered, "event callback triggered");
        
        stanza = new jabberwerx.Message();
        stanza.setType("headline");
        stanza.setFrom("jwtest1@example.com");
        builder = new jabberwerx.NodeBuilder(stanza.getNode());
        builder.element("{http://jabber.org/protocol/address}addresses").
                element("address").attribute("type", "replyto").
                                   attribute("jid", "jwtest1@example.com/publisher");
        item = builder.element("{http://jabber.org/protocol/pubsub#event}event").
                       element("items", {"node": "test/jabberwerx"}).
                       element("item", {"id": "current"});
                
        item.element("{test/jabberwerx}payload").text("new payload");
        item = item.data.cloneNode(true);
        jabberwerx.$(item).attr("publisher", "jwtest1@example.com/publisher");
        item = new jabberwerx.PubSubItem(item);

        // notification triggered on beforeMessageReceived
        var evt = new jabberwerx.EventObject(client.event("beforeMessageReceived"), stanza);
        evt.selected = jabberwerx.$(stanza.getNode()).
                       find("event[xmlns=http://jabber.org/protocol/pubsub#event]>*[node=test/jabberwerx]").
                       get(0);
        callback.reset("updated", [item]);
        var result = node._handleNotify(evt);
        ok(result, "notification event handled");
        ok(callback.triggered, "event callback triggered");

        
        stanza = new jabberwerx.Message();
        stanza.setType("headline");
        stanza.setFrom("jwtest1@example.com");
        builder = new jabberwerx.NodeBuilder(stanza.getNode());
        builder.element("{http://jabber.org/protocol/pubsub#event}event").
                element("items", {"node": "test/jabberwerx"}).
                element("retract", {"id": "current"});
                
        // item from previous run still counts for remove

        // notification triggered on beforeMessageReceived
        var evt = new jabberwerx.EventObject(client.event("beforeMessageReceived"), stanza);
        evt.selected = jabberwerx.$(stanza.getNode()).
                       find("event[xmlns=http://jabber.org/protocol/pubsub#event]>*[node=test/jabberwerx]").
                       get(0);
        callback.reset("removed", [item]);
        var result = node._handleNotify(evt);
        ok(result, "notification event handled");
        ok(callback.triggered, "event callback triggered");
    });
});
