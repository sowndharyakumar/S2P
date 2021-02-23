jQuery.sap.declare("com.incture.vendorReturns.util.Formatter");

com.incture.vendorReturns.util.Formatter = {
	boolean: function (value) {
		if (value)
			return true;
		return false;
	},
	commentDate: function (value) {
		if (value) {
			return new Date(value).toDateString();
		}
	},
	dateTimeFormatReport: function (oDate) {
		oDate = new Date(oDate);
		if (oDate) {
			var oDateFormat = sap.ui.core.format.DateFormat
				.getTimeInstance({
					pattern: "dd.MM.yyyy HH:mm:ss"
				});
			// oDate = new Date(oDate);
			if (oDate.getDate().toString().length === 1) {
				var date = "0" + oDate.getDate();
			} else {
				var date = oDate.getDate();
			}
			if (oDate.getMonth().toString().length === 1 && oDate.getMonth() < 9) {
				var month = "0" + (oDate.getMonth() + 1);
			} else {
				var month = oDate.getMonth() + 1;
			}
			if (oDate.getHours().toString().length === 1) {
				var hrs = "0" + oDate.getHours();
			} else {
				var hrs = oDate.getHours();
			}
			if (oDate.getMinutes().toString().length === 1) {
				var min = "0" + oDate.getMinutes();
			} else {
				var min = oDate.getMinutes();
			}
			if (oDate.getSeconds().toString().length === 1) {
				var seconds = "0" + oDate.getSeconds();
			} else {
				var seconds = oDate.getSeconds();
			}
			var date = oDate.getFullYear() + "-" + month + "-" + date;

			// oDate.setHours(oDate.getHours() + 8);".00+08:00"
			return oDateFormat.format(oDate);
			// return date;
		} else {
			return "";
		}
	},
	removeZero: function (value) {
		if(value)
		return value.replace(/0/g,'');
	}
};