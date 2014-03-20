/**
 * filename:        PubSubItemTest.js
 * created at:      2009/11/10T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/pubsub:item");
    
    var __jwaValidateTimestamp = function(actual, expected) {
        if (actual != expected) {
            // nagle to one second
            actual = parseInt(actual / 1000);
            expected = parseInt(expected / 1000);
            
            return  (actual == expected) ||
                    (actual == expected + 1) ||
                    (actual == expected - 1);
        }
        
        return true;
    };
    test("Test Create", function() {
        var builder;
        builder = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}item").
                attribute("id", "current").
                attribute("publisher", "jwtest2@example.com").
                attribute("timestamp", "2009-11-10T17:25:42Z");
        builder.element("{jabber:x:oob}x").
                element("url").text("http://www.cisco.com").parent.
                element("desc").text("The Human Network").parent;

        var item;
        var ts;
        ts = 1257873942000;
        item = new jabberwerx.PubSubItem(builder.data);
        equals(item.id, "current");
        equals(item.publisher, "jwtest2@example.com");
        ok(__jwaValidateTimestamp(item.timestamp.getTime(), ts), "timestamps equal");
        equals(item.data.xml, '<x xmlns="jabber:x:oob"><url>http://www.cisco.com</url><desc>The Human Network</desc></x>');
        
        builder = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}item").
                attribute("id", "current").
                attribute("timestamp", "2009-11-10T17:25:42Z");
        builder.element("{jabber:x:oob}x").
                element("url").text("http://www.cisco.com").parent.
                element("desc").text("The Human Network").parent;

        ts = 1257873942000;
        item = new jabberwerx.PubSubItem(builder.data);
        equals(item.id, "current");
        equals(item.publisher, null);
        ok(__jwaValidateTimestamp(item.timestamp.getTime(), ts), "timestamps equal");
        equals(item.data.xml, '<x xmlns="jabber:x:oob"><url>http://www.cisco.com</url><desc>The Human Network</desc></x>');
        
        builder = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}item").
                attribute("id", "current").
                attribute("publisher", "jwtest2@example.com");
        builder.element("{jabber:x:oob}x").
                element("url").text("http://www.cisco.com").parent.
                element("desc").text("The Human Network").parent;

        ts = new Date().getTime();
        item = new jabberwerx.PubSubItem(builder.data);
        equals(item.id, "current");
        equals(item.publisher, "jwtest2@example.com");
        ok(__jwaValidateTimestamp(item.timestamp.getTime(), ts), "timestamps equal");
        equals(item.data.xml, '<x xmlns="jabber:x:oob"><url>http://www.cisco.com</url><desc>The Human Network</desc></x>');

        builder = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}item").
                attribute("id", "current");
        builder.element("{jabber:x:oob}x").
                element("url").text("http://www.cisco.com").parent.
                element("desc").text("The Human Network").parent;

        ts = new Date().getTime();
        item = new jabberwerx.PubSubItem(builder.data);
        equals(item.id, "current");
        equals(item.publisher, null);
        ok(__jwaValidateTimestamp(item.timestamp.getTime(), ts), "timestamps equal");
        equals(item.data.xml, '<x xmlns="jabber:x:oob"><url>http://www.cisco.com</url><desc>The Human Network</desc></x>');
        
        builder = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}item").
                attribute("id", "current").
                attribute("publisher", "jwtest2@example.com").
                attribute("timestamp", "2009-11-10T17:25:42Z");

        ts = 1257873942000;
        item = new jabberwerx.PubSubItem(builder.data);
        equals(item.id, "current");
        equals(item.publisher, "jwtest2@example.com");
        ok(__jwaValidateTimestamp(item.timestamp.getTime(), ts), "timestamps equal");
        equals(item.data, null);
        
    });
});
