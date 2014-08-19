require(
    ["dependency/qunit",
     "src/grammarparser",
     "src/firstset"
    ], function(QUnit, parser, firstset) {

QUnit.module("FIRST Set");

QUnit.test("Calculate Terminal", function() {
    expect(4);

    var src = "s ::= A ADD B.";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    var input = "B";
    var s = firstset.Calculate(r, input);
    notStrictEqual(s, null);
    strictEqual(s.length, 1);
    strictEqual(s[0], "B");
});

QUnit.test("Calculate Non-terminal", function() {
    expect(4);

    var src = "s ::= A ADD B.";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    var input = "s";
    var s = firstset.Calculate(r, input);
    notStrictEqual(s, null);
    strictEqual(s.length, 1);
    strictEqual(s[0], "A");
});

QUnit.test("Calculate Empty Production", function() {
    expect(5);

    var src = "s ::= A ADD B.\n s ::=.";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    var input = "s";
    var s = firstset.Calculate(r, input);
    notStrictEqual(s, null);
    strictEqual(s.length, 2);
    strictEqual(s[0], "A");
    strictEqual(s[1], "ε");
});

});
