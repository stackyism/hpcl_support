jabberwerx.$(document).ready( function() {    
    /*
     * When running these tests in their original format a problem was found with the way 
     * jQuery.append() works in IE8. When you call jQuery.append(" space-in-front-of-these") in FF
     * and Safari it creates and appends a single text node. In IE8 it creates and appends two
     * nodes; one with content of " " and the second with content of "space-in-front-of-these".
     * Some of these unit tests are hacked to facilitate this distinction between browsers.
    */
    
    var emoticons;
    
    module("jabberwerx.ui/model/emoticons", {
        setup: function() {
            emoticons = new jabberwerx.ui.Emoticons();
        }
    });
    
    /* Utility funuctions */
    function checkImageResult(result, emoticonKey) {
        equals(result.getAttribute("alt"), emoticonKey, "alt attribute should be " + emoticonKey);
        equals(result.getAttribute("title"), emoticonKey, "title attribute should be " + emoticonKey);

        var fmt = jabberwerx.$("<img>").get(0);
        
        fmt.setAttribute("src", emoticons._imageFolder + emoticons.emoticons[emoticonKey]);
        equals(result.getAttribute("src"), fmt.getAttribute("src"),
                                   "Image file should be " + fmt.getAttribute("src"));
    };
    
    function invokeException(str) {
        try {
            emoticons.translate(str);
            ok(false, "An exception should have been thrown before this line is reached.");
        } catch (e) {
            ok(e instanceof jabberwerx.ui.Emoticons.InvalidRawTextFormat, 
               "The exception thrown should be an instance of jabberwerx.ui.Emoticons.InvalidRawTextFormat");
        }
    }
    
    /* Test functions */
    test("Test String without Emoticon", function() {
        var str = "simple string";
        var result = emoticons.translate(str);
        equals(result.length, 1);
        equals(result[0].nodeValue, "simple string");
    });
    
    test("Test Empty String", function() {
        var str = "";
        var result = emoticons.translate(str);
        equals(result.length, 0);
    });
    
    test("Test String with Single Emoticon", function() {
        var str = ";)";
        var result = emoticons.translate(str);
        equals(result.length, 1);
        checkImageResult(result[0], ";)");
    });
    
    test("Test String with Emoticon", function() {
        var str = "simple :) string";
        var result = emoticons.translate(str);
        if (result.length == 4) {
            // Internet Exlorer problem ~ for details go to top of file
            equals(result.length, 4);
            equals(result[0].nodeValue, "simple ");
            checkImageResult(result[1], ":)");
            equals(result[2].nodeValue, " ");
            equals(result[3].nodeValue, "string");
        } else {
            equals(result.length, 3);
            equals(result[0].nodeValue, "simple ");
            checkImageResult(result[1], ":)");
            equals(result[2].nodeValue, " string");
        }
    });
    
    test("Test String with Multiple Emoticons", function() {
        var str = "simple :) string :(";
        var result = emoticons.translate(str);
        if (result.length == 5) {
            // Internet Exlorer problem ~ for details go to top of file
            equals(result.length, 5);
            equals(result[0].nodeValue, "simple ");
            checkImageResult(result[1], ":)");
            equals(result[2].nodeValue, " ");
            equals(result[3].nodeValue, "string ");
            checkImageResult(result[4], ":(");
        } else {
            equals(result.length, 4);
            equals(result[0].nodeValue, "simple ");
            checkImageResult(result[1], ":)");
            equals(result[2].nodeValue, " string ");
            checkImageResult(result[3], ":(");
        }
    });
    
    test("Test Repeat Emoticons", function() {
        var str = ":) :( :)";
        var result = emoticons.translate(str);
        equals(result.length, 5);
        checkImageResult(result[0], ":)");
        equals(result[1].nodeValue, " ");
        checkImageResult(result[2], ":(");
        equals(result[3].nodeValue, " ");
        checkImageResult(result[4], ":)");
    });
    
    test("Test Invalid Raw Text Format", function() {
        invokeException(null);
        invokeException(1);
        invokeException({x:1});
    });
    
    test("Test Raw Text Exceeds Char Limit", function() {
        var str = '';
        for (var i=0; i<1024; i++) {
            str += 'a';
        }
        str += ' :)';
        equals(emoticons.translate(str)[0].nodeValue, str,
               "Translated string should be same as input string");
    });
    
    test("Test All Emoticons with \\w before", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = "foo" + key;
            var result = emoticons.translate(str);
            equals(result.length, 1);
            equals(result[0].nodeValue, str);
        });
    });
    
    test("Test All Emoticons with \\w after", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = key + "foo";
            var result = emoticons.translate(str);
            equals(result.length, 1);
            equals(result[0].nodeValue, str);
        });
    });
    
    test("Test All Emoticons with \\w\\s before", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = "foo " + key;
            var result = emoticons.translate(str);
            equals(result.length, 2);
            equals(result[0].nodeValue, "foo ");
            checkImageResult(result[1], key);
        });
    });
    
    test("Test All Emoticons with \\w\\s after", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = key + " foo";
            var result = emoticons.translate(str);
            if (result.length == 3) {
                // Internet Exlorer problem ~ for details go to top of file
                equals(result.length, 3);
                checkImageResult(result[0], key);
                equals(result[1].nodeValue, " ");
                equals(result[2].nodeValue, "foo");
            } else {
                equals(result.length, 2);
                checkImageResult(result[0], key);
                equals(result[1].nodeValue, " foo");
            }
        });
    });
    
    test("Test All Emoticons with \W before", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = "!" + key;
            var result = emoticons.translate(str);
            equals(result.length, 2);
            equals(result[0].nodeValue, "!");
            checkImageResult(result[1], key);
        });
    });
    
    test("Test All Emoticons with \W after", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = key + "!";
            var result = emoticons.translate(str);
            equals(result.length, 2);
            checkImageResult(result[0], key);
            equals(result[1].nodeValue, "!");
        });
    });

    test("Test simple jQuery emoticon search", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = "<div>Test " + key + "</div>";
            var initial = jabberwerx.$(str);
            initial = emoticons.translate(initial);
            equals(initial.text(), "Test ");
            equals(initial.children().length, 1);
            checkImageResult(initial.children()[0], key);
        });
    });

    test("Test complex jQuery emoticon search", function() {
        jabberwerx.$.each(emoticons.emoticons, function(key, val) {
            var str = "<div><span>Test</span>Test " + key +
                      "<span>Test</span></div>";
            var initial = jabberwerx.$(str);
            initial = emoticons.translate(initial);
            equals(initial.text(), "TestTest Test");
            equals(initial.children().length, 3);
            checkImageResult(initial.children()[1], key);
        });
    });
});
