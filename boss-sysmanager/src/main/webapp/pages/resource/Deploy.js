/**
 * ajax公共保存方法
 * @param {} scopeThis scope(当前grid)
 * @param {} url 请求url
 * @param {} paramsKey 请求参数(暂时只支持一个参数,且传递一个json格式的对象)
 * @param {} paramsValue 请求参数的值
 * 该方法仅供当前js中调用！！
 */
var commonDoSave = function(scopeThis,url,paramsKey,paramsValue){
		var records = scopeThis.getStore().getModifiedRecords();
		if(records.length > 0){
			var paramsObj = {};
			//参数值不为空
			if(!Ext.isEmpty(paramsValue)){
				paramsObj[paramsKey] = Ext.encode(paramsValue);
			}else{
				var arr = [];
				Ext.each(records,function(record){
					arr.push(record.data);
				},this);
				
				paramsObj[paramsKey] = Ext.encode(arr);
			}
			Ext.Ajax.request({
				url:url,
				params:paramsObj,
				scope:scopeThis,
				success:function(res,opt){
					Alert('保存成功！',function(){
						scopeThis.getStore().reload();
					});
				}
			});
		}
};

/**
 * 给当前EditorGridPanel新增一行空白记录
 * @param {} scopeThis 当前grid
 * @param {} fieldsObj recordType 空值
 * @param {} editColumn 从那一列开始编辑(默认从第一列开始编辑)
 */
var commonDoAdd = function(scopeThis,fieldsObj,editColumn){
	editColumn = editColumn || 0;
		var store = scopeThis.getStore();
		var count = store.getCount();
		var recordType = store.recordType;
		var recordData = new recordType(fieldsObj);
		scopeThis.stopEditing();
		store.insert(0,recordData);
		scopeThis.startEditing(0,editColumn);
		scopeThis.getSelectionModel().selectRow(0);
};

/**
 * 检测用户输入device_model是否存在
 * @param {} scopeThis 当前grid
 * @return {Boolean}
 */
var CheckDeviceModel = function(scopeThis,field){
	scopeThis.stopEditing();//停止编辑
	var store = scopeThis.getStore();
	var count = store.getCount();//总个数
	
	var config = scopeThis.getColumnModel().config;
	
	var dataIndexes = [];
	for(var i=0;i<config.length;i++){
		dataIndexes.push(config[i].dataIndex);
	}
	
	var flag = true;
	for(var i=0;i<count;i++){
		var data = store.getAt(i).data;
		for(var k=0;k<dataIndexes.length;k++){
			var a = dataIndexes[k];
			if(Ext.isEmpty(data[a]) && a !== 'remark' /*&& a !=='buy_text' 
					&& a !=='buy_type_text'*/ && a !=='virtual_card_model_name'
					&& a !=='virtual_modem_model_name'
					&& a !== 'supplier_id'){
				Alert('请编辑完整!',function(){
					scopeThis.getSelectionModel().selectRow(i);
					scopeThis.startEditing(i,k);
				});
				flag = false;
				break;
			}
		}
		if(!flag)break;
		//只有stb,card,modem型号grid需要比较device_model是否唯一
		if(dataIndexes.indexOf(field) !=-1){
			for(var j=i+1;j<count;j++){
				var d = store.getAt(j).data;
				if(data[field] == d[field]){//新增行数据中型号不能已存在
					flag = false;
					Alert("第"+(i+1)+"行和第"+(j+1)+"行相同,请重新编辑！",function(){
						scopeThis.getSelectionModel().selectRow(i);
						scopeThis.startEditing(i,dataIndexes.indexOf(field));
					});
					break;
				}
			}
		}
		if(!flag)break;
	}
	return flag;
};

/**
 * stb，card，modem3个面板中列device_model是否能编辑
 * @param {} colIndex
 * @param {} rowIndex
 * @return {Boolean}
 */
var commonIsCellEditable = function(colIndex,rowIndex){
		var deviceModelIndex = this.getIndexById("device_model_id");
		if(deviceModelIndex === colIndex){
			//激活面板
			var record = Ext.getCmp('deviceTabId').getActiveTab().getStore().getAt(rowIndex);
			//只能修改刚添加未保存的
			if( record && record.get('device_model') && !record.isModified('device_model'))
				return false;
		}
		return Ext.grid.ColumnModel.prototype.isCellEditable.call(this, colIndex, rowIndex);
	}

//每次编辑时，重新获取数据，以获取用户最新添加数据
var commonBeforeedit = function(obj){
	var fieldName = obj.field;//编辑的column对应的dataIndex
	if(fieldName == 'supplier_name'){
		var pStore = Ext.getCmp('provideGridId').getStore();
		var store = this.supplierCombo.getStore();
		store.removeAll();
		store.add(pStore.getRange(0,pStore.getCount()-1));
	}else if(fieldName == 'virtual_card_model_name'){
		var cStore = Ext.getCmp('cardGridId').getStore();
		var records = [];
		cStore.each(function(record){
			records.push(record);
		});
		var store = this.virtualCardModelCombo.getStore();
		store.removeAll();
		store.add(records);
	}else if(fieldName == 'virtual_modem_model_name'){
		var cStore = Ext.getCmp('modemGridId').getStore();
		var records = [];
		cStore.each(function(record){
			if(record.get('is_virtual') == 'T'){
				records.push(record);
			}
		});
		var store = this.virtualModemModelCombo.getStore();
		store.removeAll();
		store.add(records);
	}
}

