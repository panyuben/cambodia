/**
 * 用户信息表格
 */ 
App.pageSize = 15 ;
App.userRecord = Ext.data.Record.create([
	{name: 'user_id'},
	{name: 'cust_id'},
	{name: 'acct_id'},
	{name: 'user_type'},
	{name: 'user_addr'},
	{name: 'user_class'},
	{name: 'user_class_exp_date'},
	{name: 'stop_type'},
	{name: 'status'},
	{name: 'net_type'},
	{name: 'stb_id'},
	{name: 'card_id'},
	{name: 'modem_mac'},
	{name: 'open_time'},
	{name: 'area_id'},
	{name: 'county_id'},
	{name: 'status_date'},
	{name: 'user_type_text'},
	{name: 'status_text'},
	{name: 'stop_type_text'},
	{name: 'user_class_text'},
	{name: 'net_type_text'},
	{name: 'user_name'},
	{name: 'terminal_type'},
	{name: 'terminal_type_text'},
	{name: 'serv_type'},
	{name: 'serv_type_text'},
	{name: 'check_type'},
	{name: 'check_type_text'},
	{name: 'login_name'},
	{name: 'password'},
	{name: 'login_password'},
	{name: 'bind_type'},
	{name: 'bind_type_text'},
	{name: 'max_connection'},
	{name: 'max_user_num'},
	{name: 'is_rstop_fee'},
	{name: 'str1'},
	{name: 'str2'},
	{name: 'str3'},
	{name: 'str4'},
	{name: 'str5'},
	{name: 'str6'},
	{name: 'str7'},{name: 'str7_text'},//用户类别
	{name: 'str8'},
	{name: 'str9'},
	{name: 'str10'},
	{name: 'str11'},{name: 'str11_text'},//双向用户类型
	{name: 'str19'},{name: 'str19_text'},
	{name: 'user_count'},
	{name: 'rejectRes'},//排斥资源
	{name: 'stop_date'},
	{name: 'tv_model_text'}
]);
UserGrid = Ext.extend(Ext.ux.Grid,{
	border:false,
	userStore:null,
	region: 'center',
	parent: null ,
	constructor:function( parent){
		this.parent = parent;
		this.userStore = new Ext.data.JsonStore({
			url:Constant.ROOT_PATH + "/commons/x/QueryUser!queryUser.action",
			fields: App.userRecord
		}); 
		//不能放initEvents里
		this.userStore.on("load", this.doLoadResult ,this);
		
		var sm = new Ext.grid.CheckboxSelectionModel();
		
		var cm = new Ext.ux.grid.LockingColumnModel({ 
    		columns : [
            sm,
			{header:'用户类型',dataIndex:'user_type_text',width:80},
			{header:'用户名',dataIndex:'user_name',	width:80},
			{header:'状态',dataIndex:'status_text',	width:60,renderer:Ext.util.Format.statusShow},
			{header:'机顶盒',dataIndex:'stb_id',	width:130,renderer:App.qtipValue},
			{header:'智能卡',dataIndex:'card_id',width:110,renderer:App.qtipValue},
			{header:'Modem号',dataIndex:'modem_mac',width:90,renderer:App.qtipValue}
	        ]
	      });
		
		UserGrid.superclass.constructor.call(this,{
			title: '用户信息',
			id:'U_USER',
			store:this.userStore,
			sm:sm,
			cm:cm,
			view: new Ext.ux.grid.ColumnLockBufferView()
			,tools:[{id:'search',qtip:'查询',cls:'tip-target',scope:this,handler:function(){
				
					var comp = this.tools.search;
					if(this.userStore.getCount()>0){
						if(win)win.close();
							win = FilterWindow.addComp(this,[
							    {text:'用户类型',field:'user_type',showField:'user_type_text'},
							    {text:'用户地址',field:'user_addr',type:'textfield'},
								{text:'状态',field:'status',showField:'status_text'},
								{text:'机顶盒',field:'stb_id',type:'textfield'},
								{text:'智能卡',field:'card_id',type:'textfield'},
								{text:'Modem号',field:'modem_mac',type:'textfield'}
								], 690,"1",false);
							
						if(win){
							win.setPosition(comp.getX()-win.width, comp.getY()-50);//弹出框右对齐
							win.show();
						}
					}else{
						Alert('请先查询数据！');
					}
		    	}
		    }]
		});
	},
	initEvents: function(){
		this.on("rowclick", this.doClickRecord, this );
		this.on("afterrender",function(){
			this.swapViews();
		},this,{delay:10});
		
		UserGrid.superclass.initEvents.call(this);
	},
	doLoadResult:function(_store, _rs, ops){
		//隐藏数据加载提示框
		App.hideTip();
		
		var len = _rs.length;
		App.getApp().data.users=[];
		if(len>0){
			for(i=0;i<len; i++){
				App.getApp().data.users.push(_rs[i].data);
			}
		}
		var prodGrid = this.parent.prodGrid;
		//用户信息加载完后再加载产品信息,类似与同步
		//当用户只有一个时，产品信息还没加载完，就去取产品数据了
		if(len == 1){
			prodGrid.userId = _rs[0].get('user_id');
		}
		prodGrid.remoteRefresh();
		
		//刷新userDetailTab
		var userId = this.parent.userDetailTab.userId;
		if(userId){
			var isExist = false;//用户是否存在
			for(i=0;i<_rs.length;i++){
				if(userId == _rs[i].get('user_id')){
					var userDetailTab = this.parent.userDetailTab;
					userDetailTab.resetPanel();
					userDetailTab.userId = userId;
					userDetailTab.type = _rs[i].get("user_type");
					userDetailTab.userRecord = _rs[i];
					userDetailTab.refreshPanel(userDetailTab.getActiveTab());
					isExist = true;
					break;
				}
			}
			//如果不存在
			if(!isExist){
				this.parent.userDetailTab.resetPanel();
			}
		}
	},
	remoteRefresh:function(){
		//显示数据加载提示框
		App.showTip();
		var cust = App.data.custFullInfo.cust;
		this.userStore.baseParams={custId:cust['cust_id'],custStatus:cust['status']};
		this.refresh();
		
		//过滤tbar按钮
		if(App.getCust().status == 'RELOCATE'){
			App.getApp().disableBarByBusiCode(this.getTopToolbar(),['1020','1025','1015'],true);
		}else if(App.getCust().status == 'DATACLOSE'){
			if(this.getTopToolbar())
				this.getTopToolbar().hide();
			this.doLayout();
		}else if(App.getCust().status == 'ACTIVE'){
			if(this.getTopToolbar())
				this.getTopToolbar().show();
			App.getApp().disableBarByBusiCode(this.getTopToolbar(),['1020','1025','1015'],false);
		}
	},
	refresh:function(){
		this.userStore.load();
	},
	doClickRecord: function(g, i, e){
		//选中一条时才显示
		var records = g.getSelectionModel().getSelections();
		if(records.length == 1){
			var uid = records[0].get("user_id");
			var type = records[0].get("user_type");
			var record = records[0];
			
			var userDetailTab = this.parent.userDetailTab;
			userDetailTab.resetPanel();
			userDetailTab.userId = uid;
			userDetailTab.type = type;
			userDetailTab.userRecord = record;
			userDetailTab.refreshPanel(userDetailTab.getActiveTab());
			
			//刷新产品信息
			this.parent.prodGrid.userId = uid;
			this.parent.prodGrid.refresh();
		}else{
			var userDetailTab = this.parent.userDetailTab;
			userDetailTab.resetPanel();
			
			//刷新产品信息
			this.parent.prodGrid.userId = null;
			this.parent.prodGrid.getStore().removeAll();
		}
		
	},
	getSelections:function(){
		return this.getSelectionModel().getSelections();
	},
	getSelectedUsers:function(){
		//获取user面板中 选中的users
		var params = [];
		var users = App.getApp().data.users
		var a = this.getSelectionModel().getSelections();
		for (var i=0;i<a.length;i++){
			userId = a[i].get("user_id");
			for(var j=0;j<users.length;j++){
				if(userId == users[j].user_id){
					params.push(users[j]);
					break;
				}
			}
		}
		return params;
	},
	getSelectedUserIds:function(){
		//获取user面板中 选中的users
		var params = [];
		var users = App.getApp().data.users
		var a = this.getSelectionModel().getSelections();
		for (var i=0;i<a.length;i++){
			userId = a[i].get("user_id");
			params.push(userId);
		}
		return params;
	}
});

