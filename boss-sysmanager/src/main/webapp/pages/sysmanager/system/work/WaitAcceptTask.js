/**
 * 待受理工单
 */
var WaitAcceptGrid = Ext.extend(TaskBaseForm, {
	taskStore : null,
	waitSm:new Ext.grid.CheckboxSelectionModel({}),
	constructor : function() {
		this.doInit();
		this.taskStore = new Ext.data.JsonStore({
				url:root+'/config/Task!queryWaitAcceptTask.action',
				fields:['work_id','cust_id','cust_no','task_type','tel','create_type','task_type_text',
				'task_status','task_status_text','books_optr','books_time','books_optr_text','task_cust_name',{
					name: 'assign_time',
					type: 'date',
					dateFormat: 'Y-m-d H:i:s'
				},"assign_dept","assign_dept_text",
				"assign_optr","assign_optr_text","busi_name",
				"busi_code","install_addr","old_addr","installer_optr_text","installer_dept_text","installer_dept","installer_optr"
				,"remark"],
				root : 'records',
				totalProperty : 'totalProperty',
				autoDestroy : true
		});
    	// create the Grid
		WaitAcceptGrid.superclass.constructor.call(this, {
				buttons:this.buttons ,
				id : 'WaitAcceptGridId',
				region : 'center',
				store: this.taskStore,
		        cm: new Ext.ux.grid.LockingColumnModel({
		        	columns:[
		        	this.waitSm,
					//{header: '工单编号',		dataIndex : 'task_id', 				width: 100},
					{header: '预约时间', 		dataIndex: 'books_time', width: 140 },
					{header: '联系人', 		dataIndex: 'task_cust_name', 				width: 80},
					{header: '联系电话', 	dataIndex : 'tel', 				width: 100},
					{header: '地址', 		dataIndex : 'install_addr', 			width: 200},
					{header: '工单类型',		dataIndex : 'task_type_text', 	width: 100, renderer: function(v, m ,rs){
						return "<span style='font-weight: bold;'>"+ v +"</span>";
					}},
					{header: '工单状态', 		dataIndex: 'task_status', width: 100, renderer: function(v, m ,rs){
						var text = rs.get("task_status_text");
						var color = "black";
						if(v == 'INIT'){
							color = "purple";
						}else if(v == 'INSTALL'){
							color = "orange";
						}else if(v == 'END'){
							color = "green";
						}else if(v == 'CANCEL'){
							color = "gray";
						}
						return "<span style='font-weight: bold;color: "+ color +";'>"+ text +"</span>";
					}},				
					{header : "操作", menuDisabled : true, locked: true, dataIndex:'xxx', width : 120,scope:this,
					 renderer:function(v,m,rs,rIndex,cIndex,store){
					 	var btns = this.doFilterBtns('WaitAcceptGridId',rs,this);
	            		return btns;
					}},
					{header: '创建时间', 		dataIndex: 'create_time', 		width: 140,renderer:Ext.util.Format.dateFormat},
					{header: '客户受理号',	dataIndex : 'cust_no', 				width: 80},
					{header: '业务类型',		dataIndex : 'busi_name', 	width: 100, renderer: function(v, m ,rs){
						return "<span style='font-weight: bold;'>"+ v +"</span>";
					}},
					
					{header: '施工部门', dataIndex: 'assign_dept_text' , width: 100},
					{header: '创建人员', dataIndex: 'books_optr_text' , width: 100},
					{header:'施工备注',dataIndex:'remark',width:100,renderer:App.qtipValue}
		        ]}),
		        sm: this.waitSm,
		        region: 'center',
		        stripeRows: true,
				bbar: new Ext.PagingToolbar({
			        store: this.taskStore, // grid and PagingToolbar using same store
			        pageSize: Constant.DEFAULT_PAGE_SIZE
			    }),
				tbar: ['创建时间:',this.createStartDateField,' ',this.createEndDateField,'-',
				this.custNoField,' ',this.newaddrField,' ',this.mobileField,' ','-',this.taskTeamCombo,'-',this.taskDetailTypeCombo,'-',{
					text: '搜索工单',
					pressed: true,
					scope: this,
					width: 80,
					handler: this.doSearchTask
				}]
				
			});
	},
	initComponent : function() {
		WaitAcceptGrid.superclass.initComponent.call(this);
		for(var i=0;i<App.subMenu.length;i++){
			if(App.subMenu[i]['handler'] == 'ivalid_btn_id'){
				this.addButton(this.ivalidBtn);
			}else if(App.subMenu[i]['handler'] == 'send_btn_id'){
				this.addButton(this.sendBtn);
			}
		}
		this.addButton(this.printBtn);
		var comboes = this.findByType("paramcombo");
		//初始化下拉框的数据 
		App.form.initComboData([this.taskDetailTypeCombo]);
	},
	doSearchTask: function(){
		this.doSearchBaseTask('WaitAcceptGridId','INIT');		
	},
	doPrintTask:function(){
		this.doPrintBaseTask('WaitAcceptGridId');
	}
});

WaitAcceptTaskView = Ext.extend(Ext.Panel, {
			constructor : function() {
				waitAcceptGrid = new WaitAcceptGrid();
				WaitAcceptTaskView.superclass.constructor.call(this, {
							id : 'WaitAcceptTaskView',
							title : '待处理工单',
							closable : true,
							border : false,
							layout : 'border',
							baseCls : "x-plain",
							items : [waitAcceptGrid]
						});
			}
		});
