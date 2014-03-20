/**
 * filename:        MUCRoomTest.js
 * created at:      2009/06/05T14:47:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    var client = new jabberwerx.Client();
    var muc = new jabberwerx.MUCController(client);
    
    module("jabberwerx/model/mucroom");
    
    test("Test Create/Destroy", function() {
        var room ;
        
        room = new jabberwerx.MUCRoom("test-room@example.com", muc);
        ok(room.controller === muc, "MUC controller assigned");
        equals(room.jid, "test-room@example.com", "room JID");

        var caught;
        try {
            caught = false;
            room = new jabberwerx.MUCRoom("bad room@example.com", muc);
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.JID.InvalidJIDError,
               "error is jabberwerx.JID.InvalidJIDError");
        }
        ok(caught, "expected error thrown");
    });
    
    
    var room;
    
    module("jabberwerx/model/mucoccupant", {
        setup: function() {
            room = new jabberwerx.MUCRoom("test-room@example.com", muc);
        },
        teardown: function() {
            room.remove();
            delete room;
        }
    });
    
    test("Test Create/Destroy", function() {
        var occupant;
        
        var cb = function(evt) {
            arguments.callee.triggered = evt.name;
            ok(evt.source === room.occupants, "event source is room occupants cache");
            ok(evt.data instanceof jabberwerx.MUCOccupant, "event data is occupant");
        };
        
        room.occupants.event("entityCreated").bind(cb);
        room.occupants.event("entityDestroyed").bind(cb);
        
        delete cb.triggered;
        occupant = new jabberwerx.MUCOccupant(room, "nickname");
        equals(occupant.jid, "test-room@example.com/nickname");
        equals(occupant.getDisplayName(), occupant.jid.getResource());
        ok(occupant.room === room, "room is assigned");
        ok(room.occupants.entity(occupant.jid) === occupant,
                "occupant in room occupant set");
        equals(occupant.isMe(), false);
        equals(cb.triggered, "entitycreated", "event triggered");
        
        delete cb.triggered;
        occupant.destroy();
        equals(cb.triggered, "entitydestroyed", "event triggered");
        
        var caught;
        try {
            caught = false;
            occupant = new jabberwerx.MUCOccupant(null, "nickname");
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");

        try {
            caught = false;
            occupant = new jabberwerx.MUCOccupant(room, "");
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
        
        room.occupants.event("entityCreated").unbind(cb);
        room.occupants.event("entityDestroyed").unbind(cb);
    });
    
    module("jabberwerx/model/mucoccupantcache", {
        setup: function() {
            room = new jabberwerx.MUCRoom("test-room@example.com", muc);
        },
        teardown: function() {
            room.remove();
            delete room;
        }
    });
    
    test("Test Create/Destroy", function() {
        var cache = new jabberwerx.MUCOccupantCache(room);
        ok(cache.room === room, "room is assigned");
        
        var caught;
        try {
            caught = false;
            cache = new jabberwerx.MUCOccupantCache();
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
    });
    test("Test occupant lookup", function() {
        var cache = room.occupants;
        
        var occupant = new jabberwerx.MUCOccupant(room, "nickname");
        ok(cache.occupant("nickname") === occupant, "occupant found by nick");
        ok(cache.entity(occupant.jid) === occupant, "occupant found by room jid");
    });
    
    module("jabberwerx/model/MUCRoom/config", {
        setup: function() {           
            room = new jabberwerx.MUCRoom("test-room@conference.example.com", muc);
        },
        teardown: function() {
            room.remove();
            delete room;
        }
    });
    test("Test fetchConfig", function() {
        //"override" client sendIQ to immediately callback w/ currRetIQ
        var currRetIQ = null;
        
        var currIQType = "get";
        var currIQContent = new jabberwerx.NodeBuilder('{http://jabber.org/protocol/muc#owner}query').data;
        
        client.sendIq = function(type, to, content, callback, timeout) {
            ok(type == currIQType, "iq type: " + type);
            ok(room.jid.equals(to), "iq to: " + to.toString());
            ok(currIQContent.xml == content.xml, "iq content: " + content.xml);
            callback(currRetIQ);
        }
        try {
            room.fetchConfig();
            ok(false, "expected exception not thrown for no callback");        
        } catch (ex){
            ok(ex instanceof TypeError, "no callback exception");
        }
        try {
            room.fetchConfig({});
            ok(false, "expected exception not thrown for bad callback");        
        } catch (ex){
            ok(ex instanceof TypeError, "bad callback exception");
        }
        
        try {
            room.fetchConfig(function(err) {});
            ok(false, "expected exception not thrown for not in room exception");        
        } catch (ex){
            ok(ex instanceof jabberwerx.MUCRoom.RoomNotActiveError, "not active room exception");
        }
        //"adjust" room's state so we can continue testing
        room._state = "active";
        var cfg = null;

        //no form in result ==> ERR_SERVICE_UNAVAILABLE
        var xstr = 
            "<iq type='result'>" + 
                "<query xmlns='http://jabber.org/protocol/muc#owner'/>" +
            "</iq>";
        currRetIQ = jabberwerx.util.unserializeXML(xstr);            
        room.fetchConfig(function(cfgForm, err) {
            ok(!cfgForm && (err === jabberwerx.Stanza.ERR_SERVICE_UNAVAILABLE), "no form in result");
        });
            
        xstr =
            "<iq type='error'>" + 
                "<query xmlns='http://jabber.org/protocol/muc#owner'/>" +
                "<error type='auth'>" + 
                    "<forbidden xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>" + 
                "</error>" + 
            "</iq>";
        currRetIQ = jabberwerx.util.unserializeXML(xstr);
        room.fetchConfig(function(cfgForm, err) {
            ok(!cfgForm, "form is null on error iq");
            ok(err, "error node is not null on error iq");
            ok(err.type == "auth", "error iq type: " + err.type);
            ok(err.condition == "{urn:ietf:params:xml:ns:xmpp-stanzas}forbidden", "error iq condition: " + err.condition);
        });      
        var xform = 
            "<x xmlns='jabber:x:data' type='form'>" + 
                "<title>Configuration for darkcave Room</title>" +
                "<instructions>Complete this form to make changes to the configuration of your room.</instructions>" + 
                "<field type='hidden' var='FORM_TYPE'><value>http://jabber.org/protocol/muc#roomconfig</value></field>" + 
                "<field label='Natural-Language Room Name' type='text-single' var='muc#roomconfig_roomname'><value>A Dark Cave</value></field>" +
                "<field label='Short Description of Room' type='text-single' var='muc#roomconfig_roomdesc'><value>The place for all good witches!</value></field>" +
                "<field label='Enable Public Logging?' type='boolean' var='muc#roomconfig_enablelogging'><value>0</value></field>" +
                "<field label='Allow Occupants to Change Subject?' type='boolean' var='muc#roomconfig_changesubject'><value>0</value></field>" +
                "<field label='Allow Occupants to Invite Others?' type='boolean' var='muc#roomconfig_allowinvites'><value>0</value></field>" +
                "<field label='Maximum Number of Occupants' type='list-single' var='muc#roomconfig_maxusers'><value>10</value><option label='10'><value>10</value></option><option label='20'><value>20</value></option><option label='30'><value>30</value></option><option label='50'><value>50</value></option><option label='100'><value>100</value></option><option label='None'><value>none</value></option></field>" +
                "<field label='Roles for which Presence is Broadcast' type='list-multi' var='muc#roomconfig_presencebroadcast'><value>moderator</value><value>participant</value><value>visitor</value><option label='Moderator'><value>moderator</value></option><option label='Participant'><value>participant</value></option><option label='Visitor'><value>visitor</value></option></field>                  " +
                "<field label='Roles and Affiliations that May Retrieve Member List' type='list-multi' var='muc#roomconfig_getmemberlist'><value>moderator</value><value>participant</value><value>visitor</value><option label='Moderator'><value>moderator</value></option><option label='Participant'><value>participant</value></option><option label='Visitor'><value>visitor</value></option></field>" +
                "<field label='Make Room Publicly Searchable?' type='boolean' var='muc#roomconfig_publicroom'><value>0</value></field>" +
                "<field label='Make Room Persistent?' type='boolean' var='muc#roomconfig_persistentroom'><value>0</value></field>" +
                "<field label='Make Room Moderated?' type='boolean' var='muc#roomconfig_moderatedroom'><value>0</value></field>" +
                "<field label='Make Room Members Only?' type='boolean' var='muc#roomconfig_membersonly'><value>0</value></field>" +
                "<field label='Password Required for Entry?' type='boolean' var='muc#roomconfig_passwordprotectedroom'><value>1</value></field>" +
                "<field type='fixed'><value> If a password is required to enter this room, you must specify the password below. </value></field>" +
                "<field label='Password' type='text-private' var='muc#roomconfig_roomsecret'><value>cauldronburn</value></field>" +
                "<field label='Who May Discover Real JIDs?' type='list-single' var='muc#roomconfig_whois'><value>moderators</value><option label='Moderators Only'><value>moderators</value></option><option label='Anyone'><value>anyone</value></option></field>" +
                "<field type='fixed'><value> You may specify additional people who have administrative privileges in the room. Please provide one Jabber ID per line. </value></field>" +
                "<field label='Room Admins' type='jid-multi' var='muc#roomconfig_roomadmins'><value>wiccarocks@shakespeare.lit</value><value>hecate@shakespeare.lit</value></field>" +
                "<field type='fixed'><value> You may specify additional owners for this room. Please provide one Jabber ID per line. </value></field>" +
                "<field label='Room Owners' type='jid-multi' var='muc#roomconfig_roomowners'/>" +
            "</x>";
        xstr = 
            "<iq from='darkcave@chat.shakespeare.lit' id='config1' to='crone1@shakespeare.lit/desktop' type='result'>" +
                "<query xmlns='http://jabber.org/protocol/muc#owner'>" + 
                    xform + 
                "</query>" +
            "</iq>";
        currRetIQ = jabberwerx.util.unserializeXML(xstr);
        room.fetchConfig(function(cfgForm, err) {
            ok(cfgForm, "good iq result form: " + cfgForm);
            ok(!err, "good iq error node: " + err);            
        });      
    });

    test("Test applyConfig", function() {
        //"override" client sendIQ to immediately callback w/ currRetIQ
        var currRetIQ = null;
        //"adjust" room's state so we can continue testing
        room._state = "active";

        var sfrm = new jabberwerx.XDataForm("submit");
        var subIQContent = 
            new jabberwerx.NodeBuilder('{http://jabber.org/protocol/muc#owner}query').node(sfrm.getDOM().data).parent.data;        
        var cancelIQContent = new jabberwerx.NodeBuilder('{http://jabber.org/protocol/muc#owner}query').
            node(new jabberwerx.XDataForm("cancel").getDOM().data).parent.data;
        var currIQContent = cancelIQContent;
        var currIQType = "set";        
        client.sendIq = function(type, to, content, callback, timeout) {
            ok(type == currIQType, "iq type: " + type);
            ok(room.jid.equals(to), "iq to: " + to.toString());
            equals(currIQContent.xml, content.xml, "iq content");
            callback(currRetIQ);
        }
        try {
            room.applyConfig({});
            ok(false, "expected exception not thrown for bad form");        
        } catch (ex){
            ok(ex instanceof TypeError, "bad form exception");
        }
        try {
            room.applyConfig(null, {});
            ok(false, "expected exception not thrown for bad callback");        
        } catch (ex){
            ok(ex instanceof TypeError, "bad callback exception");
        }
        //canceled
        currRetIQ = jabberwerx.util.unserializeXML("<iq type='result'/>");
        currIQContent = cancelIQContent;
        room.applyConfig(null, function(err) {
            ok(!err, "canceled form");
        });
        currIQContent = subIQContent;
        room.applyConfig(sfrm, function(err) {
            ok(!err, "submitted form");
        });
        
        //bad options  ==> not-acceptable
        var xstr = 
            "<iq type='error'>" + 
                "<query xmlns='http://jabber.org/protocol/muc#owner'/>" +
                "<error type='modify'>" + 
                    "<not-acceptable xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>" + 
                "</error>" + 
            "</iq>";
        currRetIQ = jabberwerx.util.unserializeXML(xstr);            
        room.applyConfig(sfrm, function(err) {
            ok(err && (err.condition == "{urn:ietf:params:xml:ns:xmpp-stanzas}not-acceptable"), "bad form values: " + err.condition);
        });
    });
    
    module("jabberwerx/model/MUCRoom/enter", {
        setup: function() {           
            room = new jabberwerx.MUCRoom("r@c.e.c", muc);
        },
            
        teardown: function() {
            room.remove();
            delete room;
        }
    });
    
    test("Room.enter parameters", function() {
        try {
            room.enter();
            ok(false, "expected exception not thrown for no nickname");        
        } catch (ex){
            ok(ex instanceof TypeError, "no nickname exception");
        }        
        try {
            room.enter("");
            ok(false, "expected exception not thrown for empty nickname");        
        } catch (ex){
            ok(ex instanceof TypeError, "empty nickname exception");
        }        
        try {
            room.enter({});
            ok(false, "expected exception not thrown for bad nickname");        
        } catch (ex){
            ok(ex instanceof TypeError, "bad nickname exception");
        }
        try {
            room.enter("foo");
            ok(false, "expected exception not thrown for undefined callback");        
        } catch (ex){
            ok(ex instanceof jabberwerx.Client.NotConnectedError, "undefined callback");
        }
        try {
            room.enter("foo", {successCallback: {}});
            ok(false, "expected exception not thrown for bad callback (successCallback not a function)");        
        } catch (ex){
            ok(ex instanceof TypeError, "bad callback exception (successCallback not a function)");        
        }
        try {
            room.enter("foo", {successCallback: function() {}});
            ok(false, "expected exception not thrown for valid callback");        
        } catch (ex){
            ok(ex instanceof jabberwerx.Client.NotConnectedError, "defined callback");
        }
        //todo RoomActiveError
    });

    var enterPres = new jabberwerx.Presence(jabberwerx.util.unserializeXML(
        "<presence xmlns='jabber:client' from='j@e.c/bar' to='r@c.e.c/foo'>" + 
            "<x xmlns='http://jabber.org/protocol/muc'/>" + 
        "</presence>"));    
    var createdPres = new jabberwerx.Presence(jabberwerx.util.unserializeXML(
        "<presence type='' from='r@c.e.c/foo' to='j@e.c/bar'>" + 
            "<x xmlns='http://jabber.org/protocol/muc#user'>" + 
                "<item affiliation='owner' role='moderator'/>" + 
                "<status code='110'/>" + 
                "<status code='201'/>" + 
            "</x>" + 
        "</presence>"));    
    
    var subIQContent = new jabberwerx.NodeBuilder('{http://jabber.org/protocol/muc#owner}query').
                        node(new jabberwerx.XDataForm("submit").getDOM().data).parent.data;
    var cancelIQContent = new jabberwerx.NodeBuilder('{http://jabber.org/protocol/muc#owner}query').
                        node(new jabberwerx.XDataForm("cancel").getDOM().data).parent.data;
    var resIQ = jabberwerx.util.unserializeXML("<iq type='result'><query xmlns='http://jabber.org/protocol/muc#owner'/></iq>");    

    var exIQContent = subIQContent;
    var exCBIQ = resIQ;            
    
    var overrideClient = function() {        
        room.controller.client.isConnected = function(){return true};
        var me = new jabberwerx.Presence();
        me.setFrom("j@e.c/bar");
        room.controller.client.getCurrentPresence = function(){return me};         
        room.controller.client.sendStanza = 
            function(stanza){
                equals(stanza.xml(), enterPres.xml(), "sendStanza(stanza.xml)");
                room.controller.client.sendStanza = function(stanza){room._state = "offline"}; //annoying destruction issues
            };   
        room.controller.client.sendIq = function(type, to, content, callback, timeout) {
            ok(room.jid.equals(to), "sendIQ iq to: " + to.toString());
            equals(exIQContent.xml, content.xml, "sendIQ iq content");
            callback(exCBIQ);
        } 
        exCBIQ = resIQ;  
        exIQContent = subIQContent;        
    }

        
    test("Room.enter existing room", function() {
        var enteredPres = new jabberwerx.Presence(jabberwerx.util.unserializeXML(
            "<presence type='' from='r@c.e.c/foo' to='j@e.c/bar'>" + 
                "<x xmlns='http://jabber.org/protocol/muc#user'>" + 
                    "<item affiliation='admin' role='moderator'/>" + 
                    "<status code='110'/>" + 
                "</x>" + 
            "</presence>"));    
        overrideClient();
        equals(room._state, "offline", "room state");
        //fires sendstanza defined above
        var fcalled = false;
        room.enter("foo", {
            successCallback: function() {
                fcalled = true;
            }
        });
        equals(room._state, "initializing", "entering room state"); 
        //test entering a room while entering a room
        try {
            room.enter("foo");
            ok(false, "expected exception not thrown for double entry");              
        } catch (ex) {
             ok(ex instanceof jabberwerx.MUCRoom.RoomActiveError, "dopuble entry exception");          
        }
        room.updatePresence(enteredPres);//continue room entry
        equals(room._state, "active", "after enter room state"); 
        ok(fcalled, "success callback fired");
    });
    
    test("Room.enter fail to enter existing room", function() {
        var nickConflictPres = new jabberwerx.Presence(jabberwerx.util.unserializeXML(
            "<presence from='r@c.e.c' to='j@e.c/bar' type='error'>" + 
                "<x xmlns='http://jabber.org/protocol/muc'/>" + 
                "<error type='cancel'>" + 
                    "<conflict xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>" + 
                "</error>" + 
            "</presence>"));

        overrideClient();
        equals(room._state, "offline", "room state");
        //fires sendstanza defined above
        var fcalled = false;
        room.enter("foo", {
            errorCallback: function(err) {
                fcalled = true;
            }
        });
        equals(room._state, "initializing", "entering room state"); 
        room._handleRoomErrored({data:nickConflictPres});//fail room entry
        equals(room._state, "offline", "after failed enter room state"); 
        ok(fcalled, "error callback fired");
    });    

    test("create default config", function() {
        overrideClient();
        equals(room._state, "offline", "room state");
        
        var fcalled = false;
        room.enter("foo", function(err) {
            fcalled = Boolean(!err);
        });
        equals(room._state, "initializing", "room state");
        room.updatePresence(createdPres);
        ok(fcalled, "success callback fired");
        ok(room.isActive(), "room is active");
    });
    
    test("create user config", function() {
        overrideClient();
        equals(room._state, "offline", "room state");

        var fcalled = false;
        room.enter("foo", {
            successCallback: function() {
                fcalled = true;
            },
            configureCallback: function() {
                ok(true, "configure called");
                room.applyConfig(new jabberwerx.XDataForm("submit"));
            }
        });
        equals(room._state, "initializing", "room state");
        room.updatePresence(createdPres);
        ok(fcalled, "success callback fired");
        ok(room.isActive(), "room is active");
    });
    
    test("user cancels create", function() {
        overrideClient();
        equals(room._state, "offline", "room state");

        //enter ultimately calls sendStanza, sendIQ defined above
        exIQContent = cancelIQContent; //canceled form
        
        var fcalled = false;
        room.enter("foo", {
            successCallback: function() {
                ok(false, "success callback fired on cancel");
            },
            errorCallback: function(err, aborted) {
                ok(aborted, "errorCallback fired with aborted flag");
            },
            configureCallback: function() {
                ok(true, "configure called");
                room.applyConfig(new jabberwerx.XDataForm("cancel"));
            }
        });
        equals(room._state, "initializing", "room state");
        room.updatePresence(createdPres);
        ok(!fcalled, "successCallback & errorCallback not fired");
        ok(!room.isActive(), "room is not active");
    });    
    
    test("user submits invalid config", function() {
        overrideClient();
        equals(room._state, "offline", "room state");

        //bad options  ==> not-acceptable
        exCBIQ = jabberwerx.util.unserializeXML(
            "<iq type='error'>" + 
                "<query xmlns='http://jabber.org/protocol/muc#owner'/>" +
                "<error type='modify'>" + 
                    "<not-acceptable xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>" + 
                "</error>" + 
            "</iq>");
            
        var fcalled = false;
        var ccalled = false;
        room.enter("foo", {
            errorCallback: function(err, aborted) {
                ok(err && aborted, "Enter room aborted: " + err);
                fcalled = true;
            },
            configureCallback: function() {
                ok(true, "configure called");
                room.applyConfig(
                    new jabberwerx.XDataForm("submit"), 
                    function (err) {
                        ok(err, "applyConfig error");
                        exCBIQ = resIQ;
                        exIQContent = cancelIQContent;
                        room.applyConfig(
                            new jabberwerx.XDataForm("cancel"), 
                            function (err) {
                                ok(!err, "cancel callback fired with no error");
                                ccalled = true;
                            });
                    });
            }
        });
        equals(room._state, "initializing", "room state");
        room.updatePresence(createdPres);
        ok(fcalled, "enter error callback fired with aborted flag");
        ok(ccalled, "applyConfig callback fired on create cancel");
        ok(!room.isActive(), "room is not active");
    });    
    
});
