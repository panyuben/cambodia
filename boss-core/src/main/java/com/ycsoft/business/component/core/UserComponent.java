package com.ycsoft.business.component.core;

import static com.ycsoft.commons.constants.SystemConstants.PROD_SERV_ID_DTV;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import com.ycsoft.beans.config.TCustColonyCfg;
import com.ycsoft.beans.core.common.CDoneCode;
import com.ycsoft.beans.core.common.CDoneCodeDetail;
import com.ycsoft.beans.core.cust.CCust;
import com.ycsoft.beans.core.fee.CFee;
import com.ycsoft.beans.core.job.JUserStop;
import com.ycsoft.beans.core.promotion.CPromFee;
import com.ycsoft.beans.core.promotion.CPromProdRefund;
import com.ycsoft.beans.core.user.CRejectRes;
import com.ycsoft.beans.core.user.CUser;
import com.ycsoft.beans.core.user.CUserAtv;
import com.ycsoft.beans.core.user.CUserAtvHis;
import com.ycsoft.beans.core.user.CUserBroadband;
import com.ycsoft.beans.core.user.CUserBroadbandHis;
import com.ycsoft.beans.core.user.CUserDtv;
import com.ycsoft.beans.core.user.CUserDtvHis;
import com.ycsoft.beans.core.user.CUserHis;
import com.ycsoft.beans.core.user.CUserPropChange;
import com.ycsoft.beans.core.user.CUserStb;
import com.ycsoft.beans.device.RDevice;
import com.ycsoft.beans.prod.PPromFee;
import com.ycsoft.beans.prod.PPromFeeUser;
import com.ycsoft.beans.prod.PRes;
import com.ycsoft.beans.system.SOptr;
import com.ycsoft.business.commons.abstracts.BaseBusiComponent;
import com.ycsoft.business.component.config.ExpressionUtil;
import com.ycsoft.business.dao.config.TCustColonyCfgDao;
import com.ycsoft.business.dao.core.cust.CCustDao;
import com.ycsoft.business.dao.core.fee.CFeeDao;
import com.ycsoft.business.dao.core.job.JUserStopDao;
import com.ycsoft.business.dao.core.promotion.CPromFeeDao;
import com.ycsoft.business.dao.core.promotion.CPromProdRefundDao;
import com.ycsoft.business.dao.core.promotion.CPromotionDao;
import com.ycsoft.business.dao.core.user.CRejectResDao;
import com.ycsoft.business.dao.core.user.CUserAtvDao;
import com.ycsoft.business.dao.core.user.CUserAtvHisDao;
import com.ycsoft.business.dao.core.user.CUserBroadbandDao;
import com.ycsoft.business.dao.core.user.CUserBroadbandHisDao;
import com.ycsoft.business.dao.core.user.CUserDao;
import com.ycsoft.business.dao.core.user.CUserDtvDao;
import com.ycsoft.business.dao.core.user.CUserDtvHisDao;
import com.ycsoft.business.dao.core.user.CUserHisDao;
import com.ycsoft.business.dao.core.user.CUserPropChangeDao;
import com.ycsoft.business.dao.prod.PPromFeeDao;
import com.ycsoft.business.dao.prod.PPromFeeProdDao;
import com.ycsoft.business.dao.prod.PPromFeeUserDao;
import com.ycsoft.business.dao.resource.device.RDeviceDao;
import com.ycsoft.business.dao.system.SOptrDao;
import com.ycsoft.business.dto.core.acct.AcctitemDto;
import com.ycsoft.business.dto.core.bill.UserBillDto;
import com.ycsoft.business.dto.core.prod.CProdDto;
import com.ycsoft.business.dto.core.prod.CPromotionDto;
import com.ycsoft.business.dto.core.prod.ProdTariffDto;
import com.ycsoft.business.dto.core.prod.PromFeeProdDto;
import com.ycsoft.business.dto.core.user.ChangedUser;
import com.ycsoft.business.dto.core.user.UserDto;
import com.ycsoft.business.dto.core.user.UserRes;
import com.ycsoft.commons.constants.DictKey;
import com.ycsoft.commons.constants.StatusConstants;
import com.ycsoft.commons.constants.SystemConstants;
import com.ycsoft.commons.exception.ComponentException;
import com.ycsoft.commons.exception.ServicesException;
import com.ycsoft.commons.helper.BeanHelper;
import com.ycsoft.commons.helper.CollectionHelper;
import com.ycsoft.commons.helper.DateHelper;
import com.ycsoft.commons.helper.StringHelper;
import com.ycsoft.commons.store.MemoryDict;
import com.ycsoft.daos.core.JDBCException;
import com.ycsoft.daos.core.Pager;
import com.ycsoft.sysmanager.dto.prod.ResGroupDto;


/**
 * 用户组件
 */
@Component
public class UserComponent extends BaseBusiComponent {
	private CUserDao cUserDao;
	private CUserHisDao cUserHisDao;
	private CUserAtvDao cUserAtvDao;
	private CUserDtvDao cUserDtvDao;
	private CUserBroadbandDao cUserBroadbandDao;
	private CUserAtvHisDao cUserAtvHisDao;
	private CUserDtvHisDao cUserDtvHisDao;
	private CUserBroadbandHisDao cUserBroadbandHisDao;
	private CUserPropChangeDao cUserPropChangeDao;
	private SOptrDao sOptrDao;
	private CRejectResDao cRejectResDao;
	private JUserStopDao jUserStopDao;
	private CPromotionDao cPromotionDao;
	private CCustDao cCustDao;
	private CFeeDao cFeeDao;
	
	private PPromFeeDao pPromFeeDao;
	private PPromFeeUserDao pPromFeeUserDao;
	private PPromFeeProdDao pPromFeeProdDao;
	private CPromProdRefundDao cPromProdRefundDao;
	private RDeviceDao rDeviceDao;
	private CPromFeeDao cPromFeeDao;
	private TCustColonyCfgDao tCustColonyCfgDao;
	private ExpressionUtil expressionUtil ;

