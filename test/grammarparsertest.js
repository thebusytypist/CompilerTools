require(
    ["dependency/qunit",
     "src/grammarparser"
    ], function(QUnit, parser) {

QUnit.module("Grammar Parser");

QUnit.test("Tokenizer", function() {
    expect(14);

    var src = "a ::= b ADD c.";
    var tokenList = parser.Tokenize(src);
    equal(tokenList.length, 6);
    equal(parser.IsValidTokenList(tokenList), true);

    equal(tokenList[0].Type, parser.TokenType.NONTERMINAL);
    equal(tokenList[0].Value, "a");

    equal(tokenList[1].Type, parser.TokenType.EQUAL);
    equal(tokenList[1].Value, "::=");

    equal(tokenList[2].Type, parser.TokenType.NONTERMINAL);
    equal(tokenList[2].Value, "b");

    equal(tokenList[3].Type, parser.TokenType.TERMINAL);
    equal(tokenList[3].Value, "ADD");

    equal(tokenList[4].Type, parser.TokenType.NONTERMINAL);
    equal(tokenList[4].Value, "c");

    equal(tokenList[5].Type, parser.TokenType.DOT);
    equal(tokenList[5].Value, ".");
});

QUnit.test("Tokenizer Multiline", function() {
    expect(16);

    var src = "a ::= .\nb ::= SYMBOL.";
    var tokenList = parser.Tokenize(src);
    equal(tokenList.length, 7);
    equal(parser.IsValidTokenList(tokenList), true);

    equal(tokenList[0].Type, parser.TokenType.NONTERMINAL);
    equal(tokenList[0].Value, "a");

    equal(tokenList[1].Type, parser.TokenType.EQUAL);
    equal(tokenList[1].Value, "::=");

    equal(tokenList[2].Type, parser.TokenType.DOT);
    equal(tokenList[2].Value, ".");

    equal(tokenList[3].Type, parser.TokenType.NONTERMINAL);
    equal(tokenList[3].Value, "b");

    equal(tokenList[4].Type, parser.TokenType.EQUAL);
    equal(tokenList[4].Value, "::=");

    equal(tokenList[5].Type, parser.TokenType.TERMINAL);
    equal(tokenList[5].Value, "SYMBOL");

    equal(tokenList[6].Type, parser.TokenType.DOT);
    equal(tokenList[6].Value, ".");
});

QUnit.test("Tokenizer Failure", function() {
    expect(1);
    
    var src = "a -> b.";
    var tokenList = parser.Tokenize(src);
    equal(parser.IsValidTokenList(tokenList), false);
});


QUnit.test("Parser", function() {
    expect(11);

    var src = "a ::= SYMBOL ADD SYMBOL.\n b ::= MINUS a.";
    // var src = "a ::= SYMBOL.";
    var tokenList = parser.Tokenize(src);
    var r = parser.Parse(tokenList);
    notEqual(r, undefined);

    equal(r.GetProductionCount(), 2);

    var firstProduction = r.GetProduction(0);
    var firstHead = firstProduction.GetHead();
    equal(firstHead.IsTerminal(), false);
    var firstBody = firstProduction.GetBody();
    equal(firstBody.GetSymbolCount(), 3);
    equal(firstBody.GetSymbol(0).GetValue(), "SYMBOL");
    equal(firstBody.GetSymbol(1).GetValue(), "ADD");
    equal(firstBody.GetSymbol(2).GetValue(), "SYMBOL");

    var secondProduction = r.GetProduction(1);
    var secondHead = secondProduction.GetHead();
    equal(secondHead.IsTerminal(), false);
    var secondBody = secondProduction.GetBody();
    equal(secondBody.GetSymbolCount(), 2);
    equal(secondBody.GetSymbol(0).GetValue(), "MINUS");
    equal(secondBody.GetSymbol(1).GetValue(), "a");
});

});
