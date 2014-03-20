/*
 * Contrived example unit tests.
 */
var sampleObject;
var localIntVal = 1;
var localStrVal = 'a string';

$(document).ready(function() {

  // Beginning of Simple Tests module (no set up or tear down)
  module("Simple Tests");
  
  test("Test using ok", function() {
    // ok checks that the parameter passed through evaluates to true
	ok(true , "Parameter evaluates to true");
  });
  
  test("Test using same", function() {
    // Compares the two parameters passed through using === style check
    same(1, 1, "Both parameters are the same");
  });
  
  test("Test using equals", function() {
    // Compares the two parameters passed through using == style check
	equals(1, '1', "Both parameters are equal");
  });
  
  test("Test using expect", function() {
    // We expect two assertions within this test
	expect(2);
	
	ok(!false , "test 1 of 2");
	ok(1==1 , "test 2 of 2");
  });  
  
  // Uncomment the next test if you want the test suite to fail	
  /*  
  test("Deliberate Failure", function() {
    ok(false, "This test is designed to fail");
  });  
  */

  // Beginning of Test Sample Object module
  module("Test Sample Object", {
    // Set up and tear down function for all tests in this module
	setup: function() {
      sampleObject = new SampleObject(localIntVal, localStrVal);
    }
    ,
	teardown: function() {
      
    }
  });
  
  test("Test global variable value", function() {
    same(globalVar, 9);
  });
  
  test("Test sample object integer value", function() {
    same(sampleObject.intVal, localIntVal);
  });
  
  test("Test sample object string value", function() {
    same(sampleObject.stringVal, localStrVal);
  });
  
  test("Test integer value against string", function() {
    // Convert localIntVal to string format
	var str = localIntVal + '';
	
	// Test intVal against string format
	equals(sampleObject.intVal, str);
  });
  
});