/**
 * ajax 删除当前选中记录
 * @param {} scopeThis 当前grid
 * @param {} url 请求url
 * @param {} paramsObj 请求参数
 */
var commonDoDel = function(scopeThis,url,paramsObj){
	Confirm('确定删除吗？',this,function(){
				Ext.Ajax.request({
					url:url,
					params:paramsObj,
					success:function(res,opt){
						Alert('删除成功!',function(){
							scopeThis.getStore().remove(scopeThis.getSelectionModel().getSelected());
						});
					},
					failure:function(res,opt){
						alert('failure');
					}
				});			
			});
}

var comomRefresh = function(){
	this.getStore().removeAll();
	this.getStore().load();
}

/**
 * 购买方式配置
 * @class
 * @extends Ext.grid.EditorGridPanel
 */
var BuyTypeGrid = Ext.extend(Ext.grid.EditorGridPanel,{
	buyTypeStore :null,
	constructor:function(){
		buyTypeGrid = this;
		this.buyTypeStore = new Ext.data.JsonStore({
			url:'resource/ResourceCfg!queryDeviceBuyMode.action',
			pruneModifiedRecords:true,//每次Store加载后，清除所有修改过的记录信息；record被移除时也会这样
			fields:['buy_mode','buy_mode_name','change_ownship','buy','buy_type',
				'buy_type_text','buy_text','buy_mode_text','change_ownship_text']
		});
		this.buyTypeStore.load();
		
		this.buyTypeCombo = new Ext.ux.ParamCombo({
			paramName:'DEVICE_BUY_TYPE',typeAhead:false,valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('buy_type',record.get('item_value'));
				}
			}});
		this.buyCombo = new Ext.ux.ParamCombo({
			paramName:'BOOLEAN',typeAhead:false,valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('buy',record.get('item_value'));
				}
			}});
//		this.feeCombo = new Ext.form.ComboBox({
//			store:new Ext.data.JsonStore({
//				url:root+'/resource/ResourceCfg!queryDeviceBusiFee.action',
//				fields:['fee_id','fee_name']
//			}),displayField:'fee_name',valueField:'fee_name',triggerAction:'all',mode:'local',
//			forceSelection:true,selectOnFocus:true,editable:true,
//			listeners:{
//				scope:this,
//				delay:100,
//				select:function(combo,record){
//					this.getSelectionModel().getSelected().set('fee_id',record.get('fee_id'))
//				}
//			}
//		});
		this.changeOwnshipCombo = new Ext.ux.ParamCombo({
			paramName:'BOOLEAN',typeAhead:false,valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('change_ownship',record.get('item_value'));
				}
			}});
		var cm = new Ext.grid.ColumnModel([
			{header:'购买类型',dataIndex:'buy_type_text',width:150,editor:this.buyTypeCombo,scope:this},
			{id:'buy_mode_id',header:'购买方式代码',dataIndex:'buy_mode',width:150,editor:new Ext.form.TextField({vtype:'alphanum'})},
			{header:'名称',dataIndex:'buy_mode_name',width:150,editor:new Ext.form.TextField({})},
			{header:'收费',dataIndex:'buy_text',width:80,editor:this.buyCombo},
//			{id:'fee_name_id',header:'费用',dataIndex:'fee_name',width:75,editor:this.feeCombo},
			{header:'转换产权',dataIndex:'change_ownship_text',width:90,editor:this.changeOwnshipCombo},
			{header:'操作',dataIndex:'buy_mode',width:80,renderer:function(value){
				return "<a href='#' onclick=buyTypeGrid.doDel('"+value+"')>删除</a>";
			}}
		]);
		
		cm.isCellEditable = this.cellEditable;
		
		BuyTypeGrid.superclass.constructor.call(this,{
			id:'buyTypeGridId',
			region:'center',
			title:'购买方式配置',
			ds:this.buyTypeStore,
			clicksToEdit:1,
			cm:cm,
			sm:new Ext.grid.RowSelectionModel({}),
			tbar:[
				'-',
				{text:'添加',iconCls:'icon-add',handler:this.doAdd,scope:this},'-',
				{text:'保存',iconCls:'icon-save',handler:this.doSave,scope:this},'-',
				{text:'刷新',iconCls:'icon-refresh',handler:comomRefresh,scope:this},'-'
			]
		});
	},
	cellEditable:function(colIndex,rowIndex){
		var buyModeIndex = this.getIndexById("buy_mode_id");
		var record = buyTypeGrid.getStore().getAt(rowIndex);
		if(buyModeIndex === colIndex){
			//只能修改刚添加未保存的
			if(!Ext.isEmpty(record.get('buy_mode')) && !record.isModified('buy_mode'))
				return false;
		}
		return Ext.grid.ColumnModel.prototype.isCellEditable.call(this, colIndex, rowIndex);
	},
	initComponent:function(){
		BuyTypeGrid.superclass.initComponent.call(this);
		App.form.initComboData([this.buyTypeCombo,this.buyCombo,this.changeOwnshipCombo]);
	},
	doAdd:function(){
		commonDoAdd(this,{
			buy_mode:'',buy_mode_name:'',change_ownship:'',change_ownship_text:'',buy:'',buy_type:'',
				buy_type_text:'',buy_text:'',buy_mode_text:''
		});
	},
	doSave:function(){
		if(CheckDeviceModel(this,'buy_mode')){
//			var records = this.getStore().getModifiedRecords();
//			records = records.reverse();
//			var flag = true;
//			for(var i=0;i<records.length;i++){
//				if(records[i].get('buy')==='T' && Ext.isEmpty(records[i].get('fee_id'))){
//					Alert('请选择费用项!',function(){
//						this.getSelectionModel().selectRow(i);
//						this.startEditing(i,4);
//					},this);
//					flag = false;
//					break;
//				}
//			}
//			if(flag)
				commonDoSave(this,'resource/ResourceCfg!saveDeviceBuyMode.action','deviceBuyModeList');
		}
	},
	doDel :function(value){
		commonDoDel(this,'resource/ResourceCfg!removeDeviceBuyMode.action',{buyMode:value});
	}
});
/**
 * 供应商配置
 * @class
 * @extends Ext.grid.EditorGridPanel
 */
