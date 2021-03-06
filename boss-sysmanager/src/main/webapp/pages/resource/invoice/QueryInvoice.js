QueryInvoiceForm = Ext.extend(Ext.form.FormPanel,{
	parent:null,
	fillOptrCombo:function(deptId){
		Ext.Ajax.request({
			url : "resource/Invoice!getByDeptId.action",
			params:{deptId:deptId},scope:this,
			success:function(req){
				var data = Ext.decode(req.responseText);
				var store = this.getForm().findField('invoiceDto.optrids').getStore();
				store.loadData(data||[]);
			}
		});
	},
	constructor:function(p){
		this.parent = p;
		QueryInvoiceForm.superclass.constructor.call(this,{
			border:false,
			listeners:{
				scope:this,
				render:function(thisObj){
					
					var comboArrs = [];
					var comboParamNames = [];
					var complexFields = this.findByType('compositefield');
					for(var index =0;index<complexFields.length;index++){
						var cf = complexFields[index];
						for(var idx =0;idx<cf.items.length;idx++){
							var field = cf.items[idx];
							if( (field.xtype.indexOf('combo') >= 0)  && !Ext.isEmpty(field.paramName) ){
								comboArrs.push(field);
								comboParamNames.push(field.paramName);
							}
						}
					}
					
					Ext.Ajax.request({
						params: {comboParamNames: comboParamNames},
						url: root + "/ps.action",
						success: function( res, ops){
							var data = Ext.decode(res.responseText );
							for( var i=0;i<data.length ;i++ ){
								comboArrs[i].store.loadData(data[i]);
							}
						}
					});
				}
			},
			bodyStyle:'padding:10px',
			labelWidth:75,
			layout:'column',
			items:[
				{columnWidth:.5,layout:'form',border:false,items:[
						{xtype:'treecombo',fieldLabel:'仓库',hiddenName:'invoiceDto.depot_id',
						width:322,
						treeWidth:322,
						height: 20,
						allowBlank: false,
						onlySelectLeaf:false,
						emptyText :'请选择仓库',
						blankText:'请选择仓库',
						treeUrl: 'resource/Invoice!queryChildInvoiceDepot.action',
						listeners : {
							scope:this,
							'focus' : function(comboTree){
								if(comboTree.list){
									comboTree.expand();
								}
							},
							select:function(comboTree,node,nodeAttrs){
								this.fillOptrCombo(nodeAttrs.id)
							}
						}
						}
				]},
				{columnWidth:.5,layout:'form',style:'padding-buttom:5px',border:false,items:[
				
					{fieldLabel:'操作员',width:322,height: 20,hiddenName:'invoiceDto.optrids',xtype:'paramlovcombo',
						displayField:'optr_name',valueField:'optr_id',
						editable:true,triggerAction:'all',
						store:new Ext.data.JsonStore({
							fields:['optr_id','optr_name']
						}),
						listeners:{
							scope:this,
							keyup:function(field){
								field.filter('optr_name',field.getRawValue());
							}
						}
					}
				
				]},
				{columnWidth:.5,layout:'form',border:false,items:[
					{fieldLabel:'发票号码',
					    xtype:'compositefield',combineErrors:false,
					    items: [
					        {xtype:'textfield',name:'invoiceDto.start_invoice_id',vtype:'invoiceId',height:22,width:150},
					        {xtype:'displayfield',value:'至'},
					        {xtype:'textfield',name:'invoiceDto.end_invoice_id',vtype:'invoiceId',height:22,width:150}
				    	]
					},
					{fieldLabel:'入库时间',
						    xtype:'compositefield',combineErrors:false,
						    items: [
						        {xtype:'datefield',name:'invoiceDto.start_input_time',style:'width:135px;height:22px',format:'Y-m-d'},
						        {xtype:'displayfield',value:'至'},
						        {xtype:'datefield',name:'invoiceDto.end_input_time',style:'width:135px;height:22px',format:'Y-m-d'}
					    	]
						},
						{fieldLabel:'核销时间',
						    xtype:'compositefield',combineErrors:false,
						    items: [
						        {xtype:'datefield',name:'invoiceDto.start_close_time',style:'width:135px;height:22px',format:'Y-m-d'},
						        {xtype:'displayfield',value:'至'},
						        {xtype:'datefield',name:'invoiceDto.end_close_time',style:'width:135px;height:22px',format:'Y-m-d'}
					    	]
						}	
				]},
				/*
				{columnWidth:.5,layout:'hbox',defaults:{border:false,flex:1},border:false,items:[
				{layout:'form',flex:3.4,defaults:{border:false},items:{fieldLabel:'发票代码',xtype:'textfield',name:'invoiceDto.invoice_code',style:'width:103px;height:22px'}},
			    {layout:'form',flex:6,defaults:{border:false},items:{fieldLabel:'发票类型',hiddenName:'invoiceDto.invoice_type',xtype:'paramlovcombo',width:135,paramName:'INVOICE_TYPE'}}
				]},
				*/
				{columnWidth:.5,layout:'form',border:false,width:320,items:[
						{fieldLabel:'发票代码',
						    xtype:'compositefield',combineErrors:false,
						    items: [
						        {xtype:'textfield',name:'invoiceDto.invoice_code',width:133,height:22},//,style:'width:135px;height:22px'
						        {xtype:'displayfield',value:'发票类型'},
						        {xtype:'paramlovcombo',name:'invoiceDto.invoice_type',paramName:'INVOICE_TYPE',
						        	displayField:'item_name',valueField:'item_value',
						        	store:new Ext.data.JsonStore({
						        		fields:['item_name','item_value'],data:[]
						        	}),height:22,width:133}//style:'width:135px;height:22px'
					    	]
						},
						{fieldLabel:'结账时间',
						    xtype:'compositefield',combineErrors:false,
						    items: [
						        {xtype:'datefield',name:'invoiceDto.start_check_time',style:'width:135px;height:22px',format:'Y-m-d'},
						        {xtype:'displayfield',value:'至'},
						        {xtype:'datefield',name:'invoiceDto.end_check_time',style:'width:135px;height:22px',format:'Y-m-d'}
					    	]
						},
						{fieldLabel:'开票时间',
							    xtype:'compositefield',combineErrors:false,
							    items: [
							        {xtype:'datefield',name:'invoiceDto.start_use_time',style:'width:135px;height:22px',format:'Y-m-d'},
							        {xtype:'displayfield',value:'至'},
							        {xtype:'datefield',name:'invoiceDto.end_use_time',style:'width:135px;height:22px',format:'Y-m-d'}
						    	]
						}
				]},
				
				{columnWidth:.5,layout:'form',border:false,width:150,items:[
						{fieldLabel:'结存状态',
						    xtype:'compositefield',combineErrors:false,
						    items: [
						        {xtype:'paramlovcombo',paramName:'FINANCE_STATUS_R_INVOICE',
						        	displayField:'item_name',valueField:'item_value',
						        	store:new Ext.data.JsonStore({
						        		fields:['item_name','item_value'],data:[]
						        	}),
						        		name:'invoiceDto.finance_status',height:22,width:133},
						        {xtype:'displayfield',value:'使用状态'},
						        {xtype:'paramlovcombo',paramName:'STATUS_R_INVOICE',
							        displayField:'item_name',valueField:'item_value',
							        	store:new Ext.data.JsonStore({
							        		fields:['item_name','item_value'],data:[]
							        	}),
						        	name:'invoiceDto.status',height:22,width:133}
					    	]
						}
				]},
				/*
				{columnWidth:.5,layout:'hbox',defaults:{border:false},border:false,items:[
				{layout:'form',flex:3.2,defaults:{border:false},
					items:{fieldLabel:'结存状态',hiddenName:'invoiceDto.finance_status',
								xtype:'paramlovcombo',paramName:'FINANCE_STATUS_R_INVOICE'}
								},
			    {layout:'form',flex:5,defaults:{border:false},
			    	items:{fieldLabel:'使用状态',hiddenName:'invoiceDto.status',
								xtype:'paramlovcombo',paramName:'STATUS_R_INVOICE'}
								}
				]},
				*/
				{columnWidth:.5,layout:'hbox',defaults:{border:false,flex:1},border:false,items:[
						{width:300,bodyStyle:'padding-left:25px',border:false,items:[
							{id:'queryInvoiceBtnId',xtype:'button',text:'查  询',iconCls:'icon-query',
								scope:this,handler:this.doQuery}
						]}
				]}
			]
		});	
	},
	doQuery:function(){
		if(this.getForm().isValid()){
			
			Ext.getCmp('queryInvoiceBtnId').disable();//禁用查询按钮，数据加载完再激活
			
			var store = this.parent.grid.getStore();
			store.removeAll();
			this.parent.grid.setTitle('发票信息');
			
			var values = this.getForm().getValues();
			values['invoiceDto.finance_status'] = this.getForm().findField('invoiceDto.finance_status').getValue();
			values['invoiceDto.invoice_type'] = this.getForm().findField('invoiceDto.invoice_type').getValue();
			values['invoiceDto.status'] = this.getForm().findField('invoiceDto.status').getValue();
			
			var obj = {};
			for(var v in values){
				if(v.indexOf("invoiceDto.")==0){
					obj[v] = values[v];	
				}
			}
			var optr = this.getForm().findField('invoiceDto.optrids');
			
			store.baseParams = obj;
			store.load({params: { start: 0, limit: 25 }});
		}
	}
});



