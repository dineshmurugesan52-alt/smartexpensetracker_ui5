sap.ui.define([
    "sap/ui/core/UIComponent",
    "smartexpense/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("smartexpense.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            console.log("Hii");
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
            var oModel =
                new sap.ui.model.json.JSONModel(
                    sap.ui.require.toUrl(
                        "smartexpense/model/AppModel.json"
                    )
                );

            this.setModel(oModel, "AppModel");
            console.log("Component Model" + oModel);
        }
    });
});