var ProvideGrid = Ext.extend(Ext.grid.EditorGridPanel,{
	provideStore:null,
	constructor:function(){
		providerGrid = this;
		this.provideStore = new Ext.data.JsonStore({
			url:'resource/ResourceCfg!queryRDeviceSupplier.action',
			pruneModifiedRecords:true,
			fields:['supplier_id','supplier_name']
		});
		this.provideStore.load();
		var cm = new Ext.grid.ColumnModel([
			{header:'编号',dataIndex:'supplier_id',width:40,sortable:true},
			{header:'名称',dataIndex:'supplier_name',width:100,sortable:true,
				editor:new Ext.form.TextField({})},
			{header:'操作',dataIndex:'supplier_id',width:40,
				renderer:function(value,meta,record){return "<a href='#' onclick=providerGrid.doDel("+Ext.encode(record.data)+")>删除</a>";}}
		]);
		ProvideGrid.superclass.constructor.call(this,{
			id:'provideGridId',
			region:'east',
			width:'22%',
			split:true,
			title:'供应商配置',
			ds:this.provideStore,
			clicksToEdit:1,
			cm:cm,
			sm:new Ext.grid.RowSelectionModel({}),
			tbar:[
				'-',
				{text:'添加',iconCls:'icon-add',handler:this.doAdd,scope:this},'-',
				{text:'保存',iconCls:'icon-save',handler:this.doSave,scope:this},'-',
				{text:'刷新',iconCls:'icon-refresh',handler:comomRefresh,scope:this},'-'
			]
		});
	},
	doAdd:function(){
		commonDoAdd(this,{
			supplier_id:null,supplier_name:''
		},1);
	},
	doSave:function(){
		if(CheckDeviceModel(this,'supplier_name'))
			commonDoSave(this,'resource/ResourceCfg!saveRDeviceSupplier.action','deviceSupplierList');
	},
	doDel: function(recordData){
		var obj = {};
		obj["supplierId"] = recordData['supplier_id'];
		obj["supplierName"] = recordData['supplier_name'];
		commonDoDel(this,'resource/ResourceCfg!removeRDeviceSupplier.action',obj);
	}
});

