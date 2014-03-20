/**
 * filename:        StreamTest.js
 * created at:      2009/12/03T00:00:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/stream:errorinfo");
    test("Test create", function() {
        var err = new jabberwerx.Stream.ErrorInfo(
                "{urn:ietf:params:xml:ns:xmpp-streams}service-unavailable",
                "this service is not available");
        equals(err.condition, "{urn:ietf:params:xml:ns:xmpp-streams}service-unavailable");
        equals(err.text, "this service is not available");
        equals(err.getNode().xml, '<stream:error xmlns:stream="http://etherx.jabber.org/streams"><service-unavailable xmlns="urn:ietf:params:xml:ns:xmpp-streams"/><text xmlns="urn:ietf:params:xml:ns:xmpp-streams">this service is not available</text></stream:error>');
    });
    test("Test createWithNode", function() {
        var node;
        node = new jabberwerx.NodeBuilder("{http://etherx.jabber.org/streams}stream:error");
        node.element("{urn:ietf:params:xml:ns:xmpp-streams}undefined-condition").parent.
             element("{urn:ietf:params:xml:ns:xmpp-streams}text").text("unknown failure").parent;
        node = node.data;

        var info = jabberwerx.Stream.ErrorInfo.createWithNode(node);
        ok(info instanceof jabberwerx.Stream.ErrorInfo);
        equals(info.condition, "{urn:ietf:params:xml:ns:xmpp-streams}undefined-condition");
        equals(info.text, "unknown failure");
    });
    
     module("jabberwerx/model/stream");
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test [Using Proxy Server] open() generates bosh URL when first login", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="/caxltestserver99";
        var proto = document.location.protocol;
        var host = document.location.host;
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: null
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, false);
       equals(mystream._boshProps.httpBindingURL,proto+"//"+host+bindingurl);
       equals(mystream._connectToNode,"caxltestserver99");
    });
      //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
      test("Test [Using Proxy Server] open() generates bosh URL with cached user's home node", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="/caxltestserver99";
        var proto = document.location.protocol;
        var host = document.location.host;
        var candidateNodes = ["caxltestserver01"];
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, false);
       equals(mystream._boshProps.httpBindingURL,proto+"//"+host+"/caxltestserver01");
       equals(mystream._connectToNode,"caxltestserver01");
    });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test [Using Proxy Server] open() generates bosh URL with _connectToNode", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="/caxltestserver99";
        var proto = document.location.protocol;
        var host = document.location.host;
        var candidateNodes = ["caxltestserver02"];
        mystream._connectToNode ="caxltestserver01"
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                         };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, false);
       equals(mystream._boshProps.httpBindingURL,proto+"//"+host+"/caxltestserver01");
       equals(mystream._connectToNode,"caxltestserver01");
    });
    //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
    test("Test [CORS] open() generates bosh URL when first login", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com:7335/httpbinding";
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: null
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver99.example.com:7335/httpbinding");
       equals(mystream._connectToNode,"caxltestserver99.example.com");
       
     });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
      test("Test [CORS] open() generates bosh URL with cached user's home node, and fqdn in the bindingurl", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com:7335/httpbinding";
        var candidateNodes = ["caxltestserver01"];
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver01.example.com:7335/httpbinding");
       equals(mystream._connectToNode,"caxltestserver01.example.com");
       });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
      test("Test [CORS] open() generates bosh URL with cached user's home node, and hostname in the binding url", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99:7335/httpbinding";
        var candidateNodes = ["caxltestserver01"];
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver01:7335/httpbinding");
       equals(mystream._connectToNode,"caxltestserver01");
    });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test [CORS] open() generates bosh URL with _connectToNode", function() {
        var mystream = new jabberwerx.Stream();
        var candidateNodes = ["caxltestserver02"];
        var bindingurl="http://caxltestserver99.example.com:7335/httpbinding";
        mystream._connectToNode ="caxltestserver01.example.com"
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver01.example.com:7335/httpbinding");
       equals(mystream._connectToNode,"caxltestserver01.example.com");
    });
    //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
    test("Test [CORS] open() generates bosh URL when first login, no port number in the binding url", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com/httpbinding";
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: null
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver99.example.com/httpbinding");
       equals(mystream._connectToNode,"caxltestserver99.example.com");
       
     });
      //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
      test("Test [CORS] open() generates bosh URL with cached user's home node, have fqdn and no port number in the binding url", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com/httpbinding";
        var candidateNodes = ["caxltestserver01"];
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver01.example.com/httpbinding");
       equals(mystream._connectToNode,"caxltestserver01.example.com");
    });
      //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
      test("Test [CORS] open() generates bosh URL with cached user's home node, have host name and no port number in the binding url", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99/httpbinding";
        var candidateNodes = ["caxltestserver01"];
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver01/httpbinding");
       equals(mystream._connectToNode,"caxltestserver01");
    });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test [CORS] open() generates bosh URL with _connectToNode,no port number in the binding url", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com/httpbinding";
        var candidateNodes = ["caxltestserver02"];
        mystream._connectToNode ="caxltestserver01.example.com";
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://caxltestserver01.example.com/httpbinding");
       equals(mystream._connectToNode,"caxltestserver01.example.com");
    });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test [CORS] open() generates bosh URL with _connectToNode,no port number in the binding url", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com/httpbinding";
        var candidateNodes = ["caxltestserver02"];
        mystream._connectToNode ="1.1.1.1";
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://1.1.1.1/httpbinding");
       equals(mystream._connectToNode,"1.1.1.1");
    });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test [CORS] open() generates bosh URL,no port number in the binding url", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com/httpbinding";
        var candidateNodes = ["1.1.1.1"];
        mystream._connectToNode =null;
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://1.1.1.1/httpbinding");
       equals(mystream._connectToNode,"1.1.1.1");
    });
     //NOTE: all the functions/variables with '_' prefix are private in the CAXL library, we use them here only for testing purpose
     test("Test [CORS] open() generates bosh URL:binding url is fqdn, connect to node is hostname", function() {
        var mystream = new jabberwerx.Stream();
        var bindingurl="http://caxltestserver99.example.com/httpbinding";
        var candidateNodes = ["testserver1"];
        mystream._connectToNode = "newtestserver";
        mystream._sendRequest= function(){};
        mystream._boshProps.heartbeat=function(){};
     	var streamOpts = {jid: "caxltestuser01@example.com",
                          domain: "example.com",
                          timeout: jabberwerx.Stream.DEFAULT_TIMEOUT,
                          wait: jabberwerx.Stream.DEFAULT_WAIT,
                          secure: false,
                          httpBindingURL: bindingurl,
                          homeNode: candidateNodes[0]
                        };
       mystream.open(streamOpts);
       equals(mystream._boshProps.crossSite, true);
       equals(mystream._boshProps.httpBindingURL,"http://newtestserver.example.com/httpbinding");
       equals(mystream._connectToNode,"newtestserver.example.com");
    });
});
