require(
    ["dependency/qunit",
     "src/grammarparser",
     "src/firstfollow"
    ], function(QUnit, parser, firstfollow) {

QUnit.module("FIRST Set");

QUnit.test("CalculateFirstSet Terminal", function() {
    expect(4);

    var src = "s ::= A ADD B.";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    var input = "B";
    var s = firstfollow.CalculateFirstSet(r, input);
    notStrictEqual(s, null);
    strictEqual(s.length, 1);
    strictEqual(s[0], "B");
});

QUnit.test("CalculateFirstSet Non-terminal", function() {
    expect(4);

    var src = "s ::= A ADD B.";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    var input = "s";
    var s = firstfollow.CalculateFirstSet(r, input);
    notStrictEqual(s, null);
    strictEqual(s.length, 1);
    strictEqual(s[0], "A");
});

QUnit.test("CalculateFirstSet Empty Production", function() {
    expect(5);

    var src = "s ::= A ADD B.\n s ::=.";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    var input = "s";
    var s = firstfollow.CalculateFirstSet(r, input);
    notStrictEqual(s, null);
    strictEqual(s.length, 2);
    strictEqual(s[0], "A");
    strictEqual(s[1], "ε");
});

QUnit.test("CalculateFirstSet Null At Beginning", function() {
    expect(4);

    var src = "s ::= body END.\n body ::= .";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    var input = "body END";
    var s = firstfollow.CalculateFirstSet(r, input);
    notStrictEqual(s, null);
    strictEqual(s.length, 1);
    strictEqual(s[0], "END");
});

});