	/**
	 * 创建用户
	 * @param user
	 * @return
	 * @throws Exception
	 */
	public String createUser(CUser user) throws Exception {

		user.setStatus(StatusConstants.ACTIVE);
		user.setIs_rstop_fee(isStopFee());
		setBaseInfo(user);
		if (user instanceof CUserAtv ){
			CUserAtv atv = (CUserAtv)user;
			user.setUser_type(SystemConstants.USER_TYPE_ATV);
			atv.setTerminal_type(SystemConstants.USER_TERMINAL_TYPE_ZZD);
			cUserAtvDao.save(atv);
		} else if (user instanceof CUserDtv ){
			CUserDtv dtv = (CUserDtv)user;
			user.setUser_type(SystemConstants.USER_TYPE_DTV);
			if (SystemConstants.USER_TERMINAL_TYPE_FZD.equals(dtv.getTerminal_type()))
				dtv.setStr19(SystemConstants.BOOLEAN_TRUE);
			else 
				dtv.setStr19(null);
			decideFreeUser(dtv);
			cUserDtvDao.save(dtv);
		}  else if (user instanceof CUserBroadband ){
			CUserBroadband bBand = (CUserBroadband)user;
			user.setUser_type(SystemConstants.USER_TYPE_BAND);
			CUser cu = this.queryUserByLoginName(bBand.getLogin_name());
			if(null != cu){
				throw new ServicesException("宽带登录账号不能重复");
			}
			cUserBroadbandDao.save(bBand);
		}
		user.setUser_class_area(getOptr().getArea_id());
		cUserDao.save(user);
		//同步客户属性用户开户数量限制
		addUserCfg(user);
		
		return user.getUser_id();
	}

	private void decideFreeUser(CUserDtv dtv) throws JDBCException {
		// 客户允许有2个免费副机
		List<CUser> users = queryUserByCustId(dtv.getCust_id());
		if (dtv.getTerminal_type().equals(
				SystemConstants.USER_TERMINAL_TYPE_FZD)) {
			int freenum = 0;
			for (CUser u : users) {
				if (u.getUser_type().equals(PROD_SERV_ID_DTV)
						&& "T".equals(u.getStr19()))
					freenum++;
			}
			if ( "T".equals(dtv.getStr19()) && freenum > 1)
				dtv.setStr19("F");
			
		} else {
			dtv.setStr19("F");
		}
	}

	/**
	 * 修改用户信息
	 * 
	 * @param doneCode
	 * @param userId
	 * @param propChangeList
	 * @throws Exception
	 */
	public void editUser(Integer doneCode,String userId,List<CUserPropChange> propChangeList) throws Exception{
		if(propChangeList == null || propChangeList.size() == 0) return ;
		CUser user = new CUser();
		CUserAtv atv = new CUserAtv();
		CUserDtv dtv = new CUserDtv();
		CUserBroadband bBand = new CUserBroadband();
		user.setUser_id(userId);
		atv.setUser_id(userId);
		dtv.setUser_id(userId);
		bBand.setUser_id(userId);
		for (CUserPropChange change:propChangeList){
			try{
				String newValue = StringHelper.isEmpty(change.getNew_value()) ? ""
						: change.getNew_value();
				BeanHelper.setPropertyString(user, change.getColumn_name(), newValue);
				BeanHelper.setPropertyString(atv, change.getColumn_name(), newValue);
				BeanHelper.setPropertyString(dtv, change.getColumn_name(), newValue);
				BeanHelper.setPropertyString(bBand, change.getColumn_name(), newValue);
				if (change.getColumn_name().equalsIgnoreCase("status")){
					user.setStatus_date(new Date());
				}
				
				if (change.getColumn_name().equalsIgnoreCase("user_class")){
					//获取操作员的原始信息
					SOptr optr1 = sOptrDao.findByKey(getOptr().getOptr_id());
					if (!getOptr().getCounty_id().equals(optr1.getCounty_id())){
						user.setUser_class_area(optr1.getCounty_id());
					}
				}
				if (change.getColumn_name().equalsIgnoreCase("stop_type")){
					//更新产品的催停标记
					cProdDao.updateStopType(userId,newValue);
				}
			} catch(Exception e){

			}
			setBaseInfo(change);
			change.setUser_id(userId);
			change.setDone_code(doneCode);
			change.setChange_time(DateHelper.now());
		}
		//保存信息修改
		cUserDao.update(user);
		cUserAtvDao.update(atv);
		cUserDtvDao.update(dtv);
		cUserBroadbandDao.update(bBand);
		//保存异动信息
		cUserPropChangeDao.save(propChangeList.toArray(new CUserPropChange[propChangeList.size()]));

	}
	
	public String queryLastStatus(String userId) throws Exception{
		CUserPropChange upc =  cUserPropChangeDao.queryLastStatus(userId, getOptr().getCounty_id());
		if(null == upc)
			return null;
		return upc.getOld_value();
	}

	/**
	 * 删除用户信息
	 * @param doneCode
	 * @param user
	 * @throws Exception
	 */
	public void removeUserWithHis( Integer doneCode ,CUser user) throws Exception{

		CUserHis userHis = new CUserHis();
		userHis.setDone_code(doneCode);
		BeanUtils.copyProperties(user, userHis);
		userHis.setStatus(StatusConstants.INVALID);
		userHis.setStatus_date(DateHelper.now());
		if (user.getUser_type().equals(SystemConstants.USER_TYPE_DTV))
			userHis.setNeed_check("T");
		else 
			userHis.setNeed_check("F");
		cUserHisDao.save(userHis);
		
		if (user.getUser_type().equals(SystemConstants.USER_TYPE_ATV)){
			CUserAtv atv = cUserAtvDao.findByKey(user.getUser_id());
			CUserAtvHis atvHis = new CUserAtvHis();
			BeanUtils.copyProperties(atv, atvHis);
			atvHis.setDone_code(doneCode);
			cUserAtvHisDao.save(atvHis);
		} else if (user.getUser_type().equals(SystemConstants.USER_TYPE_DTV)){
			CUserDtv dtv = cUserDtvDao.findByKey(user.getUser_id());
			CUserDtvHis dtvHis = new CUserDtvHis();
			BeanUtils.copyProperties(dtv, dtvHis);
			dtvHis.setDone_code(doneCode);
			cUserDtvHisDao.save(dtvHis);
		} else if (user.getUser_type().equals(SystemConstants.USER_TYPE_BAND)){
			CUserBroadband band = cUserBroadbandDao.findByKey(user.getUser_id());
			CUserBroadbandHis bandHis = new CUserBroadbandHis();
			BeanUtils.copyProperties(band, bandHis);
			bandHis.setDone_code(doneCode);
			cUserBroadbandHisDao.save(bandHis);
		} 
		
		removeUserWithoutHis(user.getUser_id());
	}

	public void removeUserWithoutHis(String userId) throws Exception{
		cUserDao.remove(userId);
		cUserAtvDao.remove(userId);
		cUserDtvDao.remove(userId);
		cUserBroadbandDao.remove(userId);
	}
	
