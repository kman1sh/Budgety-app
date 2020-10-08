// L6 Onwards

var budgetController = (function () {

   //fn constructor to create each expense as an obj, having info like id, description and value.
   var Expense = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
   };

   Expense.prototype.calcPercentage = function (totalIncome) {

      if (totalIncome > 0) {
         this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
         this.percentage = -1;
      }
   };

   Expense.prototype.getPercentage = function () {
      return this.percentage;
   };


   var Income = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };
   // How to store  each exp and inc obj for budget Calutation? use two Array, one for each. and two var for totalexp and totalInc. This way we will have 4 data sturctures to hold our data
   // Sol: imagine on obj carrying two objs. one of these two objs will have all exp and inc. i.e arrays of their obj, and the 2nd will total exp and inc.
   // This way we will have one big Object which has the data.

   //Our big Data Stucture
   var data = {
      allItems: {
         //store respective objects.
         exp: [],
         inc: []
      },
      totals: {
         exp: 0,
         inc: 0
      },
      budget: 0,
      percentage: -1
   };

   function calculateTotal(type) {

      var sum = 0;
      data.allItems[type].forEach(function (curr) {
         sum += curr.value; // curr is obj of either exp/inc. So use .value to get value.
      });

      data.totals[type] = sum;
   }

   return {
      addItem: function (type, des, val) {
         var newItem, ID;

         //generating unique id's
         if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         } else {
            ID = 0;
         }
         if (type === 'exp') {
            newItem = new Expense(ID, des, val);
         } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
         }

         //instead of data.allItems.inc/exp.push() , we can use "type" variable at "inc/exp".push() as
         // its name match with our arrays name. Further in this way we don't need to check if newItem is exp or inc obj. 
         data.allItems[type].push(newItem);
         return newItem;
      },


      calculateBudget: function () {

         //calculate total income and expenses: becoz we need them in next spend
         calculateTotal('exp');
         calculateTotal('inc');

         // Calulate the budget: income - expenses
         data.budget = data.totals.inc - data.totals.exp;

         //calulate the percentage of income that we can spent. (only when income > 0 otherwise exp/inc = exp/0 = infinity)
         if (data.totals.inc > 0 && data.totals.exp < data.totals.inc) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         } else {
            data.percentage = '---';
         }
      },

      calculatePercentages: function () {
         // sabhi exp obj ka percentage calculate kre wahi bhi store kr diya.
         data.allItems.exp.forEach(function (curr) {
            curr.calcPercentage(data.totals.inc);
         });
      },

      //returns arrays of percentages
      getPercentages: function () {

         // storing each exp obj percentage in "allPerc" Array.
         var allPerc = data.allItems.exp.map(function (curr) {
            return curr.getPercentage();
         });

         return allPerc;
      },


      getBudget: function () {
         return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
         }
      },

      deleteItem: function (type, id) {
         var ids, index;
         // VERY Imp: note that this is id is not index at which this "item Obj" is stored in the array.
         // As we delete item, array elements shift and hence index varry. 
         // Since each obj in array also store their id, so just look for that, agr id match hua, matlb yahi wo element hai.

         // map() method is anther way to traverse array. the differece is it returns another array, whereas forEach does not.
         ids = data.allItems[type].map(function (curr) {
            //curr = each obj in [type] arr. -> curr.id: accessing id property of obj -> storing these ids in another array. 
            return curr.id;
         });

         // jo "index" id ka, ids array mai hoga, ussi 'index' pe hmra obj, inc/exp array mai pda hoga
         index = ids.indexOf(id); // return -1 if not found

         //to delete item from JS array we have "splice" method. (note different than slice: we use it convert list -> array)
         // splice(startingFromIdx, lengthTobeDeleted)
         if (index !== -1) {
            data.allItems[type].splice(index, 1);
         }
      },

      displayData: function () {
         console.log(data);
      }
   };


})();