/**
 * 产品信息表格
 */ 
ProdGrid = Ext.extend(Ext.ux.Grid,{
	border:false,
	userProdStore:null,
	region: 'center',
	userId : null,
	parent: null,
	prodMap : null,
	constructor:function(p){
		this.parent = p;
		this.userProdStore = new Ext.data.JsonStore({
			fields: ["prod_sn","cust_id","acct_id","user_id","prod_id","serv_id","tariff_id","package_sn","order_type","status","status_date","is_base",
				"invalid_date","prod_eff_time","order_date","billinfo_eff_time","area_id","county_id","prod_name","package_name","next_bill_date",
				"tariff_name","tariff_rent","next_tariff_id","next_tariff_name","order_type_text","status_text","prod_desc","resList","resSize",
				"prod_type","is_zero_tariff","is_invalid_tariff","allow_pay","just_for_once","exp_date","pkg",'pre_open_time',"stop_by_invalid_date",
				"public_acctitem_type_text","public_acctitem_type","billinfo_eff_date",'user_status',"billing_cycle","has_dyn","is_pause","month_rent_cal_type",
				"is_bank_pay","is_bank_pay_text","p_bank_pay"],
			sortInfo: {
				field:'order_type',direction:'ASC',
				field:'is_base',direction:'DESC'
			}
		});
		this.userProdStore.on('load',this.doLoadResult,this);
		
		var cm = new Ext.ux.grid.LockingColumnModel({ 
    		columns : [
			{header:'产品名称',dataIndex:'prod_name',width:120},
			{header:'所属套餐',dataIndex:'package_name',width:100},
			{header:'当前资费',dataIndex:'tariff_name',	width:80},
			{header:'未生效资费',dataIndex:'next_tariff_name',width:80},
			{header:'预计到期日',dataIndex:'invalid_date',width:80,renderer:Ext.util.Format.dateFormat},
			{header:'状态',dataIndex:'status_text',	width:60,renderer:Ext.util.Format.statusShow},
			{header:'状态日期',dataIndex:'status_date',	width:120}
			
	        ]
	      });
		
		ProdGrid.superclass.constructor.call(this,{
			id:'U_PROD',
			title: '产品信息',
			stripeRows: true, 
			store:this.userProdStore,
			sm:new Ext.grid.RowSelectionModel(),
			view: new Ext.ux.grid.ColumnLockBufferView(),
			cm:cm
			,tools:[{id:'search',qtip:'查询',cls:'tip-target',scope:this,handler:function(){
				
					var comp = this.tools.search;
					if(this.userProdStore.getCount()>0){
						if(win)win.close();
						win = FilterWindow.addComp(this,[
							{text:'当前资费',field:'tariff_name',type:'textfield'},
							{text:'状态',field:'status',showField:'status_text'},
							{text:'订购方式',field:'order_type',showField:'order_type_text'}
						],335);
						if(win){	
							win.setPosition(comp.getX()-win.width, comp.getY()-50);//弹出框右对齐
							win.show();
						}
					}else{
						Alert('请先查询数据！');
					}
		    	}
		    }]
		})
	},
	initEvents: function(){
		this.on("rowclick", this.doClickRecord, this );
		this.on("afterrender",function(){
			this.swapViews();
		},this,{delay:10});
		
		ProdGrid.superclass.initEvents.call(this);
	},
	doLoadResult : function(_store, _rs, ops){//加载完后刷新产品详细面板
		//刷新prodDetailTab
		var prodSn = this.parent.prodDetailTab.prodSn;
		var tariffId = this.parent.prodDetailTab.tariffId;
		if(null != prodSn && null != tariffId){
			var isExist = false;//产品是否存在
			for(i=0;i<_rs.length;i++){
				if(prodSn == _rs[i].get('prod_sn')){
					var prodDetailTab = this.parent.prodDetailTab;
					prodDetailTab.resetPanel();
					prodDetailTab.prodSn = prodSn;
					prodDetailTab.tariffId = tariffId;
					prodDetailTab.userRecord = _rs[i];
					prodDetailTab.refreshPanel(prodDetailTab.getActiveTab());
					isExist = true;
					break;
				}
			}
			if(!isExist){
				this.parent.prodDetailTab.resetPanel();
			}
		}
	},
	doClickRecord: function(grid,rowIndex,e){
		var record = grid.getStore().getAt(rowIndex);
		var prodSn = record.get('prod_sn');
		var tariffId = record.get('tariff_id');
		var prodDetailTab = this.parent.prodDetailTab;
		prodDetailTab.resetPanel();
		prodDetailTab.prodSn = prodSn;
		prodDetailTab.tariffId = tariffId;
		prodDetailTab.userRecord = record;
		prodDetailTab.refreshPanel(prodDetailTab.getActiveTab());
	},
	getSelections:function(){
		return this.getSelectionModel().getSelections();
	},
	refresh:function(){
		this.userProdStore.removeAll();
		if(this.userId){
			var userProd = null;
			if(this.prodMap && (userProd=this.prodMap[this.userId]) ){
				var userRecord = this.parent.userGrid.getSelectionModel().getSelected();
				if(Ext.isEmpty(userRecord)){
					userRecord = this.parent.userGrid.getStore().getAt(0);
				}
				var status = userRecord.get('status');
				for(var i=0,len=userProd.length;i<len;i++){
					userProd[i]['user_status'] = status;
				}
				this.userProdStore.loadData(userProd);
			}
		}
	},
	remoteRefresh:function(){
		var cust = App.getData().custFullInfo.cust;
		//显示数据加载提示框
		App.showTip();
		Ext.Ajax.request({
			scope : this,
			url : Constant.ROOT_PATH + "/commons/x/QueryUser!queryAllProd.action",
			params : {
				custId : cust['cust_id'],
				custStatus : cust['status']
			},
			success : function(res,opt){
				var data = Ext.decode(res.responseText);
				this.prodMap = data;
				this.refresh();
				//隐藏数据加载提示框
				App.hideTip();
			}
		});
	},
	getSelectedProdSns:function(){
		//获取prod面板中 选中的prodSns
		var params = [];
		var recs = this.getSelectionModel().getSelections();
		for (var i=0;i<recs.length;i++){
			var prodSn = recs[i].get("prod_sn");
			params.push(prodSn);
		}
		return params;
	},
	reset : function(){//重置面板信息
		this.getStore().removeAll();
		this.userId = null;
	},
	getProdByUserId: function(user_id, prod_sn){
		var prods = this.prodMap[user_id];
		for(var i =0; i< prods.length; i++){
			if(prods[i]["prod_sn"] == prod_sn){
				return prods[i];
			}
		}
		return null;
	}
});
/**
 * 用户详细信息
 * @class UserDetailTemplate
 */
