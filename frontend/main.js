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
     "src/firstset",
     "dependency/bootstrap"],
    function(grammarast,
             grammarparser,
             firstset) {

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
};
grammarTextarea.addEventListener("input", onGrammarTextareaInput);

// -----------------------------------------------------------------------------
// FIRST Set
// -----------------------------------------------------------------------------
var fsSymsContainer = document.getElementById("ct-firstset-symbols-container");
var fsSyms = document.getElementById("ct-firstset-symbols");
var onSymbolsInput = function(e) {
    var text = e.target.value;
    var symbols = grammarparser.Tokenize(text);
    if (symbols.length === 0) {
        fsSymsContainer.classList.remove("has-success");
        fsSymsContainer.classList.remove("has-error");
    }
    else {
        if (firstset.Validate(grammarast.GetGrammarAST(), symbols)) {
            fsSymsContainer.classList.remove("has-error");
            fsSymsContainer.classList.add("has-success");
        }
        else {
            fsSymsContainer.classList.remove("has-success");
            fsSymsContainer.classList.add("has-error");
        }
    }
};
fsSyms.addEventListener("input", onSymbolsInput);

});
