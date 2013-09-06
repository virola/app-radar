window.Location = function(success,fail,act) {
	if(act){
		var action = act;
	}else{
		var action = 'get';
	}

	if (cordova) {
		cordova.exec(function(pos){
			console.log(pos);
			var errcode = pos.LocType;
			if(errcode == 61 || errcode == 65 || errcode == 161){
				success(pos);
			}else{
				fail(errcode);
			}
		},fail,"BaiduLocPlugin", action , []);
	}
	else {
		fail && fail('no cordova');
	}

    
};
