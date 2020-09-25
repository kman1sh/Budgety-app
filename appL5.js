//Implementing the module pattern

var budgetController = (function() {
  var x = 25;

  var add = function(a) {
    return x + a;
  };

  return {
    publicTest: function(b) {
      return add(b);
    }
  };
})();

var UIController = (function() {
  //Code here
})();

var controller = (function(budgetCtrl, UICtrl) {
  var z = budgetCtrl.publicTest(5);

  return {
    otherPublicTest: function(a) {
      console.log(a);
    }
  };
})(budgetController, UIController);
