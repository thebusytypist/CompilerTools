require(
    ["dependency/qunit",
     "src/grammarparser"
    ], function(QUnit, parser) {

QUnit.module("Grammar Parser");

QUnit.test("ParseSentence", function() {
    expect(7);

    var src = "expr ADD term";
    var symbols = parser.ParseSentence(src);
    strictEqual(symbols.length, 3);

    strictEqual(symbols[0].GetValue(), "expr");
    strictEqual(symbols[0].IsTerminal(), false);

    strictEqual(symbols[1].GetValue(), "ADD");
    strictEqual(symbols[1].IsTerminal(), true);

    strictEqual(symbols[2].GetValue(), "term");
    strictEqual(symbols[2].IsTerminal(), false);
});

QUnit.test("ParseSentence Empty", function() {
    expect(1);

    var src = " ";
    var symbols = parser.ParseSentence(src);

    strictEqual(symbols.length, 0);
});

QUnit.test("ParseSentence Failure", function() {
    expect(1);
    
    var src = "a -> b.";
    var symbols = parser.ParseSentence(src);
    strictEqual(symbols, null);
});

QUnit.test("Parse", function() {
    expect(11);

    var src = "a ::= SYMBOL ADD SYMBOL.\n b ::= MINUS a.";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    strictEqual(r.GetProductionCount(), 2);

    var firstProduction = r.GetProduction(0);
    var firstHead = firstProduction.GetHead();
    strictEqual(firstHead.IsTerminal(), false);
    var firstBody = firstProduction.GetBody();
    strictEqual(firstBody.GetSymbolCount(), 3);
    strictEqual(firstBody.GetSymbol(0).GetValue(), "SYMBOL");
    strictEqual(firstBody.GetSymbol(1).GetValue(), "ADD");
    strictEqual(firstBody.GetSymbol(2).GetValue(), "SYMBOL");

    var secondProduction = r.GetProduction(1);
    var secondHead = secondProduction.GetHead();
    strictEqual(secondHead.IsTerminal(), false);
    var secondBody = secondProduction.GetBody();
    strictEqual(secondBody.GetSymbolCount(), 2);
    strictEqual(secondBody.GetSymbol(0).GetValue(), "MINUS");
    strictEqual(secondBody.GetSymbol(1).GetValue(), "a");
});

QUnit.test("Parse Empty", function() {
    expect(2);

    var src = "";
    var r = parser.Parse(src);
    notStrictEqual(r, null);

    strictEqual(r.GetProductionCount(), 0);
});

QUnit.test("Parser Failure", function() {
    expect(1);

    var src = "a ::= ";
    var r = parser.Parse(src);
    strictEqual(r, null);
});

});