UserAtvTemplate = new Ext.XTemplate(
	'<table width="100%" border="0" cellpadding="0" cellspacing="0">',
		'<tr height=24>',
			'<td class="label" width=20%>用户类型：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.user_type_text ||""]}</td>',
			'<td class="label" width=20%>用户名：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.user_name ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>服务类型：</td>',
			'<td class="input" width=30%>&nbsp;{[values.serv_type_text ||""]}</td>',
			'<td class="label" width=20%>终端类型：</td>',
			'<td class="input" width=30%>&nbsp;{[values.terminal_type_text ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>状态：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.status_text ||""]}</td>',
			'<tpl if="values.status == \'REQSTOP\'">' +
			'<td class="label" width=20%>停机天数：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.DateDiffToday(values.status_date) ||""]}</td>',
			'</tpl>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>网络类型：</td>',
			'<td class="input" width=30%>&nbsp;{[values.net_type_text ||""]}</td>',
			'<td class="label" width=20%>开户时间：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.dateFormat(values.open_time) ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>用户地址：</td>',
			'<td class="input" width=30%>&nbsp;{[values.user_addr ||""]}</td>',
			'<td class="label" width=20%>预报停时间：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.DateWithToday(values.status,values.status_date,values.stop_date) ||""]}</td>',		
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>用户类别：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.str7_text ||""]}</td>',
		'</tr>',
	'</table>'
);
UserDtvTemplate = new Ext.XTemplate(
	'<table width="100%" border="0" cellpadding="0" cellspacing="0">',
		'<tr height=24>',
			'<td class="label" width=20%>用户类型：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.user_type_text ||""]}</td>',
			'<td class="label" width=20%>用户名：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.user_name ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" >服务类型：</td>',
			'<td class="input_bold" >&nbsp;{[values.serv_type_text ||""]}</td>',
			'<td class="label" >终端类型：</td>',
			'<td class="input_bold" >&nbsp;{[values.terminal_type_text ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" >网络类型：</td>',
			'<td class="input_bold" >&nbsp;{[values.net_type_text ||""]}</td>',
			'<td class="label" >开户时间：</td>',
			'<td class="input" >&nbsp;{[fm.dateFormat(values.open_time)]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" >机顶盒号：</td>',
			'<td class="input" colspan="3">&nbsp;{[values.stb_id ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" >智能卡号：</td>',
			'<td class="input" colspan="3">&nbsp;{[values.card_id ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" >Modem号：</td>',
			'<td class="input" colspan="3">&nbsp;{[values.modem_mac ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" >停机类型：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.stop_type_text ||""]}</td>',
			'<tpl if="values.status == \'REQSTOP\'">' +
			'<td class="label" width=20%>停机天数：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.DateDiffToday(values.status_date) ||""]}</td>',
			'</tpl>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>状态：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.status_text ||""]}</td>',
			'<td class="label">用户地址：</td>',
			'<td class="input">&nbsp;{[values.user_addr ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>排斥资源：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.rejectRes ||""]}</td>',
			'<tpl if="values.str19 == \'T\'">',
			'<td class="label" width=20%>免费：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.str19_text ||""]}</td>',	
			'</tpl>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>预报停时间：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.DateWithToday(values.status,values.status_date,values.stop_date) ||""]}</td>',
			'<td class="label" width=20%>用户类别：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.str7_text ||""]}</td>',
		'</tr>',
		'<tpl if="values.serv_type == \'DOUBLE\'">',
			'<tr height=24>',
				'<td class="label" width=25%>双向用户类型：</td>',
				'<td class="input" colspan="3">&nbsp;{[values.str11_text ||""]}</td>',
			'</tr>',
		'</tpl>',
	'</table>'
);
UserBroadbandTemplate = new Ext.XTemplate(
	'<table width="100%" border="0" cellpadding="0" cellspacing="0">',
		'<tr height=24>',
			'<td class="label" width=20%>用户类型：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.user_type_text ||""]}</td>',
			'<td class="label" width=20%>用户名：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.user_name ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>认证方式：</td>',
			'<td class="input" width=30%>&nbsp;{[values.check_type_text ||""]}</td>',
			'<td class="label" width=20%>绑定方式：</td>',
			'<td class="input" width=30%>&nbsp;{[values.bind_type_text ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>登录名：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.login_name ||"" ]}</td>',
			'<td class="label" width=20%>密码：</td>',
			'<td class="input" width=30%>******</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>Modem号：</td>',
			'<td class="input" width=30%>&nbsp;{[values.modem_mac ||""]}</td>',
			'<td class="label" width=20%>最大连接数：</td>',
			'<td class="input" width=30%>&nbsp;{[values.max_connection ||""]}</td>',
		'</tr>',
		
		'<tr height=24>',
			'<td class="label" width=20%>状态：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.status_text ||""]}</td>',
			'<tpl if="values.status == \'REQSTOP\'">' +
			'<td class="label" width=20%>停机天数：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.DateDiffToday(values.status_date) ||""]}</td>',
			'</tpl>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>网络类型：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.net_type_text ||""]}</td>',
			'<td class="label" width=20%>开户时间：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.dateFormat(values.open_time) ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>优惠类型：</td>',
			'<td class="input" width=30%>&nbsp;{[values.user_class_text ||""]}</td>',		
			'<td class="label" width=20%>用户地址：</td>',
			'<td class="input" width=30%>&nbsp;{[values.user_addr ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>预报停时间：</td>',
			'<td class="input" width=30%>&nbsp;{[fm.DateWithToday(values.status,values.status_date,values.stop_date) ||""]}</td>',	
			'<td class="label" width=20%>最大用户数：</td>',
			'<td class="input" width=30%>&nbsp;{[values.max_user_num ||""]}</td>',
		'</tr>',
		'<tr height=24>',
			'<td class="label" width=20%>用户类别：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.str7_text ||""]}</td>',
		'</tr>',
	'</table>'
);
UserDetailTemplate = {
	"ATV": UserAtvTemplate,
	"DTV": UserDtvTemplate,
	"BAND": UserBroadbandTemplate
};

