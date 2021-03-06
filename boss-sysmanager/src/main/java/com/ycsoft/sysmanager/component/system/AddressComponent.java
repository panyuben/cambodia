package com.ycsoft.sysmanager.component.system;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import com.ycsoft.beans.config.TAddress;
import com.ycsoft.beans.config.TCustColonyCfg;
import com.ycsoft.beans.config.TNonresCustApproval;
import com.ycsoft.beans.config.TSpell;
import com.ycsoft.beans.core.cust.CCust;
import com.ycsoft.beans.system.SCounty;
import com.ycsoft.beans.system.SDept;
import com.ycsoft.beans.system.SItemvalue;
import com.ycsoft.beans.system.SOptr;
import com.ycsoft.business.commons.pojo.BusiParameter;
import com.ycsoft.business.dao.config.TAddressDao;
import com.ycsoft.business.dao.config.TCustColonyCfgDao;
import com.ycsoft.business.dao.config.TNonresCustApprovalDao;
import com.ycsoft.business.dao.config.TSpellDao;
import com.ycsoft.business.dao.system.SCountyDao;
import com.ycsoft.business.dao.system.SDeptDao;
import com.ycsoft.business.dao.system.SOptrDao;
import com.ycsoft.business.dto.config.TAddressDto;
import com.ycsoft.business.dto.system.OptrDto;
import com.ycsoft.business.service.externalImpl.ICustServiceExternal;
import com.ycsoft.commons.abstracts.BaseComponent;
import com.ycsoft.commons.constants.BusiCodeConstants;
import com.ycsoft.commons.constants.StatusConstants;
import com.ycsoft.commons.constants.SystemConstants;
import com.ycsoft.commons.exception.ComponentException;
import com.ycsoft.commons.helper.CnToSpell;
import com.ycsoft.commons.helper.StringHelper;
import com.ycsoft.daos.core.JDBCException;
import com.ycsoft.daos.core.Pager;

@Component
public class AddressComponent extends BaseComponent {

	private TAddressDao tAddressDao;
	private TSpellDao tSpellDao;
	private SDeptDao sDeptDao;
	private ICustServiceExternal custService;
	private SCountyDao sCountyDao ;
	private TCustColonyCfgDao tCustColonyCfgDao;
	private SOptrDao sOptrDao;
	private TNonresCustApprovalDao tNonresCustApprovalDao;

	public void setTNonresCustApprovalDao(
			TNonresCustApprovalDao nonresCustApprovalDao) {
		tNonresCustApprovalDao = nonresCustApprovalDao;
	}

	public List<TAddressDto> queryAddrByName(String q,SOptr optr) throws Exception{
//	public void queryAddrByName(String q,SOptr optr) throws Exception{
//		List<TAddress> list = tAddressDao.findAll();
//		List<TSpell> spell = new ArrayList<TSpell>();
//		
//		for(TAddress addr : list){
//			TSpell sp = new TSpell();
//			sp.setData_id(addr.getAddr_id());
//			sp.setData_type(SystemConstants.DATA_TYPE_ADDRESS);
//			sp.setFull_sepll(CnToSpell.getPinYin(addr.getAddr_name()));
//			sp.setSeq_sepll(CnToSpell.getPinYinHeadChar(addr.getAddr_name()));
//			spell.add(sp);
//		}
//		tSpellDao.save(spell.toArray(new TSpell[spell.size()]));
		List<TAddressDto> addressList = tAddressDao.queryAddrByName(q, optr.getCounty_id(), " 1=1 ");
		for(TAddressDto addr :addressList ){
			if(addr.getIs_leaf().equals("T")){
				if(StringHelper.isNotEmpty(addr.getBusi_optr_name())){
					addr.setAddr_name(addr.getAddr_name()+"[客户经理："+addr.getBusi_optr_name()+"]");
 				}
			}
		}
		return addressList;
	}

	public Pager<TCustColonyCfg> queryCustColony(Integer start , Integer limit ,String keyword,SOptr optr)throws Exception{
		List<SItemvalue> list = new ArrayList<SItemvalue>();
		if(StringHelper.isNotEmpty(keyword)){
			list = sItemvalueDao.findValueByName(keyword.toUpperCase());
		}
		return tCustColonyCfgDao.query(start, limit,list,keyword,optr.getCounty_id());
	}
	
