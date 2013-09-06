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
	private CallbackContext cbContext = null;
	
	boolean isFirstLoc = true;//是否首次定位
	
    @Override
    public boolean execute(
        String action, JSONArray args, CallbackContext callbackContext
    ) throws JSONException {
    	cbContext = callbackContext;
        if (action.equals("get")) {
        	
            // test before
        	cordova.getActivity().runOnUiThread(new RunnableLoc());

            return true;
        }
        else if (action.equals("stop")) {
        	mLocClient.stop();
        	Log.d("Map", " Plugin execute stop");
            callbackContext.success();
            
        } 
        else {    
            callbackContext.error("test-other-exception");
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
            option.setScanSpan(3000); // 自动定位时间
            
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
				
				String str = "Latitude:" + location.getLatitude() + "\n" 
						+ "Longitude" + location.getLongitude() + "\n" 
						+ "LocType" + location.getLocType();
				
				Log.d("requestMapData", str);
				
	        
				cbContext.success(jsonObj);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				Log.d("requestMapData", "fail in listener");
				cbContext.error("unkown-error");
			}
			
		}
		

		public void onReceivePoi(BDLocation poiLocation) {
			// TODO Auto-generated method stub
			Log.d("requestMapData", "dont know what's this");
			cbContext.error("unkown-error");
		}
		

	}
}

