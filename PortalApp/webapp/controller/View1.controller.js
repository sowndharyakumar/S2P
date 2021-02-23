sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (jQuery, MessageToast, Controller, Log, JSONModel, Device) {
	"use strict";

	return Controller.extend("ui.incture.PortalApp.controller.View1", {
		onInit: function () {
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oDeviceModel, "device");
			var baseModel = new JSONModel({
				"dashboard": true,
				"returns": false,
				"po": false,
				"invoice": false,
				"inventory": false,
				"poApproval": false,
				"Onboarding": false,
				"fullScreen": true,
				"exitFullScreen": false,
				"EN": true,
				"ES": false,
				"TH": false
			});
			this.getView().setModel(baseModel, "baseModel");
		},
		onIconChange: function (oEvent) {
			var baseModel = this.getView().getModel("baseModel");
			baseModel.getData().dashboard = false;
			baseModel.getData().returns = false;
			baseModel.getData().po = false;
			baseModel.getData().invoice = false;
			baseModel.getData().inventory = false;
			baseModel.getData().Onboarding = false;
			baseModel.getData().poApproval = false;
			if (oEvent.getSource().getSelectedKey() == "Dashboard") {
				baseModel.getData().dashboard = true;
			} else if (oEvent.getSource().getSelectedKey() == "Returns") {
				baseModel.getData().returns = true;
				baseModel.getData().exitFullScreen = this.getSplitContObj().getMode() == "HideMode" ? true : false;
				baseModel.getData().fullScreen = this.getSplitContObj().getMode() == "ShowHideMode" ? true : false;
			} else if (oEvent.getSource().getSelectedKey() == "po") {
				baseModel.getData().po = true;
				baseModel.getData().exitFullScreen = this.getReturns().getMode() == "HideMode" ? true : false;
				baseModel.getData().fullScreen = this.getReturns().getMode() == "ShowHideMode" ? true : false;
			} else if (oEvent.getSource().getSelectedKey() == "Invoice") {
				baseModel.getData().invoice = true;
				baseModel.getData().exitFullScreen = this.getInvoice().getMode() == "HideMode" ? true : false;
				baseModel.getData().fullScreen = this.getInvoice().getMode() == "ShowHideMode" ? true : false;
			} else if (oEvent.getSource().getSelectedKey() == "Inventory") { 
				baseModel.getData().inventory = true;
				baseModel.getData().exitFullScreen = this.getInventory().getMode() == "HideMode" ? true : false;
				baseModel.getData().fullScreen = this.getInventory().getMode() == "ShowHideMode" ? true : false;
			}
			 else if (oEvent.getSource().getSelectedKey() == "Onboarding") { 
				baseModel.getData().Onboarding = true;
			}
			 else if (oEvent.getSource().getSelectedKey() == "poApproval") { 
				baseModel.getData().poApproval = true;
			}
			baseModel.refresh();
		},
		onFullScreen: function () {
			var baseModel = this.getView().getModel("baseModel");
			if (baseModel.getData().returns)
				this.byId("SplitContDemo").setMode("HideMode");
			else if (baseModel.getData().po)
				this.byId("poId").setMode("HideMode");
			if (baseModel.getData().invoice)
				this.byId("invoiceId").setMode("HideMode");
			if (baseModel.getData().inventory)
				this.byId("inventoryId").setMode("HideMode");
			baseModel.getData().fullScreen = false;
			baseModel.getData().exitFullScreen = true;
			baseModel.refresh();
		},
		onExitFullScreen: function () {
			var baseModel = this.getView().getModel("baseModel");
			if (baseModel.getData().returns)
				this.byId("SplitContDemo").setMode("ShowHideMode");
			else if (baseModel.getData().po)
				this.byId("poId").setMode("ShowHideMode");
			if (baseModel.getData().invoice)
				this.byId("invoiceId").setMode("ShowHideMode");
			if (baseModel.getData().inventory)
				this.byId("inventoryId").setMode("ShowHideMode");
			baseModel.getData().fullScreen = true;
			baseModel.getData().exitFullScreen = false;
			baseModel.refresh();
		},
		onAfterRendering: function () {
			// var oSplitCont = this.getSplitContObj(),
			// 	ref = oSplitCont.getDomRef() && oSplitCont.getDomRef().parentNode;
			// // set all parent elements to 100% height, this should be done by app developer, but just in case
			// if (ref && !ref._sapUI5HeightFixed) {
			// 	ref._sapUI5HeightFixed = true;
			// 	while (ref && ref !== document.documentElement) {
			// 		var $ref = jQuery(ref);
			// 		if ($ref.attr("data-sap-ui-root-content")) { // Shell as parent does this already
			// 			break;
			// 		}
			// 		if (!ref.style.height) {
			// 			ref.style.height = "100%";
			// 		}
			// 		ref = ref.parentNode;
			// 	}
			// }
		},

		onPressNavToDetail: function () {
			this.getSplitContObj().to(this.createId("detailDetail"));
		},

		onPressDetailBack: function () {
			this.getSplitContObj().backDetail();
		},

		onPressMasterBack: function () {
			this.getSplitContObj().backMaster();
		},

		onPressGoToMaster: function () {
			this.getSplitContObj().toMaster(this.createId("master2"));
		},

		onListItemPress: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			this.getSplitContObj().toDetail(this.createId(sToPageId));
		},
		onListItemPress1: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			this.getReturns().toDetail(this.createId(sToPageId));
		},
		onListItemPress2: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			this.getInventory().toDetail(this.createId(sToPageId));
		},
		onListItemPress3: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			this.getInvoice().toDetail(this.createId(sToPageId));
		},
		onPressModeBtn: function (oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

			this.getSplitContObj().setMode(sSplitAppMode);
			MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, {
				duration: 5000
			});
		},
		fnOpenLanguageDialog: function () {
			if (!this.settings) {
				this.settings = sap.ui.xmlfragment("ui.incture.PortalApp.view.settings", this);
				this.getView().addDependent(this.settings);
			}
			this.settings.open();
		},
		onCloseSettings: function () {
			this.settings.close();
		},
		onLanguageSelection: function (oEvent) {
			this.getView().getModel("baseModel").setProperty("/EN", false);
			this.getView().getModel("baseModel").setProperty("/TH", false);
			this.getView().getModel("baseModel").setProperty("/ES", false);
			var lang = sap.ui.getCore().byId("selectId").getSelectedKey();
			if (lang == "English")
				this.getView().getModel("baseModel").setProperty("/EN", true);
			else if (lang == "Thai")
				this.getView().getModel("baseModel").setProperty("/TH", true);
			else if (lang == "Spanish")
				this.getView().getModel("baseModel").setProperty("/ES", true);
			this.settings.close();
		},

		getSplitContObj: function () {
			var result = this.byId("SplitContDemo");
			if (!result) {
				Log.error("SplitApp object can't be found");
			}
			return result;
		},
		getReturns: function () {
			var result = this.byId("poId");
			if (!result) {
				Log.error("SplitApp object can't be found");
			}
			return result;
		},
		getInvoice: function () {
			var result = this.byId("invoiceId");
			if (!result) {
				Log.error("SplitApp object can't be found");
			}
			return result;
		},
		getInventory: function () {
			var result = this.byId("inventoryId");
			if (!result) {
				Log.error("SplitApp object can't be found");
			}
			return result;
		}
	});
});