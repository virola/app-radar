package com.fulstore.plugin.BaiduLoc;

import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;


import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class BaiduLocPlugin extends CordovaPlugin {
	private LocationClient mLocationClient = null;
	private MyLocationListenner myListener = new MyLocationListenner();
	private JSONObject jsonObj = new JSONObject(); 
	private CallbackContext cbContext = null;
	
    @Override
    public boolean execute(
        String action, JSONArray args, CallbackContext callbackContext
    ) throws JSONException {
    	cbContext = callbackContext;
        if (action.equals("get")) {

            // test before
            cordova.getActivity().runOnUiThread(new RunnableLoc());

            callbackContext.success();
            return true;
        }
        else if (action.equals("stop")) {
            mLocationClient.stop();
            callbackContext.error("test-stop");
        } 
        else {    
            callbackContext.error("test-other-exception");
        }
        
		return false;
        
      
    }
	
	@Override
    public void onDestroy(){
    	if (mLocationClient != null && mLocationClient.isStarted()){
    		mLocationClient.stop();
    		mLocationClient = null;
    	}
    	super.onDestroy();
    }
	
	
	class RunnableLoc implements Runnable {
				
		public void run() {
			mLocationClient = new LocationClient(cordova.getActivity());
			LocationClientOption option = new LocationClientOption();
			
	        option.setOpenGps(false);							
	        option.setCoorType("bd09ll");							
	        option.setPriority(LocationClientOption.NetWorkFirst);	
	        option.setProdName("BaiduLoc");							
	        option.setScanSpan(5000);								
	        mLocationClient.setLocOption(option);
	        
        	mLocationClient.registerLocationListener( myListener );
        	mLocationClient.start();
            mLocationClient.requestLocation();
            
		}

	}
    
    
	public class MyLocationListenner implements BDLocationListener {
			
			public void onReceiveLocation(BDLocation location) {
				if (location == null)
					return;			
				
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
					
					
					
					cbContext.success();
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					
					cbContext.error("unkown-error");
				}
				
			}
			
	
			public void onReceivePoi(BDLocation poiLocation) {
				// TODO Auto-generated method stub
				
				cbContext.error("unkown-error");
			}
			
	
		}
	

}

