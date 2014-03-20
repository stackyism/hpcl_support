/**
 * filename:        RendezvousTest.js
 * created at:      2011/04/04T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    // Beginning of Entity Unit Tests module 
    module("jabberwerx/model/rendezvous");

    var cbRendezvousFinished = function(ctx) {
        var rnzs = arguments.callee.rendezvousables || [];
        ok(rnzs.length > 0, "there are rendezvousables");
        for (var idx = 0; idx < rnzs.length; idx++) {
            ok(rnzs[idx].ready, "Rendezvousable " + rnzs[idx].name + " is ready");
        }
        ok(!ctx.isRunning(), "Rendezvous is NOT running");
        
        arguments.callee.triggered = true;
    };
    var cbRendezvousCheck = function() {
        ok(cbRendezvousFinished.triggered || false, "rendezvous callback triggered");

        start();
    };
    var MockRendezvousable = jabberwerx.JWModel.extend({
        init: function(name) {
            this._super();
            
            this.name = name;
            this.delay = Math.floor(Math.random() * 300) + 100;
        },
        startRendezvous: function(ctx) {
            this._super(ctx);
            ok(ctx instanceof jabberwerx.Rendezvous, "ctx is a jabberwerx.Rendezvous");
            ok(true, "Rendezvousable " + this.name + " will finish in " + this.delay + "ms");
            window.setTimeout(this.invocation("finishRendezvous"), this.delay);
            return true;
        },
        finishRendezvous: function() {
            this.ready = true;
            ok(true, "Rendezvousable " + this.name + " just finished");
            this._super();
        },
        
        ready: false
    }, "MockRendezvousable");
    MockRendezvousable.mixin(jabberwerx.Rendezvousable);
    
    test("test create", function() {
        var rendezvous;
        
        rendezvous = new jabberwerx.Rendezvous(cbRendezvousFinished);
        ok(true, "rendezvous create succeeded");
        ok(!rendezvous.isRunning(), "rendezvous is NOT running");
        
        var caught = false;
        try {
            rendezcous = new jabberwerx.Rendezvous(null);
        } catch (ex) {
            ok(ex instanceof TypeError, "error is TypeError");
            caught = true;
        }
        ok(caught, "expected error thrown (null)");
        try {
            rendezcous = new jabberwerx.Rendezvous();
        } catch (ex) {
            ok(ex instanceof TypeError, "error is TypeError");
            caught = true;
        }
        ok(caught, "expected error thrown (undefined)");

        try {
            rendezcous = new jabberwerx.Rendezvous("bogus");
        } catch (ex) {
            ok(ex instanceof TypeError, "error is TypeError");
            caught = true;
        }
        ok(caught, "expected error thrown (not function)");
    });
    test("test basics", function() {
        stop();
        
        var rendezvousables = [
            new MockRendezvousable("rendezvousable1"),
            new MockRendezvousable("rendezvousable2")
        ];
        cbRendezvousFinished.rendezvousables = rendezvousables;
        var ctx = new jabberwerx.Rendezvous(cbRendezvousFinished);
        
        for (var idx = 0; idx < rendezvousables.length; idx++) {
            var retval = ctx.start(rendezvousables[idx]);
            ok(retval, "Rendezvousable " + rendezvousables[idx].name + " started");
        }
        ok(ctx.isRunning(), "Rendezvous is running");
        setTimeout(cbRendezvousCheck, 500);

        expect(14);
    });
});