sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, Fragment,JSONModel,MessageToast) => {
    "use strict";

    return Controller.extend("smartexpense.controller.View1", {
        onInit() {
            this._generateDashboard();
            var aMonths = [];
            var oDate = new Date(2023, 0, 1); // Start from Jan 2023 (change as needed)
            var oToday = new Date(); // Current date
            console.log(oDate,oToday);
            while (
                oDate.getFullYear() < oToday.getFullYear() ||
                (oDate.getFullYear() === oToday.getFullYear() && oDate.getMonth() <= oToday.getMonth())
            ) {
                var mm = String(oDate.getMonth() + 1).padStart(2, "0");
                var yyyy = oDate.getFullYear();

                aMonths.push({
                    key: mm + "/" + yyyy, // MM/yyyy
                    text: oDate.toLocaleString("default", { month: "long" }) + " " + yyyy
                });
                console.log(aMonths);
                oDate.setMonth(oDate.getMonth() + 1);
            }

            var oMonthsModel = new JSONModel({ months: aMonths });
            console.log("oMonthsModel",oMonthsModel);
            this.getView().setModel(oMonthsModel, "monthsModel");
            //console.log(oMonthsModel/months/key(0));
            // Preselect current month
            var sCurrentKey = String(oToday.getMonth() + 1).padStart(2, "0") + "/" + oToday.getFullYear();
            console.log(oToday.getMonth(),sCurrentKey);
            this.byId("monthYearSelect").setSelectedKey(sCurrentKey);
        },
         onMonthYearChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Selected: " + sKey);
        },
        onAddExpenses: function () {
            // var rI = this.getView().getModel("AppModel").getProperty("/newExpense/category");
            // console.log(rI);
            //var that = this;

            if (!this._oDialog) {

                Fragment.load({
                    id: "AddExpensesFrag",
                    name: "smartexpense.fragments.AddExpenses",
                    controller: this
                }).then(function (oDialog) {

                    this._oDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    oDialog.open();

                }.bind(this));


            } else {
                this._oDialog.open();
            }
            var oModel = this.getView().getModel("AppModel");
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd-MM-yyyy"
            });

            var sToday = oDateFormat.format(new Date());
            console.log(sToday);
            oModel.setProperty("/newExpense/date", sToday);

            // oModel.setProperty("/newExpense", {
            //     category: "",
            //     amount: "",
            //     date: new Date(),   // Today's date
            //     description: ""
            // });
        },
        _generateDashboard: function () {
            console.log("Generating dashboard...");
            var oModel = this.getOwnerComponent().getModel("AppModel");
            console.log(this);
            console.log(this.getView().getModel());
            // Read expenses
            console.log("checking expenses: "+ oModel.getProperty("/expenses"));
            var aExpenses = oModel.getProperty("/expenses") || [];
            console.log(aExpenses);
            // Selected month (01-12)
            var sSelectedMonth = oModel.getProperty("/selectedMonth");
            console.log("Selected month: " + sSelectedMonth);
            // Temporary object for grouping by date
            var oChart = {};

            // Totals
            var oTotals = {
                food: 0,
                travel: 0,
                accommodation: 0,
                others: 0,
                expense: 0
            };

            // Loop through expenses
            aExpenses.forEach(function (oExpense) {
                console.log("Processing expense: ", oExpense);

                // Example date: 2026-06-30
                var sMonth = oExpense.date.substring(3, 5);
                console.log("Expense month: " + sMonth);

                // Skip if not selected month
                // if (sMonth !== sSelectedMonth) {
                //     console.log("Skipping expense for month: " + sMonth);
                //     return;
                // }

                // Get day
                var sDate = oExpense.date.substring(0, 2);
                console.log("Expense date: " + sDate);

                // Create date object if not exists
                if (!oChart[sDate]) {

                    oChart[sDate] = {
                        date: sDate,
                        food: 0,
                        travel: 0,
                        accommodation: 0,
                        others: 0
                    };
                }

                // Add amount to category
                console.log("Adding expense to category: ", oExpense.category, " Amount: ", oExpense.amount);
                switch (oExpense.category) {

                    case "Food":

                        oChart[sDate].food += Number(oExpense.amount);
                        oTotals.food += Number(oExpense.amount);
                        break;

                    case "Travel":
                        console.log("Adding travel expense: ", oExpense.amount);
                        oChart[sDate].travel += Number(oExpense.amount);
                        oTotals.travel += Number(oExpense.amount);
                        break;

                    case "Accommodation":

                        oChart[sDate].accommodation += Number(oExpense.amount);
                        oTotals.accommodation += Number(oExpense.amount);
                        break;

                    default:

                        oChart[sDate].entertainment += Number(oExpense.amount);
                        oTotals.entertainment += Number(oExpense.amount);
                }

                // Total expense
                oTotals.expense += Number(oExpense.amount);

            });

            // Convert object to array
            var aChartData = Object.values(oChart);

            // Sort by date
            aChartData.sort(function (a, b) {

                return Number(a.date) - Number(b.date);

            });

            // Update chart data
            console.log("Chart Data: ", aChartData);
            oModel.setProperty(
                "/chartData",
                aChartData
            );
            

            // Update totals
            oModel.setProperty(
                "/totals",
                oTotals
            );

        },
        onSaveExpense: function () {

            var oModel = this.getView().getModel("AppModel");


            // Read current expense entered in the dialog
            var oExpense = oModel.getProperty("/newExpense");

            // Read existing expenses
            var aExpenses = oModel.getProperty("/expenses");
            // console.log(oModel.getProperty("/expenses"));
            oExpense.amount = Number(oExpense.amount);

            // Add a copy of the new expense
            aExpenses.push({ ...oExpense });

            // Update the model
            oModel.setProperty("/expenses", aExpenses);

            // Clear the form
            oModel.setProperty("/newExpense", {
                category: "",
                amount: "",
                date: "",
                description: ""
            });

            //console.log(oModel.getProperty("/newExpenses"));
            console.log(oModel.getProperty("/expenses"));
            // Close the dialog
            this._generateDashboard();
            this._oDialog.close();
        },

        onCloseDialog: function () {
            var oSelect = sap.ui.core.Fragment.byId(
                "AddExpensesFrag",
                "categorySelect"
            );

            console.log(oSelect.getSelectedKey());

            var sCategory = this.getView()
                .getModel("AppModel")
                .getProperty("/newExpense/category");

            console.log(sCategory);

            // Optional: Clear the form when Cancel is clicked
            var oModel = this.getView().getModel("AppModel");

            oModel.setProperty("/newExpense", {
                category: "",
                amount: "",
                date: "",
                description: ""
            });

            this._oDialog.close();
        }
    });
});