	/**
	 * @param cardId
	 */
	public void updateUserCheckFlag(String cardId) throws Exception{
		this.cUserHisDao.updateCheckFlag(cardId);
		
	}

	/**
	 * 根据客户ID，获取符合条件用户的集合
	 * @param cust
	 */
	public List<CUser> queryUserByCustId(String custId) throws JDBCException {
		List<CUser> users= new ArrayList<CUser>();
		users.addAll(cUserAtvDao.queryAtvByCustId(custId));
		users.addAll(cUserDtvDao.queryDtvByCustId(custId));
		users.addAll(cUserBroadbandDao.queryBandByCustId(custId));
		fillUserName(users);
		return users;
	}
	
	/**
	 * @param custId
	 * @return
	 */
	public List<CUserStb> queryUserStbByCustId(String custId) throws JDBCException, ServicesException {
		return cUserDao.queryUserStbByCustId(custId);
	}
	
	/**
	 * @param userId
	 * @return
	 */
	public CUserStb queryUserStbByUserId(String userId) throws JDBCException {
		return cUserDao.queryUserStbByUserId(userId);
	}
	
	public List<CUser> queryUserByCustIds(String[] custIds) throws Exception{
		return cUserDao.queryUserByCustIds(custIds);
	}
	
	public List<CUser> queryUserHisByCustId(String custId) throws JDBCException {
		List<CUser> users= new ArrayList<CUser>();
		users.addAll(cUserAtvDao.queryAtvHisByCustId(custId));
		users.addAll(cUserDtvDao.queryDtvHisByCustId(custId));
		users.addAll(cUserBroadbandDao.queryBandHisByCustId(custId));
		fillUserName(users);
		return users;
	}

	/**
	 * 根据客户ID，获取符合条件用户的集合
	 * @param cust
	 */
	public List<UserDto> queryUser(String custId) throws Exception {
		List<UserDto> result = new ArrayList<UserDto>();
		List<CUser> users = queryUserByCustId(custId);
		List<UserRes> resList = cRejectResDao.queryRejectResByCustId(custId);
		List<JUserStop> stopList = jUserStopDao.findAll();
		Map<String,List<UserRes>> map = CollectionHelper.converToMap(resList, "user_id");
		Map<String,List<JUserStop>> stopmap = CollectionHelper.converToMap(stopList, "user_id");
		for (CUser user :users){
			UserDto userdto = new UserDto();
			
			List<UserRes> list = map.get(user.getUser_id());
			List<JUserStop> stoplist = stopmap.get(user.getUser_id());
			String rejectRes = "";
			if(list!=null){
				for(UserRes res : list){
					rejectRes +=res.getRes_name()+",";
				}
				rejectRes = rejectRes.substring(0,rejectRes.length()-1);
			}
			user.setIs_rstop_fee(isStopFee());
			BeanUtils.copyProperties(user, userdto);
			if(stoplist!=null){
				userdto.setStop_date(stoplist.get(0).getStop_date());
			}
			if(StringHelper.isNotEmpty(rejectRes))
				userdto.setRejectRes(rejectRes);
			result.add(userdto);
		}
		return result;
	}
	
	/**
	 * 根据客户ID，获取符合条件销户用户的集合
	 * @param cust
	 */
	public List<UserDto> queryUserHis(String custId) throws JDBCException {
		List<UserDto> result = new ArrayList<UserDto>();
		List<CUser> users = queryUserHisByCustId(custId);
		for (CUser user :users){
			UserDto userdto = new UserDto();
			BeanUtils.copyProperties(user, userdto);
			result.add(userdto);
		}
		return result;
	}
	
	public void saveCancelOpenInteractive(String userId,Integer doneCode) throws Exception {
		CUser user = cUserDao.findByKey(userId);
		CUserDtv dtv = cUserDtvDao.findByKey(userId);
		List<CUserPropChange> changeList = new ArrayList<CUserPropChange>();
		
		RDevice modem = rDeviceDao.findByDeviceCode(user.getModem_mac());

		if (StringHelper.isNotEmpty(user.getModem_mac())){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("modem_mac");
			change.setOld_value(user.getModem_mac());
			change.setNew_value("");
			setBaseInfo(change);
			change.setUser_id(userId);
			change.setDone_code(doneCode);
			change.setChange_time(DateHelper.now());
			changeList.add(change);
		}
		if (StringHelper.isNotEmpty(user.getNet_type())){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("net_type");
			change.setOld_value(user.getNet_type());
			change.setNew_value("");
			setBaseInfo(change);
			change.setUser_id(userId);
			change.setDone_code(doneCode);
			change.setChange_time(DateHelper.now());
			changeList.add(change);
		}
		//双向用户类型
		if (StringHelper.isNotEmpty(user.getStr11())){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("str11");
			change.setOld_value(user.getStr11());
			change.setNew_value("");
			setBaseInfo(change);
			change.setUser_id(userId);
			change.setDone_code(doneCode);
			change.setChange_time(DateHelper.now());
			changeList.add(change);
		}
		if (StringHelper.isNotEmpty(dtv.getPassword())){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("password");
			change.setOld_value(dtv.getPassword());
			change.setNew_value("");
			setBaseInfo(change);
			change.setUser_id(userId);
			change.setDone_code(doneCode);
			change.setChange_time(DateHelper.now());
			changeList.add(change);
		}
		if (dtv.getServ_type().equals(SystemConstants.DTV_SERV_TYPE_DOUBLE)){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("serv_type");
			change.setOld_value(dtv.getServ_type());
			change.setNew_value(SystemConstants.DTV_SERV_TYPE_SINGLE);
			setBaseInfo(change);
			change.setUser_id(userId);
			change.setDone_code(doneCode);
			change.setChange_time(DateHelper.now());
			changeList.add(change);
		}
		
		user.setNet_type("");
		user.setStr11("");
		if(modem!= null && SystemConstants.BOOLEAN_FALSE.equals(modem.getIs_virtual())){
			//不是虚拟设备
			user.setModem_mac("");
		}
		dtv.setPassword("");
		dtv.setServ_type(SystemConstants.DTV_SERV_TYPE_SINGLE);
		
		cUserDao.update(user);
		cUserDtvDao.update(dtv);
		cUserPropChangeDao.save(changeList.toArray(new CUserPropChange[changeList.size()]));
		
	}
	
	
	
