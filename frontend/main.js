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
     "dependency/bootstrap"],
    function(grammarast) {

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

});
