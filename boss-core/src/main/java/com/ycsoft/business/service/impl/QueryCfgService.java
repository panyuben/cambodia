
package com.ycsoft.business.service.impl;

import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.ycsoft.beans.config.TAddress;
import com.ycsoft.beans.config.TNetType;
import com.ycsoft.beans.config.TPayType;
import com.ycsoft.beans.config.TUpdateCfg;
import com.ycsoft.beans.core.job.JOdscntRecord;
import com.ycsoft.beans.core.voucher.CVoucher;
import com.ycsoft.beans.system.SDept;
import com.ycsoft.beans.system.SDeptAddr;
import com.ycsoft.beans.system.SDeptBusicode;
import com.ycsoft.beans.system.SItemvalue;
import com.ycsoft.beans.system.SOptr;
import com.ycsoft.beans.system.SSubSystem;
import com.ycsoft.business.commons.abstracts.BaseService;
import com.ycsoft.business.component.config.BusiConfigComponent;
import com.ycsoft.business.component.config.ExtTableComponent;
import com.ycsoft.business.component.config.MemoryComponent;
import com.ycsoft.business.component.core.FeeComponent;
import com.ycsoft.business.component.resource.SimpleComponent;
import com.ycsoft.business.component.system.IndexComponent;
import com.ycsoft.business.component.task.TaskComponent;
import com.ycsoft.business.dto.config.BusiDocDto;
import com.ycsoft.business.dto.config.ExtendAttributeDto;
import com.ycsoft.business.dto.config.ExtendTableAttributeDto;
import com.ycsoft.business.dto.config.TAddressDto;
import com.ycsoft.business.dto.config.TaskWorkDto;
import com.ycsoft.business.dto.core.fee.BusiFeeDto;
import com.ycsoft.business.service.IQueryCfgService;
import com.ycsoft.commons.constants.DictKey;
import com.ycsoft.commons.constants.SystemConstants;
import com.ycsoft.commons.helper.CollectionHelper;
import com.ycsoft.commons.store.MemoryDict;
import com.ycsoft.commons.store.TemplateConfig;
import com.ycsoft.daos.core.JDBCException;
import com.ycsoft.sysmanager.dto.system.SDeptDto;

/**
 * @author YC-SOFT
 *
 */
@Service
public class QueryCfgService extends BaseService implements IQueryCfgService{

	private BusiConfigComponent busiConfigComponent;
	private FeeComponent feeComponent;
	private TaskComponent taskComponent;
	private ExtTableComponent extTableComponent;
	private SimpleComponent simpleComponent;
	private IndexComponent indexComponent;
	private MemoryComponent memoryComponent;

	public Map<String, String> queryProdFreeDay() throws Exception{
		String dtvCfg = busiConfigComponent.queryTemplateConfig(TemplateConfig.Template.BASE_PROD_FREE_DAY.toString());
		Map<String, String> map = new HashMap<String, String>();
		//如果需要,以后会加入宽带
		map.put(SystemConstants.USER_TYPE_DTV.toString(), dtvCfg);
		return map;
	}
	
	/**
	 * 查询所有子系统定义
	 * @return
	 * @throws Exception
	 */
	public List<SSubSystem> queryAllSubSystem(SOptr optr) throws Exception {
		return busiConfigComponent.queryAllSubSystem(optr);
	}

	public List<SDeptBusicode> queryDeptBusiCode(String dept_id) throws Exception{
		return indexComponent.queryDeptBusiCode(dept_id);
	}
	
	public List<SDeptAddr> queryDeptAddress(String dept_id) throws Exception{
		return indexComponent.queryDeptAddress(dept_id);
	}
	
	public TAddress querySingleAddress(String addrId) throws Exception{
		return simpleComponent.querySingleAddress(addrId);
	}
	
	/* (non-Javadoc)
	 * @see com.ycsoft.business.service.IQueryCfgService#getDictName(java.lang.String, java.lang.String)
	 */
	public String getDictName(String keyname, String value) {

		return MemoryDict.getDictName(keyname,value);
	}