var UIController = (function () {
   var DOMStrings = {
      inputType: ".add__type",
      inputDescription: ".add__description",
      inputValue: ".add__value",
      inputBtn: ".add__btn",
      incomeContainer: '.income__list',
      expenseContainer: '.expenses__list',
      budgetLable: '.budget__value',
      incomeLable: '.budget__income--value',
      expenseLable: '.budget__expenses--value',
      percentageLable: '.budget__expenses--percentage',
      container: '.container',
      expensesPercentageLable: '.item__percentage',
      dateLable: '.budget__title--month'
   };

   var nodeListForEach = function (list, callbackfn) {
      for (var i = 0; i < list.length; i++) {
         callbackfn(list[i], i);
      }
   };

   var formatNumber = function (num, type) {
      /*
      + or - befire number.
      exactly 2 decimal points.
      comma separating the thousands.
      */

      num = Math.abs(num); //removes +/- if it carrying

      //fix the number to 2 decimal. regardless ki wo pehle decimal carry kr rha tha ki nahi.
      // num = num.toFixed(2); // we can do this in toLocalString() method directly.

      //format number as Indian Standard. Returns a String
      num = num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // where we want to format Number? when we display. where? 
      //when we add item and it goes either in exp or income column of page.
      //when we display budget in top part of page.

      return ((type === 'inc') ? '+' : '-') + ' ' + num;
   };

   //returns a obj that has fns, and each fn has to return own obj
   return {
      //getInput() fn returns an obj, which deals with UI inputs.
      getInput: function () {
         return {
            type: document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
         };
      },

      //getDOMStrings() fn returns an obj, this obj deals which DOM naming. Incase DOM name get changed in future. we have to update same only at one place. i.e in DOMStrings object.
      getDOMStirngs: function () {
         return DOMStrings;
      },

      addItemToList: function (obj, type) {
         var html, newHtml, element;
         //Create HTML String with placeholder text. (for id, value etc)

         if (type === 'inc') {

            element = DOMStrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

         } else if (type === 'exp') {

            element = DOMStrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
         }

         // Replace the placeholder text with some actual data.
         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
         //Insert the HTML into the DOM.
         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      },

      deleteListItem: function (selectorID) { // inc-1, exp-3 etc
         // Using removeChild() method.
         // By DOM id, since we already know which DOM needs to be deleted, still we can't delete it directly.
         // In JS we cannot simply delete an element, WE can only delete a child. So we need to move up in the DOM to 
         // get parent and from here select the child which need to be deleted.

         var element = document.getElementById(selectorID);
         element.parentNode.removeChild(element);
      },

      clearFields: function () {
         var fields, fieldsArr;
         // we separate different selectors with comma string. (', ') in querySelectorAll.
         // Why we want querySelectorAll()? when we want to do same task on different selectors to be done at the same time..
         // querySelectorAll() returns a list instead of an Array which is little different than array and don't have methods as we have with arrays.

         fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

         // Solution: convert list -> in array, using array method slice. slice returns a copy of the array that it's called on. usually we called 
         // this method on array and then it returns another array. Here we will trick this method and pass a list and then it will still return an array.
         //slice method is a prototype property of Array fn constructor, Since apne pass koi array nahi hai jispe slice method call kr skte (arr.slice()).
         //so we will directly access it from Array fn Constrctr. and call it by call() method.

         fieldsArr = Array.prototype.slice.call(fields);

         // forEach loop, another way to loop over array
         // pass a callback fn into forEach() method (callback is, what you want to do will arr elements) and this callback fn will be applied to 
         // each of the elements in the array. this fn can be anonymous or arleady declared outside. we are using anonymous one here.
         // this anonymous fn can receive arguments (upto three),  like the eventListner callback fn anonymous.
         // Here we have to access to currentValue, currentIdx, and complete Array.

         fieldsArr.forEach(function (curr, idx, array) {
            curr.value = "";
         });

         fieldsArr[0].focus();
      },
      //agrument: array of percentages.
      displayPercentages: function (percentages) {
         var fields;

         //returns NodeList: all list of queries that matches with our argument.
         fields = document.querySelectorAll(DOMStrings.expensesPercentageLable);

         //Since NodeList dont have forEach loop. Previously we used a heck to convert list->Array using Array "slice" method.
         //Now let's see other way to do looping on Lists.
         // var nodeListForEach = function (list, callbackfn) {
         //    for (var i = 0; i < list.length; i++) {
         //       callbackfn(list[i], i);
         //    }
         // };

         // Note: above nodeListForEach is now made global.
         // what does above nodeListForEach fn do? It take our list and FOR EACH element in the list, performs operations told in callbackfn 
         // Why we are doing it this way when there are other ways too? Becoz it makes "nodeListForEach" Generic. 
         // If we are trying to implement same functionality somewhere else, just copy and paste from here and write own callbackfn and You are ready to go.
         // So it is for "code reusablity pactice" we are doing this.

         //calling nodeListForEach fn with anonymous callbackFn, which tells what to do with the list.
         nodeListForEach(fields, function (current, idx) {

            if (percentages[idx] > 0) {
               current.textContent = percentages[idx] + '%';
            } else {
               current.textContent = '---';
            }
         });

      },

      displayBudget: function (obj) {

         //obj.budget can also be -ve when total exp > total inc. So depending of this budget sign change.
         var type = (obj.budget >= 0) ? 'inc' : 'exp';
         document.querySelector(DOMStrings.budgetLable).textContent = formatNumber(obj.budget, type);
         document.querySelector(DOMStrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
         document.querySelector(DOMStrings.expenseLable).textContent = formatNumber(obj.totalExp, 'exp');

         if (obj.percentage > 0) {
            document.querySelector(DOMStrings.percentageLable).textContent = obj.percentage + '%';
         } else {
            document.querySelector(DOMStrings.percentageLable).textContent = '---';
         }
      },

      displayDate: function () {
         var now, month, year;

         now = new Date(); // date obj of current date. when obj is creatd.
         // var christmas = new Date(2020, 12, 25); //returns "DATE OBJECT" for input date. We don't want that.

         var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
         month = now.getMonth();
         year = now.getFullYear();
         document.querySelector(DOMStrings.dateLable).textContent = months[month] + ", " + year;


      },
      changedType: function () {

         var fields = document.querySelectorAll(
            DOMStrings.inputType + ',' +
            DOMStrings.inputDescription + ',' +
            DOMStrings.inputValue 
         );

         nodeListForEach(fields, function(curr) {
            curr.classList.toggle('red-focus');

         });

         document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

         
      }

   };
})();



var controller = (function (budgetCtrl, UICtrl) {

   //Since all eventListers are now part of a fn, instead of IIFE, it needs to  be invoked explicitly to run events. So create Initializaton(init) fn.
   var setupEventListerners = function () {
      var DOM = UICtrl.getDOMStirngs();

      document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
      document.addEventListener("keypress", function (event) {
         if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
         }
      });

      //adding eventListner to implement delete functionality to the budget app. (EVENT DELEGATION Technique)
      document.querySelector(DOM.container).addEventListener('click', crtlDeleteItem);

      // adding change evenet listener to change color of input fields and btns according to income/exp selection type.
      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
   };


   // 4th point fn
   var updateBudget = function () {

      // 1. Calculate the budget
      budgetCtrl.calculateBudget();
      // 2. Return the budget. again we will have another fn for this. Simply becoz we want each fn to do a specific task(Module Structure). 
      var budget = budgetCtrl.getBudget();
      // 3. Display the budget on the UI
      UICtrl.displayBudget(budget);
   };


   var updatePercentages = function () {

      // 1. Calculate percentage
      budgetCtrl.calculatePercentages();

      // 2. Read percentages from the budget controller
      var percentages = budgetCtrl.getPercentages();
      // 3. Update the UI with the new percentages.
      UICtrl.displayPercentages(percentages);
   }

   var ctrlAddItem = function () {

      var input, newItem;
      // 1. Get the text field input data (From UI Controller)
      input = UICtrl.getInput();

      if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
         // 2. Add the item to the budget controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);
         // 3. Add the item to the UI
         UICtrl.addItemToList(newItem, input.type);
         // 3.1 Clear Input fied
         UICtrl.clearFields();
         // 4. calculate and update the budget on the UI.
         updateBudget();

         // 5. Calculate and update percentages
         updatePercentages();


      }
   };

   var crtlDeleteItem = function (event) {
      var ItemID, splitID, type, ID;
      ItemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      // "if statement" will run only whne itemId is "defined" . "undefined" variable returns false.
      if (ItemID) {

         // inc-1
         splitID = ItemID.split('-'); // return Array of "STRINGS"
         type = splitID[0];
         ID = parseInt(splitID[1]); // since this is "string", parse it in int

         // 1. Delete the item from the data structure.
         budgetCtrl.deleteItem(type, ID);

         // 2. Delete the item from the UI.
         UICtrl.deleteListItem(ItemID); //pass complete id

         // 3. Update and show the new budget.
         updateBudget();

         // 4. Calculate and update percentages
         updatePercentages();

      }
   };

   return {
      init: function () {
         console.log("Application has started");

         UICtrl.displayDate();
         var emptyBudget = {
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: '---'
         };
         UICtrl.displayBudget(emptyBudget);
         setupEventListerners();
      },
   };
})(budgetController, UIController);

controller.init();
