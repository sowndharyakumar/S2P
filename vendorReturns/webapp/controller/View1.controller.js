sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/incture/vendorReturns/util/Formatter",
	"sap/m/MessageBox"
], function (Controller, Formatter, MessageBox) {
	"use strict";
	return Controller.extend("com.incture.vendorReturns.controller.View1", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			//var difDate = dDate.setDate(dDate.getDate() - 1);
		},
		_onRouteMatched: function (oEvent) {
			var value = oEvent.getParameters().arguments.value;
			var url = "SPUserDetails/v1/sayHello";
			var mloginModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mloginModel, "mloginModel");
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						mloginModel.setData(result);
					}
				});
			var obj = {
				"submitBtnVisiblitys": false,
				"previewBtnVisiblitys": false,
				"postCommentVisible": true,
				"maxDateFrom": new Date()
			};
			var baseModel = new sap.ui.model.json.JSONModel(obj);
			this.getView().setModel(baseModel, "baseModel");
			var dropdownModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(dropdownModel, "dropdownModel");
			var poSearchModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(poSearchModel, "poSearchModel");

			var object = {
				"maxDateTo": new Date()
			};
			var invoiceSearchModel = new sap.ui.model.json.JSONModel(object);
			this.getView().setModel(invoiceSearchModel, "invoiceSearchModel");
			var returnPOModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(returnPOModel, "returnPOModel");
			var returnModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(returnModel, "returnModel");
			var cDate = new Date();
			var sDate = cDate.getDate();
			var sMon = cDate.getMonth() + 1;
			var sYear = cDate.getFullYear();
			var sH = cDate.getHours();
			var sM = cDate.getMinutes();
			var sSec = cDate.getSeconds();
			var cTODate = sYear + "-" + sMon + "-" + sDate + "T" + sH + ":" + sM + ":" + sSec;
			var cTOsetDate = sYear + "-" + sMon + "-" + sDate;
			var setDate = cDate.setDate(cDate.getDate() - 90);
			var dAte = new Date(setDate);
			var dDate = dAte.getDate();
			var dMon = dAte.getMonth() + 1;
			var dYear = dAte.getFullYear();
			var dH = dAte.getHours();
			var dM = dAte.getMinutes();
			var dSec = dAte.getSeconds();
			var cFromDate = dYear + "-" + dMon + "-" + dDate + "T" + dH + ":" + dM + ":" + dSec;
			var cFromsetDate = dYear + "-" + dMon + "-" + dDate;
			this.getView().getModel("invoiceSearchModel").setProperty("/billingDateFrom", cFromsetDate);
			this.getView().getModel("invoiceSearchModel").setProperty("/billingDateTo", cTOsetDate);
			this._wizard = this.byId("ID_WIZARD_RETURN");
			this._wizard.discardProgress(this.byId("ID_Step_rtn"));
			this.getView().byId("segBtnId").setSelectedKey("");
			this.getView().byId("segBtnId").setSelectedButton("None");
			this._oNavContainer = this.byId("ID_RETURN_NAVCON");
			this._oWizardContentPage = this.byId("ID_RETURN_PAGE");
			var myCurrentDate = new Date();
			myCurrentDate = myCurrentDate.toISOString().split("T")[0];
			var myPastDate = new Date(myCurrentDate);
			myPastDate.setDate(myPastDate.getDate() - 90);
			myPastDate = myPastDate.toISOString().split("T")[0];
			this.getOwnerComponent().getModel("invoiceItemModel").setProperty("/invoiceDateFrom", myPastDate);
			this.getOwnerComponent().getModel("invoiceItemModel").setProperty("/invoiceDateTo", myCurrentDate);
			var that = this;
			if (value) {
				var oDraftModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oDraftModel, "oDraftModel");
				jQuery
					.ajax({
						url: "VendorReturns/returnsRequest?requestId=" + value,
						type: "GET",
						dataType: "json",
						success: function (result) {
							oDraftModel.setData(result);
							var roType = result.returnsHeader.returnType;
							if (roType === "GR") {
								that.getView().byId("segBtnId").setSelectedKey("gr");
								baseModel.setProperty("/grBased", true);
								baseModel.setProperty("/poBased", false);
								that.byId("ID_Step_rtn").setNextStep(that.byId("ID_WIZARD_GR_SRCH"));
								that._wizard.nextStep();
							} else {
								that.getView().byId("segBtnId").setSelectedKey("po");
								baseModel.setProperty("/poBased", true);
								baseModel.setProperty("/grBased", false);
								that.byId("ID_Step_rtn").setNextStep(that.byId("ID_WIZARD_INV_SRCH"));
								that._wizard.nextStep();
								that._wizard.nextStep();
							}
							baseModel.setProperty("/editable", false);
							that.getReasonData();
							that.setGrData(result);
							that._wizard.nextStep();
						}
					});
			}
		},
		setGrData: function (results) {
			var array = [];
			var baseModel = this.getView().getModel("baseModel");
			for (var i = 0; i < results.returnsItems.length; i++) {
				var obj = {
					CompanyCode: results.returnsHeader.companyCode,
					CompanyName: "",
					InvoiceDate: "",
					MaterialInput: "",
					PlantInput: "",
					PurchasingGroup: results.returnsHeader.purchaseGroup,
					PurchasingOrg: results.returnsHeader.purchaseOrg,
					StorageLocationInput: "",
					buyerUid: results.returnsHeader.buyerUid,
					uuid: results.returnsHeader.uuid,
					Vendor: results.returnsHeader.vendor,
					createdAt: results.returnsHeader.createdAt,
					createdBy: results.returnsHeader.createdBy,
					vendorName: results.returnsHeader.vendorName,
					returnRequestId: results.returnsHeader.returnRequestId,
					BaseUom: results.returnsItems[i].BaseUom,
					Batch: results.returnsItems[i].Batch,
					ExpiryDate: results.returnsItems[i].ExpiryDate,
					InvoiceItemNumber: results.returnsItems[i].invoiceItem,
					InvoiceNumber: results.returnsItems[i].invoiceNumber,
					InvoiceQty: results.returnsItems[i].quantity,
					InvoiceQtyBase: results.returnsItems[i].InvoiceQtyBase,
					InvoiceUom: results.returnsItems[i].uom,
					InvoiceUomBase: results.returnsItems[i].InvoiceUomBase,
					Material: results.returnsItems[i].material,
					MaterialDescription: results.returnsItems[i].MaterialDescription,
					aSelectedReason: results.returnsItems[i].reasonforId,
					reasonText: results.returnsItems[i].reasonText,
					NetPrice: results.returnsItems[i].netPrice,
					Plant: results.returnsItems[i].plant,
					PoCreationDate: results.returnsHeader.poCreationDate,
					PoItem: results.returnsItems[i].poItem,
					PoNumber: results.returnsItems[i].poNumber,
					PurchaseUom: results.returnsItems[i].PurchaseUom,
					StorageLocation: results.returnsItems[i].storageLocation,
					UnitPrice: results.returnsItems[i].unitPrice,
					Iuuid: results.returnsItems[i].uuid,
					GrNumber: results.returnsItems[i].grNumber,
					GrItem: results.returnsItems[i].grItem,
					GrQty: results.returnsItems[i].quantity,
					AvlUom: results.returnsItems[i].uom,
					ActQty: results.returnsItems[i].entryQnt,
					ActUom: results.returnsItems[i].entryUom
				};
				array.push(obj);
			}
			this.getView().getModel("returnPOModel").setProperty("/returnAmountTotal", results.returnsHeader.totalAmount);
			this.getView().getModel("returnModel").setProperty("/returnAmountTotal", results.returnsHeader.totalAmount);
			this.getView().getModel("returnPOModel").setProperty("/aReturn", array);
			this.getView().getModel("returnModel").setProperty("/aReturn", array);
			if (results.returnsHeader.status == "DRAFT") {
				baseModel.setProperty("/submitBtnVisiblitys", true);
				baseModel.setProperty("/previewBtnVisiblitys", true);
			} else{
				baseModel.setProperty("/display", false);
			}
		},

		onAfterRenderings: function () {
			// var mloginModel = new sap.ui.model.json.JSONModel();
			// this.getView().setModel(mloginModel, "mloginModel");
			// $.ajax({
			// 	url: "../user"
			// }).done(function (data, status, jqxhr) {
			// 	mloginModel.setProperty("/user", data);
			// });
			// mloginModel.refresh();
		},
		netPriceCalculation: function (oEvent) {
			var returnPOModel = this.getView().getModel("returnPOModel");
			var data = oEvent.getSource().getBindingContext("returnPOModel");
			var netAmount = parseFloat(returnPOModel.getProperty(data.sPath).InvoiceQty) * parseFloat(
				returnPOModel.getProperty(data.sPath).UnitPrice);
			netAmount = netAmount.toFixed(3);
			returnPOModel.setProperty(data.sPath + "/NetPrice", netAmount);
		},
		onClickROType: function (oEvent) {
			if (this._wizard.getProgress() > 1) {
				this._wizard.discardProgress(this.byId("ID_Step_rtn"));
			}
			var baseModel = this.getView().getModel("baseModel");
			baseModel.setProperty("/grBased", false);
			baseModel.setProperty("/poBased", false);
			if (this.getView().getModel("tableModel"))
				this.getView().getModel("tableModel").setProperty("/array", []);
			var invoiceSearchModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(invoiceSearchModel, "invoiceSearchModel");

			var myCurrentDate = new Date();
			myCurrentDate = myCurrentDate.toISOString().split("T")[0];
			var myPastDate = new Date(myCurrentDate);
			myPastDate.setDate(myPastDate.getDate() - 90);
			myPastDate = myPastDate.toISOString().split("T")[0];

			if (this.getView().getModel("invoiceItemModel")) {
				this.getView().getModel("invoiceItemModel").setProperty("/array", []);
				this.getView().getModel("invoiceItemModel").getData().invoiceNo = "";
				this.getView().getModel("invoiceItemModel").getData().companyCode = "";
				this.getView().getModel("invoiceItemModel").getData().vendorId = "";
				this.getOwnerComponent().getModel("invoiceItemModel").setProperty("/invoiceDateFrom", myPastDate);
				this.getOwnerComponent().getModel("invoiceItemModel").setProperty("/invoiceDateTo", myCurrentDate);
				this.getView().getModel("invoiceItemModel").refresh();
			}
			this.getView().getModel("invoiceSearchModel").setProperty("/billingDateFrom", myPastDate);
			this.getView().getModel("invoiceSearchModel").setProperty("/billingDateTo", myCurrentDate);
			if (oEvent.getSource().getKey() === "gr") {
				baseModel.setProperty("/grBased", true);
				this.byId("ID_Step_rtn").setNextStep(this.byId("ID_WIZARD_GR_SRCH"));
			} else {
				baseModel.setProperty("/poBased", true);
				this.byId("ID_Step_rtn").setNextStep(this.byId("ID_WIZARD_INV_SRCH"));
			}
			this._wizard.nextStep();
		},
		onPressNextInv: function () {
			var poSearchModelData = this.getView().getModel("poSearchModel").getData();
			if (poSearchModelData.companyCode && poSearchModelData.purchaseOrg && poSearchModelData.purchaseGroup && poSearchModelData.vendorId &&
				poSearchModelData.poType) {
				this._wizard.nextStep();
				this.getView().getModel("invoiceItemModel").setProperty("/companyCode", poSearchModelData.companyCode);
				this.getView().getModel("invoiceItemModel").setProperty("/vendorId", poSearchModelData.vendorId);
			} else
				sap.m.MessageToast.show("Please Enter all values to proceed");
		},
		onLoadPOType: function () {
			var dropdownModel = this.getView().getModel("dropdownModel");
			jQuery
				.ajax({
					url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/PurchasingDocumentTypeSet?$format=json",
					type: "GET",
					dataType: "json",
					success: function (result) {
						dropdownModel.setProperty("/poType", result.d);
						dropdownModel.refresh();
					}
				});
		},
		valueHelpCC: function (oEvent) {
			var dropdownModel = this.getView().getModel("dropdownModel");
			jQuery
				.ajax({
					url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/CompanyCodeSet?$format=json",
					type: "GET",
					dataType: "json",
					success: function (result) {
						dropdownModel.setProperty("/cCode", result.d);
						dropdownModel.refresh();
					}
				});
		},
		valueHelpPG: function (oEvent) {
			var dropdownModel = this.getView().getModel("dropdownModel");
			jQuery
				.ajax({
					url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/PurchasingGroupSet?$format=json",
					type: "GET",
					dataType: "json",
					success: function (result) {
						dropdownModel.setProperty("/purchaseGroup", result.d);
						dropdownModel.refresh();
					}
				});
		},
		valueHelpPO: function (oEvent) {
			var dropdownModel = this.getView().getModel("dropdownModel");
			jQuery
				.ajax({
					url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/PurchasingOrgSet?$format=json",
					type: "GET",
					dataType: "json",
					success: function (result) {
						dropdownModel.setProperty("/purchaseOrg", result.d);
						dropdownModel.refresh();
					}
				});
		},
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
		getLoggedInuserDetails: function () {
			var mloginModel = this.getView().getModel("mloginModel");
			var user = mloginModel.getProperty("/user");
			$.ajax({
				url: "/VendorReturns/user/" + user,
				method: "GET",
				async: true,
				success: function (result, xhr, data) {

					var loginOBj = JSON.parse(result);
					mloginModel.setProperty("/loginDetails", loginOBj);
					var aData = mloginModel.getProperty("/loginDetails/emails/0/value");
					mloginModel.setProperty("/email", aData);
				}
			});
			mloginModel.refresh();
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
		getReasonData: function () {
			var mReasonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mReasonModel, "mReasonModel");
			$.ajax({
				url: "VendorReturns/reasons/getAll/EN",
				method: "GET",
				async: true,
				success: function (result, xhr, data) {
					mReasonModel.setProperty("/aReasons", result);
				}
			});
			mReasonModel.refresh();
		},

		valueHelpPlant: function (oEvent) {
			var plantModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(plantModel, "plantModel");
			var that = this;
			if (!that.plantFrag) {
				that.plantFrag = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.plant", that);
				that.getView().addDependent(that.plantFrag);
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/PlantSet?$format=json",
						type: "GET",
						dataType: "json",
						success: function (result) {
							plantModel.setData(result.d);
							plantModel.refresh();
							that.plantFrag.setModel(plantModel, "plantModel");
							that.plantFrag.open();
						}
					});
			} else {
				that.plantFrag.open();
			}
		},
		valueHelpReturnActUom: function (oEvent) {
			var mRuomModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mRuomModel, "mRuomModel");
			var that = this;
			var returnModel = that.getView().getModel("returnModel");
			var Path = oEvent.getSource().getBindingContext("returnModel").getPath();
			returnModel.setProperty("/Path", Path);
			var materialNo = returnModel.getProperty(Path + "/Material");
			if (!that.ACTreturnUOM) {
				that.ACTreturnUOM = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.ACTreturnUOM", that);
				that.getView().addDependent(that.ACTreturnUOM);
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/UomSet?$filter=material eq '" + materialNo + "'",
						type: "GET",
						dataType: "json",
						success: function (result) {
							mRuomModel.setData(result.d);
							mRuomModel.refresh();
							that.ACTreturnUOM.setModel(mRuomModel, "mRuomModel");
							that.ACTreturnUOM.open();
						}
					});
			} else {
				that.ACTreturnUOM.open();
			}
		},
		valueHelpActUom: function (oEvent) {
			var mUomModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mUomModel, "mUomModel");
			var that = this;
			var tableModel = that.getView().getModel("tableModel");
			var sPath = oEvent.getSource().getBindingContext("tableModel").getPath();
			tableModel.setProperty("/Path", sPath);
			var material = tableModel.getProperty(sPath + "/Material");
			if (!that.ActUOM) {
				that.ActUOM = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.ActUOM", that);
				that.getView().addDependent(that.ActUOM);
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/UomSet?$filter=material eq '" + material + "'",
						type: "GET",
						dataType: "json",
						success: function (result) {
							mUomModel.setData(result.d);
							mUomModel.refresh();
							that.ActUOM.setModel(mUomModel, "mUomModel");
							that.ActUOM.open();
						}
					});
			} else {
				that.ActUOM.open();
			}
		},
		valueHelpSLOC: function (oEvent) {
			var plant = this.getView().getModel("invoiceSearchModel").getData().plant;
			if (plant) {
				var SLOCModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(SLOCModel, "SLOCModel");
				var that = this;
				if (!that.SlocFrag) {
					that.SlocFrag = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.sloc", that);
					that.getView().addDependent(that.plantFrag);
					jQuery
						.ajax({
							url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/StorageLocationSet?$filter=plant eq '" + plant + "'&$format=json",
							type: "GET",
							dataType: "json",
							success: function (result) {
								SLOCModel.setData(result.d);
								SLOCModel.refresh();
								that.SlocFrag.setModel(SLOCModel, "SLOCModel");
								that.SlocFrag.open();
							}
						});
				} else {
					that.SlocFrag.open();
				}
			} else {
				sap.m.MessageToast.show("Please Select Plant to Proceed");
			}
		},
		handleAddUOM: function (oEvent) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject();
			var tableModel = this.getView().getModel("tableModel");
			var sPath = tableModel.getProperty("/Path");
			tableModel.setProperty(sPath + "/ActUom", selectedObj.unit);
			tableModel.setProperty(sPath + "/denominator", selectedObj.denominator);
			tableModel.setProperty(sPath + "/numerator", selectedObj.numerator);
			var Selecteditem = tableModel.getProperty(sPath);
			var sqty = Number(Selecteditem.ActQty) * Number(Selecteditem.denominator) / Number(Selecteditem.numerator);
			var sPrice = Number(Selecteditem.NetPrice) / sqty;
			var Nprice = (Number(Selecteditem.ActQty) * sPrice).toFixed(2);
			tableModel.setProperty(sPath + "/NetPrice", Nprice);
			tableModel.refresh();
			oEvent.getSource().getBinding("items").filter([]);
		},
		handleAddReturnUOM: function (oEvent) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject();
			var returnModel = this.getView().getModel("returnModel");
			var sPath = returnModel.getProperty("/Path");
			returnModel.setProperty(sPath + "/ActUom", selectedObj.unit);
			returnModel.setProperty(sPath + "/denominator", selectedObj.denominator);
			returnModel.setProperty(sPath + "/numerator", selectedObj.numerator);
			var Selecteditem = returnModel.getProperty(sPath);
			var sqty = Number(Selecteditem.ActQty) * Number(Selecteditem.denominator) / Number(Selecteditem.numerator);
			var actNetprice = (Number(Selecteditem.ActQty) * Number(Selecteditem.UnitPrice)).toFixed(2);
			var sPrice = Number(actNetprice) / sqty;
			var Nprice = (Number(Selecteditem.ActQty) * sPrice).toFixed(2);
			returnModel.setProperty(sPath + "/NetPrice", Nprice);
			var leng = returnModel.getData().aReturn.length;
			var tAmount = 0;
			for (var t = 0; t < leng; t++) {
				tAmount += Number(returnModel.getData().aReturn[t].NetPrice);
			}
			var totalNprice = (tAmount).toFixed(2);
			returnModel.setProperty("/returnAmountTotal", totalNprice);
			returnModel.refresh();
			oEvent.getSource().getBinding("items").filter([]);
		},
		handleAddSloc: function (oEvent) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject();
			var invoiceSearchModel = this.getView().getModel("invoiceSearchModel");
			invoiceSearchModel.getData().storageLocation = selectedObj.storageLocation;
			invoiceSearchModel.getData().storageLocationDesc = selectedObj.storageLocationDesc;
			invoiceSearchModel.refresh();
			oEvent.getSource().getBinding("items").filter([]);
		},
		handleAddplant: function (oEvent) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject();
			var invoiceSearchModel = this.getView().getModel("invoiceSearchModel");
			invoiceSearchModel.getData().plant = selectedObj.plant;
			invoiceSearchModel.getData().plantDesc = selectedObj.name;
			invoiceSearchModel.refresh();
			oEvent.getSource().getBinding("items").filter([]);
		},
		onResetSearchInvoice: function () {
			var baseModel = this.getView().getModel("baseModel");
			baseModel.getProperty("/grBased");
			if (baseModel.getProperty("/grBased")) {
				var invoiceSearchModel = this.getView().getModel("invoiceSearchModel");
				invoiceSearchModel.setProperty("/materialNo", "");
				invoiceSearchModel.setProperty("/storageLocation", "");
				invoiceSearchModel.setProperty("/grNumber", "");
				invoiceSearchModel.setProperty("/grNumber", "");
				invoiceSearchModel.setProperty("/plant", "");
				invoiceSearchModel.setProperty("/plantDesc", "");
				invoiceSearchModel.setProperty("/billingDateFrom", "");
				invoiceSearchModel.setProperty("/billingDateTo", "");
			} else {
				var invoiceSearchModel = this.getView().getModel("poSearchModel");
				invoiceSearchModel.setProperty("/poType", "");
				invoiceSearchModel.setProperty("/vendorId", "");
				invoiceSearchModel.setProperty("/companyCode", "");
				invoiceSearchModel.setProperty("/purchaseOrg", "");
				invoiceSearchModel.setProperty("/purchaseGroup", "");
			}
		},
		onChangeGRActqty: function (oEvent) {

			//var oValue = oEvent.getSource().getProperty("value");
			var tableModel = this.getView().getModel("tableModel");
			var sPath = oEvent.getSource().getBindingContext("tableModel").getPath();
			var rQtyValue = tableModel.getProperty(sPath + "/ActQty");
			var oRQtyValue = tableModel.getProperty(sPath + "/AvlQty");
			var fValue = (parseFloat(rQtyValue)).toFixed(3);
			tableModel.setProperty(sPath + "/ActQty", fValue);
			if (rQtyValue === "" || (Number(rQtyValue) === 0) || (rQtyValue > Number(oRQtyValue))) {
				tableModel.setProperty(sPath + "/ActQtyvalueState", "Error");
				sap.m.MessageBox.error("Please Enter Valid Return Quantity!");
			} else {
				tableModel.setProperty(sPath + "/ActQtyvalueState", "None");
				var Selecteditem = tableModel.getProperty(sPath);
				tableModel.setProperty(sPath + "/ActQty", fValue);
				var actNetprice = (Number(Selecteditem.ActQty) * Number(Selecteditem.UnitPrice)).toFixed(2);
				if (Selecteditem.denominator && Selecteditem.numerator) {
					var sqty = Number(Selecteditem.ActQty) * Number(Selecteditem.denominator) / Number(Selecteditem.numerator);
					var sPrice = Number(actNetprice) / sqty;
					var Nprice = (Number(Selecteditem.ActQty) * sPrice).toFixed(2);
					tableModel.setProperty(sPath + "/NetPrice", Nprice);
					tableModel.refresh();
				} else {
					tableModel.setProperty(sPath + "/ActQtyvalueState", "None");
					var Netprice = (Number(Selecteditem.ActQty) * Number(Selecteditem.UnitPrice)).toFixed(2);
					tableModel.setProperty(sPath + "/NetPrice", Netprice);
					tableModel.refresh();

				}
			}
		},
		onChangeActualqty: function (oEvent) {
			var returnModel = this.getView().getModel("returnModel");
			var sPath = oEvent.getSource().getBindingContext("returnModel").getPath();
			var rQtystateValue = returnModel.getProperty(sPath + "/ActQty");
			if (rQtystateValue === "") {
				returnModel.setProperty(sPath + "/ActQtyvalueState", "Error");
				sap.m.MessageBox.error("Please Enter Return Quantity!");
			} else {
				returnModel.setProperty(sPath + "/ActQtyvalueState", "None");
				var fValue = (parseFloat(rQtystateValue)).toFixed(3);
				var Selecteditem = returnModel.getProperty(sPath);
				returnModel.setProperty(sPath + "/ActQty", fValue);
				var actNetprice = (Number(Selecteditem.ActQty) * Number(Selecteditem.UnitPrice)).toFixed(2);
				if (Selecteditem.denominator && Selecteditem.numerator) {
					var arQ = Number(fValue) / Number(Selecteditem.denominator);
					if (Number(Selecteditem.AvlQty) >= Number(arQ)) {
						var sqty = Number(Selecteditem.ActQty) * Number(Selecteditem.denominator) / Number(Selecteditem.numerator);
						var sPrice = Number(actNetprice) / sqty;
						var Nprice = (Number(Selecteditem.ActQty) * sPrice).toFixed(2);
						returnModel.setProperty(sPath + "/NetPrice", Nprice);
						var len = returnModel.getData().aReturn.length;
						var totalAmount = 0;
						for (var k = 0; k < len; k++) {
							totalAmount += Number(returnModel.getData().aReturn[k].NetPrice);
						}
						var totalNetprice = (totalAmount).toFixed(2);
						returnModel.setProperty("/returnAmountTotal", totalNetprice);
						returnModel.refresh();
					} else {
						sap.m.MessageBox.error("Entered Returned Qty can't be greater than Available Return Qty");
					}
				} else {
					if (Number(Selecteditem.AvlQty) >= Number(fValue)) {
						var Netprice = (Number(Selecteditem.ActQty) * Number(Selecteditem.UnitPrice)).toFixed(2);
						returnModel.setProperty(sPath + "/NetPrice", Netprice);
						var leng = returnModel.getData().aReturn.length;
						var tAmount = 0;
						for (var l = 0; l < leng; l++) {
							tAmount += Number(returnModel.getData().aReturn[l].NetPrice);
						}
						var totalNprice = (tAmount).toFixed(2);
						returnModel.setProperty("/returnAmountTotal", totalNprice);
						returnModel.refresh();
					} else {
						sap.m.MessageBox.error("Entered Returned Qty can't be greater than Available Return Qty");
					}
				}
			}
		},
		onInvoiceSearchoData: function (oEvent) {
			var oDataModel = this.getView().getModel("ZRTV_RETURN_DELIVERY_SRV");
			var invoiceItemModel = this.getOwnerComponent().getModel("invoiceItemModel"),
				invoiceItemModelData = invoiceItemModel.getData(),
				filters = [];
			this.openBusyDialog();
			var that = this;
			if (invoiceItemModelData.invoiceNo)
				filters.push(new sap.ui.model.Filter("InvoiceNumber", sap.ui.model.FilterOperator.EQ, invoiceItemModelData.invoiceNo));
			filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, invoiceItemModelData.vendorId));
			filters.push(new sap.ui.model.Filter("CompanyCode", sap.ui.model.FilterOperator.EQ, invoiceItemModelData.companyCode));
			filters.push(new sap.ui.model.Filter("InvoiceDate", sap.ui.model.FilterOperator.GE, invoiceItemModelData.invoiceDateFrom));
			filters.push(new sap.ui.model.Filter("InvoiceDate", sap.ui.model.FilterOperator.LE, invoiceItemModelData.invoiceDateTo));
			// var oFilter = new sap.ui.model.Filter({
			// 	filters: [
			// 		new sap.ui.model.Filter("InvoiceNumber", sap.ui.model.FilterOperator.EQ, invoiceItemModelData.invoiceNo)
			// 	]
			// });
			// filters.push(oFilter);
			oDataModel.read("/InvoiceHeaderSet", {
				urlParameters: {
					"$expand": "HTI"
				},
				async: false,
				filters: filters,
				success: function (oData, oResponse) {
					invoiceItemModel.setProperty("/array", that.createObj(oData));
					that.closeBusyDialog();
					invoiceItemModel.refresh();
				},
				error: function () {
					that.closeBusyDialog();
				}
			});

			// if (invNo) {
			// "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/InvoiceHeaderSet?$filter=InvoiceNumber eq '" + invNo +
			// "' &$expand=HTI"
			// jQuery
			// 	.ajax({
			// 		url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/InvoiceHeaderSet",
			// 		urlParameters: {
			// 			"$expand": "HTI"
			// 		},
			// 		async: false,
			// 		filters: filters,
			// 		type: "GET",
			// 		dataType: "json",
			// 		success: function (result) {
			// 			var aData = result.d.results[0].HTI.results;
			// 			invoiceItemModel.setProperty("/array", aData);
			// 			invoiceItemModel.refresh();
			// 		}
			// 	});
		},
		createObj: function (data) {
			var array = [];
			for (var i = 0; i < data.results.length; i++) {
				for (var j = 0; j < data.results[i].HTI.results.length; j++) {
					var obj = {
						CompanyCode: data.results[i].CompanyCode,
						CompanyName: data.results[i].CompanyName,
						InvoiceDate: data.results[i].InvoiceDate,
						MaterialInput: data.results[i].MaterialInput,
						PlantInput: data.results[i].PlantInput,
						PoCreationDate: data.results[i].PoCreationDate,
						PurchasingGroup: data.results[i].PurchasingGroup,
						PurchasingOrg: data.results[i].PurchasingOrg,
						StorageLocationInput: data.results[i].StorageLocationInput,
						Vendor: data.results[i].Vendor,
						VendorName: data.results[i].VendorName,
						PoCurrency:data.results[i].PoCurrency,
						BaseUom: data.results[i].HTI.results[j].BaseUom,
						Batch: data.results[i].HTI.results[j].Batch,
						ExpiryDate: data.results[i].HTI.results[j].ExpiryDate,
						InvoiceItemNumber: data.results[i].HTI.results[j].InvoiceItemNumber,
						InvoiceNumber: data.results[i].HTI.results[j].InvoiceNumber,
						InvoiceQty: data.results[i].HTI.results[j].InvoiceQty,
						InvoiceQtyBase: data.results[i].HTI.results[j].InvoiceQtyBase,
						InvoiceUom: data.results[i].HTI.results[j].InvoiceUom,
						InvoiceUomBase: data.results[i].HTI.results[j].InvoiceUomBase,
						Material: data.results[i].HTI.results[j].Material,
						MaterialDescription: data.results[i].HTI.results[j].MaterialDescription,
						NetPrice: data.results[i].HTI.results[j].NetPrice,
						Plant: data.results[i].HTI.results[j].Plant,
						PoItem: data.results[i].HTI.results[j].PoItem,
						PoNumber: data.results[i].HTI.results[j].PoNumber,
						PurchaseUom: data.results[i].HTI.results[j].PurchaseUom,
						StorageLocation: data.results[i].HTI.results[j].StorageLocation,
						UnitPrice: data.results[i].HTI.results[j].UnitPrice
					};
					array.push(obj);
				}
			}
			return array;
		},
		onInvoiceSearch: function (oEvent) {
			var invoiceItemModel = this.getOwnerComponent().getModel("invoiceItemModel");
			var invNo = invoiceItemModel.getProperty("/invoiceNo");
			if (invNo) {
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/InvoiceHeaderSet?$filter=InvoiceNumber eq '" + invNo +
							"' &$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							var aData = result.d.results[0].HTI.results;
							invoiceItemModel.setProperty("/array", aData);
							invoiceItemModel.refresh();
						}
					});
			}
		},
		onSearch: function (oEvent) {
			var invoiceSearchModel = this.getView().getModel("invoiceSearchModel");
			var tableModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(tableModel, "tableModel");
			var grNumber = invoiceSearchModel.getData().grNumber;
			// 5000001054
			var material = invoiceSearchModel.getData().materialNo;
			var plant = invoiceSearchModel.getData().plant;
			var storageLocation = invoiceSearchModel.getData().storageLocation;
			var grPostingDateForm = invoiceSearchModel.getData().billingDateFrom;
			if (grPostingDateForm) {
				grPostingDateForm = grPostingDateForm + "T00:00:00";
			}
			var grPostingDateTo = invoiceSearchModel.getData().billingDateTo;
			if (grPostingDateTo) {
				grPostingDateTo = grPostingDateTo + "T00:00:00";
			}
			var bPlant = false;
			var bPostingdate = false;
			var bMaterial = false;
			var bGRnum = false;
			var bStoLoc = false;
			if (grPostingDateTo && grPostingDateForm) {
				bPostingdate = true;
			} else {

				bPostingdate = false;
			}
			if (material) {
				bMaterial = true;
			}
			if (grNumber) {
				bGRnum = true;
			}
			if (plant) {
				bPlant = true;
			}
			if (storageLocation) {
				bStoLoc = true;
			}

			if (!bMaterial && !bGRnum && !bPlant && !bStoLoc && bPostingdate) {
				this.openBusyDialog();
				var that = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrPostingDate ge datetime'" + grPostingDateForm +
							"' and GrPostingDate le datetime'" + grPostingDateTo + "' &$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							that.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			}
			// 5000001054
			else if (bGRnum) {
				this.openBusyDialog();
				var t = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrNumber eq '" + grNumber + "'&$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							t.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (bGRnum && bPostingdate) {
				this.openBusyDialog();
				/*	this.getView().getModel("invoiceSearchModel").setProperty("/billingDateFrom", "");
					this.getView().getModel("invoiceSearchModel").setProperty("/billingDateTo", "");*/
				var tg = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrPostingDate ge datetime'" + grPostingDateForm +
							"' and GrPostingDate le datetime'" + grPostingDateTo + "' and GrNumber eq '" + grNumber +
							"'&$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tg.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});

			} else if (bMaterial && bPostingdate) {
				this.openBusyDialog();
				var tM = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrPostingDate ge datetime'" + grPostingDateForm +
							"' and GrPostingDate le datetime'" + grPostingDateTo + "' and MaterialInput eq '" + material + "'&$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tM.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});

			} else if (bPlant && bPostingdate) {
				this.openBusyDialog();
				var tN = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrPostingDate ge datetime'" + grPostingDateForm +
							"' and GrPostingDate le datetime'" + grPostingDateTo + "' and PlantInput eq '" + plant + "'&$expand=HTI&$format=json",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tN.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (bPlant && bStoLoc && bPostingdate) {
				this.openBusyDialog();
				var tO = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrPostingDate ge datetime'" + grPostingDateForm +
							"' and GrPostingDate le datetime'" + grPostingDateTo + "' and PlantInput eq '" + plant + "'  and StorageLocationInput eq '" +
							storageLocation + "'&$expand=HTI&$format=json",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tO.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (bMaterial && bPlant && bStoLoc && bPostingdate) {
				this.openBusyDialog();
				var tP = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrPostingDate ge datetime'" + grPostingDateForm +
							"' and GrPostingDate le datetime'" + grPostingDateTo + "' and PlantInput eq '" + plant + "'  and StorageLocationInput eq '" +
							storageLocation + "' and MaterialInput eq '" + material + "' &$expand=HTI&$format=json",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tP.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (bMaterial && bPlant && bPostingdate) {
				this.openBusyDialog();
				var tQ = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=GrPostingDate ge datetime'" + grPostingDateForm +
							"' and GrPostingDate le datetime'" + grPostingDateTo + "' and PlantInput eq '" + plant + "' and MaterialInput eq '" + material +
							"' &$expand=HTI&$format=json",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tQ.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (plant && material) {
				this.openBusyDialog();
				var tR = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=MaterialInput eq '" + material +
							"' and PlantInput eq '" + plant + "'&$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tR.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (storageLocation && plant && material) {
				this.openBusyDialog();
				var tS = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=MaterialInput eq '" + material +
							"' and PlantInput eq '" + plant + "' and StorageLocationInput eq '" + storageLocation + "'&$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tS.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (bMaterial) {
				this.openBusyDialog();
				var tW = this;
				jQuery
					.ajax({
						url: "DEC_NEW/sap/opu/odata/sap/ZRTV_RETURN_DELIVERY_SRV/GRHeaderSet?$filter=MaterialInput eq '" + material + "'&$expand=HTI",
						type: "GET",
						dataType: "json",
						success: function (result) {
							tW.closeBusyDialog();
							tableModel.getData().array = [];
							for (var i = 0; i < result.d.results.length; i++) {
								for (var j = 0; j < result.d.results[i].HTI.results.length; j++) {
									var pDate = result.d.results[i].PoCreationDate;
									var sDate = Number(pDate.slice(6, 19));
									var poDate = new Date(sDate);
									var pcDate = poDate.toISOString();
									var POcreationDate = pcDate.split("T")[0];
									tableModel.getData().array.push({
										CompanyCode: result.d.results[i].CompanyCode,
										GrDocumentYear: result.d.results[i].GrDocumentYear,
										GrNumber: result.d.results[i].GrNumber,
										GrPostingDate: result.d.results[i].GrPostingDate,
										MaterialInput: result.d.results[i].MaterialInput,
										PlantInput: result.d.results[i].PlantInput,
										PoCreationDate: POcreationDate,
										PurchasingGroup: result.d.results[i].PurchasingGroup,
										PurchasingOrg: result.d.results[i].PurchasingOrg,
										StorageLocationInput: result.d.results[i].StorageLocationInput,
										Vendor: result.d.results[i].Vendor,
										AvlQty: result.d.results[i].HTI.results[j].AvlQty,
										AvlUom: result.d.results[i].HTI.results[j].AvlUom,
										ActQty: result.d.results[i].HTI.results[j].AvlQty,
										ActUom: result.d.results[i].HTI.results[j].AvlUom,
										AvlQtyBase: result.d.results[i].HTI.results[j].AvlQtyBase,
										AvlUomBase: result.d.results[i].HTI.results[j].AvlUomBase,
										Batch: result.d.results[i].HTI.results[j].Batch,
										GrItem: result.d.results[i].HTI.results[j].GrItem,
										GrQty: result.d.results[i].HTI.results[j].GrQty,
										GrUom: result.d.results[i].HTI.results[j].GrUom,
										Material: result.d.results[i].HTI.results[j].Material,
										NetPrice: result.d.results[i].HTI.results[j].NetPrice,
										Plant: result.d.results[i].HTI.results[j].Plant,
										PoItem: result.d.results[i].HTI.results[j].PoItem,
										PoNumber: result.d.results[i].HTI.results[j].PoNumber,
										StorageLocation: result.d.results[i].HTI.results[j].StorageLocation,
										UnitPrice: result.d.results[i].HTI.results[j].UnitPrice
									});
								}
							}
							tableModel.refresh();
						}
					});
			} else if (!bPostingdate) {
				sap.m.MessageBox.information("Please Enter GR POSTING DATE FROM AND GR POSTING DATE TO!");
			} else {
				sap.m.MessageBox.information("Please Enter Search fields!");
			}
		},
		onPressReturnNext: function () {
			var currentiIndex = this.getView().byId("poTableId").getSelectedContextPaths();
			var returnPOModel = this.getView().getModel("returnPOModel");
			var aSelectedData = this.getView().getModel("invoiceItemModel").getData().array;
			var aSelectedItems = [];
			if (currentiIndex.length !== 0) {
				for (var i = 0; i < currentiIndex.length; i++) {
					var index = currentiIndex[i].split("/")[2];
					var aData = aSelectedData[index];
					aSelectedItems.push(aData);
				}
				if (!returnPOModel.getData().aReturn) {
					returnPOModel.getData().aReturn = [];
				}
				if (returnPOModel.getData().aReturn.length > 0) {
					var aReturnData = returnPOModel.getData().aReturn.concat(aSelectedItems);
					returnPOModel.setProperty("/aReturn", aReturnData);
				} else {
					returnPOModel.setProperty("/aReturn", aSelectedItems);
				}
				var totalAmount = 0;
				var len = returnPOModel.getData().aReturn.length;
				for (var k = 0; k < len; k++) {
					totalAmount += Number(returnPOModel.getData().aReturn[k].NetPrice);
				}
				var totalNetprice = (totalAmount).toFixed(2);
				returnPOModel.setProperty("/returnAmountTotal", totalNetprice);
				returnPOModel.refresh();
				this.getView().getModel("invoiceItemModel").setProperty("/array", []);
				var baseModel = this.getView().getModel("baseModel");
				baseModel.setProperty("/previewBtnVisiblitys", true);
				this.getReasonData();
				this._wizard.nextStep();
			} else {
				sap.m.MessageBox.error("Please select any item!");
			}
		},
		onPressReturn: function () {
			var currentiIndex = this.getView().byId("InvoiceTableId").getSelectedContextPaths();
			var tableModel = this.getView().getModel("tableModel");
			var returnModel = this.getView().getModel("returnModel");
			var aSelectedData = tableModel.getData().array;
			var aSelectedItems = [];
			if (currentiIndex.length !== 0) {
				for (var i = 0; i < currentiIndex.length; i++) {
					var index = currentiIndex[i].split("/")[2];
					var aData = aSelectedData[index];
					aSelectedItems.push(aData);
				}
				if (!returnModel.getData().aReturn) {
					returnModel.getData().aReturn = [];
				}
				if (returnModel.getData().aReturn.length > 0) {
					var aReturnData = returnModel.getData().aReturn.concat(aSelectedItems);
					returnModel.setProperty("/aReturn", aReturnData);
				} else {
					returnModel.setProperty("/aReturn", aSelectedItems);
				}
				var len = returnModel.getData().aReturn.length;
				var totalAmount = 0;
				var bflag = true;
				for (var k = 0; k < len; k++) {
					totalAmount += Number(returnModel.getData().aReturn[k].NetPrice);
					var bValidate = false;
					if (returnModel.getData().aReturn[k].ActQty === "" || (Number(returnModel.getData().aReturn[k].ActQty) === 0)) {
						bValidate = true;
					}
					if ((Number(returnModel.getData().aReturn[k].AvlQty) < Number(returnModel.getData().aReturn[k].ActQty)) && (returnModel.getData()
							.aReturn[k].AvlUom === returnModel.getData().aReturn[k].ActUom)) {
						bValidate = true;
					}
					if (bValidate) {
						bflag = false;
						continue;
					}
				}
				if (!bflag) {
					var sMsg = "Please Enter Valid Actual Return Quantity!";
					sap.m.MessageBox.alert(sMsg);
					return;
				} else {
					var totalNetprice = (totalAmount).toFixed(2);
					returnModel.setProperty("/returnAmountTotal", totalNetprice);
					returnModel.refresh();
					this.getView().byId("InvoiceTableId").removeSelections(true);
					this.getReasonData();
					if (this._wizard.getProgressStep() === this.getView().byId("ID_WIZARD_GR_SRCH")) {
						this._wizard.nextStep();
						this.onResetSearchInvoice();
						tableModel.setProperty("/array", []);
						var baseModel = this.getView().getModel("baseModel");
						baseModel.setProperty("/previewBtnVisiblitys", true);
					}
				}
			} else {
				this.onResetSearchInvoice();
				tableModel.setProperty("/array", []);
				sap.m.MessageBox.error("Please select any item!");
			}

		},

		onPressRemarks: function () {
			var that = this;
			if (!that.Remark) {
				that.Remark = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.Remark", that);
				that.getView().addDependent(that.Remark);
				that.Remark.addStyleClass("sapUiSizeCompact");
			}
			that.Remark.open();
		},
		onPressResetRemark: function () {
			var baseModel = this.getView().getModel("baseModel");
			baseModel.setProperty("/remark", "");
			baseModel.setProperty("/contactPerson", "");
			baseModel.setProperty("/comment", "");
		},
		onOKRemark: function () {
			this.Remark.close();
		},
		onCancelRemark: function () {
			this.onPressResetRemark();
			this.Remark.close();
		},
		onpressPreview: function () {
			if (this.getView().getModel("baseModel").getProperty("/grBased")) {
				var returnModel = this.getView().getModel("returnModel");
				var currentiIndex = this.getView().byId("ReturnTableId").getSelectedContextPaths();
				var returnModeldata = returnModel.getData().aReturn;
				var aSelectedItems = [];
				if (currentiIndex.length !== 0) {
					for (var i = 0; i < currentiIndex.length; i++) {
						var index = currentiIndex[i].split("/")[2];
						var aData = returnModeldata[index];
						aSelectedItems.push(aData);
					}
					returnModel.setProperty("/aSelectedReturn", aSelectedItems);
					var length = aSelectedItems.length;
					var bflag = true;
					var tAmount = 0;
					for (var j = 0; j < length; j++) {
						tAmount += Number(returnModel.getData().aSelectedReturn[j].NetPrice);
						var sReason = aSelectedItems[j].aSelectedReason;
						var bValidate = false;
						if (sReason === undefined) {
							bValidate = true;
						}

						var sQty = aSelectedItems[j].ActQty;
						if (sQty === "" || sQty === undefined) {
							bValidate = true;
						}
						if (bValidate) {
							bflag = false;
							continue;
						}
					}
					var totalNprice = (tAmount).toFixed(2);
					returnModel.setProperty("/returnAmountPreviewTotal", totalNprice);
					if (!bflag) {
						var sMsg = "Please Enter Return Reason & Return Quantity !";
						sap.m.MessageBox.alert(sMsg);
						return;
					} else {
						var baseModel = this.getView().getModel("baseModel");
						baseModel.setProperty("/submitBtnVisiblitys", true);
						baseModel.setProperty("/previewBtnVisiblitys", true);
						this.getView().byId("ReturnTableId").removeSelections(true);
						if (this._wizard.getProgressStep() === this.getView().byId("ID_WIZARD_RTEX")) {
							this._wizard.nextStep();
						}
					}
				} else {
					sap.m.MessageBox.alert("No Items Selected. Please Select an Item");
				}
			} else {
				var baseModel = this.getView().getModel("baseModel");
				baseModel.setProperty("/submitBtnVisiblitys", true);
				baseModel.setProperty("/previewBtnVisiblitys", true);
				// this.getView().byId("ReturnTableId").removeSelections(true);
				this._wizard.nextStep();
			}
		},
		onChangeReason: function (oEvent) {
			var oValue = oEvent.getSource().getProperty("value");
			if (this.getView().getModel("baseModel").getProperty("/grBased")) {
				var returnModel = this.getView().getModel("returnModel");
				var sPath = oEvent.getSource().getBindingContext("returnModel").getPath();
				returnModel.setProperty(sPath + "/reasonText", oValue);
			} else {
				var returnModel = this.getView().getModel("returnPOModel");
				var sPath = oEvent.getSource().getBindingContext("returnPOModel").getPath();
				returnModel.setProperty(sPath + "/reasonText", oValue);
			}
		},
		onPressAttachment: function (oEvent) {
			this.attachemntMode = "Add";
			if (oEvent.getSource().getTooltip() === "Cannot add Files") {
				this.attachmentName = "Preview";
			} else {
				this.attachmentName = "Return";
			}
			var that = this;
			if (!that.attachment) {
				that.attachment = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.attachment", this);
				that.getView().addDependent(that.attachment);
				that.attachment.addStyleClass("sapUiSizeCompact");
			}
			this.getView().getModel("baseModel").setProperty("/attachmentVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/attachmentDelEnable", true);
			that.attachment.open();

		},

		onViewAttachment: function (oEvent) {
			this.attachemntMode = "View";
			if (oEvent.getSource().getTooltip() === "Cannot add Files") {
				this.attachmentName = "Preview";
			} else {
				this.attachmentName = "Return";
			}
			var that = this;
			if (!that.attachment) {
				that.attachment = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.attachment", this);
				that.getView().addDependent(that.attachment);
				that.attachment.addStyleClass("sapUiSizeCompact");
			}
			this.getView().getModel("baseModel").setProperty("/attachmentVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/attachmentDelEnable", false);
			that.attachment.open();
		},
		onViewComment: function (oEvent) {
			var that = this;
			if (!that.Comment) {
				that.Comment = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.Comment", that);
				that.getView().addDependent(that.Comment);
				that.Comment.addStyleClass("sapUiSizeCompact");
			}
			this.getView().getModel("baseModel").setProperty("/postCommentVisible", false);
			that.Comment.open();
		},
		onOkComment: function () {
			this.Comment.close();
		},
		okAttachment: function () {
			if (this.docVersion === "SUCCESS") {
				this.attachment.close();
			} else {
				if (this.getView().getModel("returnModel").getData().attachmentObject === undefined || this.getView().getModel("returnModel").getData()
					.attachmentObject.length === 0) {
					MessageBox.information(this.resourceBundle.getText("Addatleastonfile"));
					// MessageBox.information("Add at least on file");
				} else {
					this.getView().getModel("baseModel").setProperty("/attachmentValue", "");
					this.attachment.close();
				}
			}
		},

		cancelAttachment: function () {
			if (this.docVersion === "SUCCESS") {
				this.attachment.close();
				return;
			} else if (this.docVersion === "DRAFT") {
				if (this.attachemntMode === "View") {
					this.attachment.close();
				} else {
					if (this.getView().getModel("returnModel").getData().attachmentObject.length === 0) {
						this.getView().getModel("returnModel").setProperty("/enableViewAttachment", false);
					}
					this.attachment.close();
				}
			} else {
				if (this.attachemntMode == "View") {
					this.attachment.close();
				} else {
					// this.getView().getModel("returnModel").getData().attachmentObject = [];
					this.getView().getModel("returnModel").refresh(true);
					this.getView().getModel("baseModel").setProperty("/attachmentValue", "");
					this.attachment.close();
				}
			}
		},
		onFileUploadChange: function (oEvent) {
			var returnModel = this.getView().getModel("returnModel");
			var fileName = oEvent.getParameter("newValue"),
				fileList = oEvent.getSource().oFileUpload.files[0],
				fileType = fileList.type,
				that = this;
			String.prototype.replaceAll = function (search, replacement) {
				var target = this;
				return target.replace(new RegExp(search, "g"), replacement);
			};
			fileName = fileName.replaceAll(" ", "_");
			fileName = fileName.replaceAll("#", "_");
			var reader = new FileReader();
			reader.onload = function (event) {
				var s = event.target.result;
				var base64 = s.substr(s.lastIndexOf(","));
				base64 = base64.split(",")[1];
				var docDetails = {
					"fileName": fileName,
					"fileType": fileType,
					"fileBase64": base64,
					"createdBy": "",
					"updatedBy": ""
				};
				if (!returnModel.getData().attachmentObject) {
					returnModel.getData().attachmentObject = [];
				}
				returnModel.getData().attachmentObject.push(docDetails);
				returnModel.refresh();
			};
			if (fileList) {
				reader.readAsDataURL(fileList);
			}
		},
		onRemoveAttachmennt: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("returnModel").getPath();
			var returnModel = this.getView().getModel("returnModel");
			var index = sPath.split("/").pop();
			returnModel.getData().attachmentObject.splice(index, 1);
			returnModel.refresh();
		},
		onPostComment: function (oEvent) {
			var returnModel = this.getView().getModel("returnModel");
			var mloginModel = this.getView().getModel("mloginModel");
			var user = mloginModel.getProperty("/email");
			var sValue = oEvent.getParameter("value");
			var dDate = new Date();
			var sDate = dDate.getTime();
			if (!returnModel.getData().returnsCommentsList) {
				returnModel.getData().returnsCommentsList = [];
			}
			var oComment = {
				"comment": sValue,
				"createdBy": user,
				"createdAt": sDate,
				"updatedBy": null,
				"updatedAt": null,
				"user": user
			};
			var aEntries = returnModel.getData().returnsCommentsList;
			aEntries.unshift(oComment);
			returnModel.setProperty("/inputComment", "");
			this.getView().getModel("returnModel").refresh();
		},
		fnDeleteComment: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("returnModel").getPath();
			var returnModel = this.getView().getModel("returnModel");
			var index = sPath.split("/").pop();
			returnModel.getData().returnsCommentsList.splice(index, 1);
			returnModel.refresh();
		},
		returnDeleteRow: function (oEvent) {
			var currentiIndex = this.getView().byId("ReturnTableId").getSelectedContextPaths();
			var returnModel = this.getView().getModel("returnModel");
			returnModel.setProperty("/doUndoPath", currentiIndex);
			if (currentiIndex.length !== 0) {
				for (var i = 0; i < currentiIndex.length; i++) {
					var index = currentiIndex[i].split("/")[2];
					returnModel.getData().aReturn.splice(index, 1);
				}
				returnModel.refresh();
				var leng = returnModel.getData().aReturn.length;
				var tAmount = 0;
				for (var t = 0; t < leng; t++) {
					tAmount += Number(returnModel.getData().aReturn[t].NetPrice);
				}
				var totalNprice = (tAmount).toFixed(2);
				returnModel.setProperty("/returnAmountTotal", totalNprice);
			} else {
				sap.m.MessageBox.alert("No Items Selected. Please Select an Item");
			}
		},
		returnUndoDelete: function (oEvent) {

			var returnModel = this.getView().getModel("returnModel");
			var sPath = returnModel.getData().doUndoPath;
			if (sPath.length !== 0) {
				for (var i = 0; i < sPath.length; i++) {
					var index = sPath[i].split("/")[2];
					var aData = returnModel.getData().aReturn[index];
					returnModel.getData().aReturn.push(aData);
				}
			}
			//returnModel.setProperty("/aSelectedReturn", aRdata);
			returnModel.refresh();
		},
		onPressSubmit: function (oEvent) {
			var status = oEvent.getSource().getText() == "Submit" ? "IN PROGRESS" : "DRAFT";
			var qty, uom;
			if (this.getView().getModel("baseModel").getProperty("/grBased")) {
				var returnModel = this.getView().getModel("returnModel");
				var aSelected = returnModel.getData().aSelectedReturn;
			} else {
				var returnModel = this.getView().getModel("returnPOModel");
				var aSelected = returnModel.getData().aReturn;
			}
			var len = aSelected.length;
			var aSelectedItems = [];
			for (var i = 0; i < len; i++) {
				qty = this.getView().getModel("baseModel").getProperty("/grBased") == true ? aSelected[i].GrQty : aSelected[i].InvoiceQty;
				uom = this.getView().getModel("baseModel").getProperty("/grBased") == true ? aSelected[i].AvlUom : aSelected[i].InvoiceUom;
				var returnObj = {
					"poNumber": aSelected[i].PoNumber,
					"poItem": aSelected[i].PoItem,
					"storageLocation": aSelected[i].StorageLocation,
					"plant": aSelected[i].Plant,
					"quantity": qty,
					"uom": uom,
					"reasonforId": aSelected[i].aSelectedReason,
					"reasonText": "",
					"grNumber": aSelected[i].GrNumber,
					"grItem": aSelected[i].GrItem,
					"grYear": "",
					"poCreationDate": "",
					"grCreationDate": "",
					"unitPrice": aSelected[i].UnitPrice,
					"netPrice": aSelected[i].NetPrice,
					"deliveredAt": "",
					"receivedAt": "",
					"status": "",
					"invoiceNumber": aSelected[i].InvoiceNumber,
					"invoiceItem": aSelected[i].InvoiceItemNumber,
					"material": aSelected[i].Material,
					"entryQnt": aSelected[i].ActQty,
					"entryUom": aSelected[i].ActUom,
					"uuid": aSelected[i].Iuuid
				};
				aSelectedItems.push(returnObj);
			}
			var aAttachment = returnModel.getData().attachmentObject;
			var aComment = returnModel.getData().returnsCommentsList;
			var returnType = this.getView().getModel("baseModel").getProperty("/grBased") === true ? "GR" : "PO";
			var aItem = aSelected.find(function (oRow) {
				return oRow;
			});
			var obj = {
				"returnsHeader": {
					"poCurrency":aItem.PoCurrency,
					"poNumber": aItem.PoNumber,
					"purchaseGroup": aItem.PurchasingGroup,
					"purchaseOrg": aItem.PurchasingOrg,
					"createdAt": new Date().toISOString().split("T")[0],
					"companyCode": aItem.CompanyCode,
					"vendorName": aItem.VendorName,
					"createdBy": this.getView().getModel("mloginModel").getData().email,
					"buyerUid": this.getView().getModel("mloginModel").getData().email,
					"vendorUid": "",
					"lastAction": "",
					"status": status,
					"vendor": aItem.Vendor,
					"materialDocument": "",
					"materialDocumentYear": "",
					"totalAmount": returnModel.getData().returnAmountTotal,
					"grDocumentNumber": aItem.GrNumber,
					"returnType": returnType,
					"returnRequestId": aItem.returnRequestId,
					"uuid": aItem.uuid
				},
				"returnsItems": [],
				"returnsCommentsList": [],
				"returnsAttachmentList": []
			};
			if (aSelectedItems) {
				obj.returnsItems = aSelectedItems;
			}
			if (aAttachment) {
				obj.returnsAttachmentList = aAttachment;
			}
			if (aComment) {
				obj.returnsCommentsList = aComment;
			}
			var that = this;
			that.openBusyDialog();
			var url = "VendorReturns/returnsRequest/create";
			jQuery.ajax({
				type: "POST",
				contentType: "application/json",
				url: url,
				dataType: "json",
				data: JSON.stringify(obj),
				async: true,
				success: function (data, textStatus, jqXHR) {
					var aData = [];
					returnModel.setData(aData);
					that.closeBusyDialog();
					var msg = data.message;
					sap.m.MessageBox.success(msg, {
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === MessageBox.Action.OK) {
								var baseModel = that.getView().getModel("baseModel");
								baseModel.setProperty("/submitBtnVisiblitys", false);
								baseModel.setProperty("/previewBtnVisiblitys", false);
								that.oRouter.navTo("returnInbox");
							}
						}
					});
				},
				error: function (err) {
					that.closeBusyDialog();
					sap.m.MessageToast.show(err.statusText);
				}
			});
		},
		backToWizardContent: function () {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},
		_handleNavigationToStep: function (iStepNumber) {
			var fnAfterNavigate = function () {
				this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
				this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}.bind(this);
			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this.backToWizardContent();
		},
		_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this._handleNavigationToStep(0);
						this.getView().byId("segBtnId").setSelectedKey("");
						this.getView().byId("segBtnId").setSelectedButton("None");
						this._wizard.discardProgress(this._wizard.getSteps()[0]);
					}
				}.bind(this)
			});
		},
		handleWizardCancel: function () {
			if (this._wizard.getProgress() > 1) {
				this._handleMessageBoxOpen("Are you sure you want to cancel the progress?", "warning");
			}
		}
	});
});