StbCardMatchWin = Ext.extend(Ext.Window,{
	title:'机卡配对配置',
	width:600,height:480,
    IdleModelGrid: null,
    selectedModelGrid: null,
    idleModelStore: null,
    selectedModelStore: null,
    setProd: null,
    setUprod: null,
    constructor: function (p) {
    	this.parent = p;
        this.idleModelStore = new Ext.data.JsonStore({
        	url: root + '/resource/Device!queryIdelCardModel.action',
            fields: ['model_name','device_model']
        });
        this.idleModelStore.setDefaultSort("device_model", "ASC");
        this.setProd = new Ext.grid.CheckboxSelectionModel();
        this.setUprod = new Ext.grid.CheckboxSelectionModel();
        this.selectedModelStore = new Ext.data.JsonStore({
        	url: root + '/resource/Device!queryStbCardPaired.action',
            fields: ['model_name','device_model']
        });
        this.selectedModelStore.setDefaultSort("device_model", "ASC");
        
        this.IdleModelGrid = new Ext.grid.EditorGridPanel({
            title: '可选智能卡型号',
            border: false,
            autoScroll: true,
            ds: this.idleModelStore,
            sm: this.setProd,
            region: 'center',
            columns: [this.setProd,
            	{header: '型号',width:80,dataIndex: 'device_model'},
            		{header: '型号名',width:120,dataIndex: 'model_name'}],
			tbar:['过滤:',{xtype:'textfield',enableKeyEvents:true,
							listeners:{
								scope:this,
								keyup:function(txt,e){
									if(e.getKey() == Ext.EventObject.ENTER){
										var value = txt.getValue();
											this.idleModelStore.filterBy(function(record){
												if(Ext.isEmpty(value))
													return true;
												else
													return record.get('device_model').indexOf(value)>=0;
											},this);
									}
								}
							}
						}]
        });

        this.selectedModelGrid = new Ext.grid.EditorGridPanel({
            title: '已选智能卡型号',
            region: 'center',
            ds: this.selectedModelStore,
            sm: this.setUprod,
            height: 180,
            autoScroll: true,
            border: true,
            clicksToEdit: 1,
            columns: [this.setProd,
            	{header: '型号',width:80,dataIndex: 'device_model'},
            		{header: '型号名',width:120,dataIndex: 'model_name'}],
			tbar:['过滤:',{xtype:'textfield',enableKeyEvents:true,id:'selectSystemId',
						listeners:{
							scope:this,
								keyup:function(txt,e){
										if(e.getKey() == Ext.EventObject.ENTER){
											var value = txt.getValue();
												this.selectedModelStore.filterBy(function(record){
													if(Ext.isEmpty(value))
														return true;
													else
														return record.get('device_model').indexOf(value)>=0;
												},this);
											}
										}
									}
							}]
        });
        StbCardMatchWin.superclass.constructor.call(this, {
            id: 'StbCardMatchWin',
            region: 'center',
            layout: 'border',
            border: false,
            fbar:[
            	{
                text: '保存',
                scope: this,
                iconCls: 'icon-save',
                handler: this.doSave
            },
            {
                text: '关闭',
                scope: this,
                handler: function () {
                    this.hide();
                }
            }
            ],
            listeners:{
            	scope:this,
            	show:function(){
            		var record = this.parent.selModel.getSelected();
            		var queryParam = {mode:record.data.device_model};
			        this.idleModelStore.load({params:queryParam});
			        this.selectedModelStore.load({params:queryParam});
            	}
            },
            items: [this.IdleModelGrid,
            {
                region: 'east',
                border: false,
                layout: 'border',
                width: '57%',
                items: [this.selectedModelGrid,
                {
                    border: false,
                    bodyStyle: 'background-color: #DFE8F6;',
                    region: 'west',
                    width: 60,
                    layout: {
                        type: 'vbox',
                        pack: 'center',
                        align: 'center'
                    },
                    items: [{
                        xtype: 'button',
                        iconCls: 'move-to-right',
                        width: 40,
                        scale: 'large',
                        tooltip: '将左边已勾选的智能卡卡型号分配给当前型号机顶盒!',
                        iconAlign: 'center',
                        scope: this,
                        handler: function () {
                            this.doProdIn(this.setProd.getSelections());
                        }
                    },
                    {
                        height: 30,
                        baseCls: 'x-plain'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'move-to-left',
                        tooltip: '将右边勾选中的型号取消!',
                        width: 40,
                        scale: 'large',
                        iconAlign: 'center',
                        scope: this,
                        handler: function () {
                            this.doProdOut(this.setUprod.getSelections());
                        }
                    }]
                }]
            }]
        });
    },
    doProdIn: function (arr) {
        if (arr.length == 0) {
            Alert("请在左边的列表中选择型号!");
            return;
        }
        for (var i = 0; i < arr.length; i++) {
            var panl = this.selectedModelStore.recordType;
            var u = new panl({
                model_name: arr[i].data.model_name,
                device_model: arr[i].data.device_model
            });
            this.selectedModelGrid.stopEditing();
            this.selectedModelStore.insert(this.selectedModelStore.getCount(), u);
            this.selectedModelGrid.startEditing(this.selectedModelStore.getCount(), 0);
            this.idleModelStore.remove(arr[i]);
        }

    },
    doProdOut: function (arr) {
        if (arr.length == 0) {
            Alert("请在右边的列表中选择型号!");
            return;
        }
        for (var i = 0; i < arr.length; i++) {
            var panl = this.idleModelStore.recordType;
            var u = new panl({
               model_name: arr[i].data.model_name,
                device_model: arr[i].data.device_model
            });
            this.IdleModelGrid.stopEditing();
            this.idleModelStore.insert(this.idleModelStore.getCount(), u);
            this.IdleModelGrid.startEditing(this.idleModelStore.getCount(), 0);
            this.selectedModelStore.remove(arr[i]);
        }
        this.selectedModelStore.filterBy(function(record){
				return true;
        });
        
    },
    doSave:function(){
    	var values  = {mode:this.parent.selModel.getSelected().data.device_model};
    	var card_models = [];
        var store = this.selectedModelStore;
        for (var i = 0; i < store.getCount(); i++) {
            card_models.push(store.getAt(i).data.device_model.trim());
        }
        if (card_models.length > 0) {
            values["card_models"] = card_models;
        }
    	
    	Ext.Ajax.request({
    		scope:this,
    		url: root + '/resource/Device!saveStbCardPairCfg.action',
    		params:values,
    		success:function(req){
    			var simple = req.responseText;
    			if(simple == 'true'){
    				Alert('保存成功',function(){
    					this.hide();
    				},this);
    			}else{
    				Alert('保存失败',function(){
    					this.hide();
    				},this);
    			}
    		},
    		failure:function(){
    			Alert('保存失败',function(){
    				this.hide();
    			},this);
    		}
    	});
    }
});

