sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter) {
	"use strict";

	return Controller.extend("ui.incture.APInvoiceTask.controller.Second", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ui.incture.APInvoiceTask.view.Second
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Second").attachPatternMatched(this._onObjectMatched, this);
			var oPODetailModel = new sap.ui.model.odata.ODataModel("DEC_NEW/sap/opu/odata/sap/Z_ODATA_SERV_OPEN_PO_SRV");
			this.getView().setModel(oPODetailModel, "oPODetailModel");
			this.exchangeRequestModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.exchangeRequestModel, "exchangeRequestModel");

		},
		onSearchItemid: function (oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var afilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter("Item", sap.ui.model.FilterOperator.Contains, sQuery)
					],
					false);
				aFilters.push(afilter);
			}
			var oBinding = this.byId("ID_TBL_PI_INVOICE_SECON").getBinding("items");
			oBinding.filter(aFilters, false);

		},

		_onObjectMatched: function (oEvent) {
			var that = this;
			var data = this.getView().getModel("selectedObject").getData();
			var poHeaderSet = new sap.ui.model.json.JSONModel({
				"results": data
			});
			this.getView().setModel(poHeaderSet, "poHeaderSet");
			var oPODetailModel = this.getView().getModel("oPODetailModel");
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			oPODetailModel.read("/L_EKKOSet('" + data.Purch_Ord + "')/HeadToItem", {
				async: false,
				success: function (oData, oResponse) {
					busyDialog.close();
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].taxCode = "V1";
						oData.results[i].taxPer = "10";
						oData.results[i].taxAmount = (parseFloat(oData.results[i].Net_Value) * (parseFloat(oData.results[i].taxPer) / 100)).toFixed(3);
					}
					var poItemSet = new sap.ui.model.json.JSONModel({
						"results": oData.results
					});
					that.getView().setModel(poItemSet, "poItemSet");
				},
				error: function (error) {
					busyDialog.close();
					var errorMsg = JSON.parse(error.responseText);
					errorMsg = errorMsg.error.message.value;
					that.errorMsg(errorMsg);
				}

			});
		},

		onPressAttachments: function () {
			if (!this.attachments) {
				sap.ui.getCore().byId("attachmentsUpdatePOFragId");
				this.attachments = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.Fragments.attachments", this);
				this.getView().addDependent(this.attachments);
			}
			this.attachments.open();
		},

		onBeforeUploadStarts: function (oEvent) {
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
				var abc = {
					documentDetailDtoList: {
						"documentTitle": fileName,
						"documentType": fileType,
						"documentDataB64": base64
					}
				};
				var pdfModel = new JSONModel();
				that.getView().setModel(pdfModel, "pdfModel");
				pdfModel.setData(abc);
				// that._addPdfContentArea(abc.documentDetailDtoList);
				if (!that.getView().getModel("exchangeRequestModel").getData().documents) {
					that.getView().getModel("exchangeRequestModel").getData().documents = [];
				}
				that.getView().getModel("exchangeRequestModel").getData().documents.push(abc.documentDetailDtoList);
				that.getView().getModel("exchangeRequestModel").refresh();
			};
			if (fileList) {
				reader.readAsDataURL(fileList);
			}
		},

		okExchangeRequest: function () {
			this.attachments.close();
		},
		onCancelAttchments: function () {
			var exchangeRequestModel = this.getView().getModel("exchangeRequestModel");
			var aData = [];
			exchangeRequestModel.setData(aData);
			this.attachments.close();
		},
		closeSaveFragmentShow: function () {
			this.attachments.close();
		},

		onPressNavFromSecondToFirst: function () {
			var poHeaderSet = this.getView().getModel("poHeaderSet");
			if (poHeaderSet) {
				poHeaderSet.setProperty("/results/invNo", "");
				poHeaderSet.setProperty("/results/PODate", "");
			}
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Process", true);
		},

		onPressNextProcessSaveDraft: function () {
			var that = this;
			if (!that.commentAndRejection) {
				that.commentAndRejection = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.Fragments.SendAsn", this);
				that.getView().addDependent(that.commentAndRejection);
			}
			var obj = {
				Comments: true,
				Reject: false,
				Heading: "Comment"
			};
			var oModel = new sap.ui.model.json.JSONModel(obj);
			that.commentAndRejection.setModel(oModel, "FragmentSet");
			that.commentAndRejection.open();

		},

		HandleSendAsdOK: function () {
			this.commentAndRejection.close();
		},
		HandleSendAsdCancel: function () {
			this.commentAndRejection.close();
		},

		onSelectionChange: function (oEvent) {
			var currentiIndex = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			var POData = this.getView().getModel("poItemSet").getData().results;
			var index;
			var lineItemTotalAmount = 0;
			var lineItemTaxAmount = 0;
			if (currentiIndex.length !== 0) {
				for (var i = 0; i < currentiIndex.length; i++) {
					index = currentiIndex[i].split("/")[2];
					lineItemTotalAmount = lineItemTotalAmount + parseFloat(POData[index].Net_Value, 10);
					lineItemTaxAmount = lineItemTaxAmount + parseFloat(POData[index].taxAmount, 10);
					this.getView().getModel("poHeaderSet").getData().results.taxAmount = lineItemTaxAmount;
					this.getView().getModel("poHeaderSet").getData().results.totalAmount = lineItemTotalAmount;
					this.getView().getModel("poHeaderSet").refresh();
				}
			} else {

				this.getView().getModel("poHeaderSet").getData().results.taxAmount = lineItemTaxAmount;
				this.getView().getModel("poHeaderSet").getData().results.totalAmount = lineItemTotalAmount;
				this.getView().getModel("poHeaderSet").refresh();
			}
		},

		onQtyChange: function (oEvent) {
			var currentIndex = oEvent.getSource().getBindingContext("poItemSet").sPath.split("/")[2];
			var newValue = "";
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (!(/^([0-9]{1,12})(?:\.\d{0,3})?$/.test(newValue))) {
					newValue = newValue.slice(0, -1);
				}
			}
			var fValue = (parseFloat(newValue)).toFixed(3);
			oEvent.getSource().setValue(fValue);
			oEvent.getSource().setTooltip(fValue);
			var oModel = oEvent.getSource().getModel("poItemSet");
			var oItem = oEvent.getSource().getBindingContext("poItemSet").getObject();
			var selectedContexted = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			oItem.Net_Value = parseFloat(parseFloat(oItem.Net_Price, 10) * parseFloat(oItem.Quantity, 10), 10);
			oItem.taxAmount = (parseFloat(oItem.Net_Value) * (parseFloat(oItem.taxPer) / 100)).toFixed(2);
			oModel.refresh(true);
			for (var j = 0; j < selectedContexted.length; j++) {
				if (currentIndex === selectedContexted[j].split("/")[2]) {
					this.totalLineItemAmountCal();
					this.totalLineItemTaxCal();
				}
			}
		},

		onChangeTaxPer: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oModel = oEvent.getSource().getModel("poItemSet");
			var oItem = oEvent.getSource().getBindingContext("poItemSet").getObject();
			oItem.taxPer = sValue;
			oItem.taxAmount = (parseFloat(oItem.Net_Value) * (parseFloat(oItem.taxPer) / 100)).toFixed(3);
			oModel.refresh(true);
		},

		onUnitPriceChange: function (oEvent) {
			var currentIndex = oEvent.getSource().getBindingContext("poItemSet").sPath.split("/")[2];
			var newValue = "";
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (!(/^([0-9]{1,12})(?:\.\d{0,3})?$/.test(newValue))) {
					newValue = newValue.slice(0, -1);
				}
			}
			var fValue = (parseFloat(newValue)).toFixed(3);
			oEvent.getSource().setValue(fValue);
			oEvent.getSource().setTooltip(fValue);
			var oModel = oEvent.getSource().getModel("poItemSet");
			var oItem = oEvent.getSource().getBindingContext("poItemSet").getObject();
			oItem.Net_Value = (parseFloat(parseFloat(oItem.Net_Price, 10) * parseFloat(oItem.Quantity, 10), 10)).toFixed(3);
			oItem.taxAmount = (parseFloat(oItem.Net_Value) * (parseFloat(oItem.taxPer) / 100)).toFixed(2);
			oModel.refresh(true);
			var selectedContexted = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			for (var j = 0; j < selectedContexted.length; j++) {
				if (currentIndex === selectedContexted[j].split("/")[2]) {
					this.totalLineItemAmountCal();
					this.totalLineItemTaxCal();
				}
			}
		},

		totalLineItemAmountCal: function () {
			var currentiIndex = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			var POData = this.getView().getModel("poItemSet").getData().results;
			var index;
			var lineItemTotalAmount = 0;
			for (var i = 0; i < currentiIndex.length; i++) {
				index = currentiIndex[i].split("/")[2];
				lineItemTotalAmount = lineItemTotalAmount + parseFloat(POData[index].Net_Value, 10);
				this.getView().getModel("poHeaderSet").getData().results.totalAmount = lineItemTotalAmount;
				this.getView().getModel("poHeaderSet").refresh();
			}
		},

		totalLineItemTaxCal: function () {
			var currentiIndex = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			var POData = this.getView().getModel("poItemSet").getData().results;
			var index;
			var lineItemTaxAmount = 0;
			for (var i = 0; i < currentiIndex.length; i++) {
				index = currentiIndex[i].split("/")[2];
				lineItemTaxAmount = lineItemTaxAmount + parseFloat(POData[index].Net_Value, 10);
				this.getView().getModel("poHeaderSet").getData().results.taxAmount = lineItemTaxAmount;
				this.getView().getModel("poHeaderSet").refresh();
			}
		},

		getCSRFToken: function () {
			var url = "InctureApDest/invoiceHeader/getAll";
			var token = null;
			$.ajax({
				url: url,
				type: "GET",
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				complete: function (xhr) {
					token = xhr.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},

		onPressNextProcessSubmitDraft: function () {
			debugger;
			var ItemData = this.getView().getModel("poItemSet").getData().results;
			var exchangeRequestModel = this.getView().getModel("exchangeRequestModel");
			var aDoc = [];
			aDoc = exchangeRequestModel.getData().documents;
			var selectedContext = this.getView().byId("ID_TBL_PI_INVOICE_SECON").getSelectedContextPaths();
			if (selectedContext.length === 0) {
				sap.m.MessageBox.error("Select at least one item!");
			} else {
				var poItemData = [];
				for (var j = 0; j < selectedContext.length; j++) {
					poItemData.push(ItemData[selectedContext[j].split("/")[2]]);
				}
				var poHeaderData = this.getView().getModel("poHeaderSet").getData().results;
				var cDate = new Date();
				var postingDate = Date.now(cDate);
				var month = "" + (cDate.getMonth() + 1);
				var day = "" + cDate.getDate();
				var year = cDate.getFullYear();
				if (month.length < 2) {
					month = "0" + month;
				}
				if (day.length < 2) {
					day = "0" + day;
				}
				var sDate = [year, month, day].join("-");
				var obj = {
					"vendorName": poHeaderData.VendorName,
					"ocrBatchId": null,
					"headerText": null,
					"extInvNum": poHeaderData.invNo,
					"invoiceDate": poHeaderData.PODate,
					"dueDate": null,
					"createdAt": sDate,
					"vendorId": poHeaderData.Vendor,
					"clerkId": null,
					"compCode": poHeaderData.Company_Code,
					"refDocNum": Number(poHeaderData.Purch_Ord),
					"clerkEmail": null,
					"channelType": "Email",
					"refDocCat": "PO",
					"invoiceType": poHeaderData.memoType,
					"grossAmount": null,
					"discount": null,
					"invoiceTotal": parseFloat(poHeaderData.totalAmount).toFixed(3),
					"sapInvoiceNumber": 0,
					"fiscalYear": null,
					"currency": "EUR",
					"paymentTerms": null,
					"taxAmount": null,
					"shippingCost": 0,
					"lifecycleStatus": "01",
					"taskStatus": null,
					"version": null,
					"emailFrom": null,
					"balance": null,
					"reasonForRejection": null,
					"exceptionMessage": null,
					"rejectionText": null,
					"createdByInDb": "saikat.bhowmick@incture.com",
					"createdAtInDB": null,
					"updatedBy": null,
					"updatedAt": null,
					"accountNumber": null,
					"postingDate": postingDate,
					"invoiceItems": [],
					"attachments": []
				};
				var attachments = {};
				if (aDoc) {
					for (var l = 0; l < aDoc.length; l++) {
						attachments = {
							"createdBy": "saikat.bhowmick@incture.com",
							"updatedBy": "saikat.bhowmick@incture.com",
							"fileName": aDoc[l].documentTitle,
							"fileType": aDoc[l].documentType,
							"fileBase64": aDoc[l].documentDataB64
						};
						obj.attachments.push(attachments);
					}
				}
				var invoiceItems = {};
				for (var i = 0; i < poItemData.length; i++) {
					invoiceItems = {
						"itemId": poItemData[i].Item,
						"itemCode": poItemData[i].Material,
						"itemText": poItemData[i].Decription,
						"extItemId": null,
						"customerItemID": null,
						"invQty": parseFloat(poItemData[i].Quantity).toFixed(2),
						"qtyUom": poItemData[i].Unit,
						"price": poItemData[i].Net_Price,
						"currency": "EUR",
						"pricingUnit": null,
						"unit": null,
						"disAmt": null,
						"disPer": null,
						"shippingAmt": null,
						"shippingPer": null,
						"taxAmt": null,
						"taxPer": null,
						"netWorth": poItemData[i].Net_Value,
						"itemComment": null,
						"isTwowayMatched": false,
						"isThreewayMatched": false,
						"matchDocNum": "",
						"matchDocItem": "",
						"matchParam": "",
						"matchedBy": "Not Matched",
						"unusedField1": null,
						"unusedField2": null,
						"createdByInDb": "saikat.bhowmick@incture.com",
						"createdAtInDB": null,
						"updatedBy": null,
						"updatedAt": null,
						"isSelected": false,
						"threeWayMessae": null,
						"isThreewayQtyIssue": null,
						"isThreewayPriceIssue": null,
						"poAvlQtyOPU": null,
						"poAvlQtyOU": null,
						"poAvlQtySKU": null,
						"unitPriceOPU": null,
						"unitPriceOU": null,
						"unitPriceSKU": null,
						"poNetPrice": null,
						"poTaxCode": "",
						"poTaxPer": poItemData[i].taxPer,
						"poTaxValue": poItemData[i].taxAmount,
						"poMaterialNum": null,
						"poVendMat": null,
						"poUPC": null,
						"excpetionMessage": null,
						"invoiceUPCCode": null,
						"taxCode": poItemData[i].taxCode
					};
					obj.invoiceItems.push(invoiceItems);
				}

				if (obj.invoiceDate && obj.extInvNum) {
					var token = this.getCSRFToken();
					var jsonData = JSON.stringify(obj);
					var url = "InctureApDest/invoiceHeader/saveOrUpdate";
					var that = this;
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
							var message = result.message;
							if (result.status === "Success") {
								sap.m.MessageBox.success(message, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										var aData = [];
										exchangeRequestModel.setData(aData);
										that.oRouter.navTo("Process");
									}
								});
							} else {
								sap.m.MessageBox.information(message, {
									actions: [sap.m.MessageBox.Action.OK]
								});
							}
						},
						error: function (result, xhr, data) {
							sap.m.MessageToast.show("Failed");
						}
					});
				} else {
					MessageBox.error("Please Select Invoice Date & Invoice Number!");
				}
			}
			exchangeRequestModel.refresh();
		},
		onPressNextProcessREject: function () {
			var that = this;
			if (!that.commentAndRejection) {
				that.commentAndRejection = sap.ui.xmlfragment("ui.incture.APInvoiceTask.view.Fragments.SendAsn", this);
				that.getView().addDependent(that.commentAndRejection);
			}
			var obj = {
				Comments: false,
				Reject: true,
				Heading: "Select"
			};
			var oModel = new sap.ui.model.json.JSONModel(obj);
			that.commentAndRejection.setModel(oModel, "FragmentSet");
			that.commentAndRejection.open();
		},
		onPressNextProcessValidate: function () {

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ui.incture.APInvoiceTask.view.Second
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ui.incture.APInvoiceTask.view.Second
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ui.incture.APInvoiceTask.view.Second
		 */
		//	onExit: function() {
		//
		//	}

	});

});