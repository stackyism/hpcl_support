/**
 * filename:        MUCInviteTest.js
 * created at:      2009/11/10T11:20:00+01:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    
    module("jabberwerx/model/mucinvite");
    
    test("Test MUC Invite", function() {
        var stanza = new jabberwerx.Stanza("message");
        var mucInvite = new jabberwerx.MUCInvite(stanza, "room@example.com");

        ok(mucInvite.getStanza() instanceof jabberwerx.Stanza,
           "stanza should be of type jabberwerx.Stanza");
        var room = mucInvite.getRoom();
        ok(room instanceof jabberwerx.JID, "room should be of type jabberwerx.JID");
        equals(room, "room@example.com", "Room should be \"room@example.com\"");
        equals(mucInvite.getInvitor(), null, "Invitor should be null");
        equals(mucInvite.getReason(), null, "Reason should be null");
        equals(mucInvite.getPassword(), null, "Password should be null");
        
        mucInvite = new jabberwerx.MUCInvite(stanza, "room@example.com", "invitor@example.com",
                                             "reason", "password");
        equals(mucInvite.getRoom(), "room@example.com", "Room should be \"room@example.com\"");
        equals(mucInvite.getInvitor(),
                        "invitor@example.com", "Invitor should be \"invitor@example.com\"");
        equals(mucInvite.getReason(), "reason", "Reason should be \"reason\"");
        equals(mucInvite.getPassword(), "password", "Password should be \"password\"");
    });
});
