angular.module('starter.controllers')
  .controller('childCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$stateParams', '$timeout', '$cordovaSpinnerDialog', '$window', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $stateParams, $timeout, $cordovaSpinnerDialog, $window){
    $scope.child = $stateParams.child;
    $scope.parent = $stateParams.parent;
    $scope.v_container = [];
    $scope.is_next = false;
    $scope.title = $scope.parent.toUpperCase() + '-' + $scope.child.toUpperCase();
    $scope.sort = 1;

    $scope.$on('update_view', function(event, vid) {
      for(var i=0; i<$scope.v_container.length; i++) {
	if(vid == $scope.v_container[i]._id) {
	  $scope.v_container[i].is_view = true; 
	}
      }
    });
    

    $scope.$on('refreshChild', function() {
      //alert('child');
      $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);
      
      var uid = $scope.user_info.device.uuid;
      if($scope.user_info.fb.id != -1) {
	uid = $scope.user_info.fb.id;
      }
      var req_url = 'http://s.05day.com/v/' + $scope.parent + '/' + $scope.child +'/now' +'/' +
		$scope.sort + '/' + uid;
      
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  
	  var rtn = data;

	  if(!rtn.result) {
	    alert('[error] 동영상 정보 가져오기 실패');
	  } else {
	    $scope.is_next = rtn.is_next;
	    $scope.v_container = rtn.v_container;
	  }

	  $cordovaSpinnerDialog.hide();
	  $ionicScrollDelegate.scrollTop(true);
	}).
	error(function(data, status, headers, config) {
	  //alert('[error] 홈 요청중');
	  $cordovaSpinnerDialog.hide();
	});
      
    });



    
    var is_init = false;
    var init = function() {
      $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);
      $rootScope.status = STATUS.CHILD;
      
      var uid = $scope.user_info.device.uuid;
      if($scope.user_info.fb.id != -1) {
	uid = $scope.user_info.fb.id;
      }
      var req_url = 'http://s.05day.com/v/' + $scope.parent + '/' + $scope.child +'/now' +'/' +
		$scope.sort + '/' + uid;
      
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  
	  var rtn = data;

	  if(!rtn.result) {
	    alert('[error] 동영상 정보 가져오기 실패');
	  } else {
	    $scope.is_next = rtn.is_next;
	    $scope.v_container = rtn.v_container;
	  }

	  $cordovaSpinnerDialog.hide();
	}).
	error(function(data, status, headers, config) {
	  //alert('[error] 홈 요청중');
	  $cordovaSpinnerDialog.hide();
	});
    };
    init();


    $scope.more = function() {
      $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);

      var uid = $scope.user_info.device.uuid;
      if($scope.user_info.fb.id != -1) {
	uid = $scope.user_info.fb.id;
      }

      var req_url = 'http://s.05day.com/v/' + $scope.parent + '/' +  $scope.child + '/' + $scope.v_container[$scope.v_container.length-1].date + '/' + $scope.sort + '/' + uid;
      
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  var rtn = data;
	  $cordovaSpinnerDialog.hide();
	  
	  if(!rtn.result) {
	    $cordovaSpinnerDialog.hide();
	    alert('[error] 동영상 정보 가져오기 실패');
	  } else {
	    $scope.is_next = rtn.is_next;
	    $scope.v_container = $scope.v_container.concat(rtn.v_container);
	    $cordovaSpinnerDialog.hide();
	    $ionicScrollDelegate.scrollBy(0, $window.innerHeight/2, true);
	  }

	}).
	error(function(data, status, headers, config) {
	  //alert('[error] 홈 요청중');
	  $cordovaSpinnerDialog.hide();
	});
    };
    

    $scope.typeSort = {
      "value": "최신순", 
      "values": [ "최신순", "오래된순"]
    };

    
    $scope.$watch(
      "typeSort.value",
      function( newValue, oldValue ) {
	if(!is_init) {
	  is_init = true;
	} else {
	  $scope.$apply();
	  if(newValue == "최신순") {
	    $scope.sort = 1;
	  } else {
	    $scope.sort = -1;
	  }

	  $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);

	  var uid = $scope.user_info.device.uuid;
	  if($scope.user_info.fb.id != -1) {
	    uid = $scope.user_info.fb.id;
	  }
	  var req_url = 'http://s.05day.com/v/' + $scope.parent + '/' + $scope.child +'/now' +'/' + $scope.sort + '/' + uid;
	  
	  $http.get(req_url).
	    success(function(data, status, headers, config) {
	      
	      var rtn = data;

	      if(!rtn.result) {
		alert('[error] 동영상 정보 가져오기 실패');
	      } else {
		$scope.is_next = rtn.is_next;
		$scope.v_container = rtn.v_container;
	      }
	      
	      $cordovaSpinnerDialog.hide();
	      
	    }).
	    error(function(data, status, headers, config) {
	      //alert('[error] 홈 요청중');
	      $cordovaSpinnerDialog.hide();
	    });
	  
	}
      }
    );


    
  }]);
