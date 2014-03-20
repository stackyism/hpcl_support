/**
 * filename:        ClientTest.js
 * created at:      2009/06/01T12:07:00+01:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/client");
    
    //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
    test("Test _servieDiscoveryOpened when connect to right node", function() {
        var client = new jabberwerx.Client();
        client._connectParams.jid = new jabberwerx.JID("caxltestuser01@example.com");
        client._userSDInfo ={home: null, backup: null};
        client._stream._connectToNode = "testserver01";
        var serverReturnedHomeNode = "testserver01";
        var serverReturnedBackupNode = "testserver02";
        var feats = new jabberwerx.NodeBuilder("{http://etherx.jabber.org/streams}stream:features");
        var mechs = feats.element("{urn:ietf:params:xml:ns:xmpp-sasl}mechanisms");
        mechs.element("mechanism").text("PLAIN");
        mechs.element("mechanism").text("CISCO-VTG-TOKEN");
        mechs.element("{urn:xmpp:domain-based-name:0}hostname").text(serverReturnedHomeNode);
        mechs.element("{urn:xmpp:domain-based-name:0}hostname").text(serverReturnedBackupNode);

        client._handleAuthOpened = function(){
        	ok(true, "_hanleAuthOpened has been called.");
        };
        client._stream.close = function(){
        	ok(false, "_stream.close() shouldn't be called.");
        };
        client._serviceDiscoveryOpened(feats);
        
        //check if the user's home/backup node have been updated in the memory
        same(client._userSDInfo.home,serverReturnedHomeNode,"User's homenode should equal to "+serverReturnedHomeNode);
        same(client._userSDInfo.backup,serverReturnedBackupNode,"User's backup should equal to "+serverReturnedBackupNode);
        expect(3);
    });
    
    //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
    test("Test _servieDiscoveryOpened when connect to wrong node", function() {
        var client = new jabberwerx.Client();
        client._connectParams.jid = new jabberwerx.JID("caxltestuser01@example.com");
        client._userSDInfo ={home: null, backup: null};
        client._stream._connectToNode = "wrongserver";
        var serverReturnedHomeNode = "testserver01";
        var serverReturnedBackupNode = "testserver02";
        var feats = new jabberwerx.NodeBuilder("{http://etherx.jabber.org/streams}stream:features");
        var mechs = feats.element("{urn:ietf:params:xml:ns:xmpp-sasl}mechanisms");
        mechs.element("mechanism").text("PLAIN");
        mechs.element("mechanism").text("CISCO-VTG-TOKEN");
        mechs.element("{urn:xmpp:domain-based-name:0}hostname").text(serverReturnedHomeNode);
        mechs.element("{urn:xmpp:domain-based-name:0}hostname").text(serverReturnedBackupNode);

        client._handleAuthOpened = function(){
        	ok(false, "_hanleAuthOpened should not been called.");
        };
        
        client._stream.close = function(){
        	ok(true, "_stream.close() is called.");
        };
        
        client._openStream = function(){
            // Overridding _openStream function call for this test. Otherwise, the 
            // execuion of _openStream causes errors in the browser console  during 
            // unit-test execution
            return;
        };
        
        

        client._serviceDiscoveryOpened(feats);
        //check if the user's home/backup node have been updated in the memory
        same(client._userSDInfo.home,serverReturnedHomeNode,"User's homenode should equal to "+serverReturnedHomeNode);
        same(client._userSDInfo.backup,serverReturnedBackupNode,"User's backup should equal to "+serverReturnedBackupNode);
        //_connectToNode should be updated
        same(client._stream._connectToNode,serverReturnedHomeNode,"The _connectToNode should be updated to "+serverReturnedHomeNode);
        expect(4);
    });
      //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test _servieDiscoveryOpened when no home/backup nodes are returned", function() {
        var client = new jabberwerx.Client();
        client._connectParams.jid = new jabberwerx.JID("caxltestuser01@example.com");
        client._userSDInfo ={home: null, backup: null};
        client._stream._connectToNode = "testserver01";
        var serverReturnedHomeNode = null;
        var serverReturnedBackupNode = null;
        var feats = {};
        var x = jabberwerx.$('<stream:features/>');
        var y =jabberwerx.$("<mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'></mechanisms>");
        y.append("<mechanism>PLAIN</mechanism>");
        y.append("<mechanism>CISCO-VTG-TOKEN</mechanism>");
        feats.data = x.append(y);

        client._handleAuthOpened = function(){
        	ok(true, "_hanleAuthOpened has been called.");
        };
        client._stream.close = function(){
        	ok(false, "_stream.close() shouldn't be called.");
        };
        client._serviceDiscoveryOpened(feats);
        //check if the user's home/backup node have been updated in the memory
        same(client._userSDInfo.home,null,"User's homenode should be null.");
        same(client._userSDInfo.backup,null,"User's backup should be null.");
        expect(3);
     });
});
