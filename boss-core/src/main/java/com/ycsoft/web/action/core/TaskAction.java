package com.ycsoft.web.action.core;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;

import com.ycsoft.beans.task.WTaskBaseInfo;
import com.ycsoft.business.dto.core.cust.QueryTaskConditionDto;
import com.ycsoft.business.service.ITaskService;
import com.ycsoft.web.commons.abstracts.BaseBusiAction;

/** 
 * 
 * 工单控制器
 * 
 */
@Controller
public class TaskAction extends BaseBusiAction{

	private ITaskService taskService;
	
	private String [] task_ids;
	private String [] cust_ids;
	
	private WTaskBaseInfo task;
	private String[] materials;
	private String task_id;
	private String booksTime;
	private String taskCustName;
	private String tel;
	private String remark;
	private String cancelRemark;
	private QueryTaskConditionDto taskCond;
	private String bugCause;


	public String saveBugTask()throws Exception{
		String bugCause = request.getParameter("bugCause");
		taskService.saveBugTask(bugCause);
		return JSON_SUCCESS;	
	}
	
	
	public String saveNewTask()throws Exception{
		taskService.saveNewTask();
		return JSON_SUCCESS;	
	}
	
	/**
	 * 查询工单打印信息
	 * @return
	 * @throws Exception
	 */
	public String queryPrintContent()throws Exception{
		String [] tasks = request.getParameterValues("tasks");
		if(tasks == null || tasks.length == 0){
			return JSON_RECORDS;
		}
		String[] task_types = new String[tasks.length];
		task_ids = new String[tasks.length];
		cust_ids = new String[tasks.length];
		for (int i = 0 ; i < tasks.length; i++) {
			String [] tmp = tasks[i].split("#");
			task_types[i] = tmp[0];
			cust_ids[i] = tmp[1];
			task_ids[i] = tmp[2];
		}
		List<Map<String,Object>> records = taskService.queryPrintContent(task_types, cust_ids, task_ids);
		getRoot().setRecords(records);
		return JSON_RECORDS;
	}

	/**
	 * 查询工单
	 * @return
	 * @throws Exception
	 */
	public String queryTasks()throws Exception{
		if(taskCond == null){
			return JSON_PAGE;
		}
		taskCond.setStart(start);
		taskCond.setLimit(limit);
		getRoot().setPage(taskService.queryTask(taskCond));
		return JSON_PAGE;
	}
	
	public String getTaskType() throws Exception{
		getRoot().setRecords(taskService.getTaskType());
		return JSON_RECORDS;
	}
	
	public String cancelTask()throws Exception{
		taskService.cancelTask(this.task_ids,cancelRemark);
		getRoot().setSuccess(true);
		return JSON_SUCCESS;
	}
	
	public String assignTask()throws Exception{		
		taskService.assignTask(this.task_ids);
		getRoot().setSuccess(true);
		return JSON_SUCCESS;
	}
	
	public String modifyTask() throws Exception{
		taskService.modifyTask(task_id,booksTime,taskCustName,tel,remark,bugCause);
		return JSON_SUCCESS;
	}
	
	
	/**
	 * @return the cust_ids
	 */
	public String[] getCust_ids() {
		return cust_ids;
	}

	/**
	 * @param cust_ids the cust_ids to set
	 */
	public void setCust_ids(String[] cust_ids) {
		this.cust_ids = cust_ids;
	}
	
	/**
	 * @return the task_ids
	 */
	public String[] getTask_ids() {
		return task_ids;
	}

	/**
	 * @param task_ids the task_ids to set
	 */
	public void setTask_ids(String[] task_ids) {
		this.task_ids = task_ids;
	}
	
	/**
	 * @return the taskService
	 */
	public ITaskService getTaskService() {
		return taskService;
	}


	/**
	 * @param taskService the taskService to set
	 */
	public void setTaskService(ITaskService taskService) {
		this.taskService = taskService;
	}

	public WTaskBaseInfo getTask() {
		return task;
	}

	public void setTask(WTaskBaseInfo task) {
		this.task = task;
	}
	
	public String getCancelRemark() {
		return cancelRemark;
	}


	public void setCancelRemark(String cancelRemark) {
		this.cancelRemark = cancelRemark;
	}


	public QueryTaskConditionDto getTaskCond() {
		return taskCond;
	}


	public void setTaskCond(QueryTaskConditionDto taskCond) {
		this.taskCond = taskCond;
	}


	public String[] getMaterials() {
		return materials;
	}

	public void setMaterials(String[] materials) {
		this.materials = materials;
	}

	public String getTask_id() {
		return task_id;
	}

	public void setTask_id(String task_id) {
		this.task_id = task_id;
	}


	public String getBooksTime() {
		return booksTime;
	}


	public void setBooksTime(String booksTime) {
		this.booksTime = booksTime;
	}


	public String getTaskCustName() {
		return taskCustName;
	}


	public void setTaskCustName(String taskCustName) {
		this.taskCustName = taskCustName;
	}


	public String getTel() {
		return tel;
	}


	public void setTel(String tel) {
		this.tel = tel;
	}


	public String getRemark() {
		return remark;
	}


	public void setRemark(String remark) {
		this.remark = remark;
	}


	public String getBugCause() {
		return bugCause;
	}


	public void setBugCause(String bugCause) {
		this.bugCause = bugCause;
	}


}