	/**
	 * 返回userdto
	 * @param userId
	 * @return
	 * @throws JDBCException
	 */
	public UserDto queryUserById(String userId) throws JDBCException {
		List<CUser> users= new ArrayList<CUser>();
		CUser atv = cUserAtvDao.queryAtvById(userId);
		if (atv!=null) users.add(atv);
		CUser dtv = cUserDtvDao.queryDtvById(userId);
		if (dtv!=null) users.add(dtv);
		CUser broadband = cUserBroadbandDao.queryBandById(userId);
		if (broadband!=null) users.add(broadband);
		fillUserName(users);

		UserDto userdto = null;
		if (users.size()>0){
			userdto = new UserDto();
			BeanUtils.copyProperties(users.get(0), userdto);
		}
		return userdto;
	}

	/**
	 * 根据用户ID， 查询用户异动信息
	 * @param userId
	 */
	public List<CUserPropChange> queryUserPropChange(String userId,String userType) throws Exception{
		 List<CUserPropChange> propChangelist =  cUserPropChangeDao.queryByUserId(userId,userType, getOptr().getCounty_id());
		 for(CUserPropChange upc :propChangelist){
			 if (StringHelper.isNotEmpty(upc.getParam_name())){
				upc.setOld_value_text(MemoryDict.getDictName( upc.getParam_name(), upc.getOld_value()));
				upc.setNew_value_text(MemoryDict.getDictName( upc.getParam_name(), upc.getNew_value()));
			 }else {
				upc.setOld_value_text(upc.getOld_value());
				upc.setNew_value_text(upc.getNew_value());
			 }
		 }
		 return propChangelist;
	}

	/**
	 * @param userId
	 * @param doneCode
	 * @return
	 */
	public List<CUserPropChange> queryPropChangeByDoneCode(String userId,Integer doneCode) throws Exception{
		return cUserPropChangeDao.queryByDoneCode(userId, doneCode,getOptr().getCounty_id());
	}

	/**
	 * 给没有设备的用户分配设备
	 * @param userId
	 * @param stbId 机顶盒号
	 * @param cardId 智能卡号
	 * @param modemMac modem Mac 地址
	 */
	public void updateDevice(Integer doneCode,CUser user, String stbId, String cardId,
			String modemMac) throws Exception {
		stbId = stbId == null?"":stbId;
		cardId = cardId == null?"":cardId;
		modemMac = modemMac == null?"":modemMac;
		user.setStb_id(user.getStb_id() == null?"":user.getStb_id());
		user.setCard_id(user.getCard_id() == null?"":user.getCard_id());
		user.setModem_mac(user.getModem_mac() == null?"":user.getModem_mac());

		List<CUserPropChange> changeList = new ArrayList<CUserPropChange>();
		if (!user.getStb_id().equals(stbId)){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("stb_id");
			change.setOld_value(user.getStb_id());
			change.setNew_value(stbId);
			changeList.add(change);
		}

		if (!user.getCard_id().equals(cardId)){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("card_id");
			change.setOld_value(user.getCard_id());
			change.setNew_value(cardId);
			changeList.add(change);
		}

		if (!user.getModem_mac().equals(modemMac)){
			CUserPropChange change = new CUserPropChange();
			change.setColumn_name("modem_mac");
			change.setOld_value(user.getModem_mac());
			change.setNew_value(modemMac);
			changeList.add(change);
		}

		editUser(doneCode, user.getUser_id(), changeList);
	}

	/**
	 * 设置用户名信息
	 * 模拟用户不需要设置
	 * 数字用户为终端类型
	 * 宽带用户为宽带帐号
	 * @param records
	 */
	private void fillUserName(List<CUser> records) {
		for( CUser user :records){
			if("DTV".equals(user.getUser_type())){
				CUserDtv dtv = (CUserDtv)user;
				//if (StringHelper.isEmpty(dtv.getUser_name()))
				String terminal_type = dtv.getTerminal_type();
				user.setUser_name(MemoryDict.getDictName(DictKey.TERMINAL_TYPE,terminal_type));
				if(terminal_type.equals(SystemConstants.USER_TERMINAL_TYPE_FZD)){//主终端不加 免费超额之类的后缀
					if(SystemConstants.BOOLEAN_TRUE.equals(user.getStr19())){
						user.setUser_name(user.getUser_name()+"(免费)");
					} else if (SystemConstants.BOOLEAN_FALSE.equals(user.getStr19())){
						user.setUser_name(user.getUser_name()+"(超额)");
					}
				}
			}else if("BAND".equals(user.getUser_type())){
				CUserBroadband band = (CUserBroadband)user;
				user.setUser_name(band.getLogin_name());
			}else if("ATV".equals(user.getUser_type())){
				CUserAtv atv = (CUserAtv)user;
//				user.setUser_name(MemoryDict.getDictName(DictKey.TERMINAL_TYPE,atv.getTerminal_type()));
				if (StringHelper.isEmpty(atv.getUser_name()))
					atv.setUser_name("模拟终端");
			}
		}
	}

	/**
	 * 根据设备号查询用户
	 * @param deviceType
	 * @param deviceCode
	 * @return
	 */
	public List<CUser> queryUserByDevice(String deviceType, String deviceCode)
			throws JDBCException, ComponentException {
		List<CUser> user = null;
		if (deviceType.equals(SystemConstants.DEVICE_TYPE_STB))
			user = cUserDao.queryUserByStbId(deviceCode);
		else if (deviceType.equals(SystemConstants.DEVICE_TYPE_CARD))
			user = cUserDao.queryUserByCardId(deviceCode);
		else if (deviceType.equals(SystemConstants.DEVICE_TYPE_MODEM))
			user = cUserDao.queryUserByModemId(deviceCode);
		else
			throw new ComponentException("无效的设备类型" + deviceType);
		return user;
	}

	/**
	 * 更新用户设备信息
	 *
	 * @param userId
	 * @param deviceType
	 * @param deviceCode
	 * @throws JDBCException
	 * @throws ComponentException
	 */
	public void updateDevice(String userId, String deviceType, String deviceCode) throws JDBCException, ComponentException {
		if (deviceType.equals(SystemConstants.DEVICE_TYPE_STB))
			cUserDao.updateDevice(userId, "", null, null);
		else if (deviceType.equals(SystemConstants.DEVICE_TYPE_CARD))
			cUserDao.updateDevice(userId, null,"", null);
		else if (deviceType.equals(SystemConstants.DEVICE_TYPE_MODEM))
			cUserDao.updateDevice(userId, null, null,"");
		else
			throw new ComponentException("无效的设备类型" + deviceType);
	}

	/**
	 * @param userId
	 * @param doneCode
	 */
	public void removeUserPropChange(String userId, Integer doneCode) throws Exception{
		cUserPropChangeDao.removeByDoneCode( userId, doneCode,getOptr().getCounty_id());

	}
	
