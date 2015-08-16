// 돌아가기 버튼 만들어보기history back
angular.module('starter.controllers')
  .controller('userSettingCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$filter', '$window', '$cordovaDialogs', '$timeout', '$cordovaToast', '$ionicHistory', '$state', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $filter, $window, $cordovaDialogs, $timeout, $cordovaToast, $ionicHistory, $state){


    $scope.transfer_account = function() {
      $cordovaDialogs.confirm('정말로 Facebook계정으로 디바이스계정 정보를 이동하시겠습니까?', '계정이동', ['이전하기','취소'])
	.then(function(buttonIndex) {
	  
	  if(buttonIndex == 1) {
	    //var req_url = 'http://127.0.0.1:3000/u/transfer/' + $rootScope.user_info.uuid + '/' + $rootScope.user_info.fb.id;

	    var req_url = 'http://s.05day.com/u/transfer/' + $rootScope.user_info.device.uuid + '/' + $rootScope.user_info.fb.id;
	    $http.get(req_url).
	      success(function(data, status, headers, config) {
		var rtn = data;
		if(!rtn.result) {
		  alert('유료계정 이동 실패');
		} else {
		  // 유저 계정 정보 갱신하기
		  // fb으로 물어보기
		  // 여기서 안뫼
		  $rootScope.get_user_info();
		  /*
		  var req_url = 'http://s.05day.com/u/get-fb-info/' + $rootScope.user_info.fb.id;
		  $http.get(req_url).
		    success(function(data, status, headers, config) {
		      var rtn = data;
		      
		      if(!rtn.result) {
			alert('[error] fb 유저정보 가져오다가 문제발생');
		      } else {


			$rootScope.get_user_info();

			$cordovaToast.showShortCenter('성공적으로 Facebook계정으로 정보 이동');
			$ionicHistory.goBack();

		      } 
		    }).
		    error(function(data, status, headers, config) {
		      alert('[error] get_user_info');
		    });
*/
		 
		}
		   
	

	      }).
	      error(function(data, status, headers, config) {
		$scope.is_online = false;
		alert('[error] 네트워크 문제발생');
	      });
	  }
	  
	});
    };


    $scope.home = function() {
      $ionicHistory.nextViewOptions({
	disableBack: true
      });
      $state.go($rootScope.place);
      /*
      $rootScope.menu_opt.prev_refresh = true;
      $rootScope.menu_opt.prev_find = true;
      $rootScope.menu_opt.refresh = true;
      $rootScope.menu_opt.find = true;
      $state.go('app.home');
      */
    };

    $scope.$on('update', function() {
      init();
    });


    $scope.is_transfer = false;
    
    var init = function() {
      $rootScope.menu_opt.prev_refresh = false;
      $rootScope.menu_opt.prev_find = false;
      $rootScope.menu_opt.refresh = false;
      $rootScope.menu_opt.find = false;
      var n = new Date();
      $scope.is_device_word_expired = true;
      $scope.is_device_quiz_expired = true;
      $scope.is_fb_word_expired = true;
      $scope.is_fb_quiz_expired = true;


      if(n > new Date($rootScope.user_info.device.word_date)) {
	$scope.is_device_word_expired = true;
      } else {
	$scope.is_device_word_expired = false;
      }

      if(n > new Date($rootScope.user_info.device.quiz_date)) {
	$scope.is_device_quiz_expired = true;
      } else {
	$scope.is_device_quiz_expired = false;
      }

      if($rootScope.user_info.fb.uid != -1) {

	if( ($rootScope.user_info.fb.word_date < $rootScope.user_info.device.word_date) ||
	    ($rootScope.user_info.fb.quiz_date < $rootScope.user_info.device.quiz_date)) {
	  $scope.is_transfer = true;
	}
	
	
	if(n > new Date($rootScope.user_info.fb.word_date)) {
	  $scope.is_fb_word_expired = true;
	} else {
	  $scope.is_fb_word_expired = false;
	}

	if(n > new Date($rootScope.user_info.fb.quiz_date)) {
	  $scope.is_fb_quiz_expired = true;
	} else {
	  $scope.is_fb_quiz_expired = false;
	}
      }
    };
    init();

    
  }]);