/**
 * 用户异动信息
 * @class PropChangeGrid
 * @extends Ext.grid.GridPanel
 */
UserPropChangeGrid = Ext.extend(Ext.grid.GridPanel,{
	region: 'center',
	border: false,
	changeStore: null,
	isReload : true,//用于判断第一次激活时加载
	constructor: function(){
		this.changeStore = new Ext.data.JsonStore({
			fields: ["cust_id","user_id","column_name","column_name_text","old_value","old_value_text","new_value","new_value_text",
					"done_code","change_time","optr_name","busi_name"]
		});
		var cm = [
			{header:'业务',dataIndex:'busi_name',width:80,renderer:App.qtipValue},
			{header:'属性',dataIndex:'column_name_text',width:80},
			{header:'修改前',dataIndex:'old_value_text',	width:80,renderer:App.qtipValue},
			{header:'修改后',dataIndex:'new_value_text',	width:80,renderer:App.qtipValue},
			{header:'修改时间',dataIndex:'change_time',	width:100,renderer:App.qtipValue},
			{header:'操作员',dataIndex:'optr_name'}
		];
		var pageTbar = new Ext.PagingToolbar({store: this.changeStore ,pageSize : App.pageSize});
		pageTbar.refresh.hide();
		UserPropChangeGrid.superclass.constructor.call(this,{
			region: 'center',
			store:this.changeStore,
			columns:cm,
			bbar: pageTbar
		})
	},
	
	remoteRefresh:function(uid,utype){
		Ext.Ajax.request({
			url: Constant.ROOT_PATH + "/commons/x/QueryUser!queryUserPropChange.action",
			scope:this,
			params:{userId:uid,userType:utype},
			success:function(res,opt){
				var data = Ext.decode(res.responseText);
				//PagingMemoryProxy() 一次性读取数据
				this.changeStore.proxy = new Ext.data.PagingMemoryProxy(data),
				//本地分页
				this.changeStore.load({params:{start:0,limit:App.pageSize}});
			}
		});
	},
	reset : function(){//重置面板信息
		this.getStore().removeAll();
		this.isReload = true;
	}
});

