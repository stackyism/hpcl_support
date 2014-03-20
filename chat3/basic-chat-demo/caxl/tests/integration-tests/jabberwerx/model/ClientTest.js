/**
 * filename:        ClientTest.js
 * created at:      2009/12/04T10:45:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/client"); 
    
    var testClientState = function(client, connected)  {
        if (connected) {        
            ok(client.isConnected(), "client is connected");
            ok(client.clientStatus == jabberwerx.Client.status_connected, "client status is connected");
        } else {
            ok(!client.isConnected(), "client is not connected");
            equals(client.clientStatus, jabberwerx.Client.status_disconnected, "client status is disconnected");
        }        
    };
    
    test ("Test valid connection", function() {
        stop();
        var client = new jabberwerx.Client("client-integration-test");
        
        var timing = function() {
            client.disconnect();
            start();
        };
        var arg = {
            successCallback: function() {
                testClientState(client, true);
                ok(client.getCurrentPresence() == null, "current presence is null (not yet sent)");
                setTimeout(timing, 1000);
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(timing, 1000);
            }
        };
        client.connect("jwtest1@example.com", "test", arg);
    });
    
    test ("Test bad auth credentials", function() {
        stop();
        var client = new jabberwerx.Client("client-integration-test");
        var arg = {
            successCallback: function() {
                ok(false, "client connected with bad auth credentials");
                start();
            },
            errorCallback: function(evt) {
                ok(true, "client did not connect with bad auth credentials");  
                start();
            }
        };
        client.connect("jwtest1@example.com", "foo", arg);
    });
    
    test ("Test bad JID", function() {
        var client = new jabberwerx.Client("client-integration-test");
        var arg = {};
        try {
            client.connect("jwtest1 bar@example.com", "foo", arg);
            ok(false, "client did not throw expected exception trying to connect with bad JID");
            testClientState(client, true);
        } catch (ex) {
            if (ex instanceof jabberwerx.Client.ConnectionError) {
                ok(true, "excepted ConnectionError exception thrown trying to connect with bad JID");
            } else {
                ok(false, "Unknown exception thrown trying to connect with bad JID");
            }
            testClientState(client, false);
        }        
    });
    test ("Test bad binding URI", function() {
        var client = new jabberwerx.Client("client-integration-test");
        var arg = {};
        try {
            arg.httpBindingURL = "a bad uri ^"
            client.connect("jwtest1@example.com", "foo", arg);
            ok(false, "client did not throw expected exception trying to connect with bad httpbinding");
            testClientState(client, true);
        } catch (ex) {
            if (ex instanceof jabberwerx.Client.ConnectionError) {
                ok(true, "excepted TypeError exception thrown trying to connect with bad httpbinding");
            } else {
                ok(false, "Unknown exception thrown trying to connect with bad httpbinding");
            }
            testClientState(client, false);
        }        
    });
    test ("Test that the specified resource name is the same after relogin", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        // create jabberwerx client with a specific resourceName - 'client-integration-test'
        var client = new jabberwerx.Client("client-integration-test");
        
        // function to log in client a second time to ensure that the same resourceName is in use
        var secondLogin = function(evt){
            if (evt.data.next == jabberwerx.Client.status_disconnected) {
                // verify that client's resourceName is not cleared
                // checking the _autoResourceName (private field) is a non-standard operation and is only used here for testing purposes
                ok(!client._autoResourceName, "pass, resourceName was specified in the constructor");
                ok(client.resourceName, "pass, client resourceName is not cleared");
                // re-connect
                client.connect("jwtest1@example.com", "test", argSecondConnect);
            }        
        }
        
        // bind to 'clientStatusChanged' ... call client.connect() again only after client has logged out
        client.event('clientStatusChanged').bind(secondLogin);
        
        // callback to end the test
        var endTest = function() {
            // clean up
            client.event('clientStatusChanged').unbind(secondLogin);
            client.disconnect();
            // restart the rest of the tests
            start();
        };
        
        var logout = function() {
            client.disconnect();
        };
        
        // connection arguments for first log in
        var argFirstConnect = {
            successCallback: function() {
                testClientState(client, true);
                // verify that resourceName used by client is 'client-integration-test'
                // and not a server generated resourceName
                equals(client.resourceName , "client-integration-test" , "pass, client has the correct resourceName");
                // after client disconnects, execute second log in
                setTimeout(logout, 1000);
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(endTest, 1000);
            }
        };     
        
        // connection arguments for second log in
        var argSecondConnect = {
            successCallback: function() {
                testClientState(client, true);
                // verify that resourceName used by client is still 'client-integration-test'
                equals(client.resourceName , "client-integration-test" , "pass, client has the same resourceName as before");
                setTimeout(endTest, 1000);
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(endTest, 1000);
            }
        };
        
        client.connect("jwtest1@example.com", "test", argFirstConnect); 
        
        // If all tests pass, 8 assertions are expected
        expect(8);
        
    });
    test ("Test that the server generated resource name gets created", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        // create jabberwerx client with no specific resourceName
        var client = new jabberwerx.Client();        

        // callback to end the test
        var endTest = function() {
            // clean up
            client.disconnect();
            // restart the rest of the tests
            start();
        };
        
        // connection arguments for log in
        var argFirstConnect = {
            successCallback: function() {
                testClientState(client, true);
                // verify that a server generated resourceName exists
                ok(client.resourceName , "pass, client has a resourceName - '" + client.resourceName + "'");
                setTimeout(endTest, 1000);
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(endTest, 1000);
            }
        };
        
        client.connect("jwtest1@example.com", "test", argFirstConnect); 
        
        // If all tests pass, 3 assertions are expected       
        expect(3);
        
    });
    test ("Test conflict error when the resource name specified", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        // create jabberwerx client with a specific resourceName - 'client-integration-test'
        var client = new jabberwerx.Client("client-integration-test");
        
        var secondLogin = function(){    
            var err = new jabberwerx.Client.ConnectionError("{urn:ietf:params:xml:ns:xmpp-streams}conflict");
            // Using _handleConnectionException (private method) is a non-standard operation and is only used here for testing purposes
            client._handleConnectionException(err);
        }
        
        var verifyClientLogout = function(evt){    
            if (evt.data.next != jabberwerx.Client.status_disconnected) {
                return;
            }
            
            // check that client logged out
            testClientState(client, false);
                
            // verify that client's resourceName is not cleared
            // checking _autoResourceName & _countDownOn (private fields) is a non-standard operation and is only used here for testing purposes
            ok(!client._autoResourceName, "pass, resourceName was specified in the constructor");
            ok(!client._countDownOn, "pass, not a reconnection");
            ok(client.resourceName, "pass, client resourceName is not cleared");
            
            endTest();
        }
        
        // trigger a test failure if a reconnection is attempted by the client
        var reconnectionFailure = function(evt){
            ok(false, "client attempted reconnection after conflict error");
            endTest();
        }
        
        // bind to 'reconnectCountdownStarted' ... call if client attempts a reconnection
        client.event('reconnectCountdownStarted').bind(reconnectionFailure);        
        client.event('clientStatusChanged').bind(verifyClientLogout);
        
        // callback to end the test
        var endTest = function() {
            // clean up
            client.event('reconnectCountdownStarted').unbind(reconnectionFailure);
            client.disconnect();
            // restart the rest of the tests
            start();
        };
        
        // connection arguments for first log in
        var argFirstConnect = {
            successCallback: function() {
                testClientState(client, true);
                // verify that resourceName used by client is 'client-integration-test'
                // and not a server generated resourceName
                equals(client.resourceName , "client-integration-test" , "pass, client has the correct resourceName");
                setTimeout(secondLogin, 2000);
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(endTest, 1000);
            }
        };     
        
        client.connect("jwtest1@example.com", "test", argFirstConnect); 
        
        // If all tests pass, 10 assertions are expected       
        expect(8);
    });
    test ("Test conflict error when a server generated resource name in use", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        // create jabberwerx client with no specific resourceName
        var client = new jabberwerx.Client();
        
        // storage for the resourceName generated
        var resourceName = null;

        var secondLogin = function(){    
            var err = new jabberwerx.Client.ConnectionError("{urn:ietf:params:xml:ns:xmpp-streams}conflict");
            // Using _handleConnectionException (private method) is a non-standard operation and is only used here for testing purposes
            client._handleConnectionException(err);
        }
        
        var verifyClientLogout = function(evt){
            if (evt.data.next != jabberwerx.Client.status_disconnected) {
                return;
            }
            
            // check that client logged out
            testClientState(client, false);
                
            // verify that client's resourceName is cleared
            // checking _autoResourceName & _countDownOn (private fields) is a non-standard operation and is only used here for testing purposes
            ok(client._autoResourceName, "pass, resourceName was server generated");
            ok(!client._countDownOn, "pass, not a reconnection");
            ok(!client.resourceName, "pass, client resourceName is cleared");
            
            endTest();
        }
        
        // trigger a test failure if a reconnection is attempted by the client
        var reconnectionFailure = function(evt){
            ok(false, "client attempted reconnection after conflict error");
            endTest();
        }
        
        // bind to 'reconnectCountdownStarted' ... call if client attempts a reconnection
        client.event('reconnectCountdownStarted').bind(reconnectionFailure);        
        client.event('clientStatusChanged').bind(verifyClientLogout);
        
        // callback to end the test
        var endTest = function() {
            // clean up
            client.event('reconnectCountdownStarted').unbind(reconnectionFailure);
            client.disconnect();
            // restart the rest of the tests
            start();
        };
        
        // connection arguments for first log in
        var argFirstConnect = {
            successCallback: function() {
                testClientState(client, true);
                // verify that a server generated resourceName exists
                ok(client.resourceName , "pass, client has a resourceName - '" + client.resourceName + "'");
                resourceName = client.resourceName;
                // after client connects, execute second log in
                setTimeout(secondLogin, 2000);
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(endTest, 1000);
            }
        };     
        
        client.connect("jwtest1@example.com", "test", argFirstConnect); 
        
        // If all tests pass, 11 assertions are expected       
        expect(8);
        
    });
    test ("Test the resource name used during a reconnection - resource name specified", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        // lower the baseReconnectCountdown for testing purposes
        var baseTimeOut = jabberwerx._config.baseReconnectCountdown;
        jabberwerx._config.baseReconnectCountdown = 1;
        
        // store the number of successful client connections
        var numOfConnections = 0;
        
        // create jabberwerx client with a specific resourceName - 'client-integration-test'
        var client = new jabberwerx.Client("client-integration-test");   
        
        var clientStatusCB = function (evt){
            if (evt.data.next == jabberwerx.Client.status_disconnected) {
                if (numOfConnections == 1) {
                    ok(true, "client disconnected due to manual exception thrown");
                }
            }
        }
        
        // bind to 'clientStatusChanged'
        client.event('clientStatusChanged').bind(clientStatusCB);   

        // function to trigger a client reconnect
        var reconnection = function() {
            // manually create an exception and trigger it
            var err = new jabberwerx.Client.ConnectionError("{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak");
            // Using _handleConnectionException (private method) is a non-standard operation and is only used here for testing purposes
            client._handleConnectionException(err);
        }

        // callback to end the test
        var endTest = function() {
            // clean up
            client.event('clientStatusChanged').unbind(clientStatusCB);
            client.disconnect();
            // restore baseReconnectCountdown
            jabberwerx._config.baseReconnectCountdown = baseTimeOut;
            // restart the rest of the tests
            start();
        };
        
        // connection arguments for log in
        var arg = {
            successCallback: function() {
                
                if (numOfConnections == 0) {
                    testClientState(client, true);
                    // verify that resourceName used by client is 'client-integration-test'
                    // and not a server generated resourceName
                    equals(client.resourceName , "client-integration-test" , "pass, client has the correct resourceName");
                    // after client disconnects, execute second log in
                    setTimeout(reconnection, 1000);
                }
                else if (numOfConnections == 1) {
                    testClientState(client, true);
                    // verify that resourceName used by client is still 'client-integration-test'
                    // and not a server generated resourceName
                    equals(client.resourceName , "client-integration-test" , "pass, client is still using the same resourceName");
                    endTest();
                }
 
                // increment connection counter
                numOfConnections++; 
                
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(endTest, 1000);
            }
        };

        client.connect("jwtest1@example.com", "test", arg); 
        
        // If all tests pass, 7 assertions are expected       
        expect(7);
        
    });
    test ("Test the resource name used during a reconnection - resource name server generated", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        // lower the baseReconnectCountdown for testing purposes
        var baseTimeOut = jabberwerx._config.baseReconnectCountdown;
        jabberwerx._config.baseReconnectCountdown = 1;
        
        // store the number of successful client connections
        var numOfConnections = 0;
        
        // create jabberwerx client with no specific resourceName
        var client = new jabberwerx.Client();  

        // storage for the resourceName generated
        var resourceName = null;        
        
        var clientStatusCB = function (evt){
            if (evt.data.next == jabberwerx.Client.status_disconnected) {
                if (numOfConnections == 1) {
                    ok(true, "client disconnected due to manual exception thrown");
                }
            }
        }
        
        // bind to 'clientStatusChanged'
        client.event('clientStatusChanged').bind(clientStatusCB);   

        // function to trigger a client reconnect
        var reconnection = function() {
            // manually create an exception and trigger it
            var err = new jabberwerx.Client.ConnectionError("{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak");
            // Using _handleConnectionException (private method) is a non-standard operation and is only used here for testing purposes
            client._handleConnectionException(err);
        }

        // callback to end the test
        var endTest = function() {
            // clean up
            client.event('clientStatusChanged').unbind(clientStatusCB);
            client.disconnect();
            // restore baseReconnectCountdown
            jabberwerx._config.baseReconnectCountdown = baseTimeOut;
            // restart the rest of the tests
            start();
        };
        
        // connection arguments for log in
        var arg = {
            successCallback: function() {
                
                if (numOfConnections == 0) {
                    testClientState(client, true);
                    // verify that a server generated resourceName exists
                    ok(client.resourceName , "pass, client has a resourceName - '" + client.resourceName + "'");
                    resourceName = client.resourceName;
                    // after client disconnects, execute second log in
                    setTimeout(reconnection, 1000);
                }
                else if (numOfConnections == 1) {
                    testClientState(client, true);
                    // verify that resourceName used by client is still the same
                    equals(client.resourceName , resourceName , "pass, client is still using the same resourceName");
                    endTest();
                }
 
                // increment connection counter
                numOfConnections++; 
                
            },
            errorCallback: function(evt) {
                testClientState(client, false);
                setTimeout(endTest, 1000);
            }
        };
        
        client.connect("jwtest1@example.com", "test", arg); 
        
        // If all tests pass, 7 assertions are expected       
        expect(7);
        
    }); 

    // This integration test requires that the testJid does not already exist on the BOSH server 
    // which you are running the integration test suite against
    test ("Test in-band registration with credentials", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        var client = new jabberwerx.Client("client-integration-test");
        
        // allows success without the need to clean XMPP server's users table
        var testJid = jabberwerx.JID.asJID("US433_" + jabberwerx.util.crypto.generateUUID() + "@example.com");
        
        var arg = {
            
            successCallback: function() {
                testClientState(client, true);
                equals(client.connectedUser.jid.toString(), testJid, "Correct jid used to login");
                start();
                client.disconnect();
            },
            
            errorCallback: function(evt) {
               ok(false, "client did not connect successfully using in-band registration");  
                start();
            },
            
            // Set flag to trigger in-band registration
            register:   true
        };
        
        client.connect(testJid, "test", arg);
        
        // If all tests pass, 3 assertions are expected       
        expect(3);
        
    });
    
    test ("Test in-band registration with no credentials - anonymous login", function() {
        // asynchronous test ... call stop() to allow tests time to run
        stop();
        
        var client = new jabberwerx.Client("client-integration-test");
        var testJid = "example.com";
        
        var arg = {
            
            successCallback: function() {
                testClientState(client, true);
                ok( /^caxl_.*/.exec(client.connectedUser.jid.toString()), "jid starts with correct prefix");
                start();
                client.disconnect();
            },
            
            errorCallback: function(evt) {
                ok(false, "client did not connect successfully using in-band registration with an anonymous login");  
                start();
            }
        };
        
        client.connect(testJid, null, arg);
        
        // If all tests pass, 3 assertions are expected       
        expect(3);
        
    });
    test("Test iq callback with timeout (received iq)", function() {
        stop();
        
        var client1, client2;
        client1 = new jabberwerx.Client();
        client2 = new jabberwerx.Client();

        var runner = function() {
            var cb = function(iq) {
                ok(iq, "received IQ");
                runner.triggered = true;
                setTimeout(timing, 1);
            };
            var query = new jabberwerx.NodeBuilder("{my:test:namespace}query").
                        data;
            var jid = client2.connectedUser.jid + "/" + client2.resourceName;
            client1.sendIq("set", jid, query, cb, 3);
        };
        runner.triggered = false;

        var timingID;
        var timing = function() {
            clearTimeout(timingID);
            timingID = 0;

            ok(runner.triggered, "callback triggered");
            client1.disconnect();
            client2.disconnect();
            setTimeout(start, 1000);
        };
        
        var arg1, arg2;
        arg1 = {
            successCallback: function() {
                client1.connect(testUserJID(2), defaults.password, arg2);
            },
            errorCallback: function(err) {
                ok(false, "client1 did not connect successfully");
                timingID = setTimeout(timing, 5000);
            }
        };
        arg2 = {
            successCallback: function() {
                setTimeout(runner, 1);
                timingID = setTimeout(timing, 5000);
            },
            errorCallback: function(err) {
                ok(false, "client2 did not connect successfully");
                timingID = setTimeout(timing, 1000);
            }
        };
        client2.connect(testUserJID(1), defaults.password, arg1);
        
        expect(2);
    });
    test("Test iq callback with timeout (timeout)", function() {
        stop();
        
        var client1, client2;
        client1 = new jabberwerx.Client();
        client2 = new jabberwerx.Client();
        client2.event("afterIqReceived").bind(function(evt) {
            return true;
        });

        var runner = function() {
            var cb = function(iq) {
                ok(iq, "received IQ");
                var iqNode = jabberwerx.Stanza.createWithNode(iq);
                ok(iqNode.isError(), "Error IQ.");
                ok(iqNode.getErrorInfo().getNode().xml ==
                   jabberwerx.Stanza.ERR_REMOTE_SERVER_TIMEOUT.getNode().xml,
                   "Remote Server Timeout.");
                runner.triggered = true;
                setTimeout(timing, 1);
            };
            var query = new jabberwerx.NodeBuilder("{my:test:namespace}query").
                        data;
            var jid = client2.connectedUser.jid + "/" + client2.resourceName;
            client1.sendIq("set", jid, query, cb, 3);
        };
        runner.triggered = false;

        var timingID;
        var timing = function() {
            clearTimeout(timingID);
            timingID = 0;

            ok(runner.triggered, "callback triggered");
            client1.disconnect();
            client2.disconnect();
            setTimeout(start, 1000);
        };
        
        var arg1, arg2;
        arg1 = {
            successCallback: function() {
                client1.connect(testUserJID(2), defaults.password, arg2);
            },
            errorCallback: function(err) {
                ok(false, "client1 did not connect successfully");
                timingID = setTimeout(timing, 5000);
            }
        };
        arg2 = {
            successCallback: function() {
                setTimeout(runner, 1);
                timingID = setTimeout(timing, 5000);
            },
            errorCallback: function(err) {
                ok(false, "client2 did not connect successfully");
                timingID = setTimeout(timing, 1000);
            }
        };
        client2.connect(testUserJID(1), defaults.password, arg1);
        
        expect(4);
    });
});
