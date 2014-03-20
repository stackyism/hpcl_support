jabberwerx.$(document).ready( function() {
    var capController;

    module("jabberwerx/controller/capabilitiescontroller", {
        setup: function() {
            capController = new jabberwerx.CapabilitiesController(new jabberwerx.Client());
        },

        teardown: function() {
            capController.destroy();
            delete capController;
        }
    });

    test("Test Add Feature To Jid / Contains Feature For Jid", function() {
        var jid = "jwtest3@example.com";
        ok(capController.addFeatureToJid(jid,'http://webex.com/connect/temp-presence+notify'));
        // Try to add same feature again
        ok(!capController.addFeatureToJid(jid,'http://webex.com/connect/temp-presence+notify'));
        // Make sure feature is in the list
        ok(capController.containsFeatureForJid(jid, 'http://webex.com/connect/temp-presence+notify'));
        // Try to add non jids
        try {
            capController.addFeatureToJid({x:1, y:2});
        } catch (ex) {
            ok(ex instanceof TypeError);
        }
        try {
            capController.addFeatureToJid("jwtest3@example.com", "");
        } catch (ex) {
            ok(ex instanceof TypeError);
        }
        try {
            capController.containsFeatureForJid("jwtest3@example.com", "");
        } catch (ex) {
            ok(ex instanceof TypeError);
        }
    });

    test("Test Remove Feature From Jid", function() {
        var jid = "jwtest3@example.com";
        capController.addFeatureToJid(jid, 'http://jabber.org/protocol/disco#info');
        // Correctly remove feature
        ok(capController.removeFeatureFromJid(jid,'http://jabber.org/protocol/disco#info'));
        // Make sure feature is not in the list
        ok(!capController.containsFeatureForJid(jid, 'http://webex.com/connect/temp-presence+notify'));
        // Try to remove feature again
        ok(!capController.removeFeatureFromJid(jid, 'http://jabber.org/protocol/disco#info'));
        // Try to remove a feature by using non jids params or non strings
        try {
            capController.removeFeatureFromJid({x:1, y:2});
        } catch (ex) {
            ok(ex instanceof TypeError);
        }

        try {
            capController.removeFeatureFromJid("jwtest3@example.com", "");
        } catch (ex) {
            ok(ex instanceof TypeError);
        }
    });




    test("attachCapabilitiesToDirectPresence", function() {
       var jid = new jabberwerx.JID("jwtest3@example.com");
       //Define expected results
       var expectedPresence =  "<presence xmlns='jabber:client' to='jwtest3@example.com'><c xmlns='http://jabber.org/protocol/caps' hash='sha-1' node='http://jabber.cisco.com/jabberwerx' ver='aS8wscaU5a68YG885dSLkL72F0k='/></presence>";
       capController.addFeatureToJid(jid, 'http://webex.com/connect/temp-presence+notify');
       var expectedNode = _convertStringToNode(expectedPresence);
       var p = new jabberwerx.Presence();
       p.setTo(jid);
       capController.attachCapabilitiesToPresence(p);
       // Build node from string to work around no active document problem.
       var presenceNode = _convertStringToNode(p.getNode().xml);
       ok(_compareNodes(presenceNode, expectedNode),
                        'Actual: ' + presenceNode.xml + " Expected: " + expectedNode.xml);
    });


    test("Test Create Disco Info Result Response By Ver string", function() {
        var jid = new jabberwerx.JID("jwtest3@example.com");
        capController.addFeatureToJid(jid,"http://webex.com/connect/temp-presence+notify");
        var ver = capController.getVerificationStringForJid(jid);
        var request =   "<iq xmlns='jabber:client' type='get' from='jwtest3@example.com/jabberwerx' to='jwtest1@example.com' id='info1'>" +
                            "<query xmlns='http://jabber.org/protocol/disco#info' node='"
                                + capController.node + "#"
                                + ver + "'/>" +
                        "</iq>";
        var expected_ver = "OrxuPxUEeAQeEDA/YBgkBmHgQRY=";
        var featuresXML = '';
        jabberwerx.$.each(capController.getFeaturesForVerificationString(ver), function() {
            featuresXML += "<feature var='" + this + "'/>";
        });
        var response =  "<iq xmlns='jabber:client' type='result' to='jwtest3@example.com/jabberwerx' id='info1'>" +
                            "<query xmlns='http://jabber.org/protocol/disco#info' node='"
                                + capController.node + "#" + expected_ver + "'>" +
                                "<identity category='" + capController.identity.category +
                                    "' type='" + capController.identity.type +
                                    "' name='" + capController.identity.name + "'/>" +
                                featuresXML +
                            "</query>" +
                        "</iq>";

        resultIQ = capController._createDiscoInfoResponse(_convertStringToIQ(request));

        ok(_compareNodes(resultIQ.getNode(), _convertStringToNode(response)),
                        'Actual: ' + resultIQ.getNode().xml + " Expected: " + response);
    });


    test("Test Add / Contains Feature", function() {
        ok(capController.addFeature('http://jabber.org/protocol/disco#items'));
        // Try to add same feature again
        ok(!capController.addFeature('http://jabber.org/protocol/disco#items'));
        // Try to add simple object (not string)
        ok(!capController.addFeature({x:1, y:2}));
        ok(capController.containsFeature('http://jabber.org/protocol/disco#info'));
        ok(!capController.containsFeature({x:1, y:2}));
    });

    test("Test Remove Feature", function() {
        capController.addFeature('http://jabber.org/protocol/disco#info');
        // Try to remove a feature by index (or any non-string param)
        ok(!capController.removeFeature(0));
        same(capController.getFeatureSet().length, 2);
        // Correctly remove feature
        ok(capController.removeFeature('http://jabber.org/protocol/disco#info'));
        same(capController.getFeatureSet().length, 1);
        // Try to remove feature from empty feature list
        ok(!capController.removeFeature('http://jabber.org/protocol/disco#info'));
    });

    test("Test Get Feature List", function() {
        capController.addFeature('http://jabber.org/protocol/disco#items');
        capController.addFeature('http://jabber.org/protocol/disco#info');
        var arr = capController.getFeatureSet();
        same(arr.length, 3);
        equals(arr[0], 'http://jabber.org/protocol/caps');
        equals(arr[1], 'http://jabber.org/protocol/disco#info');
        equals(arr[2], 'http://jabber.org/protocol/disco#items');
    });

    test("Test Default Identity", function() {
        equals(capController.identity.category, 'client');
        equals(capController.identity.name, 'Cisco AJAX XMPP Library');
        equals(capController.identity.type, 'pc');
    });

    test("Test Get Verification String 1", function() {
        capController.identity.category = 'client'
        capController.identity.type = 'pc'
        capController.identity.name = 'Exodus 0.9.1';
        capController.addFeature('http://jabber.org/protocol/disco#items');
        capController.addFeature('http://jabber.org/protocol/muc');
        capController.addFeature('http://jabber.org/protocol/caps');
        capController.addFeature('http://jabber.org/protocol/disco#info');
        same(capController.generateVerificationString(), 'QgayPKawpkPSDYmwT/WM94uAlu0=');
    });

    test("Test Get Verification String 2", function() {
        capController.identity.category = 'client'
        capController.identity.type = 'pc'
        capController.identity.name = 'Gabber';
        capController.addFeature('http://jabber.org/protocol/disco#items');
        capController.addFeature('jabber:iq:version');
        capController.addFeature('jabber:iq:time');
        capController.addFeature('http://jabber.org/protocol/caps');
        capController.addFeature('http://jabber.org/protocol/disco#info');
        same(capController.generateVerificationString(), 'rZzk92P7cEkYbNuPP6PMRPiGFAk=');
    });

    test("Test Attach Capabilities to Presence", function() {
        var presence = new jabberwerx.Presence();
        var eventObj = {data: presence};
        ok(!capController._beforePresenceHandler(eventObj), '_beforePresenceHandler should return false');
        var c = jabberwerx.$("[hash='sha-1'][node='http://jabber.cisco.com/caxl'][ver='"
            + capController.generateVerificationString() + "']", presence.getDoc());
        equals(c.length, 1);
        equals(c[0].getAttribute("xmlns"), 'http://jabber.org/protocol/caps');
        // Test with type 'unavailable
        presence = new jabberwerx.Presence();
        presence.setType('unavailable');
        eventObj = {data: presence};
        ok(!capController._beforePresenceHandler(eventObj), '_beforePresenceHandler should return false');
        c = jabberwerx.$("[hash='sha-1'][node='http://jabber.cisco.com/jabberwerx'][ver='"
            + capController.generateVerificationString() + "']", presence.getDoc());
        equals(c.length, 0);
    });

    test("Test Create Disco Info Result Response", function() {
        var request =   "<iq xmlns='jabber:client' type='get' from='romeo@montague.net/orchard' to='plays.shakespeare.lit' id='info1'>" +
                            "<query xmlns='http://jabber.org/protocol/disco#info'/>" +
                        "</iq>";
        var request2 =   "<iq xmlns='jabber:client' type='get' from='romeo@montague.net/orchard' to='plays.shakespeare.lit' id='info1'>" +
                            "<query xmlns='http://jabber.org/protocol/disco#info' node='"
                                + capController.node + "#" + capController.generateVerificationString() + "'/>" +
                        "</iq>";
        var featuresXML = '';
        jabberwerx.$.each(capController.getFeatureSet(), function() {
            featuresXML += "<feature var='" + this + "'/>";
        });
        var response =  "<iq xmlns='jabber:client' type='result' to='romeo@montague.net/orchard' id='info1'>" +
                            "<query xmlns='http://jabber.org/protocol/disco#info' node='"
                                + capController.node + "#" + capController.generateVerificationString() + "'>" +
                                "<identity category='" + capController.identity.category +
                                    "' type='" + capController.identity.type +
                                    "' name='" + capController.identity.name + "'/>" +
                                featuresXML +
                            "</query>" +
                        "</iq>";
        var resultIQ = capController._createDiscoInfoResponse(_convertStringToIQ(request));
        ok(_compareNodes(resultIQ.getNode(), _convertStringToNode(response)),
                        'Actual: ' + resultIQ.getNode().xml + " Expected: " + response);
        resultIQ = capController._createDiscoInfoResponse(_convertStringToIQ(request2));
        ok(_compareNodes(resultIQ.getNode(), _convertStringToNode(response)),
                        'Actual: ' + resultIQ.getNode().xml + " Expected: " + response);
    });

    test("Test Create Disco Info Error Response", function() {
        var request =   "<iq xmlns='jabber:client' type='get' from='romeo@montague.net/orchard' to='plays.shakespeare.lit' id='info1'>" +
                            "<query xmlns='http://jabber.org/protocol/disco#info' node='incorrect_node_attribute_value'/>" +
                        "</iq>";

        var response =  "<iq xmlns='jabber:client' type='error' to='romeo@montague.net/orchard' id='info1'>" +
                            "<query xmlns='http://jabber.org/protocol/disco#info' node='incorrect_node_attribute_value'/>" +
                            "<error type='cancel'>" +
                                "<item-not-found xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>" +
                            "</error>"+
                        "</iq>";
        var resultIQ = capController._createDiscoInfoResponse(_convertStringToIQ(request));
        ok(_compareNodes(resultIQ.getNode(), _convertStringToNode(response)),
                        'Actual: ' + resultIQ.getNode().xml + " Expected: " + response);
    });

    function _convertStringToIQ(str) {
        return jabberwerx.Stanza.createWithNode(_convertStringToNode(str));
    }

    function _convertStringToNode(str) {
        return jabberwerx.util.unserializeXML(str);
    }

    function _compareNodes(n1, n2) {
        if (n1.nodeType != n2.nodeType) { return false; }
        if (n1.nodeName != n2.nodeName) { return false; }
        if (n1.nodeValue != n2.nodeValue) { return false; }
        if(!_compareNodeLists(n1.attributes, n2.attributes)) { return false; }
        if(!_compareNodeLists(n1.childNodes, n2.childNodes)) { return false; }
        return true;
    }

    function _compareNodeLists(l1, l2) {
        if (l1 || l2) {
            if (l1.length != l2.length) { return false; }
            var nodes1 = _nodesToSortedArray(l1);
            var nodes2 = _nodesToSortedArray(l2);
            for (var i=0; i<nodes1.length; i++) {
                if(!_compareNodeLists(nodes1.childNodes, nodes2.childNodes)) { return false; }
            }
        }
        return true;
    }

    function _nodesToSortedArray(nodes) {
        var arr = [];
        jabberwerx.$.each(nodes, function() {
            arr.push(this);
        });
        arr.sort(function(a,b) {
            if (a.nodeType > b.nodeType) {
                return 1;
            } else if (a.nodeType < b.nodeType) {
                return -1;
            }

            if (a.nodeName > b.nodeName) {
                return 1;
            } else if (a.nodeName < b.nodeName) {
                return -1;
            }

            return 0;
        });
        return arr;
    }

    var capCon;
    var identities,features;
    var identVer,featVer;
    var xdatafrm1;
    var xep115iq, xep115Hash;

    module("jabberwerx/controller/capabilitiescontroller.capsinfo", {
        setup: function() {        
            capCon = new jabberwerx.CapabilitiesController(new jabberwerx.Client());
            //dummy up some xdata forms and iq results
            var xdata1str =
            "<x xmlns='jabber:x:data' type='result'>" +
                "<field var='FORM_TYPE' type='hidden'><value>urn:xmpp:dataforms:softwareinfo</value></field>" +
                "<field var='ip_version'><value>ipv6</value><value>ipv4</value></field>" +
                "<field var='os_version'><value>10.5.1</value></field>" +
                "<field var='os'><value>Mac</value></field>" +
                "<field var='software_version'><value>0.11</value></field>" +
                "<field var='software'><value>Psi</value></field>" +
            "</x>";
 
            //xep115 example 5.3
            var xep115Str =
            "<iq from='benvolio@capulet.lit/230193' id='disco1' to='juliet@capulet.lit/chamber' type='result'>" +
                "<query xmlns='http://jabber.org/protocol/disco#info'>" +
                    "<identity xml:lang='en' category='client' name='Psi 0.11' type='pc'/>" +
                    "<identity xml:lang='el' category='client' name='\u03A8 0.11' type='pc'/>" +
                    "<feature var='http://jabber.org/protocol/caps'/>" +
                    "<feature var='http://jabber.org/protocol/disco#info'/>" +
                    "<feature var='http://jabber.org/protocol/disco#items'/>" +
                    "<feature var='http://jabber.org/protocol/muc'/>" +
                    xdata1str +
                "</query>" +
            "</iq>";

            xep115iq = jabberwerx.util.unserializeXML(xep115Str);
            xep115Hash = "q07IKJEyjvHSyhy//CH0CxmKi8w=";

            //identities, features and later form for preparsed populates
            identities = ["client/pc/en/Psi 0.11",
                          "client/pc/el/\u03A8 0.11"];
            identVer = "client/pc/el/\u03A8 0.11<client/pc/en/Psi 0.11<"

            features = ["http://jabber.org/protocol/disco#info",
                        "http://jabber.org/protocol/muc",
                        "http://jabber.org/protocol/caps",
                        "http://jabber.org/protocol/disco#items"];
            featVer =  "http://jabber.org/protocol/caps<http://jabber.org/protocol/disco#info<http://jabber.org/protocol/disco#items<http://jabber.org/protocol/muc<";
            
            xdatafrm1 = new jabberwerx.XDataForm(null, jabberwerx.util.unserializeXML(xdata1str));
        },

        teardown: function() {
            capCon.destroy();
            delete capCon;
        }
        
    });
    //jabberwerx.CapabilitiesController._generateVerificationString = function(identities, features, forms, noEncode)
    test("Test _generateVerificationString", function() {
        var _gvs=jabberwerx.CapabilitiesController._generateVerificationString;
        var xep115Ver = "client/pc/el/\u03A8 0.11<client/pc/en/Psi 0.11<http://jabber.org/protocol/caps<http://jabber.org/protocol/disco#info<http://jabber.org/protocol/disco#items<http://jabber.org/protocol/muc<urn:xmpp:dataforms:softwareinfo<ip_version<ipv4<ipv6<os<Mac<os_version<10.5.1<software<Psi<software_version<0.11<";
        var ret = _gvs([],[],[],true);
        equals(ret,"", "empty arguments");
        ret = _gvs(identities,[],[],true);
        equals(ret,identVer, "identities only");
        ret = _gvs([],features,[],true);
        equals(ret,featVer, "features only");
        var forms=[xdatafrm1];
        ret = _gvs([],[],forms,true);
        var xdata1Ver = "urn:xmpp:dataforms:softwareinfo<ip_version<ipv4<ipv6<os<Mac<os_version<10.5.1<software<Psi<software_version<0.11<";
        equals(ret,xdata1Ver, "one form only");
        ret = _gvs(identities,features,forms,true);
        equals(ret, xep115Ver, "115 example 5.3");
        var  badIdent = "SomeClient&lt;http://jabber.org/protocol/muc";
        ret = _gvs([badIdent],[],[],true);
        equals(ret,badIdent + '<', "bad identity (contains &lt)");
        //hashing
        ret = _gvs(identities,[],[]);
        equals(ret,"w2/nbx8akAKAbBLRbxPes1t3R1w=", "identities only hash");
        ret = _gvs([],features,[]);
        equals(ret,"8xGlqItfElgnDbDOdcJhMiM8+es=", "features only hash");
        ret = _gvs([],[],forms);
        equals(ret,"Sfd2aNHu7Df1ocDIujbH9E5TID8=", "one form only hash");
        ret = _gvs(identities,features,forms);
        equals(ret, xep115Hash, "115 example 5.3 hash");
        ret = _gvs([badIdent],[],[]);
        equals(ret,"lvFM16RuMrb/yXvNQDsBOEMNJuQ=", "bad identity (contains &lt) hash");
    });

    test("Test Create CapsInfo", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test", ciVer = "test-ver";

        try {
            ci = new jabberwerx.CapabilitiesController.CapsInfo(null, ciNode, ciVer);
            ok(false, "Did not receive expected TypeError creating with a null controller");
        } catch (ex) {
            if (!(ex instanceof TypeError)) {throw ex;}
            ok(true, "Expected TypeError creating with a null controller");
        }

        try {
            ci = new jabberwerx.CapabilitiesController.CapsInfo({}, ciNode, ciVer);
            ok(false, "Did not receive expected TypeError creating with an incorrect controller");
        } catch (ex) {
            if (!(ex instanceof TypeError)) {throw ex;}
            ok(true, "Expected TypeError creating with an incorrect controller");
        }
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode, ciVer);
        ok(ci._node == ciNode, "Node property assigned");
        ok(ci.ver == ciVer, "Initial verify str assigned");
        ok(ci.status == "invalid", "Initial status set to invalid")
        ok(ci.id ==  ciNode + '#' + ciVer, "initial ID is correct");
    });

    test("Test locked verify string with valid populate", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";

        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode, xep115Hash);
        equals(ci.ver, xep115Hash, "xep115Hash after construction, locked");
        var forms=[xdatafrm1];
        var ret = ci._populate(identities, features, forms);
        ok(ret, "valid after preparsed xep115 5.3 populate");
        equals(ci.status,"valid", "status after populate");
        equals(ci.ver,xep115Hash, "verify string remains the same");
        equals(ci.id, xep115Hash, "ID populated correctly");
        var tstr = ci.identities.join("<") + "<";
        equals(tstr, identVer, "identities populated correctly");
        tstr = ci.features.join("<") + "<";
        equals(tstr, featVer, "features populated correctly");
        ok(ci.forms["urn:xmpp:dataforms:softwareinfo"] === xdatafrm1, "reference to form populated correctly");
    });
    test("Test locked verify string with invalid populate", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";

        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode, xep115Hash);
        features.push("http://jabber.org/protocol/pubsub");
        var forms=[xdatafrm1];
        var ret = ci._populate(identities, features, forms);
        ok(!ret, "invalid after bad preparsed populate");
        equals(ci.status,"invalid", "status after populate");
        equals(ci.ver,xep115Hash, "verify string remains the same");
        equals(ci.id, ciNode+"#"+xep115Hash, "ID populated correctly");
        var tstr = ci.identities.join("<") + "<";
        equals(tstr, identVer, "identities were populated");
        tstr = ci.features.join("<") + "<";
        equals(tstr, featVer+"http://jabber.org/protocol/pubsub<", "features were populated");
        ok(ci.forms["urn:xmpp:dataforms:softwareinfo"] === xdatafrm1, "reference to form was populated");
    });
    test("Test duplicate identifier failure", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";

        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode, xep115Hash);
        identities.push("client/pc/en/Psi 0.11");
        var forms=[xdatafrm1];
        var ret = ci._populate(identities, features, forms);
        ok(!ret, "invalid after duplicate identitifier");
        equals(ci.status,"invalid", "status after duplicate identitifier");
        equals(ci.ver,xep115Hash, "verify string remains the same");
        equals(ci.id, ciNode+"#"+xep115Hash, "ID populated correctly");
        var tstr = ci.identities.join("<") + "<";
        equals(tstr, identVer+ "client/pc/en/Psi 0.11<", "duplicate identities were populated");
        tstr = ci.features.join("<") + "<";
        ok(tstr == featVer, "features were populated");
    });
    test("Test duplicate feature failure", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";

        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode, xep115Hash);
        identities.push("client/pc/en/Psi 0.11");
        var forms=[xdatafrm1];
        features.push(features[0]); //dup
        var ret = ci._populate(identities, features, forms);
        ok(!ret, "invalid after duplicate feature");
        equals(ci.status,"invalid", "status after duplicate feature");
        equals(ci.ver,xep115Hash, "verify string remains the same");
        equals(ci.id, ciNode+"#"+xep115Hash, "ID populated correctly");
    });

    test("Test duplicate FORM_TYPE forms failure", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";
        var forms=[xdatafrm1, xdatafrm1];
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode, xep115Hash);
        var ret = ci._populate(identities, features, forms);
        ok(!ret, "invalid after duplicate form");
        equals(ci.status,"invalid", "status after duplicate form");
        equals(ci.ver,xep115Hash, "verify string remains the same");
        equals(ci.id, ciNode+"#"+xep115Hash, "ID populated correctly");
    });
    test("Test malformed FORM_TYPE failure", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";
        //more than 1 non unoque value
        xdatafrm1.getFieldByVar("FORM_TYPE").setValues(xdatafrm1.getFieldByVar("FORM_TYPE").getValues().concat("foobar"));
        var forms=[xdatafrm1];
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode, xep115Hash);
        var ret = ci._populate(identities, features, forms);
        ok(!ret, "invalid after duplicate form");
        equals(ci.status,"invalid", "status after duplicate form");
        equals(ci.ver,xep115Hash, "verify string remains the same");
        equals(ci.id, ciNode+"#"+xep115Hash, "ID populated correctly");
    });
    
    test("Test unlocked verify string with valid populate", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";

        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode);
        var forms=[xdatafrm1];
        var ret = ci._populate(identities, features, forms);
        ok(ret, "valid after valid preparsed populate");
        equals(ci.status,"valid", "status after populate");
        equals(ci.ver,xep115Hash, "valid verify string");
        equals(ci.id, xep115Hash, "ID populated correctly");
        var tstr = ci.identities.join("<") + "<";
        ok(tstr==identVer, "identities populated correctly");
        tstr = ci.features.join("<") + "<";
        ok(tstr==featVer, "features populated correctly");
        ok(ci.forms["urn:xmpp:dataforms:softwareinfo"] === xdatafrm1, "reference to form populated correctly");
    });
    
    test("Test reference getters/setters", function() {
        var ci = null, ciNode = "http://capsinfo-unit-test";
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, ciNode);
        var ret = ci._populate(identities, features, [xdatafrm1]);
        ci.addReference("jwtest3@example.com/resource1");
        var refs = ci.getReferences("jwtest3@example.com/resource1");
        equals(refs.length, 1, "# matches");
        equals(refs[0], "jwtest3@example.com/resource1", "matched jid");
        ci.addReference("jwtest4@example.com/resource1");
        refs = ci.getReferences("jwtest4@example.com/resource1");
        equals(1, refs.length, "# matches");
        equals(refs[0], "jwtest4@example.com/resource1", "matched jid");
        ci.addReference("jwtest4@example.com/resource2");
        refs = ci.getReferences("jwtest4@example.com/resource2");
        equals(refs.length,1, "one exact matches");
        equals(refs[0], "jwtest4@example.com/resource2", "matched jid");
        refs = ci.getReferences("jwtest4@example.com");
        equals(refs.length, 2, "two bare matches");
        equals(refs[0], "jwtest4@example.com/resource1", "matched jid 1");
        equals(refs[1], "jwtest4@example.com/resource2", "matched jid 2");                
        ci.removeReference("jwtest4@example.com/resource2");
        refs = ci.getReferences("jwtest4@example.com");
        equals(refs.length, 1, "one bare matches");
        equals(refs[0], "jwtest4@example.com/resource1", "matched jid 1");
        ok(ci.hasReference("jwtest4@example.com/resource1"), "has full reference");
        ok(ci.hasReference("jwtest4@example.com"), "has bare reference");        
    });
    
    test("Test CapsController.getIdentities", function() {
        var testResult = function(resArray, expectedArray) {
            equals(resArray.length, expectedArray.length, "result array length");
            for (var i = 0; i < resArray.length; ++i) {
                var idStr = resArray[i].category+"/"+resArray[i].type+"/"+resArray[i].xmlLang +"/"+resArray[i].name;
                ok(jabberwerx.$.inArray(idStr, expectedArray) != -1, "correct element: " + idStr);
            }    
        }
        
        //set CapsController state by inserting CapsInfo nodes directly into caps cache
        var ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate(["client/pc/en/Psi 0.11","client/pc/el/\u03A8 0.11"], [], []);
        ci.addReference("jwtest1@example.com/resource1");
        capCon._capsCache['some-unique-value-1'] = ci;
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate(["client/pc/en/Psi 0.11","client/pc/en/Exodus 5.4.0.32"], [], []);
        ci.addReference("jwtest1@example.com/resource2");
        capCon._capsCache['some-unique-value-2'] = ci;
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate(["client/pc/en/Exodus 5.4.0.32"], [], []);
        ci.addReference("jwtest1@example.com/resource3");
        capCon._capsCache['some-unique-value-3'] = ci;

        testResult(capCon.getIdentities("jwtest1@example.com/resource1"), ["client/pc/en/Psi 0.11",
                                                                           "client/pc/el/\u03A8 0.11"]);
        //  test resource2, expect ["client/pc/en/Psi 0.11","client/pc/en/Exodus 5.4.0.32"]
        testResult(capCon.getIdentities("jwtest1@example.com/resource2"), ["client/pc/en/Psi 0.11",
                                                                           "client/pc/en/Exodus 5.4.0.32"]);        
        //  test resource3, expect ["client/pc/en/Exodus 5.4.0.32"]
        testResult(capCon.getIdentities("jwtest1@example.com/resource3"), ["client/pc/en/Exodus 5.4.0.32"]);
        testResult(capCon.getIdentities("jwtest1@example.com"), ["client/pc/en/Psi 0.11",
                                                                 "client/pc/el/\u03A8 0.11",
                                                                 "client/pc/en/Exodus 5.4.0.32"]);
        testResult(capCon.getIdentities("jwtest2@example.com"), []);
        //  add test in testResult to ensure resArray is not null and is an array (using jabberwerx.util.isArray)
        ok(jabberwerx.util.isArray(capCon.getIdentities("jwtest1@example.com")),"resArray is an array");
        ok((capCon.getIdentities("jwtest1@example.com") !=null),"resArray is not null");
        //  test with JID instead of String jid, should return exact same results
        var j;
        j = new jabberwerx.JID({
        node: "jwtest1",
        domain: "example.com",
        resource: "resource1"
    });
        testResult(capCon.getIdentities(j), ["client/pc/en/Psi 0.11","client/pc/el/\u03A8 0.11"]);
        //  test bad JID, expect TypeError exception
        try {
            testResult(capCon.getIdentities("foo@/rsrc",["client/pc/en/Psi 0.11","client/pc/el/\u03A8 0.11"]));
            } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown");
        }
    });
    
    test("Test CapsController.getFeatures", function() {
        var testResult = function(resArray, expectedArray) {
            equals(resArray.length, expectedArray.length, "result array length");
            for (var i = 0; i < resArray.length; ++i) {
                ok(jabberwerx.$.inArray(resArray[i], expectedArray) != -1, "correct element: " + resArray[i]);
            }    
        }
        
        //set CapsController state by inserting CapsInfo nodes directly into caps cache
        var ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate([], ["http://jabber.org/protocol/disco#info","http://jabber.org/protocol/muc"], []);
        ci.addReference("jwtest1@example.com/resource1");
        capCon._capsCache['some-unique-value-1'] = ci;
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate([], ["http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/caps"], []);
        ci.addReference("jwtest1@example.com/resource2");
        capCon._capsCache['some-unique-value-2'] = ci;
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate([], ["http://jabber.org/protocol/disco#items"], []);
        ci.addReference("jwtest1@example.com/resource3");
        capCon._capsCache['some-unique-value-3'] = ci;

        testResult(capCon.getFeatures("jwtest1@example.com/resource1"), ["http://jabber.org/protocol/disco#info",
                                                                         "http://jabber.org/protocol/muc"]);
        //  test resource2, expect ["http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/caps"]
        testResult(capCon.getFeatures("jwtest1@example.com/resource2"), ["http://jabber.org/protocol/disco#info",
                                                                         "http://jabber.org/protocol/caps"]);
        //  test resource3, expect ["http://jabber.org/protocol/disco#items"]
        testResult(capCon.getFeatures("jwtest1@example.com/resource3"), ["http://jabber.org/protocol/disco#items"]);
        testResult(capCon.getFeatures("jwtest1@example.com"), ["http://jabber.org/protocol/disco#info",
                                                               "http://jabber.org/protocol/muc",
                                                               "http://jabber.org/protocol/caps",
                                                               "http://jabber.org/protocol/disco#items"]);
        testResult(capCon.getFeatures("jwtest2@example.com"), []);
        //  add test in testResult to ensure resArray is not null and is an array (using jabberwerx.util.isArray)
        ok(jabberwerx.util.isArray(capCon.getFeatures("jwtest1@example.com")),"resArray is an array");
        ok((capCon.getFeatures("jwtest1@example.com") !=null),"resArray is not null");
        //  test with JID instead of String jid, should return exact same results
        var j;
        j = new jabberwerx.JID({
        node: "jwtest1",
        domain: "example.com",
        resource: "resource1"
    });
        testResult(capCon.getFeatures(j), ["http://jabber.org/protocol/disco#info",
                                                                         "http://jabber.org/protocol/muc"]);
        //  test bad JID, expect TypeError exception
        try {
            testResult(capCon.getFeatures("foo@/rsrc"),["http://jabber.org/protocol/disco#info",
                                                                         "http://jabber.org/protocol/caps"]);
             } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown");
        } 
    });

    test("Test CapsController.getSupportedResources", function() {
        //set CapsController state by inserting CapsInfo nodes directly into caps cache
        var ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate([], ["http://jabber.org/protocol/disco#info","http://jabber.org/protocol/muc"], []);
        ci.addReference("jwtest1@example.com/resource1");
        capCon._capsCache['some-unique-value-1'] = ci;
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate([], ["http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/caps"], []);
        ci.addReference("jwtest1@example.com/resource2");
        capCon._capsCache['some-unique-value-2'] = ci;
        ci = new jabberwerx.CapabilitiesController.CapsInfo(capCon, "http://caps-unit-test");
        ci._populate([], ["http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/caps"], []);
        ci.addReference("jwtest2@example.com/resource1");
        capCon._capsCache['some-unique-value-3'] = ci;
        
        var resJIDs = capCon.getSupportedResources("jwtest1@example.com", "http://jabber.org/protocol/disco#info");
        //should be resource1, resource2
        equals(resJIDs.length, 2, "# supported resources");
        ok((resJIDs[0].getBareJIDString() == "jwtest1@example.com") &&
           (resJIDs[1].getBareJIDString() == "jwtest1@example.com"), "base JID is correct");
        var res1 = resJIDs[0].getResource(); var res2 = resJIDs[1].getResource();
        ok (((res1 == 'resource1') && (res2 == "resource2")) || ((res1 == "resource2") && (res2 == "resource1")), "correct resources returned");
        //todo test for bad JID (empty, bull, undefined or illegal) as param (throws TypeError)
        var caught = false;
        try {
            capCon.getSupportedResources(null, "http://jabber.org/protocol/disco#info");  
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError thrown for null JID");

        caught = false;
        try {
            capCon.getSupportedResources("", "http://jabber.org/protocol/disco#info");  
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError thrown for '' jid");

        caught = false;
        try {
            capCon.getSupportedResources("foo@bar", "");  
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError thrown for empty feature");

        caught = false;
        try {
            capCon.getSupportedResources("foo@bar", null);  
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError thrown for null feature");

        caught = false;
        try {
            capCon.getSupportedResources("foo@bar");  
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError thrown for undefined feature");
        
        //todo test for empty and null and undefined feature param (throws type error)
        resJIDs = capCon.getSupportedResources("jwtest1@example.com", "http://jabber.org/protocol/caps");
        equals(resJIDs.length, 1, "# supported resources");
        ok(resJIDs[0].toString() == "jwtest1@example.com/resource2", "jid is correct");        
        resJIDs = capCon.getSupportedResources("jwtest1@example.com", "http://my.made.ip.feature/foo");
        equals(resJIDs.length, 0, "# supported resources");           
        //  test for bad JID (empty, bull, undefined or illegal) as param (throws TypeError)
        var caught = false;
        try {
      capCon.getSupportedResources("foo@/", "http://jabber.org/protocol/disco#info");  
         } catch (ex) {
        caught = true;
        ok(ex instanceof TypeError,"expected TypeError thrown - invalid jid");                 
        }
      ok(caught, "expected error thrown");        
        //  test for empty and null and undefined feature param (throws type error)  
        //test for null feature param (throws type error)
         var caught = false;
        try {
      var resJIDs = capCon.getSupportedResources("jwtest1@example.com", null); 
         } catch (ex) {
        caught = true;
        ok(ex instanceof TypeError,"expected TypeError thrown - null feature");                 
    }
   ok(caught, "expected error thrown");
     //test for empty feature param (throws type error)
       var caught = false;
        try {
      var resJIDs = capCon.getSupportedResources("jwtest1@example.com","");
          } catch (ex) {
        caught = true;
        ok(ex instanceof TypeError,"expected TypeError thrown - empty feature");                 
    }
    ok(caught, "expected error thrown");
    });
});
