jabberwerx.$(document).ready( function() {
    var quickContactController;

    function _convertStringToNode(str) {
        return jabberwerx.util.unserializeXML(str);
    }

    module("jabberwerx.cisco/controller/quickcontactcontroller", {
        setup: function() {
            quickContactController = new jabberwerx.cisco.QuickContactController(new jabberwerx.Client());
        },

        teardown: function() {
            delete quickContactController;
        }
    });

    test("Test Quick Contact Presence Received", function() {
       //Create string for temp presence notifications
       var presenceReceived =  "<presence from='jwtest2@example.com/Jabber MomentIM' xml:lang='Default'><c hash='sha-1' node='http://jmomentim.jabber.com/caps' ver='7mB5mumoHZj/prTlMkvmtF8Z9gs=' xmlns='http://jabber.org/protocol/caps'/><show>dnd</show><priority>1</priority><x from='jwtest2@example.com/Jabber MomentIM' stamp='20091007T22:34:45' xmlns='jabber:x:delay'/></presence>";

       var prsNode = _convertStringToNode(presenceReceived);
       var prs = jabberwerx.Stanza.createWithNode(prsNode);
       var jid = prs.getFromJID().getBareJID();
       var eventObj = {selected: [prsNode]};
       //Verify return value
        ok(quickContactController._presenceReceived(eventObj), '_presenceReceived should return true');
       //Verify presence in entity cache
       var entity = quickContactController.client.entitySet.entity(jid);
       ok(entity, 'Presence for the jid is not found in the entity cache.');
       //Verify presence status for the resource
       ok((entity.getResourcePresence('Jabber MomentIM') && entity.getResourcePresence('Jabber MomentIM').getShow() == 'dnd'), 'Presence is not found for the jid resource.');
    });


    test("Test Multiple Quick Contacts Presence Received", function() {

       //Create string for temp presence notifications
       var presence1Received = "<presence from='jwtest2@example.com/Jabber MomentIM' xml:lang='Default'><c hash='sha-1' node='http://jmomentim.jabber.com/caps' ver='7mB5mumoHZj/prTlMkvmtF8Z9gs=' xmlns='http://jabber.org/protocol/caps'/><show>dnd</show><priority>1</priority><x from='jwtest2@example.com/Jabber MomentIM' stamp='20091007T22:34:45' xmlns='jabber:x:delay'/></presence>";
       var prs1Node = _convertStringToNode(presence1Received);
       var prs = jabberwerx.Stanza.createWithNode(prs1Node);
       var jid = prs.getFromJID().getBareJID();
       var presence2Received = "<presence from='jwtest2@example.com/sampleclient' xmlns='jabber:client'><c hash='sha-1' node='http://jabber.cisco.com/jabberwerx' ver='HzJpe2z7vvIUvRVLVEAbdoOHMS4=' xmlns='http://jabber.org/protocol/caps'/><x from='jwtest2@example.com/sampleclient' stamp='20091009T21:03:01' xmlns='jabber:x:delay'/></presence>";
       var prs2Node = _convertStringToNode(presence2Received);
       var eventObj = {selected: [prs1Node, prs2Node]};
       //Verify return value
        ok(quickContactController._presenceReceived(eventObj), '_presenceReceived should return true');
       //Verify presence in entity cache
       var entity = quickContactController.client.entitySet.entity(jid);
       ok(entity, 'Presence for the jid is not found in the entity cache.');
       //Verify presence status for the resource
       ok((entity.getResourcePresence('Jabber MomentIM') && entity.getResourcePresence('Jabber MomentIM').getShow() == 'dnd'), 'Presence is not found for the jid resource.');
       ok((entity.getResourcePresence('sampleclient') && entity.getResourcePresence('sampleclient')), 'Presence is not found for the jid resource.');
     });


    test("Test RosterContact updates", function() {
        var client = new jabberwerx.Client();
        var rosterCtrl = client.controllers.roster || new jabberwerx.RosterController(client);
        var quickCtrl = client.controllers.quickContact || new jabberwerx.cisco.QuickContactController(client);

        var rItem = _convertStringToNode("<item xmlns='jabber:iq:roster' jid='jwtest3@example.com' subscription='from'/>");
        var contact = new jabberwerx.RosterContact(rItem.cloneNode(true), rosterCtrl);

        // fake a quick contact
        contact.properties["temp_sub"] = true;
        var prs = new jabberwerx.Presence();
        prs.setFrom(contact.jid);
        contact.updatePresence(prs);

        ok(contact.getPrimaryPresence(), "contact does have primary presence");

        $(rItem).attr("name", "jay double-you test tres");
        new jabberwerx.NodeBuilder(rItem).
                       element("group").text("group one").parent.
                       element("group").text("group two").parent;
        contact.setItemNode(rItem.cloneNode(true));
        ok(contact.getPrimaryPresence(), "contact does have primary presence");

        // simulate promotion
        $(rItem).attr("subscription", "both");
        delete contact.properties["temp_sub"];
        contact.setItemNode(rItem.cloneNode(true));
        ok(contact.getPrimaryPresence(), "contact does have primary presence");

        $(rItem).attr("subscription", "from");
        contact.setItemNode(rItem.cloneNode(true));
        ok(!contact.getPrimaryPresence(), "contact does NOT have primary presence");
    });

    test("Test bulk subscription method parameter type checking", function() {
        var failed = false;
        var client = new jabberwerx.Client();
        var qc = new jabberwerx.cisco.QuickContactController(client);
        try {
            qc.subscribeAll();
        } catch (ex) {
            failed = (ex instanceof TypeError);
        }
        ok(failed, "subscribeAll TypeError thrown on undefined jid list");

        failed = false;
        try {
            qc.unsubscribeAll();
        } catch (ex) {
            failed = (ex instanceof TypeError);
        }
        ok(failed, "unsubscribeAll TypeError thrown on undefined jid list");
    });
});