	/**
	 * 保存用户排斥的资源
	 * @param userId
	 * @param custId
	 * @param resIds
	 * @throws Exception
	 */
	public void saveRejectRes(String userId,String custId,String resIds) throws Exception {
		cRejectResDao.deleteByUserIdAndCustId(userId, custId);
		
		if(StringHelper.isNotEmpty(resIds)){
			String[] resIdsArr = resIds.split(",");
			List<CRejectRes> list = new ArrayList<CRejectRes>();
			for(String resId : resIdsArr){
				CRejectRes res = new CRejectRes();
				res.setUser_id(userId);
				res.setCust_id(custId);
				res.setRes_id(resId);
				list.add(res);
			}
			cRejectResDao.save(list.toArray(new CRejectRes[list.size()]));
		}
	}

	/**
	 * 获取用户id
	 */
	public String gUserId() throws Exception {
		return cUserDao.findSequence().toString();
	}
	
	/**
	 * 部门下的是所有操作员
	 * @param deptId
	 * @return
	 * @throws JDBCException
	 */
	public List<SOptr> getByDeptId(String deptId) throws JDBCException {
		return sOptrDao.getByDeptId(deptId);
	}
	
	public CUserBroadband queryBandByDeviceId(String deviceCode) throws JDBCException{
		return cUserBroadbandDao.queryBandByDeviceId(deviceCode);
	}
	
	public UserDto queryUserByDeviceId(String deviceId) throws JDBCException{
		List<CUser> users= new ArrayList<CUser>();
		CUser dtv = cUserDtvDao.queryDtvByDeviceId(deviceId);
		if (dtv!=null) users.add(dtv);
			CUser broadband = cUserBroadbandDao.queryBandByDeviceId(deviceId);
		if (broadband!=null) users.add(broadband);
		fillUserName(users);

		UserDto userdto = null;
		if (users.size()>0){
			userdto = new UserDto();
			BeanUtils.copyProperties(users.get(0), userdto);
		}
		return userdto;
 	}
	
	/**
	 * @param loginName
	 * @param countyId
	 * @return
	 */
	public CUser queryUserByLoginName(String loginName) throws Exception {
		return cUserBroadbandDao.queryUserByLoginName(loginName,getOptr().getCounty_id());
	}


	
	/**
	 * @param userId
	 * @return
	 */
	public List<CPromotionDto> queryUserPromotion(String userId) throws Exception {
		return cPromotionDao.queryUserPromotion(userId,getOptr().getCounty_id());
	}
	
	public List<CPromotionDto> queryPromotionCanCancel(String userId, String prodId) throws Exception {
		List<CPromotionDto> list = new ArrayList<CPromotionDto>();
		List<CPromotionDto> result = new ArrayList<CPromotionDto>();
		
		/*
		list = cPromotionDao.queryPromotionCanCancel(userId,getOptr().getCounty_id());
		
		Date now = new Date();
		Map<String, List<CPromotionDto>> mapKeyByProdId = CollectionHelper.converToMap(list, "user_id");
		List<CPromotionDto> list2 = mapKeyByProdId.get(prodId);
		
		if(!CollectionHelper.isEmpty(list2)){
			CPromotionDto promotion = list2.get(0);
			if(promotion.getStatus().equals(StatusConstants.ACTIVE)){
				String promotionId = promotion.getPromotion_id();
				Map<String, List<CPromotionDto>> mapKeyByPromotion = CollectionHelper.converToMap(list, "promotion_id");
				List<CPromotionDto> list3 = mapKeyByPromotion.get(promotionId);
				
				for(CPromotionDto dto:list3){
					Date createDate = dto.getCreate_time();
					if(createDate.getYear() == now.getYear() && createDate.getMonth() == now.getMonth()){
						result.add(dto);
					}
				}
			}
		}
		*/
		String [] regs = new String [] {"sumPayFee(\"" + prodId + "\""
				,"ACCTITEM_"+prodId
				,"acctitem("+prodId
				,"(acctitem_id=\""+prodId+"\""
				,"payMonthsOfToday(\""+prodId+"\""}; 
		
		//查找本身是触发促销的条件的,
//		if(CollectionHelper.isEmpty(result)){
			list = cPromotionDao.queryPromotionCanCancelAsCondition(userId,prodId,getOptr().getCounty_id());
			Map<String, List<CPromotionDto>> mapKeyByRuleStr = CollectionHelper.converToMap(list, "promotion_sn");// rule_id的假名
			//数目不多,一个嵌套循环问题不大
			for(String ruleId:mapKeyByRuleStr.keySet()){
				List<CPromotionDto> list3 = mapKeyByRuleStr.get(ruleId);
				String ruleStr = null;
				if(CollectionHelper.isNotEmpty(list3)){
					ruleStr = list3.get(0).getIs_necessary();
					for(String reg:regs){
						if(ruleStr.indexOf(reg)>=0){
							result.clear();
							result.addAll(list3);
						}
					}
				}
			}
//		}
		
		return result;
	}
	
	/**
	 * @param countyId
	 * @return
	 */
	public List<ChangedUser> queryChangedUserInfo(String beginDate, String endDate,String countyId) throws JDBCException {
		List<ChangedUser> userList = new ArrayList<ChangedUser>();
		if(StringHelper.isNotEmpty(beginDate)){
			if(StringHelper.isEmpty(endDate)){
				endDate = DateHelper.formatNow();
			}
//			List<ChangedUser> addedUsers = cUserDao.queryAddedUsers(beginDate,endDate,countyId);
			List<ChangedUser> modifiedUsers = cUserDao.queryModifiedUsers(beginDate,endDate,countyId);
//			List<ChangedUser> deletedUsers = cUserDao.queryDeletedUsers(beginDate,endDate,countyId);
//			userList.addAll(addedUsers);
			userList.addAll(modifiedUsers);
//			userList.addAll(deletedUsers);
		}/*else{
			userList = cUserDao.queryChangedUserInfo(countyId);
		}*/
		return userList;
	}
	
	/**
	 * @param deviceId
	 * @param returnTvRecordCount
	 * @param returnVodRecordCount
	 * @return
	 */
	public List<UserBillDto> queryUserBill(String deviceId,
			Integer returnTvRecordCount, Integer returnVodRecordCount) throws Exception {
		return cUserDao.queryUserBill(deviceId,returnTvRecordCount,returnVodRecordCount,getOptr().getCounty_id());
	}

