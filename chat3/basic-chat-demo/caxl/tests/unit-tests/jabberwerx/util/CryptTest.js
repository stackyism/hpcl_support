/**
 * filename:        CryptTest.js
 * created at:      2009/09/25T00:00:00-07:00
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2011 Cisco Systems, Inc.  All Rights Reserved.
 */
jabberwerx.$(document).ready(function() {
    module("jabberwerx/util/crypto");

    //toggle functions based on crypt implementation allowing backward testing    
    //toggle functions based on crypt implementation allowing backward testing    
    var b64Enc = jabberwerx.util.crypto.b64Encode;
    var b64Dec = jabberwerx.util.crypto.b64Decode;
    var utf8Enc = jabberwerx.util.crypto.utf8Encode;
    var utf8Dec = jabberwerx.util.crypto.utf8Decode;
    var toHex = jabberwerx.util.crypto.str2hex;
    var toStrSha1 = jabberwerx.util.crypto.str_sha1;
    var toB64Sha1 = jabberwerx.util.crypto.b64_sha1;
    var toHexMD5 = jabberwerx.util.crypto.hex_md5;
    var toStrMD5 = jabberwerx.util.crypto.rstr_md5;
    
    test("B64 Encoding Functions", function() {
        var origStr = "tobyjulivaca";
        var encStr = "dG9ieWp1bGl2YWNh";        
        var enc = b64Enc(origStr);        
        equals(enc, encStr, "encoded " + origStr);        
        enc = b64Dec(encStr);
        equals(enc, origStr, "decoded " + encStr);        

        origStr = "Ѕ І Ї Ј Љ Њ Ћ Ќ Ў Џ А Б В Г Д";
        encStr = "0IUg0IYg0Icg0Igg0Ikg0Iog0Isg0Iwg0I4g0I8g0JAg0JEg0JIg0JMg0JQ=";        
        enc = b64Enc(utf8Enc(origStr));        
        equals(enc, encStr, "encoded " + origStr);        
        enc = utf8Dec(b64Dec(enc));
        equals(enc, origStr, "decoded " + encStr);        
    });
    
    test("UTF-8 Encoding", function() {
        var origStr = "tobyjulivaca";
        var encStr = utf8Enc(origStr);
        equals(encStr, origStr, "non utf-8 encodes unchanged");
        encStr = utf8Dec(encStr);
        equals(encStr, origStr, "non utf-8 decodes unchanged");
        
        origStr = "Ѕ І Ї Ј Љ Њ Ћ Ќ Ў Џ А Б В Г Д";
        var knownEncStr = "Ð Ð Ð Ð Ð Ð Ð Ð Ð Ð Ð Ð Ð Ð Ð";
        encStr = utf8Enc(origStr)
        equals(encStr, knownEncStr, "utf-8 encoded unicode");
        encStr = utf8Dec(encStr);
        equals(encStr, origStr, "utf-8 decoced back to original");        
    });
    
    test("Str2Hex", function() {
        var origStr = "tobyjulivaca";
        var hexStr = "746f62796a756c6976616361";
        equals(toHex(origStr), hexStr, "non-unicode hex string");
        
        origStr = "Ѕ І Ї Ј Љ Њ Ћ Ќ Ў Џ А Б В Г Д";
        hexStr = "052006200720082009200a200b200c200e200f20102011201220132014";
        equals(toHex(origStr), hexStr, "unicode hex string");
        
        hexStr = "052006200720082009200A200B200C200E200F20102011201220132014";
        equals(toHex(origStr, true), hexStr, "upper case unicode hex string");
    });
    test("Sha1 String Function", function() {
        var origStr = "tobyjulivaca";
        var encStr = "w6/DhjXDu8O0w5HDqsO0wqPDqMOywpfCj2tFw7/CmGJgCA==";
        var sha1 = b64Enc(utf8Enc(toStrSha1(origStr)));
        equals(sha1, encStr, "non-unicode b64 sha1 string");
        
        origStr = "Ѕ І Ї Ј Љ Њ Ћ Ќ Ў Џ А Б В Г Д";
        encStr = "DCjDkSc7fMKlU1fDg3/DkMOZw6vCvFzCljYUwr4=";        
        sha1 = b64Enc(utf8Enc(toStrSha1(origStr)));
        equals(sha1, encStr, "unicode b64 sha1 string");
    });
    test("String MD5 Function", function() {
        var origStr = "tobyjulivaca";
        var encStr = "a8KIasOxShPDskxcVsKhwq7CqUwqw5g=";
        var sha1 = b64Enc(utf8Enc(toStrMD5(origStr)));
        equals(sha1, encStr, "non-unicode MD5 string (as b64)");
        
        origStr = "Ѕ І Ї Ј Љ Њ Ћ Ќ Ў Џ А Б В Г Д";
        encStr = "w4/CpSsFw6nChTfDo8Onw5DCrSzCk8KTwozCpQ==";        
        sha1 = b64Enc(utf8Enc(toStrMD5(origStr)));
        equals(sha1, encStr, "unicode MD5 string (as b64)");
    });
    test("Hex MD5 Function", function() {
        var origStr = "tobyjulivaca";
        var encStr = "a8KIasOxShPDskxcVsKhwq7CqUwqw5g=";
        var sha1 = b64Enc(utf8Enc(toStrMD5(origStr)));
        equals(sha1, encStr, "non-unicode MD5 string (as b64)");
        
        origStr = "Ѕ І Ї Ј Љ Њ Ћ Ќ Ў Џ А Б В Г Д";
        encStr = "w4/CpSsFw6nChTfDo8Onw5DCrSzCk8KTwozCpQ==";        
        sha1 = b64Enc(utf8Enc(toStrMD5(origStr)));
        equals(sha1, encStr, "unicode MD5 string (as b64)");
    });
    
});
