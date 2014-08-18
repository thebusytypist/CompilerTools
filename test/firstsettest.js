require(
    ["dependency/qunit",
     "src/grammarparser",
     "src/firstset"
    ], function(QUnit, parser, firstset) {

QUnit.module("FIRST Set");

QUnit.test("Validate", function() {
    expect(7);

    var src = "s ::= A ADD B.";
    var tokenList = parser.Tokenize(src);
    strictEqual(tokenList.length, 6);
    var r = parser.Parse(tokenList);
    notStrictEqual(r, null);

    var str = "A";
    var list = parser.Tokenize(str);
    ok(firstset.Validate(r, list));

    var n = "C";
    var nlist = parser.Tokenize(n);
    strictEqual(firstset.Validate(r, nlist), false);

    var d = ".";
    var dlist = parser.Tokenize(d);
    strictEqual(firstset.Validate(r, dlist), false);

    var ba = "B A";
    var balist = parser.Tokenize(ba);
    ok(firstset.Validate(r, balist));

    var bc = "B C";
    var bclist = parser.Tokenize(bc);
    strictEqual(firstset.Validate(r, bclist), false);
});

});
