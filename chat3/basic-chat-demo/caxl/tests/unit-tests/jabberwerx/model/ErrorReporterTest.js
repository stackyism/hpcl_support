jabberwerx.$(document).ready(function() {

    // Beginning of Error Reporter Unit Tests module (no set up or tear down)
    module("jabberwerx/model/errorreporter");

    test("Get Default Message", function() {
        var er = jabberwerx.errorReporter;
        var msg1 = er.getMessage();
        var msg2 = er.getMessage("");
        var msg3 = er.getMessage({});
        same(msg1, msg2);
        same(msg1, msg3);
    });

    test("Known error different than default", function() {
        var er = jabberwerx.errorReporter;
        var dm = er.getMessage();
        var km = er.getMessage(
            {message:"{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak"});
        ok(dm != km, "A well know error is different than the default error.");
    });

    test("Add Message", function() {
        var er = jabberwerx.errorReporter;
        er.addMessage("error", "message");
            var msg = er.getMessage({message: "error"});
            same(msg, "message");
    });

    test("Override known error", function() {
        var er = jabberwerx.errorReporter;
        var errorStr = "{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak";
        var newMsg = "New message";

        er.addMessage(errorStr, newMsg);
        var msg = er.getMessage({message: errorStr});
        same(msg, newMsg);
    });

    test("non-string value", function() {
        var er = jabberwerx.errorReporter;

        try {
            er.addMessage("test");
            ok(false, "Message was added when an exception should have been thrown.");
        } catch(e) {
            ok(e instanceof TypeError, "The error should be a TypeError.");
        }

        try {
            er.addMessage("test", {});
            ok(false, "Message was added when an exception should have been thrown.");
        } catch(e) {
            ok(e instanceof TypeError, "The error should be a TypeError.");
        }
    });

    test("Internal element test", function() {
        var er = jabberwerx.errorReporter;
        var error = "{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak";
        var message = "new error message";

        er.addMessage(error, message);

        var builder = new jabberwerx.NodeBuilder("error").
            element("{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak").
            parent.data;

        var returnMsg = er.getMessage(builder);
        same(returnMsg, message);
    });

    test("Text element test", function() {
        var er = jabberwerx.errorReporter;
        var error = "Error Message";

        var builder = new jabberwerx.NodeBuilder("error").
            element("text").text(error).parent.data;

        var returnMsg = er.getMessage(builder);
        same(returnMsg, error);
    });

    test("Unknown error element", function() {
        var er = jabberwerx.errorReporter;
        var unknownError = "{strange:xml:ns}unknown-error";

        var builder = new jabberwerx.NodeBuilder("error").
            element(unknownError).parent.data;

        var firstMsg = er.getMessage(builder);
        var secondMsg = er.getMessage();
        same(firstMsg, secondMsg);
    });

    test("Use text when sibling element isn't known", function() {
        var er = jabberwerx.errorReporter;
        var error = "Error Message";
        var unknownError = "{strange:xml:ns}unknown-error";

        var builder = new jabberwerx.NodeBuilder("error").
            element("text").text(error).parent.
            element(unknownError).parent.data;

        var returnMsg = er.getMessage(builder);
        same(returnMsg, error);

        builder = new jabberwerx.NodeBuilder("error").
            element(unknownError).parent.
            element("text").text(error).parent.data;

        returnMsg = er.getMessage(builder);
        same(returnMsg, error);
    });
});