/**
 * 机顶盒型号配置
 * @class
 * @extends Ext.grid.EditorGridPanel
 */
var StbGrid = Ext.extend(Ext.grid.EditorGridPanel,{
	stbStore:null,
	supplierCombo:null,
	virtualCardModelCombo:null,
	virtualModemModelCombo:null,
	matchWin :null,//配对窗口
	matchCard:function(){//机顶盒与智能卡的配对
		if(!this.matchWin){
			this.matchWin=new StbCardMatchWin(this);
		}
		this.matchWin.show();
	},
	constructor:function(){
		stbGrid = this;
		this.stbStore = new Ext.data.JsonStore({
			url:'resource/ResourceCfg!queryRStbModel.action',
			pruneModifiedRecords:true,
			fields:['interactive_type','definition_type','virtual_card_model','virtual_modem_model','interactive_type_text',
				'definition_type_text','virtual_card_model_name','virtual_modem_model_name','supplier_name','supplier_id',
				'device_model','model_name','interactive_type_text','definition_type_text']
		});
		this.stbStore.load();
		
		this.supplierCombo = new Ext.form.ComboBox({
			store:new Ext.data.JsonStore({
//				url:'resource/Device!queryDeviceSupplier.action',
				fields:['supplier_id','supplier_name']
			}),displayField:'supplier_name',valueField:'supplier_name',
				mode:'local',triggerAction:'all',editable:true,
				forceSelection:true,selectOnFocus:true,listWidth:150,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('supplier_id',record.get('supplier_id'));
				}
			}
		});
		this.interactiveTypeCombo = new Ext.ux.ParamCombo({
			paramName:'DTV_SERV_TYPE',valueField:'item_name',editable:true,
			forceSelection:true,selectOnFocus:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('interactive_type',record.get('item_value'));
				}
			}
		});
		this.definitionTypeCombo = new Ext.ux.ParamCombo({
			paramName:'STB_DEFINITION',valueField:'item_name',editable:true,
			forceSelection:true,selectOnFocus:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('definition_type',record.get('item_value'));
				}
			}
		});
		this.virtualCardModelCombo = new Ext.form.ComboBox({
			store:new Ext.data.JsonStore({
				fields:['model_name','device_model']
			}),displayField:'model_name',valueField:'model_name',
				mode:'local',triggerAction:'all',editable:true,
				forceSelection:true,selectOnFocus:true,listWidth:150,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('virtual_card_model',record.get('device_model'));
				},
				blur:function(combo){
					if(Ext.isEmpty(combo.getRawValue())){
						this.getSelectionModel().getSelected().set('virtual_card_model',"");
					}
				}
			}
		});
		this.virtualModemModelCombo = new Ext.form.ComboBox({
			store:new Ext.data.JsonStore({
				fields:['model_name','device_model']
			}),displayField:'model_name',valueField:'model_name',
				mode:'local',triggerAction:'all',editable:true,
				forceSelection:true,selectOnFocus:true,listWidth:150,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('virtual_modem_model',record.get('device_model'));
				},
				blur:function(combo){
					if(Ext.isEmpty(combo.getRawValue())){
						this.getSelectionModel().getSelected().set('virtual_modem_model',"");
					}
				}
			}
		});
		var cm = new Ext.grid.ColumnModel([
			{id:'device_model_id',header:'型号',dataIndex:'device_model',width:110,editor:new Ext.form.TextField({vtype:'singleChar'})},
			{header:'型号名称',dataIndex:'model_name',width:120,editor:new Ext.form.TextField({})},
			{header:'制造商',dataIndex:'supplier_name',width:75,editor:this.supplierCombo},
			{header:'交互方式',dataIndex:'interactive_type_text',width:60,editor:this.interactiveTypeCombo},
			{header:'清晰',dataIndex:'definition_type_text',width:50,editor:this.definitionTypeCombo},
			{header:'配对卡类型',dataIndex:'virtual_card_model_name',width:80,editor:this.virtualCardModelCombo},
			{header:'虚拟MODEM类型',dataIndex:'virtual_modem_model_name',width:95,editor:this.virtualModemModelCombo},
			{header:'操作',dataIndex:'device_model',width:80,renderer:function(value){
				return "<a href='#' onclick=stbGrid.matchCard('"+value+"')>机卡配对配置</a>";
			}}
		]);
		cm.isCellEditable = commonIsCellEditable;
		StbGrid.superclass.constructor.call(this,{
			id:'stbGridId',
			title:'机顶盒型号',
			ds:this.stbStore,
			clicksToEdit:1,
			cm:cm,
			sm:new Ext.grid.RowSelectionModel({}),
			tbar:[
				'-',
				{text:'添加',iconCls:'icon-add',handler:this.doAdd,scope:this},'-',
				{text:'保存',iconCls:'icon-save',handler:this.doSave,scope:this},'-',
				{text:'刷新',iconCls:'icon-refresh',handler:comomRefresh,scope:this},'-'
			]
		});
	},
	initEvents:function(){
		StbGrid.superclass.initEvents.call(this);
		this.on("beforeedit",commonBeforeedit,this);
	},
	initComponent:function(){
		StbGrid.superclass.initComponent.call(this);
//		this.supplierCombo.getStore().load();
//		this.virtualCardModelCombo.getStore().load();
		App.form.initComboData([this.interactiveTypeCombo,this.definitionTypeCombo]);
	},
	doAdd:function(){
		commonDoAdd(this,{
			interactive_type:'',definition_type:'',
			virtual_card_model:'',interactive_type_text:'',definition_type_text:'',
			virtual_card_model_name:'',virtual_modem_model_name:'',supplier_name:'',supplier_id:'',
				device_model:'',model_name:'',interactive_type_text:'',definition_type_text:''
		});
	},
	doSave:function(){
		if(CheckDeviceModel(this,'device_model'))
			commonDoSave(this,'resource/ResourceCfg!saveRStbModel.action','stbModelList');
	}
});

