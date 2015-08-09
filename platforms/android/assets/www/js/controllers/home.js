angular.module('starter.controllers')
  .controller('homeCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$timeout', '$cordovaInAppBrowser', '$window', '$cordovaSpinnerDialog', '$cordovaToast', '$interval', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $timeout, $cordovaInAppBrowser, $window, $cordovaSpinnerDialog, $cordovaToast, $interval){

    // req home 요청
    $scope.is_online = true;

    $scope.$on('update_view', function(event, vid) {

      for(var i=0; i<$scope.home_container.length; i++) {
	for(var k=0; k<$scope.home_container[i].video_container.length; k++) {
	  if($scope.home_container[i].video_container[k]._id == vid) {
	    $scope.home_container[i].video_container[k].is_view = true;
	  }
	}
      }
      
    });
    

    /*
    $http.get('http://s.05day.com/home').
      success(function(data, status, headers, config) {
	var rtn = data;
	$scope.home_container = rtn.home_container;
	//alert(home_container.length);
	//alert(home_container[0].video_container[0].img);
	
	//alert(rtn.result);
	//$rootScope.track('home');
	var analytics = navigator.analytics;
	analytics.setTrackingId('UA-65058003-1');
	analytics.sendAppView('home', function() {}, function() {alert('anaytics 오류');});
      }).
      error(function(data, status, headers, config) {
	$cordovaToast.showShortCenter('home에서 네트워크 상태 불안정');
	$scope.is_online = false;
	//alert('[error] 홈 요청중');
      });
    */
    /*
    var promise2 = null;
    var acquire_uuid = function() {
      promise2 = $interval(function() {
	if($rootScope.user_info.device.uuid != -1) {
	  $interval.cancel(promise2);
	} else {
	  alert('[debug] uuid 없음');
	  $rootScope.user_info.device.uuid = $cordovaDevice.getUUID();
	}
      }, 1000);
    };
    acquire_uuid();
    */

    
    $scope.$on('refreshHome', function() {
      $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);

      var uid = $scope.user_info.device.uuid;
      if($scope.user_info.fb.id != -1) {
	uid = $scope.user_info.fb.id;
      }
      var req_url = 'http://s.05day.com/home/' + uid;
      
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  var rtn = data;
	  $scope.home_container = rtn.home_container;

	  /*
	  for(var i=0; i<$scope.home_container.length; i++) {
	    for(var k=0; k<$scope.home_container[i].video_container.length; k++) {
	      alert($scope.home_container[i].video_container[k].is_view);
	      if($scope.home_container[i].video_container[k].is_view) {
		alert('찾음');
	      }
	    }
	  }
	  */

	  //alert(home_container.length);
	  //alert(home_container[0].video_container[0].img);
	  //alert(rtn.result);
	  $cordovaSpinnerDialog.hide();
	  $ionicScrollDelegate.scrollTop(true);
	  //$rootScope.track('home');
	  $rootScope.update_dailyquiz($rootScope.q.lv, false);
	  var analytics = navigator.analytics;
	  analytics.setTrackingId('UA-65058003-1');
	  analytics.sendAppView('home', function() {}, function() {alert('anaytics 오류');});
	}).
	error(function(data, status, headers, config) {
	  //alert('[error] 홈 요청중');
	  $cordovaSpinnerDialog.hide();
	  $cordovaToast.showShortCenter('home에서 네트워크 상태 불안정');
	});

    });

    /*  
    $scope.$on('cordovaPauseEvent', function() {
      $cordovaInAppBrowser.close();
    });
    
    $rootScope.is_watch_video = false;
    $scope.$on('cordovaResumeEvent', function() {
      var options = {
	location: 'no',
	clearcache: 'yes',
	toolbar: 'no'
      };

      if($rootScope.is_watch_video) {
	$cordovaInAppBrowser.open($scope.url, '_blank', options)
	  .then(function(event) {
	  })
	  .catch(function(event) {
	  });
      }
    });
     */
    /*
    $scope.watchVideo = function(parent, child, vid) {
      $rootScope.is_watch_video = true;

      if(ionic.Platform.isIOS()) {
	var options = {
	  location: 'no',
	  clearcache: 'yes',
	  toolbar: 'no',
	  allowInlineMediaPlayback: 'yes'
	};
      } else {
	options = {
	  location: 'no',
	  clearcache: 'yes',
	  toolbar: 'no'
	};
      }

      $scope.url = 'http://112.219.140.178:3004/#/v/' + parent + '/' + child + '/' + vid + '/1234';
      
      document.addEventListener("deviceready", function () {

	$cordovaInAppBrowser.open($scope.url, '_blank', options)
	  .then(function(event) {
            // success
	  })
	  .catch(function(event) {
            // error
	  });

	$rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event) {
	  if (event.url.match("http://pp2.com")) {
	    $rootScope.is_watch_video = false;
            $cordovaInAppBrowser.close();
	  } else {
	    $scope.url = event.url;
	  }
	});
	$rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event) {
	  if (event.url.match("http://pp2.com")) {
	    $rootScope.is_watch_video = false;
	  } else {
	    $scope.url = event.url;
	  }
	});
      }, false);
    };
    */ 

    $scope.goParentChild = function(parent) {
      $window.location.href = '#/app/home/parent-child/' + parent;
    };


    $scope.reconnect = function() {
      if($rootScope.network.is_online) {

	// 유저 정보 또한 갱신한다.

	var uid = $scope.user_info.device.uuid;
	if($scope.user_info.fb.id != -1) {
	  uid = $scope.user_info.fb.id;
	}
	var req_url = 'http://s.05day.com/home/' + uid;
	
	$scope.is_online = true;
	$http.get(req_url).
	  success(function(data, status, headers, config) {
	    var rtn = data;
	    $scope.home_container = rtn.home_container;
	    $rootScope.get_user_info();
	    //alert(home_container.length);
	    //alert(home_container[0].video_container[0].img);
	    
	    //alert(rtn.result);

	  }).
	  error(function(data, status, headers, config) {
	    $scope.is_online = false;
	  });
      } else {
	$scope.is_online = false;
	$cordovaToast.showShortCenter('오프라인 상태입니다');
      }
    };
     
    
  }]);
