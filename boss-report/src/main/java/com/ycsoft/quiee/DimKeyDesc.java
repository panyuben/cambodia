package com.ycsoft.quiee;

import com.runqian.base4.resources.EngineMessage;
import com.runqian.base4.resources.MessageManager;
import com.runqian.base4.util.ReportError;
import com.runqian.report4.model.expression.Function;
import com.runqian.report4.usermodel.Context;
import com.ycsoft.report.commons.ReportConstants;
import com.ycsoft.report.query.treequery.DimKey;
import com.ycsoft.report.query.treequery.DimKeyContainer;

/**
 * 获取对应key对应的描述
 */
public class DimKeyDesc extends Function{

	@Override
	public Object calculate(Context ctx, boolean inputValue) {
		if (this.paramList.size() != 1) {
			MessageManager mm = EngineMessage.get();
			throw new ReportError("DimKeyDesc:"
					+ mm.getMessage("function.missingParam:格式 dimkeydesc(key)"));
		}
		
		String test_query_id=(String) ctx.getParamValue(ReportConstants.TEST_QUERY_ID);
		String query_id=(String)ctx.getParamValue(ReportConstants.QUERY_ID);
		if(query_id==null||query_id.equals("")){
			try {
				QuieeConstants.initTestDimKey(test_query_id);
			} catch (Exception e1) {
				throw new ReportError("DimKeyDesc:"+e1.getMessage());
			}
		}
		String key=this.paramList.get(0).toString();
		//对应的dim_key要和参数模板传递过来的值一致
		String key_ctx=(String) ctx.getParamValue(key);
		//System.out.println("key_ctx:"+key_ctx);
		DimKey dim_ctx=DimKeyContainer.getDimKey(key_ctx);
		DimKey dim=DimKeyContainer.getDimKey("#"+key+"#");
		     
		if(dim==null){
			MessageManager mm = EngineMessage.get();
			throw new ReportError("DimKeyDesc:"
					+ mm.getMessage("function.missingParam:格式 dimkey(cellvalue,key) key is null or "+key+" is undefined"));
		
		}
		try {
			if(dim_ctx!=null&&!dim_ctx.equals(dim)){
				DimKey pdim=DimKeyContainer.getDimKey(dim.getPkey());				
				while(!dim_ctx.equals(pdim)){
					if(pdim==null){
						MessageManager mm = EngineMessage.get();
						throw new ReportError("DimKeyDesc:"
								+ mm.getMessage("function.ParamError:第二个参数"+key+"和参数模板中配置的变量不一致"));					
					}						 
					pdim=DimKeyContainer.getDimKey(pdim.getPkey());
				}				
				return pdim.getDesc();
			}else{
				return dim.getDesc();
			}
			
		} catch (ReportError e) {
			throw e;
		}catch (Exception e) {
			throw new ReportError("DimKeyDesc:"+e.getMessage());
		}
	}

}