	public List<CUser> queryUserByCustNo(String custNo) throws Exception{
		CCust cust = cCustDao.queryCustFullInfo("CUST_NO", custNo, "1=1");
		List<CUser> userList = queryUserByCustId(cust.getCust_id());
		fillUserName(userList);
		return userList;
	}
	
	public List<CUser> queryUserByUserIds(List<String> userIds) throws Exception{
		return cUserDao.queryUserByUserIds(userIds.toArray(new String[userIds.size()]));
	}
	
	public List<CUser> queryAllUserByUserIds(String[] userIds) throws JDBCException {
		List<CUser> users= new ArrayList<CUser>();
		users.addAll(cUserAtvDao.queryAtvByUserIds(userIds));
		users.addAll(cUserDtvDao.queryDtvByUserIds(userIds));
		users.addAll(cUserBroadbandDao.queryBandByUserIds(userIds));
		fillUserName(users);
		return users;
	}
	
	public List<CUser> queryAllUserHisByUserIds(String[] userIds) throws JDBCException {
		List<CUser> users= new ArrayList<CUser>();
		users.addAll(cUserAtvDao.queryAtvHisByUserIds(userIds));
		users.addAll(cUserDtvDao.queryDtvHisByUserIds(userIds));
		users.addAll(cUserBroadbandDao.queryBandHisByUserIds(userIds));
		fillUserName(users);
		return users;
	}
	
	public void updateUserStatus(List<CUser> userList,
			List<CUserPropChange> upcList, List<CDoneCode> dcList,
			List<CDoneCodeDetail> dcdList) throws Exception {
		cUserDao.update(userList.toArray(new CUser[userList.size()]));
		cUserPropChangeDao.save(upcList.toArray(new CUserPropChange[upcList.size()]));
		cDoneCodeDao.save(dcList.toArray(new CDoneCode[dcList.size()]));
		cDoneCodeDetailDao.save(dcdList.toArray(new CDoneCodeDetail[dcdList.size()]));
	}
	
	
	/**
	 * @param doneCode
	 * @param busiCode
	 * @param oldUser
	 * @param newCustId
	 * @param newUserId
	 * @param forceAsZZD 强制将所有的设置为主终端.
	 * @throws Exception
	 */
	public void updateUser(Integer doneCode, String busiCode, CUser oldUser,
			String newCustId, String newUserId,boolean forceAsZZD) throws Exception {
		
		CUser newUser = new CUser();
		BeanUtils.copyProperties(oldUser, newUser);
		newUser.setUser_id(newUserId);
		newUser.setCust_id(newCustId);
		newUser.setUser_name(forceAsZZD?"主终端":oldUser.getUser_name());
		cUserDao.save(newUser);
		
		List<CUserPropChange> changeList = new ArrayList<CUserPropChange>();
		CUserPropChange change = new CUserPropChange();
		
		String oldUserId = oldUser.getUser_id();
		String oldCustId = oldUser.getCust_id();
		String userType = oldUser.getUser_type();
		if(userType.equals(SystemConstants.USER_TYPE_DTV)){
			CUserDtv oldUserDtv = cUserDtvDao.findByKey(oldUserId);
			CUserDtv newUserDtv = new CUserDtv();
			BeanUtils.copyProperties(oldUserDtv, newUserDtv);
			newUserDtv.setUser_id(newUserId);
			
			if(!oldUserDtv.getTerminal_type().equals(SystemConstants.USER_TERMINAL_TYPE_ZZD) && forceAsZZD ){//
				change = new CUserPropChange();
				change.setDone_code(doneCode);
				change.setUser_id(newUserId);
				change.setColumn_name("terminal_type");
				change.setOld_value(oldUserDtv.getTerminal_type());
				change.setNew_value(SystemConstants.USER_TERMINAL_TYPE_ZZD);
				change.setBusi_code(busiCode);
				setBaseInfo(change);
				changeList.add(change);
			}
			if(forceAsZZD){
				newUserDtv.setTerminal_type(SystemConstants.USER_TERMINAL_TYPE_ZZD);
			}
			cUserDtvDao.save(newUserDtv);
		} else if(userType.equals(SystemConstants.USER_TYPE_ATV)){
			CUserAtv oldUserAtv = cUserAtvDao.findByKey(oldUserId);
			CUserAtv newUserAtv = new CUserAtv();
			BeanUtils.copyProperties(oldUserAtv, newUserAtv);
			newUserAtv.setUser_id(newUserId);
			newUserAtv.setTerminal_type(SystemConstants.USER_TERMINAL_TYPE_ZZD);
			cUserAtvDao.save(newUserAtv);
		} else if(userType.equals(SystemConstants.USER_TYPE_BAND)){
			CUserBroadband oldUserBand = cUserBroadbandDao.findByKey(oldUserId);
			CUserBroadband newUserBand = new CUserBroadband();
			BeanUtils.copyProperties(oldUserBand, newUserBand);
			newUserBand.setUser_id(newUserId);
			cUserBroadbandDao.save(newUserBand);
		}
		
		change.setDone_code(doneCode);
		change.setUser_id(newUserId);
		change.setColumn_name("user_id");
		change.setOld_value(oldUserId);
		change.setNew_value(newUserId);
		change.setBusi_code(busiCode);
		setBaseInfo(change);
		changeList.add(change);
		
		change = new CUserPropChange();
		change.setDone_code(doneCode);
		change.setUser_id(newUserId);
		change.setColumn_name("cust_id");
		change.setOld_value(oldCustId);
		change.setNew_value(newCustId);
		change.setBusi_code(busiCode);
		setBaseInfo(change);
		changeList.add(change);
		
		cUserPropChangeDao.save(changeList.toArray(new CUserPropChange[changeList.size()]));
		
		jUserStopDao.updateByUserId(oldUserId, newUserId);
		
		cUserDao.updateProdInclude(oldUserId, oldCustId, newUserId, newCustId);
		
		this.removeUserWithHis(doneCode, oldUser);
	}
	
	/**
	 * 加一点说明,以前的要求就是所有的都修改为主终端.
	 * @param doneCode
	 * @param busiCode
	 * @param oldUser
	 * @param newCustId
	 * @param newUserId
	 * @throws Exception
	 */
	public void updateUser(Integer doneCode, String busiCode, CUser oldUser,
			String newCustId, String newUserId) throws Exception {
		updateUser(doneCode, busiCode, oldUser, newCustId, newUserId,true);
	}
	