	/* (n on-Javadoc)
	 * @see com.ycsoft.business.service.IQueryCfgService#getDicts(java.lang.String)
	 */
	public List<SItemvalue> getDicts(String keyname) {
		return MemoryDict.getDicts(keyname);
	}

	/**
	 * 查询配置信息,包括杂费、业务单据、施工单、业务扩展属性
	 * @return 按照业务代码的key、value对应上面四个业务代码匹配的配置数据
	 * @throws Exception
	 */
	public Map<String,Map<String,List>> queryBusiCfgData()throws Exception{
		List<BusiFeeDto> fees = feeComponent.getBusiFeeItems();
		List<BusiDocDto> busiDocs = busiConfigComponent.queryDoc();
		List<ExtendAttributeDto> attrs = extTableComponent.findBusiExtAttr();
		
		//新工单
		List<TaskWorkDto> taskTypes = taskComponent.queryTaskType();
		//开始组装
		Map<String, List<BusiFeeDto>> feeMap = CollectionHelper.converToMap(fees, "busi_code");
		Map<String, List<BusiDocDto>> busiDocsMap = CollectionHelper.converToMap(busiDocs, "busi_code");
		//新工单
		Map<String, List<TaskWorkDto>> taskTypesMap = CollectionHelper.converToMap(taskTypes, "busi_code");
		Map<String, List<ExtendAttributeDto>> attrsMap = CollectionHelper.converToMap(attrs, "busi_code");

		Map<String,Map<String,List>> result = new HashMap<String,Map<String,List>>();
		pushBusiCfgDataMap(result,feeMap, "busifee");
		pushBusiCfgDataMap(result,busiDocsMap, "busidoc");
		pushBusiCfgDataMap(result,taskTypesMap, "tasktype");
		pushBusiCfgDataMap(result,attrsMap, "busiextform");

		return result;
	}
	public Map<String, Object> queryCfgData() throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		// 网络类型
		Map<String, List<TNetType>> netTypeMap = (Map<String, List<TNetType>>) CollectionHelper
				.converToMap(busiConfigComponent.queryNetType(), "user_type");
		result.put("NET_TYPE", netTypeMap);
 
		// 接入方式
		result.put("CHECK_TYPE", busiConfigComponent.queryBandCheckType());

		//终端数量限制
		result.put("TERMINAL_AMOUNT", busiConfigComponent.queryTerminalAmount());
		
		//配置类型模板数据
		result.putAll(busiConfigComponent.queryTemplateConfig().getConfigMap());
		
