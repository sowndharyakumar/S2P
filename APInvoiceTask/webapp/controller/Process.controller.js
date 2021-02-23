sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter"
], function (Controller, MessageBox, Fragment, Filter) {
	"use strict";

	return Controller.extend("ui.incture.APInvoiceTask.controller.Process", {
		onInit: function () {
			var obj = {
				invNo: "",
				InvoiceDate: null,
				InvoiceDateTo: null,
				ASNNo: "",
				AmountTo: "",
				VendorId: "INC",
				VendorName: "InstaBasket.com",
				Status: "",
				Amount: "",
				selectedInv: false,
				selectedCre: false,
				selectedDeb: false
			};
			var MasterListHeaderSet = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(MasterListHeaderSet, "MasterListHeaderSet");
			var oModelTb = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oModelTb, "InvoiceProcessListSet");
			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/Z_ODATA_SERV_OPEN_PO_SRV");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			this.onPressSerachProcessPO();
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

		onSearchPO: function (oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var afilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter("Purch_Ord", sap.ui.model.FilterOperator.Contains, sQuery)
					],
					false);
				aFilters.push(afilter);
			}
			var oBinding = this.byId("ID_TBL_PI_INVOICE111").getBinding("items");
			oBinding.filter(aFilters, false);

		},

		getLoggedInUserDetail: function () {
			var that = this;
			var oUserDetailModel = this.getView().getModel("oUserDetailModel");
			oUserDetailModel.loadData("/services/userapi/attributes", null, true);
			oUserDetailModel.attachRequestCompleted(function (oEvent) {
				var userId = that.getView().getModel("oUserDetailModel").getData().name;
				that.getLoggedInUserName(userId); //Method to get Logged in user PID
			});
			oUserDetailModel.attachRequestFailed(function (oEvent) {
				MessageBox.error(oEvent.getSource().getData().message);
			});
		},

		onNavToDashboard: function (oEvent) {
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			var aData = [];
			MasterListHeaderSet.setData(aData);
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("DashboardPage", true);
		},

		fnVendorIdSuggest: function (oEvent) {

			var searchVendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(searchVendorModel, "searchVendorModel");
			var value = oEvent.getParameter("suggestValue");
			if (value && value.length > 2) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'";
				searchVendorModel.loadData(url, null, true);
				searchVendorModel.attachRequestCompleted(null, function () {
					searchVendorModel.refresh();
				});
			}
		},
		fnVendorNameSuggest: function (oEvent) {
			var searchVendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(searchVendorModel, "searchVendorModel");
			var value = oEvent.getParameter("suggestValue");
			if (value) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'";
				searchVendorModel.loadData(url, null, true);
				searchVendorModel.attachRequestCompleted(null, function () {
					searchVendorModel.refresh();
				});
			}
		},

		searchVendorAddr: function (oEvt) {

			var sVendorName = oEvt.getParameter("selectedItem").getProperty("additionalText");
			var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
			MasterListHeaderSet.setProperty("/VendorName", sVendorName);
			MasterListHeaderSet.refresh();
		},
		/*function to call scim service to get the user details*/
		getLoggedInUserName: function (userId) {
			var that = this;
			var oLoggedInUserDetailModel = new sap.ui.model.json.JSONModel();
			that.getView().setModel(oLoggedInUserDetailModel, "oLoggedInUserDetailModel");
			// Service to getLogged in User
			oLoggedInUserDetailModel.loadData("/UserManagement/service/scim/Users/" + userId, null, true);
			oLoggedInUserDetailModel.attachRequestCompleted(function (oEvent) {
				// data access control
				var custAttribute = oEvent.getSource().getData()["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
				if (custAttribute.attributes[0] !== undefined) {
					that.salesOrgDataAccess = custAttribute.attributes[0].value;
				} else {
					that.salesOrgDataAccess = "No Access";
				}
				if (custAttribute.attributes[1] !== undefined) {
					that.distrChannelDataAccess = custAttribute.attributes[1].value;
				} else {
					that.distrChannelDataAccess = "No Access";

				}
				if (custAttribute.attributes[2] !== undefined) {
					that.divisionDataAccess = custAttribute.attributes[2].value;
				} else {
					that.divisionDataAccess = "No Access";

				}
				if (custAttribute.attributes[3] !== undefined) {
					that.materialGroupDataAccess = custAttribute.attributes[3].value;
				} else {
					that.materialGroupDataAccess = "No Access";

				}
				if (custAttribute.attributes[4] !== undefined) {
					that.materialGroup4DataAccess = custAttribute.attributes[4].value;
				} else {
					that.materialGroup4DataAccess = "No Access";

				}
				if (custAttribute.attributes[5] !== undefined) {
					that.custCodeDataAccess = custAttribute.attributes[5].value;
				} else {
					that.custCodeDataAccess = "No Access";

				}
				var loggedInuserId = oEvent.getSource().getData().id; // to get pid
				that.getView().getModel("oLoggedInUserDetailModel").setProperty("/userLoginId", loggedInuserId);
				var userName = oEvent.getSource().getData().name; // to get name 
				that.getView().getModel("oLoggedInUserDetailModel").setProperty("/loggedInUser", userName.givenName + " " + userName.familyName);
				var emailId = oEvent.getSource().getData().emails["0"].value;
				that.getView().getModel("oLoggedInUserDetailModel").setProperty("/loggedInUserMail", emailId); // to get email id
				that.launchpadTilesFunction(); //method to specify content base on type of tile
				that.loadCustomTemplates(); //method to generate filter parameter controls
			});
			oLoggedInUserDetailModel.attachRequestFailed(function (oEvent) {
				MessageBox.error(oEvent.getSource().getData().message);
			});
		},
		onPressSerachProcessPO: function () {
			this.openBusyDialog();
			var that = this;
			var data = this.getView().getModel("MasterListHeaderSet").getData();
			var poNumber = data.PONo;
			var vendor = data.VendorId;
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			if (poNumber === "" || poNumber === undefined) {
				poNumber = undefined;
			} else if (vendor === "" || vendor === undefined) {
				vendor = undefined;
			}
			oPODetailModel.read("/L_EKKOSet", {
				urlParameters: "$filter=Vendor eq '" + vendor + "' and Purch_Ord  eq '" + poNumber + "'",
				success: function (oData) {

					var poHeaderSet = new sap.ui.model.json.JSONModel({
						"results": oData.results
					});
					that.getView().setModel(poHeaderSet, "poHeaderSet");
					var headerItems = that.getView().getModel("poHeaderSet").getData().results;
					for (var i = 0; i < headerItems.length; i++) {
						headerItems[i].status = "Ready";
						headerItems[i].Date = headerItems[i].Date.split("T")[0];
					}
					that.getView().getModel("poHeaderSet").refresh();
					that.closeBusyDialog();
				},
				error: function (oError) {
					that.closeBusyDialog();
				}
			});

		},
		OKCreditMemo: function (oEvent) {
			var selectedObject = this.getView().byId("ID_TBL_PI_INVOICE111").getSelectedContexts()[0].getObject();
			selectedObject.VendorName = this.getView().getModel("MasterListHeaderSet").getData().VendorName;
			selectedObject.totalAmount = "0";
			selectedObject.taxAmount = "0";
			selectedObject.PODate = this.getView().getModel("MasterListHeaderSet").getData().PODate;
			selectedObject.page1Status = this.getView().getModel("MasterListHeaderSet").getData().Status;
			selectedObject.memoType = this.getView().getModel("MasterListHeaderSet").getData().memoType;
			if (selectedObject.memoType) {
				var oModel = new sap.ui.model.json.JSONModel(selectedObject);
				this.getOwnerComponent().setModel(oModel, "selectedObject");
				this.getView().byId("ID_TBL_PI_INVOICE111").removeSelections(true);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Second");
				var MasterListHeaderSet = this.getView().getModel("MasterListHeaderSet");
				var aData = [];
				MasterListHeaderSet.setData(aData);
			} else {
				MessageBox.error("Please Select MEMO TYPE!");
			}

		},

		cancelCreditMemo: function (oEvent) {
			this.createMemoFrag.close();
		},
		onSelectRadio: function (oEvent) {

			var selectedRadio = oEvent.getSource().getText();
			this.getView().getModel("MasterListHeaderSet").getData().memoType = selectedRadio;
		},
		fnOpenPdfInNewWindow: function (oEvent) {

		},

		onPressResetProcessPO: function () {
			var data = this.getView().getModel("MasterListHeaderSet").getData();
			data.invNo = "";
			data.InvoiceDate = null;
			data.InvoiceDateTo = null;
			data.ASNNo = "";
			data.VendorId = "";
			data.VendorName = "";
			data.Status = "";
			data.Amount = "";
			data.AmountTo = "";
			data.PONo = "";
			this.getView().getModel("MasterListHeaderSet").refresh();
		},

		onPressNextProcessInvoice: function () {
			var oTable = this.getView().byId("ID_TBL_PI_INVOICE111");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			if (itemIndex !== -1) {
				if (!this.createMemoFrag) {
					sap.ui.getCore().byId("createMemoFragID");
					this.createMemoFrag = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.Fragments.createMemoFrag", this);
					this.getView().addDependent(this.createMemoFrag);
				}
				this.createMemoFrag.open();
			} else {
				MessageBox.error("Please Select PO Details!");
			}
		}

	});

});