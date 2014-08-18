define(function() {

var IsTokenDefinedInHead = function(head, token) {
    return head.GetValue() === token.Value;
};

var IsTokenDefinedInBody = function(body, token) {
    for (var i = 0, count = body.GetSymbolCount(); i < count; ++i) {
        var symbol = body.GetSymbol(i);
        if (symbol.GetValue() === token.Value)
            return true;
    }
    return false;
};

var IsTokenDefinedInAST = function(ast, token) {
    for (var i = 0, count = ast.GetProductionCount(); i < count; ++i) {
        var p = ast.GetProduction(i);

        if (IsTokenDefinedInHead(p.GetHead(), token))
            return true;

        if (IsTokenDefinedInBody(p.GetBody(), token))
            return true;
    }
    return false;
};

var Validate = function(ast, symbols) {
    for (var i = 0, count = symbols.length; i < count; ++i) {
        var symbol = symbols[i];
        if (!IsTokenDefinedInAST(ast, symbol))
            return false;
    }
    return true;
};

var Calculate = function(ast, symbols) {

};

return {
    "Validate": Validate,
    "Calculate": Calculate
};

});
