/**
 * filename:        ValidateTest.js
 * created at:      2010/08/05T00:00:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    module("jabberwerx/util/validate");

    var isIP = jabberwerx.util.validate.isIPAddress;
    
    test("Validate IP address format", function() {
		equals(isIP('1.1.1.1'), true, "Format Validated");
		equals(isIP('257.1.1.1'), false, "Format Validated");
	    equals(isIP('a.b.c.d'), false, "Format Validated");
		equals(isIP('a.b.c.1'), false, "Format Validated");
		equals(isIP('1.2.a.b'), false, "Format Validated");
    });
    
});