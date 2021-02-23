sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ui.incture.APInvoiceTask.controller.paymentRequest", {
		onInit: function () {
			var mTableModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mTableModel, "mTableModel");
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},
		navBackPaymentReq: function () {
			this.oRouter.navTo("DashboardPage");
		},
		onAddRow: function () {
			var mTableModel = this.getView().getModel("mTableModel");
			var mTableModelData = mTableModel.getData();
			if (!mTableModelData.listOfItems) {
				mTableModelData.listOfItems = [];
			}
			var date = "";
			var expenses = "";
			var amount = "";
			var reuested = "";
			mTableModelData.listOfItems.unshift({
				"date": date,
				"expenses": expenses,
				"amount": amount,
				"reuested": reuested
			});
			mTableModel.refresh();
		},
		onDeleteRow: function () {
			var mTableModel = this.getView().getModel("mTableModel");
			var oTable = this.getView().byId("inctureTableExpenses");
			var aSelectedItems = this.getView().byId("inctureTableExpenses").getSelectedContextPaths();
			var sLength = aSelectedItems.length;
			if (sLength > 0) {
				for (var i = sLength - 1; i >= 0; i--) {
					var indx = aSelectedItems[i].split("/")[2];
					mTableModel.getData().listOfItems.splice(indx, 1);
				}

			} else {
				sap.m.MessageBox.warning("Please Select PO Details!");
			}
			oTable.removeSelections(true);
			mTableModel.refresh();
		}
	});
});