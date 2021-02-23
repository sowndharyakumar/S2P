jQuery.sap.declare("ui.incture.APTest.util.Formatter");

ui.incture.APTest.util.Formatter = {

	/**
	 * TODO The icon does not have the enabled property hence this control is replaced with Button. To be removed.
	 * For each invoice line item the color of the message icon will be determined based on the Message Type coming from the service.
	 * @private
	 * @param {string} sMessageType is the Message Type coming from the service - possible values are Error, Warning, and Success
	 * @return {string} sColorValue is having the hex color code for the message icon
	 */
	getMessageColor: function (sMessageType) {
		"use strict";

		var sColorValue = "#3498db";

		if (sMessageType) {
			switch (sMessageType) {
			case "Warning":
				sColorValue = "#f39c12";
				break;
			case "Error":
				sColorValue = "#c0392b";
				break;
			case "Success":
				sColorValue = "#27ae60";
				break;
			case "Default":
				sColorValue = "#3498db";
				break;
			}
		}

		return sColorValue;

	},
	QtyColor: function (value) {
		if (value && value.length > 0) {
			for (var i = 0; i < value.length; i++) {
				if (value[i].msgNo == "504")
					return "Error";
			}
		}
		return "None";
	},
	priceColor: function (value) {
		if (value && value.length > 0) {
			for (var i = 0; i < value.length; i++) {
				if (value[i].msgNo == "082" || value[i].msgNo == "084")
					return "Error";
			}
		}
		return "None";
	},
	colorCode: function (value1, value2) {
		var id = this.getId();
		if (!value1 || value1 == "false")
			sap.ui.getCore().byId(id).addStyleClass("errorColor");
		else
			sap.ui.getCore().byId(id).removeStyleClass("errorColor");
	},
	getCount: function (value) {
		if (value && value.length > 0)
			return "(" + value.length + ")";
		return "";
	},
	getCountAttachment: function (value) {
		if (value && value.length > 0)
			return value.length + "";
		return "0";
	},

	poNumberItemSort: function (a, b) {
		a.poItem = (a.poItem) ? a.poItem : 0;
		b.poItem = (b.poItem) ? b.poItem : 0;
		if (isNaN(a.poItem) || isNaN(b.poItem)) {
			return a.poItem > b.poItem ? 1 : -1;
		}
		return a.poItem - b.poItem;
	},
	msgPopVisible: function (value) {
		if (value && value.length)
			return true;
		return false;
	},

	/**
	 * For each invoice line item the color of the message button will be determined based on the Message Type coming from the service.
	 * @private
	 * @param {string} sMessageType is the Message Type coming from the service - possible values are Error, Warning, and Success
	 * @return {string} sTypeValue is having the type of the button
	 */
	getMessageType: function (sMessageType) {
		"use strict";

		var sTypeValue = "Default";

		if (sMessageType) {
			switch (sMessageType) {
			case "Warning":
				sTypeValue = "Default";
				break;
			case "Error":
				sTypeValue = "Reject";
				break;
			case "Success":
				sTypeValue = "Accept";
				break;
			default:
				sTypeValue = "Default";
				break;
			}
		}

		return sTypeValue;

	},
	/** Currency Symbol */
	currencySymbolWithValue: function (curVal) {
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
			// value = (value) ? value : "";
			// var parts = value.toString().split(".");
			// parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			// value = parts.join(".");
			var currncy = currSymbol[curVal] ? currSymbol[curVal] : "";
			return currncy;
		}
	},
	threeWayError: function (value) {
		if (value)
			return true;
		else
			return false;
	},
	balanceMsg: function (value) {
		if (value == "0.000")
			return false;
		return true;
	},
	histValue: function (value) {
		if (value) {
			if (value == "E")
				return "Goods Receipts";
			else
				return "Invoice Receipts";

		}
	},
	excpetionMessage: function (value) {
		if (value && value.length > 0) {
			for (var i = 0; i < value.length; i++) {
				if (value[i].msgId == "M8")
					return "Error";
			}
		}
		return "None";
	},
	getDate: function (value) {
		if (value)
			return new Date(value).toISOString().split("T")[0];
		return "";
	},
	commentDate: function (value) {
		if (value) {
			return new Date(value).toDateString();
		}
	},
	commentUser: function (value) {
		if (value)
			return value.split("@")[0];
	},
	discountVisible: function (value, value1) {
		if (value && value1)
			return true;
		return false;
	},
	/** To Remove Leading Zero */
	removeZero: function (value) {
		if (value) {
			return value.replace(/\b0+/g, '');
		} else {
			return "";
		}
	},
	reverseBoolean: function (value) {
		if (value)
			return false;
		return true;
	},
	fnNetPriceEdit: function (posted, discountP, discountTotal, deposit) {
		if (posted) {
			return false;
		} else if ((discountP && discountP !== "0.00") || (discountTotal && discountTotal !== "0.00") || (deposit && deposit !== "0.00")) {
			return false;
		} else {
			return true;
		}
	},
	getAutoType: function (sType) {
		if (sType === "Auto") {
			this.addStyleClass("mmAutoClass");
		} else if (sType === "Manual") {
			this.addStyleClass("mmManulClass");
		}
		return true;
	},
	getMatchText: function (value) {
		if (value === "Auto") {
			return "Auto";
		} else if (value === "Manual") {
			return "Manual";
		}
	},
	/**
	 * For each each message the icon is to be determined.
	 * @private
	 * @param {string} sMsgType is the Message Type coming from the service - possible values are Error, Warning, and Success
	 * @return {string} sIcon has the icon format
	 */
	getMsgIcon: function (sMsgType) {
		"use strict";

		var sIcon = "sap-icon://message-information";

		if (sMsgType) {
			switch (sMsgType) {
			case "Success":
				sIcon = "sap-icon://message-success";
				break;
			case "Warning":
				sIcon = "sap-icon://warning";
				break;
			case "Error":
				sIcon = "sap-icon://error";
				break;
			default:
				sIcon = "sap-icon://message-information";
				break;
			}
		}

		return sIcon;
	}
};