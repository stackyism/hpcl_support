/**
 * filename:        XDataFormTest.js
 * created at:      2009/05/01T00:00:00-06:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    // Beginning of XDataForm Unit Tests module 
    module("jabberwerx/model/XDataForm");
  
    test("Test Create Using DOM", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><title>Bot Configuration</title><instructions>Fill out this form to configure your new bot!</instructions><field type='hidden' var='FORM_TYPE'><value>jabber:bot</value></field><field type='fixed'><value>Section 1: Bot Info</value></field><field type='text-single' label='The name of your bot' var='botname'/><field type='text-multi' label='Helpful description of your bot' var='description'/><field type='boolean' label='Public bot?' var='public'><required/></field><field type='text-private' label='Password for special access' var='password'/><field type='fixed'><value>Section 2: Features</value></field><field type='list-multi' label='What features will the bot support?' var='features'><option label='Contests'><value>contests</value></option><option label='News'><value>news</value></option><option label='Polls'><value>polls</value></option><option label='Reminders'><value>reminders</value></option><option label='Search'><value>search</value></option><value>news</value><value>search</value></field><field type='fixed'><value>Section 3: Subscriber List</value></field><field type='list-single' label='Maximum number of subscribers' var='maxsubs'><value>20</value><option label='10'><value>10</value></option><option label='20'><value>20</value></option><option label='30'><value>30</value></option><option label='50'><value>50</value></option><option label='100'><value>100</value></option><option label='None'><value>none</value></option></field><field type='fixed'><value>Section 4: Invitations</value><value>Section 5: test</value></field><field type='jid-multi' label='People to invite' var='invitelist'><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem); 
        same(form.getType(), "form", "XDataForm type matches");
        same(form.getTitle(), "Bot Configuration", "XDataForm title matches");
        same(form.getInstructions(), "Fill out this form to configure your new bot!", "XDataForm instruction match");        
        var fieldElems = jabberwerx.$(formDOM).find("field");
        var fields = [];
        jabberwerx.$.each(fieldElems, function() {
            field = new jabberwerx.XDataFormField(null, null, this);
            fields.push(field);      
        });
        for(var idx=0; idx<form.fields.length; idx++) {
            if (typeof form.fields[idx] == 'function') {
                 continue;  
            }  
            ok(form.fields[idx].equals(fields[idx]), "field " + form.fields[idx].getVar() + " matches");        
        }            
        
    });
    
   test("Test Create Using Form Type", function() {
        var field = new jabberwerx.XDataForm("form", null); 
        
        same(field.getType(), "form", "XDataForm type matches");
   });
   
   test("Test Create Using no params", function() {
        var form; 
        var caught = false;
        try {
            form = new jabberwerx.XDataForm({}, null); 
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError,
               "error is TypeError");
        }
        ok(caught, "expected error thrown");        
    });      
    
    test("Test setters and getters", function() {
        var form = new jabberwerx.XDataForm("form", null); 
        //Var setters and getters
        same(form.getType(), "form", "XDataForm type matches");
        //Title
        form.setTitle("Some title");
        same(form.getTitle(), "Some title", "XDataForm title matches");
        form.setInstructions("Some instructions");
        same(form.getInstructions(), "Some instructions", "XDataForm instructions match");
        var field1 = new jabberwerx.XDataFormField("var1", "value1"); 
        var field2 = new jabberwerx.XDataFormField("var2", "value2");
        var fields = [];
        form.addField(field1);
        fields.push(field1);
        form.addField(field2);        
        fields.push(field2); 
        for(var idx=0; idx<form.fields.length; idx++) {
            if (typeof form.fields[idx] == 'function') {
                 continue;  
            }           
            ok(form.fields[idx].equals(fields[idx]), "field " + form.fields[idx].getVar() + " matches");        
        }         
    });

   test("Test Submit Form method", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><title>Bot Configuration</title><instructions>Fill out this form to configure your new bot!</instructions><field type='hidden' var='FORM_TYPE'><value>jabber:bot</value></field><field type='fixed'><value>Section 1: Bot Info</value></field><field type='text-single' label='The name of your bot' var='botname'/><field type='text-multi' label='Helpful description of your bot' var='description'/><field type='boolean' label='Public bot?' var='public'><required/></field><field type='text-private' label='Password for special access' var='password'/><field type='fixed'><value>Section 2: Features</value></field><field type='list-multi' label='What features will the bot support?' var='features'><option label='Contests'><value>contests</value></option><option label='News'><value>news</value></option><option label='Polls'><value>polls</value></option><option label='Reminders'><value>reminders</value></option><option label='Search'><value>search</value></option><value>news</value><value>search</value></field><field type='fixed'><value>Section 3: Subscriber List</value></field><field type='list-single' label='Maximum number of subscribers' var='maxsubs'><value>20</value><option label='10'><value>10</value></option><option label='20'><value>20</value></option><option label='30'><value>30</value></option><option label='50'><value>50</value></option><option label='100'><value>100</value></option><option label='None'><value>none</value></option></field><field type='fixed'><value>Section 4: Invitations</value><value>Section 5: test</value></field><field type='jid-multi' label='People to invite' var='invitelist'><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem); 
        var submitFields = {
                             "botname": "abc",
                             "description":"long description", 
                             "public": "1",
                             "password": "456"
                             };
                             
        var submit = form.submit(submitFields); 
        var values;  
        for (var idx=0; idx<submitFields.length; idx++) { 
            values = [].concat(submitFields[idx]);       
            same(submit.getFieldByVar(idx).getValues(), values, "field " + submit.getFieldByVar(idx).getVar() + " value: " +submitFields[idx] + " matches");        
        }               
    }); 
    
   test("Test Cancel Form method", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><title>Bot Configuration</title><instructions>Fill out this form to configure your new bot!</instructions><field type='hidden' var='FORM_TYPE'><value>jabber:bot</value></field><field type='fixed'><value>Section 1: Bot Info</value></field><field type='text-single' label='The name of your bot' var='botname'/><field type='text-multi' label='Helpful description of your bot' var='description'/><field type='boolean' label='Public bot?' var='public'><required/></field><field type='text-private' label='Password for special access' var='password'/><field type='fixed'><value>Section 2: Features</value></field><field type='list-multi' label='What features will the bot support?' var='features'><option label='Contests'><value>contests</value></option><option label='News'><value>news</value></option><option label='Polls'><value>polls</value></option><option label='Reminders'><value>reminders</value></option><option label='Search'><value>search</value></option><value>news</value><value>search</value></field><field type='fixed'><value>Section 3: Subscriber List</value></field><field type='list-single' label='Maximum number of subscribers' var='maxsubs'><value>20</value><option label='10'><value>10</value></option><option label='20'><value>20</value></option><option label='30'><value>30</value></option><option label='50'><value>50</value></option><option label='100'><value>100</value></option><option label='None'><value>none</value></option></field><field type='fixed'><value>Section 4: Invitations</value><value>Section 5: test</value></field><field type='jid-multi' label='People to invite' var='invitelist'><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var cancel = form.cancel(); 
        same(cancel.getType(), "cancel", "XDataForm type matches");
        ok(!cancel.getTitle(), "XDataForm title is empty");
        ok(!cancel.getInstructions(), "XDataForm instructions is empty");
        ok(!cancel.fields.length, "XDataForm fields array is empty");
        ok(!cancel.items.length, "XDataForm items array is empty");
        ok(!cancel.reported.length, "XDataForm reported array is empty");
    });
    

   test("Test Reported Fields", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name' label='description' type='text-single'/></reported><item><field var='field-name'><value>field-value</value></field></item><item><field var='field-name'><value>field-value</value></field></item></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var fieldElems = jabberwerx.$(formElem).find("reported:first > field");
        var fields = [];
        jabberwerx.$.each(fieldElems, function() {
            field = new jabberwerx.XDataFormField(null, null, this);
            fields.push(field);      
        });
        
        for (var idx=0; idx<form.reported.length; idx++) { 
            ok(form.reported[idx].equals(fields[idx]), "field " + form.reported[idx].getVar() + " matches");        
        }   
        
    });
        
   test("Test Item Fields", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name' label='description' type='text-single'/></reported><item><field var='field-name'><value>field-value</value></field></item><item><field var='field-name'><value>field-value</value></field></item></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var itemsElems = jabberwerx.$(formElem).find("item"); 
        var item;
        var items = [];
               
        jabberwerx.$.each(itemsElems, function() {
            item = new jabberwerx.XDataFormItem(this);
            items.push(item);      
        });
       
        jabberwerx.$.each(items, function() {
            var item = this;
            jabberwerx.$.each(form.reported, function() {
                var field = item.getFieldByVar(this.getVar());
                field.setType(this.getType());
                field.setOptions(this.getOptions());
                field.setDesc(this.getDesc());
           });
        });       
        ok(form.items.length == items.length, " items array sizes match"); 
        for (var idx=0; idx<form.items.length; idx++) {  
            ok(form.items[idx].equals(items[idx]), "item " + idx + " matches");        
        }   
    });
    
   test("Test Item with multiple Fields", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name1' label='description1' type='text-single'/><field var='field-name2' label='description2' type='text-single'/></reported><item><field var='field-name1'><value>field-value11</value></field><field var='field-name2'><value>field-value12</value></field></item><item><field var='field-name1'><value>field-value21</value></field><field var='field-name2'><value>field-value22</value></field></item><item><field var='field-name1'><value>field-value31</value></field><field var='field-name2'><value>field-value32</value></field></item></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var itemsElems = jabberwerx.$(formElem).find("item"); 
        var item;
        var items = [];
               
        jabberwerx.$.each(itemsElems, function() {
            item = new jabberwerx.XDataFormItem(this);
            items.push(item);      
        });
   
        jabberwerx.$.each(items, function() {
            var item = this;
            jabberwerx.$.each(form.reported, function() {
                var field = item.getFieldByVar(this.getVar());
                field.setType(this.getType());
                field.setOptions(this.getOptions());
                field.setDesc(this.getDesc());
           });
        });
        
        ok(form.items.length == items.length, " items array sizes match"); 
        for (var idx=0; idx<form.items.length; idx++) {  
            ok(form.items[idx].equals(items[idx]), "item " + idx + " matches");        
        }   
    });
    
     test("Test Reported no var", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field label='description1' type='text-single'/><field var='field-name2' label='description2' type='text-single'/></reported></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var caught = false;
        
        try {
          form.validate();  
        } catch (ex) {
            caught = true;
            ok(ex instanceof TypeError,
               "error is TypeError");
            ok(ex.message == "reported should have var", "expected message");             
        }
        ok(caught, "expected error thrown");        
             
    });
    
     test("Test Reported no type", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name1' label='description1'/><field var='field-name2' label='description2' type='text-single'/></reported></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var caught = false;
        
        try {
          form.validate();  
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
               "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
            ok(ex.field == "field-name1",
               "correct field name");           
            ok(ex.message == "reported field should have type", "expected message");             
        }
        ok(caught, "expected error thrown");        
            
    });      
    
     test("Test Reported no label", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name1' type='text-single'/><field var='field-name2' label='description2' type='text-single'/></reported></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var caught = false;
        
        try {
          form.validate();  
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
               "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
            ok(ex.field == "field-name1",
               "correct field name");           
            ok(ex.message == "reported field should have label", "expected message");             
        }
        ok(caught, "expected error thrown");        
            
    });
    
     test("Test Reported value exists", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name1'  label='description1' type='text-single'><value>abc</value></field><field var='field-name2' label='description2' type='text-single'/></reported></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var caught = false;
        
        try {
          form.validate();  
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
               "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
            ok(ex.field == "field-name1",
               "correct field name");           
            ok(ex.message == "reported field should not have values", "expected message");             
        }
        ok(caught, "expected error thrown");        
            
    });
    
    test("Test More than one reported tag", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name1' label='description1' type='text-single'/><field var='field-name2' label='description2' type='text-single'/></reported><reported><field var='field-name3' label='description2' type='text-single'/></reported></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = $(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var fieldElems = jabberwerx.$(formElem).find("reported:first > field");
        var fields = [];
        jabberwerx.$.each(fieldElems, function() {
            field = new jabberwerx.XDataFormField(null, null, this);
            fields.push(field);      
        });
        
        for (var idx=0; idx<form.reported.length; idx++) { 
            ok(form.reported[idx].equals(fields[idx]), "field " + form.reported[idx].getVar() + " matches");        
        }  
            
    }); 
    
   test("Test Items with mishmatched reported fields", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name1' label='description1' type='text-single'/><field var='field-name2' label='description2' type='text-single'/></reported><item><field var='field-name3'><value>field-value11</value></field><field var='field-name2'><value>field-value12</value></field></item><item><field var='field-name1'><value>field-value21</value></field><field var='field-name2'><value>field-value22</value></field></item><item><field var='field-name1'><value>field-value31</value></field><field var='field-name2'><value>field-value32</value></field></item></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var caught = false;
        
        try {
          form.validate();  
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
               "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
            ok(ex.field == "field-name1",
               "correct field name");           
            ok(ex.message == "reported field is not found in one of the items", "expected message");             
        }
        ok(caught, "expected error thrown");    
    });
    
   test("Test Items with invalid values for the reported type", function() {
        var formXml ="<x xmlns='jabber:x:data' type='result'><reported><field var='field-name1' label='description1' type='boolean'/><field var='field-name2' label='description2' type='text-single'/></reported><item><field var='field-name1'><value>field-value11</value></field><field var='field-name2'><value>field-value12</value></field></item><item><field var='field-name1'><value>field-value21</value></field><field var='field-name2'><value>field-value22</value></field></item><item><field var='field-name1'><value>field-value31</value></field><field var='field-name2'><value>field-value32</value></field></item></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        var caught = false;
        
        try {
          form.validate();  
        } catch (ex) {
            caught = true;
            ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
               "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
            ok(ex.field == "field-name1",
               "correct field name");           
            ok(ex.message == "field of type boolean contains invalid value", "expected message");             
        }
        ok(caught, "expected error thrown");    
   });
    
   test("Test Get Field Value", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><field type='jid-multi' label='People to invite' var='invitelist'><value>1@test.com</value><value>2@test.com</value><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        ok(form.getFieldValue("invitelist") == "1@test.com", "field value matches");        
        
    });
    
   test("Test Get Field Value Empty", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><field type='jid-multi' label='People to invite' var='invitelist'><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        ok(!form.getFieldValue("invitelist"), "field value empty");        
        
    }); 
    
   test("Test Get Field Value Unknown field name", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><field type='jid-multi' label='People to invite' var='invitelist'><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        ok(!form.getFieldValue("aaaa"), "unknown field value is null");        
        
    });            
          
   test("Test Set Field Value", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><field type='jid-multi' label='People to invite' var='invitelist'><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        form.setFieldValue("invitelist","1@test.com");
        ok(form.getFieldValue("invitelist") == "1@test.com", "field value matches");        
        
    });
    
   test("Test Clear Field Value", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><field type='jid-multi' label='People to invite' var='invitelist'><value>1@test.com</value><value>2@test.com</value><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        form.setFieldValue("invitelist");
        ok(!form.getFieldValue("invitelist"), "field value cleared");        
        
    });
    
   test("Test Set Unknown Field Value", function() {
        var formXml ="<x xmlns='jabber:x:data' type='form'><field type='jid-multi' label='People to invite' var='invitelist'><value>1@test.com</value><value>2@test.com</value><desc>Tell all your friends about your new bot!</desc></field></x>";
        var formDOM = jabberwerx.util.unserializeXMLDoc(formXml);
        var formElem = jabberwerx.$(formDOM).find("x")[0];
        var form = new jabberwerx.XDataForm(null, formElem);
        form.setFieldValue("aaa","123");
        ok(form.getFieldValue("invitelist") == "1@test.com", "field value unchanged");        
        
    }); 
});