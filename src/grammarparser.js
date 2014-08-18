define(function() {
var TokenType = {
    INVALID: -1,
    TERMINAL: 0,
    NONTERMINAL: 1,
    EQUAL: 2,
    DOT: 3
};

var Token = function(type, text) {
    this.Type = type;
    this.Value = text;
    return this;
};

var Tokenize = function(text) {
    // Isolate the dots(".") form their neighbors.
    var list = text.replace(/\n/g, " ")
                   .split(".")
                   .join(" . ")
                   .split(" ")
                   .filter(function(x) {return x !== "";});

    var patterns = [
        /^[A-Z]\w*$/, // Terminal
        /^[a-z]\w*$/, // Non-terminal
        /^::=$/,      // Equal
        /^\.$/        // Dot
    ];

    var map = function(s) {
        for (var t in TokenType) {
            var v = TokenType[t];
            if (v !== TokenType.INVALID) {
                if (patterns[v].test(s))
                    return new Token(v, s);
            }
        }

        return new Token(TokenType.INVALID, null);
    }

    return list.map(map);
};

var IsValidTokenList = function(tokens) {
    for (var i = 0, count = tokens.length; i < count; ++i) {
        if (tokens[i].Type === TokenType.INVALID)
            return false;
    }
    return true;
};

var GrammarAST = function(productions) {
    this.GetProductionCount = function() {
        return productions.length;
    };
    this.GetProduction = function(i) {
        return productions[i];
    };
    return this;
};

var ProductionAST = function(head, body) {
    this.GetHead = function() {
        return head;
    };
    this.GetBody = function() {
        return body;
    };
    return this;
};

var BodyAST = function(symbols) {
    this.GetSymbolCount = function() {
        return symbols.length;
    };
    this.GetSymbol = function(i) {
        return symbols[i];
    };
    this.IsEmpty = function() {
        return symbols.length === 0;
    };
    return this;
};

var SymbolAST = function(token) {
    this.GetValue = function() {
        return token.Value;
    };
    this.IsTerminal = function() {
        return token.Type === TokenType.TERMINAL;
    };
    this.IsEqualTo = function(s) {
        return s.IsTerminal() === this.IsTerminal() &&
               s.GetValue() === this.GetValue();
    }
    return this;
};

/*  Grammar for grammar parser:
    Element of parsing table will use
    the label before every production to refer a production.

    (0)  grammar ::= productionlist.

    (1)  productionlist ::= productionlistrhs.
    (2)  productionlistrhs ::= production productionlistrhs.
    (3)  productionlistrhs ::= .

    (4)  production ::= head EQUAL body DOT.
    (5)  head ::= NONTERMINAL.
    (6)  body ::= symbollist.

    (7)  symbollist ::= symbollistrhs.
    (8)  symbollistrhs ::= symbol symbollistrhs.
    (9)  symbollistrhs ::= .

    (10) symbol ::= TERMINAL.
    (11) symbol ::= NONTERMINAL.
*/
/*  FOLLOW set for grammar parser:
    
    grammar: {$}
    productionlist: {$}
    productionlistrhs: {$}
    production: {NONTERMINAL, $}
    head: {EQUAL}
    body: {DOT}
    symbollist: {DOT}
    symbollistrhs: {DOT}
    symbol: {NONTERMINAL, DOT}
*/
/*  Parsing table for grammar parser:
    
    (grammar, NONTERMINAL) -> (0)
    (grammar, $) -> (0)

    (productionlist, NONTERMINAL) -> (1)
    (productionlist, $) -> (1)

    (productionlistrhs, NONTERMINAL) -> (2)

    (productionlistrhs, $) -> (3)

    (production, NONTERMINAL) -> (4)

    (head, NONTERMINAL) -> (5)

    (body, TERMINAL) -> (6)
    (body, NONTERMINAL) -> (6)
    (body, DOT) -> (6)

    (symbollist, TERMINAL) -> (7)
    (symbollist, NONTERMINAL) -> (7)
    (symbollist, DOT) -> (7)

    (symbollistrhs, TERMINAL) -> (8)
    (symbollistrhs, NONTERMINAL) -> (8)

    (symbollistrhs, DOT) -> (9)

    (symbol, TERMINAL) -> (10)

    (symbol, NONTERMINAL) -> (11)
*/

// Append non-terminal type definitions after terminal ones'.
var NonTerminalType = {
    grammar: 4,
    productionlist: 5,
    productionlistrhs: 6,
    production: 7,
    head: 8,
    body: 9,
    symbollist: 10,
    symbollistrhs: 11,
    symbol: 12
};

// Production list. The production body is stored in reverse order.
var Productions = [
    [NonTerminalType.productionlist],
    [NonTerminalType.productionlistrhs],
    [NonTerminalType.productionlistrhs, NonTerminalType.production],
    [],
    [TokenType.DOT,
     NonTerminalType.body,
     TokenType.EQUAL,
     NonTerminalType.head],
    [TokenType.NONTERMINAL],
    [NonTerminalType.symbollist],
    [NonTerminalType.symbollistrhs],
    [NonTerminalType.symbollistrhs, NonTerminalType.symbol],
    [],
    [TokenType.TERMINAL],
    [TokenType.NONTERMINAL]
];

// Predict the production.
var Predict = function(s, input) {
    switch (s) {
    case NonTerminalType.grammar:
        if (input === "$" || input.Type === TokenType.NONTERMINAL)
            return 0;
        break;

    case NonTerminalType.productionlist:
        if (input === "$" || input.Type === TokenType.NONTERMINAL)
            return 1;
        break;

    case NonTerminalType.productionlistrhs:
        if (input.Type === TokenType.NONTERMINAL)
            return 2;
        else if (input === "$")
            return 3;
        break;

    case NonTerminalType.production:
        if (input.Type === TokenType.NONTERMINAL)
            return 4;
        break;

    case NonTerminalType.head:
        if (input.Type === TokenType.NONTERMINAL)
            return 5;
        break;

    case NonTerminalType.body:
        if (input.Type === TokenType.NONTERMINAL ||
            input.Type === TokenType.TERMINAL ||
            input.Type === TokenType.DOT)
            return 6;
        break;

    case NonTerminalType.symbollist:
        if (input.Type === TokenType.NONTERMINAL ||
            input.Type === TokenType.TERMINAL ||
            input.Type === TokenType.DOT)
            return 7;
        break;

    case NonTerminalType.symbollistrhs:
        if (input.Type === TokenType.NONTERMINAL ||
            input.Type === TokenType.TERMINAL)
            return 8;
        else if (input.Type === TokenType.DOT)
            return 9;
        break;

    case NonTerminalType.symbol:
        if (input.Type === TokenType.TERMINAL)
            return 10;
        else if (input.Type === TokenType.NONTERMINAL)
            return 11;
        break;
    }

    return null;
};

var Handler = function() {
    var symbols = [];
    var head = undefined;
    var body = undefined;
    var productions = [];
    var grammar = null;

    // Handle specific productions on current token.
    this.Handle = function(p, token) {
        switch (p) {
        case 10:
        case 11:
            symbols.push(new SymbolAST(token));
            break;

        case 6:
            body = new BodyAST(symbols);
            symbols = [];
            break;

        case 5:
            head = new SymbolAST(token);
            break;

        case 4:
            productions.push(new ProductionAST(head, body));
            break;

        case 0:
            grammar = new GrammarAST(productions);
            productions = [];
            break;
        }
    };

    this.GetASTRoot = function() {
        return grammar;
    };

    return this;
};

var Parse = function(tokens) {
    // Append ending mark.
    var t = tokens.concat(["$"]);

    // Initialize parsing stack(0 is the bottom of stack).
    var stack = ["$", NonTerminalType.grammar];

    var i = 0;
    var top = stack.length - 1;
    var handler = new Handler;
    // Tells where and when a production is fully generated.
    // This information is stored in a stack.
    // Every stack element contains the start position of a production
    // and the index of the production.
    var s = [];
    while (stack[top] !== "$") {
        if (stack[top] === t[i].Type) {
            while (s.length > 0 && s[s.length - 1][0] === top) {
                var p = s[s.length - 1][1];
                handler.Handle(p, t[i]);
                s.pop();
            }
            stack.pop();
            ++i;
        }
        else if (stack[top] < NonTerminalType.grammar) {
            // It is a terminal.
            return null;
        }
        else {
            var p = Predict(stack[top], t[i]);
            if (p === null)
                return null;
            else {
                s.push([top, p]);
                var production = Productions[p];
                stack.pop();
                stack = stack.concat(production);
                if (production.length === 0) {
                    // Handle epsilon-transition.
                    while (s.length > 0 && s[s.length - 1][0] === top) {
                        var k = s[s.length - 1][1];
                        handler.Handle(k);
                        s.pop();
                    }
                }
            }
        }
        top = stack.length - 1;
    }
    return handler.GetASTRoot();
};

return {
    "TokenType": TokenType,
    "Tokenize": Tokenize,
    "IsValidTokenList": IsValidTokenList,
    "Parse": Parse
};

});
