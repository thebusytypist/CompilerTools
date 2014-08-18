require(
    ["dependency/qunit",
     "src/grammarparser"
    ], function(QUnit, parser) {

QUnit.module("Grammar Parser");

QUnit.test("Tokenizer", function() {
    expect(14);

    var src = "a ::= b ADD c.";
    var tokenList = parser.Tokenize(src);
    strictEqual(tokenList.length, 6);
    strictEqual(parser.IsValidTokenList(tokenList), true);

    strictEqual(tokenList[0].Type, parser.TokenType.NONTERMINAL);
    strictEqual(tokenList[0].Value, "a");

    strictEqual(tokenList[1].Type, parser.TokenType.EQUAL);
    strictEqual(tokenList[1].Value, "::=");

    strictEqual(tokenList[2].Type, parser.TokenType.NONTERMINAL);
    strictEqual(tokenList[2].Value, "b");

    strictEqual(tokenList[3].Type, parser.TokenType.TERMINAL);
    strictEqual(tokenList[3].Value, "ADD");

    strictEqual(tokenList[4].Type, parser.TokenType.NONTERMINAL);
    strictEqual(tokenList[4].Value, "c");

    strictEqual(tokenList[5].Type, parser.TokenType.DOT);
    strictEqual(tokenList[5].Value, ".");
});

QUnit.test("Tokenizer Empty", function() {
    expect(1);

    var src = " ";
    var tokenList = parser.Tokenize(src);

    strictEqual(tokenList.length, 0);
});

QUnit.test("Tokenizer Multiline", function() {
    expect(16);

    var src = "a ::= .\nb ::= SYMBOL.";
    var tokenList = parser.Tokenize(src);
    strictEqual(tokenList.length, 7);
    strictEqual(parser.IsValidTokenList(tokenList), true);

    strictEqual(tokenList[0].Type, parser.TokenType.NONTERMINAL);
    strictEqual(tokenList[0].Value, "a");

    strictEqual(tokenList[1].Type, parser.TokenType.EQUAL);
    strictEqual(tokenList[1].Value, "::=");

    strictEqual(tokenList[2].Type, parser.TokenType.DOT);
    strictEqual(tokenList[2].Value, ".");

    strictEqual(tokenList[3].Type, parser.TokenType.NONTERMINAL);
    strictEqual(tokenList[3].Value, "b");

    strictEqual(tokenList[4].Type, parser.TokenType.EQUAL);
    strictEqual(tokenList[4].Value, "::=");

    strictEqual(tokenList[5].Type, parser.TokenType.TERMINAL);
    strictEqual(tokenList[5].Value, "SYMBOL");

    strictEqual(tokenList[6].Type, parser.TokenType.DOT);
    strictEqual(tokenList[6].Value, ".");
});

QUnit.test("Tokenizer Failure", function() {
    expect(1);
    
    var src = "a -> b.";
    var tokenList = parser.Tokenize(src);
    strictEqual(parser.IsValidTokenList(tokenList), false);
});


QUnit.test("Parser", function() {
    expect(11);

    var src = "a ::= SYMBOL ADD SYMBOL.\n b ::= MINUS a.";
    // var src = "a ::= SYMBOL.";
    var tokenList = parser.Tokenize(src);
    var r = parser.Parse(tokenList);
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

QUnit.test("Parser Empty", function() {
    expect(3);

    var src = "";
    var tokenList = parser.Tokenize(src);
    strictEqual(tokenList.length, 0);
    var r = parser.Parse(tokenList);
    notStrictEqual(r, null);

    strictEqual(r.GetProductionCount(), 0);
});

QUnit.test("Parser Failure", function() {
    expect();

    var src = "a ::= ";
    var tokenList = parser.Tokenize(src);
    var r = parser.Parse(tokenList);
    strictEqual(r, null);
});

});
