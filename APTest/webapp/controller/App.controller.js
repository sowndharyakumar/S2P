sap.ui.define([
	"ui/incture/APTest/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ui.incture.APTest.controller.App", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the view1 controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var that = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var url = window.location.href;
			if (url.includes("Action")) {
				if (url.split("?")[1].split("Action-")[1] == "workbench") {
					that.oRouter.navTo("Workbench");
				} else if (url.split("?")[1].split("Action-")[1] == "createinvoice") {
					that.oRouter.navTo("Process");
				} else if (url.split("?")[1].split("Action-")[1] == "expense") {
					that.oRouter.navTo("paymentRequest");
				} else if (url.split("?")[1].split("Action-")[1] == "dashboard") {
					that.oRouter.navTo("DashboardPage");
				}
			} else if (url.includes("FLP")) {
				var nav = url.split("/").pop();
				that.oRouter.navTo(nav);
			} else {
				that.oRouter.navTo("DashboardPage");
			}
			// apply content density mode to root view
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

		}

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

	});

});