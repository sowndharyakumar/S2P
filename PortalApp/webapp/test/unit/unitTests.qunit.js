/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ui/incture/PortalApp/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});