	public void saveCustColony(String years,String cust_colony,String cust_class,String countys,Integer custNum,Integer userNum,SOptr optr) throws Exception{
		
		String[] custYears = years.split(",");
		String[] custColonys = cust_colony.split(",");
		String[] custClass = cust_class.split(",");
		String[] custCountys = countys.split(",");
		if(custClass.length>1 && custColonys.length>1){
			throw new ComponentException("客户群体和客户优惠类型所选数不能都大于1!");
		}
		if(StringHelper.isEmpty(cust_colony) && StringHelper.isEmpty(cust_class)){
			throw new ComponentException("客户群体和客户优惠类型所选数不能都为空!");
		}
		String type = "";
		String[] value = null ; 
		if(custClass.length>1){
			type = "CLASS";
			value = custClass;
		}else if(custColonys.length>1){
			type = "COLONYS";
			value = custColonys;
		}else if(StringHelper.isEmpty(cust_colony)){
			type = "ALL";
			value = custColonys;
		}else{
			value = custClass;
		}
		
		List<TCustColonyCfg> queryList = tCustColonyCfgDao.queryList(years,cust_colony,cust_class,countys);
		if(queryList.size()>0){
			throw new ComponentException("部分配置已经存在!如:"+queryList.get(0).getYear_date()+"年份"
					+queryList.get(0).getCounty_name_for()+"的"+queryList.get(0).getCust_colony_text()+","+queryList.get(0).getCust_class_text());
		}
		
		List<TCustColonyCfg> dList = new ArrayList<TCustColonyCfg>();
		for(int i=0;i<custYears.length;i++){
			for(int k=0;k<custCountys.length;k++){
				for(int j=0;j<value.length;j++){
					TCustColonyCfg cfg = new TCustColonyCfg();
					cfg.setYear_date(custYears[i]);
					if(type.equals("COLONYS")){
						cfg.setCust_colony(value[j]);
						cfg.setCust_class(custClass[0]);
					}else if(type.equals("CLASS")){
						cfg.setCust_colony(custColonys[0]);
						cfg.setCust_class(value[j]);
					}else {
						cfg.setCust_colony(custColonys[0]);
						cfg.setCust_class(custClass[0]);
					}
					cfg.setCust_num(custNum);
					cfg.setUser_num(userNum);
					cfg.setCounty_id_for(custCountys[k]);
					cfg.setCounty_id(optr.getCounty_id());		
					cfg.setOptr_id(optr.getOptr_id());
					cfg.setStatus(StatusConstants.ACTIVE);
					dList.add(cfg);
					
				}
			}
		}
		tCustColonyCfgDao.save(dList.toArray(new TCustColonyCfg[dList.size()]));
	}
	
	public void updateCustColony(String years,String custColony,String custClass,String countys,Integer custNum,Integer userNum) throws Exception{
		TCustColonyCfg cfg = tCustColonyCfgDao.query(years, custColony,custClass, countys);
		custNum =custNum == null?0:custNum;
		userNum =userNum == null?0:userNum;
		if(cfg.getUse_num() != null && cfg.getUse_num()>custNum){
			throw new ComponentException("新的开户总数小于已开户数!");
		}
		tCustColonyCfgDao.update(years, custColony,custClass, countys, custNum,userNum);
	}
	
	public boolean deleteCustColony(String yearDate,String custColony,String custClass,String countyId) throws Exception {
		tCustColonyCfgDao.delete(yearDate,custColony,custClass,countyId);
		return true;
	}
	
	
	/**
	 * 增加地区
	 * @param treeLevel 
	 * @return
	 * @throws Exception
	 */
	public TAddress saveAddress(TAddress addr) throws Exception{
		addr.setAddr_id(nextAddr(addr));
		addr.setIs_leaf(SystemConstants.BOOLEAN_TRUE);
		tAddressDao.save(addr);
		
		//保存地区拼音
		TSpell sp = new TSpell();
		sp.setData_id(addr.getAddr_id());
		sp.setData_type(SystemConstants.DATA_TYPE_ADDRESS);
		sp.setFull_sepll(CnToSpell.getPinYin(addr.getAddr_name()));
		sp.setSeq_sepll(CnToSpell.getPinYinHeadChar(addr.getAddr_name()));
		tSpellDao.save(sp);
		
		//修改父节点is_leaf为F
		updateAddress(addr.getAddr_pid(), SystemConstants.BOOLEAN_FALSE);
		return addr;
	}

	private String nextAddr(TAddress addr) throws JDBCException {
		String nextAddrId = tAddressDao.getAddrId(addr.getAddr_pid());
		if (addr.getTree_level()==2) {
			nextAddrId = StringHelper.leftWithZero(nextAddrId, 2);
		} else {
			nextAddrId = StringHelper.leftWithZero(nextAddrId, 5);
		}
		return nextAddrId;
	}
	
