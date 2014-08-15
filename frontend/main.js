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
    ["dependency/jquery",
     "dependency/bootstrap"],
    function() {
});
