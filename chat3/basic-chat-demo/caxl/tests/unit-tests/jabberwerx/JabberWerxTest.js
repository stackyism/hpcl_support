/**
 * filename:        JabberWerxTest.js
 * created at:      2009/04/25T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {

    module("jabberwerx[core]");

    var __compareArrays = function(actual, expected) {
        equals(actual.length, expected.length);
        
        for (var idx in expected) {
            equals(actual[idx], expected[idx]);
        }
    };
    test("Test unique function", function() {
        var arr1 = [    "object one", "object one",
                        "object two",
                        "object three", "object three",
                        "object four"];
                        
        var arrExpected = ["object one", "object two", "object three", "object four"];
        var arrActual = jabberwerx.unique(arr1);
        ok(arr1 === arrActual);
        __compareArrays(arrActual, arrExpected);
    });
    test("Test reduce simple functionality", function() {
        var     obj = [1,2,3,4,5];
        var     result;
        
        result = jabberwerx.reduce(obj, function(item, value) {
            return (value) ? item + value : item;
        });
        
        equals(1 + 2 + 3 + 4 + 5, result, "test reduce result");
    });
    
    test("Test reduce bad functor", function() {
        var     caught = false;
        
        try {
            jabberwerx.reduce([1, 2, 3, 4, 5], caught);
            caught = false;
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "expected exception type thrown");
        }
        ok(caught, "expected exception thrown");
        
        try {
            jabberwerx.reduce([1, 2, 3, 4, 5], null);
            caught = false;
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "expected exception type thrown");
        }
        ok(caught, "expected exception thrown");
        
        try {
            jabberwerx.reduce([1, 2, 3, 4, 5]);
            caught = false;
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError, "expected exception type thrown");
        }
        ok(caught, "expected exception thrown");
    });
    
    test("Test reduce complex functionality", function() {
        var     obj = [];
        obj.push({
            name: 'test one',
            jid: 'test-01@example.com',
            groups: ['group 1', 'group 2']
        });
        obj.push({
            name: 'test two',
            jid: 'test-02@example.com',
            groups: ['group 2', 'group 3']
        });
        obj.push({
            name: 'test three',
            jid: 'test-03@example.com',
            groups: ['group 3']
        });
        obj.push({
            name: 'test four',
            jid: 'test-04@example.com',
            groups: ['group 1', 'group 2', 'group 3', 'group 4']
        });
    
        var     fn = function(item, value) {
            if (!value) {
                value = {};
            }
            
            jabberwerx.$.each(item.groups, function() {
                if (this in value) {
                    value[this].push(item);
                } else {
                    value[this] = [item];
                }
            });
            
            return value;
        };
        var     result = {'group 5' : []};
        result = jabberwerx.reduce(obj, fn, result);
        
        var     validate = function(name, expected, notexpected) {
            var     group = result[name];
            ok(group, "test existence of '" + name + "'");

            if (expected && expected.length) {
                for (var idx = 0; idx < expected.length; idx++) {
                    ok(jabberwerx.$.inArray(expected[idx], group) != -1,
                        "test presence of '" + expected[idx].name + "' in '" + name + "'");
                }
            }
            if (notexpected && notexpected.length) {
                for (var idx = 0; idx < notexpected.length; idx++) {
                    ok(jabberwerx.$.inArray(notexpected[idx], group) == -1,
                        "test lack of presence of '" + notexpected[idx].name + "' in '" + name + "'");
                }
            }
        };
        
        validate(   'group 1',
                    [obj[0], obj[3]],
                    [obj[1], obj[2]]);
        validate(   'group 2',
                    [obj[0], obj[1], obj[3]],
                    [obj[2]]);
        validate(   'group 3',
                    [obj[1], obj[2], obj[3]],
                    [obj[0]]);
        validate(   'group 4',
                    [obj[3]],
                    [obj[0], obj[1], obj[2]]);
        validate(   'group 5',
                    [],
                    obj);
    });
    
    test("Test Parsing Timestamps", function() {
        var ts = 1255555860000, result;
        
        result = jabberwerx.parseTimestamp("2009-10-15T03:31:00+06:00");
        equals(ts, result.getTime(), "parsed XEP-0082 date/time with positive offset");
        
        result = jabberwerx.parseTimestamp("2009-10-14T15:31:00-06:00");
        equals(ts, result.getTime(), "parsed XEP-0082 date/time with negative offset");
        
        result = jabberwerx.parseTimestamp("2009-10-14T21:31:00Z");
        equals(ts, result.getTime(), "parsed XEP-0082 date/time Zulu");
        
        result = jabberwerx.parseTimestamp("20091014T21:31:00");
        equals(ts, result.getTime(), "parsed legacy date/time");
        
        try {
            result = jabberwerx.parseTimestamp("Wed Oct 14 2009 15:31:00 GMT-06:00 (MST)");
            ok(false, "parsed unparsable timestamp");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown");
        }
    });
    
    test("Test Generating Timestamps", function() {
        var ts = 1255555860000, result;
        
        result = jabberwerx.generateTimestamp(new Date(ts));
        equals(result, "2009-10-14T21:31:00Z", "generated XEP-0082 date/time");
        
        result = jabberwerx.generateTimestamp(new Date(ts), false);
        equals(result, "2009-10-14T21:31:00Z", "generated XEP-0082 date/time");
        
        result = jabberwerx.generateTimestamp(new Date(ts), true);
        equals(result, "20091014T21:31:00", "generated legacy date/time");
        
        try {
            result = jabberwerx.generateTimestamp("blah");
            ok(false, "generated ungeneratable timestamp");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown");
        }
        
        try {
            result = jabberwerx.generateTimestamp("blah", false);
            ok(false, "generated ungeneratable timestamp");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown");
        }
        
        try {
            result = jabberwerx.generateTimestamp("blah", true);
            ok(false, "generated ungeneratable timestamp");
        } catch (ex) {
            ok(ex instanceof TypeError, "expected TypeError thrown");
        }
    });
    
});