/**
 * 用户促销信息
 * @class UserPropChangeGrid
 * @extends Ext.grid.GridPanel
 */
PromotionGrid = Ext.extend(Ext.ux.Grid,{
	region: 'center',
	border: false,
	changeStore: null,
	isReload : true,//用于判断第一次激活时加载
	constructor: function(){
		this.promotionStore = new Ext.data.JsonStore({
			fields: ["promotion_sn","user_id","promotion_id","promotion_name","times",
				"status","status_text","create_time","is_necessary","total_acct_fee",
				"total_acct_count","repetition_times","total_acct_fee","theme_id","auto_exec",
				"eff_date","exp_date"]
		});
		
		var cm = new Ext.ux.grid.LockingColumnModel({ 
    		columns : [
            {header:'促销编号',dataIndex:'promotion_sn',width:60,hidden : true},
			{header:'促销名称',dataIndex:'promotion_name',width:150},
			{header:'状态',dataIndex:'status_text',width:80},
			{header:'操作时间',dataIndex:'create_time',	width:80,renderer:Ext.util.Format.dateFormat}
	        ]
	      });
		
	    var sm = new Ext.grid.CheckboxSelectionModel();
		var pageTbar = new Ext.PagingToolbar({store: this.changeStore ,pageSize : App.pageSize});
		pageTbar.refresh.hide();
		PromotionGrid.superclass.constructor.call(this,{
			id : 'UserPromotion',
			region: 'center',
			store:this.promotionStore,
			sm : sm,
			cm:cm,
			view: new Ext.ux.grid.ColumnLockBufferView(),
			bbar: pageTbar
		})
	},
	initEvents: function(){
		this.on("afterrender",function(){
			this.swapViews();
		},this,{delay:10});
		
		PromotionGrid.superclass.initEvents.call(this);
	},
	remoteRefresh:function(uid,utype){
		Ext.Ajax.request({
			url: Constant.ROOT_PATH + "/commons/x/QueryUser!queryUserPromotion.action",
			scope:this,
			params:{userId:uid},
			success:function(res,opt){
				var data = Ext.decode(res.responseText);
				//PagingMemoryProxy() 一次性读取数据
				this.promotionStore.proxy = new Ext.data.PagingMemoryProxy(data),
				//本地分页
				this.promotionStore.load({params:{start:0,limit:App.pageSize}});
			}
		});
	},
	reset : function(){//重置面板信息
		this.getStore().removeAll();
		this.isReload = true;
	}
});

/*
 * 用户有效资源
 */
UserValidResGrid = Ext.extend(Ext.grid.GridPanel,{
	border: false,
	resStore: null,
	isReload : true,//用于判断第一次激活时加载
	constructor: function(){
		this.resStore = new Ext.data.JsonStore({
			fields: ["res_id","res_name"]
		});
		var cm = [
			{header:'资源编号',dataIndex:'res_id'},
			{header:'资源名称',dataIndex:'res_name'}
		];
		var pageTbar = new Ext.PagingToolbar({store: this.resStore ,pageSize : App.pageSize});
		pageTbar.refresh.hide();
		UserValidResGrid.superclass.constructor.call(this,{
			store:this.resStore,
			columns:cm,
			viewConfig : {
				forceFit : true
			},
			bbar: pageTbar
		})
	},
	
	remoteRefresh:function(uid,utype){
		Ext.Ajax.request({
			url: Constant.ROOT_PATH + "/core/x/User!queryValidRes.action",
			scope:this,
			params:{userId:uid,userType:utype},
			success:function(res,opt){
				var data = Ext.decode(res.responseText);
				//PagingMemoryProxy() 一次性读取数据
				this.resStore.proxy = new Ext.data.PagingMemoryProxy(data),
				//本地分页
				this.resStore.load({params:{start:0,limit:App.pageSize}});
			}
		});
	},
	reset : function(){//重置面板信息
		this.getStore().removeAll();
		this.isReload = true;
	}
});

/**
 * 用户详细信息
 * @class UserDetailInfo
 * @extends Ext.Panel
 */
UserDetailInfo = Ext.extend(Ext.Panel,{
	type : 'DTV',//默认为数字电视用户的模板
	tpl: null,
	constructor: function(){
		this.tpl = UserDetailTemplate[this.type];
		this.tpl.compile();
		UserDetailInfo.superclass.constructor.call(this, {
			border: false,
			layout: 'anchor',
			anchor: '100%',
			autoScroll:true,
			bodyStyle: "background:#F9F9F9",
			defaults: {
					bodyStyle: "background:#F9F9F9"
				},
			items : [{xtype : "panel",
						border : false,
						bodyStyle: "background:#F9F9F9; padding: 10px;padding-top: 4px;padding-bottom: 0px;",
						html : this.tpl.applyTemplate({})
					}]
		});
	},
	reset:function(){//重置详细信息
		if(this.items.itemAt(0).getEl()){
			this.tpl.overwrite( this.items.itemAt(0).body, {});
		}
	},
	refresh:function(type,record){
		this.tpl = UserDetailTemplate[type];
		this.tpl.overwrite( this.items.itemAt(0).body, record.data);
	}
});

