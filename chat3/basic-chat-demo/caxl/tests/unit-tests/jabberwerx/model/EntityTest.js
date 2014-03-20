/**
 * filename:        EntityTest.js
 * created at:      2009/05/01T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    // Beginning of Entity Unit Tests module
    module("jabberwerx/model/entity");

    test("Test Create", function() {
        var entity;
        entity = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar",
            node: "some:random:node"
        });
        same(entity.jid.toString(), "foo@jabber.com/bar", "entity JID matches");
        same(entity.node, "some:random:node", "entity node matches");

        entity = new jabberwerx.Entity({
            jid: new jabberwerx.JID("foo@jabber.com/bar"),
            node: "some:random:node"
        });
        same(entity.jid.toString(), "foo@jabber.com/bar", "entity JID matches");
        same(entity.node, "some:random:node", "entity node matches");

        entity = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar"
        });
        same(entity.jid.toString(), "foo@jabber.com/bar", "entity JID matches");
        ok(!entity.node, "entity node missing");

        entity = new jabberwerx.Entity({
            jid: new jabberwerx.JID("foo@jabber.com/bar")
        });
        same(entity.jid.toString(), "foo@jabber.com/bar", "entity JID matches");
        ok(!entity.node, "entity node missing");

        entity = new jabberwerx.Entity({
            node: "some:random:node"
        });
        ok(!entity.jid, "entity JID missing");
        same(entity.node, "some:random:node", "entity node matches");

        try {
            entity = new Entity();
            fail("expected TypeError not thrown");
        } catch (ex) {
            ok(true, "caught thrown exception");
        }
    });

    test("Test Matches", function() {
        var entity1, entity2;

        entity1 = entity2 = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar",
            node: "some:random:node"
        });
        equals(entity1.matches(entity2), true, "entity2 matches entity1");
        equals(entity2.matches(entity1), true, "entity1 matches entity2");

        entity2  = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar",
            node: "some:random:node"
        });
        equals(entity1.matches(entity2), true, "entity2 matches entity1");
        equals(entity2.matches(entity1), true, "entity1 matches entity2");

        entity2  = new jabberwerx.Entity({
            jid: "bar@jabber.com/bar",
            node: "some:random:node"
        });
        equals(entity1.matches(entity2), false, "entity2 DOES NOT match entity1");
        equals(entity2.matches(entity1), false, "entity1 DOES NOT match entity2");

        entity1  = new jabberwerx.Entity({
            jid: "bar@jabber.com/bar",
            node: "some:random:node"
        });
        equals(entity1.matches(entity2), true, "entity2 matches entity1");
        equals(entity2.matches(entity1), true, "entity1 matches entity2");

        entity1  = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar",
            node: "some:random:node"
        });
        entity2  = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar",
            node: "some:other:node"
        });
        equals(entity1.matches(entity2), false, "entity2 DOES NOT match entity1");
        equals(entity2.matches(entity1), false, "entity1 DOES NOT match entity2");

        entity1  = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar",
            node: "some:other:node"
        });
        equals(entity1.matches(entity2), true, "entity2 matches entity1");
        equals(entity2.matches(entity1), true, "entity1 matches entity2");

        entity2 = new jabberwerx.Entity({jid: "foo@jabber.com/bar"});
        equals(entity1.matches(entity2), false, "entity2 DOES NOT match entity1");
        equals(entity2.matches(entity1), false, "entity1 DOES NOT match entity2");

        entity1 = new jabberwerx.Entity({jid: "foo@jabber.com/bar"});
        equals(entity1.matches(entity2), true, "entity2 matches entity1");
        equals(entity2.matches(entity1), true, "entity1 matches entity2");

        entity1  = new jabberwerx.Entity({
            jid: "foo@jabber.com/bar",
            node: "some:random:node"
        });
        entity2 = new jabberwerx.Entity({node: "some:random:node"});
        equals(entity1.matches(entity2), false, "entity2 DOES NOT match entity1");
        equals(entity2.matches(entity1), false, "entity1 DOES NOT match entity2");

        entity1 = new jabberwerx.Entity({node: "some:random:node"});
        equals(entity1.matches(entity2), true, "entity2 matches entity1");
        equals(entity2.matches(entity1), true, "entity1 matches entity2");
    });

    test("Test DisplayName", function() {
        var entity;

        entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        equals(entity.getDisplayName(), "foo@jabber.com", "display name is JID");

        entity.setDisplayName("foo AT jabber DOT com");
        equals(entity.getDisplayName(), "foo AT jabber DOT com", "display name is explicit");

        entity.setDisplayName("");
        equals(entity.getDisplayName(), "foo@jabber.com", "display name is JID");

        entity = new jabberwerx.Entity({node: "some:random:node"});
        equals(entity.getDisplayName(), "{some:random:node}", "display name is node");

        entity.setDisplayName("some COLON random COLON node");
        equals(entity.getDisplayName(), "some COLON random COLON node", "display name is explicit");

        entity.setDisplayName("");
        equals(entity.getDisplayName(), "{some:random:node}", "display name is node");

        entity = new jabberwerx.Entity({
            jid: "foo@jabber.com",
            node: "some:random:node"
        });
        equals(entity.getDisplayName(), "{some:random:node}foo@jabber.com", "display name is node + jid");

        entity.setDisplayName("foo AT jabber DOT com WITH some COLON random COLON node");
        equals(entity.getDisplayName(), "foo AT jabber DOT com WITH some COLON random COLON node", "display name is explicit");

        entity.setDisplayName("");
        equals(entity.getDisplayName(), "{some:random:node}foo@jabber.com", "display name is node + jid");

        entity = new jabberwerx.Entity({
            jid: "foo\\40aol.com@jabber.com"
        });
        equals(entity.getDisplayName(), "foo@aol.com@jabber.com", "JID-escaped display name");
    });

    test("Test Groups", function() {
        var __arraysEqual = function(actual, expected) {
            ok(actual, "actual array exists");
            equals(actual.length, expected.length, "arrays equal length");
            for (var idx in actual) {
                equals(actual[idx], expected[idx], "arrays[" + idx + "] equal value");
            }
        };

        var entity;

        entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        __arraysEqual(entity.getGroups(), []);

        entity.setGroups(["group one", "group two"]);
        __arraysEqual(entity.getGroups(), ["group one", "group two"]);

        entity.setGroups([]);
        __arraysEqual(entity.getGroups(), []);

        entity.setGroups("group solo");
        __arraysEqual(entity.getGroups(), ["group solo"]);

        entity.setGroups(null);
        __arraysEqual(entity.getGroups(), []);

        entity.setGroups(["group one", "group two"]);
        __arraysEqual(entity.getGroups(), ["group one", "group two"]);

        entity.setGroups("");
        __arraysEqual(entity.getGroups(), []);

        entity.setGroups(["group one", "group two"]);
        __arraysEqual(entity.getGroups(), ["group one", "group two"]);

        entity.setGroups();
        __arraysEqual(entity.getGroups(), []);
    });

    test("Test hasFeature", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        ok(entity.features, "contains features array");
        ok(!entity.hasFeature("some:random:feature"), "NOT hasFeature(some:random:feature)");
        ok(!entity.hasFeature("another:random:feature"), "NOT hasFeature(another:random:feature)");

        entity.features.push("some:random:feature");
        entity.features.push("another:random:feature");
        ok(entity.hasFeature("some:random:feature"), "hasFeature(some:random:feature)");
        ok(entity.hasFeature("another:random:feature"), "hasFeature(another:random:feature)");

        entity.features.splice(0, 1);
        ok(!entity.hasFeature("some:random:feature"), "NOT hasFeature(some:random:feature)");
        ok(entity.hasFeature("another:random:feature"), "hasFeature(another:random:feature)");
    });
    test("Test hasIdentity", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        ok(entity.identities, "contains features array");
        ok(!entity.hasIdentity("some-category/some-type"), "NOT hasIdentity(some-category/some-type)");
        ok(!entity.hasIdentity("category-2/diff-type"), "NOT hasIdentity(category-2/diff-type)");

        entity.identities.push("some-category/some-type");
        entity.identities.push("category-2/diff-type");
        ok(entity.hasIdentity("some-category/some-type"), "hasIdentity(some-category/some-type)");
        ok(entity.hasIdentity("category-2/diff-type"), "hasIdentity(category-2/diff-type)");

        entity.identities.splice(0, 1);
        ok(!entity.hasIdentity("some-category/some-type"), "NOT hasIdentity(some-category/some-type)");
        ok(entity.hasIdentity("category-2/diff-type"), "hasIdentity(category-2/diff-type)");
    });

    test("Test Get/Update Resource Presence", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        var p1 = new jabberwerx.Presence();

        p1.setPresence('chat', 'I want to chat', 1);
        p1.setFrom('foo@jabber.com/resource1');

        ok(entity.updatePresence(p1));
        ok(entity.getResourcePresence("resource1") === p1);

        p1 = p1.clone();
        p1.setType("unavailable");
        ok(entity.updatePresence(p1));
        ok(entity.getResourcePresence("resource1") === null);

        p1 = p1.clone();
        p1.setType();
        ok(entity.updatePresence(p1));
        ok(entity.getResourcePresence("resource1") === p1);

        var caught;

        // Try to add presence object with incorrect from jid
        p1 = new jabberwerx.Presence();
        p1.setPresence('chat', 'I want to chat', 1);
        p1.setFrom('bar@jabber.com/resource1');
        try {
            caught = false;
            entity.updatePresence(p1);
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.Entity.InvalidPresenceError,
               "error is jabberwerx.Entity.InvalidPresenceError");
        }
        ok(caught, "expected error thrown");

        // Try to add presence object with incorrect type
        p1 = new jabberwerx.Presence();
        p1.setPresence('chat', 'I want to chat', 1);
        p1.setFrom('foo@jabber.com/resource1');
        p1.setType("subscribe");
        try {
            caught = false;
            entity.updatePresence(p1);
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.Entity.InvalidPresenceError,
               "error is jabberwerx.Entity.InvalidPresenceError");
        }
        ok(caught, "expected error thrown");

        // Try to add non presence object
        try {
            caught = false;
            entity.updatePresence({x:1, y:2});
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error is TypeError");
        }
        ok(caught, "expected error thrown");
    });

    test("Test Get Primary Presence", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        var p1 = new jabberwerx.Presence();
        var p2 = new jabberwerx.Presence();

        p1.setPresence('chat', 'I want to chat', -1);
        p1.setFrom('foo@jabber.com/resource1');

        p2.setPresence('dnd', 'I am not available to chat', 2);
        p2.setFrom('foo@jabber.com/resource2');

        entity.updatePresence(p1);
        entity.updatePresence(p2);
        var retVal = entity.getPrimaryPresence();
        ok(retVal === p2);

        p1.setPriority(3);
        entity.updatePresence(p1);
        retVal = entity.getPrimaryPresence();
        ok(retVal === p1);

        var up1 = p1.clone();
        up1.setType("unavailable");
        entity.updatePresence(up1);
        retVal = entity.getPrimaryPresence();
        ok(retVal === p2);
    });

    test("Test Get All Presence", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        var p1 = new jabberwerx.Presence();
        var p2 = new jabberwerx.Presence();
        var p3 = new jabberwerx.Presence();
        var p4 = new jabberwerx.Presence();

        p1.setPresence('chat', 'I want to chat', -1);
        p1.setFrom('foo@jabber.com/resource1');

        p2.setPresence('dnd', 'I am not available to chat', 2);
        p2.setFrom('foo@jabber.com/resource2');

        p3.setPresence('xa', 'I am gone for on vacation', 2);
        p3.setFrom('foo@jabber.com/resource3');

        p4.setPresence('chat', 'I want to chat', -2);
        p4.setFrom('foo@jabber.com/resource4');

        entity.updatePresence(p1);
        entity.updatePresence(p2);
        entity.updatePresence(p3);
        entity.updatePresence(p4);
        var retVal = entity.getAllPresence();
        ok(retVal.length === 4);
        //order should be dnd, xa, -1, -2
        ok(retVal[0] === p2);
        ok(retVal[1] === p3);
        ok(retVal[2] === p1);
        ok(retVal[3] === p4);
    });

    test("Test resource-/primaryPresenceChanged Event Firing", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        var p1 = new jabberwerx.Presence();
        var p2 = new jabberwerx.Presence();
        var p3 = new jabberwerx.Presence();
        var p4 = new jabberwerx.Presence();

        p1.setPresence('chat', 'I want to chat', 1);
        p1.setFrom('foo@jabber.com/resource1');

        p2.setPresence('dnd', 'I am not available to chat', 2);
        p2.setFrom('foo@jabber.com/resource2');

        p3 = p1.clone();
        p3.setPresence("", "just available", 1);

        p4.setPresence('chat', 'Chat with me', -2);
        p4.setFrom('foo@jabber.com/resource3');

        //test new ordering (dnd > away > xa)
        var p5 = new jabberwerx.Presence();
        var p6 = new jabberwerx.Presence();

        p5.setPresence('away', 'away', 2);
        p5.setFrom('foo@jabber.com/resource4');

        p6.setPresence('xa', 'xa', 2);
        p6.setFrom('foo@jabber.com/resource5');

        var resourceFn = function(eventObj) {
            arguments.callee.triggered += 1;
            arguments.callee.fullJid = eventObj.data.fullJid;
            arguments.callee.presence = eventObj.data.presence;
            arguments.callee.nowAvailable = eventObj.data.nowAvailable;
        };
        var primaryFn = function (eventObj) {
            arguments.callee.triggered = true;
            arguments.callee.fullJid = eventObj.data.fullJid;
            arguments.callee.presence = eventObj.data.presence;
        }
        entity.event("resourcePresenceChanged").bind(resourceFn);
        entity.event('primaryPresenceChanged').bind(primaryFn);

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p1);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p1.getFrom());
        ok(resourceFn.presence === p1, "resource presence is presence1");
        ok(resourceFn.nowAvailable, "nowAvailable is true");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p1.getFrom());
        ok(primaryFn.presence === p1, "primary presence is presence1");

        //test new order dnd > away > xa
        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p6);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p6.getFrom());
        ok(resourceFn.presence === p6, "resource presence is presence5 (xa)");
        ok(resourceFn.nowAvailable, "nowAvailable is true");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p6.getFrom());
        ok(primaryFn.presence === p6, "primary presence is presence5 (xa)");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p5);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p5.getFrom());
        ok(resourceFn.presence === p5, "resource presence is presence4 (away)");
        ok(resourceFn.nowAvailable, "nowAvailable is true");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p5.getFrom());
        ok(primaryFn.presence === p5, "primary presence is presence4 (away)");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p2);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p2.getFrom());
        ok(resourceFn.presence === p2, "resource presence is presence2 (dnd)");
        ok(resourceFn.nowAvailable, "nowAvailable is true");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p2.getFrom());
        ok(primaryFn.presence === p2, "primary presence is presence2 (dnd)");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p3);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p3.getFrom());
        ok(resourceFn.presence === p3, "resource presence is presence3");
        ok(!resourceFn.nowAvailable, "nowAvailable is false");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event NOT triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p4);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p4.getFrom());
        ok(resourceFn.presence === p4, "resource presence is presence4");
        ok(resourceFn.nowAvailable, "nowAvailable is true");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event NOT triggered");

        //test new order dnd > away > xa
        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p2 = p2.clone();
        p2.setType("unavailable");
        entity.updatePresence(p2);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p2.getFrom());
        ok(resourceFn.presence === p2, "resource presence is presence2 (dnd)");
        ok(!resourceFn.nowAvailable, "nowAvailable is false");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p5.getFrom());
        ok(primaryFn.presence === p5, "primary presence is presence4 (away)");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p5 = p5.clone();
        p5.setType("unavailable");
        entity.updatePresence(p5);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p5.getFrom());
        ok(resourceFn.presence === p5, "resource presence is presence4 (away)");
        ok(!resourceFn.nowAvailable, "nowAvailable is false");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p6.getFrom());
        ok(primaryFn.presence === p6, "primary presence is presence5 (xa)");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p6 = p6.clone();
        p6.setType("unavailable");
        entity.updatePresence(p6);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p6.getFrom());
        ok(resourceFn.presence === p6, "resource presence is presence5 (xa)");
        ok(!resourceFn.nowAvailable, "nowAvailable is false");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p3.getFrom());
        ok(primaryFn.presence === p3, "primary presence is presence3");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p1 = p1.clone();
        p1.setType("unavailable");
        entity.updatePresence(p1);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p1.getFrom());
        ok(resourceFn.presence === p1, "resource presence is presence1");
        ok(!resourceFn.nowAvailable, "nowAvailable is false");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), p4.getFrom());
        ok(primaryFn.presence === p4, "primary presence is presence4");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p4 = p4.clone();
        p4.setType("unavailable");
        entity.updatePresence(p4);
        equals(resourceFn.triggered, 1, "resourcePresenceChanged event triggered");
        equals(resourceFn.fullJid.toString(), p4.getFrom());
        ok(resourceFn.presence === p4, "resource presence is presence4");
        ok(!resourceFn.nowAvialble, "nowAvailable is false");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), entity.jid.toString());
        ok(primaryFn.presence === null, "primary presence is NULL");

        p1.setFrom('foo@jabber.com/resource1');
        p1.setType("");
        p2.setFrom('foo@jabber.com/resource2');
        p2.setType("");
        p3.setFrom('foo@jabber.com/resource3');
        p3.setType("");
        entity.updatePresence(p1);
        entity.updatePresence(p2);
        entity.updatePresence(p3);
        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(null);
        equals(resourceFn.triggered, 3, "resourcePresenceChanged event triggered 3 times");
        ok(resourceFn.presence === null, "resource presence is null");
        equals(primaryFn.triggered, true, "primaryPresenceChanged event triggered");
        equals(primaryFn.fullJid.toString(), entity.jid.toString());
        ok(primaryFn.presence === null, "primary presence is null");
    });

    test("Test Update Pesence - Clear Presence List", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        var p1 = new jabberwerx.Presence();
        var p2 = new jabberwerx.Presence();

        p1.setPresence('chat', 'I want to chat', -1);
        p1.setFrom('foo@jabber.com/resource1');

        p2.setPresence('dnd', 'I am not available to chat', 2);
        p2.setFrom('foo@jabber.com/resource2');

        entity.updatePresence(p1);
        entity.updatePresence(p2);

        // Clear Presence List
        entity.updatePresence(null);
        same(null, entity.getResourcePresence("resource1"), "resource1 presence should be null");
        same(null, entity.getResourcePresence("resource2"), "resource2 presence should be null");
        var retVal = entity.getPrimaryPresence();
        same(null, retVal, "Primary Presence should be null");
    });

    test("Test resource-/primaryPresenceChanged Event NOT Firing", function() {
        var entity = new jabberwerx.Entity({jid: "foo@jabber.com"});
        var p1 = new jabberwerx.Presence();
        var p2 = new jabberwerx.Presence();
        var p3 = new jabberwerx.Presence();
        var p4 = new jabberwerx.Presence();

        p1.setPresence('chat', 'I want to chat', 1);
        p1.setFrom('foo@jabber.com/resource1');

        p2.setPresence('dnd', 'I am not available to chat', 2);
        p2.setFrom('foo@jabber.com/resource2');

        p3 = p1.clone();
        p3.setPresence("", "just available", 1);

        p4.setPresence('chat', 'Chat with me', -2);
        p4.setFrom('foo@jabber.com/resource3');

        //test new ordering (dnd > away > xa)
        var p5 = new jabberwerx.Presence();
        var p6 = new jabberwerx.Presence();

        p5.setPresence('away', 'away', 2);
        p5.setFrom('foo@jabber.com/resource4');

        p6.setPresence('xa', 'xa', 2);
        p6.setFrom('foo@jabber.com/resource5');

        var resourceFn = function(eventObj) {
            arguments.callee.triggered += 1;
            arguments.callee.fullJid = eventObj.data.fullJid;
            arguments.callee.presence = eventObj.data.presence;
            arguments.callee.nowAvailable = eventObj.data.nowAvailable;
        };
        var primaryFn = function (eventObj) {
            arguments.callee.triggered = true;
            arguments.callee.fullJid = eventObj.data.fullJid;
            arguments.callee.presence = eventObj.data.presence;
        }
        entity.event("resourcePresenceChanged").bind(resourceFn);
        entity.event('primaryPresenceChanged').bind(primaryFn);

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p1, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        //test new order dnd > away > xa
        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p6, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p5, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p2, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p3, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(p4, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        //test new order dnd > away > xa
        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p2 = p2.clone();
        p2.setType("unavailable");
        entity.updatePresence(p2, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p5 = p5.clone();
        p5.setType("unavailable");
        entity.updatePresence(p5, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p6 = p6.clone();
        p6.setType("unavailable");
        entity.updatePresence(p6, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p1 = p1.clone();
        p1.setType("unavailable");
        entity.updatePresence(p1, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        p4 = p4.clone();
        p4.setType("unavailable");
        entity.updatePresence(p4, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");

        p1.setFrom('foo@jabber.com/resource1');
        p1.setType("");
        p2.setFrom('foo@jabber.com/resource2');
        p2.setType("");
        p3.setFrom('foo@jabber.com/resource3');
        p3.setType("");
        entity.updatePresence(p1, true);
        entity.updatePresence(p2, true);
        entity.updatePresence(p3, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");
        resourceFn.triggered = 0;
        primaryFn.triggered = false;
        entity.updatePresence(null, true);
        equals(resourceFn.triggered, 0, "resourcePresenceChanged event triggered");
        equals(primaryFn.triggered, false, "primaryPresenceChanged event triggered");
    });

    test("Test Apply", function() {
        var entity, cpy;
        var prs = [
            new jabberwerx.Presence().setPresence('chat', 'I want to chat', 1),
            new jabberwerx.Presence().setPresence('dnd', 'I am not available to chat', 2)
        ];
        var props = {
            "property-one": "value one",
            "property-two": 2,
            "property-three": true
        };
        var feats = [
            "jabber:iq:private",
            "jabber:x:conference",
            "http://jabber.org/protocol/muc"
        ];
        var idents = [
            "client/pc"
        ];

        entity = new jabberwerx.Entity({jid:"foo-one@jabber.com"});
        for (var idx = 0; idx < prs.length; idx++) {
            prs[idx].setFrom("foo-one@jabber.com/resource" + (idx + 1));
            entity.updatePresence(prs[idx]);
        }
        for (var name in props) {
            entity.properties[name] = props[name];
        }
        for (var idx = 0; idx < feats.length; idx++) {
            entity.features.push(feats[idx]);
        }
        for (var idx = 0; idx < idents; idx++) {
            entity.identities.push(idents[idx]);
        }

        var updateCB = function(evt) {
            arguments.callee.triggered = true;
        };
        var client = new jabberwerx.Client();
        client.entitySet.event("entityUpdated").bind(updateCB);

        updateCB.triggered = false;
        cpy = new jabberwerx.Entity({jid:"foo-one@jabber.com"}, client.entitySet);
        cpy.apply(entity);
        equals(cpy._displayName, entity._displayName, "displayName equal");
        same(cpy._presenceList, entity._presenceList, "presenceList equal");
        same(cpy.properties, entity.properties, "properties equal");
        same(cpy.features, entity.features, "features equal");
        same(cpy.identities, entity.identities, "identities equal");
        ok(updateCB.triggered, "entityUpdated event triggered");

        updateCB.triggered = false;
        cpy = new jabberwerx.Entity({jid:"foo-one@jabber.com"}, client.entitySet);
        cpy.apply(entity, true);
        equals(cpy._displayName, entity._displayName, "displayName equal");
        same(cpy._presenceList, entity._presenceList, "presenceList equal");
        same(cpy.properties, entity.properties, "properties equal");
        same(cpy.features, entity.features, "features equal");
        same(cpy.identities, entity.identities, "identities equal");
        ok(!updateCB.triggered, "entityUpdated event NOT triggered");
    });
});
