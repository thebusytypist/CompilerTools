define(["src/grammarparser"], function(parser) {

var ast = parser.Parse([]);

var GetGrammarAST = function() {
    return ast;
};

var UpdateGrammarAST = function(text) {
    var tokens = parser.Tokenize(text);
    ast = parser.Parse(tokens);
    return ast !== null;
};

return {
    "GetGrammarAST": GetGrammarAST,
    "UpdateGrammarAST": UpdateGrammarAST
};

});