	public void renewUser(Integer doneCode, String userId) throws Exception {
		CUser user = cUserDao.findByKey(userId);
		CUserPropChange upc = cUserPropChangeDao.queryLastStatus(userId, getOptr().getCounty_id());
		//恢复用户状态，取最近状态异动：如果最近状态异动为报停，则新状态为报停，否则均为正常
		String newValue = (upc != null && upc.getOld_value().equals(StatusConstants.REQSTOP)) ? upc.getOld_value() : StatusConstants.ACTIVE;
		
		List<CUserPropChange> upcList = new ArrayList<CUserPropChange>();
		upc = new CUserPropChange();
		upc.setUser_id(userId);
		upc.setDone_code(doneCode);
		upc.setColumn_name("status");
		upc.setOld_value(user.getStatus());
		upc.setNew_value(newValue);
		setBaseInfo(upc);
		upcList.add(upc);
		
		Date date = new Date();
		upc = new CUserPropChange();
		upc.setUser_id(userId);
		upc.setDone_code(doneCode);
		upc.setColumn_name("status_date");
		upc.setOld_value(DateHelper.dateToStr(user.getStatus_date()));
		upc.setNew_value(DateHelper.dateToStr(date));
		setBaseInfo(upc);
		upcList.add(upc);
		
		editUser(doneCode, userId, upcList);
	}
	
	/**
	 * @param userId
	 * @return
	 */
	public String queryUserLastStatus(String userId) throws Exception {
		return cUserPropChangeDao.queryUserLastStatus(userId,getOptr().getCounty_id());
	}


	/**
	 * 查询本地区可用的套餐
	 * @return
	 */
	public List<PPromFee> querySelectablePromPay() throws Exception {
		return pPromFeeDao.querySelectablePromPay(getOptr().getCounty_id());
	}
	
	/**
	 * 查询套餐缴费的基本信息.
	 * @param promfeeId
	 * @return
	 * @throws Exception
	 */
	public PPromFee queryPromFeeSimpleInfo(String promfeeId) throws Exception{
		return pPromFeeDao.findByKey(promfeeId);
	}
	
	/**
	 * 查找上月和当月的有效套餐缴费
	 * @param userId
	 * @param prodId
	 * @return
	 * @throws JDBCException
	 */
	public List<PPromFee> queryIsPromFee(String userId,String prodId) throws JDBCException {
		return pPromFeeDao.queryIsPromFee(userId,prodId);
	}
	
	/**
	 * 查看该产品属进行的套餐缴费列
	 * @param userId
	 * @param prodSn
	 * @return
	 * @throws Exception
	 */
	public List<CPromProdRefund> querySelectPromFee(String userId,String prodSn) throws Exception {
		return cPromProdRefundDao.querySelectPromFee(userId,prodSn,getOptr().getCounty_id());
	}

	/**
	 * 根据套餐编号查询套餐
	 * @param promFeeId
	 * @return
	 * @throws Exception
	 */
	public List<PPromFeeUser> queryPromFeeUser(String promFeeId) throws Exception{
		return pPromFeeUserDao.queryPromFeeUser(promFeeId);
	}
	
	/**
	 * 根据多个套餐编号查询套餐规则用户
	 * @param promFeeIds
	 * @return
	 * @throws Exception
	 */
	public List<PPromFeeUser> queryPromFeeUser(String[] promFeeIds) throws Exception{
		return pPromFeeUserDao.queryPromFeeUser(promFeeIds);
	}
	
	/**
	 * 查询多个套餐信息
	 * @param promFeeIds
	 * @param custId
	 * @param countyId
	 * @return
	 * @throws Exception
	 */
	public List<CPromFee> queryPromFee(String[] promFeeIds,String custId,String countyId) throws Exception{
		return cPromFeeDao.queryPromFee(promFeeIds,custId,countyId);
	}
	
	/**
	 * 根据套餐编号查套餐信息
	 * @param promFeeId
	 * @return
	 * @throws Exception
	 */
	public List<PromFeeProdDto> queryPromFeeProds(String promFeeId) throws Exception{
		return pPromFeeProdDao.queryPromFeeProds(promFeeId);
	}

	/**
	 * 根据多个产品编号查询动态资源组信息
	 * @param ProdIds
	 * @return
	 * @throws Exception
	 */
	public List<ResGroupDto> queryGroupByProdIds(String[] ProdIds)throws Exception {
		return pPromFeeProdDao.queryGroupByProdIds(ProdIds);
	}
	
	/**
	 * 根据多个资源组编号查询资源信息
	 * @param resGroupId
	 * @return
	 * @throws Exception
	 */
	public List<PRes> queryResByGroupId(String[] resGroupId)throws Exception {
		return pPromFeeProdDao.queryResByGroupId(resGroupId);
	}
	/**
	 * 调用存储过程，批量销用户
	 * @param userIds
	 */
	public void batchLogoffUser(Integer doneCode,String remark,List<String> userIds,String isReclaimDevice,String deviceStatus) throws Exception {
		cUserDao.batchLogoffUser(doneCode,remark,userIds,isReclaimDevice,deviceStatus,getOptr());
	}
	
	public Pager<UserDto> queryUserInfoToCallCenter(Pager<Map<String ,Object>> p) throws Exception{
		Pager<UserDto> pager = cUserDao.queryUserInfoToCallCenter(p,getOptr().getCounty_id());
		List<UserDto> userList = pager.getRecords();
		for( UserDto user :userList){
			if("DTV".equals(user.getUser_type())){
				if (StringHelper.isEmpty(user.getUser_name()))
					user.setUser_name(MemoryDict.getDictName(DictKey.TERMINAL_TYPE,user.getTerminal_type()));
			}else if("BAND".equals(user.getUser_type())){
				user.setUser_name(user.getLogin_name());
			}else if("ATV".equals(user.getUser_type())){
				if (StringHelper.isEmpty(user.getUser_name()))
					user.setUser_name("模拟终端");
			}
		}
		return pager;
	}
	
	public void addUserCfg(CUser user) throws Exception{
		CCust cust = cCustDao.findByKey(user.getCust_id());
		String year = String.valueOf(DateHelper.getCurrYear());
		List<TCustColonyCfg> cfgList = tCustColonyCfgDao.queryCfg(year,true,true, cust.getCust_colony(),cust.getCust_class(), cust.getCounty_id());
		boolean key = false;
		TCustColonyCfg cfg = new TCustColonyCfg();
		for(TCustColonyCfg dto:cfgList){
			int num = tCustColonyCfgDao.queryUserNum(year, dto.getCust_colony(), dto.getCust_class(), cust.getCounty_id());
			if(dto.getUser_num() == 0 || dto.getUser_num()+1> num){
				continue;
			}else{
				key = true;
				cfg = dto;
				break;
			}
		}
		if(key){
			throw new ComponentException(year+"年份的["+cfg.getCust_colony_text()+"]["+cfg.getCust_class_text()+"]的用户开户限额:["+cfg.getUser_num()+"]已满!");
		}
	}
	
