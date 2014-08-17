require.config({
    baseUrl: "../",
    paths: {
        "dependency/qunit": "dependency/qunit-1.15.0"
    },
    shim: {
        "dependency/qunit": {
            exports: "QUnit",
            init: function() {
                QUnit.config.autoload = false;
                QUnit.config.autostart = false;
            }
        }
    }
});

require(
    ["dependency/qunit",
     "test/grammarparsertest"],

    function() {
        
QUnit.load();
QUnit.start();

});
