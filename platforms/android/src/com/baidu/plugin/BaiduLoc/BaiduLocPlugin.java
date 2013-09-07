package com.baidu.plugin.BaiduLoc;

import android.util.Log;

import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;

import com.baidu.mapapi.map.LocationData;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class BaiduLocPlugin extends CordovaPlugin {
	
	// 定位相关
	LocationClient mLocClient;
	public MyLocationListenner myListener = new MyLocationListenner();
		
	private JSONObject jsonObj = new JSONObject(); 
	private CallbackContext cbContext;
	
	boolean isFinishRun = false;//是否完成UI线程

	
    @Override
    public boolean execute(
        String action, JSONArray args, CallbackContext callbackContext
    ) throws JSONException {
        if (action.equals("get")) {
        	
        	this.cbContext = callbackContext;
            // test before
        	cordova.getActivity().runOnUiThread(new RunnableLoc());

            return true;
        }
        else if (action.equals("stop")) {
        	mLocClient.stop();
            callbackContext.success();
            isFinishRun = true;
            
        } 
        else {    
            callbackContext.error("test-other-exception");
            isFinishRun = true;
        }

        while (!isFinishRun) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                // ignoring exception, since we have to wait
                // ui thread to finish
            }
        }
        
		return false;
        
      
    }
	
	@Override
    public void onDestroy(){
    	if (mLocClient != null && mLocClient.isStarted()){
    		mLocClient.stop();
    		mLocClient = null;
    	}
    	super.onDestroy();
    }
	
	
	class RunnableLoc implements Runnable {
				
		public void run() {

        	//定位初始化
            mLocClient = new LocationClient( cordova.getActivity() );
            mLocClient.registerLocationListener( myListener );
            
            LocationClientOption option = new LocationClientOption();
            option.setOpenGps(true); // 打开gps
            option.setCoorType("bd09ll");     //设置坐标类型
            option.setScanSpan(5000); // 自动定位时间
            
            mLocClient.setLocOption(option);
            mLocClient.start();
            
            mLocClient.requestLocation();
            
		}

	}
    
    
	public class MyLocationListenner implements BDLocationListener {
		
		public void onReceiveLocation(BDLocation location) {
			if (location == null) {
				return;
			}
			
			try {
				jsonObj.put("Latitude",location.getLatitude());
				jsonObj.put("Longitude", location.getLongitude());
				jsonObj.put("LocType", location.getLocType());
				jsonObj.put("Radius", location.getRadius());
				
				if (location.getLocType() == BDLocation.TypeGpsLocation){
					jsonObj.put("Speed", location.getSpeed());
					jsonObj.put("SatelliteNumber", location.getSatelliteNumber());
				} else if (location.getLocType() == BDLocation.TypeNetWorkLocation){
					jsonObj.put("AddrStr", location.getAddrStr());
				}
				
				// String str = "Latitude:" + location.getLatitude() + "\n" 
				// 		+ "Longitude" + location.getLongitude() + "\n" 
				// 		+ "LocType" + location.getLocType();
				
				// Log.d("requestMapData", str);
				
	        
				cbContext.success(jsonObj);
                isFinishRun = true;

			} catch (JSONException e) {

				cbContext.error("unkown-error");
                isFinishRun = true;
			}
			
		}
		

		public void onReceivePoi(BDLocation poiLocation) {
			// TODO Auto-generated method stub
			Log.d("requestMapData", "dont know what's this");
			cbContext.error("unkown-error");
            isFinishRun = true;
		}
		

	}
}

