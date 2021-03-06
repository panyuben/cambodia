/**
 * 业务组装容器，TemplateFactory.gTemplate()生成一个此容器。
 * 将所传入的组件，装载在该容器内显示。
 *
 * 一般重新打开一个Iframe的业务，都是由该容器所装载
 * @class BoxPanel
 * @extends Ext.Panel
 */
BusiPanel = Ext.extend( Ext.Panel , {
	forms: {},
	
	templateType: null,
	winPay: null,
	
	btn : null,//点击按钮
	constructor: function( panels , forms ){
		
		
		panels.push(this.createButtonPanel());
		this.forms = forms;
		BusiPanel.superclass.constructor.call(this, {
			layout: 'border',
			id : 'BusiPanel',
			border: false,
			region: 'center',
			defaults:{border: false},
			items: panels
		});
	},
	createButtonPanel : function(){
		var buttons = [{
			columnWidth : .55,
			labelWidth : 80,
			labelAlign: 'right',
			items : [{
				xtype : 'textfield',
				id : 'commonRemark',
				name: 'remark',
				width : 200,
				height : 25,
		 		fieldLabel: '备注信息'
			}]
		},{
			columnWidth : .15,
			items : [{
				id:'ywSaveId',
				xtype : 'button',
				text: '&nbsp;&nbsp;业务保存',
				scope: this,
				width: 80,
				height : 25,
				iconCls:'icon-save',
				handler: this.doClick
			}]
		}];
		
		var busiCode = App.getApp().data.currentResource.busicode;
		if(busiCode == '1001' || busiCode =='1007' ){//客户开户，购买设备
			var buyDevice = App.getData().busiTask['BuyDevice'];
			var newUser = App.getData().busiTask['NewUser'];
			
			var arr = [];
			//是否有购买设备和用户开户资源权限
			if(buyDevice){
				this.applyButton(buyDevice);
				arr.push({
					columnWidth : .15,
					id:'newCustToDeviceId',
					items : [buyDevice]
				});
			}
			if(newUser){
				this.applyButton(newUser);
				arr.push({
					columnWidth : .15,
					id:'newCustToUserId',
					items : [newUser]
				});
			}
			
			if(arr.length > 0){
				buttons.push(arr);
			}
			
		}else if(busiCode == '1020'){//用户开户
			var orderProd = App.getData().busiTask['OrderProd'];
			/*
			var newUser = App.getData().busiTask['NewUser'];
			this.applyButton(newUser);
			*/
			var arr = [];
			/*arr.push({
				columnWidth : .15,
				items : [newUser]
			});*/
			
			if(orderProd){
				this.applyButton(orderProd);
				arr.push({
					columnWidth : .15,
					items : [orderProd]
				});
			}
			buttons.push(arr);
		}else if(busiCode == '1015'){//订购产品
			var orderProd = App.getData().busiTask['OrderProd'];
			this.applyButton(orderProd);
			
			var arr = [];
			arr.push({
				columnWidth : .15,
				items : [orderProd]
			});
			
			var payFees = App.getData().busiTask['PayFees'];
			if(payFees){
				this.applyButton(payFees);
				arr.push({
					columnWidth : .15,
					items : [payFees]
				});
			}
			
			buttons.push(arr);
		}else if(busiCode == '1688'){//套餐缴费
			buttons.push([{
				columnWidth : .15,
				items : [{
					id:'doReturnId',
					xtype : 'button',
					text: '&nbsp;重置终端信息',
					scope: this,
					width: 90,
					height : 25,
					iconCls:'icon-reset',
					handler:  function() {
						Ext.getCmp('promPayFeeFormId').doReturnData();
					}
				}]
			}])
		}else if(busiCode == '1025'){//报开
			var payFees = App.getData().busiTask['PayFees'];
			var arr = [];
			if(payFees){
				this.applyButton(payFees);
				arr.push({
					columnWidth : .15,
					items : [payFees]
				});
			}
			buttons.push(arr);
		}
		
		if(buttons.length == 2){
			buttons[0].columnWidth = 0.8;
		}
		
		var panel = new Ext.Panel({
			border : false,
			region: 'south',
			height: 35, 
			split : true,
			layout : 'column',
			baseCls: 'x-plain',
			defaults : {
				layout : 'form',
				baseCls: 'x-plain',
				border : false
			},
			items : buttons
		})
		
		return panel;
	},
	applyButton : function(btn){
		Ext.apply(btn,{
			xtype : 'button',
			scope: this,
			width: 85,
			height : 25,
			handler : this.doClick
		});
	},
	doClick : function(btn){
		var msg = this.doValid();
		if(msg == false) {
			return false;
		}else if(!msg.isValid&&msg.msg){
			Alert(msg.msg);
			return false;
		};
		
		this.btn = btn;
		var fee = this.getFee();
		var form = this.getForm(CoreConstant.BOX_FORMS_OWN);
		if (fee != 0 ) {
			if(form.isAllowGo===false){
				Confirm("是否需要打印发票?", this , function(){
					this.winPay = new WinPayBill(this);
					this.winPay.show(fee);
				},this.doSave );
			}else{
				//当没有未收费记录的时候，和开户的时候弹出收费框
				this.winPay = new WinPayBill(this);
				this.winPay.show(fee);
			}
		} else {
			/**confirmMsg为业务保存时，需要自定义显示信息文本，
			 * 具体请参见CancelProd.js**/
			//isAllowGo 等于false 就return,用于延时查询数据对比后，才可以保存业务见UserStop.js
			if(form.isAllowGo===false){return;}
			if(form && form.confirmMsg){
				
				//yesBtn=true，在弹出框中点击是时关闭按钮
				if(form.yesBtn && form.yesBtn === true){
					Confirm(form.confirmMsg, this ,function(){
						//点"否"按钮时,关闭当前window
						if(form.isCloseBigWin && form.isCloseBigWin === true){
							App.getApp().menu.hideBusiWin();
						}
					}, this.doSave );
				}else{
					Confirm(form.confirmMsg, this , this.doSave, function(){
						//点"否"按钮时,关闭当前window
						if(form.isCloseBigWin && form.isCloseBigWin === true){
							App.getApp().menu.hideBusiWin();
						}
					} );
				}
			}else{
				var busiCode = App.getApp().data.currentResource.busicode;
				if (busiCode == '1001'
								|| busiCode == '1020'
								|| busiCode == '1015' || busiCode == '1040'){
						this.doSave();
				}else{					
					if(msg != true){
						Confirm(msg+"确定要保存业务吗?", this , this.doSave );
					}else{
						Confirm("确定要保存业务吗?", this , this.doSave );
					}
				}
			}
		}
	},
	doValid: function(){
		for(var key in this.forms){
			var result = this.forms[key].doValid();
			//不是业务的表单（如杂费）返回的是true/false
			if(result && result != true){
				if(result.isValid == false){
					if(result.msg){
						Alert(result.msg);
					}else{
						Alert("含有验证不通过的输入项!");
					}
					return false;
				}
			}else if(result == false){
				Alert("含有验证不通过的输入项!");
				return false;
			}
		}
		var busiCode = App.getApp().data.currentResource.busicode;
		if(busiCode == '1047'){
			var key = false;comm = App.getValues();
			var obj = {};
			comm["BatchForm"]=this.getForm(CoreConstant.BOX_FORMS_OWN).getValues();
			var feeForm = this.getForm(CoreConstant.BOX_FORMS_FEE);
			if(feeForm){
				comm["fees"]= feeForm.getValues();
				for(i=0;i< comm["fees"].length;i++){
					if(comm["BatchForm"]["custNum"]!=comm["fees"][i]["count"]){
						key = true;
					}
				}
			}
			if(key){
				obj["isValid"] = false;
				obj["msg"] = "所收取费用的户数必须和预开户数:【"+comm["BatchForm"]["custNum"]+"】一致!";
				return obj;
			}
		}
		return true;
	},
	doSave: function(){
		mb = Show();
		var all = {};
		//获取form
		var feeForm = this.getForm(CoreConstant.BOX_FORMS_FEE),
			ownForm = this.getForm(CoreConstant.BOX_FORMS_OWN),
			busiExtForm = this.getForm(CoreConstant.BOX_FORMS_BUSIEXT);
			docForm = this.getForm(CoreConstant.BOX_FORMS_DOC);
		//获取业务表单的参数值
		if(ownForm){
			Ext.apply( all , ownForm.getValues() );
		}
		//获取通用的参数
		var commons = App.getValues();
			
			
		//获取杂费信息
		if(feeForm){
			commons["fees"] = feeForm.getValues();
		}
		if (docForm){
			Ext.apply(commons,docForm.getValues());
		}
		//支付信息
		if(this.winPay){
			commons["pay"] = this.winPay.getValues();
		}

		
		//表扩展信息
//		var extObj = {},key;
//		for(var p in all){
//			if(p.indexOf(CoreConstant.Ext_FIELDNAME_PREFIX) === 0){
//				key = p.substr(CoreConstant.Ext_FIELDNAME_PREFIX.length);
//				extObj[key] = all[p];
//				delete all[p];
//			}
//		}
//		commons["extAttrForm"] = {};
//		commons["extAttrForm"]["extAttrs"] = extObj;
		
		//业务扩展信息
		if(busiExtForm){
			var o = busiExtForm.getValues(), busiValues = [];
			delete o.remark;
			for(var key in o){
				busiValues[busiValues.length] = {
					attribute_id: key,
					attribute_value: o[key]
				}; 
			}
			commons["busiExtAttr"] = busiValues;
		}
		
		commons["remark"] = Ext.getCmp('commonRemark').getValue();
		//设置提交参数
		all[CoreConstant.JSON_PARAMS] = Ext.encode(commons);
		var busiCode = App.getApp().data.currentResource.busicode;
		if(busiCode == '1047'){
			//提交
			Ext.Ajax.request({
				form:ownForm.form.el.dom,
				scope: this,
				params: all,
				url: ownForm.url,
				timeout:99999999999999,//12位 报异常
				isUpload:true,
				success: function( res, ops){
					mb.hide();
					mb=null;
					var o = Ext.decode( res.responseText );
					if(o["success"]== true){
						if(o["msg"]){//错误信息
							Alert(o["msg"]);
						}else{
							Alert('业务保存成功!',function(){
								this.success();
							},this);
						}
					}
				}
			});
		}else{
			//提交
			Ext.Ajax.request({
				scope: this,
				params: all,
				url: ownForm.url,
				timeout:99999999999999,//12位 报异常
				success: function( res, ops){
					mb.hide();
					mb=null;
					var o = Ext.decode( res.responseText );
					if(o["exception"]){
	//					new DebugWindow( o , "btnBusiSave").show();
					} else {
						var ownForm = this.getForm(CoreConstant.BOX_FORMS_OWN);
				 		if(ownForm && ownForm.success){
				 			ownForm.success.call( this , ownForm ,o);
				 		}
						if (busiCode == '1001'
										|| busiCode == '1020'
										|| busiCode == '1015'){
							this.success();				
						}else{
							Alert('业务保存成功!');
							this.success();
						}
					}
				}
			});
		}
	},
	//调用回调处理函数
 	success: function(  ){
 		//如果是业务按钮
 		if(this.btn.attrs){
 			App.getApp().data.busiTaskBtn = this.btn;
 		}else{
 			App.getApp().data.busiTaskBtn = null;
 		}
 		
 		if(this.winPay && this.winPay.success){
 			this.winPay.success.call(this.winPay);
 		}else{
 			App.getApp().menu.hideBusiWin();
 		}
 	},
	doClose: function(){
		App.getApp().menu.hideBusiWin();
	},
	/**
	 * 获取指定的FORM 请查看CoreConstant.js
	 * BOX_FORMS为前缀的常量
	 */
	getForm: function( key ){
		return this.forms[ key ];
	},
	//获取累计需付费
	getFee: function(){
		var fee = 0;
		var feeForm = this.getForm(CoreConstant.BOX_FORMS_FEE),
			ownForm = this.getForm(CoreConstant.BOX_FORMS_OWN);
		if(feeForm){
			var feenum = feeForm.getFee();
			if( feenum && feenum != 0){
				fee = parseFloat(feenum);
			}
		}
		if(ownForm){
			var feenum = ownForm.getFee();
			if(feenum && feenum != 0){
				fee += parseFloat(feenum);
			}
		}
		return  fee.toFixed(2);
	},
	//显示Load提示
	showTip: function(){
		if(!this.mask)
			this.mask = new Ext.LoadMask(this.body, {
				msg:"正在查询，请稍等..."
			});
		this.mask.show();
	},
	//隐藏load提示
	hideTip: function(){
		if(this.mask)
			this.mask.hide();
	}
});