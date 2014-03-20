jabberwerx.$(document).ready( function() {    
    var client;
    
    module('jabberwerx/model/chatsession', {
        setup: function() {
            client = new jabberwerx.Client();
            client.connectedUser = {jid: 'placeholder'};
        }
    });
    
    test('Test Update Resource', function() {
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar");
        chatSession._updateLockedResource(new jabberwerx.JID('foo@bar/resource1'));
        same(chatSession.jid.getResource(), 'resource1');
        chatSession._updateLockedResource(new jabberwerx.JID('foo@bar/resource2'));
        same(chatSession.jid.getResource(), 'resource2');
        chatSession._updateLockedResource(new jabberwerx.JID('foo@bar'));
        ok(!chatSession.jid.getResource());
    });
    
    test('Test Update Resource Event', function() {
        var jid = null;
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar/resource1");
        chatSession.event('lockedResourceChanged').bind(function(eventObj) {
            jid = eventObj.data;
        });
        chatSession._updateLockedResource(new jabberwerx.JID('foo@bar/resource2'));
        same(jid.getResource(), 'resource2');
        jid = null;
        chatSession._updateLockedResource(new jabberwerx.JID('foo@bar/resource2'));
        ok(!jid);
    });
    
    test('Test Update Thread', function() {
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar", 'JW_12345');
        same(chatSession.thread, 'JW_12345');
        chatSession._updateThread('JW_abcde');
        same(chatSession.thread, 'JW_abcde');
        chatSession._updateThread('');
        same(chatSession.thread, 'JW_abcde');
    });
    
    test('Test Thread Updated Event', function() {
        var jid = null;
        var threadVal = null;
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar", 'JW_12345');
        chatSession.event('threadUpdated').bind(function(eventObj) {
            jid = eventObj.data.jid;
            threadVal = eventObj.data.thread;
        });
        chatSession._updateThread('JW_abcde');
        equals(jid, 'foo@bar');
        same(threadVal, 'JW_abcde');
    });
    
    test("Test Generate Message [chatstates only]", function() {
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar", 'JW_12345');
        chatSession.controller = {sendChatStates: true};
        var msg;
        
        // until "first chat" is sent/received, no chatstate message generated
        msg = chatSession._generateMessage("active");
        ok(msg === null, "not message generated");
        
        // pretend the "first chat" happened
        chatSession._statesReady = true;
        msg = chatSession._generateMessage("active");
        ok(msg !== null, "message generated!");
        equals(msg.getType(), 'chat');
        equals(msg.getTo(), 'foo@bar');
        equals(jabberwerx.$("active[xmlns='http://jabber.org/protocol/chatstates']", msg.getDoc()).length,
            1, 'Should be one active chatstate in message');

        // don't want to generate messages with chat states
        chatSession.controller = {sendChatStates: false};
        
        msg = chatSession._generateMessage("active");
        ok(msg == null, "no message generated");
    });

    test('Test Generate Message [with body]', function() {
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar", 'JW_12345');
        chatSession.controller = {sendChatStates: true};
        var msg;
        
        // must be ready!
        chatSession._statesReady = true;
        msg = chatSession._generateMessage('active', 'Body of Message');
        equals(msg.getType(), 'chat');
        equals(msg.getTo(), 'foo@bar');
        equals(msg.getThread(), 'JW_12345');
        equals(msg.getBody(), 'Body of Message');
        equals(jabberwerx.$("active[xmlns='http://jabber.org/protocol/chatstates']", msg.getDoc()).length,
            1, 'Should be one active chatstate in message');
        
        msg = chatSession._generateMessage('gone');
        equals(msg.getType(), 'chat');
        equals(msg.getTo(), 'foo@bar');
        ok(!msg.getBody(), 'Should be no message body');
        var blah = msg.getDoc();
        equals(jabberwerx.$("gone[xmlns='http://jabber.org/protocol/chatstates']", msg.getDoc()).length,
            1, 'Should be one gone chatstate in message');

        // don't want to generate messages with chat states
        chatSession.controller = {sendChatStates: false};
        
        msg = chatSession._generateMessage('active', 'Body of Message');
        equals(msg.getType(), 'chat');
        equals(msg.getTo(), 'foo@bar');
        equals(msg.getThread(), 'JW_12345');
        equals(msg.getBody(), 'Body of Message');
        equals(jQuery("active[xmlns='http://jabber.org/protocol/chatstates']", msg.getDoc()).length,
            0, 'Should be no chatstate in message');
    });
    
    test('Test Set Local State Property', function() {
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar", 'JW_12345');
        ok(chatSession._setChatStateProperty('paused'), 'Set chat state successfully');
        same(chatSession.localState, 'paused', 'Set chat state successfully');
        ok(!chatSession._setChatStateProperty('paused'), 'Tried to set chat state to the same state as it already was');
        try {
            chatSession._setChatStateProperty('unsupported');
            ok(false, 'Error should have been thrown by now');
        } catch(e) {
            ok(e instanceof jabberwerx.ChatSession.StateNotSupportedError, 'Error should be an instance of StateNotSupportedError');
        }
    });
    
    test('Test Set Chat State Event Firing', function() {
        var jid, state;
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar", 'JW_12345');
        chatSession.event('chatStateChanged').bind(function(eventObj) {
            jid = eventObj.data.jid;
            state = eventObj.data.state;
        });
        ok(chatSession._setChatStateProperty('paused'), 'Set chat state successfully');
        same(state, 'paused', 'Set chat state successfully');
    });
    
    test("Test Remote State Changed Handler", function() {
        var jid, state;
        var chatSession = new jabberwerx.ChatSession(client, "foo@bar", 'JW_12345');
        chatSession._updateLockedResource(new jabberwerx.JID('foo@bar/resource1'));
        chatSession.event('chatStateChanged').bind(function(eventObj) {
            jid = eventObj.data.jid;
            state = eventObj.data.state;
        });
        var msg = new jabberwerx.Message();
        msg.setFrom("foo@bar/resource1");
        var builder = new jabberwerx.NodeBuilder(msg.getNode());
        builder.element("{http://jabber.org/protocol/chatstates}gone");
        var evtObj = {selected: {nodeName: "gone"}, data: msg};
        chatSession._remoteStateChangedHandler(evtObj);
        equals(jid, "foo@bar/resource1", "Jid set successfully");
        same(state, "gone", "Set chat state successfully");
        ok(!chatSession.jid.getResource(), "Resource unlocked sucessfully");
        ok(chatSession.thread != "JW_12345", "New thread id");
    });
});
