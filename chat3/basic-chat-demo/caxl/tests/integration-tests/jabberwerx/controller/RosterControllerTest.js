jabberwerx.$(document).ready( function() {
    var client;
    var rosterController;
    var rosterController2;

    var onClientError = function(err) {
        alert("Authentication error: " + err.xml);
        ok(false, "could not authenticate client");
    }
    var onConnected = function() {
        start();
    }

    module("jabberwerx/controller/rostercontroller", {
        setup: function() {
            var resource = 'testclient';
            client = new jabberwerx.Client(resource);

            var userJID = new jabberwerx.JID(testUserJID(1));

            var args = {
                httpBindingURL: defaults.httpBindingURL,
                successCallback: onConnected,
                errorCallback: onClientError
            };

            client.connect(userJID, defaults.password, args);
            stop();
        },

        teardown: function() {
            client.disconnect();
            delete client;
        }
    });

    function onFetch(error) {
        ok(this instanceof jabberwerx.RosterController, 'this is a reference to the RosterController');

        var contacts = client.entitySet.toArray();
        var noContacts = true;

        jabberwerx.$.each(contacts, function() {
            var contact = this;
            if (contact instanceof jabberwerx.RosterContact) {
                ok(true, 'Contact JID: ' + this.jid + ' , Contact Name: ' + jabberwerx.$(this.getItemNode()).attr('name'));

                var groups = jabberwerx.$('group', this.getItemNode());
                jabberwerx.$.each(groups, function() {
                    ok(true, 'Group : ' + this.firstChild.nodeValue);
                });
                noContacts = false;
            }
        });
        if (noContacts) {
            ok(true, 'No contacts');
        }
        start();
    }

    function onContactAdded(error) {
        equals(error, undefined, 'The error stanza is undefined');
        start();
    }

    function onContactDeleted(error) {
        equals(error, undefined, 'The error stanza is undefined');
        start();
    }

    test("Test fetch roster success", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(onFetch);
        stop();
    });

    test("Test RosterController with null client", function() {
        var caught;
        try {
            rosterController = new jabberwerx.RosterController(null);
            caught = false;
        } catch (ex) {
            ok(ex instanceof TypeError, "thrown exception is TypeError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test fetch roster with non-connected client", function() {
        var caught;
        try {
            var notConnectedClient = new jabberwerx.Client('notconnected');
            rosterController = new jabberwerx.RosterController(notConnectedClient);
            rosterController.fetch(onFetch);
            caught = false;
        } catch (ex) {
            ok(ex instanceof jabberwerx.Client.NotConnectedError, "thrown exception is jabberwerx.Client.NotConnectedError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test fetch roster with disconnected client", function() {
        var caught;
        try {
            client.disconnect();
            rosterController = new jabberwerx.RosterController(client);
            rosterController.fetch(onFetch);
            caught = false;
        } catch (ex) {
            ok(ex instanceof jabberwerx.Client.NotConnectedError, "thrown exception is jabberwerx.Client.NotConnectedError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test fetch roster with invalid param", function() {
        var caught;
        try {
            var param = 'abc';
            rosterController = new jabberwerx.RosterController(client);
            rosterController.fetch(param);
            caught = false;
        } catch (ex) {
            ok(ex instanceof TypeError, "thrown exception is TypeError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test fetch roster with no callback", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch();
    });

    test("Test add contact success", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContact);
        stop();
    });

    function addContact() {
        this.addContact(
                defaults.userPrefix + "3@" + defaults.domain,
                'testname2',
                'testgroup',
                onContactAdded);
    }

    test("Test add contact with full JID", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithFullJID);
        stop();
    });

    function addContactWithFullJID() {
        this.addContact(
                defaults.userPrefix + "3@" + defaults.domain + "/testresource",
                'testname',
                'testgroup',
                onContactAdded);
    }

    test("Test add contact with multiple groups", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithManyGroups);
        stop();
    });

    function addContactWithManyGroups() {
        var groups = ['groupa', 'groupb', 'groupc'];
        this.addContact(
                defaults.userPrefix + "3@" + defaults.domain,
                'testname',
                groups,
                onContactAdded);
    }

    test("Test add contact with no groups", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithNoGroups);
        stop();
    });

    function addContactWithNoGroups() {
        this.addContact(
                defaults.userPrefix + "3@" + defaults.domain,
                'testname',
                null,
                onContactAdded);
    }

    test("Test add contact with no nickname", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithNoNickname);
        stop();
    });

    function addContactWithNoNickname() {
        this.addContact(
                defaults.userPrefix + "3@" + defaults.domain,
                null,
                'testgroup',
                onContactAdded);
    }

    test("Test add contact with JID object", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithJIDObject);
        stop();
    });

    function addContactWithJIDObject() {
        var jid = new jabberwerx.JID(defaults.userPrefix + "3@" + defaults.domain);
        this.addContact(jid, 'testname', 'testgroup', onContactAdded);
    }

    test("Test add contact with null JID", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithNullJID);
        stop();
    });

    function addContactWithNullJID() {
        start();
        var caught;
        try {
            this.addContact(null, 'testname', 'testgroup', onContactAdded);
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "thrown exception is jabberwerx.JID.InvalidJIDError");
        }
        ok(caught, "expected exception thrown");
    }

    test("Test add contact with empty JID", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithEmptyJID);
        stop();
    });

    function addContactWithEmptyJID() {
        start();
        var caught;
        try {
            this.addContact('', 'testname', 'testgroup', onContactAdded);
        } catch (ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "thrown exception is jabberwerx.JID.InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    }

    test("Test add contact with invalid callback", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.fetch(addContactWithInvalidCallback);
        stop();
    });

    function addContactWithInvalidCallback() {
        start();
        var caught;
        try {
            this.addContact(
                    defaults.userPrefix + "3@" + defaults.domain,
                    'testname',
                    'testgroup',
                    'badcallback');
            caught = false;
        } catch (ex) {
            ok(ex instanceof TypeError, "thrown exception is TypeError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    }

    test("Test delete contact success", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.deleteContact(
                defaults.userPrefix + "3@" + defaults.domain,
                onContactDeleted);
        stop();
    });

    test("Test delete contact with full JID", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.deleteContact(
                defaults.userPrefix + "3@" + defaults.domain + "/testresource",
                onContactDeleted);
        stop();
    });

    test("Test delete contact with JID object", function() {
        rosterController = new jabberwerx.RosterController(client);
        var jid = new jabberwerx.JID(defaults.userPrefix + "3@" + defaults.domain);
        rosterController.deleteContact(jid, onContactDeleted);
        stop();
    });

    test("Test delete contact with null JID", function() {
        var caught;
        try {
            rosterController = new jabberwerx.RosterController(client);
            rosterController.deleteContact(null, onContactDeleted);
        } catch (ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "thrown exception is jabberwerx.JID.InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test delete contact with empty JID", function() {
        var caught;
        try {
            rosterController = new jabberwerx.RosterController(client);
            rosterController.deleteContact('', onContactDeleted);
        } catch (ex) {
            ok(ex instanceof jabberwerx.JID.InvalidJIDError, "thrown exception is jabberwerx.JID.InvalidJIDError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test delete contact with invalid callback", function() {
        var caught;
        try {
            rosterController = new jabberwerx.RosterController(client);
            rosterController.deleteContact(
                    defaults.userPrefix + "3@" + defaults.domain,
                    'badcallback');
            caught = false;
        } catch (ex) {
            ok(ex instanceof TypeError, "thrown exception is TypeError");
            caught = true;
        }
        ok(caught, "expected exception thrown");
    });

    test("Test delete contact with no callback", function() {
        rosterController = new jabberwerx.RosterController(client);
        rosterController.deleteContact(
                defaults.userPrefix + "3@" + defaults.domain);
    });

    test("Test Roster and EntityCache interactions", function() {
        var len = 0, startlen = 0;
        var mode = "fetch";

        var __toArray = function(eset, etype) {
            if (etype === undefined) {
                return eset.toArray();
            }
            var ret = [];
            eset.each(function (entity) {
                if (entity instanceof etype) {
                    ret.push(entity);
                }
            });
            return ret;
        }
        var batchHandler = function(evt) {
            len = __toArray(evt.source, jabberwerx.RosterContact).length;
            if (mode == "fetch") {
                ok(len != 0, len + " contacts after fetch");
                mode = "disconnected";
                client.disconnect();
            } else {
                ok(len == 0, len + " roster contacts after disconnect");
                len = __toArray(client.entitySet).length;
                /* this is not true if disco or some other controller is present
                   will be addressed by multi-controller integration test
                ok(startlen == len, len + " total entities after disconnect");
                */
                start();
            }
        }

        client.entitySet.event("batchUpdateEnded").bind(batchHandler);
        startlen = __toArray(client.entitySet).length;
        ok(true,  startlen + " total entities to start");

        ok(__toArray(client.entitySet, jabberwerx.RosterContact).length == 0, len + " roster contacts to start");
        new jabberwerx.RosterController(client).fetch();
        stop();
    });
});
