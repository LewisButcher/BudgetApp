 /**********
   * DATA MODULE/BUDGET CONTROLLER
   * - Add event handler
   * 
*/
    var budgetController = (function() { 
        
        //Expense function constructor allows us to create lots of objects with the same properties.
        var Expense = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        };

        Expense.prototype.calcPercentage = function(totalIncome){
            
            if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
            }else{
                this.percentage = -1;
            }
        };

        Expense.prototype.getPercentage = function(){
            return this.percentage;
        }

        //Income function constructor allows us to create lots of objects with the same properties.
        var Income = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };

        var calcualteTotal = function(type){
            var sum = 0;
            //Loops around the relevant array and sums up the values
            data.allItems[type].forEach(function(current) {

                sum += current.value;

            });

            //Stores the sum of the relevant array in the totals object.
            data.totals[type] = sum;
        }


        //Object which stores all the data.
        var data = {
            //Object which stores the expenses and income inputted and stores them in an array.
            allItems: {
                exp: [],
                inc: []
            },
            //Object which keeps track of the total expenses and income.
            totals: {
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1
        }

        //Public method which allows other modules add a new item into the data structure.
        return {
            addItem: function(type, des, val){

                
                var newItem, ID;
                //Create new ID
                if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
                }else{
                    ID = 0;
                }

                // Create new item vased on 'inc' or 'exp' type
                if(type === 'exp'){
                     newItem = new Expense(ID, des, val);
                }else if(type === 'inc'){
                        newItem = new Income(ID, des, val);
                    }

                //stores the data in the allItems object arrays.
                data.allItems[type].push(newItem);

                //So other modules can have access to the newItems.
                return newItem;
            },

            deleteItem: function(type, id) {
                var ids, index;

                //produces an array of the ID's of each item for the relevant inc/exp array.
                ids = data.allItems[type].map(function(current) {

                    return current.id;

                });
                //gets the index number of the item wanting to be deleted by looking at the ID.
                index = ids.indexOf(id);

                //checking that the index of the item exists, eg the item is there.
                if(index !== -1){
                    //deletes the item with the relevent index using the splice method from arrays.
                    data.allItems[type].splice(index, 1);
                }

            },

            calculateBudget: function() {

                //1. Calculate total income and expenses.
                calcualteTotal('exp');
                calcualteTotal('inc');

                //2. Calculate the budget: income - expenses.
                data.budget = data.totals.inc - data.totals.exp;

                //3. Calculate the percentage of income that we spent, 
                if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                }else{
                    data.percentage = -1;
                }

            },

            calculatePercentages: function() {

                data.allItems.exp.forEach(function(current){
                    current.calcPercentage(data.totals.inc);
                });

            },



            //Returns the data.
            getBudget: function() {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                };
            },


            getPercentages: function() {
                var allPerc = data.allItems.exp.map(function(current){

                    return current.getPercentage();

                });
                return allPerc;
            },

            testing: function() {
                console.log(data);
            }

        };

    })();



 /************
  * UI CONTROLLER/MODULE
  * - Get input values
  * - Add the new item to the UI
  * - Update the UI
  * 
  */
    var UIController = (function(){

        //Object which contains the DOM strings to make code easier to adjust.
        var DOMStrings = {

            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expensesContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expenseLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercLabel:'.item__percentage',
            dateLabel: '.budget__title--month'
        };

        var nodeListForEach = function(list, callback) {
            for (var i = 0; i < list.length; i++){
                callback(list[i], i);
            }
        };

        var formatNumber = function(num, type) {
            var numSplit, int, dec;

            num = Math.abs(num);
            //puts the number to 2 decimal places.
            num = num.toFixed(2);
            //splits number at the decimal point and puts it in an array.
            numSplit = num.split('.');

            int = numSplit[0];
            if(int.length > 3) {
                int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
            }

            dec = numSplit[1];

            

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

        };

        return {
            getInput: function() {


                //returning an object so the Global App Controller/Module can access.
                return { 

                    type: document.querySelector(DOMStrings.inputType).value, //Will be either inc or exp
                    description: document.querySelector(DOMStrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMStrings.inputValue).value)

                };

                


            },

            addListItem: function(obj, type) {
                    var html, newHTML, element;
                //1. create HTML string with placeholder text

                    if(type === 'inc'){
                        
                        element = DOMStrings.incomeContainer;
                        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
                    }else if(type === 'exp'){

                        element = DOMStrings.expensesContainer;
                        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
                    }
                
                //2. replace the placeholder text with some actual data
                newHTML = html.replace('%id%', obj.id);
                newHTML = newHTML.replace('%description%', obj.description);
                newHTML = newHTML.replace('%value%', formatNumber(obj.value, type)); 


                //3. instert the HTML into the DOM

                document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

            },
            
            deleteListItem: function(selectorID) {

                var el = document.getElementById(selectorID);
                
                el.parentNode.removeChild(el);

            },


            clearFields: function(){
                var fields;

                fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
                //Converts the fields list into an array.
                fieldsArr = Array.prototype.slice.call(fields);

                //clears the fields.
                fieldsArr.forEach(function(current, index, array){
                    current.value = "";

                });

                fieldsArr[0].focus();

            },

            displayBudget: function(obj){
                var type;

                obj.budget > 0 ? type = 'inc' : type = 'exp';
                

                document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

                if(obj.percentage >= 1){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
                } else{
                    document.querySelector(DOMStrings.percentageLabel).textContent = '<1%'
                }

            },

            displayPercentages: function(percentages) {

                
                var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);


                nodeListForEach(fields, function(current, index) {

                   if(percentages[index] > 0){
                            current.textContent = percentages[index] + '%';
                    }else{
                            current.textContent = '<1%';
                    }
                });



            },

            displayDate: function() {
                var now, year;

                now = new Date();

                year = now.getFullYear();
                months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                month = now.getMonth();

                var date = document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

            },

            changedType: function(){

                var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

                fields.forEach(function(current){
                    current.classList.toggle('red-focus');
                });
                document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

            },
            
            //Object which returns the DOMStrings so other modules have access.
            getDOMStrings: function() {
                return DOMStrings;

            }
        };

    })();




  /************
 * GLOBAL APP CONTROLLER/MODULE
 * - Add the new item to our data structure
 * - Calc Budget
 * 
 */
    var controller = (function(budgetCtrl, UICtrl){

        //function for all Event Listeners which log when user clicks on the add button or presses enter.
        var setupEventListeners = function(){
            
            var DOM = UICtrl.getDOMStrings();


            //When the add button is clicked then the item is added to the lists by triggering the ctrAddItem function.
            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
            //When the enter key is pressed after filling in the fields then the item is added to the lists by triggering the ctrlAddItem function.
            document.addEventListener('keypress', function(event) {
                if(event.keyCode === 13 || event.which === 13){
            
                ctrlAddItem();
                }

            });

            /*Event listener triggers the delete item function when the container is clicked whichs is the first element
            which all income and expenses items have in common. Uses event delegation*/
            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

            document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        };

       

        var updateBudget = function() {

            //1. Calculate the budget
            budgetCtrl.calculateBudget();

            //2. Return the budget
            var budget = budgetCtrl.getBudget();

            //3. Display the budget on the UI
            UICtrl.displayBudget(budget);
            

        };

        var updatePercentages = function() {

            //1. calculate the percentages.
            budgetCtrl.calculatePercentages();
            

            //2. read them from the budget controller.
            var percentages = budgetCtrl.getPercentages();

            //3. update the UI.
            UICtrl.displayPercentages(percentages);
            console.log(percentages);

        }

      //function which adds new items.
        var ctrlAddItem = function() {

            var input, newItem;

            //1. Get the field input data

            input = UICtrl.getInput();

            //Ensures user cannot enter values which we cannot use.
            if(input.description !== "" && !isNaN(input.value) && input.value > 0){
                //2. Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                //3. Add the item to the UI

                UICtrl.addListItem(newItem, input.type);

                //4. Clear the fields.
                UICtrl.clearFields();

                //5 Calculate and update budget
                updateBudget();

                //6 update and show percentages 
                updatePercentages();
            }
            
        };

        var ctrlDeleteItem = function(event) {

            var itemID, splitID, type, ID;
            
            //gets the unique ID for the element clicked.
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

            if(itemID){

                //Splits the ID into an array of inc/exp and the ID number.
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);

                //1. delete the item from the data structure
                budgetCtrl.deleteItem(type, ID);

                //2. delete the item from the UI.
                UICtrl.deleteListItem(itemID);

                //3. Update and show the new budget.
                updateBudget();

                //4. Update and show percentages 
                updatePercentages(); 

            }

        };



        //Public initilisation function (init) which makes the setupEventListeners function public.
        return {
            
            init: function() {
                console.log('App has started.');
                UICtrl.displayBudget({
                     budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: 0});
                setupEventListeners();
                UICtrl.displayDate();
            }
        };


    })(budgetController, UIController);

    //Calls the init function so the Event Listeners start as soon as the app is open.
    controller.init();
