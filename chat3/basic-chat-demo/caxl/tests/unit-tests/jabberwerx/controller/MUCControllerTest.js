/**
 * filename:        MUCControllerTest.js
 * created at:      2009/06/09T10:30:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    var client = new jabberwerx.Client();
    module("jabberwerx/controller/muccontroller", {
        setup: function() {
            client = new jabberwerx.Client();
        },
        teardown: function() {
            delete client;
        }
    });
    
    test("Test Create/Destroy", function() {
        ok(client.controllers["muc"] === undefined, "muc not defined");
        
        var muc = new jabberwerx.MUCController(client);
        ok(client.controllers["muc"] === muc, "muc is registered with client");
        ok(muc.client === client, "client is registered with muc");
        
        muc.destroy();
        ok(client.controllers["muc"] === undefined, "muc not defined");
        
        var caught;
        try {
            caught = false;
            muc = new jabberwerx.MUCController();
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "error is TypeError");
        }
        ok(caught, "expected error thrown");
    });
    
    test("Test capabilities", function() {
        var caps = client.controllers.capabilities;
        var muc = new jabberwerx.MUCController(client);
        
        ok(caps.containsFeature("http://jabber.org/protocol/muc"), "supports MUC");
        ok(caps.containsFeature("http://jabber.org/protocol/muc#user"), "supports MUC occupant");
        ok(caps.containsFeature("jabber:x:conference"), "supports MUC directed invites");
        ok(caps.containsFeature("http://jabber.org/protocol/xhtml-im"), "supports XHTML-IM");
    });
    
    test("Test Get/Create Room Instance", function() {
        var muc = new jabberwerx.MUCController(client);
    
        var cb = function(evt) {
            arguments.callee.triggered = evt.name;
            ok(evt.data instanceof jabberwerx.MUCRoom, "data is room");
        };
        
        client.entitySet.event("entityCreated").bind(cb);
        client.entitySet.event("entityDestroyed").bind(cb);
        
        var room;
        
        delete cb.triggered;
        room = muc.room("test-room@example.com");
        equals(cb.triggered, "entitycreated", "create event triggered");
        equals(room.jid, "test-room@example.com");
        ok(client.entitySet.entity("test-room@example.com") === room, "room in cache");

        delete cb.triggered;
        ok(room === muc.room("test-room@example.com"), "room alrady registered");
        equals(cb.triggered, undefined, "create event NOT triggered");
        
        delete cb.triggered;        
        room.remove();
        equals(cb.triggered, "entitydestroyed", "destroy event triggered");
        ok(!client.entitySet.event("test-room@example.com"), "room NOT in cache");
        
        var caught;
        try {
            caught = false
            room = muc.room("bad room@example.com");
        } catch(ex) {
            caught = true;
            ok(ex instanceof jabberwerx.JID.InvalidJIDError,
               "error is jabberwerx.JID.InvalidJIDError");
        }
        ok(caught, "expected error thrown");
    });
    
    test("Test Handle Direct Invite", function() {
        var muc = new jabberwerx.MUCController(client);
        
        var stanzaExt = invitorExt = roomExt = reasonExt = null;
        
        // Override _handleInvite for this test
        muc._handleInvite = function(stanza, room, invitor, reason) {
            stanzaExt = stanza;
            invitorExt = invitor;
            roomExt = room;
            reasonExt = reason;
        }
        
        var msg = new jabberwerx.Message();
        msg.setFrom("invitor@example.com");
        
        var nodeBuilder = new jabberwerx.NodeBuilder(msg.getNode());
        var x = nodeBuilder.
            element("{jabber:x:conference}x").
            attribute("jid", "room@example.com");
            
        var evtObj = {data: msg, selected: jabberwerx.$("x[xmlns='jabber:x:conference']", msg.getDoc())};
        muc._handleDirectInvite(evtObj);
        
        // Check results
        same(stanzaExt, msg, "Stanza should be msg");
        equals(invitorExt, "invitor@example.com", "Invitor should be invitor@example.com");
        equals(roomExt, "room@example.com", "Room should be room@example.com");
        equals(reasonExt, null, "Reason should be null");
        
        // Reset external vars
        stanzaExt = invitorExt = roomExt = reasonExt = null;
        
        // Add reason
        x.
            attribute("reason", "Some good reason");
    
        evtObj = {data: msg, selected: jabberwerx.$("x[xmlns='jabber:x:conference']", msg.getDoc())};
        muc._handleDirectInvite(evtObj);
        
        // Check results
        same(stanzaExt, msg, "Stanza should be msg");
        equals(invitorExt, "invitor@example.com", "Invitor should be invitor@example.com");
        equals(roomExt, "room@example.com", "Room should be room@example.com");
        equals(reasonExt, "Some good reason", "Reason should be correct");
    });
    
    test("Test Handle Mediated Invite", function() {
        var muc = new jabberwerx.MUCController(client);
        
        var stanzaExt = invitorExt = roomExt = reasonExt = passwordExt = null;
        
        // Override _handleInvite for this test
        muc._handleInvite = function(stanza, room, invitor, reason, password) {
            stanzaExt = stanza;
            invitorExt = invitor;
            roomExt = room;
            reasonExt = reason;
            passwordExt = password;
        }
        
        var msg = new jabberwerx.Message();
        msg.setFrom("room@example.com");
        
        var nodeBuilder = new jabberwerx.NodeBuilder(msg.getNode());
        var x = nodeBuilder.
            element("{http://jabber.org/protocol/muc#user}x");
        var invite = x.
            element("invite").
            attribute("from", "invitor@example.com");

        // Call mediated invite handler
        var evtObj = {data: msg,
                      selected: jabberwerx.$("x[xmlns='http://jabber.org/protocol/muc#user']>invite",
                                  msg.getDoc())};
        muc._handleMediatedInvite(evtObj);

        // Check results
        same(stanzaExt, msg, "Stanza should be msg");
        equals(invitorExt, "invitor@example.com", "Invitor should be invitor@example.com");
        equals(roomExt, "room@example.com", "Room should be room@example.com");
        equals(reasonExt, null, "Reason should be null");
        equals(passwordExt, null, "Password should be null");
        
        // Reset external vars
        stanzaExt = invitorExt = roomExt = reasonExt = passwordExt = null;
        
        // Add reason
        invite.
            element("reason").
            text("Some good reason");

        // Call mediated invite handler again        
        evtObj = {data: msg,
                      selected: jabberwerx.$("x[xmlns='http://jabber.org/protocol/muc#user']>invite",
                                  msg.getDoc())};
        muc._handleMediatedInvite(evtObj);
        
        // Check results
        same(stanzaExt, msg, "Stanza should be msg");
        equals(invitorExt, "invitor@example.com", "Invitor should be invitor@example.com");
        equals(roomExt, "room@example.com", "Room should be room@example.com");
        equals(reasonExt, "Some good reason", "Reason should be correct");
        equals(passwordExt, null, "Password should be null");
        
        // Reset external vars
        stanzaExt = invitorExt = roomExt = reasonExt = passwordExt = null;
        
        // Add password
        x.
            element("password").
            text("secret");
        
        // Call mediated invite handler again
        evtObj = {data: msg,
                      selected: jabberwerx.$("x[xmlns='http://jabber.org/protocol/muc#user']>invite",
                                  msg.getDoc())};
        muc._handleMediatedInvite(evtObj);
        
        // Check results

        equals(invitorExt, "invitor@example.com", "Invitor should be invitor@example.com");
        equals(roomExt, "room@example.com", "Room should be room@example.com");
        equals(reasonExt, "Some good reason", "Reason should be correct");
        equals(passwordExt, "secret", "Password should be correct");
    });
    
    test("Test Handle Invite", function() {
        var muc = new jabberwerx.MUCController(client);
        
        muc.event("mucInviteReceived").bind(function(evtObj) {
            mucInvite = evtObj.data;
        });
        
        // Set external variable to null
        var mucInvite = null;
        
        var stanzaParam = new jabberwerx.Stanza("message");

        // Invoke _handleInvite
        muc._handleInvite(stanzaParam, "room@example.com");

        // Check results
        ok(mucInvite instanceof jabberwerx.MUCInvite, "mucInvite should be of type MUCInvite");
        equals(mucInvite.getRoom().toString(),
                                "room@example.com", "Room should be \"room@example.com\"");
        ok(mucInvite.getStanza() instanceof jabberwerx.Stanza,
                                "stanza should be of type jabberwerx.Stanza");
        same(mucInvite.getStanza(), stanzaParam);
        equals(mucInvite.getInvitor(), null, "Invitor should be null");
        equals(mucInvite.getReason(), null, "Reason should be null");        
        equals(mucInvite.getPassword(), null, "Password should be null");
        
        // Set external variable to null
        var mucIvnite = null;
        
        // Invoke _handleInvite
        muc._handleInvite(stanzaParam, "room@example.com", "invitor@example.com", "reason", "password");
        
        // Check results
        ok(mucInvite instanceof jabberwerx.MUCInvite, "mucInvite should be of type MUCInvite");
        equals(mucInvite.getRoom().toString(),
                                "room@example.com", "Room should be \"room@example.com\"");
        ok(mucInvite.getStanza() instanceof jabberwerx.Stanza,
                                "stanza should be of type jabberwerx.Stanza");
        same(mucInvite.getStanza(), stanzaParam);
        equals(mucInvite.getInvitor().toString(),
                                "invitor@example.com", "Invitor should be \"invitor@example.com\"");
        equals(mucInvite.getReason(), "reason", "Reason should be \"reason\"");        
        equals(mucInvite.getPassword(), "password", "Password should be \"password\"");
    });
});