	public List<OptrDto> queryOptrByCountyId(String countyId) throws Exception {
		return sOptrDao.queryOptrByCountyId(countyId);
	}

	/**
	 * 批量保存地址
	 * @param addrList
	 * @param optr
	 * @return
	 * @throws JDBCException
	 */
	public List<TAddress> saveAddrList(List<TAddress> addrList,SOptr optr) throws JDBCException{
		
		for(TAddress addr : addrList){
			addr.setAddr_id(nextAddr(addr));
			addr.setArea_id(optr.getArea_id());
			addr.setCounty_id(optr.getCounty_id());
			addr.setIs_leaf(SystemConstants.BOOLEAN_TRUE);
			tAddressDao.save(addr);
			
			TSpell sp = new TSpell();
			sp.setData_id(addr.getAddr_id());
			sp.setData_type(SystemConstants.DATA_TYPE_ADDRESS);
			sp.setFull_sepll(CnToSpell.getPinYin(addr.getAddr_name()));
			sp.setSeq_sepll(CnToSpell.getPinYinHeadChar(addr.getAddr_name()));
			tSpellDao.save(sp);
		}
		
		//修改父节点is_leaf为F
		if(null !=addrList && addrList.size() > 0){
			updateAddress(addrList.get(0).getAddr_pid(), SystemConstants.BOOLEAN_FALSE);
		}
		
		
		return addrList;
	}

	/**
	 * 修改地区名字
	 * @return
	 * @throws Exception
	 */
	public void editAddress(TAddress addr) throws JDBCException{
		tAddressDao.update(addr);
		
		//修改地区拼音
		tSpellDao.updateAddrName(addr.getAddr_id(), CnToSpell.getPinYin(addr.getAddr_name()), CnToSpell.getPinYinHeadChar(addr.getAddr_name()));
	}

	/**
	 * 删除地区
	 * @return
	 * @throws Exception
	 */
	public boolean deleteAddress(String addrId) throws JDBCException{
		List<CCust> custList = tAddressDao.getCustByAddrId(addrId);
		if(custList.size() > 0){
			return false;
		}else{
			TAddress addr = tAddressDao.findByKey(addrId);
			List<TAddress> addrList = tAddressDao.getAddrByPid(addr.getAddr_pid());
			if(addrList.size() == 1){//如果父节点只有当前一个子节点，is_leaf置为T
				updateAddress(addr.getAddr_pid(), SystemConstants.BOOLEAN_TRUE);
			}
			tAddressDao.remove(addrId);
			return true;
		}
	}
	
	public void updateAddressStatus(String addrId, String status) throws Exception{
		TAddress addr = tAddressDao.findByKey(addrId);
		addr.setStatus(status);
		tAddressDao.update(addr);
	}

	/**
	 * 小区挂载
	 * @param newAddrId 新区域编号
	 * @param addrId    需要挂载的小区
	 * @param countyId  对应地市编号
	 * @param optr
	 * @throws Exception
	 */
	public String changeAddr(String newAddrId,String[] addrId ,String countyId,SOptr optr) throws Exception {
			TAddressDto newaddr = tAddressDao.getAddressByAddrId(newAddrId);
			List<CCust> custList = new ArrayList<CCust>();
			List<CCust> custLinkmanList = new ArrayList<CCust>();
			List<CCust> custAllList = tAddressDao.getCustAllByAddrId(addrId,countyId);
			for(String id : addrId){
				TAddressDto oldaddress = tAddressDao.getAddressByAddrId(id);
				if(oldaddress == null)
					throw new ComponentException("小区编号"+id+"不存在!");
				//查询可以修改的c_cust的地址数据
				List<CCust> custAddrList = tAddressDao.getCustByAddrId(newaddr,oldaddress,countyId);
				//查询可以修改的c_cust_linkman的地址数据
				List<CCust> custLinkmanAddrList = tAddressDao.getCustLinkmanByAddrId(newaddr,oldaddress,countyId);
				for(CCust dto:custAddrList){
					CCust custadd = new CCust();
					BeanUtils.copyProperties(dto, custadd);
					custList.add(custadd);
				}
				for(CCust dto:custLinkmanAddrList){
					CCust custadd = new CCust();
					BeanUtils.copyProperties(dto, custadd);
					custLinkmanList.add(custadd);
				}
			}
			for(int i=custAllList.size()-1;i>=0;i--){
				CCust cust = custAllList.get(i);
				boolean flag=false;
				for (CCust dto:custList){
					if (cust.getCust_id().equals(dto.getCust_id())){
						flag = true;
						break;
					}
				}
				if (flag)
					custAllList.remove(i);
			}

			SCounty county = sCountyDao.getCountyById(countyId).get(0);
				BusiParameter p = new BusiParameter();
				optr.setArea_id(county.getArea_id());
				optr.setCounty_id(county.getCounty_id());
				p.setOptr(optr);
				custService.updateAddressList(p,custList,custLinkmanList,BusiCodeConstants.ADDRESS_CHANGE_ADDR);
				//变更小区对应的区域
				tAddressDao.updateAddr(addrId,newAddrId,countyId);
				//修改地址is_leaf属性为F
				updateAddress(newAddrId, SystemConstants.BOOLEAN_FALSE);
				if(custAllList.size()>0){
					String src ="";
					for(CCust dto :custAllList){
						src +=dto.getCust_id()+",";
					}
					src = StringHelper.delEndChar(src, 1);
					return src;
				}else{
					return null;
				}	
	}
	
