/**
 * filename:        EntitySetTest.js
 * created at:      2009/05/11T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready( function() {
    var     entitySet, ents, jids;
    module("jabberwerx/model/entityset", {
        setup: function() {
            entitySet = new jabberwerx.EntitySet();
            ents = [];
            jids = [];

        },

        teardown: function() {
            delete entitySet;
            delete ents;
            delete jids;
        }
    });

    _populateEntitySet = function() {
            var jid, ent;
            jid = new jabberwerx.JID("example.com");
            jids.push(jid);
            ent = new jabberwerx.Entity({jid: jid});
            entitySet.register(ent);
            ents.push(ent);

            jid = new jabberwerx.JID("test-1@example.com");
            jids.push(jid);
            ent = new jabberwerx.Entity({jid: jid});
            entitySet.register(ent);
            ents.push(ent);
    };

    test("Test Register/Unregister", function() {
        ok(undefined === entitySet.entity("test-1@example.com"), "entity is not registered");

        var ent = new jabberwerx.Entity({jid: "test-1@example.com"});
        var result = entitySet.register(ent);
        ok(result, "entityset changed");
        ok(ent === entitySet.entity("test-1@example.com"), "original entity is registered");

        result = entitySet.unregister(ent);
        ok(result, "entityset changed");
        ok(undefined === entitySet.entity("test-1@example.com"), "entity is not registered");

        var replaced = new jabberwerx.Entity({jid: "test-1@example.com"});
        entitySet.register(ent);
        result = entitySet.register(replaced);
        ok(result, "entityset changed");
        ok(replaced === entitySet.entity("test-1@example.com"), "replaced entity is registered");

        result = entitySet.register(replaced);
        ok(!result, "entityset NOT changed");
        ok(replaced === entitySet.entity("test-1@example.com"), "replaced entity is registered");

        var caught;
        try {
            caught = false;
            entitySet.register();
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error instance of TypeError");
        }
        ok(caught, "expected error thrown");

        try {
            caught = false;
            entitySet.register("some object");
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error instance of TypeError");
        }
        ok(caught, "expected error thrown");
    });
    test("Test By-JID access", function() {
        _populateEntitySet();

        equals(ents[0], entitySet.entity(jids[0]), "same entity-1 on by-JID access");
        equals(ents[0], entitySet.entity("example.com"),
             "same entity-1 on by-JID string access");

        equals(ents[1], entitySet.entity(jids[1]), "same entity-2 on by-JID access");
        equals(ents[1], entitySet.entity("test-1@example.com"),
             "same entity-2 on by-JID string access");

        equals(undefined ,entitySet.entity("example.net"),
             "undefined on by-JID access");
    });

    test("Test Each", function() {
        var     visited = [];

        _populateEntitySet();
        entitySet.each(function(ent) {
            visited.push(ent);
        });

        equals(ents.length, visited.length, "test visited length");
        for (var e in ents) {
            ok(e in visited, "test entity in actual");
        }
        for (var e in visited) {
            ok(e in ents, "test entity in expected");
        }

        var     caught;
        try {
            entitySet.each({});
            caught = false;
        } catch (ex) {
            ok(ex instanceof TypeError, "thrown exception is TypeError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test Array Access", function() {
        _populateEntitySet();

        var     to_a = entitySet.toArray();
        equals(ents.length, to_a.length, "test array length");

        //Check that all entries in ents are also in to_a
        for (var e in ents) {
            var isPresent = false;
            for (var elem in to_a) {
            	if (ents[e] === to_a[elem]) {
            		isPresent = true;
            		break;
            	}
            }
            ok(isPresent, "test entity in expected")
        }

        //Check that all entries in to_a are also in entries
        for (var e in to_a) {
            var isPresent = false;
            for (var elem in ents) {
            	if (to_a[e] === ents[elem]) {
            		isPresent = true;
            		break;
            	}
            }
            ok(isPresent, "test entity in actual")
        }
    });

    test("Test Get All Groups", function() {
        _populateEntitySet();

        ents[0].setGroups(["group 1", "group 2", "group 3"]);
        ents[1].setGroups("group 1");

        var result = entitySet.getAllGroups();
        // Resulting array should contain a unique set of the groups
        same(result.length, 3, "3 group names should be returned");
        ok(jabberwerx.$.inArray("group 1", result) != -1, "'group 1' in result");
        ok(jabberwerx.$.inArray("group 2", result) != -1, "'group 2' in result");
        ok(jabberwerx.$.inArray("group 3", result) != -1, "'group 3' in result");
    });

    test("Test Batch", function() {
        var cache = new jabberwerx.EntitySet();

        var fn = function(evt) {
            arguments.callee.triggered = evt.name;
            ok(evt.source === cache, "event source is cache");
            if (evt.name == "batchupdatestarted") {
                ok(evt.data === undefined, "no batchUpdateStarted event data");
            } else {
                ok(evt.data !== undefined, "batchUpdateEnded event data exists");
            }
        };

        cache.event("batchUpdateStarted").bind(fn);
        cache.event("batchUpdateEnded").bind(fn);

        var running;

        delete fn.triggered;
        running = cache.startBatch();
        ok(!running, "batch not previously running");
        equals(fn.triggered, "batchupdatestarted");

        delete fn.triggered;
        running = cache.startBatch();
        ok(running, "batch WAS previously running");
        equals(fn.triggered, undefined);

        delete fn.triggered;
        running = cache.endBatch();
        ok(running, "batch IS now running");
        equals(fn.triggered, undefined);

        delete fn.triggered;
        running = cache.endBatch();
        ok(!running, "batch not now running");
        equals(fn.triggered, "batchupdateended");
    });

    test("Test Batch Eventing", function () {

        var evtsFired = [];
        var cache = new jabberwerx.EntitySet();

        cache._testEntityEventHandler = function (evt) {
            evtsFired.push(evt);
        }
        var invoker = cache.invocation("_testEntityEventHandler");
        jabberwerx.$.each(
            ["entityCreated", "entityDestroyed","entityUpdated",
             "entityRenamed", "entityAdded", "entityRemoved",
             "batchUpdateStarted", "batchUpdateEnded"],
            function () {
                cache.event(this).bind(invoker);
            });

        var jids = [{jid: "jwtest10@example.com"}, {jid: "jwtest100@example.com"}];
        var ent;

        //default allows events to fire during batch
        cache.startBatch();
        equals(evtsFired.length, 1, "events fired on startBatch");
        equals(evtsFired[0].name, "batchupdatestarted", "startBatch event fired");

        jabberwerx.$.each(jids, function () {
            evtsFired = [];
            ent = new jabberwerx.Entity(this, cache);
            cache.register(ent);

            equals(evtsFired.length, 1, "Events fired during register");
            equals(evtsFired[0].name, "entityadded", "event[0]");

            evtsFired = [];
            cache._renameEntity(ent, "foo@bar.com");
            equals(evtsFired.length, 1, "Events fired during _renameEntity");
            equals(evtsFired[0].name, "entityrenamed", "event[0]");
            evtsFired = [];
            ent.update();
            equals(evtsFired.length, 1, "Events fired during update");
            equals(evtsFired[0].name, "entityupdated", "event[0]");

            evtsFired = [];
            cache.unregister(ent);
            equals(evtsFired.length, 1, "Events fired during unregister");
            equals(evtsFired[0].name, "entityremoved", "event[0]");
        });
        evtsFired = [];
        cache.endBatch();
        equals(evtsFired.length, 1, "Events fired on endBatch");
        equals(evtsFired[0].name, "batchupdateended", "endBatch event fired");
        var bevts = evtsFired[0].data;
        equals(bevts.length, 8, "number of batched events");
        ok(bevts[0].name == "entityadded"   &&
           bevts[1].name == "entityrenamed" &&
           bevts[2].name == "entityupdated" &&
           bevts[3].name == "entityremoved" &&
           bevts[4].name == "entityadded"   &&
           bevts[5].name == "entityrenamed" &&
           bevts[6].name == "entityupdated" &&
           bevts[7].name == "entityremoved",
           "batched events are correct");

        //repeat test sans events
        cache.suppressBatchedEvents = true;

        evtsFired = [];
        cache.startBatch();
        equals(evtsFired.length, 1, "events fired on startBatch");
        equals(evtsFired[0].name, "batchupdatestarted", "startBatch event fired");
        jabberwerx.$.each(jids, function () {
            evtsFired = [];
            ent = new jabberwerx.Entity(this, cache);
            cache.register(ent);
            equals(evtsFired.length, 0, "No events fired during register");
            cache._renameEntity(ent, "foo@bar.com");
            equals(evtsFired.length, 0, "No events fired during _renameEntity");
            ent.update();
            equals(evtsFired.length, 0, "No events fired during update");
            cache.unregister(ent);
            equals(evtsFired.length, 0, "No events fired during unregister");
        });
        evtsFired = [];
        cache.endBatch();
        equals(evtsFired.length, 1, "Events fired on endBatch");
        equals(evtsFired[0].name, "batchupdateended", "endBatch event fired");
        var bevts = evtsFired[0].data;
        equals(bevts.length, 8, "number of batched events");
        ok(bevts[0].name == "entityadded"   &&
           bevts[1].name == "entityrenamed" &&
           bevts[2].name == "entityupdated" &&
           bevts[3].name == "entityremoved" &&
           bevts[4].name == "entityadded"   &&
           bevts[5].name == "entityrenamed" &&
           bevts[6].name == "entityupdated" &&
           bevts[7].name == "entityremoved",
           "batched events are correct");

        cache.destroy;
    });


});
