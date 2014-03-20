/**
 * filename:        PEPNodeTest.js
 * created at:      2010/12/10T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/pep:node");
    
    test("Test Subscribe", function () {	
        var client = new jabberwerx.Client();
	var cap = client.controllers.capabilities;		
	var ctrl = client.controllers.pep || new jabberwerx.PEPController(client);	
	var node = ctrl.node ("http://jabber.org/protocol/mood");
	node.subscribe();

        ok(cap.containsFeature("http://jabber.org/protocol/mood+notify"),"expected caps found");
    });

    test("Test Unsubscribe", function () {	
        var client = new jabberwerx.Client();
        var cap = client.controllers.capabilities;		
        var ctrl = client.controllers.pep || new jabberwerx.PEPController(client);	
        var node = ctrl.node ("http://jabber.org/protocol/mood");
        node.subscribe();
        node.unsubscribe();

        ok(!cap.containsFeature("http://jabber.org/protocol/mood+notify"),"caps not found - expected");
    });

    test("Test Delete", function() {
        var client = new jabberwerx.Client();
        var cap = client.controllers.capabilities;		
        var ctrl = client.controllers.pep || new jabberwerx.PEPController(client);	
        var node = ctrl.node ("http://jabber.org/protocol/mood");

        var caught;
        try {
       	    node.deleteNode();
            caught = false;
        } catch (ex) {
            caught = (ex instanceof jabberwerx.util.NotSupportedError);
        }
        ok(caught, "expected error thrown");
    });

    test("Test Create", function() {
        var client = new jabberwerx.Client();
        var cap = client.controllers.capabilities;		
        var ctrl = client.controllers.pep || new jabberwerx.PEPController(client);	
        var node = ctrl.node ("http://jabber.org/protocol/mood");
 
        var caught;
        try {
       	    node.createNode();
            caught = false;
        } catch (ex) {
            caught = (ex instanceof jabberwerx.util.NotSupportedError);
        }
        ok(caught, "expected error thrown");
    });

    test("Test Constructor Null", function() {
        var client = new jabberwerx.Client();
        var cap = client.controllers.capabilities;		
        var ctrl = client.controllers.pep || new jabberwerx.PEPController(client); 
        var node;
 
        node = new jabberwerx.PEPNode(null, "http://jabber.org/protocol/mood", ctrl);
        equals(node.jid, null);
        equals(node.node, "http://jabber.org/protocol/mood");
        equals(node.delegate, null);
        same(node.controller, ctrl);

        node.subscribe();

	ok(cap.containsFeature("http://jabber.org/protocol/mood+notify"),"expected caps found");
    });

    test("Test Constructor JID", function() {
        var client = new jabberwerx.Client();
        var cap = client.controllers.capabilities;		
        var ctrl = client.controllers.pep || new jabberwerx.PEPController(client); 
        var node;
        
        node = new jabberwerx.PEPNode("jwtest0@example.com", "http://jabber.org/protocol/mood", ctrl);
        equals(node.jid, "jwtest0@example.com");
        equals(node.node, "http://jabber.org/protocol/mood");
        equals(node.delegate, null);
        same(node.controller, ctrl);

        node.subscribe();

        ok(cap.containsFeatureForJid(new jabberwerx.JID("jwtest0@example.com"), "http://jabber.org/protocol/mood+notify"),"expected caps found");
    });

    test("Test Destroy", function () {	
        var client = new jabberwerx.Client();
        var cap = client.controllers.capabilities;		
        var ctrl = client.controllers.pep || new jabberwerx.PEPController(client);	
        var node = ctrl.node ("http://jabber.org/protocol/mood");
        node.subscribe();

        ok(cap.containsFeature("http://jabber.org/protocol/mood+notify"),"expected caps found");

        node.destroy();

        ok(!cap.containsFeature("http://jabber.org/protocol/mood+notify"),"caps not found - expected");
    });
});
