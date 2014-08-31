define(["src/grammarparser"], function(grammarparser) {

// -----------------------------------------------------------------------------
// First Set
// -----------------------------------------------------------------------------

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

var MergeSetExceptEmpty = function(a, b) {
    var r = new Set;
    a.forEach(function(e) {
        if (e !== null)
            r.add(e);
    });
    b.forEach(function(e) {
        if (e !== null)
            r.add(e);
    });
    return r;
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
            s = MergeSetExceptEmpty(s, n);
            if (i === count - 1 && n.has(null))
                s.add(null);

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

var CalculateFirstSet = function(ast, text) {
    var symbols = grammarparser.ParseSentence(text);

    if (symbols === null || !IsDefinedSentence(ast, symbols))
        return null;

    return CalculateFirstSetOfSymbols(ast, symbols);
};

var DumpFirstSetToArray = function(ast, text) {
    var first = CalculateFirstSet(ast, text);

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

// -----------------------------------------------------------------------------
// Follow Set
// -----------------------------------------------------------------------------

var InitializeFollowSets = function(ast) {
    var m = new Map;

    var AddNonTerminal = function(symbol) {
        var v = symbol.GetValue();
        if (!m.has(v)) {
            var s = new Set;
            m.set(v, s);
        }
    };

    // Create table of follow set for all non-terminals.
    for (var i = 0, count = ast.GetProductionCount(); i < count; ++i) {
        var p = ast.GetProduction(i);

        AddNonTerminal(p.GetHead());

        for (var j = 0, c = p.GetBody().GetSymbolCount(); j < c; ++j) {
            var s = p.GetBody().GetSymbol(j);
            if (!s.IsTerminal())
                AddNonTerminal(s);
        }
    }

    // Initialize follow set for start symbol.
    if (ast.GetProductionCount() > 0) {
        var p = ast.GetProduction(0);
        var head = p.GetHead();
        m.get(head.GetValue()).add("$");
    }

    return m;
};

var CalculateFollowSets = function(ast) {
    var m = InitializeFollowSets(ast);

    // Cache first set of items in ast.
    // The key for cache element is
    // (production-index, start-item-index-of-body)
    var firstSets = [];
    var GetFirstSet = function(pi, ii) {
        if (firstSets[pi] === undefined)
            firstSets[pi] = [];
        if (firstSets[pi][ii] === undefined) {
            var s = ast.GetProduction(pi).GetBody().GetSymbols().slice(ii);
            firstSets[pi][ii] = CalculateFirstSetOfSymbols(ast, s);
        }
        return firstSets[pi][ii];
    };

    // Iteratively update follow sets until no change take place.
    var UpdateFollowSets = function() {
        var changed = false;

        var productionCount = ast.GetProductionCount();
        for (var i = 0; i < productionCount; ++i) {
            var p = ast.GetProduction(i);
            var body = p.GetBody();

            var count = body.GetSymbolCount();
            var s = body.GetSymbols();

            for (var j = 0; j < count; ++j) {
                if (s[j].IsTerminal())
                    continue;

                // Get first set of suffix.
                var fs = GetFirstSet(i, j + 1);
                var k = s[j].GetValue();

                if (j !== count - 1) {
                    // For A -> aBb where b does not contain only empty.
                    var r = m.get(k);
                    var oldSize = r.size;
                    m.set(k, MergeSetExceptEmpty(r, fs));

                    if (oldSize !== m.get(k).size)
                        changed = true;
                }

                if (j === count - 1 || fs.has(null)) {
                    // For A -> aB or
                    // A -> aBb where b contains empty.
                    var r = m.get(k);
                    var oldSize = r.size;
                    var h = p.GetHead().GetValue();
                    m.set(k, MergeSet(r, m.get(h)));

                    if (oldSize !== m.get(k).size)
                        changed = true;
                }
            }
        }

        return changed;
    };

    while (UpdateFollowSets());

    return m;
};

var DumpRawFollowSetsToObject = function(ast) {
    var m = CalculateFollowSets(ast);

    var r = {};
    m.forEach(function(v, k) {
        r[k] = [];
        var hasEndMark = false;
        v.forEach(function(e) {
            if (e === "$")
                hasEndMark = true;
            else
                r[k].push(e);
        });
        // Always put end mark at the end.
        if (hasEndMark)
            r[k].push("$");
    });
    return r;
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------
return {
    "CalculateFirstSet": DumpFirstSetToArray,
    "CalculateFollowSets": DumpRawFollowSetsToObject
};

});