UserDetailTab = Ext.extend(CommonTab,{
	region:"center",
	userPropChangeGrid: null,
	userValidResGrid : null,
	userDetailInfo: null,
	promotionGrid : null,
	userId : null,
	type : null,
	isReload: null,
	userRecord : null,
	parent:null,
	constructor:function(p){
		this.parent = p;
		this.userPropChangeGrid = new UserPropChangeGrid();
		this.userDetailInfo = new UserDetailInfo();
		this.userValidResGrid = new UserValidResGrid();
		this.promotionGrid = new PromotionGrid();
		UserDetailTab.superclass.constructor.call(this, {
			activeTab: 0,
			border: false,
			defaults: {
				layout: 'fit',
				border:false
			},
			items:[{
				title:'详细信息',
//				id : 'test',
				items:[this.userDetailInfo]
			},{
				title:'异动信息',
				items:[this.userPropChangeGrid]
			},{
				title : '有效资源',
				items:[this.userValidResGrid]
			},{
				title : '促销信息',
				items:[this.promotionGrid]
			}]
		});
	},
	refreshPanel : function(p){
		var content = p.items.itemAt(0);
		if(content.type){
			if(this.isReload && this.type && this.userRecord){
				this.refreshUserDetail(this.type,this.userRecord);
				this.isReload = false;
			}
		}else{
			if(content.isReload && this.userId){
				content.remoteRefresh(this.userId,this.type);
				content.isReload = false;
			}
		}
	},
	refreshUserDetail: function(type,record){
		this.userDetailInfo.refresh(type,record);
		this.parent.prodDetailTab.resetPanel();
		
	},
	resetPanel : function(){//重置TAB面板
		this.userPropChangeGrid.reset();
		this.userValidResGrid.reset();
		this.userDetailInfo.reset();
		this.promotionGrid.reset();
		this.userId = null;
		this.type = null;
		this.userRecord = null;
		this.isReload = true;
	}
});

ProdDetailTemplate = new Ext.XTemplate(
	'<table width="100%" border="0" cellpadding="0" cellspacing="0">',
		'<tr height=24>',
			'<td class="label" width=20%>产品名称：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.prod_name ||""]}</td>',
			'<td class="label" width=20%>状态：</td>',
			'<td class="input_bold" width=30%>&nbsp;{[values.status_text ||""]}</td>',
		'</tr>',
		'<tr height=24>',
	      	'<td class="label" width=20%>资费名称：</td>',
	      	'<td class="input_bold" width=30%>&nbsp;{[values.tariff_name ||""]}</td>',
      		'<td class="label" width=25%>未生效资费：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[values.next_tariff_name ||""]}</td>',	      	
    	'</tr>',
    	'<tr height=24>',
      		'<td class="label" width=20%>订购方式：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[values.order_type_text ||""]}</td>',
	      	'<td class="label" width=20%>订购日期：</td>',
	      	'<td class="input_bold" width=30%>&nbsp;{[fm.dateFormat(values.order_date) ||""]}</td>',      		

    	'</tr>',
    	'<tr height=24>',
    	    '<td class="label" width=20%>产品描述：</td>',
      		'<td class="input_bold" colspan=3>&nbsp;{[values.prod_desc ||""]}</td>',
    	'</tr>',      		
    	'<tr height=24>',

      		'<td class="label" width=20%>预计到期日期：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[fm.dateFormat(values.invalid_date) ||""]}</td>',
      		'<td class="label" width=25%>开始计费日期：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[fm.dateFormat(values.billinfo_eff_date) ||""]}</td>',
    	'</tr>',
    	'<tr height=24>',
      		'<td class="label" width=25%>预开通日期：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[fm.dateFormat(values.pre_open_time) ||""]}</td>',
      		'<td class="label" width=20%>失效日期：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[fm.dateFormat(values.exp_date) ||""]}</td>',
    	'</tr>',
    	'<tr height=24>',
      		'<td class="label" width=25%>公用使用类型：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[values.public_acctitem_type_text ||""]}</td>',
      		'<td class="label" width=20%>停机类型：</td>',
      		'<td class="input_bold" width=30%>',
      			'<tpl if="values.stop_by_invalid_date==\'T\'">',
      				'到期日',
      			'</tpl>',
      			'<tpl if="values.stop_by_invalid_date==\'F\'">',
      				'账务',
      			'</tpl>',
      		'</td>',
    	'</tr>',
    	'<tr height=24>',
      		'<td class="label" width=25%>银行扣费：</td>',
      		'<td class="input_bold" width=30%>&nbsp;{[values.is_bank_pay_text||""]}</td>',      		
    	'</tr>',    
	'</table>'
);

/**
 * 产品资费信息
 * @class ProdExpensesGrid
 * @extends Ext.grid.GridPanel
 */
