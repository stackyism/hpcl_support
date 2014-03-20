/**
 * filename:        NodeBuilderTest.js
 * created at:      2009/11/16T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
     module("jabberwerx[NodeBuilder]");

    //handy element compare by M&M
    var compareElementTree = function(act, exp) {
        if (typeof(exp) == "string") {
            ok(true, "Comparing element to: " + exp);
            exp = jabberwerx.util.unserializeXML(exp);
        }

        if (jabberwerx.isText(exp)) {
            equals(act.nodeValue, exp.nodeValue, "text value");
        } else {
            equals(act.nodeName, exp.nodeName, "element nodeName");
        }
        var ac = (act.attributes && act.attributes.length) || 0;
        var ec = (exp.attributes && exp.attributes.length) || 0;
        equals(ac, ec, "number of attributes");
        if (ec) {
            for (var idx = 0; exp.attributes && idx < exp.attributes.length; idx++) {
                var atname = exp.attributes[idx].name;
                var atval = exp.attributes[idx].value;

                equals(act.getAttribute(atname), atval, "attribute[" + atname + "]");
            }
        }

        var actContent = jabberwerx.$(act).contents();
        var expContent = jabberwerx.$(exp).contents();
        equals(actContent.length, expContent.length, "element content count");
        for (var idx = 0; idx < expContent.length; idx++) {
            compareElementTree(actContent.get(idx), expContent.get(idx));
        }
    };

    test("Test NodeBuilder Constructor", function() {
        //creation testing
        var nb, child, doc, ele;
        //check TypeError conditions,  not a doc, element or valid name
        try {
            nb = new jabberwerx.NodeBuilder({});
            ok(false,"Did not throw TypeError (invalid type)");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown (invalid type))");
        }

        //invalid extended names
        try {
            nb = new jabberwerx.NodeBuilder("{foo}");
            ok(false,"Did not throw TypeError ({foo})" + nb.data.nodeName);
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown ({foo})");
        }
        try {
            nb = new jabberwerx.NodeBuilder("foo:");
            ok(false,"Did not throw TypeError (foo:)" + nb.data.nodeName);
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown (foo:)");
        }
        try {
            nb = new jabberwerx.NodeBuilder("{another.bad.format}:local");
            ok(false,"Did not throw TypeError ({another.bad.format}:local)");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown ({another.bad.format}:local)");
        }
        try {
            nb = new jabberwerx.NodeBuilder("{another.bad.format}local:");
            ok(false,"Did not throw TypeError ({another.bad.format}local:)");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown ({another.bad.format}local:)");
        }
        try {
            nb = new jabberwerx.NodeBuilder("{will not parse");
            ok(false,"Did not throw TypeError ({will not parse)");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown ({will not parse)");
        }

        nb = new jabberwerx.NodeBuilder("{}local");
        compareElementTree(nb.data, "<local xmlns=''/>");
        nb = new jabberwerx.NodeBuilder("{name:space}local");
        compareElementTree(nb.data, "<local xmlns='name:space'/>");
        nb = new jabberwerx.NodeBuilder("{name:space}prefix:local");
        compareElementTree(nb.data, "<prefix:local xmlns:prefix='name:space'/>");

        //create "empty" nodebuilder
        nb = new jabberwerx.NodeBuilder();
        ok(nb.document, "undefined nodebuilder created document");
        nb = new jabberwerx.NodeBuilder("");
        ok(nb.document, "'empty' nodebuilder created document");

        var caught;
        try {
            nb = new jabberwerx.NodeBuilder("prefix:local");
            caught = false;
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
    });

    test("Test NodeBuilder Properties", function() {
        var nb, child;
        //property testing parent, data, document, namespaceURI
        nb = new jabberwerx.NodeBuilder("{test:ns}local-name");
        ok(!nb.parent, "parentless NodeBuilder has no parent");
        ok(nb.namespaceURI == "test:ns", "NodeBuilder has correct namespace: " + nb.namespaceURI);
        ok(nb.data.nodeName == "local-name", "NodeBuilder has correct local name: " + nb.data.nodeName);
        ok(nb.data, "NodeBuilder has associated element data");
        ok(nb.document, "NodeBuilder correctly created document");

        child = new  jabberwerx.NodeBuilder(nb);
        ok(nb === child.parent, "Parented nodebuilder has correct parent");
        ok(child.document === nb.document, "Parented NodeBuilder has parent's document");
        ok(child.namespaceURI == nb.namespaceURI, "Parented NodeBuilder has parent's namespaceURI: " + child.namespaceURI);
    });

    test("Test NodeBuilder Attribute Method", function() {
        var nb = new jabberwerx.NodeBuilder("{test:ns}attribute-test").
                                    attribute("attr1","val1").
                                    attribute("attr2","val2").
                                    attribute("attr3","val3");
        compareElementTree(nb.data,
                           "<attribute-test xmlns='test:ns' attr1='val1' attr2='val2' attr3='val3'/>");
                           
        nb = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/httpbind}body").
                            attribute("xmlns:temp", "jabberwerx:temp").
                            attribute("hold", "1").
                            attribute("rid", "12345678").
                            attribute("to", "example.com").
                            attribute("wait", "60").
                            attribute("{http://www.w3.org/XML/1998/namespace}xml:lang", "en").
                            attribute("{urn:xmpp:bosh}xmpp:version", "1.0");
        compareElementTree(nb.data,
                           "<body xmlns='http://jabber.org/protocol/httpbind' xmlns:temp='jabberwerx:temp' xmlns:xmpp='urn:xmpp:bosh' hold='1' rid='12345678' to='example.com' wait='60' xml:lang='en' xmpp:version='1.0' />");
    });

    test("Test NodeBuilder Text Method", function() {
        var nb = new jabberwerx.NodeBuilder("{test:ns}text-test");
        nb.text("some text");
        compareElementTree(nb.data,
                           "<text-test xmlns='test:ns'>some text</text-test>", "Text Test");
    });

    test("Test NodeBuilder Element Method", function() {
        var nb, child;
        nb = new jabberwerx.NodeBuilder("{test:ns}etest");
        child = nb.element("child1");
        compareElementTree(child.data, "<child1/>");
        compareElementTree(nb.data, "<etest xmlns='test:ns'><child1/></etest>");

        nb = new jabberwerx.NodeBuilder("{test:ns}etest");
        nb.element("child1").parent.element("child2").element("child3").parent.element("child4").parent.parent.element("child5");
        compareElementTree(nb.data,
                           "<etest xmlns='test:ns'><child1/><child2><child3/><child4/></child2><child5/></etest>");

        nb = new jabberwerx.NodeBuilder("{test:ns}etest");
        var aa = {};
        aa["attr1"] = "val1";
        aa["attr2"] = "val2";
        aa["attr3"] = "val3";
        nb.element("child1", aa);
        compareElementTree(nb.data,
                           "<etest xmlns='test:ns'><child1 attr1='val1' attr2='val2' attr3='val3'/></etest>");
    });
    test("Test NodeBuilder Node Method", function() {
        //node
        nb = new jabberwerx.NodeBuilder("{test:ns}etest");
        child = new jabberwerx.NodeBuilder("child1");
        nb.node(child.document);
        compareElementTree(nb.data,
                           "<etest xmlns='test:ns'><child1/></etest>");

        nb = new jabberwerx.NodeBuilder("{test:ns}etest");
        child = new jabberwerx.NodeBuilder("child1");
        nb.node(child.document.documentElement);
        compareElementTree(nb.data,
                           "<etest xmlns='test:ns'><child1/></etest>");

        // create temp builder to generate TextNode
        var tmpBuilder = new jabberwerx.NodeBuilder("{test:ns}dummy");
        tmpBuilder.text("some text");
        child = tmpBuilder.data.childNodes[0];
        
        nb = new jabberwerx.NodeBuilder("{test:ns}etest");
        nb.node(child);
        compareElementTree(nb.data,
                           "<etest xmlns='test:ns'>some text</etest>");
    });
    test("Test NodeBuilder XML Method", function() {
        //xml
        nb = new jabberwerx.NodeBuilder("{test:ns}etest");
        nb.xml("<child1>some text</child1>");
        compareElementTree(nb.data,
                           "<etest xmlns='test:ns'><child1>some text</child1></etest>");
    });
    test("Test unserializeXML", function() {
        try {
            jabberwerx.util.unserializeXML("<bad ");
            ok(false, "Did not throw expected TypeError for bad xml parse");
        }
        catch(ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown parsing bad xml");
        }
        
        equals(jabberwerx.util.unserializeXML(""), null, "unserialized empty string");
        equals(jabberwerx.util.unserializeXML(), null, "unserialized undefined string");
        equals(jabberwerx.util.unserializeXML(null), null, "unserialized null string");
        equals(jabberwerx.util.unserializeXML("", "foo").nodeName, "foo", "unserialized empty string with foo wrapper");
    });
});
