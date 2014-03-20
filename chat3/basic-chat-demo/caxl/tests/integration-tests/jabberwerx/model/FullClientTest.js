/**
 * filename:        FullClientTest.js
 * created at:      2011/04/08T10:45:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/client/full");

    test("Test disco walk.", function() {
        stop();
        var disconnect = function(client) {
            setTimeout(function() {
                client.disconnect();
                start();
            }, 1);
        }

        var myClient = new jabberwerx.Client("test-roster-fetch");

        var timeoutId = setTimeout(function() {
            ok(false, "Received timeout before disco controller finished.");
            disconnect(myClient);
        }, 20000);

        myClient.controllers.disco.timeout = 5;
        myClient.controllers.disco.event("discoInitialized").bind(function() {
            ok(true, "Received discoInitialized");
            clearTimeout(timeoutId);
        });


        var connArg = {
            httpBindingURL: defaults.httpBindingURL,
            errorCallback: function(err) {
                ok(false, "client did not connect successfully: " + err.xml);
                start();
            },
            successCallback: function() {
                ok(true, "connected successfully");
                disconnect(myClient);
            }
        }
        myClient.connect(testUserJID(1), defaults.password, connArg);
    });

    test("Test roster and disco running under connection batch update", function() {
        stop();
        var disconnect = function(client) {
            setTimeout(function() {
                client.disconnect();
                start();
            }, 1);
        }

        var eventsFired = [];
        var pushEvent = function(evt) {
            eventsFired.push(evt);
        }

        var bclient = new jabberwerx.Client("connect-batch-test");
        new jabberwerx.RosterController(bclient);

        bclient.entitySet.event("batchupdatestarted").bind(pushEvent);
        bclient.entitySet.event("batchupdateended").bind(pushEvent);
        bclient.controllers.roster.event("rosterfetched").bind(pushEvent);
        bclient.controllers.disco.event("discoinitialized").bind(pushEvent);

        bclient.event("clientstatuschanged").bind(function (evt) {
            if (evt.data.next == jabberwerx.Client.status_connected) {
                bclient.entitySet.event("batchupdatestarted").unbind(pushEvent);
                bclient.entitySet.event("batchupdateended").unbind(pushEvent);
                bclient.controllers.disco.event("discoinitialized").unbind(pushEvent);
                bclient.controllers.roster.event("rosterfetched").unbind(pushEvent);

                ok(4 == eventsFired.length, eventsFired.length + " events fired before clientStatusChanged:connected");
                ok(eventsFired[0].name == "batchupdatestarted", "first event is batch event: " + eventsFired[0].name);
                var found = jabberwerx.$.map(eventsFired, function(evt) {
                    if ((evt.name == "discoinitialized") || (evt.name == "rosterfetched")) {
                        return evt;
                    }
                    return null;
                });
                ok(found.length == 2, "found both discoinitialized and rosterfetched");
                ok(eventsFired[3].name == "batchupdateended", "last event is batch event: " + eventsFired[3].name);
            }
        });

        var connArg = {
            httpBindingURL: defaults.httpBindingURL,
            errorCallback: function(err) {
                ok(false, "client did not connect successfully: " + err.xml);
                start();
            },
            successCallback: function() {
                ok(true, "connected successfully");
                disconnect(bclient);
            }
        }
        bclient.connect(testUserJID(1), defaults.password, connArg);
    });
    
    test("Test CapabilitiesController UpdatePresence method", function() {
        stop();
        var client = new jabberwerx.Client("client-integration-test");
        var cap = client.controllers.capabilities;
        var tmpjid = "jwtest2@example.com";

        var qcc = client.controllers.quickContact || new jabberwerx.cisco.QuickContactController(client);
        var args = {
            successCallback: function() {
                try{
                    qcc.subscribe(tmpjid);
                } catch(ex) {
                    ok(false, "Unable to subscribe.");
                }
                
                ok(!client.getCurrentPresence(), "current presence is null");
                start();
                client.event("clientStatusChanged").unbind(cb);
                client.disconnect();
            },
            errorCallback: function(evt1) {
                ok(false, "client did not connect successfully ");  
                start();
            }
        };
        
        var cb = function(evt) {
            if (evt.data.next == jabberwerx.Client.status_connected) {
                try {
                    cap.addFeatureToJid("jwtest5@example.com", "urn:test:dummy#1");
                } catch (ex) {
                    ok(false, "Cannot add feature to JID.");
                }
                
                ok(!client.getCurrentPresence(), "current presence is null2");
            } else if (evt.data.next == jabberwerx.Client.status_disconnected) {
                cap.removeFeatureFromJid("jwtest5@example.com", "urn:test:dummy#1");
            }
        }
        
        client.event("clientStatusChanged").bind(cb);
        client.connect("jwtest5@example.com", "test", args);                                            
    });
});