/**
 * 猫型号配置
 * @class
 * @extends Ext.grid.EditorGridPanel
 */
var ModemGrid = Ext.extend(Ext.grid.EditorGridPanel,{
	modemStore:null,
	supplierCombo:null,
	constructor:function(){
		modemGrid = this;
		this.modemStore = new Ext.data.JsonStore({
			url:'resource/ResourceCfg!queryRModemModel.action',
			pruneModifiedRecords:true,
			fields:['device_model','device_type','model_name','supplier_id','remark',
				'supplier_name','device_type_text','net_type','net_type_name','modem_type','modem_type_name',
				'is_virtual','is_virtual_text']
		});
		this.modemStore.load();
		
		this.supplierCombo = new Ext.form.ComboBox({
			store:new Ext.data.JsonStore({
//				url:'resource/Device!queryDeviceSupplier.action',
				fields:['supplier_id','supplier_name']
			}),displayField:'supplier_name',valueField:'supplier_name',mode:'local',triggerAction:'all',
			forceSelection:true,selectOnFocus:true,editable:true,listWidth:150,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('supplier_id',record.get('supplier_id'));
				}
			}
		});
		this.netTypeCombo = new Ext.ux.ParamCombo({paramName:'USER_NET_TYPE',valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('net_type',record.get('item_value'));
				}
			}
		});
		
		this.modemTypeCombo = new Ext.ux.ParamCombo({paramName:'MODEM_TYPE',valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('modem_type',record.get('item_value'));
				}
			}
		});
		this.isVirtualCombo = new Ext.ux.ParamCombo({paramName:'BOOLEAN',valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('is_virtual',record.get('item_value'));
				}
			}
		});
		var cm = new Ext.grid.ColumnModel([
			{header:'MODEM类型',dataIndex:'modem_type_name',width:80,editor:this.modemTypeCombo},
			{id:'device_model_id',header:'型号',dataIndex:'device_model',width:120,editor:new Ext.form.TextField({vtype:'singleChar'})},
			{header:'型号名称',dataIndex:'model_name',width:120,editor:new Ext.form.TextField({})},
			{header:'接入类型',dataIndex:'net_type_name',width:70,editor:this.netTypeCombo},
			{header:'制造商',dataIndex:'supplier_name',width:70,editor:this.supplierCombo},
			{header:'是否虚拟',dataIndex:'is_virtual_text',width:70,editor:this.isVirtualCombo},
			{header:'备注',dataIndex:'remark',width:120,editor:new Ext.form.TextField({})}
		]);
		cm.isCellEditable = commonIsCellEditable;
		ModemGrid.superclass.constructor.call(this,{
			id:'modemGridId',
			title:'MODEM型号',
			ds:this.modemStore,
			clicksToEdit:1,
			cm:cm,
			sm:new Ext.grid.RowSelectionModel({}),
			tbar:[
				'-',
				{text:'添加',iconCls:'icon-add',handler:this.doAdd,scope:this},'-',
				{text:'保存',iconCls:'icon-save',handler:this.doSave,scope:this},'-',
				{text:'刷新',iconCls:'icon-refresh',handler:comomRefresh,scope:this},'-'
			]
		});
	},
	initComponent:function(){
		ModemGrid.superclass.initComponent.call(this);
//		this.supplierCombo.getStore().load();
		App.form.initComboData([this.netTypeCombo,this.modemTypeCombo,this.isVirtualCombo]);
	},
	initEvents:function(){
		ModemGrid.superclass.initEvents.call(this);
		this.on("beforeedit",commonBeforeedit,this);
	},
	doAdd:function(){
		commonDoAdd(this,{
			device_model:'',device_type:'',model_name:'',supplier_id:'',remark:'',
				supplier_name:'',device_type_text:'',net_type:'',net_type_name:'',
				is_virtual:'F',is_virtual_text:'否'
		});
	},
	doSave:function(){
		if(CheckDeviceModel(this,'device_model'))
			commonDoSave(this,'resource/ResourceCfg!saveRModemModel.action','modemModelList');
	}
});

/**
 * 卡型号配置
 * @class
 * @extends Ext.grid.EditorGridPanel
 */
