sap.ui.define([
	"ui/incture/APInvoiceTask/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"ui/incture/APInvoiceTask/util/Formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, ODataModel, MessageToast, MessageBox, Formatter, Filter,
	Operator) {
	"use strict";

	return BaseController.extend("ui.incture.APInvoiceTask.controller.SplitLayout", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

			this.oNumberFormatRegEx = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/;
			this.oCommaRegEx = /,/g;

			var sPDFPath,
				oPDFModel,
				oPropertyModel,
				oInvLineMsgModel,
				oDynamicPropertyModel = new JSONModel({
					"bDiscVisible": false,
					"bDynBtnIcon": "sap-icon://show",
					"bDynBtnTooltip": "Open Dynamic Columns"
				});

			// Invoice Line Item Messages Model
			this.setModel(oInvLineMsgModel, "oInvLineMsgModel");
			this.setModel(oDynamicPropertyModel, "oDynamicPropertyModel");

			// ODATA Model for Entity ZAP_VENDOR_SRV
			var oRunningSearchModel = new ODataModel("DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/");
			this.setModel(oRunningSearchModel, "oRunningSearchModel");

			// Vendor Running Search Model
			var oVendorSuggestionModel = new JSONModel({
				"oVendorData": ""
			});
			this.setModel(oVendorSuggestionModel, "oVendorSuggestionModel");

			// PO Running Search Model
			var oPoSuggestionModel = new JSONModel({
				"oPoData": "",
				"poBtnEnable": false,
				"POHeaderDetails": [],
				"grnList": []
			});
			this.setModel(oPoSuggestionModel, "oPoSuggestionModel");
			// oPoSuggestionModel.loadData("model/purchaseOrder.json");
			var oGRNModel = new JSONModel();
			this.setModel(oGRNModel, "oGRNModel");
			var taxModel = new JSONModel();
			this.getView().setModel(taxModel, "taxModel");

			// Dropdown Data Model
			var oDropDownModel = new JSONModel();
			this.setModel(oDropDownModel, "oDropDownModel");
			// PDF Model - TO BE REMOVED :: NEW METHOD CALL TO BE COME HERE AFTER SERVICE INTEGRATION
			sPDFPath = jQuery.sap.getModulePath("ui.incture.APInvoiceTask.css.pdfs", "/Test.pdf");
			oPDFModel = new JSONModel({
				"Source": sPDFPath,
				"Title": "Invoice PDF",
				"Height": "560px",
				"Width": "100%"
			});
			this.setModel(oPDFModel, "oPDFModel");

			// Property Model - TO BE REMOVED :: NEW METHOD CALL TO COME HERE AFTER SERVICE INTEGRATION
			oPropertyModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("ui.incture.APInvoiceTask.model", "/propertyModel.json"));
			oPropertyModel.attachRequestCompleted(function (oData) {
				this.setModel(oPropertyModel, "oPropertyModel");
				this._setUpTheLayout();
				this._setUpInvoiceHeader();
			}, this);

			// oPropertyModel.attachRequestFailed(function (oError) {
			// // 	 Show appropriate message
			// });

			// Invoice Item Level Model - TO BE REMOVED :: NEW METHOD CALL TO COME HERE AFTER SERVICE INTEGRATION
			// this.setModel(new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.splitScreen.model", "/invItemModel.json")),"oInvoiceModel");
			// var oInvoiceModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("ui.incture.APInvoiceTask.model", "/invItemModel.json"));
			// oInvoiceModel.attachRequestCompleted(function (oData) {
			// 	this.setModel(oInvoiceModel, "oInvoiceModel");
			// 	oInvoiceModel.getData().invoiceFldVis = true;
			// 	oInvoiceModel.getData().purchaseOrderFldVis = false;
			// 	oInvoiceModel.refresh();
			// }, this);
			this.mGroupFunctions = {
				histType: function (oContext) {
					var name = oContext.getProperty("histType");
					return {
						key: name,
						text: name
					};
				}
			};
			// var oInvoiceModel = this.getModel("oInvoiceModel");
			var that = this;
			// oInvoiceModel.getData().rowVisible = 1;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(function (oEvent) {
				if (that.getView().byId("apIconTabId"))
					that.getView().byId("apIconTabId").setSelectedKey("invoice");
				// that.toggleHdrLayout();
				var attachmentModel = new JSONModel();
				that.getView().setModel(attachmentModel, "attachmentModel");
				// PO Running Search Model
				var oPoSuggestionModel = new JSONModel({
					"oPoData": "",
					"poBtnEnable": false,
					"POHeaderDetails": [],
					"grnList": []
				});
				that.setModel(oPoSuggestionModel, "oPoSuggestionModel");
				var oGRNModel = new JSONModel();
				that.setModel(oGRNModel, "oGRNModel");
				if (oEvent.getParameters().arguments.value && oEvent.getParameters().arguments.value != "abc") {
					var oInvoiceModel = new sap.ui.model.json.JSONModel();
					that.getView().setModel(oInvoiceModel, "oInvoiceModel");
					var url = "InctureApDest/invoiceHeader?requestId=" + oEvent.getParameters().arguments.value;
					jQuery
						.ajax({
							url: url,
							type: "GET",
							dataType: "json",
							success: function (result) {
								oInvoiceModel.setProperty("/oInvoiceHeaderDetails", result.invoiceHeader);
								oInvoiceModel.setProperty("/oInvoiceHeaderDetails/invoiceItems", result.invoiceItems);
								oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal = 0;
								for (var i = 0; i < oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems.length; i++) {
									if (oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].isTwowayMatched && oInvoiceModel.getData().oInvoiceHeaderDetails
										.invoiceItems[i].isSelected) {
										oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal = oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal +
											parseFloat(oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].netWorth);
										oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].taxCode = "VN";
										oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].taxPer = "7";
									}
								}
								oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal = oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal.toFixed(3);
								oInvoiceModel.refresh();
								if (!oInvoiceModel.getProperty("/oInvoiceHeaderDetails/postingDate")) {
									var date = new Date();
									oInvoiceModel.setProperty("/oInvoiceHeaderDetails/postingDate", date);
								}
								oInvoiceModel.getData().rowVisible = 1;
								if (oInvoiceModel.getData().oInvoiceHeaderDetails.lifecycleStatus == "09")
									oInvoiceModel.getData().posted = false;
								else
									oInvoiceModel.getData().posted = true;
								oInvoiceModel.getData().invoiceFldVis = true;
								oInvoiceModel.getData().purchaseOrderFldVis =
									false;
								oInvoiceModel.refresh();
								that._getPaymentTerms();
								that.fnTaxCalculation();
								that.getComments();
								that.getPdfData();
							},
							error: function (e) {
								oInvoiceModel.loadData("model/invItemModel.json", null, false);
								oInvoiceModel.getData().invoiceFldVis = true;
								oInvoiceModel.getData().purchaseOrderFldVis = false;
								oInvoiceModel.refresh();
								MessageBox.error(e.message);
							}
						});
				}
			});

			// oInvoiceModel.attachRequestFailed(function (oError) {
			// 	// Show appropriate message
			// });

		},

		onNavToInbox: function () {
			this._removeContentArea();
			this.fnBackToMain();
			this.oRouter.navTo("Workbench");
		},
		togglePO: function (oEvent) {
			// this.getView().byId("idInvoiceTable").setVisible(false);
			// var modelData = oEvent.getSource().getModel("oInvoiceModel").getData(),
			var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
				flag;
			flag = oEvent.getParameter("state") ? false : true; //
			oInvoiceModel.setProperty("/nullVis", false);
			oInvoiceModel.setProperty("/purchaseOrderFldVis", flag);
			oInvoiceModel.setProperty("/invoiceFldVis", !flag);
			// modelData.invoiceFldVis = !flag;
			// oEvent.getSource().getModel("oInvoiceModel").refresh();
			jQuery.sap.delayedCall(100, this, function () {
				// this.getView().byId("idInvoiceTable").setVisible(true);
				oInvoiceModel.setProperty("/nullVis", true);
			});

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/* ************************ Split View Event Handlers :START ************************************ */

		/** 
		 * Event handler on change for the Invoice Amount.
		 * @public
		 * @param {Object} oEvent Input Object.
		 */
		fnInvoiceAmtChange: function (oEvent) {
			var bComputationFlag = false,
				oInvoiceAmount = oEvent.getSource(),
				iInvoiceAmount = oEvent.getSource().getValue();

			iInvoiceAmount = this.getTrimValue(iInvoiceAmount, oEvent);
			bComputationFlag = this.getNumberDataTypeValidation(iInvoiceAmount);

			if (bComputationFlag) {
				oInvoiceAmount.setValueState("None");
				oInvoiceAmount.setShowValueStateMessage(false);

				// Calculation on the field if any
				iInvoiceAmount = this.getNumberValue(iInvoiceAmount);

			} else {
				oInvoiceAmount.setValueState("Error");
				oInvoiceAmount.setShowValueStateMessage(true);
				oInvoiceAmount.setValueStateText(this.getResourceBundle().getText("incorrectInvAmt"));
			}
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			oInvoiceModel.getData().oInvoiceHeaderDetails.balance = parseFloat(oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceTotal) -
				parseFloat(oInvoiceModel.getData().oInvoiceHeaderDetails
					.grossAmount);
			oInvoiceModel.getData().oInvoiceHeaderDetails.balance = parseFloat(oInvoiceModel.getData().oInvoiceHeaderDetails.balance).toFixed(3);
			oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceTotal = oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceTotal.toFixed(3);
			oInvoiceModel.refresh();
		},

		onInvoiceSelect: function () {
			var oInvoiceModel = this.getModel("oInvoiceModel"),
				amount = 0,
				oInvoiceModelData = oInvoiceModel.getData().oInvoiceLineItems;;
			for (var i = 0; i < oInvoiceModelData.length; i++) {
				if (oInvoiceModelData[i].checkBoxSelection) {
					amount = amount + oInvoiceModelData[i].iAmount;
				}
			}
			oInvoiceModel.getData().oInvoice.iGrossAmt = amount;
			oInvoiceModel.refresh();
		},

		/* ************************ Split View Event Handlers :END ************************************ */

		/* ************************ PDF Fragment :START *********************************************** */

		/** 
		 * Event handler when the open PDF in new window button gets pressed.
		 * Opens the Invoice PDF in new window. The split container for the PDF is destroyed.
		 * @public
		 * @param {object} oEvent is the button object.
		 */
		fnRemovePDFScreen: function (oEvent) {
			var oPropertyModel = this.getModel("oPropertyModel");

			if (!oPropertyModel.getProperty("/bTabsScreenOpen")) {
				this._removeContentArea();
			}

			// PDF is required in new window
			this._configurePDF(true, false);
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

		/* ************************ PDF Fragment :END ************************************************* */

		/* ************************ Invoice Header Fragment :START ************************************ */

		/** 
		 * Event handler for suggestion of vendor ID or name
		 * @public
		 * @param {object} oEvent the input control
		 */
		fnVendorSuggestion: function (oEvent) {
			oEvent.getSource().setValueState("None");
			this.vendorFlag = false;

			oEvent.getSource().setValueState("None");
			this.vendorFlag = false;
			var searchVendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(searchVendorModel, "suggestionModel");
			var value = oEvent.getParameter("suggestValue");
			if (value && value.length > 2) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'";
				searchVendorModel.loadData(url, null, true);
				searchVendorModel.attachRequestCompleted(null, function () {
					searchVendorModel.refresh();
				});
			}
		},
		// var //aFilters,
		// 	oVendorInput = oEvent.getSource(),
		// 	sSearchItem = this.getTrimValue(oVendorInput.getValue(), oEvent),
		// 	oRunningSearchModel = this.getModel("oRunningSearchModel"),
		// 	oVendorSuggestionModel = this.getModel("oVendorSuggestionModel");

		// oVendorInput.setShowValueStateMessage(false);

		// oRunningSearchModel.read("/VendSearchSet?$filter=SearchString eq '" + sSearchItem + "'", {
		// 	success: function (oData) {
		// 		if (oData.results.length !== 0) {
		// 			oVendorInput.setValueState("None");

		// 			// oVendorSuggestionModel.setSizeLimit(oData.results.length);
		// 			oVendorSuggestionModel.setProperty("/oVendorData", oData.results);

		// 			var aFilters = [];
		// 			aFilters.push(new Filter({
		// 				filters: [
		// 					new Filter("Vendor", Operator.Contains, sSearchItem),
		// 					new Filter("Name1", Operator.Contains, sSearchItem),
		// 					new Filter("Name2", Operator.Contains, sSearchItem),
		// 					new Filter("Name3", Operator.Contains, sSearchItem),
		// 					new Filter("Name4", Operator.Contains, sSearchItem),
		// 					new Filter("Search_term", Operator.Contains, sSearchItem)
		// 				],
		// 				and: false
		// 			}));

		// 			oVendorInput.getBinding("suggestionRows").filter(aFilters);
		// 		} else {
		// 			oVendorInput.setValueState("Error");
		// 			MessageToast.show(this.getResourceBundle().getText("noDataForVendor"));
		// 		}
		// 	}.bind(this),
		// 	error: function (oError) {
		// 		this.showErrorMessage(oError.response.statusCode + " : " + oError.response.statusText);
		// 	}.bind(this)
		// });

		/** 
		 * Event handler when the user selects the correct vendor data from the drop down list
		 * @public
		 * @param {object} oEvent the input control
		 */
		fnVendorSelected: function (oEvent) {
			var oInvoiceModel = this.getModel("oInvoiceModel"),
				oSelectedItem = oEvent.getParameter("selectedRow").getBindingContext("suggestionModel").getObject();
			this.vendorFlag = true;
			oInvoiceModel.setProperty("/oInvoiceHeaderDetails/vendorId", ui.incture.APInvoiceTask.util.Formatter.removeZero(oSelectedItem.Vendor));
			oInvoiceModel.setProperty("/oInvoiceHeaderDetails/vendorName", oSelectedItem.Name1);
		},
		chkSelectedVendor: function (oEvent) {
			this.getView().getModel("oVendorSuggestionModel").setProperty("/oVendorData", "");
			if (this.vendorFlag) {
				oEvent.getSource().setValueState("None");
			} else {
				oEvent.getSource().setValue("").setValueState("Error");
				var oInvoiceModel = this.getView().getModel("oInvoiceModel");
				oInvoiceModel.getData().oInvoiceHeaderDetails.vendorId = "";
				oInvoiceModel.getData().oInvoiceHeaderDetails.vendorName = "";
				oInvoiceModel.refresh();
			}
		},

		/* ************************ Invoice Header Fragment :END ************************************* */

		/* ************************ Invoice Items Fragment :START ************************************ */

		/** 
		 * Event handler when clear sorting button is pressed.
		 * @public
		 */
		fnOpenDynamicColumns: function (oEvent) {
			var oDynamicPropertyModel = this.getModel("oDynamicPropertyModel");
			var sSelIcon = oEvent.getSource().getIcon();
			if (sSelIcon === "sap-icon://show") {
				oDynamicPropertyModel.getData().bDiscVisible = true;
				oDynamicPropertyModel.getData().bDynBtnIcon = "sap-icon://hide";
				oDynamicPropertyModel.getData().bDynBtnTooltip = "Hide Dynamic Columns";
			} else {
				oDynamicPropertyModel.getData().bDiscVisible = false;
				oDynamicPropertyModel.getData().bDynBtnIcon = "sap-icon://show";
				oDynamicPropertyModel.getData().bDynBtnTooltip = "Open Dynamic Columns";
			}
			oDynamicPropertyModel.refresh();
		},

		fnClearSorting: function () {
			var oInvItemTable = this.byId("idInvItemTable");
			oInvItemTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},
		onSelectIconTabBar: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectedKey();
			if (selectedKey == "po")
				this.getPODetails();
			else if (selectedKey == "grn")
				this.getGRNDetails();

		},
		groupGrnData: function (oEvent) {
			var index = oEvent.getSource().getBindingContext("oGRNModel").getPath().split("/").pop();
			var oGRNModel = this.getView().getModel("oGRNModel");
			if (oEvent.getSource().getSelectedKey() == "Summary") {
				oGRNModel.getData().grnUIDtoList[index].grnItemUIListVisible = true;
				oGRNModel.getData().grnUIDtoList[index].grnItemTotalUIListVisible = false;
				// oEvent.getSource().setText("Detail");
			} else {
				oGRNModel.getData().grnUIDtoList[index].grnItemUIListVisible = false;
				oGRNModel.getData().grnUIDtoList[index].grnItemTotalUIListVisible = true;
				// oEvent.getSource().setText("Summary");
			}
			oGRNModel.refresh();

			// var oView = this.getView(); // "accpay--grnTableId-accpay--grnTab-0-listUl"
			// var index = oEvent.getParameter("id").split("-").pop();
			// var viewId = this.getView().sId;
			// var grnTableId = oView.byId(viewId + "--grnTableId-__component0---invoiceTask--grnTab-" + index);
			// var grnSummaryTableId = oView.byId(viewId + "--grnSummaryTableId-__component0---invoiceTask--grnTab-" + index);
			// var flag = false;
			// if (oEvent.getSource().getText() == "Summary") {
			// 	flag = true;
			// 	oEvent.getSource().setText("Detail");
			// } else {
			// 	oEvent.getSource().setText("Summary");
			// }
			// grnTableId.setVisible(flag);
			// grnSummaryTableId.setVisible(!flag);
		},
		handleGroupDialogConfirm: function () {
			var oTable = this.byId("container-APInvoiceTask---invoiceTask--grnSummaryTableId-container-APInvoiceTask---invoiceTask--grnTab-0"),
				// mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];

			// if (mParams.groupItem) {
			sPath = "histType";
			bDescending = false;
			vGroup = this.mGroupFunctions[sPath];
			aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
			// apply the selected group settings
			oBinding.sort(aGroups);
			// }
		},

		/** 
		 * Event handler to open the Account Assignment Task from the Row Action Field
		 * @public
		 * @param {object} oEvent Button object.
		 */
		fnRowActionAccAssTab: function (oEvent) {
			var sTabKey = "accAssgTab",
				oSelLineItemData = oEvent.getSource().getBindingContext("oInvoiceModel").getObject();

			this._openTabsScreen(oSelLineItemData, sTabKey);
		},
		fnRowActionAccAss: function () {
			if (!this.oAccAssignment) {
				this.oAccAssignment = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.fragments.accAssignment", this);
				this.getView().addDependent(this.oAccAssignment);
			}
			var oInvoiceModel = this.getModel("oInvoiceModel");
			this.oAccAssignment.setModel(oInvoiceModel, "oInvoiceModel");
			this.oAccAssignment.open();
		},
		onChangescostCenter: function (oEvent) {
			var sCostCenter = oEvent.getParameter("value");
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var sPath = oEvent.getSource().getBindingContext("oInvoiceModel").getPath();
			if (sCostCenter === "") {
				oInvoiceModel.setProperty(sPath + "/scostCenterError", "Error");
				sap.m.MessageBox.information("Please Enter Cost Center!");
			} else {
				oInvoiceModel.setProperty(sPath + "/scostCenterError", "None");
			}
		},
		onChangeAmount: function (oEvent) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var sPath = oEvent.getSource().getBindingContext("oInvoiceModel").getPath();
			var amountVal = oInvoiceModel.getProperty(sPath + "/sAmount");
			if (amountVal === "") {
				oInvoiceModel.setProperty(sPath + "/amountError", "Error");
				sap.m.MessageBox.information("Please Enter Amount!");
			} else {
				oInvoiceModel.setProperty(sPath + "/amountError", "None");
			}
		},
		onChangesglAccount: function (oEvent) {
			var sGlAccount = oEvent.getParameter("value");
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var sPath = oEvent.getSource().getBindingContext("oInvoiceModel").getPath();
			if (sGlAccount === "") {
				oInvoiceModel.setProperty(sPath + "/sGlAccountError", "Error");
				sap.m.MessageBox.information("Please Enter GL Account!");
			} else {
				oInvoiceModel.setProperty(sPath + "/sGlAccountError", "None");
			}
		},
		okAccAss: function () {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var alistData = $.extend(true, [], oInvoiceModel.getProperty("/accAssignLineItem"));
			var bflag = true;
			for (var i = 0; i < alistData.length; i++) {
				//To handle validations
				var bValidate = false;
				if (alistData[i].sGlAccount === "" || alistData[i].sGlAccountError === "Error") {
					bValidate = true;
					alistData[i].sGlAccountError = "Error";
				}
				if (alistData[i].sAmount === "" || alistData[i].amountError === "Error") {
					bValidate = true;
					alistData[i].amountError = "Error";
				}
				if (alistData[i].sCostCenter === "" || alistData[i].scostCenterError === "Error") {
					bValidate = true;
					alistData[i].scostCenterError = "Error";
				}
				if (bValidate) {
					bflag = false;
					continue;
				}
			}
			if (!bflag) {
				oInvoiceModel.setProperty("/accAssignLineItem", alistData);
				var sMsg = "Please Enter Required Fields G/L Account,Cost Center & Amount!";
				sap.m.MessageBox.alert(sMsg);
				return;
			} else {
				this.oAccAssignment.close();

			}

		},
		closeAccAss: function () {
			this.oAccAssignment.close();
		},
		onAddGlAccount: function () {
			var oInvoiceModel = this.getModel("oInvoiceModel");
			if (!oInvoiceModel.getData().accAssignLineItem)
				oInvoiceModel.getData().accAssignLineItem = [];
			oInvoiceModel.getData().accAssignLineItem.push({
				"sGlDesc": "",
				"sGlAccount": "",
				"sDcIndicator": "D",
				"sCostCenter": "",
				"sInternalOrd": "",
				"sProfitCenter": "",
				"sWbsElement": "",
				"sAsset": "",
				"sAmount": ""
			});
			oInvoiceModel.refresh();
		},
		/** 
		 * Event handler to open the Material Description Tab from the Row Action Field
		 * @public
		 * @param {object} oEvent Button object.
		 */
		fnRowActionMatDescTab: function (oEvent) {
			var sTabKey = "matDescTab",
				oSelLineItemData = oEvent.getSource().getBindingContext("oInvoiceModel").getObject();

			this._openTabsScreen(oSelLineItemData, sTabKey);
		},

		/** 
		 * Event handler to open the Material Description Tab from the Link in Match Item Column
		 * @public
		 * @param {object} oEvent Link object.
		 */
		fnOpenMatDescTab: function (oEvent) {
			var sTabKey = "matDescTab",
				oSelLineItemData = oEvent.getSource().getBindingContext("oInvoiceModel").getObject();

			this._openTabsScreen(oSelLineItemData, sTabKey);
		},

		/** 
		 * Event handler to open the Invoice Line Item Messages.
		 * @public
		 * @param {Object} oEvent Button Object.
		 */
		fnOpenLineItemMessages: function (oEvent) {
			var oInvLineMsgModel = this.getModel("oInvLineMsgModel"),
				oSelectedRow = oEvent.getSource().getParent(),
				oBindingObject = oSelectedRow.getBindingContext("oInvoiceModel").getObject();

			oInvLineMsgModel.setProperty("/oLineItemData", oBindingObject);
			oInvLineMsgModel.setProperty("/oMessageData", oBindingObject.oMessageItemLevelLog);

			if (!this._oLineItemMessagePopover) {
				this._oLineItemMessagePopover = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.fragments.lineItemMessages", this);
				this.getView().addDependent(this._oLineItemMessagePopover);
			}

			this._oLineItemMessagePopover.setModel(oInvLineMsgModel, "oInvLineMsgModel");

			this._oLineItemMessagePopover.openBy(oEvent.getSource());
		},

		fnCloseLineItemMessages: function () {
			this._oLineItemMessagePopover.close();
		},

		/** 
		 * Event handler for suggestion of PO Number
		 * @public
		 * @param {object} oEvent the input control
		 */
		fnSelected: function () {
			var oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel");
			oPoSuggestionModel.setProperty("/poBtnEnable", true);
		},
		fnPoSuggestion: function (oEvent) {
			var oFilters,
				oPoInput = oEvent.getSource(),
				sSearchItem = this.getTrimValue(oPoInput.getValue(), oEvent),
				oRunningSearchModel = this.getModel("oRunningSearchModel"),
				oPoSuggestionModel = this.getModel("oPoSuggestionModel");

			oPoInput.setShowValueStateMessage(false);

			if (!oPoInput) {
				oPoInput.setValueState("None");
				return;
			}

			oRunningSearchModel.read("/VendPoSearchSet?$filter=SearchStr eq '" + sSearchItem + "'", {
				success: function (oData) {
					if (oData.results.length !== 0) {
						oPoInput.setValueState("None");

						// oPoSuggestionModel.setSizeLimit(oData.results.length);
						oPoSuggestionModel.setProperty("/oPoData", oData.results);

						oFilters = [];
						oFilters.push(new Filter({
							filters: [
								new Filter("Ebeln", Operator.Contains, sSearchItem)
							],
							and: false
						}));

						if (oPoInput.getBinding("suggestionItems")) {
							oPoInput.getBinding("suggestionItems").filter(oFilters);
						}
					} else {
						oPoInput.setValueState("Error");
						MessageToast.show(this.getResourceBundle().getText("noDataForPo"));
					}
				}.bind(this),
				error: function (oError) {
					this.showErrorMessage(oError.response.statusCode + " : " + oError.response.statusText);
				}.bind(this)
			});
		},
		fnPoSelected: function (oEvent) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
				oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel"),
				oGRNModel = this.getView().getModel("oGRNModel"),
				poNumber = oInvoiceModel.getData().poNumber;
			oPoSuggestionModel.setProperty("/poBtnEnable", false);
			// Duplicate check 
			var dulicatePOFlag = false;
			if (oPoSuggestionModel.getData().POHeaderDetails) {
				for (var i = 0; i < oPoSuggestionModel.getData().POHeaderDetails.length; i++) {
					if (poNumber == oPoSuggestionModel.getData().POHeaderDetails[i].documentNumber) {
						MessageToast.show("Purchase Order is already Added");
						dulicatePOFlag = true;
						break;
					}
				}
			}
			oInvoiceModel.setProperty("/poNumber", "");
			var invoiceData = oInvoiceModel.getData();
			var arrayIsNew = [];
			var objectIsNew = jQuery.extend({}, invoiceData.oInvoiceHeaderDetails);
			delete objectIsNew.invoiceItems;
			for (var i = 0; i < invoiceData.oInvoiceHeaderDetails.invoiceItems.length; i++) {
				// invoiceData.oInvoiceHeaderDetails.invoiceItems[i].changed && 
				if (!invoiceData.oInvoiceHeaderDetails.invoiceItems[i].isDeleted)
					arrayIsNew.push(invoiceData.oInvoiceHeaderDetails.invoiceItems[i]);
			}
			objectIsNew.postingDate = objectIsNew.postingDate ? new Date(objectIsNew.postingDate).getTime() : null;
			objectIsNew.refDocNum = poNumber;
			var newObject = {
				"invoiceHeader": objectIsNew,
				"invoiceItems": arrayIsNew
			};
			$.ajax({
				url: 'InctureApDest/purchaseDocumentHeader/addPO',
				method: "POST",
				async: false,
				headers: {
					"X-CSRF-Token": this.getCSRFToken()
				},
				contentType: 'application/json',
				dataType: "json",
				data: JSON.stringify(newObject),
				success: function (result, xhr, data) {
					oPoSuggestionModel.getData().POHeaderDetails = [];
					oPoSuggestionModel.getData().POHeaderDetails.push(result.poDetails);
					oPoSuggestionModel.setProperty("/POHeaderDetails/0/poItemList", result.poDetails.purchaseDocItems);
					oPoSuggestionModel.refresh();
					oInvoiceModel.setProperty("/oInvoiceHeaderDetails", result.invoiceHeader);
					oInvoiceModel.setProperty("/oInvoiceHeaderDetails/invoiceItems", result.invoiceItems);
					oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal = 0;
					for (var i = 0; i < oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems.length; i++) {
						if (oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].isTwowayMatched && oInvoiceModel.getData().oInvoiceHeaderDetails
							.invoiceItems[i].isSelected) {
							oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal = oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal +
								parseFloat(oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].netWorth);
							oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].taxCode = "VN";
							oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems[i].taxPer = "7";
						}
					}
					oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal = oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal.toFixed(3);
					oInvoiceModel.refresh();
					if (!oInvoiceModel.getProperty("/oInvoiceHeaderDetails/postingDate")) {
						var date = new Date();
						oInvoiceModel.setProperty("/oInvoiceHeaderDetails/postingDate", date);
					}
					oInvoiceModel.getData().rowVisible = 1;
					if (oInvoiceModel.getData().oInvoiceHeaderDetails.lifecycleStatus == "09")
						oInvoiceModel.getData().posted = false;
					else
						oInvoiceModel.getData().posted = true;
					oInvoiceModel.getData().invoiceFldVis = true;
					oInvoiceModel.getData().purchaseOrderFldVis =
						false;
					oInvoiceModel.refresh();
				},
				error: function (e) {
					MessageBox.errorg(e.message);
				}
			});
			// if (dulicatePOFlag == false) {
			// 	var url = "InctureApDest/email?poNum=" + poNumber;
			// 	jQuery
			// 		.ajax({
			// 			url: url,
			// 			type: "GET",
			// 			dataType: "json",
			// 			success: function (result) {
			// 				var length = oPoSuggestionModel.getData().POHeaderDetails.length;
			// 				oPoSuggestionModel.getData().POHeaderDetails.push(result.hthlist[0]);
			// 				oPoSuggestionModel.setProperty("/POHeaderDetails/" + length + "/poItemList", result.htilist);
			// 				for (var i = 0; i < result.htilist.length; i++) {
			// 					oPoSuggestionModel.getData().POHeaderDetails[length].poItemList[i].checkboxVisible = true;
			// 				}
			// 				oPoSuggestionModel.refresh();
			// 				//GRN Data
			// 				if (!oGRNModel.getData().grnUIDtoList) {
			// 					oGRNModel.getData().grnUIDtoList = [];
			// 					var length1 = 0;
			// 				} else {
			// 					var length1 = oGRNModel.getData().grnUIDtoList.length;
			// 				}
			// 				if (result.hthislist.length > 0) {
			// 					oGRNModel.getData().grnUIDtoList.push(result.hthlist[0]);
			// 					oGRNModel.getData().grnUIDtoList[length1].grnItemUIListVisible = true;
			// 					oGRNModel.getData().grnUIDtoList[length1].grnItemTotalUIListVisible = false;
			// 					oGRNModel.setProperty("/grnUIDtoList/" + length1 + "/grnItemUIList", result.hthislist);
			// 					oGRNModel.setProperty("/grnUIDtoList/" + length1 + "/grnItemTotalUIList", result.hthtlist);
			// 					oGRNModel.refresh();
			// 				}
			// 			},
			// 			error: function (e) {
			// 				MessageBox.errorg(e.message);
			// 			}
			// 		});

			// }
		},
		togglePOLineSelect: function (oEvent) {
			var oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel");
			var index = oEvent.getSource().getBindingContext("oPoSuggestionModel").sPath.split("/")[2];
			var bFlag = oEvent.getParameter("selected");
			var dto = "/POHeaderDetails/" + index + "/poItemList";
			var rowLength = oPoSuggestionModel.getProperty(dto).length;
			var modelPOData = oPoSuggestionModel.getData().POHeaderDetails[index].poItemList;
			for (var i = 0; i < rowLength; i++) {
				var path = dto + "/" + i;
				if (oPoSuggestionModel.getProperty(path + "/deletionInd") == false && oPoSuggestionModel.getProperty(path + "/isMatched") ==
					false) {
					modelPOData[i].checkBoxSelection = bFlag;
				}
			}
			oPoSuggestionModel.refresh();
		},

		toggleEachPOLineSelect: function (oEvent) {
			var oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel");
			var index = oEvent.getSource().getBindingContext("oPoSuggestionModel").sPath.split("/")[2];
			var sId = oEvent.oSource.oParent.oParent.oParent.sId.split("poTableId-")[1];
			var modelPOData = oPoSuggestionModel.getData().POHeaderDetails[index].poItemList;
			if (oEvent.getSource().getSelected()) {
				for (var i = 0; i < modelPOData.length; i++) {
					if (modelPOData[i].deleted == "true" || modelPOData[i].checkBoxSelection == true || modelPOData[i].checkboxVisible == "true") {
						this.getView().byId("container-APInvoiceTask---invoiceTask--idtogglePOLine-" + sId).setSelected(true);
					} else {
						this.getView().byId("container-APInvoiceTask---invoiceTask--idtogglePOLine-" + sId).setSelected(false);
						break;
					}
				}
			} else {
				this.getView().byId("container-APInvoiceTask---invoiceTask--idtogglePOLine-" + sId).setSelected(false);
			}
		},
		getGRNDetails: function () {
			var oGRNModel = this.getView().getModel("oGRNModel"),
				oInvoiceModel = this.getView().getModel("oInvoiceModel");
			if (!oGRNModel.getData().grnUIDtoList) {
				var url = "InctureApDest/poDetails?requestId=" + oInvoiceModel.getData().oInvoiceHeaderDetails.requestId;
				jQuery
					.ajax({
						url: url,
						type: "GET",
						dataType: "json",
						success: function (result) {
							if (!oGRNModel.getData().grnUIDtoList) {
								oGRNModel.getData().grnUIDtoList = [];
								var length1 = 0;
							} else {
								var length1 = oGRNModel.getData().grnUIDtoList.length;
							}
							if (result.poHistory.length > 0) {

								oGRNModel.getData().grnUIDtoList.push(result.response);
								oGRNModel.getData().grnUIDtoList[length1].documentNumber = result.poHistoryTotal[0].documentNumber;
								oGRNModel.getData().grnUIDtoList[length1].grnItemUIListVisible = true;
								oGRNModel.getData().grnUIDtoList[length1].grnItemTotalUIListVisible = false;
								// oGRNModel.setProperty("/grnUIDtoList/" + length1 + "/grnItemUIList", result.poHistory);
								// oGRNModel.setProperty("/grnUIDtoList/" + length1 + "/grnItemTotalUIList", result.poHistoryTotal);
								oGRNModel.setProperty("/grnUIDtoList/" + length1 + "/grnItemUIList", result.poHistoryTotal);
								oGRNModel.setProperty("/grnUIDtoList/" + length1 + "/grnItemTotalUIList", result.poHistory);
								for (var i = 0; i < oGRNModel.getData().grnUIDtoList[length1].grnItemTotalUIList.length; i++) {
									oGRNModel.getData().grnUIDtoList[length1].grnItemTotalUIList[i].histType = ui.incture.APInvoiceTask.util.Formatter.histValue(
										oGRNModel.getData().grnUIDtoList[length1].grnItemTotalUIList[i].histType);
								}
								oGRNModel.refresh();
								this.handleGroupDialogConfirm();
							}
						}.bind(this)
					});
			}
		},
		getPODetails: function (oEvent) {
			var oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel"),
				oInvoiceModel = this.getView().getModel("oInvoiceModel");
			if (!oEvent || oPoSuggestionModel.getData().POHeaderDetails.length == 0) {
				this.openBusyDialog();
				var url = "InctureApDest/purchaseDocumentHeader?requestId=" + oInvoiceModel.getData().oInvoiceHeaderDetails.requestId;
				jQuery
					.ajax({
						url: url,
						type: "GET",
						async: false,
						dataType: "json",
						success: function (result) {
							if (result.purchaseDocumentDetailsDto.documentNumber) {
								// for (var i = 0; i < result.purchaseDocumentDetailsDto.length; i++) {
								var length = oPoSuggestionModel.getData().POHeaderDetails.length;
								oPoSuggestionModel.getData().POHeaderDetails = [];
								oPoSuggestionModel.getData().POHeaderDetails.push(result.purchaseDocumentDetailsDto);
								oPoSuggestionModel.setProperty("/POHeaderDetails/0/poItemList", result.purchaseDocumentDetailsDto.purchaseDocItems);
								// for (var j = 0; j < oPoSuggestionModel.getData().POHeaderDetails[length].poItemList.length; j++) {
								// 	oPoSuggestionModel.getData().POHeaderDetails[length].poItemList[j].checkboxVisible = true;
								// }
								oPoSuggestionModel.refresh();
							}
							this.closeBusyDialog();
						}.bind(this),
						error: function () {
								MessageToast.show("Service Failed");
								this.closeBusyDialog();
							}.bind(this)
							// }
					});
			}
		},
		toggleAllLineSelect: function (oEvent) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var selectedItem = oEvent.getParameter("selected");
			var modelData = oEvent.getSource().getModel("oInvoiceModel").getData().oInvoiceHeaderDetails.invoiceItems;
			modelData.map(function (val) {
				if (val.isTwowayMatched == true) {
					return val.isSelected = selectedItem;
				}
				// return "false";
			});
			this.fnBalanceCalculation();
			oInvoiceModel.refresh();
		},
		partialPostingSelect: function () {
			// if (this.aFlag) {
			var invLineItems = this.getView().getModel("oInvoiceModel").getData().oInvoiceHeaderDetails.invoiceItems;
			if (invLineItems) {
				var length = invLineItems.length - 1 + "";
				// select line for posting which are two-way and three way match
				for (var i in invLineItems) {
					if (invLineItems[i].isSelected === false && (!invLineItems[i].isDeleted || invLineItems[i].isDeleted === false)) {
						this.byId("invTabAllSelectionId").setSelected(false);
						this.fnBalanceCalculation();
						return;
					} else if (length === i) {
						this.byId("invTabAllSelectionId").setSelected(true);
					}
				}
			}
			// }
			this.fnBalanceCalculation();
		},
		/* ************************ Invoice Items Fragment :END ********************************************** */

		/* ************************ Invoice Items Message Fragment :START ************************************ */

		/** 
		 * Event handler to open the Account Assignment Task from the Settings icon in the Items message fragment
		 * @public
		 * @param {object} oEvent Button object.
		 */
		fnItemMsgAccAssTab: function (oEvent) {
			var sTabKey = "accAssgTab",
				oSelLineItemData = oEvent.getSource().getModel("oInvLineMsgModel").getData();

			this._openTabsScreen(oSelLineItemData, sTabKey);

			this.fnCloseLineItemMessages();
		},
		onThreeWayMatching: function () {
			this.openBusyDialog();
			var oInvoiceModel = this.getModel("oInvoiceModel"),
				arrayIsNew = [],
				invoiceData = oInvoiceModel.getData();
			var objectIsNew = jQuery.extend({}, invoiceData.oInvoiceHeaderDetails);
			delete objectIsNew.invoiceItems;
			for (var i = 0; i < invoiceData.oInvoiceHeaderDetails.invoiceItems.length; i++) {
				// invoiceData.oInvoiceHeaderDetails.invoiceItems[i].changed && 
				if (!invoiceData.oInvoiceHeaderDetails.invoiceItems[i].isDeleted)
					arrayIsNew.push(invoiceData.oInvoiceHeaderDetails.invoiceItems[i]);
			}
			objectIsNew.postingDate = objectIsNew.postingDate ? new Date(objectIsNew.postingDate).getTime() : null;
			// var that = this;
			var newObject = {
				"invoiceHeader": objectIsNew,
				"invoiceItems": arrayIsNew
			};
			$.ajax({
				url: 'InctureApDest/invoiceItem/performThreeWayMatch',
				method: "POST",
				async: false,
				headers: {
					"X-CSRF-Token": this.getCSRFToken()
				},
				contentType: 'application/json',
				dataType: "json",
				data: JSON.stringify(newObject),
				success: function (result, xhr, data) {
					oInvoiceModel.setProperty("/oInvoiceHeaderDetails", result.invoiceHeader);
					oInvoiceModel.setProperty("/oInvoiceHeaderDetails/invoiceItems", result.invoiceItems);
					this.closeBusyDialog();
					MessageToast.show("3-Way Match has been executed.");
				}.bind(this),
				error: function (result, xhr, data) {
					this.closeBusyDialog();
					MessageToast.show("Validate Failed");
				}.bind(this)
			});
			oInvoiceModel.refresh();
		},
		threeWayMatchingErrorMsg: function (oEvent) {
			var oInvoiceModel = this.getModel("oInvoiceModel");
			var path = oEvent.getSource().getParent().getBindingContext("oInvoiceModel") + "/excpetionMessage";
			var messageModel = new JSONModel();
			var arry = [];
			for (var i = 0; i < oInvoiceModel.getProperty(path).length; i++) {
				arry.push(oInvoiceModel.getProperty(path + "/" + i + "/text"));
				messageModel.setProperty("/msg", arry);
			}
			this.getView().setModel(messageModel, "messageModel");
			var popoverList = new sap.m.List();
			var popoverCustList = new sap.m.StandardListItem();
			popoverCustList.bindProperty("title", "");
			popoverList.bindItems("/msg", popoverCustList);
			this.threeWayMatchingPopover = new sap.m.Popover({
				placement: "Bottom",
				showHeader: false,
				content: [popoverList]
			});
			this.threeWayMatchingPopover.setModel(this.getView().getModel("messageModel"));
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this.threeWayMatchingPopover.openBy(oButton);
			});
			// var oInvoiceModel = this.getModel("oInvoiceModel");
			// var path = oEvent.getSource().getParent().getBindingContext("oInvoiceModel") + "/excpetionMessage";
			// var messageModel = new JSONModel();
			// for (var i = 0; i < oInvoiceModel.getProperty(path).length; i++) {
			// 	var arry = [];
			// 	arry.push(oInvoiceModel.getProperty(path + "/" + i + "/text"));
			// }
			// messageModel.setProperty("/msg",arry);
			// var selectedList = oInvoiceModel.getProperty(path);
			// if (selectedList && selectedList.constructor !== Array) {
			// 	var arry = [];
			// 	arry.push(selectedList);
			// 	oInvoiceModel.setProperty(path, selectedList);
			// }
			// var popoverList = new sap.m.List();
			// var popoverCustList = new sap.m.StandardListItem();
			// popoverCustList.bindProperty("title", "");
			// popoverList.bindItems(path, popoverCustList);
			// this.threeWayMatchingPopover = new sap.m.Popover({
			// 	placement: "Bottom",
			// 	showHeader: false,
			// 	content: [popoverList]
			// });
			// this.threeWayMatchingPopover.setModel(this.getView().getModel("oInvoiceModel"));
			// var oButton = oEvent.getSource();
			// jQuery.sap.delayedCall(0, this, function () {
			// 	this.threeWayMatchingPopover.openBy(oButton);
			// });
		},

		/* ************************ Invoice Items Message Fragment :END ************************************ */

		/* ************************ Purchase order Tab :START ************************************ */
		toggleHdrLayout: function (oEvent) {
			if (oEvent)
				var selKey = oEvent.getParameters().item.getKey();
			else
				var selKey = "invoice";
			var oPropertyModel = this.getView().getModel("oPropertyModel");
			if (oPropertyModel) {
				if (selKey === "invoice") {
					oPropertyModel.getData().invVisible = true;
					oPropertyModel.getData().poVisible = false;
					oPropertyModel.getData().grnVisible = false;
					// 	// this.getView().byId("invTabId").setVisible(true);
					// 	// this.getView().byId("poTabId").setVisible(false);
					// 	// this.getView().byId("grnTab").setVisible(false);
				} else if (selKey === "po") {
					oPropertyModel.getData().invVisible = false;
					oPropertyModel.getData().poVisible = true;
					oPropertyModel.getData().grnVisible = false;
					// 	// this.getView().byId("invTabId").setVisible(false);
					// 	// this.getView().byId("poTabId").setVisible(true);
					// 	// this.getView().byId("grnTab").setVisible(true);
				} else {
					oPropertyModel.getData().invVisible = false;
					oPropertyModel.getData().poVisible = false;
					oPropertyModel.getData().grnVisible = true;
				}
				oPropertyModel.refresh();
			}
		},
		/* ************************ Purchase order Tab :START ************************************ */
		/* ************************ Tabs Fragment Event Handlers :START ************************************ */

		/** 
		 * Event handler when the close button in the Tabs Fragment is pressed to close the tabs.
		 * @public
		 * @param {object} oEvent is the button object.
		 */
		fnRemoveTabsScreen: function (oEvent) {
			var oPropertyModel = this.getModel("oPropertyModel");

			oPropertyModel.setProperty("/bTabsScreenOpen", false);

			this._removeContentArea();

			if (oPropertyModel.getProperty("/bPdfTabRequired")) {
				this._addPdfContentArea();
			}
		},

		copyPOToInvoiceTabRow: function (oEvent) {
			var oInvoiceModel = this.getModel("oInvoiceModel");
			var index = oEvent.getSource().getId().split("-").pop();
			var oPoSuggestionModel = this.getModel("oPoSuggestionModel");
			var oPoSuggestionModelData = oPoSuggestionModel.getData().POHeaderDetails[index].poItemList;
			var oInvoiceModelData = oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems;
			for (var i = 0; i < oPoSuggestionModelData.length; i++) {
				if (oPoSuggestionModelData[i].checkBoxSelection && !oPoSuggestionModelData[i].isMatched) {
					oPoSuggestionModelData[i].isMatched = true;
					// oInvoiceModelData.push(oPoSuggestionModelData[i]);
					oInvoiceModelData.push({
						"itemId": "",
						"itemCode": "",
						"itemText": oPoSuggestionModelData[i].shortText,
						"invoiceUPCCode": "",
						"invQty": oPoSuggestionModelData[i].poQty,
						"poVendMat": oPoSuggestionModelData[i].vendMat,
						"qtyUom": oPoSuggestionModelData[i].orderUnit,
						"price": oPoSuggestionModelData[i].netPrice,
						"currency": "",
						"pricingUnit": "",
						"unit": "",
						"disAmt": "",
						"disPer": "",
						"shippingAmt": "",
						"shippingPer": "",
						"taxAmt": "",
						"taxPer": "",
						"netWorth": oPoSuggestionModelData[i].poQty * oPoSuggestionModelData[i].netPrice,
						"itemComment": "",
						"isTwowayMatched": true,
						"isThreewayMatched": true,
						"matchDocNum": oPoSuggestionModelData[i].documentNumber,
						"matchDocItem": oPoSuggestionModelData[i].documentItem,
						"matchedBy": "UI",
						"match_param": "",
						"unused_field1": "",
						"unused_field2": "",
						"3 wayMessae(ItemComment)": "",
						"isThreewayQtyIssue": "",
						"isThreewayPriceIssue": "",
						"poAvlQtyOPU": "",
						"poAvlQtyOU": "",
						"poAvlQtySKU": "",
						"poMaterialNum": oPoSuggestionModelData[i].materialNum,
						"shortText": oPoSuggestionModelData[i].shortText,
						"unitPriceOPU": "",
						"unitPriceOU": "",
						"unitPriceSKU": "",
						"poNetPrice": oPoSuggestionModelData[i].poQty * oPoSuggestionModelData[i].netPrice,
						"poTaxCode": "",
						"poTaxPer": "",
						"poTaxValue": "",
						"isDeleted": false,
						"isSelected": true
					});
					// oPoSuggestionModelData[i].checkboxVisible = false;
				}
			}
			oPoSuggestionModel.refresh();
			// this.getView().byId("idInvItemTable").setVisibleRowCount(oInvoiceModel.getData().oInvoiceLineItems.length);
			// oInvoiceModel.getData().rowVisible = oInvoiceModel.getData().oInvoiceLineItems.length;
			oInvoiceModel.refresh();
			this.fnBalanceCalculation();
			// this.grnAmountCalculation(oPoSuggestionModel, oInvoiceModel);
		},
		fnDeletePO: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("oPoSuggestionModel").getPath(),
				PONumber = oEvent.getSource().getBindingContext("oPoSuggestionModel").getObject().documentNumber,
				oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel"),
				oInvoiceModel = this.getView().getModel("oInvoiceModel").
			that = this;
			var dialogBox = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
					new sap.m.Text({
						text: 'Are you sure you want to delete Purchase Order : ' + PONumber
					})
				],
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						var index = sPath.split("/").pop(),
							requestId = oInvoiceModel.getData().oInvoiceHeaderDetails.requestId;
						oPoSuggestionModel.getData().POHeaderDetails.splice(index, 1);
						oPoSuggestionModel.refresh();
						var url = "InctureApDest/purchaseDocumentHeader/deletePO?requestId=" + requestId + "&poNum=" + PONumber;
						jQuery
							.ajax({
								url: url,
								type: "DELETE",
								headers: {
									"X-CSRF-Token": that.getCSRFToken()
								},
								dataType: "json",
								success: function (result) {
									oInvoiceModel.setProperty("/oInvoiceHeaderDetails", result.headerDto);
									dialogBox.close();
								}.bind(this)
							});
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialogBox.close();
					}
				})

			});
			dialogBox.open();
		},
		grnAmountCalculation: function (oPoSuggestionModel, oInvoiceModel) {
			var oInvoiceModelData = oInvoiceModel.getData().oInvoiceLineItems;
			var grnData = oPoSuggestionModel.getData().grnList;
			for (var i = 0; i < oInvoiceModelData.length; i++) {
				for (var j = 0; j < grnData.length; j++) {
					if (oInvoiceModelData[i].poNumber == grnData[j].PoNumber) {
						for (var k = 0; k < grnData[j].grnItemTotalUIList.length; k++) {
							if (oInvoiceModelData[i].poItem == grnData[j].grnItemTotalUIList[k].PoItem) {
								oInvoiceModelData[i].sAvlGrQuant = grnData[j].grnItemTotalUIList[k].DelivQty - grnData[j].grnItemTotalUIList[k].IvQty;
							}
						}
					}
				}
			}
			oInvoiceModel.refresh();
		},
		/* ************************ Tabs Fragment Event Handlers :END ************************************ */

		/* ************************ SUBMIT TASK:START ************************************ */
		fnSubmit: function (oEvent) {
			var that = this;
			var dialogBox = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [new sap.m.Text({
					text: 'Are you sure you want to Submit the Task?'
				})],
				beginButton: new sap.m.Button({
					text: 'Submit',
					press: function () {
						that.onSubmit(oEvent);
						dialogBox.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialogBox.close();
					}
				})
			});
			dialogBox.open();
		},

		onSubmit: function (oEvent) {
			this.openBusyDialog();
			var token = this.getCSRFToken(),
				url, msg, validateFlag;
			var jsonData = this._fnOnSubmitCall(oEvent);
			jsonData = JSON.stringify(jsonData);
			var that = this;
			if (oEvent.getSource().getText() == "Submit") {
				if (this.submitValidate()) {
					url = "InctureApDest/email/postInvoiceToSAP";
					msg = "Task Completed Successfully";
					validateFlag = true;
				} else {
					validateFlag = false;
					this.closeBusyDialog();
				}
			} else {
				if (this.submitValidate()) {
					validateFlag = true;
					url = "InctureApDest/invoiceHeader/saveOrUpdate";
					msg = "Task Saved Successfully";
				} else {
					validateFlag = false;
					this.closeBusyDialog();
				}
			}
			if (validateFlag == true) {
				$.ajax({
					url: url,
					method: "POST",
					async: false,
					headers: {
						"X-CSRF-Token": token
					},
					contentType: 'application/json',
					dataType: "json",
					data: jsonData,
					success: function (result, xhr, data) {
						that.closeBusyDialog();
						if (result.response)
							var message = result.response.message;
						else
							var message = result.message;
						if (result.invoiceHeader)
							var invNo = result.invoiceHeader.sapInvoiceNumber;
						else
							var invNo = "";
						if (result.response) {
							if (result.response.status != "Failure") {
								sap.m.MessageBox.success(message, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										that._removeContentArea();
										that.fnBackToMain();
										that.oRouter.navTo("Workbench");
									}
								});
							} else {
								sap.m.MessageBox.information(message, {
									actions: [sap.m.MessageBox.Action.OK]
								});
							}
						} else {
							sap.m.MessageBox.success(message + " " + invNo, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									that._removeContentArea();
									that.fnBackToMain();
									that.oRouter.navTo("Workbench");
								}
							});
						}
					},
					error: function (result, xhr, data) {
						that.closeBusyDialog();
						MessageToast.show("Failed");
					}
				});
			}
		},
		submitValidate: function () {
			var oInvoiceModelData = this.getModel("oInvoiceModel").getData().oInvoiceHeaderDetails;
			if (!oInvoiceModelData.vendorId) {
				sap.m.MessageToast.show("Please enter the Vendor id");
				return false;
			}
			if (!oInvoiceModelData.extInvNum) {
				sap.m.MessageToast.show("Please enter the Invoice Number");
				return false;
			}
			if (!oInvoiceModelData.invoiceDate) {
				sap.m.MessageToast.show("Please enter Invoice Date");
				return false;
			}
			if (!oInvoiceModelData.postingDate) {
				sap.m.MessageToast.show("Please enter Posting Date");
				return false;
			}
			if (!oInvoiceModelData.invoiceTotal) {
				sap.m.MessageToast.show("Please enter Invoice Total");
				return false;
			}
			return true;
		},
		_fnOnSubmitCall: function (oEvent) {
			var oInvoiceModel = this.getModel("oInvoiceModel"),
				attachmentModel = this.getModel("attachmentModel"),
				invoiceData = oInvoiceModel.getData();
			if (oEvent.getSource().getText() == "Save") {
				var obj = invoiceData.oInvoiceHeaderDetails;
				obj.createdByInDb = obj.emailFrom;
				obj.createdAtInDB = obj.createdAtInDB;
				obj.updatedBy = obj.emailFrom;
				obj.postingDate = obj.postingDate ? new Date(obj.postingDate).getTime() : null;
				obj.updatedAt = new Date().getTime();
				obj.comments = invoiceData.comments;
				obj.attachments = [];
				if (attachmentModel.getData().pdfData)
					obj.attachments.push(attachmentModel.getData().pdfData[0]);
				if (attachmentModel.getData().docManagerDto && attachmentModel.getData().docManagerDto.length > 0) {
					for (var i = 0; i < attachmentModel.getData().docManagerDto.length; i++) {
						obj.attachments.push(attachmentModel.getData().docManagerDto[i]);
					}
				}
				return obj;
			} else {
				var arrayIsNew = [];
				var objectIsNew = jQuery.extend({}, invoiceData.oInvoiceHeaderDetails);
				delete objectIsNew.invoiceItems;
				for (var i = 0; i < invoiceData.oInvoiceHeaderDetails.invoiceItems.length; i++) {
					// invoiceData.oInvoiceHeaderDetails.invoiceItems[i].changed && 
					if (!invoiceData.oInvoiceHeaderDetails.invoiceItems[i].isDeleted)
						arrayIsNew.push(invoiceData.oInvoiceHeaderDetails.invoiceItems[i]);
				}
				objectIsNew.postingDate = objectIsNew.postingDate ? new Date(objectIsNew.postingDate).getTime() : null;
				// var arrayIsNew = jQuery.extend([], invoiceData.oInvoiceHeaderDetails.invoiceItems);
				var newObject = {
					"invoiceHeader": objectIsNew,
					"invoiceItems": arrayIsNew
				};
				newObject.attachments = [];
				if (attachmentModel.getData().pdfData)
					newObject.attachments.push(attachmentModel.getData().pdfData[0]);
				if (attachmentModel.getData().docManagerDto && attachmentModel.getData().docManagerDto.length > 0) {
					for (var i = 0; i < attachmentModel.getData().docManagerDto.length; i++) {
						newObject.attachments.push(attachmentModel.getData().docManagerDto[i]);
					}
				}
				return newObject;
			}
		},
		onRejectCombo: function (oEvent) {
			var rejectModel = this.rejectFragment.getModel("rejectModel");
			rejectModel.setProperty("/text", oEvent.getParameters().selectedItem.getProperty("text"));
			rejectModel.setProperty("/key", oEvent.getParameters().selectedItem.getProperty("key"));
		},
		fnRejectDropdown: function () {
			var rejectModel = new sap.ui.model.json.JSONModel(),
				language = sap.ui.getCore().getConfiguration().getLanguage().split("-")[0].toUpperCase();
			this.getView().setModel(rejectModel, "rejectModel");
			jQuery
				.ajax({
					url: "InctureApDest/rejReason/getAll/" + language,
					type: "GET",
					async: false,
					dataType: "json",
					success: function (result) {
						rejectModel.setProperty("/items", result);
					},
					error: function () {}
				});
		},
		onReject: function () {
			this.fnRejectDropdown();
			var rejectModel = this.getView().getModel("rejectModel");
			if (!this.rejectFragment) {
				this.rejectFragment = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.fragments.rejectDialog", this);
				this.getView().addDependent(this.rejectFragment);
			}
			this.rejectFragment.setModel(rejectModel, "rejectModel");
			this.rejectFragment.open();
		},
		onCloseReject: function () {
			this.rejectFragment.close();
		},
		onRejectConfirm: function () {
			var rejectModelData = this.rejectFragment.getModel("rejectModel").getData();
			if (rejectModelData.text) {
				var url = "InctureApDest/invoiceHeader/updateLifeCycleStatus",
					oInvoiceData = this.getModel("oInvoiceModel").getData().oInvoiceHeaderDetails,
					jsonData = {
						"requestId": oInvoiceData.requestId,
						"lifecycleStatus": "Rejected",
						"rejectionText": rejectModelData.text,
						"reasonForRejection": rejectModelData.key,
					},
					that = this;
				$.ajax({
					url: url,
					method: "PUT",
					async: false,
					headers: {
						"X-CSRF-Token": this.getCSRFToken()
					},
					contentType: 'application/json',
					dataType: "json",
					data: JSON.stringify(jsonData),
					success: function (result, xhr, data) {
						that.rejectFragment.close();
						that.closeBusyDialog();
						if (result.response)
							var message = result.response.message;
						else
							var message = result.message;
						sap.m.MessageBox.information(message, {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								that._removeContentArea();
								that.fnBackToMain();
								that.oRouter.navTo("Workbench");
							}
						});
					},
					error: function (result, xhr, data) {
						that.rejectFragment.close();
						that.closeBusyDialog();
						MessageToast.show("Failed");
					}
				});
			} else {
				sap.m.MessageToast.show("Please select Reason Code");
			}
		},
		/* ************************ SUBMIT TASK:END ************************************ */

		/* =========================================================== */
		/* Private Methods                                             */
		/* =========================================================== */

		/** 
		 * ON INIT - Load the Invoice Header and Details Fragments. PDF for split screen is loaded
		 * @private
		 */
		_setUpTheLayout: function () {
			var oSplitAreaOneBox,
				//oPdfFrame,
				// oPDFModel = this.getModel("oPDFModel"),
				oSplitter = this.byId("idMainSplitter"),
				oPropertyModel = this.getModel("oPropertyModel");

			oSplitAreaOneBox = new sap.m.VBox({
				items: [
					this._getFormFragment("invoiceHeader"),
					this._getFormFragment("invoiceItems"),
					this._getFormFragment("accAssignment")
				]
			});

			oSplitter.insertContentArea(oSplitAreaOneBox, 0);
			// if(	this.byId("idHeaderGridPartTwo"))
			// this.byId("idHeaderGridPartTwo").setDefaultSpan("L6 M6 S12");

			// Split Screen Configuration
			if (oPropertyModel.getProperty("/oConfigurableProperties/bSplitScreenRequired")) {
				// this._addPdfContentArea();
			} else {
				// Open the PDF in new window
			}

		},

		onDemandPDF: function () {
			this._addPdfContentArea();
			this.byId("idHeaderGridPartTwo").setDefaultSpan("L6 M6 S12");
			this.byId("idOpenPDFBtn").setEnabled(false);
		},

		_addPdfContentArea: function () {
			this.getView().byId("headerPanelId").addStyleClass("pdfInvoiceHeaderClass");
			this.getView().byId("headerPanelId").removeStyleClass("invoiceHeaderClass");
			var that = this;
			var pdfData = this.getView().getModel("attachmentModel").getData().pdfData[0];
			that.pdf = sap.ui.xmlfragment(that.getView().getId(), "ui.incture.APInvoiceTask.view.fragments.pdf", that);
			var oPdfFrame = that.pdf.getItems()[1];
			oPdfFrame.setContent('<embed width="100%" height="859rem" name="plugin" src="data:application/pdf;base64, ' + pdfData.fileBase64 +
				'" ' + 'type=' + "" + "application/pdf" + " " + 'internalinstanceid="21">');
			var oSplitter = that.byId("idMainSplitter");
			var oLastContentArea = oSplitter.getContentAreas().pop();
			if (oSplitter.getContentAreas().length > 1)
				oSplitter.removeContentArea(oLastContentArea);
			if (oSplitter.getContentAreas().length === 1)
				oSplitter.insertContentArea(that.pdf, 1);
		},
		getPdfData: function () {
			// if (!this.getView().getModel("attachmentModel").getData().pdfData) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var oPropertyModel = this.getView().getModel("oPropertyModel");
			$.ajax({
				url: "InctureApDest/attachment?requestId=" + oInvoiceModel.getData().oInvoiceHeaderDetails.requestId,
				method: "GET",
				async: true,
				success: function (result, xhr, data) {
					var attachmentModel = new JSONModel();
					this.getView().setModel(attachmentModel, "attachmentModel");
					oPropertyModel.setProperty("/bPdfBtn", false);
					for (var i = 0; i < result.attachmentList.length; i++) {
						if (result.attachmentList[i].master) {
							attachmentModel.getData().pdfData = result.attachmentList.splice(i, 1);
							oPropertyModel.setProperty("/bPdfBtn", true);
						}
					}
					attachmentModel.getData().docManagerDto = result.attachmentList;
					attachmentModel.refresh();
				}.bind(this)
			});
			// }
		},
		getComments: function () {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			$.ajax({
				url: "InctureApDest/comment?requestId=" + oInvoiceModel.getData().oInvoiceHeaderDetails.requestId,
				method: "GET",
				async: true,
				success: function (result, xhr, data) {
					oInvoiceModel.getData().comments = result.commentDtos;
					oInvoiceModel.refresh();
				}.bind(this)
			});
			// }
		},

		/** 
		 * onInit - Setting up the Invoice Task Header. Configurable Model is required here.
		 * @private
		 */
		_setUpInvoiceHeader: function () {
			var aHiddenFields = [],
				oPropertyModel = this.getModel("oPropertyModel"),
				oInvHeaderConfig = oPropertyModel.getProperty("/oInvHeaderFieldsConfig");

			for (var oElement in oInvHeaderConfig) {
				if (oInvHeaderConfig.hasOwnProperty(oElement)) {
					if (oInvHeaderConfig[oElement] === false) {
						aHiddenFields.push(oElement);
					}
				}
			}

			if (aHiddenFields.length > 0) {
				oPropertyModel.setProperty("/bHiddenInvHeader", true);
				oPropertyModel.setProperty("/oConfigurableProperties/bEnableMoreInvHeader", true);
			} else {
				oPropertyModel.setProperty("/bHiddenInvHeader", false);
				oPropertyModel.setProperty("/oConfigurableProperties/bEnableMoreInvHeader", false);
			}

			oPropertyModel.setProperty("/aHiddenInvHeader", aHiddenFields);
		},

		/** 
		 * ON fnClearSorting - Clears all the sorted columns.
		 * @private
		 */
		_resetSortingState: function () {
			var oInvItemTable = this.byId("idInvItemTable");
			var aColumns = oInvItemTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},

		/** 
		 * Resizing the Splitter Layout
		 * @private
		 */
		_resizeSplitterLayout: function () {
			var oContentLayout,
				oSplitter = this.byId("idMainSplitter");

			oSplitter.getContentAreas().forEach(function (oElement) {
				oContentLayout = oElement.getLayoutData();
				oContentLayout.setSize("auto");
			});
		},

		/** 
		 * Removing the content from the split screen
		 * @private
		 */
		_removeContentArea: function () {
			this.getView().byId("headerPanelId").addStyleClass("invoiceHeaderClass");
			this.getView().byId("headerPanelId").removeStyleClass("pdfInvoiceHeaderClass");
			var oSplitter = this.byId("idMainSplitter"),
				oHeaderGridTwo = this.byId("idHeaderGridPartTwo");
			if (oSplitter.getContentAreas().length > 1) {
				var oLastContentArea = oSplitter.getContentAreas().pop();

				oSplitter.removeContentArea(oLastContentArea);
				// oLastContentArea.destroy();						// Creating an error when re-inserting tabs fragment
			}
			oHeaderGridTwo.setDefaultSpan("L3 M12 S12");

			this._resizeSplitterLayout();
			this.byId("idOpenPDFBtn").setEnabled(true);

		},

		/** 
		 * Removing the content from the split screen
		 * @private
		 * @param {boolean} bIsPdfReqInNewWindow for opening the PDF in new window
		 * @param {boolean} bIsPdfTabRequired for opening the PDF tab
		 */
		_configurePDF: function (bIsPdfReqInNewWindow, bIsPdfTabRequired) {
			var oPDFModel = this.getModel("oPDFModel"),
				oPropertyModel = this.getModel("oPropertyModel");

			if (bIsPdfReqInNewWindow && !oPropertyModel.getProperty("/bPdfOpenInNewWindow")) {
				var oSplitter = this.byId("idMainSplitter");
				var oLastContentArea = oSplitter.getContentAreas().pop();
				if (oSplitter.getContentAreas().length > 1)
					oSplitter.removeContentArea(oLastContentArea);
				var pdfData = this.getView().getModel("attachmentModel").getData().pdfData[0];
				var prntWin = window.open();
				if (prntWin) {
					prntWin.document.write("<html><head><title>" + pdfData.fileName + "</title></head><body>" +
						'<embed width="100%" height="859rem" name="plugin" src="data:application/pdf;base64, ' + pdfData.fileBase64 +
						'" ' + 'type=' + "" + "application/pdf" + " " + 'internalinstanceid="21">' + " < /body></html > ");
					prntWin.document.close();
				}
				// window.open(oPDFModel.getProperty("/Source"), "_blank");
				// oPropertyModel.setProperty("/bPdfOpenInNewWindow", true);
			}

			if (bIsPdfTabRequired) {
				oPropertyModel.setProperty("/bPdfTabRequired", true);
			} else {
				oPropertyModel.setProperty("/bPdfTabRequired", false);
			}

		},

		/** 
		 * Open the Tabs Screen as a split screen
		 * @private
		 * @param {object} oSelectedData is the selected line item data from the invoice line item
		 * @param {string} sSelectedTab provides the Key for the tab to be selected when the fragment opens
		 */
		_openTabsScreen: function (oSelectedData, sSelectedTab) {
			var oSplitter = this.byId("idMainSplitter"),
				aContentAreas = oSplitter.getContentAreas(),
				oHeaderGridTwo = this.byId("idHeaderGridPartTwo"),
				oPropertyModel = this.getModel("oPropertyModel");

			// If PDF screen is open, then we need to close the PDF first
			if (aContentAreas.length === 2 && !(oPropertyModel.getProperty("/bTabsScreenOpen"))) {
				this._removeContentArea();
			}

			if (!oPropertyModel.getProperty("/bTabsScreenOpen")) {
				oHeaderGridTwo.setDefaultSpan("L4 M12 S12");
				oPropertyModel.setProperty("/bTabsScreenOpen", true);

				oSplitter.insertContentArea(this._getFormFragment("tabBars"), 1);

				this._configurePDF(false, !oPropertyModel.getProperty("/bPdfOpenInNewWindow"));
			}

			oPropertyModel.setProperty("/sSelectedTabKey", sSelectedTab);
		},

		_getPaymentTerms: function (sEntitySet) {
			//oDropDownModel = this.getModel("oDropDownModel"),
			// var oAutomationSerModel = this.getModel("oAutomationSerModel");
			var oAutomationSerModel = new JSONModel();
			this.setModel(oAutomationSerModel, "oAutomationSerModel");
			var vendor = this.getView().getModel("oInvoiceModel").getData().oInvoiceHeaderDetails.vendorId,
				ccode = this.getView().getModel("oInvoiceModel").getData().oInvoiceHeaderDetails.compCode;
			var sUrl = "DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentMethodsSet?$filter=Vendor eq'" + vendor +
				"'and CompCode eq'" + ccode + "'&$format=json";
			$.ajax({
				url: sUrl,
				method: "GET",
				async: true,
				success: function (result, xhr, data) {
					oAutomationSerModel.setProperty("/paymentMethod", result.d.results);
				},
				error: function (result, xhr, data) {
					// MessageToast.show("Unable to fetch Data");
				}
			});
			var bUrl = "DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentBlockSet?$filter=Vendor eq'" + vendor +
				"'and CompCode eq'" + ccode + "'&$format=json";
			$.ajax({
				url: bUrl,
				method: "GET",
				async: true,
				success: function (result, xhr, data) {
					oAutomationSerModel.setProperty("/paymentBlock", result.d.results);
				},
				error: function (result, xhr, data) {
					// MessageToast.show("Unable to fetch Data");
				}
			});
			var tUrl = "DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSet?$filter=Vendor eq'" + vendor +
				"'and CompCode eq'" + ccode + "'&$format=json";
			$.ajax({
				url: tUrl,
				method: "GET",
				async: true,
				success: function (result, xhr, data) {
					oAutomationSerModel.setProperty("/paymentTerm", result.d.results);
				},
				error: function (result, xhr, data) {
					// MessageToast.show("Unable to fetch Data");
				}
			});

		},
		/** Delete Press Action in Invoice Line Items Column */
		openDeletionList: function (oEvent) {
			var that = this;
			var oButton = oEvent.getSource();
			jQuery.sap.require("sap.ui.unified.Menu");
			var modelData = that.getView().getModel("oInvoiceModel");
			if (!this.deleteActionList) {
				this.deleteActionList = new sap.ui.unified.Menu({
					itemSelect: function (oEvent) {
						if (oEvent.getParameter("item").getText() == "All Items") {
							var invLineItemDetail = modelData.getProperty("/oInvoiceHeaderDetails/invoiceItems");
							if (invLineItemDetail) {
								for (var i = 0; i < invLineItemDetail.length; i++) {
									invLineItemDetail[i].deleted1 = "true";
								}
								modelData.refresh();
							}
						}
						that.deleteInvLineItem(oEvent, that);
					},
					"items": [
						new sap.ui.unified.MenuItem({
							"text": "All Items"
						}),
						new sap.ui.unified.MenuItem({
							"text": "Selected Items"
						})
					]
				});
			}
			var eDock = sap.ui.core.Popup.Dock;
			this.deleteActionList.open(false, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},

		/*Sowndharya - UI Table*/
		/** Delete all invoice line items */
		deleteInvLineItem: function (oEvent, controller) {
			var oInvoiceModel = controller.getView().getModel("oInvoiceModel");
			var invLineDetail = oInvoiceModel.getProperty("/oInvoiceHeaderDetails/invoiceItems");
			if (invLineDetail) {
				for (var j = 0; j < invLineDetail.length; j++) {
					if (invLineDetail[j].deleted1 == "true") {
						invLineDetail[j].isDeleted = true;
						var dFlag = true;
					} else {
						invLineDetail[j].isDeleted = false;
					}
				}
			}
			if (dFlag) {
				var invLineData = oInvoiceModel.getProperty("/oInvoiceHeaderDetails/invoiceItems");
				if (invLineData) {
					for (var i = 0; i < invLineData.length; i++) {
						var id = "container-APInvoiceTask---invoiceTask--toggleBtn-container-APInvoiceTask---invoiceTask--idInvoiceTable-" + i;
						// var id = "__xmlview0--toggleBtn-col0-row" + i;
						//						var id = controller.getView().sId + "--" + "toggleBtn-" + controller.getView().sId + "--idInvoiceTable-" + i;
						if (sap.ui.getCore().byId(id)) {
							sap.ui.getCore().byId(id).setPressed(false);
						}
					}
				}
				this._fnRowVisible();
				this.fnBalanceCalculation();
				oInvoiceModel.refresh();
				sap.m.MessageToast.show("Successfully Deleted");
			} else {
				sap.m.MessageToast.show("Select atleast one line for delete");
			}
		},
		fnUndoTable: function (oEvent) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var invLineDetail = oInvoiceModel.getProperty("/oInvoiceHeaderDetails/invoiceItems");
			if (invLineDetail) {
				for (var j = 0; j < invLineDetail.length; j++) {
					invLineDetail[j].isDeleted = false;
				}
			}
			this._fnRowVisible();
			this.fnBalanceCalculation();
			oInvoiceModel.refresh();
		},
		deleteBtnPressAtLineItem: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("oInvoiceModel");
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			oInvoiceModel.setProperty(path.sPath + "/deleted1", "" + oEvent.getParameter("pressed"));
		},
		_fnRowVisible: function () {
			var aFilters = [];
			var invTabId = this.getView().byId("idInvoiceTable");
			var filter = new sap.ui.model.Filter("isDeleted", sap.ui.model.FilterOperator.EQ, false);
			aFilters.push(filter);
			var binding = invTabId.getBinding("items"); // update list binding
			binding.filter(aFilters, "Application");
		},
		createNewFragment: function (sFragmentID, sFragmentName) {
			var oFragment = sap.ui.xmlfragment(sFragmentID, sFragmentName, this);
			return oFragment;
		},

		/***************************************************MANUAL MATCHING - START******************************************************************/
		onPressManualMatching: function () {
			// var oFragmentName = "ui.incture.APInvoiceTask.view.fragments.manualMatching";
			// var ofragId = "onPressManualMatchingId";
			// var oPropertyModel = this.getView().getModel("oPropertyModel");
			// if (!this.myDialogFragment) {
			// 	this.myDialogFragment = this.createNewFragment(ofragId, oFragmentName);
			// 	this.getView().addDependent(this.myDialogFragment);
			// }
			// this.myDialogFragment.setModel(oPropertyModel, "oPropertyModel");
			if (this.fnmanualMatching()) {
				var oSplitAreaOneBox,
					oSplitter = this.byId("idMainSplitter");

				oSplitAreaOneBox = new sap.m.VBox({
					items: [
						this._getFormFragment("manualMatching")
					]
				});
				oSplitter.removeAllContentAreas();
				oSplitter.insertContentArea(oSplitAreaOneBox, 0);
				// this.myDialogFragment.open();
			}
		},
		fnCloseManualMatch: function () {
			this.myDialogFragment.close();
		},
		fnBackToMain: function () {
			var oSplitter = this.byId("idMainSplitter");
			oSplitter.removeAllContentAreas();
			this._setUpTheLayout();
		},
		/** Segmented button for the Matched and Unmatched invoice line items */
		fnMatUnMatSelection: function (oEvent) {
			var sBtnText = oEvent.getParameters().item.getKey();
			var oPropertyModel = this.getView().getModel("oPropertyModel");
			var bValue = sBtnText === "unmatched" ? true : false;
			oPropertyModel.setProperty("/bUnmatchedTblVis", bValue);
			oPropertyModel.setProperty("/bConfirmBtnVis", !bValue);
		},
		/** Manual Matching Screen Preparation */
		fnmanualMatching: function () {
			this.openBusyDialog();
			var oPropertyModel = this.getView().getModel("oPropertyModel");
			var oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel");
			if (oPoSuggestionModel.getData().POHeaderDetails.length == 0)
				this.getPODetails();
			var aPOlineItems = oPoSuggestionModel.getProperty("/POHeaderDetails");
			if (aPOlineItems && !(aPOlineItems instanceof Array)) {
				aPOlineItems = [aPOlineItems];
			}
			if (aPOlineItems && aPOlineItems.length > 0) {
				this._getMatchedInvItems();
				this._getUnmatchedInvItems();
				this._getUnmatchedPoItems();
				this.closeBusyDialog();
				return true;
			} else {
				this.closeBusyDialog();
				MessageBox.error("No PO found for the task. Kindly add PO.");
				return false;
			}
		},
		/**	Structure for Unmatched Invoice Line Items */
		_getUnmatchedInvItems: function () {
			var aUnmatchedInvLineItem = [];
			var oPropertyModel = this.getView().getModel("oPropertyModel");
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var aInvoiceLineItems = oInvoiceModel.getProperty("/oInvoiceHeaderDetails/invoiceItems");
			if (!(aInvoiceLineItems instanceof Array)) {
				aInvoiceLineItems = [aInvoiceLineItems];
			}
			aUnmatchedInvLineItem = aInvoiceLineItems.filter(function (oEle) {
				return oEle.isTwowayMatched === false && (!oEle.isDeleted || oEle.isDeleted === false); // Array for unmatched invoice line items
			});
			if (oPropertyModel.getProperty("/oManualMatching/aUnmatchedInvLineItem")) {
				oPropertyModel.setProperty("/oManualMatching/aUnmatchedInvLineItem", null);
			}
			oPropertyModel.setProperty("/oManualMatching/aUnmatchedInvLineItem", aUnmatchedInvLineItem);
		},

		/**	Structure for Matched Invoice Line Items */
		_getMatchedInvItems: function () {
			var aMatchedInvLineItem = [];
			var oPropertyModel = this.getView().getModel("oPropertyModel");
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var aInvoiceLineItems = oInvoiceModel.getProperty("/oInvoiceHeaderDetails/invoiceItems");
			if (!(aInvoiceLineItems instanceof Array)) {
				aInvoiceLineItems = [aInvoiceLineItems];
			}
			aMatchedInvLineItem = aInvoiceLineItems.filter(function (oEle) {
				return oEle.isTwowayMatched === true && (!oEle.isDeleted || oEle.isDeleted === false); // Array for matched invoice line item
			});
			if (oPropertyModel.getProperty("/oManualMatching/aMatchedInvLineItem")) {
				oPropertyModel.setProperty("/oManualMatching/aMatchedInvLineItem", null);
			}
			oPropertyModel.setProperty("/oManualMatching/aMatchedInvLineItem", aMatchedInvLineItem);
		},

		_getUnmatchedPoItems: function () {
			var aPODataList = [];
			var aUnmatchedPOLineItem = [];
			var oPropertyModel = this.getView().getModel("oPropertyModel");
			var oPoSuggestionModel = this.getView().getModel("oPoSuggestionModel");
			var aPOlineItems = oPoSuggestionModel.getProperty("/POHeaderDetails");
			aPODataList = this._getPoLineItemsForMM(aPOlineItems); // PO line items array
			aUnmatchedPOLineItem = aPODataList.filter(function (oEle) {
				return oEle.isMatched === false; // Array for unmatched PO line items
			});
			if (oPropertyModel.getProperty("/oManualMatching/aPODataList")) {
				oPropertyModel.setProperty("/oManualMatching/aPODataList", null);
			}
			if (oPropertyModel.getProperty("/oManualMatching/aUnmatchedPOLineItem")) {
				oPropertyModel.setProperty("/oManualMatching/aUnmatchedPOLineItem", null);
			}
			oPropertyModel.setProperty("/oManualMatching/aPODataList", aPODataList);
			oPropertyModel.setProperty("/oManualMatching/aUnmatchedPOLineItem", aUnmatchedPOLineItem);
		},
		_getPoLineItemsForMM: function (oPOlineItems) {
			var aPODataList = [];
			var oPONewDataObject;

			oPOlineItems.forEach(function (oEle, iIndex) {
				oEle.poItemList.forEach(function (oPoItem, iILineItem) {
					aPODataList.push(oEle.poItemList[iILineItem]);
				});
			});

			return aPODataList;
		},
		fnMatchBtnPress: function (oEvent) {
			// var oPropertyModel = this._getModel("oPropertyModel");
			// this.getView().byId("invoiceId").setBusy(true);
			this.openBusyDialog();
			var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
				invoiceData = oInvoiceModel.getData();
			var oInvItemSel = sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idUMInvTbl").getSelectedItem();
			if (oInvItemSel) {
				var objectIsNew = jQuery.extend({}, invoiceData.oInvoiceHeaderDetails);
				delete objectIsNew.invoiceItems;
				// this.byId("acPayPage").setBusy(true);
				var sManualMatUrl = "InctureApDest/invoiceItem/manualMatch";
				var oInvItemSelObj = oInvItemSel.getBindingContext("oPropertyModel").getObject();
				var oPoItemSelObj = oEvent.getSource().getBindingContext("oPropertyModel").getObject();
				objectIsNew.postingDate = objectIsNew.postingDate ? new Date(objectIsNew.postingDate).getTime() : "";
				var oManualMatchPayload = {
					"invoiceHeader": objectIsNew,
					"invoiceItem": oInvItemSelObj,
					"purchaseDocumentItem": oPoItemSelObj

				};
				$.ajax({
					url: sManualMatUrl,
					method: "POST",
					async: false,
					headers: {
						"X-CSRF-Token": this.getCSRFToken()
					},
					contentType: 'application/json',
					dataType: "json",
					data: JSON.stringify(oManualMatchPayload),
					success: function (result, xhr, data) {
						this.getPODetails();
						oInvoiceModel.setProperty("/oInvoiceHeaderDetails", result.invoiceHeader);
						oInvoiceModel.setProperty("/oInvoiceHeaderDetails/invoiceItems", result.invoiceItems);
						this._getMatchedInvItems();
						this._getUnmatchedInvItems();
						this._getUnmatchedPoItems();
						sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idUMInvTbl").removeSelections();
						sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idMatInvTbl").removeSelections();
						this.closeBusyDialog();
					}.bind(this),
					error: function (result, xhr, data) {
						this.closeBusyDialog();
						MessageToast.show("Service Failed");
					}.bind(this)
				});
			} else {
				this.closeBusyDialog();
				MessageToast.show("Select the Invoice Line Item first.");
			}

		},
		/**
		 * Confirm for unmatching the invoice line items
		 * @public
		 * @param {Object} [oEvent] Confirm Button Text
		 */
		fnConfirmUM: function (oEvent) {
			this.openBusyDialog();
			var oInvMatchedTbl = sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idMatInvTbl");
			var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
				invoiceData = oInvoiceModel.getData();
			var aSelInvoiceItems = oInvMatchedTbl.getSelectedItems();
			var objectIsNew = jQuery.extend({}, invoiceData.oInvoiceHeaderDetails);
			delete objectIsNew.invoiceItems;
			var umItems = [];
			// var detailPageModel = this._getModel("detailPageModel");
			if (aSelInvoiceItems.length > 0) {
				for (var i = 0; i < aSelInvoiceItems.length; i++) {
					umItems.push(aSelInvoiceItems[i].getBindingContext("oPropertyModel").getObject());
				}
				objectIsNew.postingDate = objectIsNew.postingDate ? new Date(objectIsNew.postingDate).getTime() : "";
				var oUMPayload = {
					"invoiceHeader": objectIsNew,
					"invoiceItems": umItems
				};
				var sManualUnMatUrl = "InctureApDest/invoiceItem/unMatchItems";
				$.ajax({
					url: sManualUnMatUrl,
					method: "POST",
					async: false,
					headers: {
						"X-CSRF-Token": this.getCSRFToken()
					},
					contentType: 'application/json',
					dataType: "json",
					data: JSON.stringify(oUMPayload),
					success: function (result, xhr, data) {
						this.getPODetails();
						oInvoiceModel.setProperty("/oInvoiceHeaderDetails", result.invoiceHeader);
						oInvoiceModel.setProperty("/oInvoiceHeaderDetails/invoiceItems", result.invoiceItems);
						this._getMatchedInvItems();
						this._getUnmatchedInvItems();
						this._getUnmatchedPoItems();
						sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idUMInvTbl").removeSelections();
						sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idMatInvTbl").removeSelections();
						this.closeBusyDialog();
					}.bind(this),
					error: function (result, xhr, data) {
						MessageToast.show("Service Failed");
						this.closeBusyDialog();
					}.bind(this)
				});
			} else {
				this.closeBusyDialog();
				MessageToast.show("Select the Invoice Line Item to unmatch with.");
			}
		},
		fnFilterTableData: function (oEvent) {
			var aFilters = [];
			var afilterArry = []; // update list binding
			var aMetaModel, sId;
			if (oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var sSearchFieldId = oEvent.getParameters().id.split("--").pop();
				if (sSearchFieldId == "idMatchedInvoice") {
					sId = "container-APInvoiceTask---invoiceTask--idMatInvTbl";
					aMetaModel = ["itemText", "vendorMaterialId", "upcCode", "shortText", "poVendMat", "poUPC", "matchDocItem"];
					// ,"matchDocItem"
				} else if (sSearchFieldId == "idUnmatchedInvoice") {
					if (sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idUnmatchedInvoiceSelect").getSelectedKey() == "all") {
						aMetaModel = ["itemText", "vendorMaterialId", "upcCode"];
					} else {
						aMetaModel = [sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idUnmatchedInvoiceSelect").getSelectedKey()];
					}
					sId = "container-APInvoiceTask---invoiceTask--idUMInvTbl";
				} else {
					if (sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idUnmatchedPOSelect").getSelectedKey() == "all") {
						aMetaModel = ["shortText", "poVendMat", "poUPC", "documentNumber", "documentItem"];
					} else {
						aMetaModel = [sap.ui.getCore().byId("container-APInvoiceTask---invoiceTask--idUnmatchedPOSelect").getSelectedKey()];
					}
					sId = "container-APInvoiceTask---invoiceTask--idPoTbl";
				}
				if (sQuery && sQuery.length > 0) {
					for (var i = 0; i < aMetaModel.length; i++) {
						var bindingName = aMetaModel[i];
						afilterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
					}
					var filter = new sap.ui.model.Filter(afilterArry, false);
					aFilters.push(filter);
				}
			}
			var reqList = sap.ui.getCore().byId(sId);
			var binding = reqList.getBinding("items");
			binding.filter(aFilters);
			oEvent.getSource().setSelectOnFocus(false);
		},
		/***************************************************MANUAL MATCHING - END******************************************************************/

		/******************************************************CALCULATIONS-START*****************************************************************************/
		calculateLineItemAmount: function (oEvt) {
			var index = oEvt.getSource().getBindingContext("oInvoiceModel").getPath().split("/").pop();
			if (this.getNumberDataTypeValidation(oEvt.getParameter("value"))) {
				oEvt.getSource().setValueState("None");
				var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
					modelData = oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems;
				// modelData[index].changed = true;
				modelData[index].netWorth = parseFloat(modelData[index].netWorth).toFixed(3);
				if (modelData.length > 0) {
					for (var i = 0; i < modelData.length; i++) {
						modelData[i].price = parseFloat(modelData[i].netWorth) / parseFloat(modelData[i].invQty);
						modelData[i].price = modelData[i].price.toFixed(3);
						if (modelData[i].isTwowayMatched) {
							modelData[i].amountDifference = modelData[i].netWorth - modelData[i].poNetPrice;
							modelData[i].amountDifference = modelData[i].amountDifference.toFixed(3);
						}
					}
				}
				oInvoiceModel.refresh();
				this.fnBalanceCalculation();
			} else {
				oEvt.getSource().setValueState("Error");
				oEvt.getSource().setValue("");
			}
		},
		hdrChargesAmtCalculation: function (oEvent, delFlag) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
				eFlag = false;
			if (oEvent) {
				if (oEvent.oSource.mBindingInfos.tooltip.binding.sPath == "amount") {
					if (this.getNumberDataTypeValidation(oEvent.getSource().getValue())) {
						oEvent.getSource().setValueState("None");
					} else {
						eFlag = true;
						oEvent.getSource().setValueState("Error");
						oEvent.getSource().setValue("");
					}
				}
			}
			if (!eFlag) {
				var deliveryCostData = oInvoiceModel.getData().nonPoDtoList;
				var totalAmt = 0;
				if (deliveryCostData) {
					for (var int = 0; int < deliveryCostData.length; int++) {
						if (deliveryCostData[int].debitCreditInd == "S") {
							totalAmt += parseFloat(deliveryCostData[int].amount);
						} else {
							totalAmt -= parseFloat(deliveryCostData[int].amount);
						}
					}
				}
				oInvoiceModel.getData().totalGlAmount = totalAmt;
				if (oEvent) {
					var path = oEvent.getSource().getBindingContext("oInvoiceModel").sPath;
					if (oInvoiceModel.getProperty(path + "/amount") == "0") {
						oInvoiceModel.setProperty(path + "/amount", "");

					}
				}
				oInvoiceModel.refresh();
				this.fnBalanceCalculation();
			}
		},
		calculateInvoiceAmt: function (oEvt) {
			var index = oEvt.getSource().getBindingContext("oInvoiceModel").getPath().split("/").pop();
			if (this.getNumberDataTypeValidation(oEvt.getParameter("value")) || oEvt.oSource.mBindingInfos.value.binding.sPath == "disPer" ||
				oEvt.oSource.mBindingInfos.value.binding.sPath == "disAmt" ||
				oEvt.oSource.mBindingInfos.value.binding.sPath == "deposit") {
				oEvt.getSource().setValueState("None");
				var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
					modelData = oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems;
				// modelData[index].changed = true;
				modelData[index].invQty = parseFloat(modelData[index].invQty).toFixed(3);
				modelData[index].price = parseFloat(modelData[index].price).toFixed(3);
				if (modelData.length > 0) {
					for (var i = 0; i < modelData.length; i++) {
						modelData[i].netWorth = parseFloat(modelData[i].invQty) * parseFloat(modelData[i].price);
						modelData[i].netWorth = modelData[i].netWorth.toFixed(3);
						if (modelData[i].disPer || modelData[i].disAmt || modelData[i].deposit) {
							var discP = modelData[i].netWorth * (this.getNumberValue(modelData[i].disPer) / 100);
							var value = modelData[i].netWorth - discP - this.getNumberValue(modelData[i].disAmt) + this.getNumberValue(modelData[i].deposit);
							modelData[i].netWorth = value.toFixed(3);
						}
						if (modelData[i].isTwowayMatched) {
							modelData[i].amountDifference = modelData[i].netWorth - modelData[i].poNetPrice;
							modelData[i].amountDifference = modelData[i].amountDifference.toFixed(3);
						}
					}
				}
				oInvoiceModel.refresh();
				this.fnBalanceCalculation();
			} else {
				// if (oEvt.oSource.mBindingInfos.value.binding.sPath == "discountP" || oEvt.oSource.mBindingInfos.value.binding.sPath == "discount" ||
				// 	oEvt.oSource.mBindingInfos.value.binding.sPath == "deposit") {
				// 	oEvt.getSource().setValue("0.00");
				// } else {
				oEvt.getSource().setValueState("Error");
				oEvt.getSource().setValue("");
				// }
			}
		},
		fnBalanceCalculation: function () {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel"),
				modelData = oInvoiceModel.getData(),
				total = 0;
			for (var i = 0; i < modelData.oInvoiceHeaderDetails.invoiceItems.length; i++) {
				if (modelData.oInvoiceHeaderDetails.invoiceItems[i].isSelected == true && modelData.oInvoiceHeaderDetails.invoiceItems[i].isTwowayMatched ==
					true && modelData.oInvoiceHeaderDetails.invoiceItems[i].isDeleted != true) {
					// && modelData[i].deleted == false
					total = parseFloat(total) + parseFloat(modelData.oInvoiceHeaderDetails.invoiceItems[i].netWorth);
				}
			}
			oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceLineTotal = total.toFixed(3);
			oInvoiceModel.getData().oInvoiceHeaderDetails.subTotal = total.toFixed(3);
			if (modelData.nonPoDtoList && modelData.nonPoDtoList.length > 0) {
				modelData.totalGlAmount = !(modelData.totalGlAmount) ? 0 : modelData.totalGlAmount;
				modelData.oInvoiceHeaderDetails.grossAmount = parseFloat(modelData.oInvoiceHeaderDetails.invoiceLineTotal) + parseFloat(
					modelData.totalGlAmount);
				modelData.oInvoiceHeaderDetails.grossAmount = parseFloat(modelData.oInvoiceHeaderDetails.grossAmount).toFixed(3);
			} else {
				modelData.oInvoiceHeaderDetails.grossAmount = parseFloat(modelData.oInvoiceHeaderDetails.invoiceLineTotal) - this.getNumberValue(
					modelData.oInvoiceHeaderDetails.disAmt) + this.getNumberValue(modelData.oInvoiceHeaderDetails.deposit) + this.getNumberValue(modelData.oInvoiceHeaderDetails.taxAmount);
				modelData.oInvoiceHeaderDetails.grossAmount = parseFloat(modelData.oInvoiceHeaderDetails.grossAmount).toFixed(3);
			}
			modelData.oInvoiceHeaderDetails.balance = parseFloat(modelData.oInvoiceHeaderDetails.invoiceTotal) - parseFloat(modelData.oInvoiceHeaderDetails
				.grossAmount);
			modelData.oInvoiceHeaderDetails.balance = parseFloat(modelData.oInvoiceHeaderDetails.balance).toFixed(3);
			oInvoiceModel.refresh();
		},
		fnTaxCalculation: function () {
			var oInvoiceModel = this.getModel("oInvoiceModel"),
				taxModel = this.getModel("taxModel"),
				oInvoiceModelData = oInvoiceModel.getData().oInvoiceHeaderDetails.invoiceItems,
				taxValue = 0;
			for (var i = 0; i < oInvoiceModelData.length; i++) {
				if (oInvoiceModelData[i].isTwowayMatched) {
					var taxPValue = (parseFloat(oInvoiceModelData[i].taxPer) * (parseFloat(oInvoiceModelData[i].poNetPrice) / 100)).toFixed(3);
					taxValue = parseFloat(taxValue) + parseFloat(taxPValue);
					taxValue = taxValue.toFixed(3);
				}
			}
			var obj = {
				"debit": "Debit",
				"taxCode": "VN",
				"taxDescription": "",
				"amount": taxValue
			};
			taxModel.getData().netTaxValue = taxValue;
			taxModel.getData().taxItem = [];
			taxModel.getData().taxItem.push(obj);
			taxModel.refresh();
		},
		/******************************************************CALCULATIONS-END*****************************************************************************/
		openTaxDetails: function () {
			if (!this.taxDetails) {
				this.taxDetails = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.fragments.tax", this);
				this.getView().addDependent(this.taxDetails);
			}
			var taxModel = this.getModel("taxModel");
			this.taxDetails.setModel(taxModel, "taxModel");
			this.taxDetails.open();
		},
		taxDialogBtnPress: function () {
			this.taxDetails.close();
		},

		/******************************************************GL ACCOUNT-START*****************************************************************************/
		fnAddCodingInDeliverRow: function () {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var oInvoiceModelData = oInvoiceModel.getData();
			if (!oInvoiceModelData.nonPoDtoList) {
				oInvoiceModelData.nonPoDtoList = [];
			}
			var companyCode = "";
			if (oInvoiceModel.getProperty("/oInvoiceHeaderDetails/compCode")) {
				companyCode = oInvoiceModelData.oInvoiceHeaderDetails.companyCode;
			}
			oInvoiceModel.setProperty("/invoiceDetailUIDto/userUpdated", "accpay_reviewer"); //hardcoded for now
			var uName = oInvoiceModel.getProperty("/invoiceDetailUIDto/userUpdated");
			oInvoiceModelData.nonPoDtoList.push({
				"userCreated": uName,
				"userUpdated": uName,
				"companyCode": companyCode,
				requestId: oInvoiceModel.getProperty("/requestUIDto/id"),
				"amount": 0,
				"materialDescription": "",
				"debitCreditInd": "S"
			});
			oInvoiceModel.refresh();
		},
		deletePlannedChargesData: function (oEvent) {
			var index = oEvent.getSource().getParent().getBindingContextPath().split("/").pop();
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var modeldata = oInvoiceModel.getData();
			modeldata.nonPoDtoList.splice(index, 1);
			oInvoiceModel.refresh();
			// this.fnBalanceCalculation();
			var delFlag = true;
			this.hdrChargesAmtCalculation("", delFlag);
		},
		glAccountSuggest: function (oEvent) {
			var sQuery = oEvent.getSource().getValue(),
				companyCode = this.getView().getModel("oInvoiceModel").getData().oInvoiceHeaderDetails.compCode;
			var url = "DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/GLAccountSet?$filter=CompanyCode eq'" + companyCode +
				"'and GLAccounts eq'*" + sQuery + "*'";
			var oHeader = {
				"Content-Type": "application/json; charset=utf-8"
			};
			var glAccountModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(glAccountModel, "glAccountModel");
			glAccountModel.loadData(url, null, true, "Get", false, false, oHeader);
			glAccountModel.attachRequestCompleted(function () {
				glAccountModel.refresh();
			});
		},
		glDescription: function (oEvt) {
			var value = oEvt.mParameters.selectedItem.mProperties.additionalText;
			var index = oEvt.mParameters.id.split("-").pop();
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			oInvoiceModel.getData().nonPoDtoList[index].materialDescription = value;
			oInvoiceModel.refresh();
		},
		costCenterSuggest: function (oEvent) {
			var sQuery = oEvent.getSource().getValue(),
				companyCode = this.getView().getModel("oInvoiceModel").getData().oInvoiceHeaderDetails.compCode;
			var url = "DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/CostCenterSet?$filter=CompCode eq'" + companyCode +
				"'and CostCenters eq '*" + sQuery + "*'";
			var oHeader = {
				"Content-Type": "application/json; charset=utf-8"
			};
			var costCenterModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(costCenterModel, "costCenterModel");
			costCenterModel.loadData(url, null, true, "Get", false, false, oHeader);
			costCenterModel.attachRequestCompleted(function () {
				costCenterModel.refresh();
			});
		},
		/******************************************************GL ACCOUNT-END*****************************************************************************/
		/*
		 * *************************************************************************************************
		 * ATTACHMENT SECTION :::: START 
		 * *************************************************************************************************
		 */
		onSearcAttach: function (oEvent) { // add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter("fileName", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var reqList = this.getView().byId("attachListItems");
			var binding = reqList.getBinding("items"); // update list binding
			binding.filter(aFilters, "Application");
		},

		fnUploadDoc: function (oEvent) {
			var attachmentModel = this.getView().getModel("attachmentModel");
			var attachData = oEvent.getSource().getBindingContext("attachmentModel").getObject();
			var apptype = "text/html";
			var byteCode = attachData.fileBase64;
			var u8_2 = new Uint8Array(atob(byteCode).split("").map(function (c) {
				return c.charCodeAt(0);
			}));
			var a = document.createElement("a");
			document.body.appendChild(a);
			a.style = "display: none";
			var blob = new Blob([u8_2], {
				type: apptype
			});
			var url = window.URL.createObjectURL(blob);
			a.href = url;
			a.download = attachData.fileName;
			a.click();
			window.URL.revokeObjectURL(url);
		},
		/*****************File Upload****************************************/
		handleTypeMisMatch: function (oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			jQuery.each(aFileTypes, function (key, value) {
				aFileTypes[key] = "*." + value;
			});
			// var sSupportedFileTypes = aFileTypes.join(", ");
			//     ("Error", "The file type *." + oEvent.getParameter("fileType") +
			// 	" is not supported. Choose one of the following types: " +
			// 	sSupportedFileTypes);
		},
		attachFileSizeExceed: function (oEvent) {
			var sName = oEvent.getParameter("fileName");
			var fSize = oEvent.getParameter("fileSize");
			var fileSizeinMb = Number((fSize).toFixed(2));
			var fLimit = oEvent.getSource().getProperty("maximumFileSize");
			var msg = "File: " + sName + " is of size " + fileSizeinMb + " MB which exceeds the file size limit of " + fLimit + " MB";
			// incture.accpay.util.utilFunction.errorMsg("Error", msg);
		},
		onBeforeUploadStarts: function (oEvent) {
			var that = this,
				fileType = oEvent.mParameters.files[0].type,
				fileName = oEvent.getParameter("newValue");
			var fileList = oEvent.oSource.oFileUpload.files[0];
			String.prototype.replaceAll = function (search, replacement) {
				var target = this;
				return target.replace(new RegExp(search, 'g'), replacement);
			};

			fileName = fileName.replaceAll(" ", "_");
			fileName = fileName.replaceAll("#", "_");
			var reader = new FileReader();
			reader.onload = function (event) {
				var attachmentModel = that.getView().getModel("attachmentModel");
				var oInvoiceModel = that.getView().getModel("oInvoiceModel").getData();
				var s = event.target.result;
				var base64 = s.substr(s.lastIndexOf(','));
				base64 = base64.split(",")[1];
				var uploadParameters = {
					"requestId": oInvoiceModel.oInvoiceHeaderDetails.requestId,
					"fileName": fileName,
					"fileType": fileType,
					"fileBase64": base64,
					"createdBy": oInvoiceModel.oInvoiceHeaderDetails.emailFrom
				};
				if (!attachmentModel.getData().docManagerDto) { //|| (modelData.docManagerDto && !(modelData.docManagerDto instanceof Array))){
					attachmentModel.getData().docManagerDto = [];
				}
				attachmentModel.getData().docManagerDto.push(uploadParameters);
				attachmentModel.refresh();
			};
			if (fileList) {
				reader.readAsDataURL(fileList);
			}
		},
		fnDeleteAttachment: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("attachmentModel").getPath();
			var attachmentModel = this.getView().getModel("attachmentModel");
			var sId = attachmentModel.getProperty(sPath).attachmentId;
			var index = sPath.split("/").pop();
			attachmentModel.getData().docManagerDto.splice(index, 1);
			attachmentModel.refresh();
			if (sId) {
				var url = "InctureApDest/attachment/delete/" + sId;
				jQuery
					.ajax({
						url: url,
						type: "DELETE",
						headers: {
							"X-CSRF-Token": this.getCSRFToken()
						},
						dataType: "json",
						success: function (result) {}.bind(this)
					});
			}
		},

		/*
		 * *************************************************************************************************
		 * ATTACHMENT SECTION :::: END 
		 * *************************************************************************************************
		 */
		/*
		/*
				 * *************************************************************************************************
				 * COMMENT :::: START 
				 * *************************************************************************************************
				 */
		onPostComment: function (oEvent) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var sValue = oEvent.getParameter("value");
			var oInvoiceModelData = oInvoiceModel.getData().oInvoiceHeaderDetails;
			var dDate = new Date();
			var sDate = dDate.getTime();
			if (!oInvoiceModel.getData().comments) {
				oInvoiceModel.getData().comments = [];
			}
			var sId = oInvoiceModel.getProperty("/commentId");
			var cValue = oInvoiceModel.getProperty("/input");
			var aCommentSelected = oInvoiceModel.getData().comments;
			var aComItem = aCommentSelected.find(function (oRow, index) {
				return oRow.comment === cValue;
			});

			var aSelected = oInvoiceModel.getData().comments;
			var aSelectedItem = aSelected.find(function (oRow, index) {
				return oRow.commentId === sId;
			});
			if (aSelectedItem) {
				var lDate = new Date();
				var uDate = lDate.getTime();
				aSelectedItem.comment = cValue;
				aSelectedItem.updatedAt = uDate;
				aSelectedItem.updatedBy = aSelectedItem.createdBy;

			} else if (aComItem) {
				var cDate = new Date();
				var nCDate = cDate.getTime();
				aComItem.comment = cValue;
				aComItem.updatedAt = nCDate;
				aComItem.updatedBy = aComItem.createdBy;
			} else {
				var oComment = {
					"requestId": oInvoiceModelData.requestId,
					"comment": sValue,
					"createdBy": oInvoiceModelData.emailFrom,
					"createdAt": sDate,
					"updatedBy": null,
					"updatedAt": null,
					"user": oInvoiceModelData.emailFrom
				};
				var aEntries = oInvoiceModel.getData().comments;
				aEntries.unshift(oComment);
			}
			oInvoiceModel.setProperty("/commentId", "");
			this.getView().getModel("oInvoiceModel").refresh();
		},
		fnEditComment: function (oEvent) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var sPath = oEvent.getSource().getBindingContext("oInvoiceModel").getPath();
			var sId = oInvoiceModel.getProperty(sPath).commentId;
			var sValue = oInvoiceModel.getProperty(sPath).comment;
			oInvoiceModel.setProperty("/input", sValue);
			oInvoiceModel.setProperty("/commentId", sId);
			this.getView().getModel("oInvoiceModel").refresh();
		},
		// onPostComment: function (oEvent) {
		// 	var oDate = new Date();
		// 	var yyyy = oDate.getFullYear().toString();
		// 	var mm = (oDate.getMonth() + 1).toString(); // getMonth() is zero-based
		// 	var dd = oDate.getDate().toString();
		// 	var sDate = yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]) + "T13:51:12.717+05:30";
		// 	var oInvoiceModel = this.getView().getModel("oInvoiceModel");
		// 	var sValue = oEvent.getParameter("value");
		// 	sValue = sValue.trim();
		// 	var oEntry = {
		// 		"createdBy": oInvoiceModel.getData().oInvoiceHeaderDetails.emailFrom,
		// 		"user": oInvoiceModel.getData().oInvoiceHeaderDetails.emailFrom,
		// 		"comment": sValue,
		// 		"createdAt": new Date().getTime()
		// 	};
		// 	if (!oInvoiceModel.getData().comments) {
		// 		oInvoiceModel.getData().comments = [];
		// 	}
		// 	var aEntries = oInvoiceModel.getData().comments;
		// 	aEntries.unshift(oEntry);
		// 	this.getView().getModel("oInvoiceModel").refresh();
		// },
		onPostingDateChange: function (oEvent) {
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			oInvoiceModel.setProperty("/oInvoiceHeaderDetails/postingDate", oEvent.getSource()._getSelectedDate().getTime());
		},
		fnDeleteComment: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("oInvoiceModel").getPath();
			var oInvoiceModel = this.getView().getModel("oInvoiceModel");
			var sId = oInvoiceModel.getProperty(sPath).commentId;
			var index = sPath.split("/").pop();
			oInvoiceModel.getData().comments.splice(index, 1);
			oInvoiceModel.refresh();
			if (sId) {
				var url = "InctureApDest/comment/delete/" + sId;
				jQuery
					.ajax({
						url: url,
						type: "DELETE",
						headers: {
							"X-CSRF-Token": this.getCSRFToken()
						},
						dataType: "json",
						success: function (result) {}.bind(this)
					});
			}
		},
		/*
		 * *************************************************************************************************
		 * COMMENT :::: END 
		 * *************************************************************************************************
		 */
	});
});