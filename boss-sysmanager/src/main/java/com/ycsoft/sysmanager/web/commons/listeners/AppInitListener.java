package com.ycsoft.sysmanager.web.commons.listeners;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;

import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.ycsoft.business.dao.system.SItemvalueDao;
import com.ycsoft.commons.store.MemoryDict;
import com.ycsoft.daos.core.JDBCException;

/**
 * 容器启动的监听器,完成系统初始化工作。 包括配置文件、系统参数等初始化。
 *
 * @author hh
 * @date Mar 12, 2010 9:23:35 AM
 */
public class AppInitListener implements javax.servlet.ServletContextListener {


	/**
	 * 构造监听器
	 */
	public AppInitListener(){}


	/**
	 * 实现容器初始化的函数
	 */
	public void contextInitialized(ServletContextEvent sce) {
		initComponent(sce.getServletContext());
	}

	/**
	 * 配置文件参数
	 */
	private void configuration()throws Exception{

	}

	/**
	 * 初始化查询组建，从Spring 管理的Bean中获取
	 * @param sc
	 * @throws Exception
	 */
	private void initComponent(ServletContext sc){
		WebApplicationContext wc = WebApplicationContextUtils.getWebApplicationContext(sc);
		SItemvalueDao sItemvalueDao = wc.getBean(SItemvalueDao.class);

		try {
			MemoryDict.setupData(sItemvalueDao.findAllViewDict());
		} catch (JDBCException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 实现容器销毁函数
	 */
	public void contextDestroyed(ServletContextEvent sce) {
		System.out.println("容器正在销毁....");
	}
}
