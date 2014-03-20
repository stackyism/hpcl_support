/**
 * filename:        DiscoControllerTest.js
 * created at:      2010/08/17T08:49:00-00:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    var discoController;
    var client;
    var iqResponse;
    var exThrown;
    var error;
    var builder;
    
    module("jabberwerx/controller/discocontroller", {
        setup: function() {
            client = new jabberwerx.Client();
            client.connectedUser = {jid: 'foobar@cisco.com'};
            client.connectedServer = {jid: 'cisco.com'};
            discoController = new jabberwerx.DiscoController(client);
        },
        teardown: function() {
            delete client;
            delete discoController;
        }
    });
    
    test("Test Disco#Info", function() {

        // Override _walkDisco so that disco#info & disco#items queries 
        // are not actually sent by the client for this test
        discoController._walkDisco = function() {
            return;
        }
        
        // Bind to discoInitialized event to verify initialization went ok 
        discoController.event('discoInitialized').bind( function(evt) {
            ok(true, "Disco initialized");
        });

        // Create a standard disco#info response
        iqResponse = "<iq xmlns='jabber:client' from='geolocation.cisco.com' id='iq1111' to='foobar@cisco.com' type='result' >" +
                        "<query xmlns='http://jabber.org/protocol/disco#info'>" +
                            '<identity category="pubsub" name="Cisco Geo-location Service" type="pep"></identity>' +
                            '<feature var="http://jabber.org/protocol/disco#info"></feature>' +
                            '<feature var="http://protocols.cisco.com/location"></feature>' +
                            '</query>' +
                    "</iq>";

        var discoInfo = jabberwerx.Stanza.createWithNode(jabberwerx.util.unserializeXML(iqResponse));
        
        exThrown = false;
        try {
            // Handle disco#info server response
            discoController._handleDiscoInfo(discoInfo.getNode());
        } catch(e){
            exThrown = true;
        }
        
        // Verify server features, identity & displayName
        ok(!exThrown, "no exception thrown for disco#info");
        ok(jabberwerx.$.inArray("http://jabber.org/protocol/disco#info" , client.entitySet.entity('geolocation.cisco.com').features) != -1 , "'http://jabber.org/protocol/disco#info' feature found");   
        ok(jabberwerx.$.inArray("http://protocols.cisco.com/location" ,client.entitySet.entity('geolocation.cisco.com').features) != -1 , "'http://protocols.cisco.com/location' feature found");  
        ok(jabberwerx.$.inArray("pubsub/pep" , client.entitySet.entity('geolocation.cisco.com').identities) != -1 , "'pubsub/pep' identity found");
        ok("Cisco Geo-location Service" == client.entitySet.entity('geolocation.cisco.com').getDisplayName(), "'Cisco Geo-location Service' name correct");

    });
    
    test("Test Error Conditions", function() {
    
        // Override _walkDisco so that disco#info & disco#items queries 
        // are not actually sent by the client for this test
        discoController._walkDisco = function() {
            return;
        }
        
        // Bind to discoInitialized event to verify initialization went ok 
        discoController.event('discoInitialized').bind( function(evt) {
            ok(true, "Disco initialized");
            same(discoController._pendingJids.length,0,"pendingJids queue empty");
        });
        
        // Populate the _pendingJids queue with mock jids
        discoController._pendingJids.push('geolocation1.cisco.com');
        discoController._pendingJids.push('geolocation2.cisco.com');
        discoController._pendingJids.push('geolocation3.cisco.com');
        discoController._pendingJids.push('geolocation4.cisco.com');
        discoController._pendingJids.push('geolocation5.cisco.com');
         
        // Create a standard disco#info error reponse
        iqResponse = "<iq xmlns='jabber:client' from='geolocation1.cisco.com' id='iq5678' to='foobar@cisco.com' type='error' >" +
                        "<query xmlns='http://jabber.org/protocol/disco#info'/>" +
                    "</iq>";
                    
        // Create an iq stanza for item-not-found error
        var errItemNotFound = jabberwerx.Stanza.createWithNode(jabberwerx.util.unserializeXML(iqResponse));
        error = jabberwerx.Stanza.ERR_ITEM_NOT_FOUND;
        builder = new jabberwerx.NodeBuilder(errItemNotFound.getNode()).
                    xml(error.getNode().xml);
                    
        exThrown = false;
        try {
            // Handle disco#info server response
            discoController._handleDiscoInfo(errItemNotFound.getNode());
        } catch(e){
            exThrown = true;
        }
        
        ok(!exThrown, "no exception thrown for item-not-found error");
        same(discoController._pendingJids.length,4,"pendingJids decremented ok");    
             
        // Create an iq stanza for service-unavailable error
        var errServiceUnavail = jabberwerx.Stanza.createWithNode(jabberwerx.util.unserializeXML(iqResponse));
        errServiceUnavail.setFrom("geolocation2.cisco.com");
        error = jabberwerx.Stanza.ERR_SERVICE_UNAVAILABLE;
        builder = new jabberwerx.NodeBuilder(errServiceUnavail.getNode()).
                    xml(error.getNode().xml);
        
        exThrown = false;
        try {
            // Handle disco#info server response
            discoController._handleDiscoInfo(errServiceUnavail.getNode());
        } catch(e){
            exThrown = true;
        }
        
        ok(!exThrown, "no exception thrown for service unavailable error");
        same(discoController._pendingJids.length,3,"pendingJids decremented ok");
        
        // Create an iq stanza for forbidden error
        var errForbidden = jabberwerx.Stanza.createWithNode(jabberwerx.util.unserializeXML(iqResponse));
        errForbidden.setFrom("geolocation3.cisco.com");
        error = jabberwerx.Stanza.ERR_FORBIDDEN;
        builder = new jabberwerx.NodeBuilder(errForbidden.getNode()).
                    xml(error.getNode().xml);
        
        exThrown = false;
        try {
            // Handle disco#info server response
            discoController._handleDiscoInfo(errForbidden.getNode());
        } catch(e){
            exThrown = true;
        }
        
        ok(!exThrown, "no exception thrown for forbidden error");
        same(discoController._pendingJids.length,2,"pendingJids decremented ok");
        
        // Create an iq stanza for not-allowed error
        var errNotAllowed = jabberwerx.Stanza.createWithNode(jabberwerx.util.unserializeXML(iqResponse));
        errNotAllowed.setFrom("geolocation4.cisco.com");
        error = jabberwerx.Stanza.ERR_NOT_ALLOWED;
        builder = new jabberwerx.NodeBuilder(errNotAllowed.getNode()).
                    xml(error.getNode().xml);
        
        exThrown = false;
        try {
            // Handle disco#info server response
            discoController._handleDiscoInfo(errNotAllowed.getNode());
        } catch(e){
            exThrown = true;
        }
        
        ok(!exThrown, "no exception thrown for not-allowed error");
        same(discoController._pendingJids.length,1,"pendingJids decremented ok");
        
        // Create an iq stanza for not-authorized error
        var errNotAuth = jabberwerx.Stanza.createWithNode(jabberwerx.util.unserializeXML(iqResponse));
        errNotAuth.setFrom("geolocation5.cisco.com");
        error = jabberwerx.Stanza.ERR_NOT_AUTHORIZED;
        builder = new jabberwerx.NodeBuilder(errNotAuth.getNode()).
                    xml(error.getNode().xml);
        
        exThrown = false;
        try {
            // Handle disco#info server response
            discoController._handleDiscoInfo(errNotAuth.getNode());
        } catch(e){
            exThrown = true;
        }
        
        ok(!exThrown, "no exception thrown for not-authorized error");
        same(discoController._pendingJids.length,0,"pendingJids decremented ok");

    });

});
