angular.module('starter.controllers')
  .controller('parentChildCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$stateParams', '$timeout', '$cordovaSpinnerDialog', '$window', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $stateParams, $timeout, $cordovaSpinnerDialog, $window){
    
    $scope.is_next = true;
    $scope.title = '';

    $scope.$on('update_view', function(event, vid) {
      for(var i=0; i<$scope.v_container.length; i++) {
	if(vid == $scope.v_container[i]._id) {
	  $scope.v_container[i].is_view = true; 
	}
      }
    });

    $scope.$on('refreshParentchild', function() {
      //alert('parent-child');
      $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);

      var uid = $scope.user_info.device.uuid;
      if($scope.user_info.fb.id != -1) {
	uid = $scope.user_info.fb.id;
      }
      var req_url = 'http://s.05day.com/v/parent-child/' + $scope.parent + '/now/' + uid;

      
      $http.get(req_url).
	success(function(data, status, headers, config) {

	  var rtn = data;

	  console.log(rtn);

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

    var init = function() {
      $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);
      $rootScope.status = STATUS.PARENT_CHILD;
      $scope.parent = $stateParams.parent;
      $scope.title = $scope.parent.toUpperCase();

      var uid = $scope.user_info.device.uuid;
      if($scope.user_info.fb.id != -1) {
	uid = $scope.user_info.fb.id;
      }
      var req_url = 'http://s.05day.com/v/parent-child/' + $scope.parent + '/now/' + uid;
      
      $http.get(req_url).
	success(function(data, status, headers, config) {

	  var rtn = data;

	  console.log(rtn);

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
      var req_url = 'http://s.05day.com/v/parent-child/' + $scope.parent + '/' + $scope.v_container[$scope.v_container.length-1].date +'/' + uid;
      
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  var rtn = data;
	  
	  if(!rtn.result) {
	    alert('[error] 동영상 정보 가져오기 실패');
	    $cordovaSpinnerDialog.hide();
	  } else {
	    $scope.is_next = rtn.is_next;
	    $scope.v_container = $scope.v_container.concat(rtn.v_container);
	    $cordovaSpinnerDialog.hide();
	    $ionicScrollDelegate.scrollBy(0, $window.innerHeight/2, true);
	  }

	}).
	error(function(data, status, headers, config) {
	  $cordovaSpinnerDialog.hide();
	  //alert('[error] 홈 요청중');
	});
    };


    /*
    $scope.moreDataCanBeLoaded = true;
    $scope.immediate_check = false;
    $scope.loadmore = function() {
      console.log('loadmore');
      if(is_init) {
	$scope.immediate_check = true;
	$http.get('http://112.219.140.178:3000/v/parent-child/' + $scope.parent + '/' + $scope.v_container[$scope.v_container.length-1].date).
	  success(function(data, status, headers, config) {
	    var rtn = data;
	      console.log(rtn);
	    
	    if(!rtn.result) {
	      alert('[error] 동영상 정보 가져오기 실패');
	    } else {
	      //$scope.is_next = rtn.is_next;
	      $scope.v_container = $scope.v_container.concat(rtn.v_container);
	      $scope.is_next = rtn.is_next;
	    }

	  }).
	  error(function(data, status, headers, config) {
	    //alert('[error] 홈 요청중');
	  });
      }

    };
     */

    
   
    

    /*
    $scope.$on('find', function(event, args){
      alert(args.keyword);
    });
    */

  }]);