	public Pager<CCust> queryCustAddrByCustIds(String[] custIds,String countyId,Integer start,Integer limit) throws Exception{
		return tAddressDao.queryCustAddrByCustIds(custIds, countyId,start,limit);
	}
	
	public void updateAddressList(List<CCust> custAddrList,String countyId,SOptr optr) throws Exception{
		SCounty county = sCountyDao.getCountyById(countyId).get(0);
		BusiParameter p = new BusiParameter();
		optr.setArea_id(county.getArea_id());
		optr.setCounty_id(county.getCounty_id());
		p.setOptr(optr);
		custService.updateAddressList(p,custAddrList,null,BusiCodeConstants.ADDRESS_UPDATE_SOME);
	}
	
	/**
	 * 修改地址is_leaf属性
	 * @param addrId
	 * @param isLeaf
	 * @throws JDBCException
	 */
	private void updateAddress(String addrId,String isLeaf) throws JDBCException{
		TAddress addr = tAddressDao.findByKey(addrId);
		addr.setIs_leaf(isLeaf);
		tAddressDao.update(addr);
	}
	
	public List<SDept> queryFgsByCountyId(String countyId) throws Exception {
		return sDeptDao.queryFgsByDeptId(countyId);
	}
	public List<TAddress> queryAddrByCountyId(String countyId) throws Exception {
		return tAddressDao.queryAddrByCountyId(countyId);
	}
	public List<TAddressDto> queryAddrByaddrPid(String addrId) throws Exception {
		return tAddressDao.queryAddrByaddrPid(addrId);
	}
	
	public TAddress queryAddrByaddrId(String addrId) throws Exception {
		return tAddressDao.findByKey(addrId);
	}
	
	public Pager<TNonresCustApproval> queryNonresCustApp(String query,Integer start,Integer limit) throws Exception {
		return tNonresCustApprovalDao.queryNonresCustApp(null,query, start, limit);
	}
	
	public void updateNonresCustApp(TNonresCustApproval nca) throws Exception {
		
		if(StringHelper.isEmpty(nca.getApp_id())){
			TNonresCustApproval nonresCustApp = tNonresCustApprovalDao.queryByAppCode(nca.getApp_code());
			if(nonresCustApp != null)
				throw new ComponentException("该审批单号已存在!");
			nca.setApp_id(tNonresCustApprovalDao.findSequence().toString());
			nca.setStatus(StatusConstants.IDLE);
			tNonresCustApprovalDao.save(nca);
		}else{
			tNonresCustApprovalDao.updateNonresCustApp(nca);
		}
	}
	
	public void deleteNonresCustApp(String appId) throws Exception {
		tNonresCustApprovalDao.deleteByAppId(appId);
	}
	
	public void setTAddressDao(TAddressDao addressDao) {
		tAddressDao = addressDao;
	}

	public TSpellDao getTSpellDao() {
		return tSpellDao;
	}

	public void setTSpellDao(TSpellDao spellDao) {
		tSpellDao = spellDao;
	}
	public void setSDeptDao(SDeptDao deptDao) {
		sDeptDao = deptDao;
	}
	public void setTCustColonyCfgDao(TCustColonyCfgDao custColonyCfgDao) {
		tCustColonyCfgDao = custColonyCfgDao;
	}
	
	public void setCustService(ICustServiceExternal custService) {
		this.custService = custService;
	}
	public void setSCountyDao(SCountyDao countyDao) {
		sCountyDao = countyDao;
	}

	public void setSOptrDao(SOptrDao optrDao) {
		sOptrDao = optrDao;
	}
}
