
/*build/dist/VTG-CAXL-debug-8.6.1.28927/src/jabberwerx.cisco.js*/
/**
 * filename:        jabbwerwerx.cisco.js
 * created at:      2009/10/09T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
;(function() {
    var jabberwerx = window.jabberwerx;

    //if jw is not loaded yet or ui extensions have already been added, bail
    if (!jabberwerx) {
        throw new Error("jabberwerx not defined. jabbwerwerx.cisco extension could not load");
        return;
    }

    if ('cisco' in jabberwerx) {
        throw new Error("jabbwerwerx.cisco extension is already defined. Most likely a programatic error");
        return;
    }
	/**
	 * @namespace
	 * @description
	 * <p>Cisco AJAX XMPP Library is an easy to use, AJAX-based XMPP client. This namespace
	 * contains quick contacts subscription and controls.<p>
	 *
	 * ## Configuration
     * See {@link jabberwerx}
	 */
    jabberwerx.cisco = {
        /**
        * Cisco extensions version
        * @property {String} version
        */
    version: '8.6.1.28927',

        /**
         * Internal config settings.
         *
         * @private
         */
        _config: {},

        /**
         * if library needs to do something interesting on load
         *
         * @private
         */
        _init: function() {
            this._inited = true;
        }
    };

    /**
     * Adding table module to allowed XHTML
     */
    jabberwerx.$.extend(jabberwerx.xhtmlim.allowedTags,{
        caption:    ["style"],
        table:      ["style", "border", "cellpadding", "cellspacing", "frame", "summary", "width"],
        td:         ["style", "align", "char", "charoff", "valign", "abbr", "axis", "colspan", "headers", "rowspan", "scope"],
        th:         ["style", "abbr", "axis", "colspan", "headers", "rowspan", "scope"],
        tr:         ["style", "align", "char", "charoff", "valign"],
        col:        ["style", "align", "char", "charoff", "valign", "span", "width"],
        colgroup:   ["style", "align", "char", "charoff", "valign", "span", "width"],
        tbosy:      ["style", "align", "char", "charoff", "valign"],
        thead:      ["style", "align", "char", "charoff", "valign"],
        tfoot:      ["style", "align", "char", "charoff", "valign"]
    });

    jabberwerx.cisco._init();
    window.jabberwerx.cisco = jabberwerx.cisco;
})();

