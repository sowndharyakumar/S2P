sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
	"use strict";
	return Controller.extend("ui.incture.APTest.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Error Message Display Block
		 * @param {string} [sMessage] the message text
		 * @public
		 */
		showErrorMessage: function (sMessage) {
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				sMessage, {
					actions: [sap.m.MessageBox.Action.CLOSE],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						this._bMessageOpen = false;
						// MessageToast.show("Action selected: " + sAction);
					}.bind(this)
				}
			);
		},
		getCSRFToken: function () {
			var url = "InctureApDest/statusConfig/getAll/EN";
			// /invoiceHeader/getAll";
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
		// fnSessionManagement: function () {
		// 	var IDLE_TIMEOUT = 3601; //seconds
		// 	var _idleSecondsTimer = null;
		// 	var _idleSecondsCounter = 0;

		// 	document.onclick = function () {
		// 		_idleSecondsCounter = 0;
		// 	};

		// 	document.onmousemove = function () {
		// 		_idleSecondsCounter = 0;
		// 	};

		// 	document.onkeypress = function () {
		// 		_idleSecondsCounter = 0;
		// 	};

		// 	_idleSecondsTimer = window.setInterval(CheckIdleTime, 1000);

		// 	function CheckIdleTime() {
		// 		_idleSecondsCounter++;
		// 		if (_idleSecondsCounter >= IDLE_TIMEOUT) {
		// 			window.clearInterval(_idleSecondsTimer);
		// 			MessageBox.warning("Session Timeout. Kindly login to the FD Portal and reopen the task.", {
		// 				actions: [sap.m.MessageBox.Action.OK],
		// 				onClose: function (sAction) {
		// 					try {
		// 						location.reload();
		// 					} catch (err) {
		// 						location.reload();
		// 					}
		// 				}
		// 			});
		// 		}
		// 	}
		// },
		/** 
		 * Any input or text area value should be trimmed.
		 * @public
		 * @param {String} sValue Input or Text Area Value.
		 * @param {Object} oControl The control from which the event is fired, mainly input and text area.
		 * @return {String} Retruns the trimmed value
		 */
		getTrimValue: function (sValue, oControl) {
			var sReturnValue = sValue;

			if (sValue) {
				sReturnValue = sValue.trim();
				oControl.getSource().setValue(sReturnValue);
			}

			return sReturnValue;
		},

		/** 
		 * Number format to be tested.
		 * @public
		 * @param {String} sValue Input Value.
		 * @return {Number} Retruns the value as a Number Data Type.
		 */
		getNumberValue: function (sValue) {
			var sReturnValue = sValue,
				iReturnValue;

			if (sValue) {
				// Remove all the commas before converting the number
				if (sValue.includes(",")) {
					sReturnValue = sValue.replace(this.oCommaRegEx, "");
				}

				iReturnValue = Number(sReturnValue);
			} else {
				iReturnValue = 0.00;
			}

			return iReturnValue;
		},

		/** 
		 * Number format to be tested.
		 * @public
		 * @param {String} sValue Input Value.
		 * @return {Boolean} Retruns true/false based on the regular expression defined in onInit Method
		 */
		getNumberDataTypeValidation: function (sValue) {
			var bReturnValue = false;

			if (this.oNumberFormatRegEx.test(sValue)) {
				bReturnValue = true;
			} else {
				bReturnValue = false;
			}

			return bReturnValue;
		},

		/** 
		 * Get the Inline Fragments.
		 * @private
		 * @param {String} sFragmentName Button Object.
		 * @return {Object} Retruns the Fragment Object
		 */
		_formFragments: {},
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "ui.incture.APTest.view.fragments." + sFragmentName, this);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		}

	});

});