sap.ui.define([
		"ui/incture/APInvoiceTask/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("ui.incture.APInvoiceTask.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("invoiceTask");
			}

		});

	}
);