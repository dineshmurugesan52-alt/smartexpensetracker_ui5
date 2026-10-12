sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Fragment, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("smartexpense.controller.View1", {
        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .getRoute("dashboard")
                .attachPatternMatched(
                    this._onDashboardMatched,
                    this
                );

            var oViewModel = new JSONModel({
                monthly: {
                    month: "",
                    totalExpense: 0,
                    food: 0,
                    travel: 0,
                    accommodation: 0,
                    others: 0
                }
            });

            this.getView().setModel(oViewModel, "view");
            var oDatePicker = this.byId("_IDGenDatePicker");

            oDatePicker.setMaxDate(new Date());
            oDatePicker.setDateValue(new Date());
            this._sSelectedMonth = oDatePicker.getValue();
            this._loadMonthlyExpense(this._sSelectedMonth);
            this._applyMonthFilters(this._sSelectedMonth);

        },
        onMonthYearChange: function (oEvent) {

            var sMonth = oEvent.getSource().getValue();

            if (!sMonth) {
                return;
            }
            this._sSelectedMonth = sMonth;

            this._loadMonthlyExpense(sMonth);
            this._applyMonthFilters(sMonth);
        },
        onBeforeRendering: function () {
            this._loadMonthlyExpense(this.byId("_IDGenDatePicker").getValue());
        },
        _loadMonthlyExpense: async function (sMonth) {
            var oModel = this.getOwnerComponent().getModel("expense");
            var oFilter = new Filter(
                "month",
                FilterOperator.EQ,
                sMonth
            );
            var oBinding = oModel.bindList(
                "/ExpenseMonthly",
                undefined,
                undefined,
                [oFilter],
                {
                    $$operationMode: "Server"
                }
            );
            try {
                var aContexts = await oBinding.requestContexts();

                if (aContexts.length === 0) {
                    this._resetMonthlyData();
                    MessageBox.information("No expense data found for " + sMonth);
                    return;
                }

                var oData = aContexts[0].getObject();
                this.getView().getModel("view").setProperty("/monthly", {
                    month: oData.month,
                    totalExpense: oData.totalExpense || 0,
                    food: oData.food || 0,
                    travel: oData.travel || 0,
                    accommodation: oData.accommodation || 0,
                    others: oData.others || 0
                });
            } catch {
                MessageBox.error("Failed to load monthly expense data.");
            }
        },


        _resetMonthlyData: function () {

            this.getView()
                .getModel("view")
                .setProperty("/monthly", {
                    month: "",
                    totalExpense: 0,
                    food: 0,
                    travel: 0,
                    accommodation: 0,
                    others: 0
                });
        },

        _onDashboardMatched: function () {

            var oTable = this.byId("expenseTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.refresh();
            }
            var oChart = this.byId("_IDGenFlattenedDataset");
            var oChartBinding = oChart.getBinding("data");
            if (oChartBinding) {
                console.log("Refreshing chart data binding.");
                oChartBinding.refresh();
            }
            if (this._sSelectedMonth) {
                this._loadMonthlyExpense(this._sSelectedMonth);
                this._applyMonthFilters(this._sSelectedMonth);
            }
        },
        _createMonthFilter: function (sMonth) {
            var aParts = sMonth.split("-");
            var iYear = Number(aParts[0]);
            var iMonth = Number(aParts[1]);
            var sStartDate = sMonth + "-01";
            var sNextMonth = iMonth === 12
                ? (iYear + 1) + "-01-01"
                : iYear + "-" + String(iMonth + 1).padStart(2, "0") + "-01";

            return new Filter({
                filters: [
                    new Filter("date", FilterOperator.GE, sStartDate),
                    new Filter("date", FilterOperator.LT, sNextMonth)
                ],
                and: true
            });
        },
        _applyMonthFilters: function (sMonth) {
            var oTable = this.byId("expenseTable");
            var oTableBinding = oTable && oTable.getBinding("items");

            if (oTableBinding) {
                oTableBinding.filter([this._createMonthFilter(sMonth)]);
            }
            console.log("Applying month filter to table for:", sMonth);
            console.log("this._applyChartMonthFilter:", this._applyChartMonthFilter);
            console.log("Applying month filters.");
            this._applyChartMonthFilter(sMonth);
        },
        _applyChartMonthFilter: function (sMonth) {
            var oChart = this.byId("expenseChart");
            var oDataset = oChart && oChart.getDataset();

            if (!oDataset) {
                MessageBox.error("Chart or dataset not found.");
                return;
            }
            console.log("Applying month filter to chart for:", oDataset);
            // Remove the old dataset binding and create a new binding.
            oDataset.unbindData();

            oDataset.bindData({
                path: "expense>/ExpenseChart",
                filters: [this._createMonthFilter(sMonth)],
                parameters: {
                    $$operationMode: "Server"
                }
            });
        },
        // _applyChartMonthFilter: function (sMonth) {
        //     var oChart = this.byId("expenseChart");

        //     if (!oChart) {
        //         console.error("Chart with ID 'expenseChart' was not found.");
        //         return;
        //     }

        //     var oDataset = oChart.getDataset();

        //     if (!oDataset) {
        //         console.error("Chart dataset was not found.");
        //         return;
        //     }

        //     var oBinding = oDataset.getBinding("data");

        //     if (!oBinding) {
        //         console.error("Chart data binding was not found.");
        //         return;
        //     }

        //     // sMonth format: "2026-09"
        //     var aParts = sMonth.split("-");
        //     var iYear = Number(aParts[0]);
        //     var iMonth = Number(aParts[1]);

        //     // First day of selected month
        //     var sStartDate = sMonth + "-01";

        //     // First day of next month
        //     var sNextMonth;

        //     if (iMonth === 12) {
        //         sNextMonth = (iYear + 1) + "-01-01";
        //     } else {
        //         sNextMonth =
        //             iYear + "-" +
        //             String(iMonth + 1).padStart(2, "0") +
        //             "-01";
        //     }

        //     var Filter = sap.ui.model.Filter;
        //     var FilterOperator = sap.ui.model.FilterOperator;

        //     var oMonthFilter = new Filter({
        //         filters: [
        //             new Filter("date", FilterOperator.GE, sStartDate),
        //             new Filter("date", FilterOperator.LT, sNextMonth)
        //         ],
        //         and: true
        //     });

        //     oBinding.filter([oMonthFilter]);

        //     console.log("Chart filtered for:", sMonth);
        // },
        // onBeforeRendering: function () {
        //     var oTable = this.byId("expenseTable");
        //     var oBinding = oTable.getBinding("items");

        //     if (oBinding) {
        //         oBinding.refresh();
        //     }
        //     var oChart=this.byId("_IDGenFlattenedDataset");
        //     var oChartBinding=oChart.getBinding("data");
        //     if (oChartBinding) {
        //         oChartBinding.refresh();
        //     }
        // },
        onDelete: function (oEvent) {

            var oButton = oEvent.getSource();

            var oContext = oButton.getBindingContext("expense");

            oContext.delete().then(function () {
                MessageToast.show("Expense deleted successfully");
            }).catch(function (oError) {
                MessageToast.show("Error deleting expense: " + oError.message);
            });

            if (this._sSelectedMonth) {
                this._loadMonthlyExpense(this._sSelectedMonth);
            }
        },

        // onAddExpenses: function (oEvent) {
        //     // var rI = this.getView().getModel("AppModel").getProperty("/newExpense/category");
        //     console.log("development");
        //     //var that = this;
        //     var a = oEvent.getSource().getBindingContext();
        //     //var b=a.getProperty("amount");
        //     console.log(a);
        //     console.log("New" + oEvent.getSource());
        //     var bc = oEvent.getSource().getBindingContext();
        //     //console.log(bc.getProperty("category"));
        //     if (!this._oDialog) {

        //         Fragment.load({
        //             id: "AddExpensesFrag",
        //             name: "smartexpense.fragments.AddExpenses",
        //             controller: this
        //         }).then(function (oDialog) {

        //             this._oDialog = oDialog;
        //             this.getView().addDependent(oDialog);
        //             oDialog.open();

        //         }.bind(this));


        //     } else {
        //         this._oDialog.open();
        //     }
        //     var oModel = this.getView().getModel("AppModel");
        //     var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        //         pattern: "dd-MM-yyyy"
        //     });

        //     var sToday = oDateFormat.format(new Date());
        //     console.log(sToday);
        //     oModel.setProperty("/newExpense/date", sToday);

        //     // oModel.setProperty("/newExpense", {
        //     //     category: "",
        //     //     amount: "",
        //     //     date: new Date(),   // Today's date
        //     //     description: ""
        //     // });
        // },
        onAddExpense: function () {

            this.getOwnerComponent().getRouter().navTo("AddExpense");
        },
        onExpensePress: function () {
        },
        // _generateDashboard: function () {
        //     console.log("Generating dashboard...");
        //     var oModel = this.getOwnerComponent().getModel("AppModel");
        //     console.log(this);
        //     console.log(this.getView().getModel());
        //     // Read expenses
        //     console.log("checking expenses: " + oModel.getProperty("/expenses"));
        //     var aExpenses = oModel.getProperty("/expenses") || [];
        //     console.log(aExpenses);
        //     // Selected month (01-12)
        //     var sSelectedMonth = oModel.getProperty("/selectedMonth");
        //     console.log("Selected month: " + sSelectedMonth);
        //     // Temporary object for grouping by date
        //     var oChart = {};

        //     // Totals
        //     var oTotals = {
        //         food: 0,
        //         travel: 0,
        //         accommodation: 0,
        //         others: 0,
        //         expense: 0
        //     };

        //     // Loop through expenses
        //     aExpenses.forEach(function (oExpense) {
        //         console.log("Processing expense: ", oExpense);

        //         // Example date: 2026-06-30
        //         var sMonth = oExpense.date.substring(3, 5);
        //         console.log("Expense month: " + sMonth);

        //         // Skip if not selected month
        //         // if (sMonth !== sSelectedMonth) {
        //         //     console.log("Skipping expense for month: " + sMonth);
        //         //     return;
        //         // }

        //         // Get day
        //         var sDate = oExpense.date.substring(0, 2);
        //         console.log("Expense date: " + sDate);

        //         // Create date object if not exists
        //         if (!oChart[sDate]) {

        //             oChart[sDate] = {
        //                 date: sDate,
        //                 food: 0,
        //                 travel: 0,
        //                 accommodation: 0,
        //                 others: 0
        //             };
        //         }

        //         // Add amount to category
        //         console.log("Adding expense to category: ", oExpense.category, " Amount: ", oExpense.amount);
        //         switch (oExpense.category) {

        //             case "Food":

        //                 oChart[sDate].food += Number(oExpense.amount);
        //                 oTotals.food += Number(oExpense.amount);
        //                 break;

        //             case "Travel":
        //                 console.log("Adding travel expense: ", oExpense.amount);
        //                 oChart[sDate].travel += Number(oExpense.amount);
        //                 oTotals.travel += Number(oExpense.amount);
        //                 break;

        //             case "Accommodation":

        //                 oChart[sDate].accommodation += Number(oExpense.amount);
        //                 oTotals.accommodation += Number(oExpense.amount);
        //                 break;

        //             default:

        //                 oChart[sDate].entertainment += Number(oExpense.amount);
        //                 oTotals.entertainment += Number(oExpense.amount);
        //         }

        //         // Total expense
        //         oTotals.expense += Number(oExpense.amount);

        //     });

        //     // Convert object to array
        //     var aChartData = Object.values(oChart);

        //     // Sort by date
        //     aChartData.sort(function (a, b) {

        //         return Number(a.date) - Number(b.date);

        //     });

        //     // Update chart data
        //     console.log("Chart Data: ", aChartData);
        //     oModel.setProperty(
        //         "/chartData",
        //         aChartData
        //     );


        //     // Update totals
        //     oModel.setProperty(
        //         "/totals",
        //         oTotals
        //     );

        // },
        // onSaveExpense: function () {

        //     var oModel = this.getView().getModel("AppModel");


        //     // Read current expense entered in the dialog
        //     var oExpense = oModel.getProperty("/newExpense");

        //     // Read existing expenses
        //     var aExpenses = oModel.getProperty("/expenses");
        //     // console.log(oModel.getProperty("/expenses"));
        //     oExpense.amount = Number(oExpense.amount);

        //     // Add a copy of the new expense
        //     aExpenses.push({ ...oExpense });

        //     // Update the model
        //     oModel.setProperty("/expenses", aExpenses);

        //     // Clear the form
        //     oModel.setProperty("/newExpense", {
        //         category: "",
        //         amount: "",
        //         date: "",
        //         description: ""
        //     });

        //     //console.log(oModel.getProperty("/newExpenses"));
        //     console.log(oModel.getProperty("/expenses"));
        //     // Close the dialog
        //     this._generateDashboard();
        //     this._oDialog.close();
        // },

        onCloseDialog: function () {
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