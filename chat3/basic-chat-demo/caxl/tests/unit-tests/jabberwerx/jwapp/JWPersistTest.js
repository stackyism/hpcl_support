/**
 * filename:        JWPersistTest.js
 * created at:      2010/04/10
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
 
jabberwerx.$(document).ready(function() {
    module("jwapp/JWPersist");
	
	var saveTimestamp;

    test("Test Persistence get/setMaxGraphAge", function() {
        equals(jabberwerx.util.getMaxGraphAge(), jabberwerx.util.config.maxGraphAge, "Should be: " + jabberwerx.util.config.maxGraphAge);
        jabberwerx.util.setMaxGraphAge(1);
        equals(jabberwerx.util.getMaxGraphAge(), 1, "setMaxGraphAge(1) Should be 1");
        jabberwerx.util.setMaxGraphAge(-1);
        equals(jabberwerx.util.getMaxGraphAge(), 1, "setMaxGraphAge(-1) Should be 1");
		
        // Stop test execution until the jStore engine is ready
        stop();
        jabberwerx.$.jStore.ready(function(engine){
            engine.ready(function(){
                start();
            });
		});
		
    });

    //global type def
    jabberwerx.MockApp = jabberwerx.JWModel.extend({
        init: function() {
            this._super();
            this.pdata1 = "foo";
            ok(true, 'created MockApp'); //just a comment, should only see this once per test
        }
    }, "jabberwerx.MockApp");
    
    test("Test persisted trivial application ", function() {
    
        var inst = new jabberwerx.MockApp();
        equals(inst.pdata1, "foo", "should be foo");
        inst.pdata1 = "bar";
        try {
           jabberwerx.util.saveGraph(inst, "mock-app-data");
           ok(true, "graph saved successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to save graph: " + ex);
        }
      
        try {
            inst = jabberwerx.util.loadGraph("mock-app-data");
            ok(true, "graph loaded successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to load graph: " + ex);
        }
        ok(inst, "Expected non null instance after load");
        equals(inst.pdata1, "bar", "should be bar");
    });
    
    test("Test persisted max storage limit", function() {
        stop();
        
        // The nature of the test is to store a number of fixed objects in an attempt to reach 
        // the 64KB limit imposed by IE 7 User Data persistance methodology.
        // Observations made indicate that IE 7 running on winodws XP using User Data storage has the following characteristics:
        //      1) storing 70 fixed objects ~= 64 KB User Data filesize
        //      2) storing 530 fixed objects ~= 512 KB User Data filesize
        
        // Standard size object used to perform storage capacity test.
        jabberwerx.StndApp = jabberwerx.JWModel.extend({
            init: function() {
                this._super();
                this.pdata1 = "";
            }
        }, "jabberwerx.StndApp");

        var key = 0;
        
        var createObj = function(){
            var inst = new jabberwerx.StndApp();
            
            try{
                // Note: Each call to saveGraph results in three objects being stored:
                //          1) Reference object - object containing two properties: actual object guid reference and a timestamp
                //          2) Timestamp object - '_jw_store_timestamp_.' + <some key>
                //          3) Actual object    - '_jw_store_.' + <some key>
                jabberwerx.util.saveGraph(inst,"stand-app-data-" + key);
                
                // Check if the fixed size object limit has been reached
                if ( key < 70 ) {
                    setTimeout(createObj,1);
                } else {
                    ok(true, "Storage capacity exceeds 64KB");
                    start();
                }
            } catch(e){
                ok(false, "Storage capacity does not exceed 64KB");
                start();
            }
            
            key++;    
        }
        
        createObj();
        
    });
    
    continuedTest1 = function() {
        try {
            var loadTimestamp = new Date().getTime();
            ok(true, "loading object @ " +  loadTimestamp);
            ok( (loadTimestamp - saveTimestamp) < 2000 , "Stored object is not stale");
            inst = jabberwerx.util.loadGraph("mock-app-data");
            ok(inst, "expected instance to be non null after 500ms timeout load");
        } catch (ex) {
            ok(false, "Exception thrown trying to load graph: " + ex);
        }            
        start();
    };
    
    test("Test 500ms timeout persisted application ", function() {    
        var inst = new jabberwerx.MockApp();
        jabberwerx.util.setMaxGraphAge(2);
        try {
            var serialisation = jabberwerx.util.saveGraph(inst, "mock-app-data");
            saveTimestamp = /^(.*timestamp":)(\d*)(.*)$/.exec(serialisation["mock-app-data"] || "");
            saveTimestamp = saveTimestamp[2];
            ok(true, "graph saved successfully @ " + saveTimestamp);
        } catch (ex) {
            ok(false, "Exception thrown trying to save graph: " + ex);
        }
        stop();
        setTimeout("continuedTest1();", 500);
    });

    continuedTest2 = function() {
        start();
        try {
            inst = jabberwerx.util.loadGraph("mock-app-data");
            ok(inst === null, "expected instance to be null after timed-out load");
        } catch (ex) {
            ok(false, "Exception thrown trying to load graph: " + ex);
        }            
    };
    
    test("Test timed-out persisted application ", function() {    
        var inst = new jabberwerx.MockApp();
        jabberwerx.util.setMaxGraphAge(1);
        try {
           jabberwerx.util.saveGraph(inst, "mock-app-data");
           ok(true, "graph saved successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to save graph: " + ex);
        }
        stop();
        setTimeout("continuedTest2();", 1500);
    });
 
    jabberwerx.MockJWApp = jabberwerx.JWModel.extend({
        init: function() {
            this._super();
           ok(true, 'created MockJWApp');
            
        }
    }, "jabberwerx.MockJWApp");
 
    test("Test JWA application persistence", function() {    
        
        jabberwerx.util.setMaxGraphAge(30);
        
        var inst = new jabberwerx.MockJWApp();
        inst.client = new jabberwerx.Client("test persistence");                     
        inst.client.connectedUser = inst.client.entitySet.localUser("foo@bar");
        inst.client.connectedServer = inst.client.entitySet.server("bar");
        inst.client._connectParams = {}; //throws an exception i
        ok(inst.client !== undefined, "Application Client present");        
        equals(inst.client.connectedUser.jid.getBareJIDString(), "foo@bar", "Connected User JID ");
        equals(inst.client.resourceName, "test persistence", "Resource ");
        equals(inst.client.connectedServer.jid.toString(), "bar", "Server ");
        equals(inst.client.clientStatus, jabberwerx.Client.status_disconnected, "Client state ");
        
        try {
           jabberwerx.util.saveGraph(inst, "mock-app-data");
           ok(true, "graph saved successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to save graph: " + ex);
        }
 
        try {
            inst = jabberwerx.util.loadGraph("mock-app-data");
            ok(true, "graph loaded successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to load graph: " + ex.message);
        }
        ok(inst, "Expected non null instance after load");

        equals(inst.client.connectedUser.jid.getBareJIDString(), "foo@bar", "Connected User ");
        equals(inst.client.resourceName, "test persistence", "Resource ");
        equals(inst.client.connectedServer.jid.toString(), "bar", "Server ");
        equals(inst.client.clientStatus, jabberwerx.Client.status_disconnected, "Client state ");
        
    });
    
    test("Test password cleared from memory after persistence, varying base period", function() {
        var inst = new jabberwerx.MockJWApp();
        inst.client = new jabberwerx.Client("test persistence");
        inst.client._connectParams = {password: "test"};
        var bDefault = jabberwerx._config.baseReconnectCountdown;
        jabberwerx._config.baseReconnectCountdown = 30;        
        try {
           jabberwerx.util.saveGraph(inst, "mock-app-data");
           ok(true, "app saved successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to save app: " + ex);
        }
 
        try {
            inst = jabberwerx.util.loadGraph("mock-app-data");
            ok(true, "app loaded successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to load app: " + ex);
        }
        ok(inst, "Expected non null instance after load");
        ok(inst.client._connectParams.password == "test", "Password remians in memory");
        
        jabberwerx._config.baseReconnectCountdown = 0;        
        try {
           jabberwerx.util.saveGraph(inst, "mock-app-data");
           ok(true, "app saved successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to save app: " + ex);
        }
 
        try {
            inst = jabberwerx.util.loadGraph("mock-app-data");
            ok(true, "app loaded successfully");
        } catch (ex) {
            ok(false, "Exception thrown trying to load app: " + ex);
        }
        ok(inst, "Expected non null instance after load");
        ok(inst.client._connectParams.password == "", "Password removed from memory");
        //set back to default for other unit tests, jabberwerx.js loaded once for all tests
        jabberwerx._config.baseReconnectCountdown = bDefault;      
    });

});

