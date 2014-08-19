define(["src/grammarparser"], function(parser) {

var ast = parser.Parse("");

var GetGrammarAST = function() {
    return ast;
};

var UpdateGrammarAST = function(text) {
    ast = parser.Parse(text);
    return ast !== null;
};

return {
    "GetGrammarAST": GetGrammarAST,
    "UpdateGrammarAST": UpdateGrammarAST
};

});
