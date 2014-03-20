//                                             
//                                             
//Unit tests: Negative tests for setting       
//            values and sending in a          
//            blank submit ()                  

//The purpose of this unit test is to put an invalid jid in the jid-single field type. 

jabberwerx.$(document).ready(function() {

module("jabberwerx/model/XDataForm");

test("1Invalid jid-single", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-single');
    field1.setValues("invalid jid");
    try {
      field1.validate();  
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to set an array of valid jids in the jid-single field type. 
test("2Invalid jid-single2", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-single');
    field1.setValues(["validjid1", "validjid2", "validjid3"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put 3 invalid jids in the jid-multi field type. 
test("3Invalid jid-multi", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-multi');
    field1.setValues(["invalid jid1", "invalid jid2.webex.com", "invalid jid3webexcom"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put 1 valid and 2 invalid jids in the jid-mulit field type. 
test("4Invalid jid-multi2", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-multi');
    field1.setValues(["invalid jid1", "validjid2@webex.com", "invalid jid3webexcom"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an invalid numerical value in the boolean field type. 
test("5Invalid boolean", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    field1.setValues("9");
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an invalid string in the boolean field type. 
test("6Invalid boolean2", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    field1.setValues("string");
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an array in the boolean field type. 
test("7Invalid boolean3", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    field1.setValues(["0", "true"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
           
    }
    ok(caught, "expected error thrown");        
});

/*Currently carriage returns are only checked at the UI level - May want to revisit in the future.
//The purpose of this unit test is to put a \r carriage return in one of the values for the list-multi field type. 
test("8Carriage Return list-multi", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-multi');
    field1.setValues(["string \r", "string"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put a \n carriage return in one of the values for the list-multi field type. 
test("9Carriage Return list-multi2", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-multi');
    field1.setValues(["string", "string \n"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});
*/

//The purpose of this unit test is to enter a string of 'special characters' in the text-single field type. 
test("10Special Characters text-single", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-single');
    field1.setValues("~!@#$%^&*()_+{}|: \"<>? \\40");
    try {
       field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           

    }
    ok(!caught, "expected error thrown");        
});

//The purpose of this unit test is to enter a string of 'special characters' in the list-single field type. 
test("11Special Characters list-single", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-single');
    field1.setValues("~!@#$%^&*()_+{}|:\"<>? \\40");
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");
    }
    ok(!caught, "expected error thrown");        
});

//The purpose of this unit test is to enter an array in the text-single field type. 
test("12Array text-single", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-single');
    field1.setValues(["one", "two", "three"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to enter an array in the list-single field type. 
test("13Array list-single", function() {
    var form;
    var caught = false;
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-single');
    field1.setValues(["one", "two", "three"]);
    try {
        field1.validate();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");
    }
    ok(caught, "expected error thrown");        
});


//                                             
//                                             
//Unit tests: Negative tests for setting       
//            valid values and sending in      
//            new invalid values with submit   

//The purpose of this unit test is to put an invalid jid in the jid-single field type. 
test("14Invalid jid-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-single');
    field1.setValues("validjid@webex.com");
    try {
        form.addField(field1);
        form.submit({'field1':'invalid jid'});  
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to set an array of valid jids in the jid-single field type. 
test("15Invalid jid-single2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-single');
    field1.setValues("validjid1@webex.com");
    try {
        form.addField(field1);
        form.submit({"field1":["invalid jid1", "invalid jid2", "invalid jid3"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put 3 invalid jids in the jid-multi field type. 
test("16Invalid jid-multi", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-multi');
    field1.setValues(["validjid1", "validjid2", "validjid3"]);
    try {
        form.addField(field1);
        form.submit({"field1":["invalid jid1", "invalid jid2.webex.com", "invalid jid3webexcom"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put 1 valid and 2 invalid jids in the jid-mulit field type. 
test("17Invalid jid-multi2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-multi');
    field1.setValues(["validjid1", "validjid2", "validjid3"]);
    try {
        form.addField(field1);
        form.submit({"field1":["invalid jid1", "validjid2@webex.com", "invalid jid3webexcom"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an invalid numerical value in the boolean field type. 
test("18Invalid boolean", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    field1.setValues("0");
    try {
        form.addField(field1);
        form.submit({"field1":"9"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an invalid string in the boolean field type. 
test("19Invalid boolean2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    field1.setValues("true");
    try {
        form.addField(field1);
        form.submit({"field1":"string"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an array in the boolean field type. 
test("20Invalid boolean3", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm ("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    field1.setValues("0");
    try {
        form.addField(field1);
        form.submit({"field1":["0","true"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

/* Currently carriage returns are only at the UI level. May want to revisit this in the future.
//The purpose of this unit test is to put a \r carriage return in one of the values for the list-multi field type. 
test("21Carriage Return list-multi", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-multi');
    field1.setValues["string1", "string2"];
    try {
        form.addField(field1);
        form.submit({"field1":["string1 \r", "string2"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put a \n carriage return in one of the values for the list-multi field type. 
test("22Carriage Return list-multi2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-multi');
    field1.setValues["string1", "string2"];
    try {
        form.addField(field1);
        form.submit({"field1":["string1", "string2 \n"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});
*/

//The purpose of this unit test is to enter a string of 'special characters' in the text-single field type. 
test("23Special Characters text-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-single');
    field1.setValues("string");
    try {
        form.addField(field1);
        form.submit({"field1":"~!@#$%^&*()_+{}|:\"<>? \\40"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(!caught, "expected error thrown");        
});

//The purpose of this unit test is to enter a string of 'special characters' in the list-single field type. 
test("24Special Characters list-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-single');
    field1.setValues("string");
    try {
        form.addField(field1);
        form.submit({"field1":"~!@#$%^&*()_+{}|:\"<>? \\40"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1","correct field name");
    }
    ok(!caught, "expected error thrown");        
});

//The purpose of this unit test is to enter an array in the text-single field type. 
test("25Array text-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-single');
    field1.setValues("string");
    try {
        form.addField(field1);
        form.submit({"field1":["one", "two", "three"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to enter an array in the list-single field type. 
test("26Array list-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-single');
    field1.setValues("string");
    try {
        form.addField(field1);
        form.submit ({"field1":["one", "two", "three"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});


//                                             
//                                             
//Unit tests: Negative tests for not setting   
//            values and sending in values     
//            with the submit                  

//The purpose of this unit test is to put an invalid jid in the jid-single field type. 
test("27Invalid jid-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-single');
    try {
        form.addField(field1);
        form.submit({'field1':'invalid jid'});  
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to set an array of valid jids in the jid-single field type. 
test("28Invalid jid-single2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-single');
    try {
        form.addField(field1);
        form.submit({"field1":["invalid jid1", "invalid jid2", "invalid jid3"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put 3 invalid jids in the jid-multi field type. 
test("29Invalid jid-multi", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-multi');
    try {
        form.addField(field1);
        form.submit({"field1":["invalid jid1", "invalid jid2.webex.com", "invalid jid3webexcom"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put 1 valid and 2 invalid jids in the jid-mulit field type. 
test("30Invalid jid-multi2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-multi');
    try {
        form.addField(field1);
        form.submit({"field1":["invalid jid1", "validjid2@webex.com", "invalid jid3webexcom"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an invalid numerical value in the boolean field type. 
test("31Invalid boolean", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    try {
        form.addField(field1);
        form.submit({"field1":"9"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an invalid string in the boolean field type. 
test("32Invalid boolean2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    try {
        form.addField(field1);
        form.submit({"field1":"string"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put an array in the boolean field type. 
test("33Invalid boolean3", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm ("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    try {
        form.addField(field1);
        form.submit({"field1":["0","true"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});

/*Currently carriage returns are only at the UI level. May want to revisit this in the future.
//The purpose of this unit test is to put a \r carriage return in one of the values for the list-multi field type. 
test("34Carriage Return list-multi", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-multi');
    try {
        form.addField(field1);
        form.submit({"field1":["string1 \r", "string2"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to put a \n carriage return in one of the values for the list-multi field type. 
test("35Carriage Return list-multi2", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-multi');
    try {
        form.addField(field1);
        form.submit({"field1":["string1", "string2 \n"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
    }
    ok(caught, "expected error thrown");        
});
*/

//The purpose of this unit test is to enter a string of 'special characters' in the text-single field type. 
test("36Special Characters text-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-single');
    try {
        form.addField(field1);
        form.submit({"field1":"~!@#$%^&*()_+{}|:\"<>? \\40"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(!caught, "expected error thrown");        
});

//The purpose of this unit test is to enter a string of 'special characters' in the list-single field type. 
test("37Special Characters list-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-single');
    try {
        form.addField(field1);
        form.submit({"field1":"~!@#$%^&*()_+{}|:\"<>? \\40"});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(!caught, "expected error thrown");        
});

//The purpose of this unit test is to enter an array in the text-single field type. 
test("38Array text-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-single');
    try {
        form.addField(field1);
        form.submit({"field1":["one", "two", "three"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to enter an array in the list-single field type. 
test("39Array list-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-single');
    try {
        form.addField(field1);
        form.submit ({"field1":["one", "two", "three"]});
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});


//                                             
//                                             
//Unit tests: Negative tests for required fields       
//
//

//The purpose of this unit test is to make jid-single field required. 
test("40Required jid-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-single');
    field1.setRequired(true);
    try {
        form.addField(field1);
        form.submit();  
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to make the jid-multi field required. 
test("41Required jid-multi", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('jid-multi');
    field1.setRequired(true);
    try {
        form.addField(field1);
        form.submit();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1",
           "correct field name");           
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to make the boolean field required. 
test("42Required boolean", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('boolean');
    field1.setRequired(true);
    try {
        form.addField(field1);
        form.submit();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to make the text-single field required. 
test("43Required text-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-single');
    field1.setRequired(true);
    try {
        form.addField(field1);
        form.submit();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to make the text-multi field required. 
test("44Required text-multi", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('text-multi');
    field1.setRequired(true);
    try {
        form.addField(field1);
        form.submit();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});

//The purpose of this unit test is to make the list-single field required. 
test("45Required list-single", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-single');
    field1.setRequired(true);
    try {
        form.addField(field1);
        form.submit ();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});


//The purpose of this unit test is to make the list-multi field required. 
test("46Required list-multi", function() {
    var caught = false;
    var form = new jabberwerx.XDataForm("form");
    var field1 = new jabberwerx.XDataFormField("field1");
    field1.setType('list-multi');
    field1.setRequired(true);
    try {
        form.addField(field1);
        form.submit ();
    } catch (ex) {
        caught = true;
        ok(ex instanceof jabberwerx.XDataFormField.InvalidXDataFieldError,
           "error is jabberwerx.XDataFormField.InvalidXDataFieldError");
        ok(ex.field == "field1", "correct field name");
    }
    ok(caught, "expected error thrown");        
});
});
