sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("ui.incture.APTest.controller.View1", {
		onInit: function () {
			// var reportModel = new sap.ui.model.json.JSONModel("model/aging.json");
			// this.getView().setModel(reportModel, "reportModel");
			$("#splash-screen").remove();
			var areajson = new sap.ui.model.json.JSONModel("model/area.json");
			this.getView().setModel(areajson, "areajson");
			var barDatajson = new sap.ui.model.json.JSONModel("model/bar.json");
			this.getView().setModel(barDatajson, "barDatajson");
			var barDatjson = new sap.ui.model.json.JSONModel("model/bar1.json");
			this.getView().setModel(barDatjson, "barDatjson");
			var totalInvjson = new sap.ui.model.json.JSONModel("model/totalInv.json");
			this.getView().setModel(totalInvjson, "totalInvjson");
			var oNewInboxModel = new sap.ui.model.json.JSONModel("model/tableData.json");
			this.getView().setModel(oNewInboxModel, "oNewInboxModel");
			oNewInboxModel.setSizeLimit(1000);
			var oInboxModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oInboxModel, "oInboxModel");
			oInboxModel.setSizeLimit(1000);
			var frame = this.getView().byId("oBarFrame"),
				scales = [{
					'feed': 'color',
					'palette': ['#9bbc5a']
				}];
			frame.setVizScales(scales);
			this.table = sap.ui.xmlfragment("ui.incture.APTest.view.fragments.inboxTable", this);
			this.getView().addDependent(this.table);
			// this.fnSessionManagement();
			this.table.setModel(oInboxModel, "oInboxModel");
			var that = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// var url = window.location.href;
			// if (url.includes("Action")) {
			// 	if (url.split("?")[1].split("Action-")[1] == "workbench")
			// 		that.oRouter.navTo("Workbench");
			// 		return;
			// }
			if (sap.ushell) {
				//The Unified Shell's internal URL parsing service
				var oURLParsing = new sap.ushell.services.URLParsing();
				//Display and action Find_And_Replace-findandreplace
				var url = oURLParsing.getHash(location.href);
				var oShellHash = oURLParsing.parseShellHash(url);
				if (oShellHash.Action === "workbench") {
					that.oRouter.navTo("Workbench");
					return;
				}
			}
			this.oRouter.attachRoutePatternMatched(function (oEvent) {
				that.getAgingData();
			});

			var url = "SPUserDetails/v1/sayHello";
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {

					}
				});
			jQuery
				.ajax({
					url: " DEC_NEW/sap/opu/odata/sap/ZDKSH_CC_INVENTORY_HDRLOOKUP_SRV/ZSearchHelp_PlantSet",
					type: "GET",
					dataType: "json",
					success: function (result) {

					}
				});

			this.getInboxData();
			this.getExceptionData();
			this.getAgingData();
			// this.getPendingData();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},
		// ondonut: function () {
		// 	var options = {
		// 		series: [],
		// 		chart: {
		// 			width: 380,
		// 			type: 'donut',
		// 		},
		// 		dataLabels: {
		// 			enabled: false
		// 		},
		// 		fill: {
		// 			type: 'gradient',
		// 		},
		// 		responsive: [{
		// 			breakpoint: 480,
		// 			options: {
		// 				chart: {
		// 					width: 200
		// 				},
		// 				legend: {
		// 					position: 'bottom'
		// 				}
		// 			}
		// 		}]
		// 	};

		// 	var chart = new ApexCharts(document.querySelector("#donutId"), options);
		// 	var url = "InctureApDest/invoiceHeader/statusCount";
		// 	jQuery
		// 		.ajax({
		// 			url: url,
		// 			type: "GET",
		// 			dataType: "json",
		// 			success: function (result) {
		// 				var a=[],b=[];
		// 				for(var i=0;i<result.length;i++){
		// 					a.push(result[i].count);
		// 					b.push(result[i].status);
		// 				}
		// 				chart.updateSeries([{
		// 					name: a,
		// 					data: b
		// 				}]);
		// 			}
		// 		});
		// 	chart.render();
		// },
		getExceptionData: function () {
			var sampleDatajson = new sap.ui.model.json.JSONModel(); //"model/data.json"
			this.getView().setModel(sampleDatajson, "sampleDatajson");
			// sampleDatajson.loadData("model/donut.json", null, false);
			var url = "InctureApDest/invoiceHeader/statusCount";
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						sampleDatajson.setProperty("/items", result);

					}
				});
		},
		getAgingData: function () {
			var reportModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(reportModel, "reportModel");
			var url = "InctureApDest/reports/getAgingReportsCount";
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						reportModel.setData(result);
						reportModel.refresh();
					}
				});
		},
		getPendingData: function () {
			var barDatajson = new sap.ui.model.json.JSONModel();
			this.getView().setModel(barDatajson, "barDatajson");
			var url = "InctureApDest/reports/getPendingInvoiceCount";
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						barDatajson.setData(result);
						barDatajson.refresh();
					}
				});
		},
		getInboxData: function () {
			var url = "InctureApDest/invoiceHeader/getAll";
			jQuery
				.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function (result) {
						var oDashboardModel = new sap.ui.model.json.JSONModel();
						this.getView().setModel(oDashboardModel, "oDashboardModel");
						oDashboardModel.getData().workBoxDtos = result;
						var a = 0,
							b = 0;
						// var count = 0;
						// var sampleDatajson = new sap.ui.model.json.JSONModel(); //"model/data.json"
						// sampleDatajson.loadData("InctureApDest/invoiceHeader/statusCount")
						// this.getView().setModel(sampleDatajson, "sampleDatajson");
						// sampleDatajson.getData().newitems = [];
						for (var i = 0; i < oDashboardModel.getData().workBoxDtos.length; i++) {
							if (oDashboardModel.getData().workBoxDtos[i].invoiceType && oDashboardModel.getData().workBoxDtos[i].invoiceType.toUpperCase() ==
								"INVOICE")
								oDashboardModel.getData().poInvoice = ++a;
							else
								oDashboardModel.getData().nonpoInvoice = ++b;

							// sampleDatajson.getData().newitems.push({
							// 	"status": oDashboardModel.getData().workBoxDtos[i].lifecycleStatusText
							// });
						}
						// sampleDatajson.getData().items = [];
						// for (var i = 0; i < sampleDatajson.getData().newitems.length; i++) {
						// 	if (sampleDatajson.getData().newitems[i].status) {
						// 		if (sampleDatajson.getData().items.length == 0) {
						// 			sampleDatajson.getData().items.push({
						// 				"task": sampleDatajson.getData().newitems[i].status,
						// 				"count": 1
						// 			});
						// 		} else {
						// 			var flag = false;
						// 			for (var j = 0; j < sampleDatajson.getData().items.length; j++) {
						// 				if (sampleDatajson.getData().items[j].task == sampleDatajson.getData().newitems[i].status) {
						// 					flag = true;
						// 					var index = j;
						// 				}
						// 			}
						// 			if (flag == true) {
						// 				sampleDatajson.getData().items[index].count = sampleDatajson.getData().items[index].count + 1;
						// 			} else {
						// 				sampleDatajson.getData().items.push({
						// 					"task": sampleDatajson.getData().newitems[i].status,
						// 					"count": 1
						// 				});
						// 			}
						// 		}
						// 	}
						// }
						oDashboardModel.refresh();
						// sampleDatajson.refresh();
					}.bind(this),
					error: function (e) {
						sap.m.MessageToast.show(e.responseText);
					}.bind(this)
				});
		},
		onNavToInbox: function () {
			this.oRouter.navTo("Workbench");
		},
		onNavToEinvoice: function () {
			this.oRouter.navTo("Process");
		},
		onNavToPaymentRequest: function () {
			this.oRouter.navTo("paymentRequest");
		},

		// onLink: function (oEvent) {
		// 	var oInboxModel = this.getView().getModel("oInboxModel");
		// 	var index = oEvent.getSource().getText();
		// 	var objectIsNew = jQuery.extend([], this.getView().getModel("oNewInboxModel").getProperty("/workBoxDtos"));
		// 	oInboxModel.setProperty("/workBoxDtos", objectIsNew.splice(0, index));
		// 	this.getView().byId("linkId").setVisible(true);
		// 	this.getView().byId("graphId").setVisible(false);
		// 	this.getView().byId("chartId").setVisible(false);
		// 	this.getView().byId("agingId").setVisible(false);
		// },
		onLinkPressPo: function (oEvent) {
			this.oRouter.navTo("Inbox1", {
				value: "INVOICE"
			});
		},
		onLinkPressNonpo: function (oEvent) {
			this.oRouter.navTo("Inbox1", {
				value: "NONPO"
			});
		},
		onClickBarData: function (oEvent) {
			var value = oEvent.mParameters.data[0].data.Vendor;
			this.oRouter.navTo("Inbox", {
				vendor: value
			});
		},
		onClickDonutData: function (oEvent) {
			var value = oEvent.getParameters().data[0].data.status,
				sValue;
			switch (value) {
			case "Open":
				sValue = "01";
				break;
			case "Full Matched":
				sValue = "02";
				break;
			case "Partial Matched":
				sValue = "03";
				break;
			case "MisMatched":
				sValue = "04";
				break;
			case "ThreeWayMatched":
				sValue = "05";
				break;
			case "ThreeWayMisMatched":
				sValue = "06";
				break;
			case "Balance Mismatched":
				sValue = "07";
				break;
			case "ReadyToPost":
				sValue = "08";
				break;
			case "SAP Posting Success":
				sValue = "09";
				break;
			case "SAP Posting Failed":
				sValue = "10";
				break;
			case "No -GRN":
				sValue = "11";
				break;
			case "Partial GRN":
				sValue = "12";
				break;
			case "No-PO":
				sValue = "13";
				break;
			case "URM Mismatch":
				sValue = "14";
				break;
			case "Rejected":
				sValue = "15";
				break;
			case "GRN Complete":
				sValue = "16";
				break;
			case "Two Way Matched":
				sValue = "17";
				break;
			case "Two Way MisMatched":
				sValue = "18";
				break;
			}
			this.oRouter.navTo("Inbox1", {
				value: sValue
			});
			// var chart = this.getView().byId("barChart");
			// var chart1 = this.getView().byId("oBarFrame");
			// var chart2 = this.getView().byId("agingChart");
			// var chart3 = this.getView().byId("columnChart");
			// var chart4 = this.getView().byId("areaChart");
			// chart.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart1.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart2.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart3.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart4.vizSelection([], {
			// 	"clearSelection": true
			// });
			// this.getData(oEvent);
			// this.getView().byId("graphId").setVisible(true);
			// this.getView().byId("linkId").setVisible(false);
			// this.getView().byId("chartId").setVisible(false);
			// this.getView().byId("agingId").setVisible(false);
		},
		// onClickBarData: function (oEvent) {
		// 	var chart = this.getView().byId("oDonutChart");
		// 	var chart1 = this.getView().byId("oBarFrame");
		// 	var chart2 = this.getView().byId("agingChart");
		// 	var chart3 = this.getView().byId("columnChart");
		// 	var chart4 = this.getView().byId("areaChart");
		// 	chart.vizSelection([], {
		// 		"clearSelection": true
		// 	});
		// 	chart1.vizSelection([], {
		// 		"clearSelection": true
		// 	});
		// 	chart2.vizSelection([], {
		// 		"clearSelection": true
		// 	});
		// 	chart3.vizSelection([], {
		// 		"clearSelection": true
		// 	});
		// 	chart4.vizSelection([], {
		// 		"clearSelection": true
		// 	});
		// 	this.getData(oEvent);
		// 	this.getView().byId("graphId").setVisible(true);
		// 	this.getView().byId("linkId").setVisible(false);
		// 	this.getView().byId("chartId").setVisible(false);
		// 	this.getView().byId("agingId").setVisible(false);
		// },
		onClickNBarData: function (oEvent) {
			var chart = this.getView().byId("barChart");
			var chart1 = this.getView().byId("oDonutChart");
			var chart2 = this.getView().byId("agingChart");
			var chart3 = this.getView().byId("columnChart");
			var chart4 = this.getView().byId("areaChart");
			chart.vizSelection([], {
				"clearSelection": true
			});
			chart1.vizSelection([], {
				"clearSelection": true
			});
			chart2.vizSelection([], {
				"clearSelection": true
			});
			chart3.vizSelection([], {
				"clearSelection": true
			});
			chart4.vizSelection([], {
				"clearSelection": true
			});
			this.getData(oEvent);
			this.getView().byId("graphId").setVisible(false);
			this.getView().byId("linkId").setVisible(false);
			this.getView().byId("chartId").setVisible(true);
			this.getView().byId("agingId").setVisible(false);
		},
		getData: function (oEvent) {
			var index = oEvent.getParameters("data").data[0].data.count;
			if (!index)
				var index = oEvent.getParameters("data").data[0].data[oEvent.getParameters("data").data[0].data.measureNames];
			var oInboxModel = this.getView().getModel("oInboxModel");
			var objectIsNew = jQuery.extend([], this.getView().getModel("oNewInboxModel").getProperty("/workBoxDtos"));
			oInboxModel.setProperty("/workBoxDtos", objectIsNew.splice(0, index));
		},
		onClickAging: function (oEvent) {
			var user = oEvent.getParameters("data").data[0].data.User,
				count;
			if (oEvent.getParameters("data").data[0].data.measureNames == "overDue")
				count = -1;
			else if (oEvent.getParameters("data").data[0].data.measureNames == ">28 days")
				count = 1;
			else
				count = oEvent.getParameters("data").data[0].data.measureNames.split(" ")[0].split("+")[1];
			var sValue = user + "." + count;
			this.oRouter.navTo("Inbox1", {
				value: sValue
			});
			// var chart = this.getView().byId("barChart");
			// var chart1 = this.getView().byId("oBarFrame");
			// var chart2 = this.getView().byId("oDonutChart");
			// var chart3 = this.getView().byId("columnChart");
			// var chart4 = this.getView().byId("areaChart");
			// chart.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart1.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart2.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart3.vizSelection([], {
			// 	"clearSelection": true
			// });
			// chart4.vizSelection([], {
			// 	"clearSelection": true
			// });
			// this.getData(oEvent);
			// this.getView().byId("graphId").setVisible(false);
			// this.getView().byId("linkId").setVisible(false);
			// this.getView().byId("chartId").setVisible(false);
			// this.getView().byId("agingId").setVisible(true);
		},
		onClickColumn: function (oEvent) {
			var chart = this.getView().byId("barChart");
			var chart1 = this.getView().byId("oBarFrame");
			var chart2 = this.getView().byId("agingChart");
			var chart3 = this.getView().byId("oDonutChart");
			var chart4 = this.getView().byId("areaChart");
			chart.vizSelection([], {
				"clearSelection": true
			});
			chart1.vizSelection([], {
				"clearSelection": true
			});
			chart2.vizSelection([], {
				"clearSelection": true
			});
			chart3.vizSelection([], {
				"clearSelection": true
			});
			chart4.vizSelection([], {
				"clearSelection": true
			});
			this.getData(oEvent);
			this.getView().byId("graphId").setVisible(false);
			this.getView().byId("linkId").setVisible(false);
			this.getView().byId("chartId").setVisible(true);
			this.getView().byId("agingId").setVisible(false);
		},
		onClickArea: function (oEvent) {
				var chart = this.getView().byId("barChart");
				var chart1 = this.getView().byId("oBarFrame");
				var chart2 = this.getView().byId("agingChart");
				var chart3 = this.getView().byId("columnChart");
				var chart4 = this.getView().byId("oDonutChart");
				chart.vizSelection([], {
					"clearSelection": true
				});
				chart1.vizSelection([], {
					"clearSelection": true
				});
				chart2.vizSelection([], {
					"clearSelection": true
				});
				chart3.vizSelection([], {
					"clearSelection": true
				});
				chart4.vizSelection([], {
					"clearSelection": true
				});
				this.getData(oEvent);
				this.getView().byId("graphId").setVisible(false);
				this.getView().byId("linkId").setVisible(false);
				this.getView().byId("chartId").setVisible(true);
				this.getView().byId("agingId").setVisible(false);
			}
			// frame.setVizProperties(properties);
			// var donutChart = this.getView().byId("idDonutChart");
			// onAfterRendering: function () {
			// 	//Semi-circle gauges
			// 	new JustGage({
			// 		id: this.getView().byId("id_Gauge2").sId,
			// 		value: 6,
			// 		min: 0,
			// 		max: 10,
			// 		title: "Invoices without Exceptions",
			// 		view: this.oView,
			// 		size: 900,
			// 	});
			// 	new JustGage({
			// 		id: this.getView().byId("id_Gauge3").sId,
			// 		value: 10,
			// 		min: 0,
			// 		max: 10,
			// 		title: "Process Count",
			// 		view: this.oView,
			// 		size: 900,
			// 	});
			// }

		//Semi-circle gauges

	});
});