var CardGrid = Ext.extend(Ext.grid.EditorGridPanel,{
	cardStore:null,
	supplierCombo:null,
	constructor:function(){
		cardGrid = this;
		this.cardStore = new Ext.data.JsonStore({
			url:'resource/ResourceCfg!queryRCardModel.action',
			pruneModifiedRecords:true,
			fields:['device_model','model_name','supplier_id','supplier_name','device_type',
				'device_type_text','ca_supplier_name','ca_type','remark','is_virtual','is_virtual_text']
		});
		this.cardStore.load();
		this.supplierCombo = new Ext.form.ComboBox({
			store:new Ext.data.JsonStore({
//				url:'resource/Device!queryDeviceSupplier.action',
				fields:['supplier_id','supplier_name']
			}),displayField:'supplier_name',valueField:'supplier_name',mode:'local',triggerAction:'all',
			forceSelection:true,selectOnFocus:true,editable:true,listWidth:150,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('supplier_id',record.get('supplier_id'));
				}
			}
		});
		this.caSupplierCombo = new Ext.ux.ParamCombo({paramName:'CA_SUPPLIER',valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('ca_type',record.get('item_value'));
				}
			}
		});
		this.isVirtualCombo = new Ext.ux.ParamCombo({paramName:'BOOLEAN',valueField:'item_name',
			forceSelection:true,selectOnFocus:true,editable:true,
			listeners:{
				scope:this,
				select:function(combo,record){
					this.getSelectionModel().getSelected().set('is_virtual',record.get('item_value'));
				}
			}
		});
		var cm = new Ext.grid.ColumnModel([
			{id:'device_model_id',header:'型号',dataIndex:'device_model',width:120,editor:new Ext.form.TextField({vtype:'singleChar'})},
			{header:'型号名称',dataIndex:'model_name',width:120,editor:new Ext.form.TextField({})},
			{header:'CA类型',dataIndex:'ca_supplier_name',width:70,editor:this.caSupplierCombo},
			{header:'制造商',dataIndex:'supplier_name',width:70,editor:this.supplierCombo},
			{header:'是否虚拟',dataIndex:'is_virtual_text',width:70,editor:this.isVirtualCombo},
			{header:'备注',dataIndex:'remark',width:120,editor:new Ext.form.TextField({})}
		]);
		cm.isCellEditable = commonIsCellEditable;
		CardGrid.superclass.constructor.call(this,{
			id:'cardGridId',
			title:'智能卡型号',
			ds:this.cardStore,
			clicksToEdit:1,
			cm:cm,
			sm:new Ext.grid.RowSelectionModel({}),
			tbar:[
				'-',
				{text:'添加',iconCls:'icon-add',handler:this.doAdd,scope:this},'-',
				{text:'保存',iconCls:'icon-save',handler:this.doSave,scope:this},'-',
				{text:'刷新',iconCls:'icon-refresh',handler:comomRefresh,scope:this},'-'
			]
		});
	},
	initComponent:function(){
		CardGrid.superclass.initComponent.call(this);
//		this.supplierCombo.getStore().load();
		App.form.initComboData([this.caSupplierCombo,this.isVirtualCombo]);
	},
	initEvents:function(){
		CardGrid.superclass.initEvents.call(this);
		this.on("beforeedit",commonBeforeedit,this);
	},
	doAdd:function(){
		commonDoAdd(this,{
			device_model:'',device_type:'',model_name:'',supplier_id:'',remark:'',
				supplier_name:'',device_type_text:'',ca_supplier_name:'',ca_type:'',
				is_virtual:'F',is_virtual_text:'否'
		});
	},
	doSave:function(){
		if(CheckDeviceModel(this,'device_model'))
			commonDoSave(this,'resource/ResourceCfg!saveRCardModel.action','cardModelList');
	}
});



ModelToCountyTree = Ext.extend(Ext.ux.FilterTreePanel, {
    constructor: function (v) {
    	goToOptrTreeThis = this;
        var loader = new Ext.tree.TreeLoader({
        	url: root + "/resource/ResourceCfg!getModelCountyTree.action",
        	baseParams: {
       			county_id : v
        	}
        });
        ModelToCountyTree.superclass.constructor.call(this, {
            split: true,
            id: 'ModelToCountyTreeId',
            margins: '0 0 3 2',
            lines: false,
            autoScroll: true,
            animCollapse: true,
            animate: false,
            rootVisible : false,
            collapseMode: 'mini',
            bodyStyle: 'padding:3px',
            loader: loader,
            root: new Ext.tree.AsyncTreeNode()
        });
    },
    listeners: {
        'checkchange': function (node, checked) {
            node.expand();
            node.attributes.checked = checked;
            node.eachChild(function (child) {
                child.ui.toggleCheck(checked);
                child.attributes.checked = checked;
                child.fireEvent('checkchange', child, checked);
            });
        }
    },
	initComponent : function() {
		ModelToCountyTree.superclass.initComponent.call(this);
		this.getRootNode().expand();
		this.getRootNode().on('expand', function() {
					goToOptrTreeThis.openNext();
				});
	},
	openNext:function(){
    	var childarr = goToOptrTreeThis.getRootNode().childNodes;
		 if (childarr.length > 0) {
			for (var i = 0; i < childarr.length; i++) {
				if (childarr[i].loaded == false) {
                    childarr[i].expand();
                    childarr[i].collapse();
                }
			}
		}
	}
});

