sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("smartexpense.controller.AddExpense", {
        onInit: function () {
            //this.getOwnerComponent().getRouter().getRoute("RouteView2").attachPatternMatched(this._onRouteMatched, this);
            var oDatePicker = this.byId("dateInput");

            oDatePicker.setMaxDate(new Date());
        },
        _onRouteMatched: function (oEvent) {
            //var sId=oEvent.getParameter("arguments").id;
            console.log("Matched route for ID:", oEvent);
        },
        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSaveExpense: function () {

            // Get the OData V4 model
            var oModel = this.getView().getModel("expense");
            console.log("OData Model:", oModel);

            // Get values from the UI controls
            var sAmount = this.byId("addExpenseAmountInput").getValue();
            var sDate = this.byId("dateInput").getValue();
            var sCategory = this.byId("categorySegmentedButton").getSelectedKey();
            var sPaymentMode = this.byId("paymentSelect").getSelectedKey();
            var sNote = this.byId("noteInput").getValue();

            // Create payload
            var oExpense = {
                amount: parseFloat(sAmount),
                date: sDate,
                category: sCategory,
                paymentMode: sPaymentMode,
                note: sNote
            };

            // Create new entity in Expenses entity set
            var oContext = oModel
                .bindList("/Expenses")
                .create(oExpense);

            // Handle POST success/error
            oContext.created()
                .then(function () {
                    console.log("Expense created successfully");
                    sap.m.MessageToast.show(
                        "Expense created successfully"
                    );

                    // Optional: go back after successful creation
                    this.onNavBack();

                }.bind(this))
                .catch(function (oError) {

                    console.log("Error creating expense:", oError);

                    sap.m.MessageBox.error(
                        "Failed to create expense."
                    );

                });
        }




    });
});