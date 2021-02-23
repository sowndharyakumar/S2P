sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/incture/vendorReturns/util/Formatter",
], function (Controller, Formatter) {
	"use strict";
	return Controller.extend("com.incture.vendorReturns.controller.returnInbox", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function () {
			var baseModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(baseModel, "baseModel");
			this.getRetuenRequest();
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
		},
		onPressCollapse: function () {
			this.getView().getModel("baseModel").setProperty("/openVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", false);
		},

		onPressOpen: function () {
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
		},
		openBusyDialog: function () {
			if (this._BusyDialog) {
				this._BusyDialog.open();
			} else {
				this._BusyDialog = new sap.m.BusyDialog({
					busyIndicatorDelay: 0
				});
				this._BusyDialog.open();
			}
		},
		closeBusyDialog: function () {
			if (this._BusyDialog) {
				this._BusyDialog.close();
			}
		},
		onClear: function () {
			var filterData = this.getView().getModel("mReturnDetails").getData();
			filterData.reqId = "";
			filterData.requestor = "";
			filterData.startDate = "";
			filterData.vendorId = "";
			filterData.endDate = "";
			this.getRetuenRequest();
			this.getView().getModel("mReturnDetails").refresh();
		},
		onFilterDrafts: function () {
			var filterData = this.getView().getModel("mReturnDetails").getData();
			if (filterData.reqId || filterData.requestor || filterData.startDate || filterData.vendorId ||
				filterData.endDate) {
				this.openBusyDialog();
				var that = this;
				if (filterData.startDate) {
					var date = String(filterData.startDate.getDate()).length == 1 ? "0" + filterData.startDate.getDate() : filterData.startDate.getDate();
					var month = filterData.startDate.getMonth() + 1;
					month = String(month).length == 1 ? "0" + (month) : month;
					var year = filterData.startDate.getFullYear();
					var fromDate = year + "-" + month + "-" + date;
					var endDate = filterData.endDate.toISOString().split("T")[0];
				}
				if (filterData.vendorId)
					filterData.vendorId = filterData.vendorId.replace(/^0+/, '');
				var obj = {
					"filterDto": {
						"requestId": filterData.reqId,
						"createdBy": filterData.requestor,
						"vendor": filterData.vendorId,
						"fromDate": fromDate,
						"toDate": endDate
					},
					"userForFilter": {
						"userEmail": [
							"dipanjan.baidya@incture.com", "sowndharya.k@incture.com"
						],
						"pageNo": 0,
						"pageCount": 100
					}
				};
				$.ajax({
					url: "VendorReturns/returnsRequest/getAll",
					method: "POST",
					async: true,
					contentType: 'application/json',
					dataType: "json",
					data: JSON.stringify(obj),
					success: function (result, xhr, data) {
						that.closeBusyDialog();
						that.getView().getModel("mReturnDetails").setProperty("/results", result);
					},
					error: function () {
						that.closeBusyDialog();
						sap.m.MessageToast.show("Error in Service");
					}
				});
			} else
				sap.m.MessageToast.show("Please Enter all values to proceed");
		},
		fnVendorSuggestion: function (oEvent) {
			oEvent.getSource().setValueState("None");
			this.vendorFlag = false;
			oEvent.getSource().setValueState("None");
			this.vendorFlag = false;
			var searchVendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(searchVendorModel, "suggestionModel");
			var value = oEvent.getParameter("suggestValue");
			if (value || value.length > 2) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'";
				searchVendorModel.loadData(url, null, true);
				searchVendorModel.attachRequestCompleted(null, function () {
					searchVendorModel.refresh();
				});
			}
		},
		getRetuenRequest: function () {
			var mReturnDetails = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mReturnDetails, "mReturnDetails");
			this.openBusyDialog();
			var that = this;
			var obj = {
				"filterDto": {},
				"userForFilter": {
					"userEmail": [
						"dipanjan.baidya@incture.com", "sowndharya.k@incture.com"
					],
					"pageNo": 0,
					"pageCount": 100
				}
			};
			$.ajax({
				url: "VendorReturns/returnsRequest/getAll",
				method: "POST",
				async: true,
				contentType: 'application/json',
				dataType: "json",
				data: JSON.stringify(obj),
				success: function (result, xhr, data) {
					that.closeBusyDialog();
					mReturnDetails.setProperty("/results", result);
				},
				error: function () {
					that.closeBusyDialog();
					sap.m.MessageToast.show("Error in Service");
				}
			});
			mReturnDetails.refresh();
		},
		onCreateReturn: function () {
			this.oRouter.navTo("RouteView1");
		},
		onMoreDetails: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("mReturnDetails").getObject();
			if (object.status == "DRAFT") {
				this.oRouter.navTo("DraftView", {
					value: object.returnRequestId
				});
			} else {
				this.oRouter.navTo("Display", {
					value: object.returnRequestId
				});
			}
		}
	});
});