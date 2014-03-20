/**
 * filename:        JWCoreTest.js
 * created at:      2009/07/23T14:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
 
 /*
 * NOTE! this file must be saved as utf8, contains unicode character tests
 */
 
jabberwerx.$(document).ready(function() {
    module("jwapp/JWCore");
 
    test("test mixin", function() {
        var MockMixin = {
            propa: "property a",
            propb: "property b",
            methoda: function() {
                return "method a";
            },
            methodb: function() {
                return "method b";
            }
        };
        
        var MockType, inst;
        
        MockType = jabberwerx.JWBase.extend({
            init: function() {
                this._super();
            }
        }, "MockType");
        inst = new MockType();
        ok(MockType.mixin === jabberwerx.JWBase.mixin, "mixin class method present");
        ok(inst.propa === undefined, "property a not present");
        ok(inst.propb === undefined, "property b not present");
        ok(inst.methoda === undefined, "method a not present");
        ok(inst.methodb === undefined, "method b not present");
        
        MockType.mixin(MockMixin);
        inst = new MockType();
        ok(inst.propa !== undefined, "property a present");
        ok(inst.propa == "property a", "MockMixin's property a");
        ok(inst.propb !== undefined, "property b present");
        ok(inst.propb == "property b", "MockMixin's property b");
        ok(inst.methoda !== undefined, "method a present");
        ok(inst.methoda() == "method a", "MockMixin's method a");
        ok(inst.methodb !== undefined, "method b present");
        ok(inst.methodb() == "method b", "MockMixin's method b");
        
        MockType = jabberwerx.JWBase.extend({
            init: function() {
                this._super();
            },
            propa: "different property a",
            methoda: function() {
                return "different method a";
            }
        }, "MockType");
        inst = new MockType();
        ok(MockType.mixin === jabberwerx.JWBase.mixin, "mixin class method present");
        ok(inst.propa !== undefined, "property a present");
        ok(inst.propa == "different property a", "MockType's property");
        ok(inst.propb === undefined, "property b not present");
        ok(inst.methoda !== undefined, "method a present");
        ok(inst.methoda() == "different method a", "MockType's method");
        ok(inst.methodb === undefined, "method b not present");
        
        MockType.mixin(MockMixin);
        inst = new MockType();
        ok(inst.propa !== undefined, "property a present");
        ok(inst.propa == "different property a", "MockType's property a");
        ok(inst.propb !== undefined, "property b present");
        ok(inst.propb == "property b", "MockMixin's property b");
        ok(inst.methoda !== undefined, "method a present");
        ok(inst.methoda() == "different method a", "MockType's method a");
        ok(inst.methodb !== undefined, "method b present");
        ok(inst.methodb() == "method b", "MockMixin's method b");
        
        MockType = jabberwerx.JWBase.extend({
            init: function() {
                this._super();
            },
            propa: "different property a",
            methoda: function() {
                return "different for " + this._super();
            }
        }, "MockType");
        inst = new MockType();
        ok(MockType.mixin === jabberwerx.JWBase.mixin, "mixin class method present");
        ok(inst.propa !== undefined, "property a present");
        ok(inst.propa == "different property a", "MockType's property");
        ok(inst.propb === undefined, "property b not present");
        ok(inst.methoda !== undefined, "method a present");
        try {
            ok(inst.methoda() == "different method a", "MockType's method");
        } catch (ex) {
            ok(true, "expected error thrown");
        }
        ok(inst.methodb === undefined, "method b not present");
        
        MockType.mixin(MockMixin);
        inst = new MockType();
        ok(inst.propa !== undefined, "property a present");
        ok(inst.propa == "different property a", "MockType's property a");
        ok(inst.propb !== undefined, "property b present");
        ok(inst.propb == "property b", "MockMixin's property b");
        ok(inst.methoda !== undefined, "method a present");
        ok(inst.methoda() == "different for method a", "MockType's method a");
        ok(inst.methodb !== undefined, "method b present");
        ok(inst.methodb() == "method b", "MockMixin's method b");
    });
    
    test("Test intercept", function() {
        var MockInterceptorA = {
            prop: "MIA.prop",
            method: function() {return "MIA.method:" + this._super();}
        };
        var MockInterceptorB = {
            prop: "MIB.prop",
            method: function() {return "MIB.method:" + this._super();}
        };
        var MockInterceptorC = {
            method2: function() {return "MIC.method2";}
        }
        var MockBase = {
            prop: "MockBase.prop",
            method: function() {return "MockBase.method - " + this.prop;}
        };
        var MockExtenderA = {
            prop: "MEA.prop",
            method: function() {return "MEA.method:" + this._super();}
        };
        var MockExtenderB = {
            prop: "MEB.prop",
            method: function() {return "MEB.method:" + this._super();}
        };
        var MockBase = jabberwerx.JWModel.extend(MockBase, "MockBase");
        var ABase = MockBase.extend(MockExtenderA, "ABase");
        var BBase = MockBase.extend(MockExtenderB, "BBase");
        var BSubA = ABase.extend(MockExtenderB, "BSubA");
        var ASubB = BBase.extend(MockExtenderA, "ASubB");
        
        with (new ABase()) {
            equals(method(), "MEA.method:MockBase.method - MEA.prop");
        }
        with (new BBase()) {
            equals(method(), "MEB.method:MockBase.method - MEB.prop");
        }
        with (new BSubA()) {
            equals(method(), "MEB.method:MEA.method:MockBase.method - MEB.prop");
        }
        with (new ASubB()) {
            equals(method(), "MEA.method:MEB.method:MockBase.method - MEA.prop");
        }
        ABase.intercept(MockInterceptorA);
        with (new ABase()) {
            equals(method(), "MIA.method:MEA.method:MockBase.method - MIA.prop");
        }
        ABase.intercept(MockInterceptorB);
        with (new ABase()) {
           equals(method(), "MIB.method:MIA.method:MEA.method:MockBase.method - MIB.prop");
        }
        ABase.intercept(MockInterceptorC);
        with (new ABase()) {
           equals(method2(), "MIC.method2");
        }
        BSubA.intercept(MockInterceptorA);
        with (new BSubA()) {
            equals(method(), "MIA.method:MEB.method:MEA.method:MockBase.method - MIA.prop");
        }
        BSubA.intercept(MockInterceptorB);
        with (new BSubA()) {
            equals(method(), "MIB.method:MIA.method:MEB.method:MEA.method:MockBase.method - MIB.prop");
        } 
    });
    
    test("Unicode safe serialization obfuscation", function () {
        var testStr = "test encode";
        var eStr = jabberwerx.util.encodeSerialization(testStr);
        ok(eStr != testStr, "Encoded does not equal unencoded");
        eStr = jabberwerx.util.decodeSerialization(eStr);
        ok(eStr == testStr, "Decoded equals original string " + testStr);
        
        testStr = "räksmörgås";
        eStr = jabberwerx.util.encodeSerialization(testStr);
        ok(eStr != testStr, "Encoded does not equal unencoded");
        eStr = jabberwerx.util.decodeSerialization(eStr);
        ok(eStr == testStr, "Decoded equals original string " + testStr);   

        testStr = "'" + '"' + "&/@<>\ ";
        eStr = jabberwerx.util.encodeSerialization(testStr);
        ok(eStr != testStr, "Encoded does not equal unencoded");
        eStr = jabberwerx.util.decodeSerialization(eStr);
        ok(eStr == testStr, "Decoded equals original string " + testStr);   

        testStr = "";
        eStr = jabberwerx.util.encodeSerialization(testStr);
        ok(eStr == testStr, "Encoded empty str is empty");
        eStr = jabberwerx.util.decodeSerialization(eStr);
        ok(eStr == testStr, "Decoded empty str is empty" );           
    });
});

