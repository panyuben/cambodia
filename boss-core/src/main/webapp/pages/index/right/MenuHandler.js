Ext.ns("MenuHandler");

/**
 * 判断是否已经查询了客户
 */
hasCust = function() {
	if (!App.getCustId()) {
		Alert('请先查找要操作的客户!');
		return false;
	}
	return true;
}
// 冲正
UnPay = function(record) {
	// 回调函数
	function callback(res, opt) {
		Alert('冲正成功!');
		App.main.infoPanel.setReload(true);
		App.main.infoPanel.getPayfeePanel().refresh();
		App.main.infoPanel.getAcctPanel().refresh();
		App.main.infoPanel.getDocPanel().setReload(true);
		App.main.infoPanel.getDoneCodePanel().setReload(true);
	}

	if (record) {
		var params = {};
		params["fee_sn"] = record.get("fee_sn");

		var url = Constant.ROOT_PATH + "/core/x/Pay!saveCancelFee.action";
		if (!Ext.isEmpty(record.get('invoice_id'))
				|| Ext.isEmpty(record.get('invoice_mode') == 'A')) {
			Confirm("发票" + record.get('invoice_id') + "将作废!该发票上的费用项需要重打，确定冲正?",
					this, function() {
						// 调用请求函数,详细参数请看busi-helper.js
						App.sendRequest(url, params, callback);
					});
		} else {
			Confirm("确定冲正吗?", this, function() {
						// 调用请求函数,详细参数请看busi-helper.js
						App.sendRequest(url, params, callback);
					});
		}
	} else {
		Alert('请选择要冲正的费用记录!');
		return false;
	}
	return false;
},

/**
 * 为MenuHandler添加处理函数
 */
