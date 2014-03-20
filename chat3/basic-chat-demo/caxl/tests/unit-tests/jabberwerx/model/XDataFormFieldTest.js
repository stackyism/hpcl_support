/**
 * filename:        XDataFormFieldTest.js
 * created at:      2009/05/01T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    // Beginning of XDataFormField Unit Tests module 
    module("jabberwerx/model/XDataFormField");
  
    test("Test Create Using DOM", function() {
        var fieldXml ="<field type='list-multi' label='What features will the bot support?' var='features'><option label='Contests'><value>contests</value></option><option label='News'><value>news</value></option><option label='Polls'><value>polls</value></option><option label='Reminders'><value>reminders</value></option><option label='Search'><value>search</value></option><value>news</value><value>search</value><desc>Tell all your friends about your new bot!</desc></field>";
        var fieldDOM = jabberwerx.util.unserializeXMLDoc(fieldXml);
        var fieldElem = jabberwerx.$(fieldDOM).find("field")[0];
        var field = new jabberwerx.XDataFormField(null, null, fieldElem); 
        
        same(field.getVar(), "features", "XDataFormField var matches");
        same(field.getType(), "list-multi", "XDataFormField type matches");
        same(field.getLabel(), "What features will the bot support?", "XDataFormField label matches");
        same(field.getDesc(), "Tell all your friends about your new bot!", "XDataFormField label matches");
        same(field.getValues(), ["news","search"], "Values arrays are equal");
        same(field.getOptions(), [{label: "Contests", value: "contests"}, 
                                  {label: "News", value: "news"},
                                  {label: "Polls", value: "polls"},
                                  {label: "Reminders", value: "reminders"},
                                  {label: "Search", value: "search"}],
                                   "Options arrays are equal");
                                          
        ok(!field.getRequired(), "XDataFormField required flag matches");
                                           
   
    });
    
    test("Test Create Using name and value", function() {
        var field = new jabberwerx.XDataFormField("open-membership", ["1"]); 
        
        same(field.getVar(), "open-membership", "XDataFormField var matches");
        same(field.getValues(), ["1"], "XDataFormField values matches");
    });
    
    test("Test Create Using no params", function() {
        var field; 
        var caught = false;
        try {
            field = new jabberwerx.XDataFormField(null, null, null); 
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError,
               "error is TypeError");
        }
        ok(caught, "expected error thrown");        
    });      

    test("Test setters and getters", function() {
        var field = new jabberwerx.XDataFormField("invite-role"); 
        //Var setters and getters
        same(field.getVar(), "invite-role", "XDataFormField var matches");
        field.setVar("changeMe");
        same(field.getVar(), "changeMe", "XDataFormField var matches");
        //Values setters and getters
        field.setValues(["visitor", "participants"]);
        same(field.getValues(), ["visitor", "participants"], "XDataFormField values match");
        //Type setters and getters
        field.setType("list-single");
        same(field.getType(), "list-single", "XDataFormField type matches");
        //Description setters and getters
        field.setDesc("Short description");
        same(field.getDesc(), "Short description", "XDataFormField description matches"); 
        //Label setters and getters
        field.setLabel("Some label");
        same(field.getLabel(), "Some label", "XDataFormField label matches");
        //Option setters and getters         
        field.setOptions([{label: "option1", value: "opt1"}, {label: "option2", value: "opt2"}]);
        same(field.getOptions(), [{label: "option1", value: "opt1"}, {label: "option2", value: "opt2"}], "XDataFormField options match");   
        //Required setters and getters     
        field.setRequired("true");
        ok(field.getRequired(), "XDataFormField required flag matches");                
    });

    test("Test duplicate entries in jid-multi", function() {
        var field = new jabberwerx.XDataFormField("invites", ["1@test.com", "2@test.com", "1@test.com", "2@test.com"]); 
        field.setType("jid-multi");
        var caught = false;
        try {
            field.validate();
        } catch (ex) {
            caught = true;
        }
        ok(!caught, "unexpected exception");           
        same(field.getVar(), "invites", "XDataFormField var matches");
        same(field.getValues(), ["1@test.com", "2@test.com"], "duplicates eliminated");
  
    });  
    
});
