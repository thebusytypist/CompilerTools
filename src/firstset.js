define(["src/grammarparser"], function(grammarparser) {

var IsSymbolDefinedInHead = function(head, symbol) {
    return head.GetValue() === symbol.GetValue();
};

var IsSymbolDefinedInBody = function(body, symbol) {
    for (var i = 0, count = body.GetSymbolCount(); i < count; ++i) {
        var s = body.GetSymbol(i);
        if (s.GetValue() === symbol.GetValue())
            return true;
    }
    return false;
};

var IsSymbolDefinedInAST = function(ast, symbol) {
    for (var i = 0, count = ast.GetProductionCount(); i < count; ++i) {
        var p = ast.GetProduction(i);

        if (IsSymbolDefinedInHead(p.GetHead(), symbol))
            return true;

        if (IsSymbolDefinedInBody(p.GetBody(), symbol))
            return true;
    }
    return false;
};

var IsDefinedSentence = function(ast, symbols) {
    for (var i = 0, count = symbols.length; i < count; ++i) {
        var symbol = symbols[i];
        if (!IsSymbolDefinedInAST(ast, symbol))
            return false;
    }
    return true;
};

var MergeSet = function(a, b) {
    var r = new Set;
    a.forEach(function(e) {
        r.add(e);
    });
    b.forEach(function(e) {
        r.add(e);
    });
    return r;
};

var CalculateFirstSetOfNonTerminal = function(ast, symbol) {
    var s = new Set;
    var count = ast.GetProductionCount();
    
    if (count === 0) {
        s.add(null);
    }

    for (var i = 0; i < count; ++i) {
        var p = ast.GetProduction(i);
        var head = p.GetHead();
        if (head.GetValue() === symbol.GetValue()) {
            var body = p.GetBody();
            if (body.GetSymbolCount() === 0)
                s.add(null);
            else {
                var symbols = body.GetSymbols();
                var n = CalculateFirstSetOfSymbols(ast, symbols);
                s = MergeSet(s, n);
            }
        }
    }
    return s;
};

var CalculateFirstSetOfSymbols = function(ast, symbols) {
    var s = new Set;
    for (var i = 0, count = symbols.length; i < count; ++i) {
        if (!symbols[i].IsTerminal()) {
            var n = CalculateFirstSetOfNonTerminal(ast, symbols[i]);
            s = MergeSet(s, n);
            if (!n.has(null))
                break;
        }
        else {
            s.add(symbols[i].GetValue());
            break;
        }
    }
    return s;
};

var CalculateRaw = function(ast, text) {
    var symbols = grammarparser.ParseSentence(text);

    if (symbols === null || !IsDefinedSentence(ast, symbols))
        return null;

    return CalculateFirstSetOfSymbols(ast, symbols);
};

var DumpFIRSTSetToArray = function(ast, text) {
    var first = CalculateRaw(ast, text);

    if (first === null)
        return null;

    var r = [];
    var hasEpsilon = false;
    first.forEach(function(e) {
        if (e === null)
            hasEpsilon = true;
        else
            r.push(e);
    });

    // Always put epsilon at the end.
    if (hasEpsilon)
        r.push("ε");

    return r;
};

return {
    "Calculate": DumpFIRSTSetToArray
};

});
