/**
 *
 */
jabberwerx.$(document).ready( function() {
    var client = new jabberwerx.Client("privacy-tests");
    var privacy = client.controllers.privacyList || new jabberwerx.PrivacyListController(client);
    var plist;
    var testCount = 0;
    
    var onConnected = function() {
        start();
    };
    var onClientError = function(err) {
        alert("Authentication error: " + err.xml);
    }
    
    module("jabberwerx/controller/privacylistcontroller", {
        setup: function() {
            if (!client.isConnected()) {
                var userJID = testUserJID(1);

                var args = {
                    httpBindingURL: defaults.httpBindingURL,
                    successCallback: onConnected,
                    errorCallback: onClientError
                };
                client.connect(userJID, defaults.password, args);
                stop();
            }
        },
        teardown: function() {
            if (testCount == 0) {
                client.disconnect();
            }
        }
    });
    
    var equalsJids = function(exp, act, msg) {
        if (msg) {
            msg = msg + ": ";
        } else {
            msg = "";
        }
        equals(exp.length, act.length, msg + "expected length");
        for (var idx = 0; idx < Math.min(act.length, exp.length); idx++) {
            ok(act[idx] instanceof jabberwerx.JID, msg + "expected JID instance");
            equals( exp[idx].toString(),
                    act[idx].toString(),
                    msg + "jid[" + idx + "] equal");
        }
    };
    
    testCount++;
    test("test fetch (1)", function() {
        stop();
        
        var cb = function(list, err) {
            testCount--;
            plist = list;
            
            ok(this instanceof jabberwerx.PrivacyListController, "expected PrivacyListController");
            ok(!err, ((err && err.xml) || "no error"));
            ok(list instanceof jabberwerx.PrivacyList, "list is PrivacyList");
            equals("testing", plist.getName(), "list is 'testing'");
            equalsJids( [],
                        plist.getBlockedJids(),
                        "fetched list");
            
            start();
        };
        
        privacy.fetch("testing", cb);
    });

    testCount++;
    test("test block (success)", function() {
        stop();
        
        var jids = [
            jabberwerx.JID.asJID("blockedtest0@example.com"),
            jabberwerx.JID.asJID("blockedtest2@example.com"),
            jabberwerx.JID.asJID("blockedtest1@example.com")
        ];
        var cb = function(err) {
            testCount--;
            
            ok(this instanceof jabberwerx.PrivacyList, "expected PrivacyList");
            ok(!err, ((err && err.xml) || "no error"));
            equalsJids(jids, this.getBlockedJids(), "updated list");
            
            start();
        };
        plist.blockJid(jids[2]);
        plist.blockJid(jids[1]);
        plist.blockJid(jids[0]);
        plist.update(cb);
    });
    
    test("test block (bad input)", function() {
        var caught;

        try {
            caught = false;
            plist.blockJid("bad jid@example.com");
        } catch(ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "expected InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected error thrown");

        try {
            caught = false;
            plist.blockJid("");
        } catch(ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "expected InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected error thrown");

        try {
            caught = false;
            plist.blockJid();
        } catch(ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "expected InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected error thrown");
    });
    
    testCount++;
    test("test update (server fail)", function() {
        stop();
        
        var cb = function(err) {
            testCount--;
            var list = this;
            
            ok(this instanceof jabberwerx.PrivacyList, "expected PrivacyList");
            ok(err, ((err && err.xml) || "no error"));
            ok(list instanceof jabberwerx.PrivacyList, "list is PrivacyList");
            equals("testing", list.getName(), "list is 'testing'");
            
            var jids = [
                jabberwerx.JID.asJID("blockedtest0@example.com"),
                jabberwerx.JID.asJID("blockedtest2@example.com"),
                jabberwerx.JID.asJID("blockedtest1@example.com")
            ];
            equalsJids( jids,
                        list.getBlockedJids(),
                        "fetched list");
            
            start();
        }
        
        plist.blockJid("this-is-a-really-long-jid-that-should-fail-because-it-exceeds-the-limits-of-the-server-although-it-ought-not-too-because-it-is-under-the-1023-byte-per-part-limit-a-la-rfc-3920.com");
        plist.update(cb);
    });
    //*/
    
    testCount++;
    test("test fetch (2)", function() {
        stop();
        
        var cb = function(list, err) {
            testCount--;
            plist = list;
            
            ok(this instanceof jabberwerx.PrivacyListController, "expected PrivacyListController");
            ok(!err, ((err && err.xml) || "no error"));
            ok(list instanceof jabberwerx.PrivacyList, "list is PrivacyList");
            equals("testing", plist.getName(), "list is 'testing'");
            
            var jids = [
                jabberwerx.JID.asJID("blockedtest0@example.com"),
                jabberwerx.JID.asJID("blockedtest2@example.com"),
                jabberwerx.JID.asJID("blockedtest1@example.com")
            ];
            equalsJids( jids,
                        plist.getBlockedJids(),
                        "fetched list");
            
            start();
        };
        
        privacy.fetch("testing", cb);
    });
    
    testCount++;
    test("test unblock", function() {
        stop();
        
        var cb = function(err) {
            testCount--;
            
            ok(this instanceof jabberwerx.PrivacyList, "expected PrivacyList");
            ok(!err, ((err && err.xml) || "no error"));
            
            var jids = [
                jabberwerx.JID.asJID("blockedtest2@example.com"),
                jabberwerx.JID.asJID("blockedtest1@example.com")
            ];
            equalsJids( jids,
                        plist.getBlockedJids(),
                        "fetched list");
            
            start();
        };
        plist.unblockJid("blockedtest0@example.com");
        plist.update(cb);
    });

    test("test unblock (bad input)", function() {
        var caught;

        try {
            caught = false;
            plist.unblockJid("bad jid@example.com");
        } catch(ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "expected InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected error thrown");

        try {
            caught = false;
            plist.unblockJid("");
        } catch(ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "expected InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected error thrown");

        try {
            caught = false;
            plist.unblockJid();
        } catch(ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "expected InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected error thrown");
    });
    
    testCount++;
    test("test fetch (3)", function() {
        stop();
        
        var cb = function(list, err) {
            testCount--;
            plist = list;
            
            ok(this instanceof jabberwerx.PrivacyListController, "expected PrivacyListController");
            ok(!err, ((err && err.xml) || "no error"));
            ok(list instanceof jabberwerx.PrivacyList, "list is PrivacyList");
            equals("testing", plist.getName(), "list is 'testing'");
            
            var jids = [
                jabberwerx.JID.asJID("blockedtest2@example.com"),
                jabberwerx.JID.asJID("blockedtest1@example.com")
            ];
            equalsJids( jids,
                        plist.getBlockedJids(),
                        "fetched list");
            
            start();
        };
        
        privacy.fetch("testing", cb);
    });
    
    testCount++;
    test("test remove", function() {
        stop();
        
        var cb = function(err) {
            testCount--;
            
            ok(this instanceof jabberwerx.PrivacyList, "expected PrivacyList");
            ok(!err, ((err && err.xml) || "no error"));
            
            start();
        };
        plist.remove(cb);
    });
    
    testCount++;
    test("test block and presence", function() {
        //prep an entity
        var entities = [
            new jabberwerx.TemporaryEntity("blockedjid2@example.com"),
            new jabberwerx.TemporaryEntity("blockedjid4@example.com"),
            new jabberwerx.TemporaryEntity("blockedjid5@example.com")
        ];
        for (var idx = 0; idx < entities.length; idx++) {
            var ent = entities[idx];
            client.entitySet.register(ent);
            
            var prs = new jabberwerx.Presence();
            prs.setFrom(ent.jid + "/fake-resource");
            ent.updatePresence(prs);
        }
        
        stop();
        
        var plist = null;
        var prsCB = function(evt) {
            var prs = evt.data;
            var ctx = arguments.callee.recipients;
            var jid = prs.getToJID().getBareJID();
            ctx["jid" + jid.toString()] = true;
            ctx.length++;
            
            var ent = client.entitySet.entity(jid);
            ok(ent, "entity " + jid + " exists");
            ok(ent.getPrimaryPresence(), "we have presence for entity " + jid);
        };
        prsCB.recipients = {length: 0};
        client.event("presenceSent").bindWhen("[type='unavailable'][to]", prsCB);

        var blist = null;
        var updateCB = function(err) {
            testCount--;
            
            var actRecipients = prsCB.recipients || {};
            var expRecipients = arguments.callee.recipients || {};
            equals(actRecipients.length, expRecipients.length, "expected number of presence");
            
            client.event("presenceSent").unbind(prsCB);
            blist.remove();
            
            start();
        };
        
        updateCB.recipients = {
            "jid:blockedjid2@example.com": true,
            "jid:blockedjid4@example.com": true,
            length: 2
        };
        
        var fetchCB = function(list, err) {
            ok(list, "list fetched");
            
            blist = list;
            list.blockJid("blockedjid1@example.com");
            list.blockJid("blockedjid2@example.com");
            list.blockJid("blockedjid3@example.com");
            list.blockJid("blockedjid4@example.com");
            list.update(updateCB);
        }
        privacy.fetch("JWA Privacy Blocking", fetchCB);
    });
});
 