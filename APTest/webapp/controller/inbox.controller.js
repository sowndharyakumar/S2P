sap.ui.define([
	"ui/incture/APTest/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"ui/incture/APTest/util/Formatter",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, Formatter, MessageBox) {
	"use strict";

	return BaseController.extend("ui.incture.APTest.controller.App", {
		onInit: function () {
			var oInboxModel = new JSONModel();
			this.getView().setModel(oInboxModel, "oInboxModel");
			oInboxModel.setSizeLimit(1000);
			var baseModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(baseModel, "baseModel");
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
			this.getInboxData(1);
			this.getProcessStatus();
			var taskDataFilterModel = new JSONModel();
			this.getView().setModel(taskDataFilterModel, "taskDataFilterModel");
			var paginatedModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(paginatedModel, "paginatedModel");
			var that = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(function (oEvent) {
				if (oEvent.getParameters().arguments.value && (oEvent.getParameters().arguments.value == "INVOICE" || oEvent.getParameters().arguments
						.value == "NONPO")) {
					taskDataFilterModel.setProperty("/invoiceType", oEvent.getParameters().arguments.value);
					// taskDataFilterModel.setProperty("/lifecycleStatus", "");
					that.onGo();
				} else if (oEvent.getParameters().arguments.value && !oEvent.getParameters().arguments.value.includes(".") && !oEvent.getParameters()
					.arguments.value.includes("-")) {
					// taskDataFilterModel.setProperty("/invoiceType", "");
					taskDataFilterModel.setProperty("/lifecycleStatus", oEvent.getParameters().arguments.value);
					that.onGo();
				} else if (oEvent.getParameters().arguments.vendor) {
					taskDataFilterModel.setProperty("/vendorName", oEvent.getParameters().arguments.vendor);
					that.onGo();
				} else if (oEvent.getParameters().arguments.value && oEvent.getParameters().arguments.value.includes(".")) {
					var value = oEvent.getParameters().arguments.value.split(".");
					var user = value[0];
					var count = value[1];
					var url = "InctureApDest/reports?user=" + user + "&days=" + count;
					jQuery
						.ajax({
							url: url,
							type: "GET",
							dataType: "json",
							success: function (result) {
								oInboxModel.setProperty("/workBoxDtos", result.agingReportDetails);
								oInboxModel.setProperty("/count", result.agingReportDetails.length);
								that.getView().byId("idPageNumberDiv").setVisible(false);
							}
						});
				} else {
					that.getInboxData(1);
				}
			});

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
		// getInboxData: function () {
		// 	this.getView().byId("inboxPageId").setBusy(true);
		// 	var oInboxModel = this.getView().getModel("oInboxModel");
		// 	var url = "InctureApDest/invoiceHeader/getAll";
		// 	jQuery
		// 		.ajax({
		// 			url: url,
		// 			type: "GET",
		// 			dataType: "json",
		// 			success: function (result) {
		// 				oInboxModel.setProperty("/workBoxDtos", result);
		// 				this.getView().byId("inboxPageId").setBusy(false);
		// 			}.bind(this),
		// 			error: function (e) {
		// 				oInboxModel.loadData("model/inbox.json", null, false);
		// 				this.getView().byId("inboxPageId").setBusy(false);
		// 			}.bind(this)
		// 		});
		// },
		getInboxData: function (pageNo) {
			this.getView().byId("inboxPageId").setBusy(true);
			pageNo = pageNo - 1;
			var oInboxModel = this.getView().getModel("oInboxModel");
			var url = "InctureApDest/invoiceHeader?pageNo=" + pageNo + "&limit=50";
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						oInboxModel.setProperty("/workBoxDtos", result.headerList);
						oInboxModel.setProperty("/count", result.count);
						oInboxModel.setProperty("/selectedPage", pageNo + 1);
						this.generatePagination();
						this.getView().byId("inboxPageId").setBusy(false);
					}.bind(this),
					error: function (e) {
						oInboxModel.loadData("model/inbox.json", null, false);
						this.getView().byId("inboxPageId").setBusy(false);
					}.bind(this)
				});
		},
		getProcessStatus: function () {
			var processModel = new sap.ui.model.json.JSONModel(),
				language = sap.ui.getCore().getConfiguration().getLanguage().split("-")[0].toUpperCase();
			this.getView().setModel(processModel, "processModel");
			var url = "InctureApDest/statusConfig/getAll/" + language;
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						processModel.setProperty("/items", result);
						this.getView().byId("inboxPageId").setBusy(false);
					}.bind(this),
					error: function (e) {}.bind(this)
				});
		},
		onRowSelect: function (oEvent) {
			this.getView().byId("inboxPageId").setBusy(true);
			var value = oEvent.getSource().getText();
			var invoiceType = oEvent.getSource().getBindingContext("oInboxModel").getObject().invoiceType;
			this.onClearFilter();
			if (invoiceType.toUpperCase() == "INVOICE") {
				this.getRouter().navTo("invoiceTask", {
					value: value
				});
			} else {
				this.getRouter().navTo("baseCoder", {
					value: value
				});
			}
			this.getView().byId("inboxPageId").setBusy(false);
		},
		onColumnSelect: function () {
			this.onClearFilter();
			this.getRouter().navTo("invoiceTask");
		},
		onNavToDashboard: function () {
			this.onClearFilter();
			this.oRouter.navTo("DashboardPage");
		},
		setGroup: function () {

		},
		generatePagination: function () {
			var oInboxModel = this.getView().getModel("oInboxModel");
			var totalTasks = oInboxModel.getData().count;
			var tasksPerPage = 50;
			this.getView().byId("idPrevButton").setEnabled(false);
			this.getView().byId("idNextButton").setEnabled(true);
			var pageCount = parseInt(totalTasks / tasksPerPage);
			if (totalTasks % tasksPerPage !== 0) {
				pageCount = pageCount + 1;
			}
			oInboxModel.setProperty("/numberOfPages", pageCount);
			var array = [];
			if (pageCount > 5) {
				pageCount = 5;
			} else {
				this.getView().byId("idNextButton").setEnabled(false);
			}
			for (var i = 1; i <= pageCount; i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			this.getView().getModel("paginatedModel").setProperty('/array', array);
			this.getView().byId("idCurrentPage").setText("Page : " + oInboxModel.getProperty("/selectedPage"));
			if (oInboxModel.getProperty("/numberOfPages") && parseInt(oInboxModel.getProperty("/numberOfPages")) > 1) {
				this.getView().byId("idPageNumberDiv").setVisible(true);
			} else {
				this.getView().byId("idPageNumberDiv").setVisible(false);
			}
		},

		/**
		 * Method is called when user clicks on the previous button in the pagination.
		 * @param: event - search event.
		 * @memberOf workbox.Details
		 */
		onScrollLeft: function () {
			this.getView().byId("idPrevButton").setEnabled(true);
			this.getView().byId("idNextButton").setEnabled(true);
			var oInboxModel = this.getView().getModel("oInboxModel");
			var paginatedData = this.getView().getModel("paginatedModel").getData().array;
			var selectedPage = parseInt(oInboxModel.getProperty("/selectedPage"));
			var startValue = parseInt(paginatedData[0].text);
			var startNumber = 1;
			var array = [];
			if ((startValue - 1) === 1) {
				startNumber = 1;
				this.getView().byId("idPrevButton").setEnabled(false);
			} else {
				startNumber = selectedPage - 3;
			}
			for (var i = startNumber; i <= (startNumber + 4); i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			this.getView().getModel("paginatedModel").setProperty('/array', array);
			oInboxModel.setProperty("/selectedPage", (parseInt(oInboxModel.getProperty("/selectedPage")) - 1));
			this.getInboxData(oInboxModel.getProperty("/selectedPage"));
		},

		/**
		 * Method is called when user clicks on the next button in the pagination.
		 * @memberOf workbox.Details
		 */
		onScrollRight: function () {
			this.getView().byId("idPrevButton").setEnabled(true);
			this.getView().byId("idNextButton").setEnabled(true);
			var oInboxModel = this.getView().getModel("oInboxModel");
			var paginatedData = this.getView().getModel("paginatedModel").getData().array;
			var selectedPage = parseInt(oInboxModel.getProperty("/selectedPage"));
			var startNumber = 1;
			var array = [];
			if (selectedPage > 2) {
				if ((selectedPage + 3) >= oInboxModel.getProperty("/numberOfPages")) {
					this.getView().byId("idNextButton").setEnabled(false);
					startNumber = parseInt(oInboxModel.getProperty("/numberOfPages")) - 4;
				} else {
					startNumber = selectedPage - 1;
				}
			} else {
				this.getView().byId("idPrevButton").setEnabled(false);
			}
			for (var i = startNumber; i <= (startNumber + 4); i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			this.getView().getModel("paginatedModel").setProperty('/array', array);
			oInboxModel.setProperty("/selectedPage", (parseInt(oInboxModel.getProperty("/selectedPage")) + 1));
			this.getInboxData(oInboxModel.getProperty("/selectedPage"));
		},

		/**
		 * Method is called when user clicks on the particular page number.
		 * @memberOf workbox.Details
		 */
		onPageClick: function (oEvent) {
			var selectedPage = oEvent.getSource().getText();
			this.getInboxData(selectedPage);
			this.getView().getModel("oInboxModel").setProperty("/selectedPage", selectedPage);
		},
		onClearFilter: function () {
			this.getView().byId("vendorInboxId").setValueState("None");
			var taskDataFilterModel = this.getView().getModel("taskDataFilterModel");
			taskDataFilterModel.setProperty("/filterRequestId", "");
			taskDataFilterModel.setProperty("/invoiceTotalFrom", "");
			taskDataFilterModel.setProperty("/invoiceTotalTo", "");
			taskDataFilterModel.setProperty("/dueDateFrom", "");
			taskDataFilterModel.setProperty("/dueDateTo", "");
			taskDataFilterModel.setProperty("/createdAtFrom", "");
			taskDataFilterModel.setProperty("/createdAtTo", "");
			taskDataFilterModel.setProperty("/invoiceNumber", "");
			taskDataFilterModel.setProperty("/status", "");
			taskDataFilterModel.setProperty("/assignedTo", "");
			taskDataFilterModel.setProperty("/vendorId", "");
			taskDataFilterModel.setProperty("/vendorName", "");
			taskDataFilterModel.setProperty("/lifecycleStatus", "");
			taskDataFilterModel.setProperty("/invoiceType", "");
			taskDataFilterModel.setProperty("/invNo", "");

			taskDataFilterModel.refresh();
		},
		onChangeInvoiceValue: function (oEvent) {
			var value = this.isNumber(oEvent);
			var tooltip = oEvent.getSource().getTooltip();
			var filterData = this.getView().getModel("taskDataFilterModel").getData();
			if (tooltip == "Invoice Value From") {
				filterData.invoiceTotalFrom = value;
			} else if (tooltip == "Invoice Value To") {
				filterData.invoiceTotalTo = value;
			}
		},
		onVendorSelected: function (oEvent) {
			var taskDataFilterModel = this.getView().getModel("taskDataFilterModel");
			taskDataFilterModel.setProperty("/vendorId", oEvent.getParameters().selectedRow.mAggregations.cells[0].mProperties.text);
			taskDataFilterModel.setProperty("/vendorName", oEvent.getParameters().selectedRow.mAggregations.cells[1].mProperties.text);
			this.vendorFlag = true;
		},
		chkSelectedVendor: function (oEvent) {
			if (this.vendorFlag) {
				oEvent.getSource().setValueState("None");
			} else {
				oEvent.getSource().setValue("").setValueState("Error");
			}
		},
		searchVendorId: function (oEvent) {
			oEvent.getSource().setValueState("None");
			this.vendorFlag = false;
			var searchVendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(searchVendorModel, "suggestionModel");
			var value = oEvent.getParameter("suggestValue").trim();
			if (value && value.length > 2) {
				var url = "DEC_NEW/sap/opu/odata/sap/ZAP_VENDOR_SRV/VendSearchSet?$filter=SearchString eq '" + value + "'";
				searchVendorModel.loadData(url, null, true);
				searchVendorModel.attachRequestCompleted(null, function () {
					searchVendorModel.refresh();
				});
			}
		},
		isNumber: function (oEvent) {
			var input = oEvent.getSource().getValue();
			if (input) {
				if (!input.match(/^\d*(\.\d*)?$/)) {
					if (input.length < 2) {
						oEvent.getSource()._lastValue = "";
						oEvent.getSource().setValue("");
						input = "";
					} else {
						input = oEvent.getSource()._lastValue;
						oEvent.getSource().setValue(input);
					}
				} else {
					oEvent.getSource()._lastValue = input;
				}
				return input;
			} else {
				return "";
			}
		},
		validateFilters: function (taskDataFilterModel) {
			var filterData = this.getView().getModel("taskDataFilterModel").getData();
			var invDateFrom = filterData.createdAtFrom;
			var invDateTo = filterData.createdAtTo;
			var dueDateFrom = filterData.dueDateFrom;
			var dueDateTo = filterData.dueDateTo;
			var vendor = filterData.vendor;
			var filterCraetedBy = filterData.filterCraetedBy;
			var invValFrom = filterData.invoiceTotalFrom;
			var invValTo = filterData.invoiceTotalTo;
			var assignedTo = filterData.assignedTo;
			var invNo = filterData.invNo;
			var invoiceType = filterData.invoiceType;
			// var selectedVendor = oDefaultDataModel.getProperty("/VendorSelected");
			// var selectedCreatedBy = oDefaultDataModel.getProperty("/CreatedBySelected");
			// var selectedAssigned = oDefaultDataModel.getProperty("/selectedAssigned");
			if ((!invDateFrom || invDateFrom == "") && (invDateTo && invDateTo != "")) {
				sap.m.MessageToast.show("Fill Invoice From Date");
				return false;
			}
			if ((invDateFrom && invDateFrom != "") && (!invDateTo || invDateTo == "")) {
				sap.m.MessageToast.show("Fill Invoice To Date");
				return false;
			}
			if ((!dueDateFrom || dueDateFrom == "") && (dueDateTo && dueDateTo != "")) {
				sap.m.MessageToast.show("Fill Due From Date");
				return false;
			}
			if ((dueDateFrom && dueDateFrom != "") && (!dueDateTo || dueDateTo == "")) {
				sap.m.MessageToast.show("Fill Due To Date");
				return false;
			}
			if ((!invValFrom || invValFrom == "") && (invValTo && invValTo != "")) {
				sap.m.MessageToast.show("Fill Invoice From Value");
				return false;
			}
			if ((invValFrom && invValFrom != "") && (!invValTo || invValTo == "")) {
				sap.m.MessageToast.show("Fill Invoice To Value");
				return false;
			}
			if (invValFrom && invValFrom != "" && invValTo && invValTo != "") {
				if (parseFloat(invValFrom) > parseFloat(invValTo)) {
					sap.m.MessageToast.show("Invoice Value From cannot be greater than Invoice Value To");
					invValTo = "";
					return false;
				}
			}
			// if ((vendor && vendor != "") && (vendor != selectedVendor)) {
			// 	sap.m.MessageToast.show("Select VendorID from suggestions");
			// 	return false;
			// }
			// if ((assignedTo && assignedTo != "") && (assignedTo != selectedAssigned)) {
			// 	sap.m.MessageToast.show("Select Assigned To from suggestions");
			// 	return false;
			// }
			if ((filterCraetedBy && filterCraetedBy != "") && (filterCraetedBy != selectedCreatedBy)) {
				sap.m.MessageToast.show("Select Created By from suggestions");
				return false;
			}
			if (!taskDataFilterModel.getProperty("/filterRequestId") &&
				!taskDataFilterModel.getProperty("/invoiceTotalFrom") &&
				!taskDataFilterModel.getProperty("/invoiceTotalTo") &&
				!taskDataFilterModel.getProperty("/dueDateFrom") &&
				!taskDataFilterModel.getProperty("/dueDateTo") &&
				!taskDataFilterModel.getProperty("/createdAtFrom") &&
				!taskDataFilterModel.getProperty("/createdAtTo") &&
				!taskDataFilterModel.getProperty("/invNo") &&
				!taskDataFilterModel.getProperty("/status") &&
				!taskDataFilterModel.getProperty("/assignedTo") &&
				!taskDataFilterModel.getProperty("/vendorId") &&
				!taskDataFilterModel.getProperty("/invoiceType") &&
				!taskDataFilterModel.getProperty("/vendorName") &&
				!taskDataFilterModel.getProperty("/lifecycleStatus")
			) {
				this.getInboxData(1);
				return false;
			}
			return true;
		},

		onDateRangeChange: function (oEvent) {
			if (oEvent) {
				var value = oEvent.getSource().getValue();
			}
			var filterData = this.getView().getModel("taskDataFilterModel").getData();
			var invDateFrom, invDateTo, dueDateFrom, dueDateTo;
			invDateFrom = filterData.createdAtFrom;
			invDateTo = filterData.createdAtTo;
			dueDateFrom = filterData.dueDateFrom;
			dueDateTo = filterData.dueDateTo;
			if (invDateFrom && invDateFrom != "" && invDateTo && invDateTo != "") {
				if (invDateFrom > invDateTo) {
					sap.m.MessageToast.show("Invoice From Date cannot be greater than Invoice To Date");
					if (oEvent) {
						oEvent.getSource().setValue();
					}
					return false;
				}
			}
			if (dueDateFrom && dueDateFrom != "" && dueDateTo && dueDateTo != "") {
				if (dueDateFrom > dueDateTo) {
					sap.m.MessageToast.show("Due From Date cannot be greater than Due To Date");
					if (oEvent) {
						oEvent.getSource().setValue();
					}
					return false;
				}
			}
			// if (invDateFrom && invDateFrom != "" && dueDateFrom && dueDateFrom != ""){
			// 	if (invDateFrom > dueDateFrom) {
			// 		sap.m.MessageToast.show("Invoice From Date cannot be greater than Due From Date");
			// 		if (oEvent) {
			// 			oEvent.getSource().setValue();
			// 		}
			// 		return false;
			// 	}
			// }
		},
		onFilterExpand: function (oEvent) {
			this.getView().byId("apInboxId").removeStyleClass("inboxTableCls");
			this.getView().byId("apInboxId").removeStyleClass("filterInboxTableCls");
			if (oEvent.getSource().getExpanded())
				this.getView().byId("apInboxId").addStyleClass("inboxTableCls");
			else
				this.getView().byId("apInboxId").addStyleClass("filterInboxTableCls");
		},
		onGo: function () {
			var taskDataFilterModel = this.getView().getModel("taskDataFilterModel"),
				taskDataFilterModelData = taskDataFilterModel.getData(),
				oInboxModel = this.getView().getModel("oInboxModel");
			if (this.validateFilters(taskDataFilterModel)) {
				this.getView().byId("inboxPageId").setBusy(true);
				var obj = {
					"requestId": taskDataFilterModelData.filterRequestId,
					"invoiceTotalFrom": taskDataFilterModelData.invoiceTotalFrom,
					"invoiceTotalTo": taskDataFilterModelData.invoiceTotalTo,
					"createdAtFrom": taskDataFilterModelData.createdAtFrom,
					"createdAtTo": taskDataFilterModelData.createdAtTo,
					"dueDateFrom": taskDataFilterModelData.dueDateFrom,
					"dueDateTo": taskDataFilterModelData.dueDateTo,
					"extInvNum": taskDataFilterModelData.invNo,
					"taskStatus": taskDataFilterModelData.status,
					"assignedTo": taskDataFilterModelData.assignedTo,
					"vendorId": taskDataFilterModelData.vendorId,
					"vendorName": taskDataFilterModelData.vendorName,
					"invoiceType": taskDataFilterModelData.invoiceType,
					"lifecycleStatus": taskDataFilterModelData.lifecycleStatus
				};
				var url = "InctureApDest/invoiceHeader/getForFilter";
				jQuery
					.ajax({
						url: url,
						dataType: "json",
						data: JSON.stringify(obj),
						contentType: "application/json",
						type: "POST",
						beforeSend: function (xhr) {
							var token = this.getCSRFToken();
							xhr.setRequestHeader("X-CSRF-Token", token);
							xhr.setRequestHeader("Accept", "application/json");

						}.bind(this),
						success: function (result) {
							oInboxModel.setProperty("/workBoxDtos", result.invoiceHeaderDtos);
							if (result.invoiceHeaderDtos)
								oInboxModel.setProperty("/count", result.invoiceHeaderDtos.length);
							this.getView().byId("idPageNumberDiv").setVisible(false);
							this.getView().byId("inboxPageId").setBusy(false);
						}.bind(this),
						error: function (e) {
							MessageBox.error(e.message);
							this.getView().byId("inboxPageId").setBusy(false);
						}.bind(this)
					});
			}
		}
	});
});