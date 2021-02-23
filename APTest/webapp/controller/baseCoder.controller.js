sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/ui/unified/Calendar",
		"ui/incture/APTest/util/formatter",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV",
		"sap/ui/core/routing/History"
	],
	function (Controller, MessageBox, Calendar, formatter, Export, ExportTypeCSV, History) {
		"use strict";
		return Controller.extend("ui.incture.APTest.controller.baseCoder", {
			onInit: function () {
				var detailPageModel = new sap.ui.model.json.JSONModel();
				detailPageModel.setSizeLimit(2000);
				this.getView().setModel(detailPageModel, "detailPageModel");
				var postDataModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(postDataModel, "postDataModel");
				var mRejectModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(mRejectModel, "mRejectModel");
				var taxModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(taxModel, "taxModel");
				var sPDFPath = jQuery.sap.getModulePath("ui.incture.APTest.css.pdfs", "/Test.pdf");
				var oPDFModel = new sap.ui.model.json.JSONModel({
					"Source": sPDFPath,
					"Title": "Invoice PDF",
					"Height": "560px",
					"Width": "100%"
				});
				this.getView().setModel(oPDFModel, "oPDFModel");

				var oInvoiceModel = new sap.ui.model.json.JSONModel({
					"iSubTotal": 23423.23,
					"iFreight": 23445,
					"iSubCharges": 324234,
					"iGrossAmt": 0,
					"bNonEditableField": true,
					"bEnable": false,
					"bPdfBtn": false
				});
				this.getView().setModel(oInvoiceModel, "oInvoiceModel");
				var templateModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(templateModel, "templateModel");
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};

				//Payment Term Data
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function () {
					paymentModel.refresh();
				});

				//Payment Method Data
				var pmUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentMethodsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001' ";
				var paymentMethodModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentMethodModel, "paymentMethodModel");
				paymentMethodModel.loadData(pmUrl, null, true, "Get", false, false, oHeader);
				paymentMethodModel.attachRequestCompleted(function (oEvent) {
					paymentMethodModel.refresh();
				});
				//Payment Block Data
				var pbUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentBlockSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var paymentBlockModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentBlockModel, "paymentBlockModel");
				paymentBlockModel.loadData(pbUrl, null, true, "Get", false, false, oHeader);
				paymentBlockModel.attachRequestCompleted(function (oEvent) {
					paymentBlockModel.refresh();
				});
				var that = this;
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oInvoiceModel = new sap.ui.model.json.JSONModel();

				this.oRouter.attachRoutePatternMatched(function (oEvent) {
					if (oEvent.getParameters().arguments.value && oEvent.getParameters().arguments.value != "abc") {
						var url = "InctureApDest/invoiceHeader?requestId=" + oEvent.getParameters().arguments.value;
						jQuery
							.ajax({
								url: url,
								type: "GET",
								dataType: "json",
								success: function (result) {
									var aData = result;
									detailPageModel.setProperty("/invoiceDetailUIDto", aData);
									postDataModel.setProperty("/listNonPoItem", result.costAllocation);
									/*var postingDate = detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/postingDate");
									if (postingDate) {
										var pDate = postingDate / 1000;
										var value = new Date(pDate * 1000);
										var year = value.getFullYear();
										var month = value.getMonth() + 1;
										var day = value.getDate();
										var nVal = year + "-" + month + "-" + day;
										detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/postingDate", nVal);
									}*/
									var aCostAllocationData = postDataModel.getProperty("/listNonPoItem");
									if (aCostAllocationData) {
										oInvoiceModel.setProperty("/bEnable", true);
									}
									that.amtCalculation();
									that.getPdfData();
									that.getCommentData();
									detailPageModel.refresh();
									postDataModel.refresh();
									//	that._getPaymentTerms();
								},
								error: function (e) {
									MessageBox.error(e.message);
								}
							});
					}
				});

			},

			onPostingDateChange: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/postingDate", oEvent.getSource()._getSelectedDate().getTime());
			},
			getCommentData: function () {
				var detailPageModel = this.getView().getModel("detailPageModel");
				$.ajax({
					url: "InctureApDest/comment?requestId=" + detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.requestId,
					method: "GET",
					async: true,
					success: function (result, xhr, data) {
						detailPageModel.getData().invoiceDetailUIDto.commentDto = result.commentDtos;
						detailPageModel.refresh();
					}.bind(this)
				});
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
			onNavBack: function () {
				this.oRouter.navTo("Workbench");
			},
			onPressopenpdf: function () {
				this.byId("grid").setDefaultSpan("L6 M6 S12");
				this.byId("grid2").setDefaultSpan("L6 M6 S12");
				this.addPdfArea();
			},
			addPdfArea: function () {
				/*	var oSplitter = this.byId("idMainSplitter");
					if (oSplitter.getContentAreas().length === 1) {
						oSplitter.insertContentArea(this._getFormFragment("pdf"), 1);
					}*/
				var that = this;
				var pdfData = this.getView().getModel("detailPageModel").getData().docManagerDto[0];
				that.pdf = sap.ui.xmlfragment(that.getView().getId(), "ui.incture.APTest.view.fragments.pdf", that);
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
				var detailPageModel = this.getView().getModel("detailPageModel");
				var oInvoiceModel = this.getView().getModel("oInvoiceModel");
				$.ajax({
					url: "InctureApDest/attachment?requestId=" + detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.requestId,
					method: "GET",
					async: true,
					success: function (result, xhr, data) {
						oInvoiceModel.setProperty("/bPdfBtn", false);
						for (var i = 0; i < result.attachmentList.length; i++) {
							if (result.attachmentList[i].master) {
								detailPageModel.getData().docManagerDto = result.attachmentList.splice(i, 1);
								oInvoiceModel.setProperty("/bPdfBtn", true);
							}
						}
						detailPageModel.getData().docManagerDto = result.attachmentList;
						detailPageModel.refresh();
					}.bind(this)
				});
			},

			toggleHdrLayout: function (oEvent) {
				var selKey = oEvent.getSource().getProperty("selectedKey");
				var flag = true;
				this.getView().byId("invoiceDetailTab").setVisible(!flag);
				this.getView().byId("pdftableVbox").setVisible(!flag);
				this.getView().byId("emailSection").setVisible(!flag);
				this.getView().byId("attachmentTab").setVisible(!flag);
				this.getView().byId("commnetTab").setVisible(!flag);
				this.getView().byId("nonPoAbby").setVisible(!flag);
				if (selKey === "invoice") {
					this.getView().byId("invoiceDetailTab").setVisible(flag);
					this.getView().byId("emailSection").setVisible(flag);
					this.getView().byId("attachmentTab").setVisible(flag);
					this.getView().byId("commnetTab").setVisible(flag);
					this.getView().byId("nonPoAbby").setVisible(flag);
				} else {
					this.getView().byId("pdftableVbox").setVisible(flag);
				}
			},

			_removeContentArea: function () {
				var oSplitter = this.byId("idMainSplitter");
				var oLastContentArea = oSplitter.getContentAreas().pop();
				if (oSplitter.getContentAreas().length > 1) {
					oSplitter.removeContentArea(oLastContentArea);
				}
				this._resizeSplitterLayout();
				this.byId("grid").setDefaultSpan("L3 M4 S12");
				this.byId("grid2").setDefaultSpan("L3 M6 S12");
			},
			_addPdfContentArea: function () {
				var oSplitter = this.byId("idMainSplitter");
				if (oSplitter.getContentAreas().length === 1) {
					sap.ui.getCore().byId("pdftable");
					this.pdfTable = sap.ui.xmlfragment("ui.incture.APTest.view.fragment.pdfTable", this);
					oSplitter.insertContentArea(this.pdfTable, 1);
				}
				this._resizeSplitterLayout();
			},
			_resizeSplitterLayout: function () {
				var oContentLayout;
				var oSplitter = this.byId("idMainSplitter");
				oSplitter.getContentAreas().forEach(function (oElement) {
					oContentLayout = oElement.getLayoutData();
					oContentLayout.setSize("auto");
				});
			},

			_formFragments: {},
			_getFormFragment: function (sFragmentName) {
				var oFormFragment = this._formFragments[sFragmentName];

				if (oFormFragment) {
					return oFormFragment;
				}

				oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "ui.incture.APTest.view.fragment." + sFragmentName, this);

				this._formFragments[sFragmentName] = oFormFragment;
				return this._formFragments[sFragmentName];
			},

			_setUpTheLayout: function () {
				var oSplitAreaOneBox,
					oSplitter = this.byId("idMainSplitter"),
					oSplitAreaOneBox = new sap.m.VBox({
						items: [
							this._getFormFragment("emailSection"),
							this._getFormFragment("attachmentBar"),
						]
					});
				oSplitter.insertContentArea(oSplitAreaOneBox, 0);

			},

			openFileExplorer: function () {

				if (!this.myDialogFragment) {
					sap.ui.getCore().byId("idOpenFileExplorer");
					this.myDialogFragment = sap.ui.xmlfragment("ui.incture.APTest.view.fragment.openFileExplorer", this);
					this.getView().addDependent(this.myDialogFragment);

				}
				this.myDialogFragment.open();
				var oFileUploader = sap.ui.getCore().byId("fileUploader");
				oFileUploader.setValue(null);
			},
			onBeforeUploadStarts: function (oEvent) {

				var detailPageModel = this.getView().getModel("detailPageModel");
				var detailPageModelData = this.getView().getModel("detailPageModel").getData();
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
					var cDate = new Date();
					var sDate = Date.now(cDate);
					var docDetails = {
						"requestId": detailPageModelData.invoiceDetailUIDto.invoiceHeader.requestId,
						"fileName": fileName,
						"fileType": fileType,
						"fileBase64": base64,
						"createdBy": detailPageModelData.invoiceDetailUIDto.invoiceHeader.clerkEmail,
						"createdAt": sDate,
						"updatedBy": null,
						"updatedAt": null,
						"master": null
					};
					if (!detailPageModel.getData().docManagerDto) {
						detailPageModel.getData().docManagerDto = [];
					}
					detailPageModel.getData().docManagerDto.push(docDetails);
					detailPageModel.refresh();
				};
				if (fileList) {
					reader.readAsDataURL(fileList);
				}
			},
			fnUploadDoc: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var attachData = oEvent.getSource().getBindingContext("detailPageModel").getObject();
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

			handleUploadComplete: function (oEvent) {
				var sResponse = oEvent.getParameter("response");
				if (sResponse) {
					var sMsg = "";
					var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
					if (m[1] === "200") {
						sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
						oEvent.getSource().setValue("");
					} else {
						sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
					}
					sap.m.MessageToast.show(sMsg);
				}
			},
			handleUploadPress: function () {

				this.myDialogFragment.close();
				var postDataModel = this.getView().getModel("postDataModel");
				var ext = sap.ui.getCore().byId("fileUploader").getValue().split(".");
				if (ext[0] === "") {
					sap.m.MessageToast.show("Please select a .csv file to upload");
					return;
				}
				var oFileFormat = ext[1].toLowerCase();

				var oBulkUploadModelData;
				var oFileUploader = sap.ui.getCore().byId("fileUploader");
				postDataModel.setProperty("/listNonPoItem", []);
				this.fileType = oFileUploader.getValue().split(".")[1];
				var domRef = oFileUploader.getFocusDomRef();
				var file = domRef.files[0];
				// Create a File Reader object
				var reader = new FileReader();
				var that = this;
				reader.onload = function (e) {
					if (that.fileType === "csv") {
						var bytes = new Uint8Array(reader.result);
						var binary = "";
						var length = bytes.byteLength;
						for (var i = 0; i < length; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						var strCSV = e.target.result;
						var arrCSV = binary.split("\n");
						// To ignore the first row which is header
						var oTblData = arrCSV.splice(1);
						oBulkUploadModelData = [];

						for (var j = 0; j < oTblData.length; j++) {
							var oRowDataArray = oTblData[j].split(';');
							var oTblRowData = {
								glAccount: oRowDataArray[0],
								materialDescription: oRowDataArray[1],
								crDbIndicator: oRowDataArray[2],
								netValue: parseFloat(oRowDataArray[3]),
								costCenter: oRowDataArray[4],
								internalOrderId: oRowDataArray[5],
								profitCentre: oRowDataArray[6],
								itemText: oRowDataArray[7],
								companyCode: oRowDataArray[8].replace(/['"]+/g, "")
							};
							oBulkUploadModelData.push(oTblRowData);
						}

						postDataModel.setProperty("/listNonPoItem", oBulkUploadModelData);
						that.getView().byId("btnSavetemplate").setEnabled(true);
						postDataModel.refresh();

					} else if (that.fileType === "xlsx" || that.fileType === "xls") {
						var workbook = XLSX.read(e.target.result, {
							type: 'binary'
						});
						var sheet_name_list = workbook.SheetNames;
						sheet_name_list.forEach(function (y) { /* iterate through sheets */
							//Convert the cell value to Json
							that.ExcelData = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
						});
						oBulkUploadModelData = that.ExcelData;

						postDataModel.setProperty("/listNonPoItem", oBulkUploadModelData);
						that.getView().byId("btnSavetemplate").setEnabled(true);
						postDataModel.refresh();

					} else {
						sap.m.MessageBox.information("inCorrect Format");
					}

					postDataModel.refresh();
					oFileUploader.setValue(null);
				};
				reader.readAsArrayBuffer(file);

			},

			closeFileExplDialog: function () {
				this.myDialogFragment.close();
			},

			hdrInvAmtCalu: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var inValue = oEvent.getParameter("value");
				if (inValue === "") {
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/invAmtError", "Error");
					sap.m.MessageBox.information("Please Enter Invoice Amount!");
				} else {
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/invAmtError", "None");
					var invAmt = (parseFloat(inValue)).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/invoiceTotal", invAmt);
					var aDetails = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader;
					var fBalance = (parseFloat(aDetails.invoiceTotal - aDetails.grossAmount)).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", fBalance);
				}
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

			getGLaccountValue: function (oEvent) {

				var glValue = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				if (glValue === "") {
					postDataModel.setProperty(sPath + "/glError", "Error");
					sap.m.MessageBox.information("Please enter G/L Account!");
				} else {
					postDataModel.setProperty(sPath + "/glError", "None");
				}
			},
			companyCodeSuggest: function (oEvent) {

				var sQuery = oEvent.getSource().getValue();
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/CompanyCodeSet?$filter=substringof( '001', CompCode )&$format=json";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var companyCodeModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(companyCodeModel, "companyCodeModel");
				companyCodeModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				companyCodeModel.attachRequestCompleted(function (oEvent) {
					companyCodeModel.refresh();
				});
			},
			glAccountSuggest: function (oEvent) {
				var sQuery = oEvent.getSource().getValue();
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/GLAccountSet?$filter=CompanyCode eq '0001' and GLAccounts eq '*" +
					sQuery + "*'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var glAccountModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(glAccountModel, "glAccountModel");
				glAccountModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				glAccountModel.attachRequestCompleted(function (oEvent) {
					glAccountModel.refresh();
				});
			},
			onChangeCostCenter: function (oEvent) {
				var sCostCenter = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				if (sCostCenter === "") {
					postDataModel.setProperty(sPath + "/costCenterError", "Error");
					sap.m.MessageBox.information("Please Enter Cost Center!");
				} else {
					postDataModel.setProperty(sPath + "/costCenterError", "None");
				}
			},
			onChangeText: function (oEvent) {
				var sText = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				if (sText === "") {
					postDataModel.setProperty(sPath + "/itemTextError", "Error");
					sap.m.MessageBox.information("Please Enter Item Text!");
				} else {
					postDataModel.setProperty(sPath + "/itemTextError", "None");
				}
			},
			costCenterSuggest: function (oEvent) {
				var sQuery = oEvent.getSource().getValue();
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/CostCenterSet?$filter=CompCode eq '0001' and CostCenters eq '*" + sQuery +
					"*'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var costCenterModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(costCenterModel, "costCenterModel");
				costCenterModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				costCenterModel.attachRequestCompleted(function (oEvent) {
					costCenterModel.refresh();
				});
			},
			internalOrderSuggest: function (oEvent) {
				var sQuery = oEvent.getSource().getValue();
				/*	var modelData = this.getView().getModel("detailPageModel").getData();
					var companyCode = modelData.invoiceDetailUIDto.companyCode;*/
				var sUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/InternalOrderSearchSet?$filter=SearchString eq '4' and ImpCompCode eq '0001'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var internalOrderModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(internalOrderModel, "internalOrderModel");
				internalOrderModel.loadData(sUrl, null, true, "Get", false, false, oHeader);
				internalOrderModel.attachRequestCompleted(function (oEvent) {
					internalOrderModel.refresh();
				});
			},
			deleteNonPoData: function (oEvent) {
				var detailPageModel = this.getView().getModel("postDataModel");
				var index = oEvent.getSource().getParent().getBindingContextPath().split("/")[2];
				var sPath = oEvent.getSource().getParent().getBindingContextPath();
				var sValue = detailPageModel.getProperty(sPath + "/netValue");
				detailPageModel.getData().listNonPoItem.splice(index, 1);
				detailPageModel.refresh();
				var n = detailPageModel.getData().listNonPoItem.length;
				if (n === 0) {
					this.getView().byId("btnSavetemplate").setEnabled(false);
				}
				if (sValue) {
					this.amountCal(oEvent);
				}
			},
			addItem: function (oEvt) {
				if (this.getView().byId("btnSavetemplate").setEnabled(false)) {
					this.getView().byId("btnSavetemplate").setEnabled(true);
				}
				var postDataModel = this.getView().getModel("postDataModel");
				var postDataModelData = postDataModel.getData();
				if (!postDataModelData.listNonPoItem) {
					postDataModelData.listNonPoItem = [];
				}
				var glCode = "";
				var materialDescription = "";
				var crDbIndicator = "H";
				var netValue = "";
				var costCenter = "";
				var internalOrderId = "";
				var profitCenter = "";
				var itemText = "";
				var companyCode = "";
				var templateId = "";
				postDataModelData.listNonPoItem.unshift({
					"templateId": templateId,
					"glAccount": glCode,
					"costCenter": costCenter,
					"internalOrderId": internalOrderId,
					"materialDescription": materialDescription,
					"crDbIndicator": crDbIndicator,
					"netValue": netValue,
					"profitCenter": profitCenter,
					"itemText": itemText,
					"companyCode": companyCode,
					"assetNo": null,
					"subNumber": null,
					"wbsElement": null,
					"isNonPo": true
				});
				postDataModel.refresh();
			},
			onGetallTemp: function () {
				var templateModel = this.getView().getModel("templateModel");
				/*	var growCount = 10;
					templateModel.setProperty("/growCount",growCount);*/
				//	var pageNo = 0;
				//	var url = "InctureApDest/NonPoTemplate/getAll/50/" + pageNo;
				var url = "InctureApDest/NonPoTemplate/getAll";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {
						var aData = data;
						var aTempData = aData.map(function (oRow, index) {
							return oRow.nonPoTemplate;
						});
						var aTempItems = aData.map(function (oRow, index) {
							return oRow.nonPoTemplateItems;
						});
						templateModel.setProperty("/aTempItems", aTempItems);
						templateModel.setProperty("/aNonPoTemplate", aTempData);
						templateModel.setProperty("/aTemplateData", aData);
					},
					error: function (err) {
						// that._busyDialog.close();
						sap.m.MessageToast.show(err.statusText);
					}
				});
			},
			handleTemplateSearch: function (oEvt) {
				var aFilters = [];
				var sQuery = oEvt.getParameter("value");
				if (sQuery && sQuery.length > 0) {
					var afilter = new sap.ui.model.Filter([
							new sap.ui.model.Filter("templateName", sap.ui.model.FilterOperator.Contains, sQuery)
						],
						false);
					aFilters.push(afilter);
				}
				var oBinding = sap.ui.getCore().byId("__dialog0").getBinding("items");
				oBinding.filter(aFilters, false);
			},
			onSearchAttachments: function (oEvt) {
				var aFilters = [];
				var sQuery = oEvt.getSource().getValue();
				if (sQuery && sQuery.length > 0) {
					var afilter = new sap.ui.model.Filter([
							new sap.ui.model.Filter("fileName", sap.ui.model.FilterOperator.Contains, sQuery)
						],
						false);
					aFilters.push(afilter);
				}
				var oBinding = this.getView().byId("attachListItems").getBinding("items");
				oBinding.filter(aFilters, false);
			},

			onSelectTemplate: function (oEvt) {
				var that = this;
				var templateModel = this.getView().getModel("templateModel");
				that.selectTemplate = sap.ui.xmlfragment("selectTemplate", "ui.incture.APTest.view.fragment.selectTemplate", that);
				var oDialog = that.selectTemplate;
				/*oDialog._oDialog.addButton(new sap.m.Button({
									//text: "PREV",
									icon: "sap-icon://nav-back",
									type: sap.m.ButtonType.Emphasized,
									press: function (oEvent) {
										that.onPrevTemp(oEvent);
									}
								}));
								oDialog._oDialog.addButton(new sap.m.Button({
									//text: "NEXT",
									icon: "sap-icon://navigation-right-arrow",
									type: sap.m.ButtonType.Emphasized,
									press: function (oEvent) {
										that.onNextTemp(oEvent);
									}
								}));*/
				oDialog._oDialog.addButton(new sap.m.Button({
					text: "Delete",
					type: sap.m.ButtonType.Emphasized,
					press: function (oEvent) {
						that.onDeleteTemp(oEvent);
					}
				}).addStyleClass("rejBtnCss"));
				oDialog._oDialog.addButton(new sap.m.Button({
					text: "OK",
					type: sap.m.ButtonType.Emphasized,
					press: function (oEvent) {
						that.onSelectokTemp(oEvent);
					}
				}).addStyleClass("submitBtnCss"));
				oDialog._oDialog.addButton(new sap.m.Button({
					text: "Cancel",
					type: sap.m.ButtonType.Emphasized,
					press: function (oEvent) {
						that.selectTemplate.exit();
					}
				}));

				that.getView().addDependent(that.selectTemplate);
				that.onGetallTemp();
				//templateModel.setProperty("/currentPage", 1);
				that.selectTemplate.open();
				templateModel.refresh();
			},
			onNextTemp: function (oEvent) {
				var templateModel = this.getView().getModel("templateModel");
				var sPage = templateModel.getProperty("/currentPage");
				sPage++;
				templateModel.setProperty("/currentPage", sPage);
				this.onGetallTemp(sPage);
			},
			onPrevTemp: function (oEvent) {
				var templateModel = this.getView().getModel("templateModel");
				var sPage = templateModel.getProperty("/currentPage");
				if (sPage > 1) {
					sPage--;
					templateModel.setProperty("/currentPage", sPage);
					this.onGetallTemp(sPage);
				}
			},
			onDataExport: function (oEvent) {
				var postDataModel = this.getView().getModel("postDataModel");
				var oExport = new Export({

					// Type that will be used to generate the content. Own ExportType's can be created to support other formats
					exportType: new ExportTypeCSV({
						separatorChar: ";"
					}),

					// Pass in the model created above
					models: postDataModel,

					// binding information for the rows aggregation
					rows: {
						path: "/listNonPoItem"
					},

					// column definitions with column name and binding info for the content
					//	aCols = this.createColumnConfig();
					columns: [{
						name: "G/L Account",
						template: {
							content: "{glAccount}"
						}
					}, {
						name: "Description",
						template: {
							content: "{materialDescription}"
						}
					}, {
						name: "Debt/Cred",
						template: {
							content: "{crDbIndicator}"
						}
					}, {
						name: "netValue",
						template: {
							content: "{netValue}"
						}
					}, {
						name: "Cost Centre",
						template: {
							content: "{costCenter}"
						}
					}, {
						name: "Order",
						template: {
							content: "{internalOrderId}"
						}
					}, {
						name: "Profit Centre",
						template: {
							content: "{profitCentre}"
						}
					}, {
						name: "Text",
						template: {
							content: "{itemText}"
						}
					}, {
						name: "Co.Cd",
						template: {
							content: "{companyCode}"
						}
					}]
				});

				// download exported file
				oExport.saveFile("NonPoTemplateData").catch(function (oError) {
					sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
				}).then(function () {
					oExport.destroy();
				});
				//	}
			},
			onSaveTemplate: function (oEvt) {
				//var oGlobTempModel = this.getView().getModel("templateModel");
				var postDataModel = this.getView().getModel("postDataModel");
				var alistNonPoData = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
				var bflag = true;
				for (var i = 0; i < alistNonPoData.length; i++) {
					//To handle validations
					postDataModel.setProperty("/listNonPoItem/" + i + "/netValue", "");
					var bValidate = false;
					if (alistNonPoData[i].glAccount === "" || alistNonPoData[i].glError === "Error") {
						bValidate = true;
						alistNonPoData[i].glError = "Error";
					}
					if (alistNonPoData[i].netValue === "" || alistNonPoData[i].amountError === "Error") {
						bValidate = true;
						alistNonPoData[i].amountError = "Error";
					}
					if (alistNonPoData[i].costCenter === "" || alistNonPoData[i].costCenterError === "Error") {
						bValidate = true;
						alistNonPoData[i].costCenterError = "Error";
					}
					if (alistNonPoData[i].itemText === "" || alistNonPoData[i].itemTextError === "Error") {
						bValidate = true;
						alistNonPoData[i].itemTextError = "Error";
					}
					if (bValidate) {
						bflag = false;
						//break;
						continue;
					}
				}
				if (!bflag) {
					postDataModel.setProperty("/listNonPoItem", alistNonPoData);
					var sMsg = "Please Enter Required Fields G/L Account,Amount,Cost Center & Text!";
					sap.m.MessageBox.alert(sMsg);
					return;
				} else {
					if (!this.saveTemplate) {
						sap.ui.getCore().byId("saveTempFragID");
						this.saveTemplate = sap.ui.xmlfragment("saveTemplate", "ui.incture.APTest.view.fragment.saveTemplate", this);
					}
					this.getView().addDependent(this.saveTemplate);
					this.saveTemplate.open();
				}
				var url = "InctureApDest/NonPoTemplate/getAll";
				var templateModel = this.getView().getModel("templateModel");
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {
						var aData = data;
						var aTempData = aData.map(function (oRow, index) {
							return oRow.nonPoTemplate;
						});
						var aTempDataItems = aData.map(function (oRow, index) {
							return oRow.nonPoTemplateItems;
						});
						templateModel.setProperty("/aNonPoTemplate", aTempData);
						templateModel.setProperty("/aNonPoTemplateItems", aTempDataItems);
						templateModel.setProperty("/aTemplateData", aData);
					},
					error: function (err) {
						sap.m.MessageToast.show(err.statusText);
					}
				});
			},

			// End PO Data Functions
			onSelectokTemp: function (oEvent) {
				var that = this;
				var oInvoiceModel = this.getView().getModel("oInvoiceModel");
				var templateModel = this.getView().getModel("templateModel");
				var postDataModel = this.getView().getModel("postDataModel");
				var aNonPoTemplate = templateModel.getProperty("/aNonPoTemplate");
				var len = this.selectTemplate._oTable._aSelectedPaths.length;
				if (len > 0) {
					var arr = [];
					for (var i = 0; i < len; i++) {
						var sIndx = this.selectTemplate._oTable._aSelectedPaths[i].split("/")[2];
						var aIndexValue = Number(sIndx);
						arr.push(aIndexValue);
					}
					that.openBusyDialog();
					var listNonPoItem = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
					var arrLength = arr.length;
					for (var j = 0; j < arrLength; j++) {
						var tempid = aNonPoTemplate[arr[j]].templateId;
						var sUrl = "InctureApDest/NonPoTemplate/getItemsByTemplateId/" + tempid;
						jQuery.ajax({
							type: "GET",
							contentType: "application/json",
							url: sUrl,
							dataType: "json",
							async: true,
							success: function (data, textStatus, jqXHR) {

								var aData = data;
								for (var k = 0; k < aData.length; k++) {
									listNonPoItem.push(aData[k]);
								}
								if (listNonPoItem.length) {
									oInvoiceModel.setProperty("/bEnable", true);
								}
								postDataModel.setProperty("/listNonPoItem", listNonPoItem);
								that.selectTemplate.exit();
								that.closeBusyDialog();
							},
							error: function (err) {
								that.closeBusyDialog();
								sap.m.MessageToast.show(err.statusText);
							}
						});
						postDataModel.refresh();
						templateModel.refresh();
					}
				} else {
					MessageBox.error("Please Select Template Name!");
				}
			},
			onDeleteTemp: function (oEvent) {
				var that = this;
				var templateModel = this.getView().getModel("templateModel");
				var aNonPoTemplate = templateModel.getProperty("/aNonPoTemplate");
				var len = this.selectTemplate._oTable._aSelectedPaths.length;
				if (len > 0) {
					var arr = [];
					for (var i = 0; i < len; i++) {
						var sIndx = this.selectTemplate._oTable._aSelectedPaths[i].split("/")[2];
						var aIndexValue = Number(sIndx);
						arr.push(aIndexValue);
					}
					var arrLength = arr.length;
					for (var j = 0; j < arrLength; j++) {
						var tempid = aNonPoTemplate[arr[j]].templateId;
						var url = "InctureApDest/NonPoTemplate/delete/" + tempid;
						that.onDeleteofNonpoTemplate(aNonPoTemplate, url, tempid);
						templateModel.refresh();
					}
				} else {
					MessageBox.error("Please Select Template Name!");
				}
			},
			onDeleteofNonpoTemplate: function (aNonPoTemplate, sUrl, tempid) {
				var that = this;
				var templateModel = this.getView().getModel("templateModel");
				jQuery
					.ajax({
						url: sUrl,
						contentType: "application/json",
						type: "DELETE",
						beforeSend: function (xhr) {
							var token = that.getCSRFToken();
							xhr.setRequestHeader("X-CSRF-Token", token);
							xhr.setRequestHeader("Accept", "application/json");
						},
						//	success: function (Success) {
						success: function (Success) {
							var iIndex = aNonPoTemplate.findIndex(function (oRow) {
								return oRow.templateId === tempid;
							});
							// that.onSelectTemplate();
							aNonPoTemplate.splice(iIndex, 1);
							templateModel.setProperty("/aNonPoTemplate", aNonPoTemplate);
							sap.m.MessageToast.show(Success.message);
						},
						error: function (e) {
							//  console.log(e);
						}
					});
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
			onSaveTemp: function (oEvent) {
				var oGlobTempModel = this.getView().getModel("templateModel");
				if (oEvent.getSource().getText() === "Cancel") {
					sap.ui.getCore().byId("saveTemplate--saveInput").setValue("");
					if (sap.ui.getCore().byId("saveTemplate--updateInput").setSelectedItem()) {
						sap.ui.getCore().byId("saveTemplate--updateInput").setSelectedItem("");
					}
					oGlobTempModel.setProperty("/sUpdateTemplate", "");
					this.saveTemplate.close();
				} else {
					var detailPageModel = this.getView().getModel("detailPageModel");
					var sVendorId = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader.vendorId;
					var postDataModel = this.getView().getModel("postDataModel");
					var postUpdateModel = new sap.ui.model.json.JSONModel();
					var alistNonPoData = $.extend(true, [], postDataModel.getProperty("/listNonPoData"));
					var olistNonPoData = alistNonPoData.find(function (oRow) {
						return oRow.nonPoTemplate;
					});
					if (olistNonPoData) {
						var tempid = olistNonPoData.nonPoTemplate.templateId;
						var uuid = olistNonPoData.nonPoTemplate.uuid;
					}
					if (this.saveTemplate.getContent()[0].getItems()[0].getSelected()) {
						var oTemplateModel = this.getView().getModel("templateModel");
						var templateId = oTemplateModel.getProperty("/sTemplateNewname");
						if (templateId) {
							var oDate = new Date();
							this.dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "yyyy-MM-dd"
							});
							var dDate = this.dateFormat.format(oDate);
							if (templateId !== "null") {
								var objUpdate = {
									"nonPoTemplate": {
										"uuid": uuid,
										"templateId": tempid,
										"accClerkId": null,
										"basecoderId": null,
										"vendorId": sVendorId,
										"templateName": templateId,
										"createdBy": "Saikat",
										"createdAt": dDate,
										"updatedBy": "Saikat",
										"updatedAt": dDate
									}
								};
								postUpdateModel.setData(objUpdate);
								postUpdateModel.getData().nonPoTemplateItems = [];
								var iListNonPoLen = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
								var len = iListNonPoLen.length;
								if (!len) {
									oTemplateModel.setProperty("/sPreviousVal", undefined);
									return;
								}
								oTemplateModel.setProperty("/sPreviousVal", undefined);
								for (var i = 0; i < len; i++) {
									postUpdateModel.getData().nonPoTemplateItems.push(postDataModel.getData().listNonPoItem[i]);
									postUpdateModel.getData().nonPoTemplateItems[i].templateId = tempid;
								}
								var url = "InctureApDest/NonPoTemplate/update";
								var dataObj = postUpdateModel.getData();
								var that = this;
								jQuery
									.ajax({
										url: url,
										dataType: "json",
										data: JSON.stringify(dataObj),
										contentType: "application/json",
										type: "PUT",
										beforeSend: function (xhr) {
											var token = that.getCSRFToken();
											xhr.setRequestHeader("X-CSRF-Token", token);
											xhr.setRequestHeader("Accept", "application/json");
										},
										success: function (Success) {
											oGlobTempModel.setProperty("/sUpdateTemplate", templateId);
											that.saveTemplate.close();
											sap.m.MessageToast.show(Success.message);
										},
										error: function (e) {}
									});
							}
						}
					} else if (this.saveTemplate.getContent()[1].getItems()[0].getSelected()) {
						var createModel = new sap.ui.model.json.JSONModel();
						var dataModel = new sap.ui.model.json.JSONModel();
						this.getView().setModel(dataModel, "dataModel");
						var dataModelData = this.getView().getModel("dataModel").getData();
						dataModelData.listNonPoItem = [];
						if (sap.ui.getCore().byId("saveTemplate--saveInput").getValue() !== "") {
							var templateModel = this.getView().getModel("templateModel");
							templateModel.setProperty("/sPreviousVal", undefined);
							var tempName = sap.ui.getCore().byId("saveTemplate--saveInput").getValue();
							var tempId = tempName;
							var oDate = new Date();
							this.dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "yyyy-MM-dd"
							});
							var dDate = this.dateFormat.format(oDate);
							var objNonpoTemp = {
								"nonPoTemplate": {
									"templateId": tempId,
									"vendorId": sVendorId,
									"templateName": tempName,
									"createdBy": "Saikat",
									"createdAt": null,
									"updatedBy": "Saikat",
									"updatedAt": null
								}
							};
							dataModel.setData(objNonpoTemp);
							dataModel.getData().nonPoTemplateItems = [];
							var len = postDataModel.getData().listNonPoItem.length;
							for (var indx = 0; indx < len; indx++) {
								dataModel.getData().nonPoTemplateItems.push(postDataModel.getData().listNonPoItem[indx]);
								dataModel.getData().nonPoTemplateItems[indx].templateId = tempId;
							}
							var sUrl = "InctureApDest/NonPoTemplate/save";
							dataObj = dataModel.getData();
							var that = this;
							jQuery
								.ajax({
									url: sUrl,
									dataType: "json",
									data: JSON.stringify(dataObj),
									contentType: "application/json",
									type: "POST",
									beforeSend: function (xhr) {
										var token = that.getCSRFToken();
										xhr.setRequestHeader("X-CSRF-Token", token);
										xhr.setRequestHeader("Accept", "application/json");
									},
									success: function (Success) {
										templateModel.setProperty("/sUpdateTemplate", tempName);
										that.saveTemplate.close();
										sap.m.MessageToast.show(Success.message);
									},
									error: function (e) {
										//  console.log(e);
									}
								});
						} else {
							sap.m.MessageBox.information("Please Enter Template Name!");
						}
					}

				}
				sap.ui.getCore().byId("saveTemplate--saveInput").setValue("");
			},
			onSelect: function (oEvent) {
				if (oEvent.mParameters.selected) {
					this.saveTemplate.getContent()[0].getItems()[1].setEnabled(true);
					this.saveTemplate.getContent()[1].getItems()[1].setEnabled(false);
					sap.ui.getCore().byId("saveTemplate--saveInput").setValue("");
					sap.ui.getCore().byId("saveTemplate--saveInput").setSelectedItem("");
				}
			},
			onSelectRadio: function (oEvent) {
				if (oEvent.mParameters.selected) {
					this.saveTemplate.getContent()[0].getItems()[1].setEnabled(false);
					this.saveTemplate.getContent()[1].getItems()[1].setEnabled(true);
					sap.ui.getCore().byId("saveTemplate--updateInput").setValue("");
					sap.ui.getCore().byId("saveTemplate--updateInput").setSelectedItem("");
					var oTemplateModel = this.getView().getModel("templateModel");
					oTemplateModel.setProperty("/sPreviousVal", undefined);
				}
			},

			nanValCheck: function (value) {
				if (!value || value == NaN || value == "NaN" || isNaN(value)) {
					return 0;
				} else if (Number(value) != NaN) {
					if (parseFloat(value) == -0) {
						return 0;
					}
					return parseFloat(value);
				} else if (value == "0" || value == "0.00" || value == "-0.00") {
					return 0;
				}
				return value;
			},
			decimalValCheck: function (oEvent) {
				var input = oEvent.getSource().getValue();
				if (input) {
					var newchar = input.length;
					newchar--;
					var ascii = input.charCodeAt(newchar);
					if (!((ascii > 47 && ascii < 58) || ascii == 46)) {
						oEvent.getSource().setValue(input.substring(0, newchar));
						//  sap.m.MessageToast.show("Invalid entry !");
					}
					var indexV = input.indexOf(".");
					if (indexV != -1) {
						indexV = indexV + 3;
						if (input.length > indexV) {
							var regex = /(^\d{0,8})+(\.?\d{0,3})?$/;
							input = input.substring(0, indexV);
							if (regex.test(input)) {
								oEvent.getSource().setValue(input);
								//  return;
							} else {
								// sap.m.MessageToast.show("Invalid entry !");
							}
						}
					} else if (!isNaN(input)) {
						var intRegex = /^[1-9]\d{0,9}$/;
						if (intRegex.test(input)) {
							oEvent.getSource().setValue(input.substring(0, 9));
							//  return;
						}
					}
				}
			},
			decimalChk: function (oEvent, decimalVal) {
				var val = oEvent.getSource().getValue();
				if (val) {
					isNaN(val) ? val : val = parseFloat(val).toFixed(3);
					if (decimalVal == 3) {
						var regexp = /^\d+(\.\d{0,3})?$/;
						isNaN(val) ? val : val = parseFloat(val).toFixed(3);
					} else {
						var regexp = /^\d+(\.\d{0,2})?$/;
						isNaN(val) ? val : val = parseFloat(val).toFixed(2);
					}
					var flag = regexp.test(val) ? true : oEvent.getSource().setValue("").setValueState("Error");
					if (regexp.test(val)) {
						oEvent.getSource().setValue(val);
						return true;
					} else {
						return false;
					}
				}
				return true;
			},

			paymentTermValueHelp: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue();
				//this.inputId = oEvent.getSource().getId();
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function () {
					paymentModel.refresh();
				});
				// create value help dialog
				if (!this.paymentTermValueHelpDialog) {

					this.paymentTermValueHelpDialog = sap.ui.xmlfragment("paymentTermValueHelpDialog",
						"ui.incture.APTest.view.fragment.paymentTermValueHelp", this);
					this.getView().addDependent(this.paymentTermValueHelpDialog);
				}
				// open value help dialog filtered by the input value
				this.paymentTermValueHelpDialog.open(sInputValue);
			},
			handlepaymentTermClose: function (evt) {
				var oSelectedItem = evt.getParameter("selectedItem");
				if (oSelectedItem) {
					var productInput = this.getView().byId("paymentTermId");
					productInput.setValue(oSelectedItem.getTitle());
				}
			},

			handlepaymentTermSearch: function (oEvent) {
				var aFilters = [];
				var sQuery = oEvent.getParameter("value");
				var filterArry = [];
				var metaModel = ["Key", "Value"];
				if (sQuery && sQuery.length > 0) {
					for (var i = 0; i < metaModel.length; i++) {
						var bindingName = metaModel[i];
						filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
					}
					var filter = new sap.ui.model.Filter(filterArry, false);
					aFilters.push(filter);
				}
				// update list binding
				var binding = oEvent.getSource().getBinding("items");
				binding.filter(aFilters, "Application");
			},
			paymentTermSuggestion: function (oEvent) {

				var sQuery = oEvent.getSource().getValue();
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSetSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};
				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function () {
					paymentModel.refresh();
				});

			},
			paymentSuggestion: function () {
				var modelData = this.getView().getModel("detailPageModel").getData();
				var vendorId = modelData.invoiceDetailUIDto.vendorId;
				var companyCode = modelData.invoiceDetailUIDto.companyCode;
				var pmUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentMethodsSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001' ";
				var pbUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentBlockSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var ptUrl =
					"DEC_NEW/sap/opu/odata/sap/ZAP_NONPO_SEARCH_HELPS_SRV/VendorPaymentTermsSetSet?$filter=Vendor eq 'CW VENDOR' and CompCode eq '0001'";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8"
				};

				var paymentModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentModel, "paymentModel");
				paymentModel.loadData(ptUrl, null, true, "Get", false, false, oHeader);
				paymentModel.attachRequestCompleted(function (oEvent) {
					paymentModel.refresh();
				});

				var paymentMethodModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentMethodModel, "paymentMethodModel");
				paymentMethodModel.loadData(pmUrl, null, true, "Get", false, false, oHeader);
				paymentMethodModel.attachRequestCompleted(function (oEvent) {
					paymentMethodModel.refresh();
				});
				var paymentBlockModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(paymentBlockModel, "paymentBlockModel");
				paymentBlockModel.loadData(pbUrl, null, true, "Get", false, false, oHeader);
				paymentBlockModel.attachRequestCompleted(function (oEvent) {
					paymentBlockModel.refresh();
				});
			},
			glDescription: function (oEvt) {
				var glAccountDes = oEvt.getParameter("selectedItem").getProperty("additionalText");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvt.getSource().getBindingContext("postDataModel").sPath;
				postDataModel.setProperty(sPath + "/materialDescription", glAccountDes);
				postDataModel.refresh();
			},
			amtCalculation: function () {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var aDetails = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader;
				aDetails.balance = (parseFloat(aDetails.invoiceTotal - aDetails.grossAmount)).toFixed(3);
			},
			amountCal: function (oEvent) {
				if (!that) {
					var that = this;
				}
				//var amountVal = oEvent.getParameter("value");
				var postDataModel = this.getView().getModel("postDataModel");
				var sPath = oEvent.getSource().getBindingContext("postDataModel").getPath();
				var amountVal = postDataModel.getProperty(sPath + "/netValue");
				if (amountVal === "") {
					postDataModel.setProperty(sPath + "/amountError", "Error");
					sap.m.MessageBox.information("Please enter Amount!");
				} else {
					postDataModel.setProperty(sPath + "/amountError", "None");
				}
				var detailPageModel = that.getView().getModel("detailPageModel");
				var sDecValue = parseFloat(amountVal).toFixed(3);
				postDataModel.setProperty(sPath + "/netValue", sDecValue);
				var totalAmt = 0;
				if (postDataModel.getProperty("/listNonPoItem")) {
					var length = postDataModel.getProperty("/listNonPoItem").length;
					for (var i = 0; i < length; i++) {
						if (postDataModel.getProperty("/listNonPoItem/" + i + "/netValue") && postDataModel.getProperty("/listNonPoItem/" + i +
								"/crDbIndicator") === "H") {
							totalAmt += that.nanValCheck(postDataModel.getProperty("/listNonPoItem/" + i + "/netValue"));

						} else if (postDataModel.getProperty("/listNonPoItem/" + i + "/netValue") && postDataModel.getProperty("/listNonPoItem/" + i +
								"/crDbIndicator") === "S") {
							totalAmt -= that.nanValCheck(postDataModel.getProperty("/listNonPoItem/" + i + "/netValue"));
						}
					}
					totalAmt = that.nanValCheck(totalAmt).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/grossAmount", totalAmt);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", totalAmt);
					var invAmt = that.nanValCheck(detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceTotal"));
					var diff = that.nanValCheck(invAmt) - that.nanValCheck(totalAmt);
					diff = that.nanValCheck(diff).toFixed(3);
					detailPageModel.setProperty("/invoiceDetailUIDto/invoiceHeader/balance", diff);
					detailPageModel.refresh();
					postDataModel.refresh();
				}
			},
			updateDataChangeInTemplete: function (oEvent) {

				var templateData = this.getView().getModel("templateModel");
				var postDataModel = this.getView().getModel("postDataModel");
				var sNewValue = oEvent.getParameter("newValue");
				if (!sNewValue) {
					sap.m.MessageBox.information("Please enter Template Name!");
				} else {
					var aTemplateData = templateData.getProperty("/aTemplateData");
					var sPreviousCboxVal = oEvent.getSource().getProperty("value");
					var sPreviousVal = templateData.getProperty("/sPreviousVal");
					if (!sPreviousVal) {
						templateData.setProperty("/sPreviousVal", sPreviousCboxVal);
					}
					var aNonPoTemplate = $.extend(true, [], templateData.getProperty("/aNonPoTemplate"));
					if (sPreviousVal === sNewValue || sPreviousVal === undefined || aNonPoTemplate.some(function (oRow) {
							return oRow.templateName === sNewValue;
						})) {
						var sUpdatebox = oEvent.getSource().getValue();
						var bSetUpdateTemp = templateData.getProperty("/bSetUpdateTemp");
						postDataModel.setProperty("/listNonPoItem", []);
						var aSelectedData = aTemplateData.filter(function (oRow) {
							return oRow.nonPoTemplate.templateName === sUpdatebox;
						});
						var aTempItems = aSelectedData.map(function (oRow) {
							return oRow.nonPoTemplateItems;
						});
						var aSelectedItems = aTempItems.find(function (oRow) {
							return oRow;
						});
						templateData.setProperty("/bUpdatedFlag", true);
						templateData.setProperty("/bSetUpdateTemp", false);
						postDataModel.setProperty("/listNonPoData", aSelectedData);
						postDataModel.setProperty("/listNonPoItem", aSelectedItems);
						templateData.setProperty("/sTemplateNewname", sNewValue);
					} else if (sNewValue) {
						templateData.setProperty("/sTemplateNewname", sNewValue);
					}
					postDataModel.refresh();
				}
			},
			_fnOnSaveCall: function () {

				var detailPageModel = this.getView().getModel("detailPageModel"),
					detailPageModelData = detailPageModel.getData();
				var createdAt = detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceDate");
				var objSaveData = jQuery.extend({}, detailPageModelData.invoiceDetailUIDto);
				var postDataModel = this.getView().getModel("postDataModel");
				objSaveData.costAllocation = [];
				for (var i = 0; i < postDataModel.getData().listNonPoItem.length; i++) {
					var reqId = objSaveData.invoiceHeader.requestId ? objSaveData.invoiceHeader.requestId : null;
					var itemId = postDataModel.getData().listNonPoItem[i].itemId ? postDataModel.getData().listNonPoItem[i].itemId : null;
					objSaveData.costAllocation.push({
						"requestId": reqId,
						"itemId": itemId,
						"serialNo": 0,
						"deleteInd": null,
						"quantity": "0.00",
						"distrPerc": null,
						"subNumber": null,
						"netValue": postDataModel.getData().listNonPoItem[i].netValue,
						// "materialDescription": postDataModel.getData().listNonPoItem[i].materialDescription,
						"crDbIndicator": postDataModel.getData().listNonPoItem[i].crDbIndicator,
						"glAccount": postDataModel.getData().listNonPoItem[i].glAccount,
						"costCenter": postDataModel.getData().listNonPoItem[i].costCenter,
						"internalOrderId": postDataModel.getData().listNonPoItem[i].internalOrderId,
						"profitCenter": postDataModel.getData().listNonPoItem[i].profitCenter,
						"assetNo": postDataModel.getData().listNonPoItem[i].asset,
						"itemText": postDataModel.getData().listNonPoItem[i].itemText,
						"wbsElement": ""
					});
				}
				/*		var year = objSaveData.invoiceHeader.createdAt.slice(0, 4);
						var Mon = objSaveData.invoiceHeader.createdAt.slice(4, 6);
						var date = objSaveData.invoiceHeader.createdAt.slice(6, 8);
						var fulldate = year + "-" + Mon + "-" + date;*/
				objSaveData.invoiceHeader.createdAt = createdAt;
				objSaveData.invoiceHeader.postingDate = objSaveData.invoiceHeader.postingDate ? new Date(objSaveData.invoiceHeader.postingDate).getTime() :
					null;
				var obj = {};
				obj.attachments = [];
				if (detailPageModel.getData().docManagerDto && detailPageModel.getData().docManagerDto.length > 0) {
					for (var n = 0; n < detailPageModel.getData().docManagerDto.length; n++) {
						obj.attachments.push(detailPageModel.getData().docManagerDto[n]);
					}
				}
				obj.commentDto = [];
				if (detailPageModel.getData().invoiceDetailUIDto.commentDto && detailPageModel.getData().invoiceDetailUIDto.commentDto.length > 0) {
					for (var k = 0; k < detailPageModel.getData().invoiceDetailUIDto.commentDto.length; k++) {
						obj.commentDto.push(detailPageModel.getData().invoiceDetailUIDto.commentDto[k]);
					}
				}
				obj.invoiceHeader = objSaveData.invoiceHeader;
				obj.invoiceItems = objSaveData.invoiceItems;
				obj.costAllocation = objSaveData.costAllocation;
				return obj;
			},
			onPostComment: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sValue = oEvent.getParameter("value");
				var detailPageModelData = detailPageModel.getData().invoiceDetailUIDto.invoiceHeader;
				var dDate = new Date();
				var sDate = dDate.getTime();
				if (!detailPageModel.getData().invoiceDetailUIDto.commentDto) {
					detailPageModel.getData().invoiceDetailUIDto.commentDto = [];
				}
				var sId = detailPageModel.getProperty("/commentId");
				var cValue = detailPageModel.getProperty("/input");
				var aCommentSelected = detailPageModel.getData().invoiceDetailUIDto.commentDto;
				var aComItem = aCommentSelected.find(function (oRow, index) {
					return oRow.comment === cValue;
				});

				var aSelected = detailPageModel.getData().invoiceDetailUIDto.commentDto;
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
						"requestId": detailPageModelData.requestId,
						"comment": sValue,
						"createdBy": detailPageModelData.emailFrom,
						"createdAt": sDate,
						"updatedBy": null,
						"updatedAt": null,
						"user": detailPageModelData.emailFrom
					};
					var aEntries = detailPageModel.getData().invoiceDetailUIDto.commentDto;
					aEntries.unshift(oComment);
				}
				detailPageModel.setProperty("/commentId", "");
				this.getView().getModel("detailPageModel").refresh();
			},
			fnEditComment: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sPath = oEvent.getSource().getBindingContext("detailPageModel").getPath();
				var sId = detailPageModel.getProperty(sPath).commentId;
				var sValue = detailPageModel.getProperty(sPath).comment;
				detailPageModel.setProperty("/input", sValue);
				detailPageModel.setProperty("/commentId", sId);
				this.getView().getModel("detailPageModel").refresh();
			},
			fnDeleteComment: function (oEvent) {
				var sPath = oEvent.getSource().getBindingContext("detailPageModel").getPath();
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sId = detailPageModel.getProperty(sPath).commentId;
				var index = sPath.split("/").pop();
				detailPageModel.getData().invoiceDetailUIDto.commentDto.splice(index, 1);
				detailPageModel.refresh();
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
			fnDeleteAttachment: function (oEvent) {
				var sPath = oEvent.getSource().getBindingContext("detailPageModel").getPath();
				var detailPageModel = this.getView().getModel("detailPageModel");
				var sId = detailPageModel.getProperty(sPath).attachmentId;
				var index = sPath.split("/").pop();
				detailPageModel.getData().docManagerDto.splice(index, 1);
				detailPageModel.refresh();
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
			onNonPoSave: function () {
				var token = this.getCSRFToken();
				var oSaveData = this._fnOnSaveCall();
				var postingDate = oSaveData.invoiceHeader.postingDate;
				if (postingDate) {
					oSaveData = JSON.stringify(oSaveData);
					var that = this;
					var url = "InctureApDest/odataServices/updateNonPoInvoice";
					$.ajax({
						url: url,
						method: "POST",
						async: false,
						headers: {
							"X-CSRF-Token": token
						},
						contentType: 'application/json',
						dataType: "json",
						data: oSaveData,
						success: function (result, xhr, data) {
							var message = result.message;
							if (result.status === "Success") {
								sap.m.MessageBox.success(message, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										that.oRouter.navTo("Workbench");
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
					sap.m.MessageBox.error("Please Enter Posting Date!");
				}
			},
			fnGetRejectReason: function () {

				var mRejectModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(mRejectModel, "mRejectModel");
				var url = "InctureApDest/rejReason/getAll/EN";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {

						var aRejectData = data;
						mRejectModel.setProperty("/itemsData", aRejectData);
					},
					error: function (err) {
						// that._busyDialog.close();
						sap.m.MessageToast.show(err.statusText);
					}
				});
				return mRejectModel;
			},
			fnNonPoReject: function () {

				var mRejectModel = this.getView().getModel("mRejectModel");
				//this.getView().setModel(mRejectModel, "mRejectModel");
				var that = this;
				that.rejectDialog = sap.ui.xmlfragment("rejectDialog", "ui.incture.APTest.view.fragment.rejectDialog", that);
				that.rejectDialog.setModel(mRejectModel, "mRejectModel");
				that.rejectDialog.open();
				var url = "InctureApDest/rejReason/getAll/EN";
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: url,
					dataType: "json",
					async: true,
					success: function (data, textStatus, jqXHR) {
						var aRejectData = data;
						mRejectModel.setProperty("/items", aRejectData);

					},
					error: function (err) {
						sap.m.MessageToast.show(err.statusText);
					}
				});
			},
			onCloseReject: function () {
				this.rejectDialog.close();
			},
			onRejectCombo: function (oEvent) {

				var mRejectModel = this.getView().getModel("mRejectModel");
				var sText = oEvent.getParameter("selectedItem").getProperty("text");
				var sKey = oEvent.getParameter("selectedItem").getProperty("key");
				mRejectModel.setProperty("/Textvalue", sText);
				mRejectModel.setProperty("/Keyvalue", sKey);
			},

			onRejectConfirm: function () {

				var mRejectModel = this.getView().getModel("mRejectModel");
				var selKey = mRejectModel.getProperty("/selectedKey");
				if (selKey) {
					var detailPageModel = this.getView().getModel("detailPageModel"),
						detailPageModelData = detailPageModel.getData();
					var objectIsNew = jQuery.extend({}, detailPageModelData.invoiceDetailUIDto);
					objectIsNew.invoiceHeader.postingDate = objectIsNew.invoiceHeader.postingDate ? new Date(objectIsNew.invoiceHeader.postingDate).getTime() :
						null;
					objectIsNew.invoiceHeader.reasonForRejection = mRejectModel.getProperty("/Keyvalue");
					objectIsNew.invoiceHeader.rejectionText = mRejectModel.getProperty("/Textvalue");
					var jsonData = objectIsNew.invoiceHeader;
					var url = "InctureApDest/invoiceHeader/updateLifeCycleStatus";
					var that = this;
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
							var message = result.message;
							if (result.status === "Success") {
								mRejectModel.setProperty("/selectedKey", "");
								sap.m.MessageBox.success(message, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										that.oRouter.navTo("Workbench");
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
					sap.m.MessageBox.information("Please select Reason Code");
				}
			},

			onNonPoReject: function () {
				var detailPageModel = this.getView().getModel("detailPageModel");
				var token = this.getCSRFToken();
				var oRejectData = this._fnOnRejectCall();
				oRejectData = JSON.stringify(oRejectData);
				var that = this;
				var url = "InctureApDest/invoiceHeader/updateLifeCycleStatus";
				$.ajax({
					url: url,
					method: "PUT",
					async: false,
					headers: {
						"X-CSRF-Token": token
					},
					contentType: 'application/json',
					dataType: "json",
					data: oRejectData,
					success: function (result, xhr, data) {
						var message = result.message;
						if (result.status === "Success") {
							sap.m.MessageBox.success(message, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									that.oRouter.navTo("Inbox", {
										value: "abc"
									});
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
				detailPageModel.refresh();
			},
			onNonPoSubmit: function () {

				var token = this.getCSRFToken();
				var jsonData = this._fnOnSubmitCall();

				var binvAmt = false;
				var bVid = false;
				var bInv = false;
				var bInvdate = false;
				var bPostingdate = false;
				var bCostAllocation = false;
				if (jsonData.invoiceHeader.invoiceTotal) {
					binvAmt = true;
				} else {
					binvAmt = false;
					sap.m.MessageBox.error("Please Enter Invoice Amount!");
				}
				if (binvAmt) {
					if (jsonData.invoiceHeader.vendorId) {
						bVid = true;
					} else {
						bVid = false;
						sap.m.MessageBox.error("Please Enter Vendor ID!");
					}
				}
				if (binvAmt && bVid) {
					if (jsonData.invoiceHeader.extInvNum) {
						bInv = true;
					} else {
						bInv = false;
						sap.m.MessageBox.error("Please Enter Invoice NO!");
					}
				}
				if (binvAmt && bVid && bInv) {
					if (jsonData.invoiceHeader.invoiceDate) {
						bInvdate = true;
					} else {
						bInvdate = false;
						sap.m.MessageBox.error("Please Enter Invoice Date!");
					}
				}
				if (binvAmt && bVid && bInv && bInvdate) {
					if (jsonData.invoiceHeader.postingDate) {
						bPostingdate = true;
					} else {
						bPostingdate = false;
						sap.m.MessageBox.error("Please Enter Posting Date!");
					}
				}
				if (binvAmt && bVid && bInv && bInvdate && bPostingdate) {
					if (jsonData.costAllocation.length > 0) {
						bCostAllocation = true;
					} else {
						bCostAllocation = false;
						sap.m.MessageBox.error("Please Enter Cost Allocation Details!");
					}
				}

				if (binvAmt && bVid && bInv && bInvdate && bPostingdate && bCostAllocation) {
					//COST ALLOCATION VALIDATION START 
					var postDataModel = this.getView().getModel("postDataModel");
					var alistNonPoData = $.extend(true, [], postDataModel.getProperty("/listNonPoItem"));
					var bflag = true;
					for (var i = 0; i < alistNonPoData.length; i++) {
						//To handle validations
						var bValidate = false;
						if (alistNonPoData[i].glAccount === "" || alistNonPoData[i].glError === "Error") {
							bValidate = true;
							alistNonPoData[i].glError = "Error";
						}
						if (alistNonPoData[i].netValue === "" || alistNonPoData[i].amountError === "Error") {
							bValidate = true;
							alistNonPoData[i].amountError = "Error";
						}
						if (alistNonPoData[i].costCenter === "" || alistNonPoData[i].costCenterError === "Error") {
							bValidate = true;
							alistNonPoData[i].costCenterError = "Error";
						}
						if (alistNonPoData[i].itemText === "" || alistNonPoData[i].itemTextError === "Error") {
							bValidate = true;
							alistNonPoData[i].itemTextError = "Error";
						}
						if (bValidate) {
							bflag = false;
							continue;
						}
					}
					if (!bflag) {
						postDataModel.setProperty("/listNonPoItem", alistNonPoData);
						var sMsg = "Please Enter Required Fields G/L Account,Amount,Cost Center & Text!";
						sap.m.MessageBox.alert(sMsg);
						return;
					} else {
						//COST ALLOCATION VALIDATION END
						
						var postingDate = jsonData.invoiceHeader.postingDate;
						if (postingDate) {
							jsonData = JSON.stringify(jsonData);
							var that = this;
							var url = "InctureApDest/odataServices/saveNonPoInvoice";
							$.ajax({
								url: url,
								method: "POST",
								async: false,
								headers: {
									"X-CSRF-Token": token
								},
								contentType: "application/json",
								dataType: "json",
								data: jsonData,
								success: function (result, xhr, data) {
									var message = result.message;
									if (result.status === "Success") {
										sap.m.MessageBox.success(message, {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												that.oRouter.navTo("Workbench");
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
							sap.m.MessageBox.error("Please Enter Posting Date!");
						}
					}
				}

			},
			_fnOnSubmitCall: function (oEvent) {
				var detailPageModel = this.getView().getModel("detailPageModel"),
					detailPageModelData = detailPageModel.getData();
				var invoiceDate = detailPageModel.getProperty("/invoiceDetailUIDto/invoiceHeader/invoiceDate");

				var objectIsNew = jQuery.extend({}, detailPageModelData.invoiceDetailUIDto);
				var postDataModel = this.getView().getModel("postDataModel");
				objectIsNew.costAllocation = [];
				for (var i = 0; i < postDataModel.getData().listNonPoItem.length; i++) {
					var reqId = objectIsNew.invoiceHeader.requestId ? objectIsNew.invoiceHeader.requestId : null;
					var itemId = postDataModel.getData().listNonPoItem[i].itemId ? postDataModel.getData().listNonPoItem[i].itemId : null;
					objectIsNew.costAllocation.push({
						"requestId": reqId,
						"itemId": itemId,
						"serialNo": 0,
						"deleteInd": null,
						"quantity": "0.00",
						"distrPerc": null,
						"subNumber": null,
						"netValue": postDataModel.getData().listNonPoItem[i].netValue,
						"crDbIndicator": postDataModel.getData().listNonPoItem[i].crDbIndicator,
						"glAccount": postDataModel.getData().listNonPoItem[i].glAccount,
						"costCenter": postDataModel.getData().listNonPoItem[i].costCenter,
						"internalOrderId": postDataModel.getData().listNonPoItem[i].internalOrderIdId,
						"profitCenter": postDataModel.getData().listNonPoItem[i].profitCenter,
						"assetNo": null,
						"itemText": postDataModel.getData().listNonPoItem[i].itemText,
						"wbsElement": null
					});

				}

				if (objectIsNew.invoiceHeader.createdAt) {
					objectIsNew.invoiceHeader.createdAt = objectIsNew.invoiceHeader.createdAt.split("-").join("");
				}
				if (objectIsNew.invoiceHeader.invoiceDate) {
					objectIsNew.invoiceHeader.invoiceDate = objectIsNew.invoiceHeader.invoiceDate.split("-").join("");
				}
				objectIsNew.invoiceHeader.postingDate = objectIsNew.invoiceHeader.postingDate ? new Date(objectIsNew.invoiceHeader.postingDate).getTime() :
					null;
				var obj = {};

				obj.attachments = [];
				if (detailPageModel.getData().docManagerDto && detailPageModel.getData().docManagerDto.length > 0) {
					for (var n = 0; n < detailPageModel.getData().docManagerDto.length; n++) {
						obj.attachments.push(detailPageModel.getData().docManagerDto[n]);
					}
				}
				obj.commentDto = [];
				if (detailPageModel.getData().invoiceDetailUIDto.commentDto && detailPageModel.getData().invoiceDetailUIDto.commentDto.length > 0) {
					for (var k = 0; k < detailPageModel.getData().invoiceDetailUIDto.commentDto.length; k++) {
						obj.commentDto.push(detailPageModel.getData().invoiceDetailUIDto.commentDto[k]);
					}
				}
				obj.invoiceHeader = objectIsNew.invoiceHeader;
				obj.invoiceItems = objectIsNew.invoiceItems;
				obj.costAllocation = objectIsNew.costAllocation;
				return obj;
			},
			selectedValueTemplate: function (oEvent) {
				var templateData = this.getView().getModel("templateModel");
				var bUpdatedFlag = templateData.getProperty("/bUpdatedFlag");
				if (bUpdatedFlag) {
					var sTemplateNewname = oEvent.getSource().getProperty("value");
					templateData.setProperty("/sTemplateNewname", sTemplateNewname);
					templateData.setProperty("/bUpdatedFlag", false);
				} else {
					templateData.setProperty("/bSetUpdateTemp", true);
				}
				templateData.refresh();
			},
			openTaxDetails: function () {
				if (!this.taxDetails) {
					this.taxDetails = sap.ui.xmlfragment("ui.incture.APTest.view.fragments.tax", this);
					this.getView().addDependent(this.taxDetails);
				}
				var taxModel = this.getView().getModel("taxModel");
				this.taxDetails.setModel(taxModel, "taxModel");
				this.taxDetails.open();
			},
			taxDialogBtnPress: function () {
				this.taxDetails.close();
			},
			fnTaxCalculation: function () {
				var detailPageModel = this.getView().getModel("detailPageModel"),
					taxModel = this.getView().getModel("taxModel"),
					detailPageModelData = detailPageModel.getData().invoiceDetailUIDto.invoiceItems,
					taxValue = 0;
				for (var i = 0; i < detailPageModelData.length; i++) {
					if (detailPageModelData[i].isTwowayMatched) {
						var taxPValue = (parseFloat(detailPageModelData[i].taxPer) * (parseFloat(detailPageModelData[i].poNetPrice) / 100)).toFixed(3);
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
			}
		});
	});