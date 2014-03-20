/**
 * filename:        ContactTest.js
 * created at:      2009/06/01T13:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    var roster;
    var itemNode;

    module("jabberwerx/model/rostercontact", {
        setup: function() {
            var client = new jabberwerx.Client();
            roster = new jabberwerx.RosterController(client);
            
            var builder;
            builder = new jabberwerx.NodeBuilder("{jabber:iq:roster}item");
            builder.attribute("jid", "user-one@example.com");
            builder.attribute("name", "User One");
            builder.attribute("subscription", "both");
            builder.element("group").text("group one");
            builder.element("group").text("group two");
            itemNode = builder.data;
        },
        teardown: function() {
            delete roster.client;
            delete roster;
            delete itemNode;
        }
    });
    
    var __validateArrays = function(actual, expected) {
        ok(actual, "actual exists");
        equals(actual.length, expected.length, "array lengths match");
        for (var idx in expected) {
            equals(actual[idx], expected[idx], "array[" + idx + "] values match");
        }
    };
    
    test("Test Create", function() {
        var prsCB = function(evt) {
            fail("unexpected " + evt.name + "triggered");
            arguments.callee.triggered++;
        };
        prsCB.triggered = 0;
        jabberwerx.globalEvents.bind("primaryPresenceChanged", prsCB);
        jabberwerx.globalEvents.bind("resourcePresenceChanged", prsCB);
        
        var contact;
        var node;
        contact = new jabberwerx.RosterContact(itemNode, roster);
        ok(contact.getItemNode() === itemNode, "itemNode as expected");
        ok(contact.jid == "user-one@example.com", "jid as expected");
        ok(contact.node == "", "node as expected");
        ok(contact.getDisplayName() == "User One", "displayName as expected");
        __validateArrays(contact.getGroups(), ["group one", "group two"]);
        equals(prsCB.triggered, 0, "presence callbacks triggered");
        prsCB.triggered = 0;
        
        var caught;
        try {
            caught = false;
            contact = new jabberwerx.RosterContact(node);
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error instance of TypeError");
        }
        ok(caught, "expectd error thrown");
        
        try {
            caught = false;
            contact = new jabberwerx.RosterContact(null, roster);
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error instance of TypeError");
        }
        ok(caught, "expectd error thrown");
        
        try {
            caught = false;
            contact = new jabberwerx.RosterContact("item", roster);
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error instance of TypeError");
        }
        ok(caught, "expected error thrown");
        
        var builder = new jabberwerx.NodeBuilder("{jabber:iq:roster}item").
                attribute("jid", "foo\\40gmail.com@example.com").
                attribute("subscription", "both").
                element("group").text("group one").parent.
                element("group").text("group dos").parent;
        contact = new jabberwerx.RosterContact(builder.data, roster);
        ok(contact.getItemNode() === builder.data, "itemNode as expected");
        equals(contact.jid.toString(), "foo\\40gmail.com@example.com", "jid as expected");
        equals(contact.node, "", "node as expected");
        equals(contact.getDisplayName(), "foo@gmail.com@example.com", "displayName as expected");
        __validateArrays(contact.getGroups(), ["group one", "group dos"]);
        equals(prsCB.triggered, 0, "presence callbacks triggered");
        prsCB.triggered = 0;
        
        jabberwerx.globalEvents.unbind("primaryPresenceChanged", prsCB);
        jabberwerx.globalEvents.unbind("resourcePresenceChanged", prsCB);
    });
    
    test("Test Get/Set ItemNode", function() {
        var node = itemNode;
        var contact = new jabberwerx.RosterContact(itemNode, roster);
        ok(contact.getItemNode() === node, "itemNode as expected");
        ok(contact.jid == "user-one@example.com", "jid as expected");
        ok(contact.node == "", "node as expected");
        ok(contact.getDisplayName() == "User One", "displayName as expected");
        __validateArrays(contact.getGroups(), ["group one", "group two"]);
        
        var builder = new jabberwerx.NodeBuilder("{jabber:iq:roster}item");
        builder.attribute("jid", "user-one@example.com");
        builder.attribute("subscription", "both");
        builder.element("group").text("group one");
        builder.element("group").text("group two");
        node = builder.data;
        
        contact.setItemNode(node);
        ok(contact.getItemNode() === node, "itemNode as expected");
        ok(contact.jid == "user-one@example.com", "jid as expected");
        ok(contact.node == "", "node as expected");
        ok(contact.getDisplayName() == "user-one@example.com", "displayName as expected");
        __validateArrays(contact.getGroups(), ["group one", "group two"]);
    });
});
