/**
 * filename:        SASLTest.js
 * created at:      2009/09/25T00:00:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    // Beginning of Entity Unit Tests module 
    module("jabberwerx/model/sasl/SASLMechanism");

    var SaslMockMechanism = jabberwerx.SASLMechanism.extend({
        init: function(client) {
            this._super(client);
        },
        
        evaluateStart: function() {
            return "hello";
        },
        evaluateChallenge: function(data) {
            var result = /^hello my name is (.+)/gi.exec(data);
            if (!result) {
                throw new jabberwerx.SASLMechanism.SASLAuthFailure();
            }
            
            this.complete = true;
            return "good to meet you " + result[1];
        }
    }, "SaslMockMechanism", "MOCK");
    var SaslEncodedMockMechanism = jabberwerx.SASLMechanism.extend({
        init: function(client) {
            this._super(client, true);
        },
        
        evaluateStart: function() {
            return jabberwerx.util.crypto.b64Encode("hello");
        },
        evaluateChallenge: function(data) {
            data = jabberwerx.util.crypto.b64Decode(data);
            var result = /^hello my name is (.+)/gi.exec(data);
            if (!result) {
                throw new jabberwerx.SASLMechanism.SASLAuthFailure();
            }
            
            this.complete = true;
            return jabberwerx.util.crypto.b64Encode("good to meet you " + result[1]);
        }
    }, "SaslEncodedMockMechanism", "MOCK-ENCODED");
    
    test("Test Create", function() {
        var client = new jabberwerx.Client();
        var sasl = new SaslMockMechanism(client);
        
        ok(sasl instanceof jabberwerx.SASLMechanism, "instanceof SASLMechanism");
        ok(sasl instanceof SaslMockMechanism, "instanceof SaslMockMechanism");
        equals(sasl.mechanismName, "MOCK");
        ok(sasl.complete == false, "complete flag is FALSE");
        equals(sasl._encoded, false, "mechanism is NOT pre-encoded");
    });
    test("Test Evaluate (success)", function() {
        var client = new jabberwerx.Client();
        var sasl = new SaslMockMechanism(client);
        
        ok(!sasl.started, "started flag is FALSE");
        ok(!sasl.complete, "complete flag is FALSE");
        
        var data;
        data = sasl.evaluate();
        ok(sasl.started, "started flag is TRUE");
        ok(!sasl.complete, "complete flag is FALSE");
        equals(data.nodeName, "auth", "node name is 'auth'");
        equals(data.getAttribute("xmlns"), "urn:ietf:params:xml:ns:xmpp-sasl", "namespace is SASL");
        equals(data.getAttribute("mechanism"), "MOCK", "mechanism name is MOCK");
        equals(jabberwerx.util.crypto.b64Encode("hello"), jabberwerx.$(data).text(), "data text is base64('hello')");
        
        data = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}challenge").
                text(jabberwerx.util.crypto.b64Encode("hello my name is bert")).
                data;
        data = sasl.evaluate(data);
        ok(sasl.started, "started flag is TRUE");
        ok(sasl.complete, "complete flag is TRUE");
        equals(data.nodeName, "response", "node name is 'response'");
        equals(data.getAttribute("xmlns"), "urn:ietf:params:xml:ns:xmpp-sasl", "namespace is SASL");
        equals(jabberwerx.util.crypto.b64Encode("good to meet you bert"), jabberwerx.$(data).text(), "data text is base64('good to meet you bert')");
        
        data = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}success").
                data;
        data = sasl.evaluate(data);
        ok(sasl.started, "started flag is TRUE");
        ok(sasl.complete, "complete flag is TRUE");
        ok(!data, "no data returned");
    });

    test("Test Create (encoded)", function() {
        var client = new jabberwerx.Client();
        var sasl = new SaslEncodedMockMechanism(client);
        
        ok(sasl instanceof jabberwerx.SASLMechanism, "instanceof SASLMechanism");
        ok(sasl instanceof SaslEncodedMockMechanism, "instanceof SaslEncodedMockMechanism");
        equals(sasl.mechanismName, "MOCK-ENCODED");
        ok(sasl.complete == false, "complete flag is FALSE");
        equals(sasl._encoded, true, "mechanism IS pre-encoded");
    });
    test("Test Evaluate (encoded success)", function() {
        var client = new jabberwerx.Client();
        var sasl = new SaslEncodedMockMechanism(client);
        
        ok(!sasl.started, "started flag is FALSE");
        ok(!sasl.complete, "complete flag is FALSE");
        
        var data;
        data = sasl.evaluate();
        ok(sasl.started, "started flag is TRUE");
        ok(!sasl.complete, "complete flag is FALSE");
        equals(data.nodeName, "auth", "node name is 'auth'");
        equals(data.getAttribute("xmlns"), "urn:ietf:params:xml:ns:xmpp-sasl", "namespace is SASL");
        equals(data.getAttribute("mechanism"), "MOCK-ENCODED", "mechanism name is MOCK");
        equals(jabberwerx.util.crypto.b64Encode("hello"), jabberwerx.$(data).text(), "data text is base64('hello')");
        
        data = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}challenge").
                text(jabberwerx.util.crypto.b64Encode("hello my name is bert")).
                data;
        data = sasl.evaluate(data);
        ok(sasl.started, "started flag is TRUE");
        ok(sasl.complete, "complete flag is TRUE");
        equals(data.nodeName, "response", "node name is 'response'");
        equals(data.getAttribute("xmlns"), "urn:ietf:params:xml:ns:xmpp-sasl", "namespace is SASL");
        equals(jabberwerx.util.crypto.b64Encode("good to meet you bert"), jabberwerx.$(data).text(), "data text is base64('good to meet you bert')");
        
        data = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}success").
                data;
        data = sasl.evaluate(data);
        ok(sasl.started, "started flag is TRUE");
        ok(sasl.complete, "complete flag is TRUE");
        ok(!data, "no data returned");
    });
    
    module("jabberwerx/model/sasl/SASLMechanismFactory");
    test("Test createMechanismFor", function() {
        var saslFactory = new jabberwerx.SASLMechanismFactory();
        saslFactory.addMechanism(SaslMockMechanism);
        saslFactory.mechanisms = ["MOCK"];
        
        var client = new jabberwerx.Client();
        var sasl;
        
        sasl = saslFactory.createMechanismFor(client, ["MOCK"]);
        ok(sasl instanceof SaslMockMechanism, "sasl client is MOCK");
        ok(sasl.client === client, "sasl client has jabberwerx.Client");
        
        sasl = saslFactory.createMechanismFor(client, ["PLAIN"]);
        ok(sasl === null, "sasl client not found");
    });
    
    module("jabberwerx/model/sasl[core]");
    test("Test jabberwerx.sasl", function() {
        ok(jabberwerx.sasl instanceof jabberwerx.SASLMechanismFactory, "sasl singleton exists");
    });
    
    module("jabberwerx/model/sasl/SASL:PLAIN");
    test("Test registered", function() {
        ok( jabberwerx.sasl._mechsAvail["PLAIN"] === jabberwerx.SASLPlainMechanism,
            "PLAIN mechanism registered");
    });
    test("Test evaluate for SUCCESS!", function() {
        var client = new jabberwerx.Client();
        client.isSecure = function () { 
            return true;
        }
        client._connectParams = {
            jid: new jabberwerx.JID("jwtest0@example.com"),
            password: "test\u00A3"
        };
        
        var factory = new jabberwerx.SASLMechanismFactory(["PLAIN"]);
        factory.addMechanism(jabberwerx.SASLPlainMechanism);
        
        var sasl = factory.createMechanismFor(client, ["PLAIN"]);
        ok(sasl instanceof jabberwerx.SASLPlainMechanism, "PLAIN mechanism selected");
        
        var elem = sasl.evaluate();
        ok(sasl.started, "SASL mech started!");
        ok(elem.nodeName == "auth", "element is 'auth'");
        ok(elem.getAttribute("mechanism") == "PLAIN", "mechanism is PLAIN");
        equals(jabberwerx.$(elem).text(), "AGp3dGVzdDAAdGVzdMKj", "data is base64(username/password)");
        
        elem = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}success").data;
        elem = sasl.evaluate(elem);
        ok(sasl.started, "SASL mech started!");
        ok(sasl.complete, "SASL mech completed!");
    });
    test("Test evaluate (unsecure)", function() {
        var client = new jabberwerx.Client();
        client._connectParams = {
            jid: new jabberwerx.JID("jwtest0@example.com"),
            password: "test"
        };
        client.isSecure = function () { 
            return false;
        }        
        var factory = new jabberwerx.SASLMechanismFactory(["PLAIN"]);
        factory.addMechanism(jabberwerx.SASLPlainMechanism);
        
        var sasl = factory.createMechanismFor(client, ["PLAIN"]);
        ok(sasl instanceof jabberwerx.SASLPlainMechanism, "PLAIN mechanism selected");

        try {
            var elem = sasl.evaluate();
            ok(false, "Should not have succeeded");
        } catch (ex) {
            ok(ex instanceof jabberwerx.SASLMechanism.SASLAuthFailure, "error is SASLAuthFailure");
            ok(ex.message == "{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak", "mechanism-too-weak reason");
        }
    });
    
    module("jabberwerx/model/sasl/SASL:DIGEST-MD5");
    test("Test registered", function() {
        ok( jabberwerx.sasl._mechsAvail["DIGEST-MD5"] === jabberwerx.SASLDigestMd5Mechanism,
            "DIGEST-MD5 mechanism registered");
    });
    test("Test evaluate for SUCCESS!", function() {
        var client = new jabberwerx.Client();
        client._connectParams = {
            jid: new jabberwerx.JID("jwtest0@example.com"),
            password: "test"
        };
        
        var factory = new jabberwerx.SASLMechanismFactory(["DIGEST-MD5"]);
        factory.addMechanism(jabberwerx.SASLDigestMd5Mechanism);
        
        var sasl = factory.createMechanismFor(client, ["DIGEST-MD5"]);
        ok(sasl instanceof jabberwerx.SASLDigestMd5Mechanism, "DIGEST-MD5 mechanism selected");
        
        var elem;
        elem = sasl.evaluate();
        ok(sasl.started, "SASL mech started!");
        ok(elem.nodeName == "auth", "element is 'auth'");
        ok(elem.getAttribute("mechanism") == "DIGEST-MD5", "mechanism is DIGEST-MD5");
        equals(jabberwerx.$(elem).text(), "");
        
        elem = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}challenge").
                text(jabberwerx.util.crypto.b64Encode('realm="example.com",nonce="OA6MG9tEQGm2hh",qop="auth",algorithm=md5-sess,charset=utf-8')).
                data;
        elem = sasl.evaluate(elem);
        ok(!sasl.complete, "SASL mech not complete");
        ok(elem.nodeName == "response", "element is 'response'");
        
        var props = jabberwerx.$(elem).text();
        ok(props != "", "response has data");
        
        // calculate client response
        props = sasl._decodeProperties(jabberwerx.util.crypto.b64Decode(props));
        var A1, A2, rsp;
        A1 = jabberwerx.util.crypto.rstr_md5(jabberwerx.util.crypto.utf8Encode("jwtest0:example.com:test"));
        A1 = A1 + jabberwerx.util.crypto.utf8Encode(":OA6MG9tEQGm2hh:" + props.cnonce);
        
        A2 = jabberwerx.util.crypto.utf8Encode("AUTHENTICATE:xmpp/example.com");
        
        rsp = [
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A1)),
            "OA6MG9tEQGm2hh",
            "00000001",
            props.cnonce,
            "auth",
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A2))].join(":");
        rsp = jabberwerx.util.crypto.hex_md5(rsp);
        
        equals(rsp, props.response, "response are equal");
        
        // calculate rspauth
        A1 = jabberwerx.util.crypto.rstr_md5(jabberwerx.util.crypto.utf8Encode("jwtest0:example.com:test"));
        A1 = A1 + jabberwerx.util.crypto.utf8Encode(":OA6MG9tEQGm2hh:" + props.cnonce);
        
        A2 = jabberwerx.util.crypto.utf8Encode(":xmpp/example.com");
        
        rsp = [
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A1)),
            "OA6MG9tEQGm2hh",
            "00000001",
            props.cnonce,
            "auth",
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A2))].join(":");
        rsp = jabberwerx.util.crypto.hex_md5(rsp);
        
        elem = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}challenge").
                text(jabberwerx.util.crypto.b64Encode('rspauth=' + rsp)).
                data;
        elem = sasl.evaluate(elem);
        ok(sasl.complete, "SASL mech is complete!");
        ok(elem.nodeName == "response", "element is 'response'");
        ok(jabberwerx.$(elem).text() == "", "response is empty");
        
        elem = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}success").
                data;
        elem = sasl.evaluate(elem);
        ok(sasl.complete, "SASL mech is complete!");
        ok(!elem, "element is null/undefined");
    });
    test("Test evaluate for (loaded) SUCCESS!", function() {
        var client = new jabberwerx.Client();
        client._connectParams = {
            jid: new jabberwerx.JID("jwtest0@example.com"),
            password: "test"
        };
        
        var factory = new jabberwerx.SASLMechanismFactory(["DIGEST-MD5"]);
        factory.addMechanism(jabberwerx.SASLDigestMd5Mechanism);
        
        var sasl = factory.createMechanismFor(client, ["DIGEST-MD5"]);
        ok(sasl instanceof jabberwerx.SASLDigestMd5Mechanism, "DIGEST-MD5 mechanism selected");
        
        var elem;
        elem = sasl.evaluate();
        ok(sasl.started, "SASL mech started!");
        ok(elem.nodeName == "auth", "element is 'auth'");
        ok(elem.getAttribute("mechanism") == "DIGEST-MD5", "mechanism is DIGEST-MD5");
        equals(jabberwerx.$(elem).text(), "");
        
        elem = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}challenge").
                text(jabberwerx.util.crypto.b64Encode('realm="example.com",nonce="OA6MG9tEQGm2hh",qop="auth",algorithm=md5-sess,charset=utf-8')).
                data;
        elem = sasl.evaluate(elem);
        ok(!sasl.complete, "SASL mech not complete");
        ok(elem.nodeName == "response", "element is 'response'");
        
        var props = jabberwerx.$(elem).text();
        ok(props != "", "response has data");
        
        // calculate client response
        props = sasl._decodeProperties(jabberwerx.util.crypto.b64Decode(props));
        var A1, A2, rsp;
        A1 = jabberwerx.util.crypto.rstr_md5(jabberwerx.util.crypto.utf8Encode("jwtest0:example.com:test"));
        A1 = A1 + jabberwerx.util.crypto.utf8Encode(":OA6MG9tEQGm2hh:" + props.cnonce);
        
        A2 = jabberwerx.util.crypto.utf8Encode("AUTHENTICATE:xmpp/example.com");
        
        rsp = [
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A1)),
            "OA6MG9tEQGm2hh",
            "00000001",
            props.cnonce,
            "auth",
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A2))].join(":");
        rsp = jabberwerx.util.crypto.hex_md5(rsp);
        
        equals(rsp, props.response, "response are equal");
        
        // calculate rspauth
        A1 = jabberwerx.util.crypto.rstr_md5(jabberwerx.util.crypto.utf8Encode("jwtest0:example.com:test"));
        A1 = A1 + jabberwerx.util.crypto.utf8Encode(":OA6MG9tEQGm2hh:" + props.cnonce);
        
        A2 = jabberwerx.util.crypto.utf8Encode(":xmpp/example.com");
        
        rsp = [
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A1)),
            "OA6MG9tEQGm2hh",
            "00000001",
            props.cnonce,
            "auth",
            jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A2))].join(":");
        rsp = jabberwerx.util.crypto.hex_md5(rsp);
        
        elem = new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}success").
                text(jabberwerx.util.crypto.b64Encode('rspauth=' + rsp)).
                data;
        elem = sasl.evaluate(elem);
        ok(sasl.complete, "SASL mech is complete!");
        ok(!elem, "element is null/undefined");
    });
    
    module("jabberwerx/model/sasl/SASL:all");
    test("Test Mechanism Selection", function() {
        var factory = new jabberwerx.SASLMechanismFactory(["DIGEST-MD5", "PLAIN"]);
        factory.addMechanism(jabberwerx.SASLDigestMd5Mechanism);
        factory.addMechanism(jabberwerx.SASLPlainMechanism);
        
        var client = new jabberwerx.Client();
        client._connectParams = {
            jid: new jabberwerx.JID("jwtest0@example.com"),
            password: "test"
        };

        var sasl;
        sasl = factory.createMechanismFor(client, ["DIGEST-MD5", "PLAIN"]);
        ok(sasl instanceof jabberwerx.SASLDigestMd5Mechanism, "DIGEST-MD5 mechanism selected");
        
        sasl = factory.createMechanismFor(client, ["PLAIN", "CISGO-VTG-TOKEN"]);
        ok(sasl instanceof jabberwerx.SASLPlainMechanism, "PLAIN mechanism selected");
    });
});
