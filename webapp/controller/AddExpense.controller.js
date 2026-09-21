sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("smartexpense.controller.AddExpense", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteView2").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            //var sId=oEvent.getParameter("arguments").id;
            console.log("Matched route for ID:", oEvent);
        }

    });
});