Ext.apply(MenuHandler, {
	// 配置分公司账户
	ConfigBranchCom : function() {
		return {
			width : 500,
			height : 470
		};
	},
	// --------------------客户信息------------------------------------------------
	// 开户
	NewCust : function() {
		return {
			width : 500,
			height : 470
		};
	},
	/**
	 * 返销户.
	 */
	restoeCust:function(){
		if(!hasCust()){
			return false;
		}
		Confirm('是否确定返销户?',this,function(){
			Ext.getBody().mask('操作中,请稍候');
			
			var all = {custId:App.getApp().getCustId()};
			//公有的参数
			var common = App.getValues();
			all[CoreConstant.JSON_PARAMS] = Ext.encode(common);
			
			//业务提交提示框
			tip = Show();
			Ext.Ajax.request({
				scope : this,
				url : Constant.ROOT_PATH + "/core/x/Cust!restoeCust.action",
				params : all,
				success : function(res,opt){
					tip.hide();
					tip = null;
					var result = Ext.decode(res.responseText);
					if (result.success == true) {
						Alert('返销户成功!');
						Ext.getBody().unmask();
						App.search.doRefreshCust(result.custInfo.cust);
					}else{
						Alert('返销户失败,请联系管理员.');
					}
				}
			})
			
		});
		return false;
	},
	// 客户销户
	LogoffCust : function() {
		if (!hasCust())
			return false;
		var count = App.main.infoPanel.getUserPanel().userGrid.getStore()
				.getCount();
		if (count != 0) {
			Alert("请先注销该客户下的用户");
			return false;
		}
		var custDeviceGrid = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid;
		if (custDeviceGrid.GDDeviceArray.length > 0) {
			Alert("请先回收产权为广电的设备");
			return false;
		}
		// alert(custDeviceGrid.CustDeviceArray.length);
		// if(custDeviceGrid.CustDeviceArray.length > 0){
		// var o = {};
		// Confirm("是否回收自购的设备？",null,function(){
		// App.getApp().menu.hideBusiWin();
		// },function(){
		// o = {width: 500 , height: 450};
		// });
		// return o;
		// }else{
		// }
		return {
			width : 500,
			height : 450
		};
	},
	// 过户
	TransferCust : function() {
		if (!hasCust())
			return false;
		return {
			width : 500,
			height : 470
		};
	},
	CustTransfer : function() {//客户迁移
		if (!hasCust()){
			return false;
		}
		//必须在迁入客户所属区域营业厅办理 
//		var addr_id = App.getData().custFullInfo.cust.addr_id;
//		var arrArray = App.getData().deptAddress;
		/*
		if(!(App.getData().custFullInfo.cust.addr_id in App.getData().deptAddress)){
			Alert('当前客户无法在本营业厅执行客户迁移操作!');  //</br>请到客户开户营业厅办理!
			return false;
		}
		*/
		return {
			width : 500,
			height : 470
		};
	},
	// 客户拆迁
	RelocateCust : function() {
		if (!hasCust())
			return false;

		if (App.data.custFullInfo.cust.status == 'RELOCATE') {
			Alert('客户已经拆迁。')
			return false;
		}

		// 回调函数
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务保存成功!');
				App.getApp().refreshPanel('1119');// 1119：客户拆迁
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/Cust!relocateCust.action";

		var params = {};
		params['custId'] = App.getApp().getCustId();
		Confirm("确定客户拆迁吗?", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, params, callback);
				});

		return false;
	},
	// 加入单位
	JoinUnit : function() {
		if (!hasCust())
			return false;
		if (App.data.custFullInfo.cust.cust_type == "UNIT") {
			Alert('该客户为单位客户，不能加入单位!');
			return false;
		}
		return {
			width : 520,
			height : 400
		};
	},

	// 退出单位
	QuitUnit : function() {
		if (!hasCust())
			return false;
		// 回调函数
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务保存成功!');
				App.getApp().refreshPanel('1006');// 1006：退出单位
			}
		}

		var url = Constant.ROOT_PATH + "/core/x/Cust!quitUnit.action";
		var params = {};
		params['custId'] = App.getApp().getCustId();
		params['unitId'] = App.getCust().unit_id;

		Confirm("确定退出单位吗?", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, params, callback);
				});

		return false;
	},
	BankStop: function(){
		if (!hasCust())
			return false;
		// 回调函数
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务保存成功!');
				App.getApp().main.infoPanel.getCustPanel().custInfoPanel.remoteRefresh();
				App.getApp().main.infoPanel.getCustPanel().custDetailTab.propChangeGrid.remoteRefresh();
			}
		}

		var url = Constant.ROOT_PATH + "/core/x/Bank!bankStop.action";
		var params = {};
		params['custId'] = App.getApp().getCustId();
		Confirm("确定要暂停卡扣吗?", this, function() {
			// 调用请求函数,详细参数请看busi-helper.js
			App.sendRequest(url, params, callback);
		});

		return false;
	},
	EditBankPay:function(){
		if (!hasCust())
			return false;
		// 回调函数
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务保存成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid.remoteRefresh();
			}
		}

		var record = App.getApp().main.infoPanel.getUserPanel().prodGrid.getSelectionModel().getSelected();
		if (record) {
			App.getApp().selectRelativeUser([record.get('user_id')]);
		}
		var url = Constant.ROOT_PATH + "/core/x/User!changeCprodBank.action";
		var params = {};
		params['prodSn'] = record.get('prod_sn');
		
		var txt = "启用银行扣费吗?";
		if(record.get('is_bank_pay') == 'T'){
			txt = "禁止银行扣费吗?";
		}
		Confirm("确定该产品,"+txt, this, function() {
			// 调用请求函数,详细参数请看busi-helper.js
			App.sendRequest(url, params, callback);
		});

		return false;
	},
	BankResume: function(){
		if (!hasCust())
			return false;
		// 回调函数
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务保存成功!');
				App.getApp().main.infoPanel.getCustPanel().custInfoPanel.remoteRefresh();
				App.getApp().main.infoPanel.getCustPanel().custDetailTab.propChangeGrid.remoteRefresh();
			}
		}

		var url = Constant.ROOT_PATH + "/core/x/Bank!bankResume.action";
		var params = {};
		params['custId'] = App.getApp().getCustId();
		Confirm("确定要恢复卡扣吗", this, function() {
			// 调用请求函数,详细参数请看busi-helper.js
			App.sendRequest(url, params, callback);
		});

		return false;
	},
	// 修改客户信息处理函数
	EditCust : function() {
		if (!hasCust()) {
			return false;
		}
		return {
			width : 540,
			height : 470
		};
	},
	EditCustClass: function(){//修改优惠类型
		if (!hasCust()) {
			return false;
		}
		return {
			width : 590,
			height : 370
		};
	},
	BatchNewCust : function() {
		return {
			width : 540,
			height : 300
		};
	},
	RenewCust : function() {
		if(!hasCust())return false;
		var url = Constant.ROOT_PATH + "/core/x/Cust!renewCust.action";
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务保存成功!');
				App.getCust().status = result.simple_obj;
				App.getApp().refreshPanel('1220');
			}
		}
		Confirm("确定恢复客户状态吗?", this, function() {
					App.sendRequest(url, null, callback);
				});
		return false;
	},
	SwitchDevice:function(){
		if (!hasCust()){
			return false;
		}
		var continueFlag = true;
		var custDeviceGrid = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid
		var userGrid = App.getApp().main.infoPanel.userPanel.userGrid;
		var record = userGrid.getSelectionModel().getSelected();
		if(record.get('modem_mac')){//TODO 如果有猫,暂时不给换.
			Alert('当前用户有不符合更换要求的设备');
			return false;
		}
		// 关闭过滤窗口
		if (Ext.getCmp('filterWinID')) {
			Ext.getCmp('filterWinID').close();
			var index = userGrid.getStore().find('device_code',
					record.get('device_code'));
			userGrid.getSelectionModel().selectRow(index);
		}
		if(continueFlag){
			return {width : 650,height : 310};
		}else{
			Alert('该用户现在不能进行设备互换');
			return false;
		}
	},
	// 更换设备
	ExchangeDevice : function() {
		if (!hasCust())
			return false;
		var custDeviceGrid = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid
		var record = custDeviceGrid.getSelectionModel().getSelected();
		/*
		 * if(records.length == 0){ Alert('请选择更换的设备'); return false; }else
		 * if(records.length>1){ Alert('只能对一个设备进行更换，请选择一个设备'); return false; }
		 * if(records[0].get('status')!='USE'){
		 * Alert('选择的设备状态为未使用的设备，请选择使用的设备'); return false; }
		 * if(records[0].get('loss_reg') === 'T'){ Alert('挂失的设备不能更换！'); return
		 * false; }
		 */

		// 关闭过滤窗口
		if (Ext.getCmp('filterWinID')) {
			Ext.getCmp('filterWinID').close();
			var index = custDeviceGrid.getStore().find('device_code',
					record.get('device_code'));
			custDeviceGrid.getSelectionModel().selectRow(index);
		}

		return {
			width : 550,
			height : 550
		};
	},
	// 购买终端
	BuyDevice : function() {
		if (!hasCust())
			return false
		return {
			width : 640,
			height : 500
		};
	},
	//购买保修
	BuyReplacover : function() {
		if (!hasCust())
			return false
		return {
			width : 530,
			height : 260
		};
	},
	// 购买配件
	BuyMaterial : function() {
		if (!hasCust())
			return false
		return {
			width : 540,
			height : 300
		};
	},
	// 挂失
	RegLoss : function() {
		if (!hasCust())
			return false;
		var record = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid
				.getSelectionModel().getSelected();

		// if(Ext.isEmpty(record)){
		// Alert('请选择要挂失的设备！');
		// return false;
		// }
		// if(record.get('loss_reg') === 'T'){
		// Alert('请选择没有挂失的设备！');
		// return false;
		// }
		// if(record.get('status') !== 'IDLE' && record.get('status') !==
		// 'REQSTOP'){
		// Alert('请选择状态为报停或空闲的设备！');
		// return false;
		// }
		var url = Constant.ROOT_PATH + "/core/x/Cust!saveRegLossDevcie.action";
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('挂失成功!', function() {
							App.main.infoPanel.getCustPanel().custDeviceGrid
									.remoteRefresh();
						}, this);
			}
		}
		var params = {};
		params['deviceId'] = record.get('device_id');
		Confirm("确定挂失吗?", this, function() {
					App.sendRequest(url, params, callback);
				});
		return false;
	},
	// 取消挂失
	CancelLoss : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid
				.getSelectionModel().getSelections();

		if (records.length === 0) {
			Alert('请选择要取消挂失的设备！');
			return false;
		}
		if (records[0].get('loss_reg') === 'F') {
			Alert('请选择已经挂失的设备');
			return false;
		}
		var url = Constant.ROOT_PATH
				+ "/core/x/Cust!saveCancelLossDevcie.action";
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('取消挂失成功!', function() {
							App.main.infoPanel.getCustPanel().custDeviceGrid
									.remoteRefresh();
						}, this);
			}
		}
		var params = {};
		params['deviceId'] = records[0].get('device_id');
		Confirm("确定取消挂失吗?", this, function() {
					App.sendRequest(url, params, callback);
				});
		return false;
	},
	// 打印标记
	PrintStatus : function() {
		if (!hasCust())
			return false;
		var grid = App.getFeeGridWithTargetElement();	
		var record = grid.getSelectionModel().getSelected();
		var url = Constant.ROOT_PATH + "/core/x/Pay!savePrintStatus.action";
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('不打印标记成功!', function() {
					grid.remoteRefresh();
				}, this);
			}
		}
		var params = {};
		params['fee_sn'] = record.get('fee_sn');
		Confirm("确定不打印吗?", this, function() {
			App.sendRequest(url, params, callback);
		});
		return false;
	},
	// 取消打印标记
	CancelPrintStatus : function() {
		if (!hasCust())
			return false;
		var grid = App.getFeeGridWithTargetElement();	
		var record = grid.getSelectionModel().getSelected();
		var url = Constant.ROOT_PATH + "/core/x/Pay!saveCancelPrintStatus.action";
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('打开标记成功!', function() {
							grid.remoteRefresh();
						}, this);
			}
		}
		var params = {};
		params['fee_sn'] = record.get('fee_sn');
		Confirm("确定打开打印标记吗?", this, function() {
					App.sendRequest(url, params, callback);
				});
		return false;
	},
	// 销售设备
	SaleDevice : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid
				.getSelectionModel().getSelections();
		if (records.length === 0) {
			Alert('请选择要销售的设备！');
			return false;
		}
		if (records[0].get('ownership') == 'CUST') {
			Alert("设备的产权是客户的,不允许销售");
			return false;
		}
		return {
			width : 540,
			height : 330
		};
	},
	// 修改购买方式
	ChangeDeviceType : function() {
		var record = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid.getSelectionModel().getSelected();
		var btn = {text:'修改购买方式',attrs:App.data.currentResource};
		var cfg = {width : 560,height : 460}; 
		if(record.get('depot_id') == App.data.optr['dept_id']){
			App.menu.bigWindow.show(btn,cfg);
		}else{
			var msg = '当前营业厅非购买设备营业厅，请先切换到['+record.get('depot_name')+']再操作！';
			Ext.Msg.show({
                title : '提示',
                msg : msg,
                width:300,
                buttons: {cancel : "<font size='2'><b>返回</b></font>"},
                scope : this
            });
            
			return false;
		}
//		return {
//			width : 540,
//			height : 330
//		};
	},
	ChangeOwnership : function() {
		if (!hasCust())
			return false;

		var record = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid
				.getSelectionModel().getSelected();

		var ownership = record.get('ownership'), msg;
		if (ownership == CoreConstant.OWNERSHIP_GD) {
			msg = '确定将产权修改为个人？';
		} else {
			msg = '确定将产权修改为广电？';
		}

		Confirm(msg, this, function() {
			App.sendRequest(Constant.ROOT_PATH
							+ "/core/x/Cust!changeOwnership.action", {
						deviceId : record.get('device_id')
					}, function(res, opt) {
						var data = Ext.decode(res.responseText);
						if (data['success'] == true) {
							Alert('修改产权成功!');
							App
									.getApp()
									.refreshPanel(App.getApp().getData().currentResource.busicode);
						}
					});
		});

		return false;
	},
	// 回收设备
	ReclaimDevice : function() {
		if (!hasCust())
			return false;
		var deviceids = App.getApp().main.infoPanel.getCustPanel().custDeviceGrid
				.getSelectionModel().getSelections();
		if (deviceids.length == 0) {
			Alert('请选择要回收的设备!');
			return false;
		}
		if (deviceids[0].get("status") == "USE") {
			Alert("设备的在使用中,不允许回收");
			return false;
		};
		return {
			width : 540,
			height : 330
		};
	},
	ChangeNonresCust: function(){
		if(!hasCust()) return false;
		if (App.data.custFullInfo.cust.cust_type != 'RESIDENT') {
			Alert('只能居民客户转集团客户')
			return false;
		}
//		if(App.main.infoPanel.getCustPanel().packageGrid.getStore().getCount() > 0){
//			Alert('请退订客户套餐后再转集团')
//			return false;
//		}
		return {
			width:520,
			height:500
		};
	},
	// 预存费用冲正
	DestineUnPay : function() {
		var record = App.main.infoPanel.getPayfeePanel().acctFeeGrid
				.getSelectionModel().getSelected();
		return UnPay(record);
	},
	// 业务费用冲正
	BusinessUnPay : function() {
		var record = App.main.infoPanel.getPayfeePanel().busiFeeGrid
				.getSelectionModel().getSelected();
		return UnPay(record);
	},
	// 退押金
	DepositUnPay : function() {
		if (!hasCust())
			return false;
		var records = App.main.infoPanel.getPayfeePanel().busiFeeGrid
				.getSelectionModel().getSelected();
		var url = Constant.ROOT_PATH + "/core/x/Pay!saveDepositUnPay.action";
		// 回调函数
		function callback(res, opt) {
			if (res.responseText == 'true') {
				Alert('退押金成功!', function() {
							App.main.infoPanel.getPayfeePanel().busiFeeGrid
									.remoteRefresh();
						}, this);
			}
		}
		if (records.get('status') !== 'PAY') {
			Alert('费用未支付！');
			return false;
		}
		if (records.get('deposit') == 'F') {
			Alert('该费用不是押金！');
			return false;
		}
		var params = {};
		params['feeSn'] = records.get('fee_sn');
		Confirm("确定退押金吗?", this, function() {
					App.sendRequest(url, params, callback);
				});
		return false;
	},
	BatchJoinUnit : function() {
		if (!hasCust())
			return false;
		return {
			width : 700,
			height : 450
		};
	},
	EditPay : function() {
		return {
			width : 600,
			height : 400
		};
	},
	EditDoneRemark: function(){
		return {
			width : 400,
			height : 400
		};
	},
	EditAdjustReason: function(){
		return {
			width : 400,
			height : 300
		};
	},
	// ----------------------用户信息---------------------------------------------------
	// 用户开户
	NewUser : function() {
		if (!hasCust()) {
			return false;
		}
		return {
			width : 550,
			height : 360
		};
	},
	// 用户销户
	LogoffUser : function() {
		if (!hasCust())
			return false;
		var userGrid = App.main.infoPanel.getUserPanel().userGrid;
		var userRecords = userGrid.getSelections();

		var len = userRecords.length;// 选中记录

		if (len == 0) {
			Alert('请选择用户');
			return false;
		} else {
			var dtv = false;// 如果选中的用户中不存在数字电视
			for (i = 0; i < len; i++) {
				if (userRecords[i].get("status") != "ACTIVE" && ( userRecords[i].get("status") != "OWELONG" ) ) {
					Alert("选择的用户状态非正常");
					return false;
				}
				if (userRecords[i].get("user_type") == 'DTV') {
					dtv = true;
				}
			}
			if (dtv) {// 存在数字电视
				var userIds = userGrid.getSelectedUserIds().join(',') + ',';
				var store = userGrid.getStore();
				// 选中用户数不等于总数
				if (len != store.getCount()) {
					var flag = true;// 没选中的用户中没有主终端
					var flag2 = true;// 选中的用户没有主终端
					var dtvAmount = 0;
					for (var i = 0; i < store.getCount(); i++) {
						var record = store.getAt(i);
						if (record.get('user_type') != 'BAND') {
							if (record.get('terminal_type') == 'ZZD') {
								// 不在选中的用户中
								if (userIds
										.indexOf(record.get('user_id') + ",") == -1) {
									flag = false;// 没选中的用户中有主终端
									break;
								} else {
									flag2 = false;// 选中的用户中有主终端
								}
							}

							// 数字电视数
							dtvAmount = dtvAmount + 1;
						}
					}
					// 选中的用户中有主终端,没选中的用户中没有主终端,有未选中的数字用户
					if (!flag2 && flag && dtvAmount != len) {
						Alert('主终端不能先销户');
						return false;
					}
					
				}
			}
			
			var prodMap = App.main.infoPanel.getUserPanel().prodGrid.prodMap;
			var acctGrid = App.getApp().main.infoPanel.getAcctPanel().acctGrid;
			var acctMap = {};
			for(var loopFlag =0;loopFlag<acctGrid.store.getCount();loopFlag++){
				var acctData = acctGrid.store.getAt(loopFlag).data;
				var uid = acctData.user_id;
				if(!uid || !acctData.acctitems){
					continue;
				}
				for(var idx = 0;idx<acctData.acctitems.length;idx++){
					var item = acctData.acctitems[idx];
					if(item.is_base != 'T'){
						continue;
					}
					acctMap[uid] = item;
				}
			}
			
			for(var ii = 0;ii<userRecords.length;ii++){
				var uid = userRecords[ii].get('user_id');
				
				var item = acctMap[uid];
				if(item && item.real_balance <0){
					Alert('有基本包产品欠费,不能销户!');
					return false;
				}
				
				var array = prodMap[uid];
				if(!array || array.length ==0){
					continue;
				}
				for(var idx = 0;idx<array.length;idx++){
					var prod = array[idx];
					if(prod.is_base == 'T' && prod.status != 'ACTIVE'){
						Alert('有基本包产品状态不正常,不能销户!');
						return false;
					}
				}
			}

			return {
				width : 650,
				height : 450
			};

		}
	},
	ChangeCust : function(){
	  	if(!hasCust()) return false;
	  	
	  	return {width: 540 , height: 600};
  	},
	//免费终端（管理员）
	FreeUserDevice : function(){
		return {
			width : 570,
			height : 400
		};
	},
	//免费终端通用
	FreeUserGeneral : function(){
		var store = App.getApp().main.infoPanel.getUserPanel().userGrid.getStore();
		var record = App.getApp().main.infoPanel.getUserPanel().userGrid.getSelectionModel().getSelected();
		
		var num = 0;
		store.each(function(item){
			if(item.get("terminal_type") == "FZD" && item.get("str19") == "T"){
				num++;
			}
		});
		
		if(num >= 2 && record.get('str19') != 'T'){
			Alert("免费终端不能超过2台");
			return false;
		}
		return {
			width : 570,
			height : 400
		};
	},
	// 排斥资源
	RejectRes : function() {
		return {
			width : 540,
			height : 400
		};
	},
	// 模拟转数字
	AtvToDtv : function() {
		return {
			width : 540,
			height : 500
		};
	},
	// 开通双向
	OpenDuplex : function() {
		if (!hasCust())
			return false;
		var records = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();

		var flag = true;
		if (records[0].get('stb_id')) {
			Ext.Ajax.request({
						url : root
								+ '/commons/x/QueryDevice!queryStbModel.action',
						async : false,// 同步请求
						params : {
							stbId : records[0].get('stb_id')
						},
						success : function(res, opt) {
							var rec = Ext.decode(res.responseText);
							if (rec.interactive_type == 'SINGLE') {
								Alert('该用户机顶盒交互方式是单向的，无法开通双向');
								flag = false;
							}
						}
					})
		} else {
			Alert('用户必选拥有交互方式双向的机顶盒');
			return false;
		}
		if (!flag) {
			return false;
		}

		return {
			width : 540,
			height : 530
		};
	},
	// 取消双向
	CancelDuplex : function() {
		if (!hasCust())
			return false;
		var userPanel = App.main.infoPanel.getUserPanel();
		var userRecord = userPanel.userGrid.getSelectionModel().getSelected();
		var prodStore = userPanel.prodGrid.getStore();
		var flag = false;// 是否有ITV的产品
		prodStore.each(function(record) {
					if (record.get('serv_id') == 'ITV') {
						flag = true;
						return false;
					}
				});
		if (flag === true) {
			Alert('用户下有互动电视产品，请退订后再操作!');
			return false;
		}

		Confirm("确定取消双向吗?", this, function() {
			App.sendRequest(Constant.ROOT_PATH
							+ "/core/x/User!saveCancelOpenInteractive.action",
					null, function(res, opt) {
						var data = Ext.decode(res.responseText);
						if (data['success'] === true) {
							Alert('取消双向成功!');
							App
									.getApp()
									.refreshPanel(App.getApp().getData().currentResource.busicode);
						}
					});
		});
		return false;
	},
	// 修改接入方式
	EditNetType : function() {
		return {
			width : 520,
			height : 200
		};
	},
	// 修改宽带密码
	EditNetPassword : function() {
		return {
			width : 550,
			height : 200
		};
	},
	// 临时授权
	OpenTemp : function() {
		var prodStore = App.main.infoPanel.getUserPanel().prodGrid.getStore();
		if (prodStore.getCount() == 0) {
			Alert('用户无基本包!');
			return false;
		}
		for (var i = 0; i < prodStore.getCount(); i++) {
			if (prodStore.getAt(i).get('prod_type') == 'BASE'
					&& prodStore.getAt(i).get('is_base') == 'T') {
				if (prodStore.getAt(i).get('status') == 'OWESTOP') {
					var acctId = prodStore.getAt(i).get('acct_id');
					var prodId = prodStore.getAt(i).get('prod_id');

					var acctStore = App.main.infoPanel.getAcctPanel().acctGrid
							.getStore();

					for (var k = 0; k < acctStore.getCount(); k++) {
						var rec = acctStore.getAt(k);
						if (rec.get('acct_id') == acctId) {
							var acctItems = rec.get('acctitems');
							for (var j = 0; j < acctItems.length; j++) {
								if (acctItems[j]['acctitem_id'] == prodId) {
									if (acctItems[j]['real_balance'] > 1) {
										Alert('基本包已充值，请稍等半分钟');
										return false;
									}
									break;
								}
							}
						}
					}
				} else {
					Alert('用户的基本包产品['+prodStore.getAt(i).get('prod_name')+']状态不是欠费停机！');
					return false;
				}
				
			}
		}
		
		Confirm("确定授权吗?", this, function() {
					App.sendRequest(Constant.ROOT_PATH
									+ "/core/x/User!saveOpenTemp.action", null,
							function(res, opt) {
								var data = Ext.decode(res.responseText);
								if (data == true) {
									Alert('临时授权成功!');
									App.getApp().main.infoPanel.getUserPanel().userGrid
											.remoteRefresh();
								}
							});
				});
		return false;
	},
	/**
	 * 批量临时授权.
	 */
	OpenTempBatch:function(){
		var userGrid = App.getApp().main.infoPanel.getUserPanel().userGrid;
		var users = userGrid.getSelections();
		if(users.length==0){
			Alert('未选中任何用户!');
			return false;
		}
		//验证过滤用户类型
		var flag = false;
		for(var index =0;index<users.length;index++){
			var data = users[index].data;
			var userId = data.user_id;
			if(data['user_type'] == 'ATV' || (data['user_type'] == 'DTV' && data['terminal_type'] !='ZZD' && Ext.isEmpty(data['card_id'])) ){
				userGrid.selModel.deselectRow(userGrid.store.find('user_id',userId));
			}
		}
		
		users = userGrid.getSelections();
		if(users.length==0){
			Alert('选中的用户没有符合可临时授权的条件!');
			return false;
		}
		
		var store = userGrid.getStore();
		var flag = false;
		store.each(function(record){
			//主机非正常状态,超额不能临时授权
			if(record.get('user_type') == 'DTV' && record.get('terminal_type') == 'ZZD' && record.get('status') != 'ACTIVE' && record.get('status') != 'OWESTOP' && record.get('status') != 'OUNSTOP'){
				flag = true;
				return false;
			}
		},store);
		for(var index =0;index<users.length;index++){
			var data = users[index].data;
			var userId = data.user_id;
			if(data['user_type'] == 'DTV' && data['terminal_type'] !='ZZD'  && data['str19'] != 'T' && flag){//超额副机
				userGrid.selModel.deselectRow(userGrid.store.find('user_id',userId));
			}
		}
		users = userGrid.getSelections();
		if(users.length==0){
			Alert('选中的用户有超额副机，但主机状态非正常，不能进行临时授权!');
			return false;
		}
		
		
		var prodMap = App.main.infoPanel.getUserPanel().prodGrid.prodMap;
		//遍历验证是否已经停机,
		var acctStore = App.main.infoPanel.getAcctPanel().acctGrid.getStore();
		var acctDatas = {};//keyByAcctId
		acctStore.each(function(rec){
			var data = rec.data;
			acctDatas[data.acct_id] = data;
		});
		
		
		for(var index =0;index<users.length;index++){
			var user = users[index];
			var userId = user.get('user_id');
			var prods = prodMap[userId];
			for(idx =0;idx<prods.length;idx++){
				var prod = prods[idx];
				if(prod.prod_type == 'BASE' && prod.is_base == 'T'){
					if(prod.status =='OWESTOP'){
						var acctId = prod.acct_id;
						var prodId = prod.prod_id;
						var acctData = acctDatas[acctId];
						var acctItems = acctData.acctitems;
						for (var j = 0; j < acctItems.length; j++) {
							if (acctItems[j]['acctitem_id'] == prodId) {
								if (acctItems[j]['real_balance'] > 1) {
									userGrid.selModel.deselectRow(userGrid.store.find('user_id',userId));
								}
								break;
							}
						}
					
					}else{
						userGrid.selModel.deselectRow(userGrid.store.find('user_id',userId));
					}
				}
			}
		}
		
		users = userGrid.getSelections();
		if(users.length==0){
			Alert('选中的用户没有符合可临时授权的条件,或者已经充值!');
			return false;
		}
		
		Confirm("确定授权吗?", this, function() {
					App.sendRequest(Constant.ROOT_PATH + "/core/x/User!saveOpenTempBatch.action", null,
							function(res, opt) {
								var data = Ext.decode(res.responseText);
								if (data == true) {
									Alert('临时授权成功!');
									App.getApp().main.infoPanel.getUserPanel().userGrid.remoteRefresh();
								}
							});
				});
		return false;
	},
	// 用户修改资料
	EditUser : function() {
		if (!hasCust()) {
			return false;
		}
		var userRecords = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();
		if (userRecords.length != 1) {
			Alert('请选择一个用户!');
			return false;
		} else if (userRecords[0].get("status") != "ACTIVE" && userRecords[0].get("status") != "OWELONG") {
			Alert("请选择【正常】状态的用户");
			return false;
		} else {
			return {
				width : 550,
				height : 400
			};
		}

	},
	EditStb : function() {
		if (!hasCust()) {
			return false;
		}
		return {
			width : 450,
			height : 300
		};
	},
	EditsSingleCard : function() {
		if (!hasCust()) {
			return false;
		}
		var selectUser = App.main.infoPanel.getUserPanel().userGrid.getSelectionModel().getSelected();
		//双向数字用户
		if(selectUser.get('user_type') == 'DTV' && selectUser.get('serv_type') == 'DOUBLE'){
			var userStore = App.main.infoPanel.getUserPanel().prodGrid.getStore();
			
			var flag = false;// 是否有ITV的产品
			userStore.each(function(record) {
					if (record.get('serv_id') == 'ITV') {
						flag = true;
						return false;
					}
				});
			if (flag === true) {
				Alert('用户下有互动电视产品，请退订后再操作!');
				return false;
			}
			
			
			var items = userStore.query('user_type','BAND');
			//该客户下是否有宽带用户
			if(items.getCount() > 0){
				var stbId = selectUser.get('stb_id'), modemMac = selectUser.get('modem_mac');
				var isShare = false;		//当前双向用户是否和宽带共用一个MODEM
				items.each(function(record){
					if(record.get('modem_mac') == modemMac){
						isShare = true;
						return false;
					}
				});
				
				//如果双向用户是虚拟机猫一体，且和宽带共用MODEM，则不能转换一体机
				if(isShare === true){
					var deviceStore = App.main.infoPanel.getCustPanel().custDeviceGrid.getStore();
					var isVirtual = 'F';
					deviceStore.each(function(record){
						if(record.get('device_code') == stbId && record.get('pair_modem_code') == modemMac){
							isVirtual = record.get('is_virtual_modem');
							return false;
						}
					});
					
					if(isVirtual == 'T'){
						Alert('当前双向用户使用机MODEM虚拟一体机，且有宽带共用MODEM，不能转换一体机!');
						return false;
					}
					
				}
			}
		}
		
		return {
			width : 540,
			height : 350
		};
	},
	// 修改支付密码
	EditUserPassword : function() {
		if (!hasCust()) {
			return false;
		}
		return {
			width : 540,
			height : 400
		};
	},
	EzdToFzd : function() {
		if (!hasCust()) {
			return false;
		}
		return {
			width : 540,
			height : 500
		};
	},
	// 报停
	UserStop : function() {
		if (!hasCust()) {
			return false;
		}
		var userGrid = App.main.infoPanel.getUserPanel().userGrid;
		var userRecords = userGrid.getSelections();

		var len = userRecords.length;// 选中记录

		var zzdUser = userGrid.store.getAt(userGrid.store.find('terminal_type','ZZD'));
		if (len == 0) {
			Alert('请选择用户');
			return false;
		} else {
			var dtv = false;// 如果选中的用户中不存在数字电视
			var dtvNum = 0 ;//选中的数字电视用户数 
			for (i = 0; i < len; i++) {
				if (userRecords[i].get("status") != "ACTIVE" && userRecords[i].get("status") != "OWELONG") {
					Alert("选择的用户状态非正常");
					return false;
				}
				if (userRecords[i].get("user_type") == 'DTV') {
					dtv = true;
					dtvNum++;
				}
				if(userRecords[i].get('terminal_type') == 'FZD' && zzdUser.get('status') == 'REQSTOP'){
					Alert("主终端状态为报停,不能进行当前业务!");
					return false;
				}
			}
			if (dtv) {// 存在数字电视
				var selectedUseridArr = userGrid.getSelectedUserIds(); 
				var userIds = selectedUseridArr.join(',') + ',';
				var oweFeeAcctids = App.getApp().getUserBaseProdOweFeeAccts(selectedUseridArr);
				
				if(!Ext.isEmpty(oweFeeAcctids)){
//					App.getApp().main.infoPanel.activate('ACCT_PANEL');
					Alert('有基本产品欠费,请先缴费');
					return false;
				}else{
					var store = userGrid.getStore();
					// 选中用户数不等于总数
					if (len != store.getCount()) {
						var flag = true;// 没选中的用户中没有主终端
						var flag2 = true;// 选中的用户没有主终端
						var dtvAmount = 0;
						for (var i = 0; i < store.getCount(); i++) {
							var record = store.getAt(i);
							if (record.get('user_type') != 'BAND'
									&& record.get("status") == "ACTIVE") {
								if (record.get('terminal_type') == 'ZZD') {
									// 不在选中的用户中
									if (userIds.indexOf(record.get('user_id') + ",") == -1) {
										flag = false;// 没选中的用户中有主终端
										break;
									} else {
										flag2 = false;// 选中的用户中有主终端
									}
								}
	
								// 数字电视数
								dtvAmount = dtvAmount + 1;
							}
						}
						// 选中的用户中有主终端,没选中的用户中没有主终端,有未选中的数字用户
						if (!flag2 && flag && dtvAmount != dtvNum) {
							Alert('主终端不能先报停');
							return false;
						}
					}
				}
			}
			return {
				width : 540,
				height : 460
			};	
		}
	},
	// 报开
	UserOpen : function() {
		if (!hasCust()) {
			return false;
		}
		var userRecords = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();
		var typecout = 0;
		if (userRecords.length == 0) {
			Alert('请选择要报开的用户!');
			return false;
		}
		var arr = [];
		var store = App.main.infoPanel.getUserPanel().userGrid.getStore();
		for (i = 0; i < store.getCount(); i++) {
			if (store.getAt(i).data.user_type == 'DTV') {
				arr.push(store.getAt(i).data);
			}
		}
		var allDtvNum = 0;  //所有主终端
		var selectFZD = 0;  //选中的非主终端
		var selectZZD = 0; //选中的主终端
		for (i = 0; i < arr.length; i++) {
			if (arr[i].status == "REQSTOP" && arr[i].terminal_type == "ZZD") {
				allDtvNum++;
			}
		}
		var zzdUser = store.getAt(store.find('terminal_type','ZZD'));
		for (i = 0; i < userRecords.length; i++) {
			if (userRecords[i].get("status") != "REQSTOP") {
				Alert("请选择【报停】状态的用户");
				return false;
			};
			if (userRecords[i].get("serv_type") == "SINGLE"
					&& Ext.isEmpty(userRecords[i].get("stb_id"))) {
				typecout++;
			}
			if (userRecords[i].get("serv_type") == "DOUBLE"
					&& (Ext.isEmpty(userRecords[i].get("stb_id")) || Ext
							.isEmpty(userRecords[i].get("modem_mac")))) {
				typecout++;
			}
			if (userRecords[i].get("user_type") == "BAND"
					&& Ext.isEmpty(userRecords[i].get("modem_mac"))) {
				typecout++;
			}
			if (typecout > 1) {
				Alert("请选择1个需要补充设备的用户");
				return false;
			}
			if (userRecords[i].get("user_type") == "DTV" && userRecords[i].get("status") == "REQSTOP" && userRecords[i].get("terminal_type")== "ZZD") {
				selectZZD++;
			}
			if (userRecords[i].get("user_type") == "DTV" && userRecords[i].get("status") == "REQSTOP" && userRecords[i].get("terminal_type") != "ZZD"){
				selectFZD++;
			}
		}
		if(selectFZD > 0 && selectZZD != allDtvNum){
			Alert("主终端状态为报停,不能进行当前业务!");
			return false;
		}
		
		return {
			width : 580,
			height : 500
		};
	},
	UserInvalid : function(){
		if (!hasCust())
			return false;
			
		//判断用户下是否为数字电视用户
		var countNum = 0;
		var store = App.main.infoPanel.getUserPanel().userGrid.getStore();
		for (i = 0; i < store.getCount(); i++) {
			if (store.getAt(i).data.user_type == 'DTV') {
				countNum++;
			}
		}
		if(countNum<=0){
			Alert('该客户下无数字用户，无法进行重算到期日期!');
			return false;
		}
			
			// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('添加到期日重算任务成功，请重新搜索客户查看!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!userInvalid.action";

		Confirm("确定添加到期日重算任务吗?", this, function() {
					App.sendRequest(url, null, callback);
				});
		return false;
	},

	// 续报停
	EditUserStop : function() {
		if (!hasCust())
			return false;
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('续报停成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!editUserStop.action";

		Confirm("确定续报停吗?", this, function() {
					App.sendRequest(url, null, callback);
				});
		return false;
	},
	//取消授权
	CancelAuth : function() {
	 if (!hasCust())
			return false;
		// 回调函数
		function callback(res, opt) {
			if (res.responseText == 'true') {
				Alert('取消授权成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!cancelCaAuth.action";

		Confirm("确定取消授权码？取消授权后该用户将无法收看任何节目。", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, null, callback);
				});

		return false;
		 
	},
	PayAtvFee : function() {
		if (!hasCust())
			return false

		return {
			width : 540,
			height : 350
		};
	},
	CancelPromotion : function() {
		if (!hasCust())
			return false;

		var record = App.main.infoPanel.getUserPanel().userDetailTab.promotionGrid
				.getSelectionModel().getSelected();

		var promotion_sn = record.get('promotion_sn');

		Confirm("确定回退促销?", this, function() {
			App.sendRequest(Constant.ROOT_PATH
							+ "/core/x/User!saveCancelPromotion.action", {
						promotionSn : promotion_sn
					}, function(res, opt) {
						var data = Ext.decode(res.responseText);
						if (data === true) {
							Alert('回退促销成功!');
							App
									.getApp()
									.refreshPanel(App.getApp().getData().currentResource.busicode);
						}
					});
		});

		return false;
	},
	//变更促销
	ChangePromotionProd: function(){
		if(!hasCust())return false;
		var record = App.getApp().main.infoPanel.getUserPanel().userDetailTab.promotionGrid
				.getSelectionModel().getSelected();
		var userId = record.get('user_id');
		// 选中真正操作的用户
		if (userId != null)
			App.getApp().selectRelativeUser([userId]);
				
		return {width: 850 , height: 450};
	},
	//主机产品同步
	SyncZzdProd : function(){
		if(!hasCust())return false
		return {width: 650 , height: 400};
	},
	//修改预开通日期
	ChangeProdPreOpenTime : function(){
		return {
			width : 400,
			height : 240
		};
	},
	//修改公用账目使用类型
	ChangePublicAcctItemType : function(){
		return {
			width : 360,
			height : 200
		};
	},
	//订购
	OrderProd: function(){
		if(!hasCust())return false
		var userRecords =  App.main.infoPanel.getUserPanel().userGrid.getSelections();
		var len = userRecords.length;
		if (len == 0) {
			Alert('请先选择用户!');
			return false;
		}

		for (var i = 0; i < len; i++) {
			if (userRecords[i].get("status") != "ACTIVE" && userRecords[i].get("status") != "OWELONG" ) {
				Alert("所选用户的状态必须是正常");
				return false;
			}
			for (var j = i + 1; j < len; j++) {
				if (userRecords[i].get('user_type') != userRecords[j]
						.get('user_type')) {

					Alert("用户的类型必须一致");
					return false;
				}
			}
		}
		return {
			width : 600,
			height : 550
		};
	},
	// 取消套餐
	CancelPromFee : function() {
		if(!hasCust())return false;
		var url = Constant.ROOT_PATH+"/core/x/Acct!cancelPromFee.action";
		var record = App.getApp().main.infoPanel.custPanel.custDetailTab.promFeeGrid.selModel.getSelected();
		if(!record || Ext.isEmpty(record.get('done_code'))){
			Alert('未能正确获取数据！');return false;
		}
		Ext.Ajax.request({
			url : Constant.ROOT_PATH+"/core/x/Acct!queryPromAcctItemInactive.action",
			params:{doneCode:record.get('done_code'),custId:App.getCustId(),query:'F'},//query标记是否从历史表取
			scope:this,
			timeout:99999999999999,//12位 报异常
			success:function(res,opt){
				var datas = Ext.decode(res.responseText);
				var msg = '是否确认失效套餐缴费记录?';
				var actInfo = '';
				var prodMap = App.getApp().main.infoPanel.userPanel.prodGrid.prodMap;
				if(!datas || datas.length <=0){
					datas = [];
				}
				for(var index =0;index<datas.length;index++){
					for(var userid in prodMap){
						var arr = prodMap[userid];
						if(arr && arr.length>0){
							if(datas[index].acct_id != arr[0].acct_id){
								continue;
							}
							for(var idx =0;idx<arr.length;idx++){
								var item = arr[idx];
								if(datas[index].acct_id == item.acct_id && datas[index].acctitem_id == item.prod_id){
									actInfo += '' + item.prod_name + ' 冻结金额  '  + (datas[index].init_amount/100) + ' 元,(其中已解冻 ' + (datas[index].use_amount /100) + ' 元)</br>';
								}
							}
						}
					}
				}
				Ext.Msg.prompt('提示', '<font color="red">' + (Ext.isEmpty(actInfo)?actInfo:'以下账目冻结余额将被取消，请按实际情况调账处理</br>' + actInfo ) + msg + '</font>', function(value,remark){
				if(value == 'cancel'){
					return;
				}
				App.sendRequest(url, {promFeeSn:record.get('prom_fee_sn'),reason:remark}, function(){
					record.set('status','INVALID');
					Ext.getCmp('C_PROMFEE').remoteRefresh();
				});
			}, this, true, '备注信息')//
			}
		})
		return false;
	},
	OrderPkg : function() {
		if (!hasCust())
			return false
		return {
			width : 700,
			height : 550
		};
	},
	// 修改套餐
	EditPkg : function() {
		if (!hasCust())
			return false
		return {
			width : 700,
			height : 550
		};
	},
	//重算到期日
	ReCalcInvalidDate:function(){
		if(!hasCust())return false
		var prodGrid = App.getApp().main.infoPanel.getUserPanel().prodGrid;
		var prodData = prodGrid.selModel.getSelected().data;
		
		var acctStore = App.getApp().main.infoPanel.acctPanel.acctGrid.store;
		var acctData = acctStore.getAt(acctStore.find('acct_id',prodData.acct_id));
		var acctItems = acctData.data.acctitems;
		var item = null;
		for(var index = 0;index < acctItems.length;index++ ){
			item = acctItems[index];
			if(item.acctitem_id == prodData.prod_id){
				break;
			}
			item = null;
		}
		if( ( item.real_balance - item.real_fee ) <=0 ){
			Alert('产品余额不足，不能重算到期日!');
			return false;
		}
		
		var url = Constant.ROOT_PATH+"/core/x/Prod!reCalcInvalidDate.action";
		function callback(res, ops) {
			var data = Ext.decode(res.responseText);
			Alert('操作成功,新的到日期为：' + data.invalidDate ,function(){
				App.getApp().refreshPanel(App.getApp().getData().currentResource.busicode);
			});
		}
		Confirm("确定要重算到期日么?", this, function() {
					App.sendRequest(url,  {prodSn: prodData.prod_sn}, callback);
				});
		
		return false;
	},
	// 退订
	CancelProd: function(){
		
		if(!hasCust())return false
		var prodGrid = App.getApp().main.infoPanel.getUserPanel().prodGrid;
		var record = null;
		var prodId = null;
		var userId = null;
		
		var activeId = App.getApp().main.infoPanel.getActiveTab().getId();
		if(activeId == 'USER_PANEL'){
			record = prodGrid.getSelectionModel().getSelections()[0];
//		}else if(activeId == 'CUST_PANEL'){
//			record = App.getApp().main.infoPanel.getCustPanel().packageGrid.getSelectionModel().getSelections()[0];
		}
		prodId = record.get('prod_id');
		userId = record.get('user_id');
		
		if (activeId == 'USER_PANEL'){
			//剩余产品必须有基本产品
			prodId = record.get('prod_id');
			userId = record.get('user_id');
			//用户状态不能为报停
			var userStore = App.getApp().main.infoPanel.getUserPanel().userGrid.getStore();
			for(var i=0;i<userStore.getCount();i++){
				if(userId == userStore.getAt(i).get('user_id')){
					if(userStore.getAt(i).get("status") != "ACTIVE"){
						Alert("所选用户的状态必须是正常");
						return false;
					}
				}
			}
		}
		//账目实际余额大于0
		var acctItemData = App.getAcctItemByProdId(record.get('prod_id'),userId);
		if(acctItemData){
			if(acctItemData.real_balance < 0 && acctItemData.order_balance != -acctItemData.real_balance){
				Alert("产品账目实际余额必须大于等于0");
				return false;
			}
		}else{
			Alert("该用户对应的账户或者账目数据有问题,请核对");
			return false;
		}
			
		//选中真正操作的用户
		if (userId != null){
			App.getApp().selectRelativeUser([userId]);
		}
		
		
		var url = root+'/commons/x/QueryUser!queryPromotionCanCancel.action';
			Ext.Ajax.request({
				url :url,
				params:{userId:userId,prod_id:prodId,userId:userId},
				success:function(req){
					array = Ext.decode(req.responseText);
					Ext.getBody().unmask();
					var btn = {text:'退订',attrs:App.data.currentResource};
					var cfg = {width : 560,height : 460}; 
					
					if(array.length ==0){
						App.menu.bigWindow.show(btn,cfg);
					}else{
						var msg = '该产品存在可回退促销[<font color="red">{0}</font>],该促销包含:</br>';
						var promotionName = '';
						for(var index =0;index<array.length;index++){
							var obj = array[index];
							promotionName = obj.promotion_name;
							msg += '[<font color="red">' + obj.cust_id +'</font>] ';
						}
						msg += ' </br>如有必要,请先执行促销回退';
						
						msg = String.format(msg,promotionName);
						Ext.Msg.show({
			                title : '提示',
			                msg : msg,
			                width:300,
			                buttons: {ok : "<font size='2'><b>忽略</b></font>",cancel : "<font size='2'><b>返回</b></font>"},
			                fn: function(text){
			                	if(text =='ok'){
									App.menu.bigWindow.show(btn,cfg);
			                	}
							},
			                scope : this
			            });
			            
						return false;
					}
					
				}
			});
			
			return false;
	},
	//宽带升级
	ChangeBandProd: function(){
		
		return {
			width:650,
			height:450
		};
	},
	//更换动态资源
	ChangeProdDynRes: function(){
		
		return {
			width:650,
			height:450
		};
	},
	// 恢复用户状态
	RenewUser : function() {
		var record = App.getApp().main.infoPanel.getUserPanel().userGrid
				.getSelectionModel().getSelected();
		var userId = record.get('user_id');
		var url = Constant.ROOT_PATH + "/core/x/User!renewUser.action";
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务保存成功!');
				App.getCust().status = result.simple_obj;
				App.getApp().refreshPanel('1221');
			}
		}
		Confirm("确定恢复用户状态吗?", this, function() {
					App.sendRequest(url, {userId:userId}, callback);
				});
		return false;
	},
	// 资费变更
	ChangeTariff : function() {
		if (!hasCust())
			return false
		var record = App.getApp().main.infoPanel.getUserPanel().prodGrid
				.getSelectionModel().getSelected();
		if (record) {
			App.getApp().selectRelativeUser([record.get('user_id')]);
		}
		return {
			width : 540,
			height : 300
		};
	},	
	//修改到期日
	EditInvalidDate : function() {
		if (!hasCust())
			return false
		var record = App.getApp().main.infoPanel.getUserPanel().prodGrid
				.getSelectionModel().getSelected();
		if (record) {
			App.getApp().selectRelativeUser([record.get('user_id')]);
		}
		return {
			width : 540,
			height : 300
		};
	},
	// 取消资费变更
	CancelChangeTariff : function() {
		if (!hasCust())
			return false;
		var record = App.getApp().main.infoPanel.getUserPanel().prodGrid
				.getSelectionModel().getSelected();
		var prodSn = record.get('prod_sn');
		var tariffId = record.get('next_tariff_id');
		Confirm("确定取消资费变更吗?", this, function() {
			App.sendRequest(Constant.ROOT_PATH
							+ "/core/x/User!removeByProdSn.action", {
						prodSn : prodSn,
						tariffId : tariffId
					}, function(res, opt) {
						var data = Ext.decode(res.responseText);
						if (data === true) {
							Alert('取消资费变更成功!');
							App
									.getApp()
									.refreshPanel(App.getApp().getData().currentResource.busicode);
						}
					});
		});
		return false;
	},
	// 失效日期变更
	ChangeExpDate : function() {
		if (!hasCust())
			return false
		var record = App.getApp().main.infoPanel.getUserPanel().prodGrid
				.getSelectionModel().getSelected();
		if (record) {
			App.getApp().selectRelativeUser([record.get('user_id')]);
		}
		return {
			width : 540,
			height : 250
		};
	},
	// 协议缴费
	EditExpDate : function() {
		if (!hasCust())
			return false
		var record = App.getApp().main.infoPanel.getUserPanel().prodGrid
				.getSelectionModel().getSelected();
		if (record) {
			App.getApp().selectRelativeUser([record.get('user_id')]);
		}

		return {
			width : 540,
			height : 350
		};
	},
	BatchEditExpDate : function() {
		if (!hasCust())
			return false;

		var userRecords = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();
		var len = userRecords.length;
		if (len == 0) {
			Alert('请选择用户');
			return false;
		}

		for (var i = 0; i < len; i++) {
			var status = userRecords[i].get("status");
			if ( status != "ACTIVE" && status != "OWELONG" ) {
				Alert("所选用户的状态必须是正常");
				return false;
			}
		}

		return {
			width : 750,
			height : 550
		};
	},
	// 指令重发
	ResendCmd : function() {
		if (!hasCust())
			return false;
		var userRecords = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();
		var len = userRecords.length;
		if (len == 0) {
			Alert('请选择用户');
			return false;
		}

//		for (var i = 0; i < len; i++) {
//			var status = userRecords[i].get("status");
//			if ( status != "ACTIVE" && status != "OWELONG" ) {
//				Alert("所选用户的状态必须是正常");
//				return false;
//			}
//		}

		// 回调函数
		function callback(res, opt) {
			if (res.responseText == 'true') {
				Alert('指令重发成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!ResendCmd.action";

		Confirm("确定指令重发吗?", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, null, callback);
				});

		return false;
	},
	ResendVodCmd : function() {
		if (!hasCust())
			return false;
		var userRecords = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();
		var len = userRecords.length;
		if (len == 0) {
			Alert('请选择用户');
			return false;
		}

		for (var i = 0; i < len; i++) {
			var status = userRecords[i].get("status");
			if ( status != "ACTIVE" && status != "OWELONG" ) {
				Alert("所选用户的状态必须是正常");
				return false;
			}
		}

		// 回调函数
		function callback(res, opt) {
			if (res.responseText == 'true') {
				Alert('指令重发成功!');
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!ResendVodCmd.action";

		Confirm("确定重发开户指令?", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, null, callback);
				});

		return false;
	},
	// 刷新指令
	RefreshCmd : function() {
		if (!hasCust())
			return false;
		var userRecords = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();
		var len = userRecords.length;
		if (len == 0) {
			Alert('请选择用户');
			return false;
		}

//		for (var i = 0; i < len; i++) {
//			var status = userRecords[i].get("status");
//			if ( status != "ACTIVE" && status != "OWELONG" ) {
//				Alert("所选用户的状态必须是正常");
//				return false;
//			}
//		}

		// //回调函数
		// function callback(res,opt){
		// if (res.responseText=='true'){
		// Alert('刷新指令发送成功!');
		// App.getApp().main.infoPanel.getUserPanel().userGrid.remoteRefresh();
		// }
		// }
		// var url = Constant.ROOT_PATH + "/core/x/User!RefreshCmd.action";
		//		
		// Confirm("确定发送刷新指令吗?", this , function(){
		// //调用请求函数,详细参数请看busi-helper.js
		// App.sendRequest(url,null,callback);
		// } );

		return {
			width : 500,
			height : 150
		};
	},
	// 促销
	Promotion : function() {
		if (!hasCust())
			return false;
		return {
			width : 750,
			height : 500
		};
	},
	// 宽带指令强制下线
	BandOfflineCmd : function() {
		if (!hasCust())
			return false;
		var userRecords = App.main.infoPanel.getUserPanel().userGrid
				.getSelections();
		var len = userRecords.length;
		if (len == 0) {
			Alert('请选择用户');
			return false;
		}
		// 回调函数
		function callback(res, opt) {
			if (res.responseText == 'true') {
				Alert('强制下线成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!saveOfflineCmd.action";

		Confirm("确定强制下线吗?", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, null, callback);
				});

		return false;
	},
	// 宽带指令清除绑定
	BandClearCmd : function() {
		if (!hasCust())
			return false;
		var userRecords = App.main.infoPanel.getUserPanel().userGrid.getSelections();
		var len = userRecords.length;
		if (len == 0) {
			Alert('请选择用户');
			return false;
		}
		//判断用户名下是否有产品
		var prodData = App.getApp().main.infoPanel.getUserPanel().prodGrid.prodMap[userRecords[0].get('user_id')];
 		if(null==prodData || prodData.length==0){
			Alert('宽带用户下无产品请先订购产品');
			return false;
		}
		// 回调函数
		function callback(res, opt) {
			if (res.responseText == 'true') {
				Alert('清除绑定成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!saveClearBind.action";

		Confirm("确定清除绑定吗?", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, null, callback);
				});
		return false;
	},
	CancelStop : function() {
		if (!hasCust()) {
			return false;
		}
		var userGrid = App.main.infoPanel.getUserPanel().userGrid;
		var userRecords = userGrid.getSelections();

		var len = userRecords.length;// 选中记录

		if (len == 0) {
			Alert('请选择用户');
			return false;
		} else {
			for (i = 0; i < len; i++) {
				var status = userRecords[i].get("status");
				if ( status != "ACTIVE" && status != "OWELONG" ) {
					Alert("选择的用户状态非正常");
					return false;
				}
				if (Ext.isEmpty(userRecords[i].get("stop_date"))) {
					Alert("该用户没有进行预报停操作!");
					return false;
				}
			}
			return {
				width : 540,
				height : 400
			};

		}
	},
	LeaseFee : function() {
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
	// 模拟剪线
	AtvCutLine : function() {
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('模拟剪线成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
				App.getApp().main.infoPanel.getUserPanel().prodGrid
						.remoteRefresh();
				App.getApp().main.infoPanel.getAcctPanel().acctGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!saveAtvCustLine.action";

		Confirm("确定剪线吗?", this, function() {
					App.sendRequest(url, null, callback);
				});
		return false;
	},
	// 模拟恢复
	AtvActive : function() {
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('模拟恢复成功!');
				App.getApp().main.infoPanel.getUserPanel().userGrid
						.remoteRefresh();
				App.getApp().main.infoPanel.getUserPanel().prodGrid
						.remoteRefresh();
				App.getApp().main.infoPanel.getAcctPanel().acctGrid
						.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!saveAtvActive.action";

		Confirm("确定恢复吗?", this, function() {
					App.sendRequest(url, null, callback);
				});
		return false;
	},
	// 产品暂停
	PauseProd : function() {
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('产品暂停成功!');
				App.getApp().main.infoPanel.getUserPanel().prodGrid.remoteRefresh();
//				App.getApp().main.infoPanel.getCustPanel().packageGrid.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!pauseProd.action";

		Confirm("确定暂停产品吗?", this, function() {
					var record = null;
					var activeId = App.getApp().main.infoPanel.getActiveTab().getId();
					if(activeId == 'USER_PANEL'){
						record = App.getApp().main.infoPanel.getUserPanel().prodGrid.getSelectionModel().getSelected();
//					}else if(activeId == 'CUST_PANEL'){
//						record = App.getApp().main.infoPanel.getCustPanel().packageGrid.getSelectionModel().getSelected();
					}
					var prodSn = record.get('prod_sn');
					var userId = record.get('user_id');
					App.sendRequest(url, {
								'prodSn' : prodSn,
								'userId' : userId
							}, callback);
				});
		return false;
	},
	// 产品恢复
	ResumeProd : function() {

		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('产品恢复成功!');
				App.getApp().main.infoPanel.getUserPanel().prodGrid.remoteRefresh();
//				App.getApp().main.infoPanel.getCustPanel().packageGrid.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/User!resumeProd.action";

		Confirm("确定恢复产品吗?", this, function() {
					var record = null;
					var activeId = App.getApp().main.infoPanel.getActiveTab().getId();
					if(activeId == 'USER_PANEL'){
						record = App.getApp().main.infoPanel.getUserPanel().prodGrid.getSelectionModel().getSelected();
//					}else if(activeId == 'CUST_PANEL'){
//						record = App.getApp().main.infoPanel.getCustPanel().packageGrid.getSelectionModel().getSelected();
					}
					var prodSn = record.get('prod_sn');
					var userId = record.get('user_id');
					App.sendRequest(url, {
								'prodSn' : prodSn,
								'userId' : userId
							}, callback);
				});
		return false;
	},
	RechargeCard : function() {
		if (!hasCust()) {
			return false;
		}
		return {
			width : 520,
			height : 150
		};
	},

	// --------------------账户信息------------------------------------------------
	//套餐缴费
	PromPayFee : function(){
		if (!hasCust()) {
			return false;
		}
		return {
			width : 700,
			height : 500
		};
	},
	// 调账
	AcctAdjust : function() {
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
	// 作废账目退款
	AcctitemRefund : function() {
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
	// 调账可退
	AcctKtAdjust : function() {
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
	//小额减免
	AcctEasyAdjust : function() {
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
		//作废赠送
	AcctCancelFree : function() {
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
	DEZSRefund : function(){
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
	//作废冻结金额
	ClearInactiveAmount: function(){
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('作废剩余冻结金额成功!');
				App.getApp().main.infoPanel.getAcctPanel().acctGrid.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/Acct!clearInactiveAmount.action";
		
		var record = App.getApp().main.infoPanel.getAcctPanel().acctItemDetailTab.acctitemInactiveGrid.getSelectionModel().getSelected();
		Ext.MessageBox.show({
	        title: "确定作废剩余冻结金额吗?",
	        msg: "作废冻结金额：",
	        modal: true,
	        prompt: true,
	        value: Ext.util.Format.formatFee(record.get('balance')),
	        fn: function (id, msg) {
	        	if(id == 'ok'){
	        		if(Ext.isEmpty(msg)){
	        			Alert("请输入金额!");
	        			return;
	        		}
	        		if(!/^([1-9]\d*|[1-9]\d*\.\d+|0\.\d*[1-9]\d*|0?\.0+|0)$/.test(msg)){
			        	Alert("请输入正整数或小数!");	
			        	return;
	        		}
	        		var amount = Ext.util.Format.formatToFen(msg);
	        		if(amount > record.get('balance') || amount<0){
	        			Alert("请输入:0~"+Ext.util.Format.formatFee(record.get('balance'))+"!");	
	        			return;
	        		}
	        		var feeSn = record.get('fee_sn');
	        		if(Ext.isEmpty(feeSn)){
	        			if(Ext.isEmpty(record.get('promotion_sn'))){
		        			Alert("数据有问题,请联系管理员!");
		        			return;
	        			}else{
		        			feeSn = record.get('promotion_sn');
	        			}
	        		}
	        		App.sendRequest(url,{'promFeeSn':feeSn,'acctId': record.get('acct_id'),
								'acctItemId': record.get('acctitem_id'),'fee':amount,'realPay':record.get('balance')},callback);
	        	}
	        },
	        buttons: Ext.Msg.OKCANCEL,
	        icon: Ext.Msg.QUEATION
	    });
		return false;
	},
	// 欠费抹零
	AcctFree : function() {
		if (!hasCust())
			return false;
		return {
			width : 540,
			height : 280
		};
	},
	// 银行签约
	BankContract : function() {
		if (!hasCust())
			return false
		return {
			width : 500,
			height : 180
		};
	},
	// 银行解约
	BankCancelContract : function() {
		if (!hasCust())
			return false
		return {
			width : 500,
			height : 180
		};
	},
	// 缴费
	PayFees : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.acctPanel.acctGrid
				.getSelectionModel().getSelections();

		if (records.length == 0) {
			Alert("请选择要缴费的账户！");
			return false;
		} else {
			var flag = false;
			for (var i = 0; i < records.length; i++) {
				if ((records[i].get('acct_type') == 'PUBLIC' || (records[i]
						.get('acct_type') == 'SPEC' && (records[i].get('status') == 'ACTIVE' 
						|| records[i].get('status') == 'OWELONG' || records[i].get('status') == 'ATVCLOSE')))
						&& records[i].get('acctitems')) {
					flag = true;
				}
			}
			if (flag) {
				// 批量缴费的标志位
				App.getApp().getData().batchPayFee = false;
				return {
					width : 750,
					height : 550
				};
			} else {
				Alert("选中账户下无任何账目或者用户账户状态不正常！");
				return false;
			}
		}
	},
	ModifyThreshold : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.acctPanel.acctGrid
				.getSelectionModel().getSelections();
		if (records.length == 0) {
			Alert("请选择要修改阀值的账户！");
			return false;
		}
		return {
			width : 750,
			height : 400
		};
	},
	BatchModifyThreshold : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.acctPanel.acctGrid.getSelectionModel().getSelections();
		if(records.length == 0){
			Alert("请选择要修改阀值的账户！");
			return false;
		}
		return {
			width : 750,
			height : 550
		};
	},
	// 批量缴费
	BatchPayFees : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.acctPanel.acctGrid
				.getSelectionModel().getSelections();

		if (records.length == 0) {
			Alert("请选择要缴费的账户！");
			return false;
		} else {
			var flag = false;
			for (var i = 0; i < records.length; i++) {
				if ((records[i].get('acct_type') == 'PUBLIC' || (records[i]
						.get('acct_type') == 'SPEC' && records[i].get('status') == 'ACTIVE'))
						&& records[i].get('acctitems')) {
					flag = true;
				}
			}
			if (flag) {
				// 批量缴费的标志位
				App.getApp().getData().batchPayFee = true;
				return {
					width : 750,
					height : 550
				};
			} else {
				Alert("选中账户下无任何账目或者用户账户状态不正常！");
				return false;
			}
		}
	},
	// 单位客户缴费
	UnitPayFee : function() {
		if (!hasCust())
			return false;

		var records = App.getApp().main.infoPanel.unitPanel.unitMemberGrid
				.getSelectionModel().getSelections();
		if (records.length == 0) {
			Alert('至少选择一个客户');
			return false;
		}

		return {
			width : 750,
			height : 550
		};
	},
	BatchChangeTariff : function(){
		if (!hasCust())
			return false;
		if(App.getCust().cust_type == "UNIT"){
			var records = App.getApp().main.infoPanel.unitPanel.unitMemberGrid
					.getSelectionModel().getSelections();
			if (records.length == 0) {
				Alert('至少选择一个客户');
				return false;
			}
		}else{ 
			var userGrid = App.main.infoPanel.getUserPanel().userGrid;
			var userRecords = userGrid.getSelections();
			if (userRecords.length == 0) {
				Alert('至少选择一个用户');
				return false;
			}
		}
		return {
			width : 750,
			height : 550
		};
	}
	,
	// 退款
	AcctReimburse : function() {
		if (!hasCust())
			return false;

		var record = App.getApp().main.infoPanel.acctPanel.acctItemGrid
				.getSelectionModel().getSelected();
		if (record.get('can_refund_balance') === 0) {
			Alert("账目退款余额不足！");
			return false;
		}

		// var acctType =
		// App.getApp().main.infoPanel.acctPanel.acctItemGrid.acctType;
		// if(acctType == 'PUBLIC'){
		// Alert("对不起,公共账户不允许退款！请选择用户账户进行退款");
		// return false;
		// }
		return {
			width : 550,
			height : 350
		};
	},
	// 转账
	AcctTransfer : function() {
		if (!hasCust())
			return false;
		var record = App.getApp().main.infoPanel.acctPanel.acctItemGrid
				.getSelectionModel().getSelected();
		if (record.get('can_trans_balance') === 0) {
			Alert('账目可转金额不足！');
			return false;
		}
		return {
			width : 650,
			height : 400
		};
	},
	EditQuatoInvoice : function(){
		if (!hasCust())
			return false;
			
		return {
			width : 540,
			height : 280
		};
	},
	// 修改出票方式
	EditInvoiceMode : function() {
		return {
			width : 540,
			height : 300
		};
	},
	//手工修改手工票的发票号
	ManuallyEditMInvoice : function() {
		return {
			width : 540,
			height : 300
		};
	},
	// 修改账务日期
	EditAcctDate : function() {
		// if(!hasCust()) return false;

		return {
			width : 540,
			height : 300
		};
	},
	// 修改业务员
	ModifyBusiOptr : function() {
		return {
			width : 555,
			height : 300
		};
	},
	//收费清单更换发票
	ChangeFeelistInvoice: function(){
		return {
			width : 555,
			height : 300
		};
	},
	InvalidInvoice:function(){
		if (!hasCust()) return false;
		var records = App.getApp().main.infoPanel.docPanel.invoiceGrid
				.getSelectionModel().getSelections();
		if (records.length == 0 || records.length != 1) {
			Alert("请选择要作废的发票！");
			return false;
		}
		var invoice = records[0];
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('作废成功!');
				App.getApp().main.infoPanel.getDocPanel().invoiceGrid.remoteRefresh();
				App.getApp().main.infoPanel.getPayfeePanel().refresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/Pay!invalidInvoice.action";

		Confirm("确定作废发票吗?", this, function() {
					App.sendRequest(url, {
								'invoice_id': invoice.get('invoice_id'),
								'invoice_code': invoice.get('invoice_code'),
								'invoice_book_id': invoice.get('invoice_book_id')
							}, callback);
				});
		return false;
	},
	//正式发票作废
	InvalidFeelistInvoice: function(){
		// 回调函数
		function callback(res, opt) {
			var data = Ext.decode(res.responseText);
			if (data['success'] == true) {
				Alert('作废成功!');
				App.getApp().main.infoPanel.getDocPanel().invoiceGrid.remoteRefresh();
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/Pay!invalidFeeListInvoice.action";

		Confirm("确定作废正式发票吗?", this, function() {
					var record = App.getApp().main.infoPanel.docPanel.invoiceGrid.getSelectionModel().getSelected()
					App.sendRequest(url, {
								'donecode': record.get('fee_done_code')
							}, callback);
				});
		return false;
	},

	// --------------------缴费记录------------------------------------------------
	// --------------------单据信息------------------------------------------------

	// 发票打印
	DocPrint : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.docPanel.invoiceGrid
				.getSelectionModel().getSelections();
		if (records.length == 0 || records.length != 1) {
			Alert("请选择一个要打印的发票！");
			return false;
		}
		return {
			width : 710,
			height : 460
		};
	},
	// 确认单打印
	ConfigPrint : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.docPanel.busiDocGrid
				.getSelectionModel().getSelections();
		if (records.length == 0) {
			Alert("请选择要打印的确认单！");
			return false;
		}
		return {
			width : 550,
			height : 300
		};
	},
	NewRepairTask: function(){
	    if(!hasCust()) return false;
	    return {width: 340 , height: 420};
	  },
	PrintRepairTask: function(){
	  	var record = App.getApp().main.infoPanel.getDocPanel().taskGrid.getSelectionModel().getSelected();
		var ps = [];
		ps.push(record.get("task_type")+"#" + record.get("cust_id") + "#" + record.get("work_id"));
		Ext.Ajax.request({
			url: Constant.ROOT_PATH + "/core/x/Task!queryPrintContent.action",
		params: {tasks: ps},
		success: function( res, ops){
			var data = Ext.decode(res.responseText);
			if(data.length > 0){
				var html = PrintTools.getPageHTML(data[0].tpl, data);
				PrintTools.showPrintWindow(html);
			}else{
				Alert("没有需要打印的数据");
					}
				}
			});
		  	return false;
	},
	// 修改发票
	EditInvoice : function() {
		if (!hasCust())
			return false;
		var records = App.getApp().main.infoPanel.docPanel.invoiceGrid
				.getSelectionModel().getSelections();
		if (records.length == 0 || records.length != 1) {
			Alert("请选择要修改的发票！");
			return false;
		}
		return {
			width : 540,
			height : 300
		};
	},
	MergeFeePanel : function() {
		return {
			width : 740,
			height : 470
		};
	},
	Print : function() {
		return {
			width : 540,
			height : 470
		};
	},

	// --------------------受理记录------------------------------------------------
	CanDoneCode : function() {
		if (!hasCust())
			return false;
		var records = App.main.infoPanel.getDoneCodePanel().doneCodeGrid
				.getSelectionModel().getSelections();
		if (records.length != 1) {
			Alert('请选择一条记录');
			return false;
		}
		var record = records[0];
		var params = {};
		params['doneCode'] = record.get('done_code');
		// 回调函数
		function callback(res, opt) {
			var result = Ext.decode(res.responseText);
			if (result.success == true) {
				Alert('业务回退成功!');
				App.getApp().main.infoPanel.getDoneCodePanel().doneCodeGrid
						.remoteRefresh();
				App.getApp().refreshPanel(record.get('busi_code'));
			} else {
				Alert(result.simpleObj);
			}
		}
		var url = Constant.ROOT_PATH + "/core/x/DoneCode!cancelDoneCode.action";

		Confirm("确定业务回退吗?", this, function() {
					// 调用请求函数,详细参数请看busi-helper.js
					App.sendRequest(url, params, callback);
				});

		return false;
	},
	// --------------------账单面板------------------------------------------------
	CancelBill : function() {
		if (!hasCust())
			return false;
		var confirmMsg = '';
		var thisMonthBillingCycle = parseInt(nowDate().format('Ym') );
		var records = App.main.infoPanel.getBillPanel().billGrid.getSelectionModel().getSelections();
		var billSns = [];
		var custStatus = App.getApp().getData().custFullInfo.cust.status;
		if(custStatus == 'INVALID'){
			Ext.each(records,function(record){
				var billCycle = parseInt(record.get('billing_cycle_id'));
				if(thisMonthBillingCycle > billCycle){
					confirmMsg = Ext.isEmpty(confirmMsg) ? '本次有不能取消的账单，将自动过滤掉' :confirmMsg;
				}else{
					if(record.get('status') == '1'){
						billSns.push(record.get('bill_sn'));
					}
				}
			});
		}else{
			Ext.each(records,function(record){
				var billCycle = parseInt(record.get('billing_cycle_id'));
				if(thisMonthBillingCycle > billCycle){
					confirmMsg = Ext.isEmpty(confirmMsg) ? '本次有不能取消的账单，将自动过滤掉' :confirmMsg;
				}else{
					if(record.get('come_from') != '4'){
						//套餐
						if( (record.get('status')=='0' && record.get('come_from')=='5') 
							|| (record.get('status') == '1' || record.get('status')=='0') ){
							billSns.push(record.get('bill_sn'));
						}
					}
				}
				
			});
		}

		if(billSns.length >0){
			// 回调函数
			function callback(res, opt) {
				var result = Ext.decode(res.responseText);
				if (result.success == true) {
					Alert('作废账单成功!');
					App.getApp().main.infoPanel.getBillPanel().billGrid
							.remoteRefresh();
					App.getApp().main.infoPanel.getBillPanel().acctitemInvalidGrid
							.remoteRefresh();
				    App.getApp().main.infoPanel.getAcctPanel().setReload(true);
							
				} else {
					Alert(result.simpleObj);
				}
			}
			var url = Constant.ROOT_PATH + "/core/x/Acct!saveCancelBill.action";
	
			Confirm(confirmMsg + "确定作废账单吗?", this, function() {
						// 调用请求函数,详细参数请看busi-helper.js
						App.sendRequest(url, {billSns: billSns}, callback);
					});

		} else {
			Alert('没有符合条件的账单可作废');
		}
		return false;
	},
	RePrintBusiDoc:function(){//重打受理单
		var record = App.main.infoPanel.docPanel.busiDocGrid.getSelectionModel().getSelected();
	  	if(record){
	  		App.getApp().data['docSn'] = record.get('doc_sn');
	  		var printDteStr = record.get('create_time');
	  		if(!Ext.isEmpty(printDteStr) && printDteStr.trim().length >= 10){
	  			App.getApp().data['busiDocPrintDate'] = printDteStr.trim().substring(0,10);
	  		}
	  	}else{
	  		Alert('请选择一条记录!');
	  		return false;
	  	}
		App.getApp().openBusiPrint(true);
	  	return false;
	}	
});