	public String queryMinUserId(String custId) throws Exception {
		return cUserDao.queryMinUserId(custId);
	}
	
	public void changeCust(String userId, String toCustId,Integer doneCode ,String busiCode) throws ServicesException{
		this.cUserDao.callChangeCust(userId, toCustId, doneCode, busiCode,this.getOptr());
	}
	
	public void setCUserDao(CUserDao userDao) {
		cUserDao = userDao;
	}

	public void setCUserAtvDao(CUserAtvDao userAtvDao) {
		cUserAtvDao = userAtvDao;
	}

	public void setCUserDtvDao(CUserDtvDao userDtvDao) {
		cUserDtvDao = userDtvDao;
	}

	/**
	 * @param userBroadbandDao the cUserBroadbandDao to set
	 */
	public void setCUserBroadbandDao(CUserBroadbandDao userBroadbandDao) {
		cUserBroadbandDao = userBroadbandDao;
	}

	public void setCUserPropChangeDao(CUserPropChangeDao userPropChangeDao) {
		cUserPropChangeDao = userPropChangeDao;
	}

	public void setCUserHisDao(CUserHisDao userHisDao) {
		cUserHisDao = userHisDao;
	}

	public void setSOptrDao(SOptrDao optrDao) {
		sOptrDao = optrDao;
	}

	public void setCUserAtvHisDao(CUserAtvHisDao userAtvHisDao) {
		cUserAtvHisDao = userAtvHisDao;
	}

	public void setCUserDtvHisDao(CUserDtvHisDao userDtvHisDao) {
		cUserDtvHisDao = userDtvHisDao;
	}

	public void setCUserBroadbandHisDao(CUserBroadbandHisDao userBroadbandHisDao) {
		cUserBroadbandHisDao = userBroadbandHisDao;
	}

	public void setCRejectResDao(CRejectResDao rejectResDao) {
		cRejectResDao = rejectResDao;
	}

	public void setJUserStopDao(JUserStopDao userStopDao){
		jUserStopDao = userStopDao;
	}

	public void setCPromotionDao(CPromotionDao promotionDao) {
		cPromotionDao = promotionDao;
	}

	public void setCCustDao(CCustDao custDao) {
		cCustDao = custDao;
	}

	public void setPPromFeeDao(PPromFeeDao pPromFeeDao) {
		this.pPromFeeDao = pPromFeeDao;
	}

	public void setPPromFeeUserDao(PPromFeeUserDao pPromFeeUserDao) {
		this.pPromFeeUserDao = pPromFeeUserDao;
	}
	public void setPPromFeeProdDao(PPromFeeProdDao pPromFeeProdDao) {
		this.pPromFeeProdDao = pPromFeeProdDao;
	}
	
	public void setRDeviceDao(RDeviceDao deviceDao) {
		rDeviceDao = deviceDao;
	}
	public void setCPromFeeDao(CPromFeeDao cPromFeeDao) {
		this.cPromFeeDao = cPromFeeDao;
	}

	public void setTCustColonyCfgDao(TCustColonyCfgDao custColonyCfgDao) {
		tCustColonyCfgDao = custColonyCfgDao;
	}

	public void setCPromProdRefundDao(CPromProdRefundDao promProdRefundDao) {
		cPromProdRefundDao = promProdRefundDao;
	}

	/**
	 * 查找用户数量
	 * @param custId
	 * @return
	 */
	public Integer queryUserCount(String custId) throws Exception {
		return cUserDao.queryUserCount(custId);
	}

	/**
	 * @param optr_id
	 * @return
	 */
	public SOptr queryOptrById(String optr_id) throws Exception{
		return sOptrDao.findByKey(optr_id);
	}
	public String toUtilValue(String custId,String userId,String tariffId,List<ProdTariffDto> tariffList) throws Exception{
		//查找用户基本信息
		CUser user = cUserDao.findByKey(userId);
		if (user == null)
			throw new ComponentException("用户不存在userId="+userId);
		CCust cust = cCustDao.findByKey(custId);
		if (cust == null)
			throw new ComponentException("客户不存在custId="+user.getCust_id());
		CUserAtv userAtv = new CUserAtv();
		CUserDtv userDtv = new CUserDtv();
		CUserBroadband userBroadband = new CUserBroadband();
		if (user.getUser_type().equals(SystemConstants.USER_TYPE_ATV))
			userAtv = cUserAtvDao.queryAtvById(user.getUser_id());
		else if (user.getUser_type().equals(SystemConstants.USER_TYPE_DTV))
			userDtv =  cUserDtvDao.queryDtvById(user.getUser_id());
		else if (user.getUser_type().equals(SystemConstants.USER_TYPE_BAND))
			userBroadband = cUserBroadbandDao.queryBandById(user.getUser_id());
		List<CFee> feeList = cFeeDao.queryUserFee(user.getCust_id(),userId);
		List<AcctitemDto> balanceList = cAcctAcctitemDao.queryAcctAndAcctItemByUserId(custId,userId,user.getCounty_id());
		List<CProdDto> prodList = cProdDao.queryUserProd(userId, user.getCounty_id());
		expressionUtil.setAllValue(cust, user, userDtv, userAtv,userBroadband, feeList, balanceList,prodList);
		expressionUtil.setCuserStb(cUserDao.queryUserStbByUserId(userId));
		String flag = "F";
		for (int i = tariffList.size() - 1; i >= 0; i--) {
			ProdTariffDto tariff = tariffList.get(i);
			if(StringHelper.isNotEmpty(tariff.getRule_id())){
				if (expressionUtil.parseBoolean(tariff.getRule_id_text())){
					if( tariff.getTariff_id().equals(tariffId)){
						flag = "T";
						break;
					}else{
						flag = tariff.getTariff_id();
					}
				}
			}else{
				if( tariff.getTariff_id().equals(tariffId)){
					flag = "T";
					break;
				}else{
					flag = tariff.getTariff_id();
				}
			}
		}
		return flag;
	}

	public void setExpressionUtil(ExpressionUtil expressionUtil) {
		this.expressionUtil = expressionUtil;
	}

	public void setCFeeDao(CFeeDao feeDao) {
		cFeeDao = feeDao;
	}
	
}
