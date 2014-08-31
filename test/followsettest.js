require(
    ["dependency/qunit",
     "src/grammarparser",
     "src/firstfollow"
    ], function(QUnit, parser, firstfollow) {

QUnit.module("FOLLOW Set");

QUnit.test("DragonBook-Example-4.27", function() {
    expect(20);

    // var src = "s ::= A ADD B.";
    var src = "e ::= t erhs." +
              "erhs ::= ADD t erhs." +
              "erhs ::= ." +
              "t ::= f trhs." +
              "trhs ::= TIMES f trhs." +
              "trhs ::= ." +
              "f ::= LP e RP." +
              "f ::= ID.";
    var ast = parser.Parse(src);
    notStrictEqual(ast, null);

    var r = firstfollow.CalculateFollowSets(ast);

    var strictArrayEqual = function(a, b) {
        strictEqual(a.length, b.length);
        for (var i = 0; i < a.length; ++i)
            strictEqual(a[i], b[i]);
    };

    strictArrayEqual(r["e"], ["RP", "$"]);
    strictArrayEqual(r["erhs"], ["RP", "$"]);

    strictArrayEqual(r["t"], ["ADD", "RP", "$"]);
    strictArrayEqual(r["trhs"], ["ADD", "RP", "$"]);

    strictArrayEqual(r["f"], ["TIMES", "ADD", "RP", "$"]);
});

});
