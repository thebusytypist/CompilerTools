require.config({
    baseUrl: ".",
    paths: {
        "dependency/jquery": "dependency/jquery-2.1.1.min",
        "dependency/bootstrap": "dependency/bootstrap.min"
    },
    shim: {
        "dependency/bootstrap": {
            "deps": ["dependency/jquery"]
        }
    }
});

require(
    ["frontend/grammarast",
     "src/grammarparser",
     "src/firstfollow",
     "dependency/bootstrap"],
    function(grammarast,
             grammarparser,
             firstfollow) {

// -----------------------------------------------------------------------------
// Grammar
// -----------------------------------------------------------------------------
var grammarContainer = document.getElementById("ct-grammar-container");
var grammarTextarea = document.getElementById("ct-grammar");
var onGrammarTextareaInput = function(e) {
    var text = e.target.value;
    var r = grammarast.UpdateGrammarAST(text);
    if (r === true) {
        grammarContainer.classList.remove("has-error");
        grammarContainer.classList.add("has-success");
    }
    else {
        grammarContainer.classList.remove("has-success");
        grammarContainer.classList.add("has-error");
    }

    // Update displays which depends on grammar.
    updateFirstSetResult(fsSyms.value);
    updateFollowSetResult();
};
grammarTextarea.addEventListener("input", onGrammarTextareaInput);

// -----------------------------------------------------------------------------
// FIRST Set
// -----------------------------------------------------------------------------
var fsSymsContainer = document.getElementById("ct-firstset-symbols-container");
var fsSyms = document.getElementById("ct-firstset-symbols");
var fsResult = document.getElementById("ct-firstset-result");
var updateFirstSetResult = function(text) {
    var isWhitespace = function(t) {
        var p = /^\s*$/;
        return p.test(t);
    };

    var display = function(result) {
        var content = result.join(" ");
        fsResult.textContent = content;
    };

    if (isWhitespace(text) || grammarast.GetGrammarAST() === null) {
        fsSymsContainer.classList.remove("has-success");
        fsSymsContainer.classList.remove("has-error");
        display([]);
    }
    else {
        var s = firstfollow.CalculateFirstSet(grammarast.GetGrammarAST(), text);
        if (s !== null) {
            fsSymsContainer.classList.remove("has-error");
            fsSymsContainer.classList.add("has-success");
            display(s);
        }
        else {
            fsSymsContainer.classList.remove("has-success");
            fsSymsContainer.classList.add("has-error");
            display([]);
        }
    }
};
var onSymbolsInput = function(e) {
    var text = e.target.value;
    updateFirstSetResult(text);
};
fsSyms.addEventListener("input", onSymbolsInput);

// -----------------------------------------------------------------------------
// FOLLOW Set
// -----------------------------------------------------------------------------
var followSetResult = document.getElementById("ct-followset-result");
var updateFollowSetResult = function() {
    followSetResult.innerHTML = "";
    var head = "<tr><th>Non-Terminal</th>" +
                   "<th>FOLLOW Set</th></tr>";
    var content = head;
    if (grammarast.GetGrammarAST() !== null) {
        var r = firstfollow.CalculateFollowSets(grammarast.GetGrammarAST());
        for (var k in r) {
            var v = r[k];
            var t = v.join(" ");
            var c = "<tr><td>" +
                    k +
                    "</td>" +
                    "<td>" +
                    t +
                    "</td></tr>";
            content = content + c;
        };
    }

    followSetResult.innerHTML = content;
};

// -----------------------------------------------------------------------------
// 
// -----------------------------------------------------------------------------
});
