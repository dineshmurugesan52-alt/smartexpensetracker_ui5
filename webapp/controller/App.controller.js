sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("smartexpense.controller.App", {
    onInit() {
    },
    onToggleSideNav: function () {
    console.log("Toggle Side Nav");

    var oToolPage = this.byId("toolPage");

    oToolPage.setSideExpanded(
        !oToolPage.getSideExpanded()
    );
},
    onNavItemSelect: function (oEvent) {
      console.log("Navigation Item Selected",oEvent);
      var sKey = oEvent.getParameter("item").getKey();
      this.getOwnerComponent().getRouter().navTo(sKey);
    }
  });
});