QueryInvoiceGrid = Ext.extend(Ext.grid.GridPanel,{
	store:null,
	amount:0,
	rowCount:0,
	sm : null,
	detailWin:null,
	constructor:function(){
		this.store = new Ext.data.JsonStore({
			url:'resource/Invoice!queryMulitInvoice.action',
			root : 'records' ,
			totalProperty: 'totalProperty',
			fields:['invoice_id','invoice_code','invoice_type','status','status_text','amount',
				'invoice_mode','invoice_mode_text','finance_status','finance_status_text',
				'invoice_book_id','invoice_type_text','depot_id','depot_name',
				'county_id','county_id_text','create_time','use_time','check_time','close_time',
				'invoice_amount','optr_id','optr_name','is_loss','is_loss_text'
				]
		});
		this.store.on("load",function(store){
			Ext.getCmp('queryInvoiceBtnId').enable();
			var total = 0;
			store.each(function(record){
				if(record.get('status')=='USE')
					total = record.get('amount') + total;
			})
			this.setTitle("有效总金额 "+Ext.util.Format.formatFee(total));
		},this);
		var columns = new Ext.grid.ColumnModel({
			defaults:{sortable:false},
			
			columns:[
				{header:'发票号码',dataIndex:'invoice_id',width:70,align:'center',renderer:App.qtipValue},
				{header:'发票代码',dataIndex:'invoice_code',width:80,align:'center',renderer:App.qtipValue},
				{header:'发票类型',dataIndex:'invoice_type_text',width:65,align:'center',renderer:App.qtipValue},
				{header:'使用状态',dataIndex:'status_text',width:65,align:'center',renderer:App.qtipValue},
				{header:'结存状态',dataIndex:'finance_status_text',width:60,align:'center',renderer:App.qtipValue},
				{header:'金额',dataIndex:'amount',width:45,align:'center',renderer:Ext.util.Format.formatFee},
				{header:'所属营业员',dataIndex:'optr_name',width:90,align:'center'},
				{header:'仓 库',dataIndex:'depot_name',width:80,align:'center',renderer:App.qtipValue},
				{header:'入库时间',dataIndex:'create_time',width:120,align:'center',renderer:App.qtipValue},
				{header:'开票时间',dataIndex:'use_time',width:120,align:'center',renderer:App.qtipValue},
				{header:'结账时间',dataIndex:'check_time',width:120,align:'center',renderer:App.qtipValue},
				{header:'核销时间',dataIndex:'close_time',width:120,align:'center',renderer:App.qtipValue}
			]
		});
		
		var sm = new Ext.grid.CheckboxSelectionModel({});
		QueryInvoiceGrid.superclass.constructor.call(this,{
			title:'发票信息',
			autoScroll:true,
			border:false,
			ds:this.store,
			cm:columns,
			sm:sm,
			bbar: new Ext.PagingToolbar({store: this.store ,pageSize : 25}),
			listeners : {
				rowclick : function(grid){
					var detailWin = new DetailWin();
					detailWin.show();
					
					var record = grid.getSelectionModel().getSelected();
					var invoiceId = record.get('invoice_id');
					var invoiceBookId = record.get('invoice_book_id');
					var invoiceCode = record.get('invoice_code');
					detailWin.info.queryInvoiceDetail(invoiceId,invoiceCode);
				}
			}
		});
	}
});

DetailWin = Ext.extend(Ext.Window,{
	info:null,
	constructor : function(){
		this.info = new InvoiceAllInfo();
		DeptSelectWin.superclass.constructor.call(this,{
			title: '发票明细',
			layout: 'fit',
			width: 800,
			height: 500,
			closeAction:'close',
			autoDestroy:true,
			items: [this.info]
		})
	}
});

QueryInvoice = Ext.extend(Ext.Panel,{
	form:null,
	grid:null,
	constructor:function(){
		this.form = new QueryInvoiceForm(this);
		this.grid = new QueryInvoiceGrid();
		QueryInvoice.superclass.constructor.call(this,{
			id:'QueryInvoice',
			title:'发票查询',
			closable: true,
			border : false ,
			baseCls: "x-plain",
			layout:'anchor',
			items:[
				{anchor:'100% 32%',border:false,items:[this.form]},
				{anchor:'100% 68%',layout:'fit',border:false,items:[this.grid]}
			]
		});
	}
});