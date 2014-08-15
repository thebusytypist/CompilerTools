require(["dependency/qunit"], function() {
    QUnit.module("First Test");

    QUnit.test("Trivial test", function() {
        expect(1);

        equal(1, 2, "Expect 2");
    });
});
