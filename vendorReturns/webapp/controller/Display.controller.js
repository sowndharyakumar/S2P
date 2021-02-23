sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("com.incture.vendorReturns.controller.Display", {
			onInit: function () {
				this.oRouter = this.getOwnerComponent().getRouter();
				sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			},
			_onRouteMatched: function (oEvent) {
				var value = oEvent.getParameters().arguments.value;
				var baseModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(baseModel, "baseModel");
				baseModel.setProperty("/grBased", false);
				baseModel.setProperty("/poBased", false);
				var returnPOModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(returnPOModel, "returnPOModel");
				var returnModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(returnModel, "returnModel");
				var that = this;
				if (value) {
					this._BusyDialog = new sap.m.BusyDialog({
						busyIndicatorDelay: 0
					});
					this._BusyDialog.open();
					var oDraftModel = new sap.ui.model.json.JSONModel();
					this.getView().setModel(oDraftModel, "oDraftModel");
					jQuery
						.ajax({
							url: "VendorReturns/returnsRequest?requestId=" + value,
							type: "GET",
							dataType: "json",
							success: function (result) {
								oDraftModel.setData(result);
								oDraftModel.refresh();
								var roType = result.returnsHeader.returnType;
								if (roType === "GR") {
									baseModel.setProperty("/grBased", true);
									baseModel.setProperty("/poBased", false);
								} else {
									baseModel.setProperty("/poBased", true);
									baseModel.setProperty("/grBased", false);
								}
								that.setGrData(result);
								that._BusyDialog.close();
							}
						});
				}
			},
			setGrData: function (results) {
				var array = [];
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
				this.getView().getModel("returnPOModel").setProperty("/returnAmountPreviewTotal", results.returnsHeader.totalAmount);
				this.getView().getModel("returnModel").setProperty("/returnAmountPreviewTotal", results.returnsHeader.totalAmount);
				this.getView().getModel("returnPOModel").setProperty("/aReturn", array);
				this.getView().getModel("returnModel").setProperty("/aSelectedReturn", array);
				this.getView().getModel("returnModel").setProperty("/returnsCommentsList", results.returnsCommentsList);
				this.getView().getModel("returnModel").setProperty("/attachmentObject", results.returnsAttachmentList);
			},
			onPressRemarks: function (oEvent) {
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
			onPressAttachments: function () {
				if (this.getView().getModel("returnModel").getData().attachmentObject.length > 0){
					var that = this;
				if (!that.attachment) {
					that.attachment = sap.ui.xmlfragment("com.incture.vendorReturns.Fragments.attachment", this);
					that.getView().addDependent(that.attachment);
					that.attachment.addStyleClass("sapUiSizeCompact");
				}
				this.getView().getModel("baseModel").setProperty("/attachmentVisiblity", false);
				this.getView().getModel("baseModel").setProperty("/attachmentDelEnable", false);
				that.attachment.open();
			} else {
				sap.m.MessageToast.show("No Attachments");
			}
		},
		cancelAttachment: function () {
			this.attachment.close();
		},
		fnDownloadAttachment: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("returnModel").getObject();
			var apptype = "application/pdf";
			var byteCode = object.fileBase64;
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
			a.download = "download.pdf";
			a.click();
			window.URL.revokeObjectURL(url);
		}
	});
});