ProdExpensesGrid = Ext.extend(Ext.grid.GridPanel,{
	region:'center',
	border:false,
	expensesStore:null,
	isReload : true,
	constructor:function(){
		this.expensesStore = new Ext.data.JsonStore({
			url:Constant.ROOT_PATH + "/commons/x/QueryUser!queryUserProdTariff.action",
			fields: ["tariff_name","billing_type","rent","billing_type_text"],
			sortInfo:{
				field:'rent',
				direction:'DESC'
			}
		}); 
		
		var cm = [
			{header:'资费名称',dataIndex:'tariff_name', width:90},
			{header:'计费方式',dataIndex:'billing_type_text', width:90},
			{header:'租费',dataIndex:'rent',renderer : Ext.util.Format.formatFee, width:90}
		];
				  
		ProdExpensesGrid.superclass.constructor.call(this,{
			id : 'prodExpensesGrid',
			region: 'center',
			store:this.expensesStore,
			columns:cm
		})
	},
	remoteRefresh:function(tariffId){
		this.expensesStore.baseParams.tariffId= tariffId;
		this.expensesStore.load();
	},
	reset : function(){
		this.getStore().removeAll();
		this.isReload = true;
	}
});

/**
 * 资费变更信息
 * @class ProdChangeGrid
 * @extends Ext.grid.GridPanel
 */
TariffChangeGrid = Ext.extend(Ext.grid.GridPanel,{
	region:'center',
	border:false,
	changeStore:null,
	isReload : true,
	constructor:function(){
		this.changeStore = new Ext.data.JsonStore({
			url:Constant.ROOT_PATH + "/commons/x/QueryUser!tariffProdChange.action",
			fields: ["sn","tariff_id","eff_date","exp_date","area_id","county_id","old_tariff_name","new_tariff_name"],
			root: 'records',
			totalProperty: 'totalProperty',
			sortInfo:{
				field:'exp_date',
				direction:'DESC'
			}
		}); 
		
		var cm = [
			{header:'生效资费名称',dataIndex:'new_tariff_name', width:110},
			{header:'失效资费名称',dataIndex:'old_tariff_name', width:110},
			{header:'生效日期',dataIndex:'eff_date', width:110,renderer:Ext.util.Format.dateFormat},
			{header:'失效日期',dataIndex:'exp_date', width:110}
		];
				  
		TariffChangeGrid.superclass.constructor.call(this,{
			region: 'center',
			store:this.changeStore,
			columns:cm
		})
	},
	remoteRefresh:function(prodSn){
		this.changeStore.baseParams.prodSn = prodSn;
		this.changeStore.load({
			params: { start: 0, limit: App.pageSize }
		});
	},
	reset : function(){
		this.getStore().removeAll();
		this.isReload = true;
	}
});

/**
 * 产品状态异动
 * @class ProdPropChangeGrid
 * @extends Ext.grid.GridPanel
 */
ProdPropChangeGrid = Ext.extend(Ext.grid.GridPanel,{
	region:'center',
	border:false,
	changeStore:null,
	isReload : true,
	constructor:function(){
		this.changeStore = new Ext.data.JsonStore({
			url:Constant.ROOT_PATH + "/commons/x/QueryUser!querProdPropChange.action",
			fields: ["sn","column_name","busi_name","optr_name","column_name_text","old_value","new_value","done_code","change_time"],
			root: 'records',
			totalProperty: 'totalProperty',
			params:{start:0,limit:20},
			sortInfo:{
				field:'change_time',
				direction:'DESC'
			}
		}); 
		
		var cm = [
			{header:'业务',dataIndex:'busi_name', width:60,renderer:App.qtipValue},
			{header:'属性',dataIndex:'column_name_text', width:90,renderer:App.qtipValue},
			{header:'修改前',dataIndex:'old_value', width:90},
			{header:'修改后',dataIndex:'new_value',width:90},
			{header:'修改日期',dataIndex:'change_time',width:130},
			{header:'操作员',dataIndex:'optr_name',width:80}
		];
				  
		ProdPropChangeGrid.superclass.constructor.call(this,{
			region: 'center',
			store:this.changeStore,
			columns:cm,
			bbar: new Ext.PagingToolbar({
	        	pageSize: 20,
				store: this.changeStore
			})
		})
	},
	remoteRefresh:function(prodSn,prodStatus){
		this.changeStore.baseParams.prodSn = prodSn;
		this.changeStore.baseParams.prodStatus = prodStatus;
		this.changeStore.baseParams.start = 0;
		this.changeStore.baseParams.limit = 20;
		this.changeStore.load();
	},
	reset : function(){
		this.getStore().removeAll();
		this.isReload = true;
	}
});

/**
 * 产品资源信息
 * @class ProdResPanel
 * @extends Ext.Panel
 */
ProdResGrid = Ext.extend(Ext.grid.GridPanel,{
	isReload : true,
	ResStore : null,//产品资源
	constructor : function(){
		this.ResStore = new Ext.data.JsonStore({
			url:Constant.ROOT_PATH + "/commons/x/QueryUser!queryUserProdRes.action",
			fields : ["res_id","res_desc","res_name","external_res_id"]
		});
		
		ProdResGrid.superclass.constructor.call(this,{
			border: false,
			region: 'center',
			store:this.ResStore,
			columns:[
				{header:'控制字',dataIndex:'external_res_id',width:40},
				{header:'资源名字',dataIndex:'res_name'},
				{header:'资源描述',dataIndex:'res_desc'}
			],
			viewConfig : {
				forceFit : true
			}
		})
	},
	remoteRefresh:function(prodSn){
		this.ResStore.baseParams.prodSn = prodSn;
		this.ResStore.load();
	},
	reset : function(){//重置面板信息
		this.ResStore.removeAll();
		this.isReload = true;
	}
})


/**
 * 产品详细信息
 * @class ProdDetailInfo
 * @extends Ext.Panel
 */
