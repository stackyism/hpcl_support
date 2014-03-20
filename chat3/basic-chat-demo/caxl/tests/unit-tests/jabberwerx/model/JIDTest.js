jabberwerx.$(document).ready(function() {

  // Beginning of JID Unit Tests module (no set up or tear down)
  module("jabberwerx/model/jid");
  
  test("Test Escape Node", function() {
    var node = "basic-node";
    same(jabberwerx.JID.escapeNode("basic-node"), "basic-node");
    same(jabberwerx.JID.escapeNode("space cadet"), "space\\20cadet");
    same(jabberwerx.JID.escapeNode("call me \"ishmael\""), "call\\20me\\20\\22ishmael\\22");
    same(jabberwerx.JID.escapeNode("at&t guy"), "at\\26t\\20guy");
    same(jabberwerx.JID.escapeNode("d'artagnan"), "d\\27artagnan");
    same(jabberwerx.JID.escapeNode("/.fanboy"), "\\2f.fanboy");
    same(jabberwerx.JID.escapeNode("::foo::"), "\\3a\\3afoo\\3a\\3a");
    same(jabberwerx.JID.escapeNode("<foo>"), "\\3cfoo\\3e");
    same(jabberwerx.JID.escapeNode("user@host"), "user\\40host");
    same(jabberwerx.JID.escapeNode("c:\\5cool"), "c\\3a\\5c5cool");
    //NOTE: not escaping '\' because it is not followed by a valid unescape value
    same(jabberwerx.JID.escapeNode("c:\\cool"), "c\\3a\\cool");
    
    try {
        jabberwerx.JID.escapeNode(" bad escapee");
        ok(false, "expected error not thrown!");
    } catch (ex) {
        ok(ex instanceof TypeError, "expected TypeError thrown");
    }
    try {
        jabberwerx.JID.escapeNode("bad escapee ");
        ok(false, "expected error not thrown!");
    } catch (ex) {
        ok(ex instanceof TypeError, "expected TypeError thrown");
    }
  });
  test("Test Unescape Node", function() {
    same(jabberwerx.JID.unescapeNode("basic-node"), "basic-node");
    same(jabberwerx.JID.unescapeNode("space\\20cadet"), "space cadet");
    same(jabberwerx.JID.unescapeNode("call\\20me\\20\\22ishmael\\22"), "call me \"ishmael\"");
    same(jabberwerx.JID.unescapeNode("at\\26t\\20guy"), "at&t guy");
    same(jabberwerx.JID.unescapeNode("d\\27artagnan"), "d'artagnan");
    same(jabberwerx.JID.unescapeNode("\\2f.fanboy"), "/.fanboy");
    same(jabberwerx.JID.unescapeNode("\\3a\\3afoo\\3a\\3a"), "::foo::");
    same(jabberwerx.JID.unescapeNode("\\3cfoo\\3e"), "<foo>");
    same(jabberwerx.JID.unescapeNode("user\\40host"), "user@host");
    same(jabberwerx.JID.unescapeNode("c\\3a\\5c5cool"), "c:\\5cool");
    //NOTE: not escaping '\' because it is not followed by a valid unescape value
    same(jabberwerx.JID.unescapeNode("c\\3a\\cool"), "c:\\cool");
  });
  
  test("Test Create", function() {
    var j;
    j = new jabberwerx.JID("foo@jabber.com/there");
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "foo");
    same(j.getResource(), "there");
    same(j.toString(), "foo@jabber.com/there");
    j = new jabberwerx.JID("foo@jabber.com");
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "foo");
    same(j.getResource(), "");
    same(j.toString(), "foo@jabber.com");
    j = new jabberwerx.JID("jabber.com/there");
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "");
    same(j.getResource(), "there");
    same(j.toString(), "jabber.com/there");
    
    j = new jabberwerx.JID({
        node: "foo",
        domain: "jabber.com",
        resource: "there"
    });
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "foo");
    same(j.getResource(), "there");
    same(j.toString(), "foo@jabber.com/there");
    
    j = new jabberwerx.JID({
        node: "foo",
        domain: "jabber.com"
    });
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "foo");
    same(j.getResource(), "");
    same(j.toString(), "foo@jabber.com");
    
    j = new jabberwerx.JID({
        domain: "jabber.com",
        resource: "there"
    });
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "");
    same(j.getResource(), "there");
    same(j.toString(), "jabber.com/there");
    
    j = new jabberwerx.JID({
        node: "foo\\40aol.com",
        domain: "jabber.com",
        resource: "there"
    });
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "foo\\40aol.com");
    same(j.getResource(), "there");
    same(j.toString(), "foo\\40aol.com@jabber.com/there");
    
    j = new jabberwerx.JID({
        node: "foo@aol.com",
        domain: "jabber.com",
        resource: "there",
        unescaped: true
    });
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "foo\\40aol.com");
    same(j.getResource(), "there");
    same(j.toString(), "foo\\40aol.com@jabber.com/there");
  });
  
  test("Test Parse Domain Only", function() {
    var j = new jabberwerx.JID("foo");
    same(j.getNode(), "");
    same(j.getDomain(), "foo");
    same(j.getResource(), "");
  });
  
  test("Test Parse Domain and Resource", function() {
    var j = new jabberwerx.JID("foo/bar");
    same(j.getNode(), "");
    same(j.getDomain(), "foo");
    same(j.getResource(), "bar");
  });
  
  test("Test Parse Node and Domain", function() {
    var j = new jabberwerx.JID("boo@foo");
    same(j.getNode(), "boo");
    same(j.getDomain(), "foo");
    same(j.getResource(), "");
  });
  
  test("Test Parse Full JID", function() {
    var j = new jabberwerx.JID("boo@foo/bar");
    same(j.getNode(), "boo");
    same(j.getDomain(), "foo");
    same(j.getResource(), "bar");
  });
  
  test("Test Parse @ in Resource", function() {
    var j = new jabberwerx.JID("foo/bar@baz");
    same(j.getNode(), "");
    same(j.getDomain(), "foo");
    same(j.getResource(), "bar@baz");
  });
  
  test("Test Parse @ in Resource 2", function() {
    var j = new jabberwerx.JID("boo@foo/bar@baz");
    same(j.getNode(), "boo");
    same(j.getDomain(), "foo");
    same(j.getResource(), "bar@baz");
  });
  
  test("Test Parse / in Resource", function() {
    var j = new jabberwerx.JID("boo@foo/bar/baz");
    same(j.getNode(), "boo");
    same(j.getDomain(), "foo");
    same(j.getResource(), "bar/baz");
  });
  
  test("Test Parse two @'s in Resource", function() {
    var j = new jabberwerx.JID("boo/foo@bar@baz");
    same(j.getNode(), "");
    same(j.getDomain(), "boo");
    same(j.getResource(), "foo@bar@baz");
  });
  
  test("Test Parse / in Resource", function() {
    var j = new jabberwerx.JID("boo/foo/bar");
    same(j.getNode(), "");
    same(j.getDomain(), "boo");
    same(j.getResource(), "foo/bar");
  });
  
  test("Test Parse / in Resource 2", function() {
    var j = new jabberwerx.JID("boo//foo");
    same(j.getNode(), "");
    same(j.getDomain(), "boo");
    same(j.getResource(), "/foo");
  });
  
  test("Test Empty Resource", function() {
    try {
        var j = new jabberwerx.JID("boo/");
        ok(false, "JID object was created when exception should have been thrown");
    } catch(e) {
        ok(e instanceof jabberwerx.JID.InvalidJIDError, "The error thrown should be an instance of the JIDFormatException class");
    }
  });
  
  test("Test Empty Resource 2", function() {
    try {
        var j = new jabberwerx.JID("boo@foo/");     
        ok(false, "JID object was created when exception should have been thrown");
    } catch(e) {
        ok(e instanceof jabberwerx.JID.InvalidJIDError, "The error thrown should be an instance of the JIDFormatException class");
    }
  });
  
  test("Test No Domain", function() {
    try {
        var j = new jabberwerx.JID("foo@");
        ok(false, "JID object was created when exception should have been thrown");
    } catch(e) {
        ok(e instanceof jabberwerx.JID.InvalidJIDError, "The error thrown should be an instance of the jabberwerx.JID.InvalidJIDError class");
    }
  });
  
  test("Test Double @", function() {
    try {
        var j = new jabberwerx.JID("boo@@foo");
        ok(false, "JID object was created when exception should have been thrown");
    } catch(e) {
        ok(e instanceof jabberwerx.JID.InvalidJIDError, "The error thrown should be an instance of the jabberwerx.JID.InvalidJIDError class");
    }
  });
  
  test("Test Two @'s", function() {
    try {
        var j = new jabberwerx.JID("boo@foo@bar");
        ok(false, "JID object was created when exception should have been thrown");
    } catch(e) {
        ok(e instanceof jabberwerx.JID.InvalidJIDError, "The error thrown should be an instance of the jabberwerx.JID.InvalidJIDError class");
    }
  });
  
  test("Negative test for / in node", function() {
    try {
        var j = new jabberwerx.JID({
                node: "foo/bar",
                domain: "jabber.com",
                resource: "there"
            });

        ok(false, "JID object was created when exception should have been thrown");
    } catch(e) {
        ok(e instanceof jabberwerx.JID.InvalidJIDError, "The error thrown should be an instance of the jabberwerx.JID.InvalidJIDError class");
    }
  });
  
  test("Positive test for / in node", function() {
    var j = new jabberwerx.JID({
        node: "foo/bar",
        domain: "jabber.com",
        resource: "there",
        unescaped: true
    });    
    same(j.getDomain(), "jabber.com");
    same(j.getNode(), "foo\\2fbar");
    same(j.getResource(), "there");
    same(j.toString(), "foo\\2fbar@jabber.com/there");  
    same(j.toDisplayString(), "foo/bar@jabber.com/there"); 
  });
  
  test("Negative test for / in domain", function() {
    try {
        var j = new jabberwerx.JID({
            node: "foobar",
            domain: "jab/ber.com",
            resource: "there"
        });

        ok(false, "JID object was created when exception should have been thrown");
    } catch(e) {
        ok(e instanceof jabberwerx.JID.InvalidJIDError, "The error thrown should be an instance of the jabberwerx.JID.InvalidJIDError class");
    }
  }); 
  
  test("Test Bare JID", function() {
    var j = new jabberwerx.JID("foo@bar/baz");
    var bare = j.getBareJID();
    equals(bare.getNode(), j.getNode(), "nodes match");
    equals(bare.getDomain(), j.getDomain(), "domains match");
    equals(bare.toString(), "foo@bar", "bare JID string as expected");
    equals(j.getBareJIDString(), "foo@bar", "full JID bare string as expected");
    
    j = new jabberwerx.JID("foo@bar");
    bare = j.getBareJID();
    same(bare, j, "bare JID is original JID");
  });
  
  test("Test Equality Equal", function() {
    var j = new jabberwerx.JID("foo@bar/baz");
    ok(j.equals(j));
    ok(j.equals(new jabberwerx.JID("foo@bar/baz")));
    
    j = new jabberwerx.JID("foo@bar");
    ok(j.equals(j));
    ok(j.equals(new jabberwerx.JID("foo@bar")));
    
    j = new jabberwerx.JID("bar");
    ok(j.equals(j));
    ok(j.equals(new jabberwerx.JID("bar")));
    
    j = new jabberwerx.JID("foo/bar");
    ok(j.equals(j));
    ok(j.equals(new jabberwerx.JID("foo/bar")));
  });
  
  test("Test Equality Not Equal", function() {
    var j = new jabberwerx.JID("foo@bar/baz");
    ok( !(j.equals(new jabberwerx.JID("foop@bar/baz"))), "The JID's are not the same and therefore JID.isSameEntity should return false");
    ok( !(j.equals(new jabberwerx.JID("foo@barr/baz"))), "The JID's are not the same and therefore JID.isSameEntity should return false");
    ok( !(j.equals(new jabberwerx.JID("foo@bar/bazz"))), "The JID's are not the same and therefore JID.isSameEntity should return false");
  });
  
  test("Test Equality Case Insensitive", function() {
    var j = new jabberwerx.JID("foo@bar/baz");
    ok(j.equals(new jabberwerx.JID("FOO@bar/baz")));
    ok(j.equals(new jabberwerx.JID("foo@BAR/baz")));
    ok(j.equals(new jabberwerx.JID("FOO@BAR/baz")));
    ok( !(j.equals(new jabberwerx.JID("foo@bar/BAZ"))) );
  });
  
  test("Test comparison", function() {
    var j1, j2;
    
    j1 = j2 = new jabberwerx.JID("example.com");
    equals(0, j1.compareTo(j2));
    equals(0, j2.compareTo(j1));
    
    j2 = new jabberwerx.JID("example.com");
    equals(0, j1.compareTo(j2));
    equals(0, j2.compareTo(j1));
    
    j2 = new jabberwerx.JID("example1.com");
    equals(-1, j1.compareTo(j2));
    equals(1, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("example2.com");
    equals(1, j1.compareTo(j2));
    equals(-1, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("example.com");
    j2 = new jabberwerx.JID("user1@example.com");
    equals(-1, j1.compareTo(j2));
    equals(1, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("user1@example.com");
    equals(0, j1.compareTo(j2));
    equals(0, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("user2@example.com");
    equals(1, j1.compareTo(j2));
    equals(-1, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("example.com");
    j2 = new jabberwerx.JID("example.com/resource1");
    equals(-1, j1.compareTo(j2));
    equals(1, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("example.com/resource1");
    equals(0, j1.compareTo(j2));
    equals(0, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("example.com/resource2");
    equals(1, j1.compareTo(j2));
    equals(-1, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("user1@example.com/resource1");
    j2 = new jabberwerx.JID("user1@example.com/resource1");
    equals(0, j1.compareTo(j2));
    equals(0, j2.compareTo(j1));
    
    j2 = new jabberwerx.JID("user2@example.com/resource1");
    equals(-1, j1.compareTo(j2));
    equals(1, j2.compareTo(j1));
    
    j1 = new jabberwerx.JID("user1@example.com/resource2");
    equals(-1, j1.compareTo(j2));
    equals(1, j2.compareTo(j1));
    
    j2 = new jabberwerx.JID("user1@example.com/resource1");
    equals(1, j1.compareTo(j2));
    equals(-1, j2.compareTo(j1));
  });
  
  test("Test Bad Equality", function() {
    var j = new jabberwerx.JID("foo@bar/baz");
    var obj = {x:1, y:2};
    ok(j.equals("foo@bar/baz"));
    ok(!j.equals(obj));
  });
  
  test("Test Config", function() {
    var j = new jabberwerx.JID("config@-internal");
    same(j.getNode(), "config");
    same(j.getDomain(), "-internal");
    same(j.getResource(), "");
  });
  
  test("Test Numeric Domain", function() {
    var j = new jabberwerx.JID("support@conference.192.168.32.109/bob");
    same(j.getDomain(), "conference.192.168.32.109");
  });
  
  test("Test Display String", function() {
    var j = new jabberwerx.JID("foo\\40aol.com@jabber.com");
    same(j.toString(), "foo\\40aol.com@jabber.com");
    same(j.toDisplayString(), "foo@aol.com@jabber.com");
  });

  test("Test asJid", function() {
    var j = new jabberwerx.JID("foo@bar/baz");
    var k = jabberwerx.JID.asJID(j);
    equals(j, k, "asJid should return the same JID object that was passed in.");
    
    var l = jabberwerx.JID.asJID("foo@bar/baz");
    ok(j.equals(l), "These 2 objects should contain the same JID.");
  });
  
  test("Test caching", function() {
    jabberwerx.JID.clearCache();
    
    var j;
    var k;

    j = jabberwerx.JID.asJID("foo@bar/baz");
    k = jabberwerx.JID.asJID(j);
    ok(j === k, "JIDs reference same object (identity)");
    
    k = jabberwerx.JID.asJID("foo@bar/baz");
    ok(j === k, "JIDs reference same object (by string)");
    
    j = new jabberwerx.JID("romeo@montegue.net/garden");
    k = jabberwerx.JID.asJID("romeo@montegue.net/garden");
    ok(j === k, "JIDs reference same object (init vs asJID)");

    k = jabberwerx.JID.asJID("Romeo@MontEGUE.Net/garden");
    ok(j === k, "JIDs reference same object (mixed-case local@domain)");
    
    k = jabberwerx.JID.asJID("romeo@montegue.net/Garden");
    ok(j !== k, "JIDs are different objects (mixed-case resource)");
    
    jabberwerx.JID.clearCache();
    k = jabberwerx.JID.asJID("romeo@montegue.net/garden");
    ok(j !== k, "JIDs are different objects (cleared cache)");
  });
});
