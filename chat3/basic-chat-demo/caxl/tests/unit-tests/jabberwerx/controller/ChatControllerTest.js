jabberwerx.$(document).ready( function() {
    var chatController;
    var client;
    
    module("jabberwerx/controller/chatcontroller", {
        setup: function() {
            client = new jabberwerx.Client();
            client.connectedUser = {jid: 'placeholder'};
            chatController = new jabberwerx.ChatController(client);
        },
        
        teardown: function() {
            delete chatController;
        }
    });
    
    test("Test capabilities", function() {
        var caps = client.controllers.capabilities;
        ok(caps.containsFeature("http://jabber.org/protocol/chatstates"), "supports chat states");
        ok(caps.containsFeature("http://jabber.org/protocol/xhtml-im"), "supports XHTML-IM");
    });
    
    test("Test Open / Get Session", function() {
        var oldChatSession = chatController.openSession('foo@bar', 'abcde12345');
        chatController.openSession('foo@bar', 'abcdz12340');
        var chatSession = chatController.getSession('foo@bar');
        equals(chatController._chatSessions.length, 1);
        equals(chatSession.jid.getBareJIDString(), oldChatSession.jid.getBareJIDString());
        equals(chatSession.thread, oldChatSession.thread);
        ok(!chatController.getSession('bar@foo'));
    });
    
    test("Test Chat Session Created Event", function() {
        var userCreated = null;
        var chatSession = null;
        chatController.event('chatSessionOpened').bind(function(eventObj) {
            chatSession = eventObj.data.chatSession;
            userCreated = eventObj.data.userCreated;
        });
        chatController.openSession('foo@bar', 'abcde12345');
        ok(userCreated);
        equals(chatSession.jid.getBareJIDString(), 'foo@bar');
        equals(chatSession.thread, 'abcde12345');
    });
    
    test("Test Chat Session Opened upon afterMessageReceived Event", function() {
        var userCreated = null;
        var chatSession = null;
        chatController.event('chatSessionOpened').bind(function(eventObj) {
            chatSession = eventObj.data.chatSession;
            userCreated = eventObj.data.userCreated;
        });
        
        var msg = new jabberwerx.Message();
        msg.setFrom("foo@bar");
        msg.setType("chat");
        msg.setBody("a sample body");
        client.event("afterMessageReceived").trigger(msg);
        
        ok(!userCreated, "ChatSession is not user created");
        equals(chatSession.jid.getBareJIDString(), 'foo@bar');
    });
    
    test("Test Chat Session NOT Opened upon type \"groupchat\" or \"error\"", function() {
        var triggered = false;
        chatController.event('chatSessionOpened').bind(function(eventObj) {
            triggered = true;
        });
        
        var msg = new jabberwerx.Message();
        msg.setFrom("foo@bar");
        msg.setType("error");
        msg.setBody("a sample body");
        client.event("afterMessageReceived").trigger(msg);
        
        ok(!triggered, "Triggered should still be false");
        
        msg.setType("groupchat");
        client.event("afterMessageReceived").trigger(msg);
        
        ok(!triggered, "Triggered should still be false");
    });
    
    test("Test Chat Session NOT Opened when no body is present", function() {
        var triggered = false;
        chatController.event('chatSessionOpened').bind(function(eventObj) {
            triggered = true;
        });
        
        var msg = new jabberwerx.Message();
        msg.setFrom("foo@bar");
        msg.setType("chat");
        var builder = new jabberwerx.NodeBuilder(msg.getNode());
        builder.element("{http://jabber.org/protocol/chatstates}active");
        msg.setThread("JW_12345");
        msg.setSubject("an interesting subject");
        client.event("afterMessageReceived").trigger(msg);
        
        ok(!triggered, "Triggered should still be false");
    });
    
    test("Test Close Chat Session", function() {
        chatController.openSession('foo@bar', 'abcde12345');
        ok(chatController.closeSession('foo@bar'));
        equals(chatController._chatSessions.length, 0);
        chatController.openSession('foo@bar', 'abcde12345');
        var chatSession = chatController.getSession('foo@bar');
        ok(chatController.closeSession(chatSession));
        equals(chatController._chatSessions.length, 0);
        ok(!chatController.closeSession({x:1, y:2}));
    });
    
    test("Test Chat Session Closed Event", function() {
        var chatSession = null;
        chatController.event('chatSessionClosed').bind(function(eventObj) {
            chatSession = eventObj.data;
        });
        chatController.openSession('foo@bar', 'abcde12345');
        chatController.closeSession('foo@bar');
        equals(chatSession.jid.getBareJIDString(), 'foo@bar');
        equals(chatSession.thread, 'abcde12345');
    });
});