		return result;
	}

	@SuppressWarnings("unchecked")
	private void pushBusiCfgDataMap(Map result,
								Map source, String resultKey){
		String key = null;
		for(Iterator<String> ite = source.keySet().iterator(); ite.hasNext();){
			key = ite.next();
			if(!result.containsKey(key))
				result.put(key, new HashMap<String,List>());
			Map m = (Map)result.get(key);
			m.put(resultKey, source.get(key));
		}
	}
	
	/**
	 * 查找可以选择的付款方式
	 */
	public List<TPayType> queryPayType() throws Exception{
		return busiConfigComponent.queryPayType();
	}
	
	public List<SItemvalue> queryItemValues(String dataType,String itemKey) throws Exception {
		return busiConfigComponent.queryItemValues(dataType,itemKey);
	}
	
	/**
	 * 查询部门树(分权限)
	 * @return
	 * @throws Exception
	 */
	public List<SDeptDto> queryDeptTree() throws Exception{
		return busiConfigComponent.queryDeptTree();
	}
	
	/**
	 * 查询部门树(不分权限)
	 * @return
	 * @throws Exception
	 */
	public List<SDeptDto> queryOtherDeptTree() throws Exception{
		return busiConfigComponent.queryOtherDeptTree();
	}
	
	
	public void reloadMemoryData() throws Exception {
		memoryComponent.addDictSignal("");
		memoryComponent.addTemplateSignal("");
	}
	
	public void reloadPrintData() throws Exception {
		memoryComponent.addPrintSignal("");
	}

	public SSubSystem querySubSystem(String sysId) throws JDBCException {
		return busiConfigComponent.querySubSystem(sysId);
	}


	public List<SDept> queryDepts() throws Exception {
		return busiConfigComponent.queryDepts();
	}

	public List<TAddressDto> queryAddrByName(String name) throws Exception {
		return simpleComponent.queryAddrByName(name);
	}
	
	public List<TAddressDto> queryAddrDistrict() throws Exception{
		return simpleComponent.queryAddrDistrict();
	}
	
	public List<TAddressDto> queryAddrCommunity(String addrPid) throws Exception{
		return simpleComponent.queryAddrCommunity(addrPid);
	}

	public List<TUpdateCfg> queryCanUpdateField(String busiCode) throws Exception{
		return busiConfigComponent.queryCanUpdateField(busiCode);
	}

	public List<ExtendTableAttributeDto> extAttrForm(String groupId,String tabName) throws Exception{
		return extTableComponent.findTabExtAttr(groupId ,tabName);
	}

	public List<ExtendTableAttributeDto> extAttrView(String groupId,String tabName,String pkValue) throws Exception{
		return extTableComponent.findTabExtAttr(groupId,tabName,pkValue);
	}

	public Date queryAcctDate() throws Exception {
		return feeComponent.acctDate();
	}

	public void modifyAcctDate(Date acctDate) throws Exception {
		feeComponent.saveAcctDate(acctDate);
	}
	
	/* (non-Javadoc)
	 * @see com.ycsoft.business.service.IQueryCfgService#checkDeviceCount(java.lang.String, java.lang.String)
	 */
	public void checkDeviceCount(String acctDate, String optrId,String deptId)
			throws Exception {
		indexComponent.checkDeviceCount(acctDate,optrId,deptId);
	}
	
	public List<JOdscntRecord> queryRecordByDeptId() throws Exception {
		return busiConfigComponent.queryRecordByDeptId();
	}

	/* (non-Javadoc)
	 * @see com.ycsoft.business.service.IQueryCfgService#checkUserCount(java.lang.String, java.lang.String)
	 */
	public void checkUserCount(String acctDate, String addrIds) throws Exception {
		indexComponent.checkUserCount(acctDate,addrIds);
	}

	public SItemvalue queryGripAccountMode() throws Exception {
		String gripAccountKey =feeComponent.queryGripAccountMode();
		return MemoryDict.getDictItem(DictKey.SYS_LEVEL, gripAccountKey);
	}
	
	public CVoucher queryVoucherById(String voucherId) throws Exception{
		return feeComponent.queryVoucherById(voucherId);
	}

	/**
	 * @param busiConfigComponent the busiConfigComponent to set
	 */
	public void setBusiConfigComponent(BusiConfigComponent busiConfigComponent) {
		this.busiConfigComponent = busiConfigComponent;
	}

	/**
	 * @param feeComponent the feeComponent to set
	 */
	public void setFeeComponent(FeeComponent feeComponent) {
		this.feeComponent = feeComponent;
	}

	/**
	 * @param taskComponent the taskComponent to set
	 */
	public void setTaskComponent(TaskComponent taskComponent) {
		this.taskComponent = taskComponent;
	}

	/**
	 * @param extTableComponent the extTableComponent to set
	 */
	public void setExtTableComponent(ExtTableComponent extTableComponent) {
		this.extTableComponent = extTableComponent;
	}

	/**
	 * @param simpleComponent the simpleComponent to set
	 */
	public void setSimpleComponent(SimpleComponent simpleComponent) {
		this.simpleComponent = simpleComponent;
	}

	/**
	 * @param indexComponent the indexComponent to set
	 */
	public void setIndexComponent(IndexComponent indexComponent) {
		this.indexComponent = indexComponent;
	}

	/**
	 * @param memoryComponent the memoryComponent to set
	 */
	public void setMemoryComponent(MemoryComponent memoryComponent) {
		this.memoryComponent = memoryComponent;
	}
}