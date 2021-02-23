//0 - success and 1 failed
jQuery.sap.declare("ui.incture.APTest.util.formatter");
ui.incture.APTest.util.formatter = {
	linkEnable: function (value) {
		if (value == "Autoposting Success" || value == "Manually Posted" || value == "Auto Rejected" || value == "Manually Rejected") {
			return false;
		} else {
			return true;
		}
	},

	dateFo: function (value1) {
		var date;
		if (value1) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MM/dd/yyyy"
			});
			value1 = value1.split("T")[0];
			date = new Date(value1);
			return oDateFormat.format(date);
		}
		return value1;
	},
	getDate: function (value) {
		if (value)
			return new Date(value).toISOString().split("T")[0];
	},

	rejectReport: function (value) {
		if (value) {
			return true;
		} else {
			return false;
		}
	},

	numericCheck: function (value) {
		if (value) {
			var floatVal = parseFloat(value);
			return floatVal;
		}
		return value;
	},

	refQuantityValue: function (value) {
		if (!value) {
			return "0";
		}

		return value;
	},

	invoiceTabSelection: function (value) {
		if (value) {
			return false;
		}
		return true;
	},

	nonPoVisiblity: function (value) {
		if (value == "true")
			return false;
		else
			return true;
	},

	nanCheck: function (value) {
		if (value == NaN) {
			return 0;
		}
		return value;
	},

	handelCoding: function (value) {
		if (value == "true") {
			return false;
		}
		return true;
	},

	commaSeperator: function (value) {
		if (value) {
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
	},

	unplannedMsg: function (vendor, thirdParty) {
		if (vendor == "true" && thirdParty != "true") {
			return true;
		}
		return false;
	},

	headerChargeSelection: function (thirdParty, isAllVendorEq) {
		if (thirdParty == "true" || isAllVendorEq == "true") {
			return true;
		}
		return false;
	},

	diffVendorFlag: function (vendor, thirdParty) {
		if (vendor == "false" && thirdParty == "false") {
			return true;
		}
		return false;
	},

	isPODataAvailable: function (value) {
		if (value) {
			return "Vendor is different for the given PO";
		} else {
			return "No Purchase Order in this task. Please Add PO.";
		}
	},

	manualMatchColorCoding: function (value) {
		var id = this.getParent().sId;
		sap.ui.getCore().byId(id).addStyleClass("deleteedLineColor");
		sap.ui.getCore().byId(id).removeStyleClass("deleteedLineColor");
		if (value == "true") {
			sap.ui.getCore().byId(id).addStyleClass("deleteedLineColor");
		}
		return true;
	},

	manageStatus: function (value) {
		if (value == "WIP") {
			return "Open";
		} else if (value == "SUCCESS") {
			return "Closed";
		} else if (value == "DRAFT") {
			return "Draft";
		}
		return value;
	},

	taxAmount: function (tax, total) {
		if (tax && total) {
			return tax + " " + "/" + " " + total;
		}
	},

	glVisiblity: function (value) {
		if (value == "true" || value == true) {
			return true;
		}
		return false;
	},

	glLineVisiblity: function (value) {
		if (value == "true" || value == true) {
			return false;
		}
		return true;
	},

	dueDate: function (value) {
		if (value) {
			return true;
		}
		return false;
	},

	userId: function (value) {
		if (value) {
			value = value.split("@")[0];
			return value;
		}
	},

	// START ::: SINGLE SCREEN

	/**
	 * Replacing ? with %3F - Fix for UI Parse Error due to ? - Before pay load
	 * is sent to service
	 */
	fnEncodeJSONData: function (oData) {
		var sDataInString = JSON.stringify(oData);
		var sStringData = sDataInString.replaceAll(/\?/, "%3F");

		return JSON.parse(sStringData);
	},

	/**
	 * Replacing %3F with ? - Fix for UI Parse Error due to ? - After the
	 * response comes from service
	 */
	fnDecodeJSONData: function (oData) {
		var sDataInString = JSON.stringify(oData);
		var sStringData = sDataInString.replaceAll("%3F", '?');

		return JSON.parse(sStringData);
	},

	/** Manual Matching color coding */
	getManualType: function (sType) {
		if (sType === "true") {
			return true;
		} else if (sType === "false") {
			return false;
		}

		return false;
	},

	getAutoType: function (sType) {
		if (sType === "true") {
			return false;
		} else if (sType === "false") {
			return true;
		}

		return true;
	},

	/** Currency Symbol */
	currencySymbolWithValue: function (value, curVal) {
		if (curVal) {
			var currSymbol = {
				"USD": "$",
				"EUR": "€",
				"CRC": "₡",
				"GBP": "£",
				"ILS": "₪",
				"INR": "₹",
				"JPY": "¥",
				"KRW": "₩",
				"NGN": "₦",
				"PHP": "₱",
				"PLN": "zł",
				"PYG": "₲",
				"THB": "฿",
				"UAH": "₴",
				"VND": "₫"
			};
			value = (value) ? value : "";
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			value = parts.join(".");
			var currncy = currSymbol[curVal] ? currSymbol[curVal] : "";

			return currncy + " " + value;
		}
		return value;
	},

	/** If the value is true add RED colour to the control else remove it */
	disAmtColorCoding: function (value) {
		if (value === "true") {
			this.addStyleClass("redBoldColor");
		} else {
			this.removeStyleClass("redBoldColor");
		}
		return true;
	},

	/** Visibility of PO and Invoice Toggle Button in the Invoice Line Item */
	reverseThirdMsg: function (vendor, thirdParty) {
		if (vendor == "true" && thirdParty == "true") {
			return false;
		}
		return true;
	},

	/** To Remove Leading Zero */
	removeZero: function (value) {
		if (value) {
			return value.replace(/\b0+/g, '');
		} else {
			return "";
		}
	},

	/** Date Formatter */
	dateFormateWithTime: function (value) {
		if (value) {
			var completDate = value.split("T")[0];
			var yyyy = completDate.split("-")[0];
			var mm = completDate.split("-")[1];
			var dd = completDate.split("-")[2];
			var completeTime = value.split("T")[1];
			var time = completeTime.split("-")[0];
			return mm + "/" + dd + "/" + yyyy + "  " + time;
		}
		return value;
	},

	dateFormate: function (value) {
		if (value) {
			var completDate = value.split("T")[0];
			var yyyy = completDate.split("-")[0];
			var mm = completDate.split("-")[1];
			var dd = completDate.split("-")[2];
			return mm + "/" + dd + "/" + yyyy;
		}
		return value;
	},

	poLineItelDeletedChk: function (poFlag, deletedFlag) {
		var id = this.getParent().getParent().sId;
		sap.ui.getCore().byId(id).addStyleClass("deleteedLineColor");
		sap.ui.getCore().byId(id).removeStyleClass("deleteedLineColor");
		if (deletedFlag && deletedFlag == "true") {
			sap.ui.getCore().byId(id).addStyleClass("deleteedLineColor");
			return false;
		}
		if (poFlag === "false") {
			return true;
		}
		return false;
	},

	/** Visibility of Invoice Line Items Columns */
	invTabVisibility: function (switchVal, type, colVisibility) {
		if (switchVal == type && colVisibility) {
			return true;
		}
		return false;
	},

	invLineItemErrorChk: function (hasErrorFlag, hasSomeGrFlag,
		twowayMatchingFlag) {
		if (hasErrorFlag == "true") {
			return true;
		} else if (hasSomeGrFlag == "false" && twowayMatchingFlag == "true") {
			return true;
		}
		return false;
	},

	booleanChk: function (value) {
		if (value && value === "true") {
			return true;
		}
		return false;
	},

	valueState: function (value) {
		var id = this.sId;
		sap.ui.getCore().byId(id).addStyleClass("warningColor");
		sap.ui.getCore().byId(id).removeStyleClass("warningColor");
		if (value && value === "1") {
			return "Error";
		} else if (value && value === "2") {
			sap.ui.getCore().byId(id).addStyleClass("warningColor");
			return "None";
		}
		return "None";
	},
	decimalChktwo: function (value) {
		if (value){
			var n = value.toFixed(2);
		}
		return n;
	},
	decimalChk: function (value) {
		if (value) {
			var decimalVal = parseFloat(value);
			value = decimalVal.toFixed(2);
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".") + '\n';
		}
		return "0.00" + '\n';
	},

	commaSepratedValue: function (value) {
		if (value) {
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		}
	},

	decimalThreeValueChk: function (value) {
		if (value == "0") {
			return "0.000" + '\n';
		} else if (value) {
			var decimalVal = parseFloat(value);
			value = decimalVal.toFixed(3);
			var parts = value.toString().split(".");

			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".") + '\n';
		}
		return "0.000" + '\n';
	},
	decimalTwoValueChk: function (value) {
		if (value == "0") {
			return "0.00" + '\n';
		} else if (value) {
			var decimalVal = parseFloat(value);
			value = decimalVal.toFixed(2);
			var parts = value.toString().split(".");

			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".") + '\n';
		}
		return "0.00" + "\n";
	},

	lineItemValidation: function (value) {
		var id = this.oParent.sId;
		sap.ui.getCore().byId(id).addStyleClass("errorColor");
		sap.ui.getCore().byId(id).removeStyleClass("errorColor");
		if (!value) {
			sap.ui.getCore().byId(id).addStyleClass("errorColor");
		}
		if (value && value == "false") {
			sap.ui.getCore().byId(id).addStyleClass("errorColor");
		}
		return true;
	},

	opuCheck: function (valueA, valueB) {
		if ((valueA == valueB) && (valueA != undefined) && (valueA != "")) {
			return "Success";
		} else if (!valueA) {
			return "None";
		}
		return "Error";
	},

	freeItemChk: function (value) {
		var id = this.oParent.sId;
		sap.ui.getCore().byId(id).addStyleClass("freeLingItemFlag");
		sap.ui.getCore().byId(id).removeStyleClass("freeLingItemFlag");
		if (value == "true") {
			sap.ui.getCore().byId(id).addStyleClass("freeLingItemFlag");
		}
		return false;
	},

	priceUnitColorCode: function (value) {
		var updatedValue = parseFloat(value);
		var id = this.getParent().sId;
		sap.ui.getCore().byId(id).addStyleClass("accAssignColor");
		sap.ui.getCore().byId(id).removeStyleClass("accAssignColor");
		if (updatedValue > 1) {
			sap.ui.getCore().byId(id).addStyleClass("accAssignColor");
			return value;
		}
		return value;
	},
	priceUnitValue: function (value, value1) {
		if (value) {
			var decimalVal = parseFloat(value);
			value = decimalVal.toFixed(2);
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			value = parts.join(".");
			if (value1 > 1) {
				return value + " / " + value1;
			} else {
				return value;
			}
		} else {
			return "0.00";
		}
	},

	assignZero: function (value) {
		return value ? value : "0";
	},

	toggleIcon: function (value) {
		if (value === "ON") {
			return "images/ON.png";
		} else if (value === "ERROR") {
			return "images/ERROR.png";
		}
		return "images/symbolOFF.png";
	},

	taxValue: function (valuea, valueb) {
		if (valueb == undefined) {
			return valuea;
		} else if (valuea && valueb) {
			return valuea + "(" + valueb + ")";
		}
	},

	amtDiffr: function (value) {
		var id = this.sId;
		sap.ui.getCore().byId(id).addStyleClass("redBoldColor");
		sap.ui.getCore().byId(id).addStyleClass("greenBoldColor");
		sap.ui.getCore().byId(id).removeStyleClass("redBoldColor");
		sap.ui.getCore().byId(id).removeStyleClass("greenBoldColor");
		if (value == NaN || value == "NaN" || value == "-0.00") {
			value = "0.00";
		}
		if (value == "0" || value == "0.00") {
			sap.ui.getCore().byId(id).addStyleClass("greenBoldColor");
		} else if (value > "0") {
			value = parseFloat(value);
			value = value.toFixed(2);
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			value = parts.join(".");
			sap.ui.getCore().byId(id).addStyleClass("redBoldColor");
		} else if (value < "0") {
			value = parseFloat(value);
			value = value.toFixed(2);
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			value = parts.join(".");
			sap.ui.getCore().byId(id).addStyleClass("greenBoldColor");
		}
		return value;
	},

	valueChk: function (value) {
		if (value) {
			return true;
		}
		return false;
	},

	vendorName: function (valueA, valueB) {
		if (valueB) {
			return valueB;
		} else {
			return valueA;
		}
	},

	unplannedCheck: function (value) {
		var id = this.getParent().getParent().sId;
		sap.ui.getCore().byId(id).addStyleClass("grnErrorCss");
		sap.ui.getCore().byId(id).removeStyleClass("grnErrorCss");
		if (value === "true") {
			sap.ui.getCore().byId(id).addStyleClass("grnErrorCss");
		}
		return true;
	},

	headerChargeMsg: function (plannedCost, invoiceHeaderCharges) {
		if (plannedCost && invoiceHeaderCharges) {
			if (parseFloat(plannedCost) > parseFloat(invoiceHeaderCharges)) {
				return "Invoice header cost is lesser than Planned Cost " + plannedCost;
			}
			return "Invoice header cost is more than Planned Cost " + plannedCost;
		}
	},

	headerTabVisible: function (deliveryVendor, hasUnplannedCost) {
		if (deliveryVendor == "true" && hasUnplannedCost == "true") {
			return true;
		}
		return false;
	},

	grnCheck: function (value) {
		var id = this.getParent().getParent().sId;
		sap.ui.getCore().byId(id).addStyleClass("grnErrorCss");
		sap.ui.getCore().byId(id).removeStyleClass("grnErrorCss");
		if (value === "false") {
			sap.ui.getCore().byId(id).addStyleClass("grnErrorCss");
		}
		return true;
	},

	booleanReverse: function (value) {
		if (value && value === "false") {
			return true;
		}
		return false;
	},

	/** UOM in Invoice Line Item Enabled/Disabled */
	fnEnableInvUOM: function (bTwoWayMatchingFlag) {
		if (bTwoWayMatchingFlag === "true") {
			return true;
		} else {
			return false;
		}
	},

	getDisColVis: function (bPoInvToggle, bValue) {
		if (bPoInvToggle === true && bValue === true) {
			return true;
		} else {
			return false;
		}
	},

	nullChk: function (value) {
		if (value)
			return true;
		else
			return false;
	},
	lineBreak: function (value) {
		if (value)
			return value + '\n';
	},
	/** Net price Editable Field */
	fnNetPriceEdit: function (accAssCheckOnQty, unitDiscountValue, unitDisPer,
		discountTotal, deposit, unitDeposit) {
		if (accAssCheckOnQty && accAssCheckOnQty == "false") {
			return false;
		} else if ((unitDiscountValue && unitDiscountValue !== "0.00") || (unitDisPer && unitDisPer !== "0.00") || (discountTotal &&
				discountTotal !== "0.00") || (deposit && deposit !== "0.00") || (unitDeposit && unitDeposit !== "0.00")) {
			return false;
		} else {
			return true;
		}
	},
	btnTaxEnable: function (value, value1) {
		var id = this.getParent().sId;
		sap.ui.getCore().byId(id).addStyleClass("incTaxCls");
		sap.ui.getCore().byId(id).removeStyleClass("incTaxCls");
		if (value > 0 && (value1 == "0" || value1 == "0.00")) {
			sap.ui.getCore().byId(id).removeStyleClass("incTaxCls");
			return true;
		} else {
			sap.ui.getCore().byId(id).addStyleClass("incTaxCls");
			return false;
		}
	},
	btnEnable: function (value) {
		if (value > 0) {
			return true;
		} else {
			return false;
		}
	},
	poUnitPrice: function (value, value1, value2) {
		if (value) {
			var parts = value.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			value = parts.join(".");
		}
		return "$ " + value + " / " + value1 + " " + value2;
	},

	fnAAInvQty: function (sQty, sUOM) {
		return sQty + " " + sUOM;
	},

	fnAAHeader: function (sMatDes) {
		sMatDes = sMatDes ? (sMatDes + " - Account Assignment") : "Account Assignment";
		return sMatDes;
	},

	getEnbAABtn: function (sValue) {
		if (sValue) {
			return true;
		} else {
			return false;
		}
	}

	// END ::: SINGLE SCREEN
};