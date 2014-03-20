/**
 * filename:        TranslatorTest.js
 * created at:      2010/04/28T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */

jabberwerx.$(document).ready(function() {
    module("jabberwerx/model/translator");
    
    test("Test identity mappings", function() {
        var l10n = new jabberwerx.Translator();
        
        equals(l10n.format("this is the text"), "this is the text");
    });
    test("Test parameterized mappings", function() {
        var l10n = new jabberwerx.Translator();
        
        equals(l10n.format("this is {0} text", "parameterized"), "this is parameterized text");
        equals(l10n.format("this is {0} text {1}", "parameterized", "testing"), "this is parameterized text testing");
        equals(l10n.format("this {0} is {0} text", "parameterized"), "this parameterized is parameterized text");

        equals(l10n.format("this is {0} text"), "this is {0} text");
        equals(l10n.format("this is {0} text {1}"), "this is {0} text {1}");
        equals(l10n.format("this is {0} text {1}", "parameterized"), "this is parameterized text {1}");
        equals(l10n.format("this {0} is {0} text"), "this {0} is {0} text");
    });
    test("Test add/remove translations", function() {
        var l10n = new jabberwerx.Translator();
        
        equals(l10n.format("this is the text"), "this is the text");
        
        l10n.addTranslation("this is the text", "this is THE text");
        equals(l10n.format("this is the text"), "this is THE text");
        
        l10n.addTranslation("this is the text", "7h1s 15 teh tXt");
        equals(l10n.format("this is the text"), "7h1s 15 teh tXt");
        
        l10n.removeTranslation("this is the text");
        equals(l10n.format("this is the text"), "this is the text");
        
        var caught;
        try {
            caught = false;
            l10n.addTranslation(null, "this is bogus");
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.addTranslation("", "this is bogus");
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.addTranslation(1, "this is bogus");
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.addTranslation("bogus key", null);
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.addTranslation("bogus key", "");
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.addTranslation("bogus key", 1);
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.removeTranslation(null);
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.removeTranslation("");
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");

        try {
            caught = false;
            l10n.removeTranslation(1);
        } catch (ex) {
            caught = (ex instanceof TypeError);
        }
        ok(caught, "expected TypeError caught");
    });
    test("Test loading", function() {
        //insert a <link type='text/javascript' rel='translation' href='jabberwerx/model/TranslatorData.en_US.js' xml:lang='en-US'/>
        jabberwerx.$("<link />").
                   attr("type", "text/javascript").
                   attr("rel", "translation").
                   attr("href", "jabberwerx/model/TranslatorData.en_US.js").
                   attr("xml:lang", "en-US").
                   appendTo("head");
        //insert a <link type='text/javascript' rel='translation' href='jabberwerx/model/TranslatorData.en.js' xml:lang='en'/>
        jabberwerx.$("<link />").
                   attr("type", "text/javascript").
                   attr("rel", "translation").
                   attr("href", "jabberwerx/model/TranslatorData.en.js").
                   attr("xml:lang", "en").
                   appendTo("head");
        //insert a <link type='text/javascript' rel='translation' href='jabberwerx/model/TranslatorData.es.js' xml:lang='es'/>
        jabberwerx.$("<link />").
                   attr("type", "text/javascript").
                   attr("rel", "translation").
                   attr("href", "jabberwerx/model/TranslatorData.es.js").
                   attr("xml:lang", "es").
                   appendTo("head");
        
        var l10n = new jabberwerx.Translator();
        same(l10n.locale, undefined, "test uninitialized locale");
        equals(l10n.format("test key one"), "test key one");
        equals(l10n.format("test {0} one", "parameter"), "test parameter one");
        equals(l10n.format("alternate key one"), "alternate key one");
        equals(l10n.format("alternate key two"), "alternate key two");
        equals(l10n.format("unmapped key"), "unmapped key");
        
        l10n.load("en-US");
        equals(l10n.locale, "en-US", "test explicit locale 'en-US' to 'en-US'");
        equals(l10n.format("test key one"), "This is test key one, YO!");
        equals(l10n.format("test {0} one", "parameter"), "This be parameter one, YO!");
        equals(l10n.format("alternate key one"), "alternate key one");
        equals(l10n.format("alternate key two"), "alternate key two");
        equals(l10n.format("unmapped key"), "unmapped key");
        
        l10n.load("en");
        equals(l10n.locale, "en", "test explicit locale 'en' to 'en'");
        equals(l10n.format("test key one"), "initialised to test key one");
        equals(l10n.format("test {0} one", "parameter"), "thar be the parameter one");
        equals(l10n.format("alternate key one"), "alternate key one");
        equals(l10n.format("alternate key two"), "alternate key two");
        equals(l10n.format("unmapped key"), "unmapped key");
        
        l10n.load("en-GB");
        equals(l10n.locale, "en-GB", "test explicit locale 'en-GB' to 'en-GB'");
        equals(l10n.format("test key one"), "initialised to test key one");
        equals(l10n.format("test {0} one", "parameter"), "thar be the parameter one");
        equals(l10n.format("alternate key one"), "alternate key one");
        equals(l10n.format("alternate key two"), "alternate key two");
        equals(l10n.format("unmapped key"), "unmapped key");
        
        l10n.load("es");
        equals(l10n.locale, "es", "test explicit locale 'es' to 'es'");
        equals(l10n.format("test key one"), "clave pruebar uno");
        equals(l10n.format("test {0} one", "parameter"), "parameter pruebar uno");
        equals(l10n.format("alternate key one"), "alternate key one");
        equals(l10n.format("alternate key two"), "alternate key two");
        equals(l10n.format("unmapped key"), "unmapped key");
        
        //insert a <link type='text/javascript' rel='translation' href='jabberwerx/model/TranslatorData2.en_US.js' xml:lang='en-US'/>
        jabberwerx.$("<link />").
                   attr("type", "text/javascript").
                   attr("rel", "translation").
                   attr("href", "jabberwerx/model/TranslatorData2.en_US.js").
                   attr("xml:lang", "en-US").
                   insertAfter("link[href$='TranslatorData.en_US.js']");
        //insert a <link type='text/javascript' rel='translation' href='jabberwerx/model/TranslatorData2.en.js' xml:lang='en'/>
        jabberwerx.$("<link />").
                   attr("type", "text/javascript").
                   attr("rel", "translation").
                   attr("href", "jabberwerx/model/TranslatorData2.en.js").
                   attr("xml:lang", "en").
                   insertAfter("link[href$='TranslatorData.en.js']");
        
        l10n.load("en-US");
        equals(l10n.locale, "en-US", "test explicit locale 'en-US' to 'en-US'");
        equals(l10n.format("test key one"), "This is test key one, YO!");
        equals(l10n.format("test {0} one", "parameter"), "This be parameter one, YO!");
        equals(l10n.format("alternate key one"), "one alternate key");
        equals(l10n.format("alternate key two"), "key two alternate");
        equals(l10n.format("unmapped key"), "unmapped key");
        
        l10n.load("en");
        equals(l10n.locale, "en", "test explicit locale 'en' to 'en'");
        equals(l10n.format("test key one"), "initialised to test key one");
        equals(l10n.format("test {0} one", "parameter"), "thar be the parameter one");
        equals(l10n.format("alternate key one"), "alternate key one");
        equals(l10n.format("alternate key two"), "key two alternate");
        equals(l10n.format("unmapped key"), "unmapped key");
        
        var caught;
        try {
            caught = false;
            l10n.load("fr-CA");
        } catch (ex) {
            caught = (ex instanceof Error);
        }
        ok(caught, "expected error thrown");
        
        //insert a <link type='text/javascript' rel='translation' href='jabberwerx/model/TranslatorData.en.js'/>
        jabberwerx.$("<link />").
                   attr("type", "text/javascript").
                   attr("rel", "translation").
                   attr("href", "jabberwerx/model/TranslatorData.en.js").
                   appendTo("head");
        
        l10n.load("fr-CA");
        equals(l10n.locale, "fr-CA", "test explicit locale 'fr-CA' to 'fr-CA'");
        equals(l10n.format("test key one"), "initialised to test key one");
        equals(l10n.format("test {0} one", "parameter"), "thar be the parameter one");
        equals(l10n.format("unmapped key"), "unmapped key");

        l10n.load();
        ok(l10n.locale !== undefined, "test platform default locale");
    });
    test("Test global instance", function() {
        ok(jabberwerx.$.isFunction(jabberwerx._), "_() is defined");
        ok(jabberwerx.l10n instanceof jabberwerx.Translator, "global Translator instance");
        
        equals(jabberwerx._("this is the text"), "this is the text");
        equals(jabberwerx._("this is {0} text", "parameterized"), "this is parameterized text");
        equals(jabberwerx._("this is {0} text {1}", "parameterized", "testing"), "this is parameterized text testing");
        equals(jabberwerx._("this {0} is {0} text", "parameterized"), "this parameterized is parameterized text");
        equals(jabberwerx._("this is {0} text"), "this is {0} text");
        equals(jabberwerx._("this is {0} text {1}"), "this is {0} text {1}");
        equals(jabberwerx._("this is {0} text {1}", "parameterized"), "this is parameterized text {1}");
        equals(jabberwerx._("this {0} is {0} text"), "this {0} is {0} text");
    });
});