/*build/dist/VTG-CAXL-debug-8.6.1.28927/src/controller/QuickContactController.js*/
/**
 * filename:        QuickContactController.js
 * created at:      2009/10/08T00:00:00-12:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
 ;(function(){
    if (jabberwerx && jabberwerx.cisco) {
        jabberwerx.cisco.QuickContactController = jabberwerx.Controller.extend(/** @lends jabberwerx.cisco.QuickContactController.prototype */{
            /**
             * @class
             * <p>Quick contact Controller class is responsible for quick contact subscriptions/unsubscriptions.</p>
             * It is also registered to listen to temp presence pubsub notification events.
             * @description
             * <p>Creates a new QuickContactController with the given client.
             *
             * @param {jabberwerx.Client} client The owning client
             * @throws {TypeError} If {client} is not valid
             * @constructs jabberwerx.cisco.QuickContactController
             * @extends jabberwerx.Controller
             */
             init: function(client) {
                 this._super(client, "quickContact");
                 this.client.event('afterMessageReceived').bindWhen('message[type="headline"] event[xmlns="http://jabber.org/protocol/pubsub#event"] items[node="http://webex.com/connect/temp-presence"]>item>presence', this.invocation('_presenceReceived'));
                 this.client.event("clientStatusChanged").bind(this.invocation("_handleStatusChange"));
                 jabberwerx.globalEvents.bind("resourcePresenceChanged", this.invocation("_handleResourcePresenceUpdate"));
                 this.client.entitySet.event('entityUpdated').bind(this.invocation('_handleEntityUpdated'));
                 this.client.entitySet.event('entityRemoved').bind(this.invocation('_handleEntityRemoved'));
             },

            /**
             * Unbinds events and calls base class method.
             */
            destroy: function() {
                // teardown handlers
                var client = this.client;
                client.event("afterMessageReceived").unbind(
                        this.invocation("_presenceReceived"));
                client.event("clientStatusChanged").unbind(
                        this.invocation("_handleStatusChange"));
                jabberwerx.globalEvents.unbind("resourcePresenceChanged",
                        this.invocation("_handleResourcePresenceUpdate"));
                client.entitySet.event('entityUpdated').unbind(
                        this.invocation('_handleEntityUpdated'));
                client.entitySet.event('entityRemoved').unbind(
                        this.invocation('_handleEntityRemoved'));
                this._super();
            },

            /**
             * This function sends direct presence with caps containing
             * temp presence feautre to the given jid.
             * Returns false if already subscribed to the jid and true otherwise.
             * @param {JID} jid for which to subscribe to temp presence changes
             * @throws {TypeError}  If {entity} is RosterContact with status "both" or "to"
             * @returns {Boolean} <tt>true</tt> if successfully added, <tt>false</tt> if unsuccessful
             */
            subscribe: function(jid) {
                jid = jabberwerx.JID.asJID(jid).getBareJID();
                delete this._pendingSubs[jid.toString()]; //remove from pending subs as needed
                delete this._pendingUnsubs[jid.toString()]; //remove from pending unsubs as needed
                var entity = this.client.entitySet.entity(jid);
                if (    entity && entity instanceof(jabberwerx.RosterContact) &&
                        (entity.properties.subscription == "both" || entity.properties.subscription == "to")) {
                    throw new TypeError("Can't add roster contact as a quick contact.");
                }
                if (!entity || (entity instanceof jabberwerx.TemporaryEntity)) {
                    var quick = new jabberwerx.cisco.QuickContact(jid, this);
                    if (entity) {
                        quick.apply(entity);
                        entity.remove();
                        entity = quick;
                    }
                    entity = quick;
                    entity.properties.temp_sub = true;
                    this.client.entitySet.register(entity);
                } else {
                    entity.properties.temp_sub = true;
                    this.client.entitySet.event("entityUpdated").trigger(entity);
                }
                // Insert an unavailable presence object into the presence list if it's empty
                if (!entity.getPrimaryPresence()) {
                    var pres = new jabberwerx.Presence();
                    pres.setFrom(entity.jid);
                    pres.setType("unavailable");
                    entity.updatePresence(pres);
                }
                var retVal = this.client.controllers.capabilities.addFeatureToJid(jid,'http://webex.com/connect/temp-presence+notify');

                return retVal;
            },
            /**
             * Temp subscribe to multiple contacts. Send a temp subscription to each
             * jid in the given list. JIDS already subscribed to are ignored. Any
             * errors encountered while subscribing (ie an invalid jid) are logged
             * but otherwise ignored.
             *
             * None of the jids in the given list is guarenteed to be subscribed
             * when this method returns. Subscription operations occur on a
             * work queue {@see #subscriptionInterval} {@see #subscriptionSlice},
             * whose execution will occur sometime after this method returns.
             *
             * An optional reset parameter will unsubscribe from all temp subscriptions
             * in the entity cache before adding new subscriptions. Existing temp
             * subs that are in the given list are not removed or resubscribed.
             *
             * @param {[jabberwerx.JID|String]} jids List of jids or JID strings
             *                                  to subscribe. May be an empty array.
             * @param {Boolean} [reset] Unsubscribe from all temp subs currently in the
             *                          entity cache before subscribing to jids. Default is
             *                          false, no unsubscriptions are performed.
             * @throws TypeError if jids is not an array.
             */
            subscribeAll: function(jids, reset) {
                if (!jabberwerx.util.isArray(jids)) {
                    throw new TypeError("jids must be an array");
                }
                if ((reset !== undefined) && reset) {
                    var that = this;
                    //add all current temp_subs in entity cache to (deduped)
                    //_pendingUnsub map
                    jabberwerx.$.each(this.client.entitySet.toArray(), function() {
                        if ((this.properties.temp_sub !== undefined) &&
                            (!that._pendingUnsubs.hasOwnProperty(this.jid))) {
                                that._pendingUnsubs[this.jid] = true;
                        }
                    });
                }
                for (var i = 0; i < jids.length; ++i) {
                    try {
                        var tjid = jabberwerx.JID.asJID(jids[i]).getBareJIDString();
                    } catch (ex) {
                        //bad jid, log (warn) and skip
                        jabberwerx.util.debug.warn("Skipping " + jids[i] + ", could not parse JID");
                        continue;
                    }
                    if (this._pendingUnsubs.hasOwnProperty(tjid)) {
                        delete this._pendingUnsubs[tjid];
                    }
                    var entity = this.client.entitySet.entity(tjid);
                    if (entity && (entity.properties.temp_sub !== undefined)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", already a quick contact","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    if (this._pendingSubs.hasOwnProperty(tjid)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", already in pending subscriptions","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    this._pendingSubs[tjid] = true;
                }
                if (!this._pendingTimer) {
                    this._processPending(); //process the first slice, sets timer as needed
                } //else list processing will resume with next timer exec
            },
            /**
             * This function removes temp presence feature for the given jid.
             * and sends direct presence stanza to the jid.
             * Returns false if not currently subscribed to the temp presence
             * from jid and true otherwise.
             * @param {JID} jid for which to subscribe to temp presence changes
             * @returns {Boolean} <tt>true</tt> if successfully removed, <tt>false</tt> if unsuccessful
             */
            unsubscribe: function(jid) {
                jid = jabberwerx.JID.asJID(jid).getBareJID();
                delete this._pendingUnsubs[jid.toString()]; //delete from pending unsubs as needed
                delete this._pendingSubs[jid.toString()]; //delete from pending subs as needed
                var retVal = this.client.controllers.capabilities.removeFeatureFromJid(jid,'http://webex.com/connect/temp-presence+notify');
                var ent = this.client.entitySet.entity(jid);
                if (ent) {
                    if (ent instanceof jabberwerx.cisco.QuickContact) {
                        ent.remove();
                    } else {
                        delete ent.properties.temp_sub;
                        // Clear their presence list if the entity is a RosterContact and in the
                        // "from" or "none" subscription state
                        if (ent.properties.subscription == "from" ||
                            ent.properties.subscription == "none") {
                            ent.updatePresence(null);
                        }
                        this.client.entitySet.event("entityUpdated").trigger(ent);
                    }
                }
                return retVal;
            },
            /**
             * Unsubscribe temp subscriptions for multiple contacts. Unsubscribe
             * from any temp subscriptions to the jids in the given list. If no
             * temp subscription exists for the jid it is ignored. Any
             * errors encountered while unsubscribing (ie an invalid jid) are
             * logged but otherwise ignored.
             *
             * None of the jids in the given list is guarenteed to be unsubscribed
             * when this method returns. Bulk Subscription operations occur on a
             * work queue {@see #subscriptionInterval} {@see #subscriptionSlice},
             * whose execution will occur sometime after this method returns.
             *
             * @param {[jabberwerx.JID|String]} jids List of bare JIDs or
             *                                  JID Strings to unsubscribe.
             *                                  May be an empty array.
             * @throws TypeError if jids is not an array.
             */
            unsubscribeAll: function(jids) {
                if (!jabberwerx.util.isArray(jids)) {
                    throw new TypeError("jids must be an array");
                }
                for (var i = 0; i < jids.length; ++i) {
                    try {
                        var tjid = jabberwerx.JID.asJID(jids[i]).getBareJIDString();
                    } catch (ex) {
                        //bad jid, log (warn) and skip
                        jabberwerx.util.debug.warn("Skipping " + jids[i] + ", could not parse JID");
                        continue;
                    }
                    if (this._pendingSubs.hasOwnProperty(tjid)) {
                        delete this._pendingSubs[tjid];
                    }
                    var entity = this.client.entitySet.entity(tjid);
                    if (!entity || (entity.properties.temp_sub === undefined)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", not a quick contact","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    if (this._pendingUnsubs.hasOwnProperty(tjid)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", already in pending unsubs","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    this._pendingUnsubs[tjid] = true;
                }
                if (!this._pendingTimer) {
                    this._processPending(); //process the first slice, sets timer as needed
                } //else list processing will resume with next timer exec
            },
            /**
             * Deletes the given entity.
             * This method is invoked from {@link jabberwerx.Entity#remove} method.
             * @param {jabberwerx.cisco.QuickContact} entity The entity to delete
             * @throws {TypeError} If {entity} is not a Contact
             */
            removeEntity: function(entity) {
                if (!(entity && entity instanceof jabberwerx.cisco.QuickContact)) {
                    throw new TypeError("entity must be a quick contact");
                }

                var jid = entity.jid;
                entity.destroy();
                this.unsubscribe(jid);
            },
            /**
             * <p>Cleanup QuickContact entity on behalf of the client entity set
             * {@link jabberwerx.EntitySet}.</p>
             *
             * @param {jabberwerx.Entity} entity The entity to destroy
             */
            cleanupEntity: function(entity) {

                this.client.controllers.capabilities.removeFeatureFromJid(entity.jid,
                                                                          'http://webex.com/connect/temp-presence+notify');
                entity.remove();
            },

            /**
             * Handle custom serialization. Override base class to clear pending
             * work queue timer as needed. _pending queues are persisted automatically.
             */
            willBeSerialized: function () {
                if (this._pendingTimer !== undefined) {
                    clearInterval(this._pendingTimer);
                    delete this._pendingTimer;
                }
                this._super();
            },
            /**
             * Handle custom serialization. Override base class to start pending
             * work queue timer if a queue is not empty.
             */
            graphUnserialized: function () {
                this._super();
                this._checkTimer();
            },

            /**
             * Handles cleanup on disconnect. Removes temp-presence+notify features
             * from caps controller for all quick contacts, removes them from entity
             * cashe.
             * @private
             * @param {jabberwerx.EventObject} evt The event object.
             */
            _handleStatusChange: function(evt) {
                if (evt.data.next == jabberwerx.Client.status_disconnected) {
                    //clear pending subscription queues on disconnect
                    this._pendingSubs = {};
                    this._pendingUnsubs = {};
                    this._checkTimer();
                }
            },


            /**
             * This function is invoked when presence stanza for the quick contacts
             * is received. It extracts presence from message stanza and updates
             * it in the entity set.
             * @private
             * @return {Boolean}
             */
             _presenceReceived: function(eventObj) {
                var presence = jabberwerx.$(eventObj.selected);
                /*DEBUG-BEGIN*/
                jabberwerx.util.debug.log("Received temp presence notification.");
                /*DEBUG-END*/
                for (var i = 0 ; i < presence.length; i++) {
                    if (presence[i]) {
                        var prs = jabberwerx.Stanza.createWithNode(presence[i]);
                        var bareJidStr = prs.getFromJID().getBareJIDString();
                        var entity = this.client.entitySet.entity(bareJidStr);
                        if (!entity) {
                            entity = new jabberwerx.cisco.QuickContact(bareJidStr, this);
                            this.client.entitySet.register(entity);
                        }
                        entity.updatePresence(prs);
                    }
                }

                return true;
             },

            /**
             * Resubscribes to receive temp presence from roster contacts with subscription
             * not "both" and not "to" when one of the resources for the contact comes online.
             * @private
             * @return {Boolean}
             */
             _handleResourcePresenceUpdate: function(eventObj) {
                var presence = eventObj.data.presence;
                var nowAvailable = eventObj.data.nowAvailable;
                var jid =  eventObj.data.fullJid;
                var entity = this.client.entitySet.entity(jid.getBareJID());
                //If resource becomes available and it's a contact with not "both" and not "to"
                //subscription status, we need to resubscribe
                if (entity && entity instanceof(jabberwerx.RosterContact) &&
                    entity.properties.subscription != "both" &&
                    entity.properties.subscription != "to" &&
                    nowAvailable) {
                    var p = this.client.getCurrentPresence().clone();

                    var item = jabberwerx.$(p.getNode()).find("c[xmlns=http://jabber.org/protocol/caps]");
                    item.remove();


                    p.setTo(entity.jid.getBareJID());
                    this.client.sendStanza(p);
                }
                return false;
             },

            /**
             * Checks for entity cache updates for RosterContacts
             * @private
             * @return {Boolean}
             */
            _handleEntityUpdated: function(eventObj) {
                var entity = eventObj.data;
                if (entity.properties.temp_sub &&
                    entity instanceof jabberwerx.RosterContact) {

                    if (entity.properties.subscription == "both" ||
                        entity.properties.subscription == "to") {
                        this.unsubscribe(entity.jid);

                        //DEBUG-BEGIN
                        jabberwerx.util.debug.log("removing temp sub property from " + entity.jid);
                        //DEBUG-END
                    } else if (entity.properties.subscription == "from"){
                        this.client.controllers.capabilities.addFeatureToJid(entity.jid,'http://webex.com/connect/temp-presence+notify');
                        //DEBUG-BEGIN
                        jabberwerx.util.debug.log("resending temp-presence+notify caps to " + entity.jid);
                        //DEBUG-END
                    }
                }
                return false;
            },

            /**
             * Checks for entity cache removes for RosterContacts
             * @private
             * @return {Boolean}
             */
             _handleEntityRemoved: function(eventObj) {
                var entity = eventObj.data;
                if (entity.properties.temp_sub) {
                    if (    this.client.isConnected() &&
                            !(entity instanceof jabberwerx.cisco.QuickContact)) {
                        // retain!
                        var quick = new jabberwerx.cisco.QuickContact(entity.jid, this);
                        quick.apply(entity);
                        this.client.entitySet.register(quick);
                        this.subscribe(quick.jid);
                    } else if (!this.client.isConnected()) {
                        // needs to be cleaned up
                        this.unsubscribe(entity.jid);
                    }
                }

                return false;
             },

            /**
             * @private
             * pending queue timer function. Send up to subscriptionSlice subs
             * or unsubs. Queued subs are always given priority.
             * Generated exceptions or errors (sub/unsub return false) are
             * logged but otherwise ignored. Reschedules if a non empty queue
             * still exists after processing slice.
             */
            _processPending: function() {
                var that = this;
                var queues = [{queue: this._pendingSubs, func: "subscribe"},
                              {queue: this._pendingUnsubs, func: "unsubscribe"}];
                var currQueue = 0;
                var sliceCounter = 0;
                var totalSlices = Math.max(1, this.subscriptionSlice);
                while (sliceCounter < totalSlices && currQueue < queues.length) {
                    for (var oneJID in queues[currQueue].queue) {
                        if (queues[currQueue].queue.hasOwnProperty(oneJID)) {
                            try {
                                if (!this[queues[currQueue].func].apply(this, [oneJID])) {
                                    jabberwerx.util.debug.warn(jabberwerx._("{0}({1}) returned false", queues[currQueue].func, oneJID));
                                }
                            } catch (ex) {
                                jabberwerx.util.debug.warn(jabberwerx._("{0}({1}) threw exception: {2}", queues[currQueue].func, oneJID, ex.message));
                            }
                            if (++sliceCounter == totalSlices) {
                                break; //breaks all the way out
                            }
                        }
                    }
                    currQueue++;
                }
                delete this._pendingTimer;
                this._checkTimer();
            },
            /**
             * @private
             * Checks a given queue (map) to see if any instance property exists
             * returns true if the given object only contains prototype properties
             *
             */
            _isEmpty: function(queue) {
                for (var p in queue) {
                    if (queue.hasOwnProperty(p)) {
                        return false;
                    }
                }
                return true;
            },
            /**
             * @private
             * Set _pendingTimer if pending queues are not empty and a timer is not already running
             * Clear and delete timer as needed.
             */
            _checkTimer: function() {
                if (!this._isEmpty(this._pendingSubs) || !this._isEmpty(this._pendingUnsubs)) {
                    if (this._pendingTimer === undefined) {
                        var that = this;
                        var timerTime = Math.max(0, this.subscriptionInterval)*1000;
                        this._pendingTimer = setTimeout(function(){that._processPending();}, timerTime);
                    }
                } else if (this._pendingTimer) {
                    clearTimeout(this._pendingTimer);
                    delete this._pendingTimer;
                }
            },
            /**
             * @private
             * Map jid:true, subcribe queue
             */
            _pendingSubs: {},
            /**
             * @private
             * Map jid:true unsubscribe queue
             */
            _pendingUnsubs: {},
            /**
             * @private
             * Pending queue timer handle. property is undefined
             * when not executing or scheduled to execute.
             */
            _pendingTimer: undefined,

            /**
             * @property
             * @type Number
             *
             * The bulk subscription work queue timer interval.
             * The time in seconds between processing of batched subscribe and
             * unsubscribe operations in the pending work queues.
             *
             * For example the default value of
             * 0.5 means {@see #subscriptionSlice) subscribes/unsubscribes are
             * executed twice a second.
             *
             * Value should be in [0,1]. A value of <= 0 is treated as 0
             * and implies all pending subscription operations will be executed
             * (asynchronously) as soon as possible.
             */
            subscriptionInterval: 0.5,

            /**
             * @property
             * @type Integer
             *
             * The number of subscription operations performed during one
             * pending work queue timer execution.
             * This property defines the number of subscribes or
             * unsubscribes to be attempted during one timer
             * execution {@see #subscriptionInterval}.
             *
             * The value should be a positive integer. Values <= 0 are treated
             * as if they were == 1.
             */
            subscriptionSlice: 10

        }, "jabberwerx.cisco.QuickContactController");
     }
})();
/*build/dist/VTG-CAXL-debug-8.6.1.28927/src/model/QuickContact.js*/
/**
 * filename:        QuickContact.js
 * created at:      2009/10/09T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

if (jabberwerx && jabberwerx.cisco) {    
    jabberwerx.cisco.QuickContact = jabberwerx.Contact.extend(/** @lends jabberwerx.cisco.QuickContact.prototype */ {
        /**
         * @class
         * <p>QuickContact object which is temporary subscription contact. This object SHOULD NOT
         * be created directly. Instead, a subscription to a contact should be initiated using
         * {@link jabberwerx.cisco.QuickContactController#subscribe}. Upon receiving a
         * presence update for this temporarily subscribed to contact, a new QuickContact object
         * for this contact will be created.</p>
         *
         * @description
         * <p>Creates a new QuickContact with the given jid and QuickContacController.</p>
         *
         * @param   {jabberwerx.JID|String} jid A jid corresponding to the QuickContact been created.
         * @param   {jabberwerx.cisco.QuickContactController} quickContactCtrl The creating
         *          QuickContactController
         * @throws  {TypeError} If {quickContactCtrl} is not a valid QuickContactController
         * @constructs jabberwerx.cisco.QuickContact
         * @extends jabberwerx.Contact
         */
        init: function(jid, quickContactCtrl) {
            if (!(quickContactCtrl &&
                  quickContactCtrl instanceof jabberwerx.cisco.QuickContactController)) {
                throw new TypeError("quickContactCtrl must be provided and must be of type" +
                                    "jabberwerx.cisco.QuickContactController");
            }
            this._super(jid, quickContactCtrl);
            
            this.properties.temp_sub = true;
        },

        /**
         * @private
         * Implementation of the empty jabberwerx.Entity._handleUnavailable method.
         */
        _handleUnavailable: function(presence) {
            var pres = this.getPrimaryPresence();
            if (!pres) {
                this._insertPresence(presence);
            } else if (pres.getType() == "unavailable") {
                this._clearPresenceList();
                this._insertPresence(presence);
            }
        }
    }, 'jabberwerx.cisco.QuickContact');
}