ProdDetailInfo = Ext.extend(Ext.Panel,{
	templateData:{resList:[]},
	tpl: null,
	constructor: function(){
		this.tpl = ProdDetailTemplate;
		this.tpl.compile();
		ProdDetailInfo.superclass.constructor.call(this, {
			border: false,
			layout: 'anchor',
			anchor: '100%',
			bodyStyle: "background:#F9F9F9;overflow-y:auto;overflow-x:hidden;",
			defaults: {
					bodyStyle: "background:#F9F9F9"
				},
			items : [{xtype : "panel",
						border : false,
						bodyStyle: "background:#F9F9F9; padding: 10px;padding-top: 4px;padding-bottom: 0px;",
						html : this.tpl.applyTemplate(this.templateData)
					}]
		});
	}
	,
	reset:function(){//重置详细信息
		if(this.items.itemAt(0).getEl()){
			this.tpl.overwrite( this.items.itemAt(0).body, this.templateData);
		}
	},
	refresh:function(record){
		this.tpl.overwrite( this.items.itemAt(0).body, record.data);
	}
});

ProdDetailTab = Ext.extend(CommonTab,{
	prodExpensesGrid:null,
	prodChangeGrid:null,
	prodResGrid:null,
	prodDetailInfo: null,
	region:"center",
	prodSn : null,
	tariffId : null,
	userRecord : null,
	isReload:true,
	constructor:function(){
		this.prodExpensesGrid = new ProdExpensesGrid();
		this.prodPropChangeGrid = new ProdPropChangeGrid();
		this.tariffChangeGrid = new TariffChangeGrid();
		this.prodResGrid = new ProdResGrid();
		this.prodDetailInfo = new ProdDetailInfo();
		ProdDetailTab.superclass.constructor.call(this, {
			activeTab: 0,
			border: false,
			defaults: {
				layout: 'fit',
				border:false
			},
			items:[{
				title:'详细信息',
				items:[this.prodDetailInfo]
			},{
				title:'资源信息',
				items:[this.prodResGrid]
			},{
				title:'资费信息',
				items:[this.prodExpensesGrid]
			},{
				title:'状态异动',
				items:[this.prodPropChangeGrid]
			},{
				title:'资费变更',
				items:[this.tariffChangeGrid]
			}]
		});
	},
	refreshPanel : function(p){
		var content = p.items.itemAt(0);
		if(content.templateData){
			if(this.isReload && this.userRecord && this.prodSn){
				this.refreshProdDetail(this.userRecord,this.prodSn);
				this.isReload = false;
			}
		}else{
			if(content.isReload){//如果需要重载
				if(content.getId() == 'prodExpensesGrid'){
					if(this.tariffId){//如果存在
						content.remoteRefresh(this.tariffId);
						content.isReload = false;	
					}
				}else{
					if(this.prodSn){//如果存在
						var prodRecord = App.getApp().main.infoPanel.getUserPanel().prodGrid.getSelections()[0];
						/*if(!prodRecord){
							throw new Error('获取数据出错,未能获取产品信息表格的数据!');
						}
						var status = prodRecord.get('status');
						content.remoteRefresh(this.prodSn,status);
						content.isReload = false;*/
						if(prodRecord){
							var status = prodRecord.get('status');
							content.remoteRefresh(this.prodSn,status);
							content.isReload = false;
						}
					}
				}
			}
		}
	},
	refreshProdDetail: function(record,prodSn){
		this.refresh(record);
	},
	refresh: function(record){
		this.prodDetailInfo.refresh(record);
	},
	resetPanel : function(){//重置Tab面板的子面板信息
		this.prodDetailInfo.reset();
		this.prodExpensesGrid.reset();
		this.prodPropChangeGrid.reset();
		this.prodResGrid.reset();
		this.tariffChangeGrid.reset();
		this.prodSn = null;
		this.tariffId = null;
		this.userRecord = null;
		this.isReload = true;
	}
});

/**
 * 用户信息面板
 * @class UserPanel
 * @extends Ext.Panel
 */
UserPanel = Ext.extend( BaseInfoPanel , {
	// 面板属性定义
	userGrid:null,
	prodGrid:null,
	mask: null ,
	userDetailTab: null,
	prodDetailTab: null,
	constructor: function(){
		this.userGrid = new UserGrid(this);
		this.prodGrid = new ProdGrid(this);
		this.userDetailTab =  new UserDetailTab(this);
		this.prodDetailTab = new ProdDetailTab();
		UserPanel.superclass.constructor.call(this, {
			layout:"border",
			border:false,
			items:[{
				region:"center",
				layout:"anchor",
				border: false,
				items:[{
					anchor:"100% 60%",
					layout:'border',
					border: false,
					bodyStyle: 'border-right-width: 1px; ',
					items:[this.userGrid]
				},{
					anchor:"100% 40%",
					layout:'border',
					border: false,
					bodyStyle: 'border-top-width: 1px;border-right-width: 1px; ',
					items:[this.prodGrid]
				}]
			},{
				region:"east",
				split:true,
				width:"38%",
				layout:"anchor",
				border: false,
				items:[{
					anchor:"100% 60%",
					layout:'border',
					border: false,
					bodyStyle: 'border-left-width: 1px; border-bottom-width: 1px; ',
					items:[this.userDetailTab]
				},{
					anchor:"100% 40.1%",
					layout:'border',
					border: false,
					bodyStyle: 'border-left-width: 1px; ',
					items:[this.prodDetailTab]
				}]
			}]
		});
	},
	refresh:function(){
		//if (!App.getApp().isPreCust()){
			//客户不是预开户客户
			this.userDetailTab.resetPanel();
			this.prodGrid.reset();
			this.prodDetailTab.resetPanel();
			this.userGrid.remoteRefresh();
//			this.prodGrid.remoteRefresh();
		//}
	},
	getUserDetailTemplate: function(){
		return UserDetailTemplate;
	}
});
Ext.reg( "userPanel" , UserPanel );