// Common Module: common.module.js

exports.id = "common.module.js";

/**
 * 공통 유틸 Class
 */
{
	var ComUtil = function(/* cpr.core.AppInstance */app) {
		this._app = app;
		this._submitdonehandler = this.onSubmitDone.bind(this);
		this._submiterrorhandler = this.onSubmitError.bind(this);
		this._activeLoadMask = null;
		this._activeSubmission = [];

		this._validator = createValidator(this);
	}

	ComUtil.prototype.getRootApp = function() {
		var appInstance = this._app;
		while (appInstance.getHostAppInstance()) {
			appInstance = appInstance.getHostAppInstance();
		}
		return appInstance;
	};

	ComUtil.prototype.getApp = function() {
		return this._app;
	}

	/**
	 * 공통 메시지 출력상자
	 * 
	 * @param msg
	 */
	ComUtil.prototype.alert = function(msg) {
		// window alert 사용
		// alert(msg);

		// notifier 사용
		cpr.core.NotificationCenter.INSTANCE.post("notice", msg);
	}
	
	
	/**
	 * 다국어 설정
	 */
	ComUtil.prototype.language = function(locale) {
		var multilang = cpr.I18N.INSTANCE;
		var rApp = this.getRootApp();
		/**
		 * @type cpr.protocols.Submission
		 */
		var getLang = rApp.lookup("sms_getLangList");		
		//getLang.action = "data/lang/lang_"+language+".json";
		getLang.action = "data/lang/lang.json";
		getLang.send();
		getLang.addEventListenerOnce("submit-success", function(e){
			/**
			 * @type cpr.data.DataSet
			 */
			var langlist = rApp.lookup("LangList");
			var localeArr = [];
			var data = langlist.getRowDataRanged();
			
			data.forEach(function(each){
				if(localeArr.indexOf(each.Locale)==-1){
					localeArr.push(each.Locale);
				}
			});
			localeArr.forEach(function(/* Object */ each){
				var sorting = langlist.findAllRow("Locale=='"+each+"'");
				var localeData = {};
				sorting.forEach(function(/* cpr.data.Row */ row){
					localeData[row.getValue("Key")] = row.getValue("Value");					
				});
				
				multilang.setLocaleData(each, localeData);
			});
			
			multilang.currentLanguage = locale;
			return multilang;
		});
	}
	
	
	/**
	 * App 화면의 Layout에 맞게 컨트롤 배치 조건 래핑.
	 * 
	 * @param constraint 래핑할 배치조건
	 * @returns 래핑된 배치조건
	 */
	ComUtil.prototype.wrapConstraints = function(constraint) {
		var layout = this._app.getContainer().getLayout();
		if (layout instanceof cpr.controls.layouts.ResponsiveXYLayout) {
			var positionConstraints = [];
			var allMedia = this._app.allSupportedMedias;
			allMedia.forEach(function(media) {
				var newConst = _.clone(constraint);
				newConst["media"] = media;
				positionConstraints[positionConstraints.length] = newConst;
			});
			return {
				"positions" : positionConstraints
			};
		} else if (layout instanceof cpr.controls.layouts.XYLayout || layout instanceof cpr.controls.layouts.FormLayout) {
			return constraint;
		}
		return constraint;
	};

	/**
	 * 화면에 LoadMask 출력
	 */
	ComUtil.prototype.showLoadMask = function(maskType,title,subTitle,max) {
		this.hideLoadMask();

		var showConstraint = {
			"position" : "absolute",
			"top" : "0",
			"bottom" : "0",
			"left" : "0",
			"right" : "0",
			"z-index" : "5"
		};
		showConstraint = this.wrapConstraints(showConstraint);

		var loadmask = null;
		if (maskType == "pro") {
			loadmask = this._app.lookup("__loadmask_pro__");
			if (loadmask) {
				this._app.getContainer().replaceConstraint(loadmask, showConstraint);
			} else {
				loadmask = new udc.loadmask.loadmaskprogress("__loadmask_pro__");
				this._app.getContainer().addChild(loadmask, showConstraint);
			}
			loadmask.module.init(title,subTitle,max);
		} else {
			loadmask = this._app.lookup("__loadmask__");
			if (loadmask) {
				this._app.getContainer().replaceConstraint(loadmask, showConstraint);
			} else {
				loadmask = new udc.loadmask.loadmask("__loadmask__");
				this._app.getContainer().addChild(loadmask, showConstraint);
			}
		}
		this._activeLoadMask = loadmask;
	};
	
	/**
	 * LoadMask를 감춤
	 */
	ComUtil.prototype.updateLoadMask = function(subTitle) {
		if (this._activeLoadMask) {
			this._activeLoadMask.module.setSubTitle(subTitle);
			this._activeLoadMask.module.increaseValue();
		}
	};
	
	ComUtil.prototype.updateLoadMaskSubTitle = function(subTitle) {
		if (this._activeLoadMask) {
			this._activeLoadMask.module.setSubTitle(subTitle);			
		}
	};

	/**
	 * LoadMask를 감춤
	 */
	ComUtil.prototype.hideLoadMask = function() {
		if (this._activeLoadMask) {
			if (this._activeLoadMask.module.end) {
				this._activeLoadMask.module.end();
			}
			var hideConstraint = {
				"position" : "absolute",
				"top" : "-1px",
				"left" : "-1px",
				"width" : "1px",
				"height" : "1px",
				"z-index" : "-5"
			};
			hideConstraint = this.wrapConstraints(hideConstraint);
			this._app.getContainer().replaceConstraint(this._activeLoadMask, hideConstraint);
			this._activeLoadMask.dispose();
			this._activeLoadMask = null;
		}
	};

	/**
	 * DataSet id 목록을 전달받아 변경여부를 체크하여 변경되었으면 true, 그렇지 않으면 false를 리턴한다.
	 * 
	 * @returns {Boolean} 변경 true/변경되지 않음 false.
	 */
	ComUtil.prototype.isUpdated = function() {
		if (arguments.length == 0) {
			return false;
		}

		for (var i = 0; i < arguments.length; i++) {
			var datasetID = arguments[i];
			/**
			 * @type cpr.data.DataSet
			 */
			var ds = this._app.lookup(datasetID);
			if (ds.isModified() == true) {
				return true;
			}
		}

		return false;
	}

	/**
	 * 그룹 또는 Grid의 ID 목록을 전달받아 컨트롤의 입력 값이 Valid 하면 true, Invalid하면 false를 리턴한다. Grid의 경우 편집 상태일 때 편집 중인 값만 체크한다.
	 * 
	 * @param 그룹 또는 Grid의 ID를 string 값으로 전달 여러 개 일 경우 콤마로 구분. validate("gridMain", "grp1", ...);
	 * @returns {Boolean} Valid true, Invalid false.
	 */
	ComUtil.prototype.validate = function() {
		if (arguments.length == 0) {
			return true;
		}

		var valid = true;

		for (var i = 0; i < arguments.length; i++) {
			var grpID = arguments[i];
			/**
			 * @type cpr.controls.Container
			 */
			var grp = this._app.lookup(grpID);
			valid = this.validateControl(grp);
			if (valid == false) {
				return false;
			}
		}

		return true;
	}

	ComUtil.prototype.validateControl = function(/* cpr.controls.UIControl */ctrl) {
		if (!ctrl) {
			return true;
		}

		var invalid = true;
		var _this = this;

		if (ctrl instanceof cpr.controls.Grid) { // Grid 일 경우 체크
			if (ctrl.isEditing() == false) {
				return true;
			}
			/**
			 * @type cpr.controls.gridpart.GridBand
			 */
			var detailBand = ctrl.detail;
			var cellCnt = detailBand.cellCount;
			for (var i = 0; i < cellCnt; i++) {
				/**
				 * @type cpr.controls.gridpart.GridColumn
				 */
				var col = detailBand.getColumn(i);

				// 컨트롤별 Validation Check
				if (this.validateControl(col.control) == false) {
					return false;
				}
			}
		} else if (ctrl instanceof cpr.controls.Container) { // Group 일 경우 체크
			var children = ctrl.getChildren();
			invalid = children.some(function(/* cpr.controls.UIControl */child) {
				// 컨트롤별 Validation Check
				if (_this.validateControl(child) == false) {
					return true;
				}
				return false;
			});
			if (invalid == true) {
				return false;
			}
		} else {
			var valid = this._validator.validate(ctrl, ctrl.value);
			if (valid == false) {
				ctrl.focus();
			}
			return valid;
		}
	}

	/**
	 * Grid의 변경된 전체 데이터에 대한 Validation 체크
	 * 
	 * @param gridId 체크할 Grid의 Id
	 * @param dataScope {all} 그리드의 전체 데이터, {upd} 변경된 전체 Row, {edt} 현재 편집중인 Row
	 * @returns {Boolean}
	 */
	ComUtil.prototype.validateGrid = function(gridId, dataScope) {
		/**
		 * @type cpr.controls.Grid
		 */
		var grd = this._app.lookup(gridId);
		if (!grd) {
			return false;
		}

		/**
		 * @type cpr.controls.gridpart.GridBand
		 */
		var detailBand = grd.detail;
		var cellCnt = detailBand.cellCount;

		/**
		 * @type cpr.data.DataCollection
		 */
		var dataSet = grd.dataSet;
		if (dataScope == "all") {
			var rowCnt = dataSet.getRowCount();
			for (var idx = 0; idx < rowCnt; idx++) {
				var row = dataSet.getRow(idx);
				for (var i = 0; i < cellCnt; i++) {
					/**
					 * @type cpr.controls.gridpart.GridColumn
					 */
					var col = detailBand.getColumn(i);
					var columnName = col.columnName;
//					var columnName = col.getAttr("columnName");
					if (columnName) {
						var colValue = row.getValue(columnName);
						// 컨트롤별 Validation Check
						if (this._validator.validate(col.control, colValue) == false) {
							grd.focusCell(idx, i);
							return false;
						}
					}
				}
			}
		} else if (dataScope == "upd") {
			// 삭제 제외
			var rows = dataSet.getRowStatedIndices(cpr.data.tabledata.RowState.INSERTED | cpr.data.tabledata.RowState.UPDATED);
			var _this = this;
			var invalid = rows.some(function(idx) {
				var row = dataSet.getRow(idx);

				for (var i = 0; i < cellCnt; i++) {
					/**
					 * @type cpr.controls.gridpart.GridColumn
					 */
					var col = detailBand.getColumn(i);
					var columnName = col.columnName;
//					var columnName = col.getAttr("columnName");
					if (columnName) {
						var colValue = row.getValue(columnName);
						// 컨트롤별 Validation Check
						if (_this._validator.validate(col.control, colValue) == false) {
							grd.focusCell(idx, i);
							return true;
						}
					}
				}
				return false;
			});
			if (invalid == true) {
				return false;
			}
		} else {
			var editRowIdx = grd.getEditRowIndex();
			var row = null;
			if (editRowIdx == -1) {
				return true;
			}
			for (var i = 0; i < cellCnt; i++) {
				/**
				 * @type cpr.controls.gridpart.GridColumn
				 */
				var col = detailBand.getColumn(i);
				var columnName = col.columnName;
//				var columnName = col.getAttr("columnName");
				if (columnName) {
					var ctrl = col.control;
					if (ctrl) {
						// 컨트롤별 Validation Check
						if (this._validator.validate(ctrl, ctrl.value) == false) {
							grd.focusCell(editRowIdx, i);
							return false;
						}
					}
				}
			}
		}

		return true;
	}

	/**
	 * 컨트롤에 정의된 보정 속성이 있을 경우 컨트롤의 값을 보정합니다. 보정된 값은 Control의 value 값으로 재설정 됩니다.
	 * 
	 * @param ctrl
	 */
	ComUtil.prototype.revise = function(/* cpr.controls.UIControl */ctrl) {
		this._validator.revise(ctrl);
	}

	/**
	 * PageIndexer UDC의 값을 초기화 한다.
	 * 
	 * @param pagingDataMapId Paging 정보가 담긴 DataMap의 ID. DataMap은 totCnt, pageSize, rowSize, pageIdx 컬럼을 가지고 있어야 함.
	 * @param pageIndexerId Paging 정보를 설정할 pageIndex UDC의 화면내 ID.
	 */
	ComUtil.prototype.setPagingInfo = function(pagingDataMapId, pageIndexerId) {
		/**
		 * @type cpr.data.DataMap
		 */
		var pagingDataMap = this._app.lookup(pagingDataMapId);
		/**
		 * @type udc.com.pageindex
		 */
		var pageIndexer = this._app.lookup(pageIndexerId);
		// set data
		pageIndexer.module.setPaging(pagingDataMap.getValue("totCnt"), pagingDataMap.getValue("pageSize"), pagingDataMap.getValue("rowSize"), pagingDataMap.getValue("pageIdx"));
	}

	/**
	 * 특정 Grid의 Data를 Excel로 Export 한다.
	 * 
	 * @param gridId Export할 Grid의 ID.
	 * @param fileName 다운로드할 파일명.
	 * @param metadata 익스포트 파일에 옵션 설정. (파일암호화, 용지방향)
	 */
	ComUtil.prototype.exportExcel = function(gridId, fileName, metadata, maskType) {
		var grd = this._app.lookup(gridId);
		if (!grd) {
			this.alert("Export 대상을 찾을 수 없습니다. ID : " + gridId);
			return;
		}

		this.showLoadMask(maskType);

		var _this = this;
		var subExport = new cpr.protocols.Submission();
		subExport.action = "/export/" + fileName + ".xlsx";
		subExport.mediaType = "application/json";
		subExport.responseType = "blob";
		subExport.addEventListener("submit-done", function(/* cpr.events.CSubmissionEvent */e) {
			// submission success에서 다른 submission을 실행했을 경우 loadmask를 내리지 않는다.
			if (_this._activeSubmission.length == 0) {
				// hide loadmask
				_this.hideLoadMask();
			}
		});

		var exportData = grd.getExportData(true);
		if (metadata != null) {
			exportData["metadata"] = {};
			if (metadata["password"] != null) {
				exportData["metadata"]["password"] = metadata["password"];
			}
			if (metadata["printPageOrientation"] != null) {
				exportData["metadata"]["printPageOrientation"] = metadata["printPageOrientation"];
			}
		}
		subExport.setRequestObject(exportData);

		subExport.send();
	}

	/**
	 * 저장 submission send
	 * 
	 * @param gridID
	 * @returns {Boolean}
	 */
	ComUtil.prototype.save = function(submissionId, successCallback, errorCallback, doneCallback) {
		var submission = this._app.lookup(submissionId);

		this.showLoadMask(submission);

		var _this_ = this;

		/* 서버에러 공통처리 */
		submission.addEventListenerOnce("receive", function(/** @type cpr.events.CSubmissionEvent */
		e) {
			var xhr = submission.xhr;
			var contentType = xhr.getResponseHeader("Content-Type");
			contentType = contentType.toLowerCase();
			if (contentType.indexOf(";") > -1) {
				contentType = contentType.substring(0, contentType.indexOf(";"));
			}
			contentType = contentType.trim();
			if ("application/json" != contentType) {
				return;
			}

			var response = xhr.responseText;
			var jsonRes = JSON.parse(response);
			var statusCode = jsonRes["statusCode"];
			var message = jsonRes["message"];
			if (statusCode && message) {
				e.preventDefault();
				if (statusCode == 401) {
					alert(message);
					window.location.reload(true);
				} else if (statusCode == 403) {
					alert(message);
					cpr.core.NotificationCenter.INSTANCE.post("app-logout", {});
				} else {
					_this_.notifyMessage("danger", message);
				}
			}
		});

		var successListener = function(e) {
			// 정상적으로 처리되었습니다.
			_this_.notifyMessage("success", cpr.I18N.INSTANCE.message("151"));
			if (successCallback) {
				successCallback(e);
			}
		};
		submission.addEventListener("submit-success", successListener);

		var errorListener = null;
		if (errorCallback) {
			errorListener = function(e) {
				errorCallback(e);
			};
			submission.addEventListener("submit-error", errorListener);
		}

		submission.addEventListenerOnce("submit-done", function(e) {
			_this_.hideLoadMask(submission);

			submission.removeEventListener("submit-success", successListener);
			if (errorListener) {
				submission.removeEventListener("submit-error", errorListener);
			}

			if (doneCallback) {
				doneCallback(e);
			}

			submission.removeAllParameters();
		});
		submission.send();
	}
	
	/**
	 * Submission Send 공통화.
	 * 
	 * @param submitId SubmissionID
	 */
	ComUtil.prototype.send = function(submitId, maskType) {
		/**
		 * @type cpr.protocols.Submission
		 */
		var sub = this._app.lookup(submitId);
		if (!sub) {
			this.alert("Submission 을 찾을 수 없습니다. ID : " + submitId);
			return;
		}

		this.showLoadMask(maskType);

		sub.addEventListener("submit-error", this._submiterrorhandler);
		sub.addEventListener("submit-done", this._submitdonehandler);

		sub.send();
		this._activeSubmission[this._activeSubmission.length] = sub;
	}

	/**
	 * @private Submission Error Handler
	 * @param e
	 */
	ComUtil.prototype.onSubmitError = function(/* cpr.events.CSubmissionEvent */e) {
		/**
		 * @type cpr.protocols.Submission
		 */
		var submission = e.control;

		var msg = submission.getMetadata("msg");
		if (msg) {
			this.alert(msg);
		} else if (e.nativeEvent) {
			this.alert("network : " + e.nativeEvent.type);
		}

		// TODO implements 세션 처리를 포함한 별도 에러처리
	}

	/**
	 * @private Submission Done Handler
	 * @param e
	 */
	ComUtil.prototype.onSubmitDone = function(/* cpr.events.CSubmissionEvent */e) {
		/**
		 * @type cpr.protocols.Submission
		 */
		var submission = e.control;

		var idx = this._activeSubmission.indexOf(submission);
		if (idx != -1) {
			this._activeSubmission.splice(idx, 1);
		}

		// submission success에서 다른 submission을 실행했을 경우 loadmask를 내리지 않는다.
		if (this._activeSubmission.length == 0) {
			// hide loadmask
			this.hideLoadMask();
		}

		// TODO implements Submission이 끝난 이후 후처리
	}

	/**
	 * 그리드에 Row를 추가한다.
	 * 
	 * @param gridId 그리드의 ID
	 * @returns 추가된 Row의 INDEX
	 */
	ComUtil.prototype.insertGridRow = function(gridId) {
		/**
		 * @type cpr.controls.Grid
		 */
		var grd = this._app.lookup(gridId);
		if (!grd) {
			this.alert("Grid를 찾을 수 없습니다. ID : " + gridId);
			return -1;
		}
		if (grd.isEditing() == true) {
			var success = grd.setEditRowIndex(-1, true);
			if (success == false) {
				return -1;
			}
		}

		var rowIndex = grd.getSelectedRowIndex();
		var gridRow = grd.insertRow(rowIndex, true);
		rowIndex = gridRow.getIndex();

		grd.selectRows([ rowIndex ]);

		// Grid가 readonly가 아닐 경우 edit mode로 전환
		if (grd.readOnly == false) {
			var changed = grd.setEditRowIndex(rowIndex, true);
		}

		return rowIndex;
	}

	/**
	 * 그리드에서 선택된 Row를 삭제한다.
	 * 
	 * @param gridId 그리드의 ID
	 * @returns 삭제된 Row의 INDEX
	 */
	ComUtil.prototype.deleteGridRow = function(gridId) {
		var grd = this._app.lookup(gridId);
		if (!grd) {
			this.alert("Grid를 찾을 수 없습니다. ID : " + gridId);
			return -1;
		}
		var rowIndex = grd.getSelectedRowIndex();
		if (rowIndex == -1) {
			this.alert("선택된 Row가 없습니다.");
		} else {
			grd.deleteRow(rowIndex);
		}

		return rowIndex;
	}

	/**
	 * 그리드에서 선택된 Row의 데이터를 원복한다.
	 * 
	 * @param gridId 그리드의 ID
	 * @returns 원복된 Row의 INDEX
	 */
	ComUtil.prototype.revertGridRow = function(gridId) {
		/**
		 * @type cpr.controls.Grid
		 */
		var grd = this._app.lookup(gridId);
		if (!grd) {
			this.alert("Grid를 찾을 수 없습니다. ID : " + gridId);
			return -1;
		}

		var rowIndices = grd.getSelectedRowIndices();
		var dataSet = grd.dataSet;

		if (rowIndices.length == 0) {
			this.alert("선택된 Row가 없습니다.");
		} else {
			rowIndices.forEach(function(rowIndex) {
				dataSet.revertRow(rowIndex);
			});
			grd.redraw();
		}

		return rowIndices;
	}

	/**
	 * 선택된 Row를 이동시킨다.
	 * 
	 * @param srcGridId Source Grid ID
	 * @param desGridId Destination Grid ID
	 */
	ComUtil.prototype.moveGridData = function(srcGridId, desGridId) {
		/**
		 * @type cpr.controls.Grid
		 */
		var srcGrd = this._app.lookup(srcGridId);
		/**
		 * @type cpr.controls.Grid
		 */
		var desGrd = this._app.lookup(desGridId);

		var indices = srcGrd.getSelectedRowIndices();
		if (!indices || indices.length == 0) {
			return;
		}

		var rows = srcGrd.getSelectedRows();

		rows.forEach(function(row) {
			var insertRow = desGrd.insertRow(desGrd.rowCount, true);
			insertRow.setRowData(row.getRowData());
			insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
		});
		srcGrd.deleteRow(indices);

		srcGrd.clearSelection();
		desGrd.clearSelection();
	}

	/**
	 * Source Grid의 모든 ROW를 이동시킨다.
	 * 
	 * @param srcGridId Source Grid ID
	 * @param desGridId Destination Grid ID
	 */
	ComUtil.prototype.moveAllGridData = function(srcGridId, desGridId) {
		/**
		 * @type cpr.controls.Grid
		 */
		var srcGrid = this._app.lookup(srcGridId);
		/**
		 * @type cpr.controls.Grid
		 */
		var desGrid = this._app.lookup(desGridId);

		if (srcGrid.rowCount == 0) {
			return;
		}

		var indices = [];
		for (var rowIndex = 0; rowIndex < srcGrid.rowCount; rowIndex++) {
			var insertRow = desGrid.insertRow(desGrid.rowCount, true);
			insertRow.setRowData(srcGrid.getRow(rowIndex).getRowData());
			insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			indices.push(rowIndex);
		}
		srcGrid.deleteRow(indices);
	}

	/**
	 * srcGridId에 선택된 Row들을 desGridId에 복사한다. desGridId에 이미 있는 Row는 추가되지 않는다.
	 * 
	 * @param srcGridId
	 * @param desGridId
	 */
	ComUtil.prototype.copyGridData = function(srcGridId, desGridId) {
		/**
		 * @type cpr.controls.Grid
		 */
		var srcGrd = this._app.lookup(srcGridId);
		/**
		 * @type cpr.controls.Grid
		 */
		var desGrd = this._app.lookup(desGridId);

		// 선택된 row의 index
		var indices = srcGrd.getSelectedRowIndices();
		if (!indices || indices.length == 0) {
			return;
		}

		// 선택된 row
		var rows = srcGrd.getSelectedRows();

		rows.forEach(function(row) {
			// json 형식의 row의 데이터
			var data = row.getRowData();
			var str = [];
			// 이미 존재하는 row를 찾기 위해 row의 모든 column을 비교하는 조건 제작
			// str = "column1 == 'value1' && column2 == 'value2'..."
			for ( var key in data) {
				str.push(key + " == '" + data[key] + "'");
			}
			str = str.join(" && ");
			// 조건에 맞는 row 탐색
			var findRow = desGrd.findAllRow(str);
			// 조건에 해당하는 row가 없다면 target 그리드에 선택된 row를 추가
			if (findRow.length == 0) {
				var insertRow = desGrd.insertRow(desGrd.rowCount, true);
				insertRow.setRowData(data);
				insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			}
		});

		// 그리드의 모든 row를 선택 해제
		srcGrd.clearSelection();
		desGrd.clearSelection();
	}

	/**
	 * srcGridId에 모든 Row들을 desGridId에 복사한다. desGridId에 이미 있는 Row는 추가되지 않는다.
	 * 
	 * @param srcGridId
	 * @param desGridId
	 */
	ComUtil.prototype.copyAllGridData = function(srcGridId, desGridId) {
		/**
		 * @type cpr.controls.Grid
		 */
		var srcGrid = this._app.lookup(srcGridId);
		/**
		 * @type cpr.controls.Grid
		 */
		var desGrid = this._app.lookup(desGridId);

		if (srcGrid.rowCount == 0) {
			return;
		}

		var indices = [];
		// source 그리드의 모든 row를 복사.
		for (var rowIndex = 0; rowIndex < srcGrid.rowCount; rowIndex++) {
			// json 형식의 row의 데이터
			var data = srcGrid.getRow(rowIndex).getRowData();
			var str = [];
			// 이미 존재하는 row를 찾기 위해 row의 모든 column을 비교하는 조건 제작
			// str = "column1 == 'value1' && column2 == 'value2'..."
			for ( var key in data) {
				str.push(key + " == '" + data[key] + "'");
			}
			str = str.join(" && ");
			// 조건에 맞는 row 탐색
			var findRow = desGrid.findAllRow(str);
			// 조건에 해당하는 row가 없다면 target 그리드에 선택된 row를 추가
			if (findRow.length == 0) {
				var insertRow = desGrid.insertRow(desGrid.rowCount, true);
				insertRow.setRowData(data);
				insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			}
		}
	}

	/**
	 * 그리드에서 조건을 만족하는 로우를 찾아 주어진 Cell에 포커스를 부여한다.
	 * 
	 * @param gridId 그리드ID
	 * @param condition 조건식
	 * @param cellIdx 포커스를 부여할 Cell의 인덱스
	 */
	ComUtil.prototype.focusRowByCondition = function(gridId, condition, cellIdx) {
		/**
		 * @type cpr.controls.Grid
		 */
		var grid = this._app.lookup(gridId);

		var gridRow = grid.findFirstRow(condition);
		if (gridRow) {
			grid.focusCell(gridRow.getIndex(), cellIdx);
		}
	}

	/**
	 * 모달 팝업을 띄웁니다.
	 * 
	 * @param appid 팝업 화면 주소.
	 * @param width 팝업 창의 가로 사이즈.
	 * @param height 팝업 창의 세로 사이즈.
	 * @param handler 팝업이 닫힐 때 callback method.
	 */
	ComUtil.prototype.openDialog = function(appid/* string */, width/* number */, height/* number */, handler/* Function */, initValue/* {key:value} */) {
		// var rootApp = this.getRootApp();
		if (initValue == null) {
			initValue = {};
		}

		var dialogProp = {
			width : width,
			height : height,
			headerVisible : true,
			headerClose : true,
			resizable : true
		};

		// App에서 Dialog
		this._app.openDialog(appid, dialogProp, function(/* cpr.controls.Dialog */dialog) {
			if (handler) {
				dialog.addEventListenerOnce("close", handler);
			}
			if (initValue) {
				dialog.initValue = initValue;
				if (initValue["headerTitle"]) {
					dialog.headerTitle = initValue["headerTitle"];
				}
			}
		});
	}

	/**
	 * 모달리스 팝업을 띄웁니다.
	 * 
	 * @param appid 팝업 화면 주소.
	 * @param width 팝업 창의 가로 사이즈.
	 * @param height 팝업 창의 세로 사이즈.
	 * @param handler 팝업이 닫힐 때 callback method.
	 */
	ComUtil.prototype.openModalessDialog = function(appid/* string */, width/* number */, height/* number */, handler/* Function */, initValue/* {key:value} */) {

		if (initValue == null) {
			initValue = {};
		}

		var dialogProp = {
			width : width,
			height : height,
			headerVisible : true,
			headerClose : true,
			resizable : true
		};

		this._app.openDialog(appid, dialogProp, function(/* cpr.controls.Dialog */dialog) {
			dialog.headerTitle = dialog.title;
			dialog.modal = false;
			if (handler) {
				dialog.addEventListenerOnce("close", handler);
			}
			if (initValue) {
				dialog.initValue = initValue;
				if (initValue["headerTitle"]) {
					dialog.headerTitle = initValue["headerTitle"];
				}
			}
		});
	}
	/**
	 * 모달리스 팝업을 띄웁니다.
	 * 
	 * @param message 팝업 화면 주소.
	 */
	ComUtil.prototype.alert = function( alertType, /*string*/message) {
		notify("desktop-notify", {type:alertType,message:message});
	}
		
	globals.createComUtil = function(/* cpr.core.AppInstance */app) {
		return new ComUtil(app);
	}
}
