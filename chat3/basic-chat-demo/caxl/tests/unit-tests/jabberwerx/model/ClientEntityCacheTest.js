/**
 * filename:        ClientEntityCacheTest.js
 * created at:      2009/06/01T07:48:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/cliententitycache");

    test("Test Register/Unregister", function() {
        var cache = new jabberwerx.ClientEntityCache();
        var entity = new jabberwerx.Entity({jid: "foo@bar/baz"});

        var fn = function(evt) {
            arguments.callee.triggered = evt.name;
            ok(evt.source === cache, "event source is cache");
            ok(evt.data === entity, "event data is entity");
        };
        cache.event("entityCreated").bind(fn);
        cache.event("entitydestroyed").bind(fn);

        delete fn.triggered;
        cache.register(entity);
        equals(fn.triggered, "entitycreated");

        delete fn.triggered;
        cache.register(entity);
        equals(fn.triggered, undefined);

        delete fn.triggered;
        cache.unregister(entity);
        equals(fn.triggered, "entitydestroyed");

        var replaced = new jabberwerx.Entity({jid: "foo@bar/baz"});
        cache.register(entity);

        var caught;
        delete fn.triggered;
        try {
            caught = false;
            cache.register(replaced);
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.EntitySet.EntityAlreadyExistsError,
               "error instance of jabberwerx.EntitySet.EntityAlreadyExistsError");
        }
        ok(caught, "Expected error thrown");

        try {
            caught = false;
            cache.register();
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error instance of TypeError");
        }
        ok(caught, "expected error thrown");
    });

    test("Test Entity/Cache Interaction", function() {
        var cache = new jabberwerx.ClientEntityCache();
        var entity = new jabberwerx.Entity({jid: "foo@bar/baz"}, cache);

        var fn = function(evt) {
            arguments.callee.triggered = evt.name;
            ok(evt.source === cache, "event source is cache");
            ok(evt.data === entity, "event data is entity");
        };
        cache.event("entityUpdated").bind(fn);
        cache.event("entitydestroyed").bind(fn);

        cache.register(entity);

        delete fn.triggered;
        entity.update();
        equals(fn.triggered, "entityupdated", "entity.update() update");

        delete fn.triggered;
        entity.setDisplayName("some name");
        equals(fn.triggered, "entityupdated", "entity.setDisplayName update");

        delete fn.triggered;
        entity.setGroups(["group one", "group #2"]);
        equals(fn.triggered, "entityupdated", "entity.setGroups update");

        delete fn.triggered;
        entity.remove();
        equals(fn.triggered, "entitydestroyed", "entity.remove update");
        equals(cache.entity("foo@bar/baz"), undefined);
    });

    test("Test LocalUser", function() {
        var cache = new jabberwerx.ClientEntityCache();
        var localUser;

        localUser = cache.localUser("foo@bar");
        ok(localUser instanceof jabberwerx.LocalUser, "LocalUser instance");
        equals(localUser.jid, "foo@bar");

        ok(cache.entity("foo@bar") === localUser, "entity lookup");
        ok(cache.localUser("foo@bar") === localUser, "exactly exists");

        localUser.remove();
        ok(cache.entity("foo@bar") === undefined, "entity removed");

        var other = new jabberwerx.Entity({jid: "user-one@example.com"});
        cache.register(other);
        var caught;
        try {
            caught = false;
            localUser = cache.localUser("user-one@example.com");
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.EntitySet.EntityAlreadyExistsError,
               "error instance of jabberwerx.EntitySet.EntityAlreadyExistsError");
        }
        ok(caught, "expected error thrown");
    });
    test("Test Server", function() {
        var cache = new jabberwerx.ClientEntityCache();
        var server;

        server = cache.server("bar");
        ok(server instanceof jabberwerx.Server, "Server instance");
        equals(server.jid, "bar");

        ok(cache.entity("bar") === server, "entity lookup");
        ok(cache.server("bar") === server, "exactly exists");

        server.remove();
        ok(cache.entity("bar") === undefined, "entity removed");

        var other = new jabberwerx.Entity({jid: "example.com"});
        cache.register(other);
        var caught;
        try {
            caught = false;
            server = cache.server("example.com");
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.EntitySet.EntityAlreadyExistsError,
               "error instance of jabberwerx.EntitySet.EntityAlreadyExistsError");
        }
        ok(caught, "expected error thrown");
    });
    test("Test TemporaryEntity", function() {
        var cache = new jabberwerx.ClientEntityCache();
        var tmpEntity;

        tmpEntity = cache.temporaryEntity("foo@bar");
        ok(tmpEntity instanceof jabberwerx.TemporaryEntity, "TemporaryEntity instance");
        ok(tmpEntity.cache === cache, "cache as expected");
        equals(tmpEntity.jid, "foo@bar");

        ok(cache.entity("foo@bar") === tmpEntity, "entity lookup");
        ok(cache.temporaryEntity("foo@bar", "test") === tmpEntity, "exactly exists");

        tmpEntity.remove();
        ok(cache.entity("foo@bar") === undefined, "entity removed");

        var other = new jabberwerx.Entity({jid: "user-one@example.com"});
        cache.register(other);
        var caught;
        try {
            caught = false;
            localUser = cache.temporaryEntity("user-one@example.com");
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.EntitySet.EntityAlreadyExistsError,
               "error instance of jabberwerx.EntitySet.EntityAlreadyExistsError");
        }
        ok(caught, "expected error thrown");
    });

    test("Test Entity Cache clear", function () {
        /* test entity type */
        TestEntity = jabberwerx.Entity.extend(/** @lends TestEntity.prototype */ {
            init: function(jid, ctrl) {
                this._super({jid: jid}, ctrl);
            }
        }, 'TestEntity');
        TestEntity2 = TestEntity.extend(/** @lends TestEntity2.prototype */ {
            init: function(jid, ctrl) {
                this._super(jid, ctrl);
            }
        }, 'TestEntity2');

        /* destroying controller */
        CacheTestController = jabberwerx.Controller.extend(/** @lends CacheTestController.prototype */{
            init: function(client, etype, cname) {
                this._super(client, cname || "cache_test");
                this.entityType = etype || this.entityType;
            },
            cleanupEntity: function(entity) {
                if (this.destroyEntities) {
                    if (entity.controller !== this) {
                        throw new TypeError("entity.controller !== this");
                    }
                    if (!(entity instanceof this.entityClass)) {
                        throw new TypeError("entity is not correct type");
                    }
                    entity.destroy();
                }
                ++this.destroyEntityCallCount;
                this._super(entity);
            },

            destroyEntityCallCount: 0,
            destroyEntities: false,
            entityClass: TestEntity
        }, "CacheTestController");

        var __addEntities = function(base, start, count, ctrl, entityClass) {
            for (var i = start; i < (start + count); ++i) {
                var jid = base + i + '@example.com';
                var entity = new entityClass(jid, ctrl);
                if (!ctrl.cleanupEntity) {
                    ctrl.register(entity);
                } else {
                    ctrl.client.entitySet.register(entity);
                }
            }
        }

        var __getEntityTypes = function(cache) {
            var ret = [];
            cache.each(function(entity) {
                var tstr = entity.getClassName();
                if (jabberwerx.$.inArray(tstr, ret) == -1) {
                    ret.push(tstr);
                }
            });
            return ret;
        }

        var client = new jabberwerx.Client();
        var cache = client.entitySet;
        cache.__each = "keys";

        var dctrl = new CacheTestController(client, TestEntity2, "destroy_ctrl");
        dctrl.destroyEntities = true;
        var nctrl = new CacheTestController(client, TestEntity, "noop_ctrl");
        nctrl.destroyEntities = false;

        /* one entity type */
        __addEntities("jwbase", 1, 100, dctrl, TestEntity2);
        equals(cache.toArray().length, 100, "cache count before clear");
        client._cleanupEntityCache();
        equals(cache.toArray().length, 0, "cache count after clear");
        equals(dctrl.destroyEntityCallCount, 100, "destroying controller.destroyEntity call count");
        equals(nctrl.destroyEntityCallCount, 0, "noop controller.destroyEntity call count");
        /* two entity types */
        __addEntities("jwbase", 1, 100, dctrl, TestEntity2);
        dctrl.destroyEntityCallCount = 0;
        __addEntities("jwbase", 101, 100, nctrl, TestEntity);
        equals(cache.toArray().length, 200, "cache count before clear");
        client._cleanupEntityCache();
        equals(cache.toArray().length, 100, "cache count after clear");
        equals(dctrl.destroyEntityCallCount, 100, "destroying controller.destroyEntity call count");
        equals(nctrl.destroyEntityCallCount, 100, "noop controller.destroyEntity call count");
        var etypes = __getEntityTypes(cache);
        ok((etypes.length == 1) && (etypes[0] == "TestEntity"), "remaining entities are all noop controller entities.");

        nctrl.destroyEntities = true;
        nctrl.destroyEntityCallCount = 0;
        client._cleanupEntityCache();

        equals(cache.toArray().length, 0, "cache count after clear of noop entities");
        equals(nctrl.destroyEntityCallCount, 100, "noop controller.destroyEntity call count");

        /* test temporyEntity handling */
        __addEntities("temp_ent", 1, 100, client.entitySet, jabberwerx.TemporaryEntity);
        equals(cache.toArray().length, 100, "cache count before clear of temp entities");
        client._cleanupEntityCache();
        equals(cache.toArray().length, 0, "cache count after clear of temp entities");

        /* all three entity types */
        nctrl.destroyEntities = false;
        nctrl.destroyEntityCallCount = 0;
        dctrl.destroyEntityCallCount = 0;

        __addEntities("destroy_ent", 1, 100, dctrl, TestEntity2);
        __addEntities("noop_ent", 1, 100, nctrl, TestEntity);
        __addEntities("temp_ent", 1, 100, client.entitySet, jabberwerx.TemporaryEntity);

        equals(cache.toArray().length, 300, "mixed cache count before clear");
        client._cleanupEntityCache();
        equals(cache.toArray().length, 100, "cache count after clear");
        equals(dctrl.destroyEntityCallCount, 100, "destroying controller.destroyEntity call count");
        equals(nctrl.destroyEntityCallCount, 100, "noop controller.destroyEntity call count");

        nctrl.destroyEntities = true;
        client._cleanupEntityCache();

        equals(cache.toArray().length, 0, "After everything");
    });

});