ModelToCountyWindow = Ext.extend(Ext.Window, {
			goToOptrTree : null,
			countyId:null,
			constructor : function(v) {
				modelToCountyWinThis = this;
				this.countyId = v.get('county_id');
				this.goToOptrTree = new ModelToCountyTree(this.countyId);
				ModelToCountyWindow.superclass.constructor.call(this, {
							layout : 'fit',
							width : 400,
							height : 500,
							closeAction : 'hide',
							items : this.goToOptrTree,
							buttons : [{
								text : '保存',
								scope : this,
								handler :this.saveOptr
							},{
								text : '关闭',
								scope:this,
								handler:function(){
									this.hide();
								}
							}]
						});
			},saveOptr:function(){
				var countyItemId = [],all={};
		        if (Ext.getCmp('ModelToCountyTreeId')) {
		            var nodes = Ext.getCmp('ModelToCountyTreeId').getChecked();
		            for (var i in nodes) {
		                if (nodes[i].leaf) {
		                	var obj={};
		                	obj["device_type"] = nodes[i].attributes.pid;
		                	obj["device_model"] = nodes[i].id.split("_")[1];
		                	obj["county_id"] = this.countyId;
		                	countyItemId.push(obj);
		                }
		            }
		        }
		        if (countyItemId.length > 0) {
		            all["modelCountyList"] = Ext.encode(countyItemId);
		        }
		        all["county_id"]=this.countyId;
				Ext.Ajax.request({
					url: root + "/resource/ResourceCfg!saveModelCounty.action",
					params : all,
					success : function(res, ops) {
						var rs = Ext.decode(res.responseText);
						if (true === rs.success) {
							 Alert("操作成功!", function () {
	                            Ext.getCmp('countyCfgGridId').getStore().load({
	                                params: {
	                                    start: 0,
	                                    limit: Constant.DEFAULT_PAGE_SIZE
	                                }
	                            });
	                            modelToCountyWinThis.close();
	                        });
						} else {Alert('操作失败!');}
					}
				});
			}
		});

var CountyModelGrid = Ext.extend(Ext.grid.GridPanel,{
	countyStore:null,
	constructor:function(){
		countyModelGrid = this;
		this.countyStore = new Ext.data.JsonStore({
			url:'resource/ResourceCfg!queryCountyModel.action',
			fields:['county_id','county_name','stb_model_src','card_model_src','modem_model_src']
		});
		this.countyStore.load();

		var cm = new Ext.grid.ColumnModel([
			{header:'适用地区',dataIndex:'county_name',width:120},
			{header:'机顶盒型号',dataIndex:'stb_model_src',width:350, renderer: App.qtipValue},
			{header:'智能卡型号',dataIndex:'card_model_src',width:120, renderer: App.qtipValue},
			{header:'MODEM型号',dataIndex:'modem_model_src',width:100, renderer: App.qtipValue},
			{header: '操作',width:100,scope:this,
	            renderer:function(value,meta,record,rowIndex,columnIndex,store){
	            	var btns = this.doFilterBtns(record);
	            	return btns;
				}
			}
		]);
		CountyModelGrid.superclass.constructor.call(this,{
			id:'countyCfgGridId',
			title:'适用地区配置',
			ds:this.countyStore,
			cm:cm,
			sm:new Ext.grid.RowSelectionModel({})
		});
	},
	doFilterBtns : function(record){
		var btns = "";
			btns = btns + "<a href='#' onclick='countyModelGrid.modelToCounty();' style='color:blue'>分配型号</a>";
		return btns;
	},
	modelToCounty:function(v){
    	var record  = Ext.getCmp('countyCfgGridId').getSelectionModel().getSelected();
        var win = new ModelToCountyWindow(record);
    	win.setTitle('分配型号->'+record.get('county_name'));
 		win.setIconClass('icon-add-user');   	
 		win.show();
    }
});


/**
 * 设备型号tabpanel
 * @class
 * @extends Ext.TabPanel
 */
var DeviceTab = Ext.extend(Ext.TabPanel,{
	stbGrid:null,
	cardGrid:null,
	modemGrid:null,
	countyCfgGrid:null,
	constructor:function(){
		this.stbGrid = new StbGrid();
		this.cardGrid = new CardGrid();
		this.modemGrid = new ModemGrid();
		this.countyCfgGrid = new CountyModelGrid();
		DeviceTab.superclass.constructor.call(this,{
			id:'deviceTabId',
			region:'center',
			deferredRender:false,
			enableTabScroll:true,
			activeTab:0,
			items:[this.stbGrid,this.cardGrid,this.modemGrid,this.countyCfgGrid]
		});
	}
});

Deploy = Ext.extend(Ext.Panel,{
	constructor:function(){
		var buyTypeGrid = new BuyTypeGrid();
		var provideGrid = new ProvideGrid();
		var deviceTab = new DeviceTab();
		Deploy.superclass.constructor.call(this,{
			id:'Deploy',
			title:'配置',
			closable: true,
			border: false ,
			baseCls: "x-plain",
			layout:'anchor',
			items:[
				{anchor:'100% 50%',layout:'border',border:false,items:[
					deviceTab,provideGrid
				]},
				{anchor:'100% 50%',layout:'fit',border:false,items:[buyTypeGrid]}
			]
		});
	}
});