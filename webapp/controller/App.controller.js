sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("smartexpense.controller.App", {
    onInit() {
    },
    onToggleSideNav() {
      console.log("Toggle Side Nav");
      var oToolpage = this.byId("sideNavigation");
      oToolpage.setExpanded(!oToolpage.getExpanded());
    },
    onNavItemSelect: function (oEvent) {
      console.log("Navigation Item Selected",oEvent);
      var sKey = oEvent.getParameter("item").getKey();
      this.getOwnerComponent().getRouter().navTo(sKey);
    }
  });
});