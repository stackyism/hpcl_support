/**
 * filename:        ControllerTest.js
 * created at:      2009/06/01T10:18:44-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/controller/controller");
    
    test("Test Create", function() {
        var client = new jabberwerx.Client();
        var ctrl;
        
        ctrl = new jabberwerx.Controller(client, "mock");
        same(ctrl.client, client, "client as expected");
        equals(ctrl.name, "mock", "name as expected");
        same(client.controllers["mock"], ctrl, "controller registered");
        
        var orig = ctrl;
        ctrl = new jabberwerx.Controller(client, "mock");
        same(ctrl.client, client, "client as expected");
        equals(ctrl.name, "mock", "name as expected");
        same(client.controllers["mock"], ctrl, "controller registered");
        ok(orig.client == undefined, "original controller destroyed");
        
        var caught;
        try {
            caught = false;
            ctrl = new jabberwerx.Controller();
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
        
        try {
            caught = false;
            ctrl = new jabberwerx.Controller(client);
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
         
        try {
            caught = false;
            ctrl = new jabberwerx.Controller(client, "");
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
        
        try {
            caught = false;
            ctrl = new jabberwerx.Controller(client, null);
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
       
        try {
            caught = false;
            ctrl = new jabberwerx.Controller("mock");
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
        
        try {
            caught = false;
            ctrl = new jabberwerx.Controller(null, "mock");
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
        
        try {
            caught = false;
            ctrl = new jabberwerx.Controller(undefined, "mock");
        } catch (ex) {
            caught = true;
        }
        ok(caught, "expected error thrown");
    });
});
