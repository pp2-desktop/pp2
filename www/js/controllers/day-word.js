angular.module('starter.controllers')
  .controller('daywordCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$filter', '$window', '$cordovaDialogs', 'dayword_info', '$timeout', '$cordovaToast', '$cordovaSpinnerDialog', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $filter, $window, $cordovaDialogs, dayword_info, $timeout, $cordovaToast, $cordovaSpinnerDialog){
    
    $scope.$on('refresh', function() {
      init();
    });
     
    
    $scope.is_next = true;

    $scope.dayword_info_container = [];

    $scope.dayword_detail = function(i) {

      if(i != 0) {
	
	if(!$rootScope.user_info.device.word_on && !$rootScope.user_info.fb.word_on) {
	  $cordovaDialogs.confirm('오늘 날짜 단어만 무료로 제공됩니다.', '유료회원 전용', ['스토어 가기','취소'])
	    .then(function(buttonIndex) {
	      // no button = 0, 'OK' = 1, 'Cancel' = 2
	      var btnIndex = buttonIndex;
	      if(btnIndex == 1) {
		$window.location = "#app/day-store/word";
	      }
	    });
	 
	} else {
	  dayword_info.set($scope.dayword_info_container[i]);
	  $window.location = "#app/day-word-detail";
	}
      } else {
	dayword_info.set($scope.dayword_info_container[i]);
	$window.location = "#app/day-word-detail";
      }
    };

    var init = function() {

      if(!$rootScope.network.is_online) {
	$cordovaDialogs.alert('오프라인 상태입니다.', '오류', '닫기')
	  .then(function() {
	  });
	return;
      } 

      $scope.is_next = true;
      $scope.dayword_info_container = [];
      var req_url = 'http://s.05day.com/w/today';
      //var req_url = 'http://127.0.0.1:3000/w/today';
      $cordovaSpinnerDialog.show("","오늘의 단어 가져오는 중", true);
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  if(!data.result) {

	    $cordovaToast.showShortCenter('서버 상태 불안정');
	    $cordovaSpinnerDialog.hide();
	    //alert('[error]오늘의 단어를 가져오다가 네트워크 장애');
	    return;
	  }

	  if(!data.is_next) {
	    $scope.is_next = false;
	  } else {
	    $scope.is_next = true;
	  }

	  var doc = data.doc;
	  $scope.dayword_info_container = doc;
	  $cordovaSpinnerDialog.hide();
	  //$rootScope.track('word');
	  var analytics = navigator.analytics;
	  analytics.setTrackingId('UA-65058003-1');
	  analytics.sendAppView('word', function() {}, function() {alert('anaytics 오류');});
	}).
	error(function(data, status, headers, config) {
	  $cordovaSpinnerDialog.hide();
	  $cordovaToast.showShortCenter('네트워크 상태 불안정');
	});
      
    };
     
    init();
    
    $scope.more = function() {

      if($scope.dayword_info_container.length <= 0) {
	return; 
      }
      
      var index = $scope.dayword_info_container.length - 1;
      var _date = $scope.dayword_info_container[index].date;

      var req_url = 'http://s.05day.com/w/' + _date;;
      //var req_url = 'http://127.0.0.1:3000/w/' + _date;
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  if(!data.result) {

	    alert('[error]오늘의 단어를 가져오다가 네트워크 장애');
	    return;
	  }

	  if(!data.is_next) {
	    $scope.is_next = false;
	  } else {
	    $scope.is_next = true;
	  }

	  var doc = data.doc;
	  
	  $scope.dayword_info_container = $scope.dayword_info_container.concat(doc);
	  $ionicScrollDelegate.scrollBy(0, $window.innerHeight/2, true);
	  
	}).
	error(function(data, status, headers, config) {
	  
	});      
      
      /*
      if($scope.dayword_info_container.length >= 30) {
	$scope.is_next = false;
	return;
      }
       */
    };

    $scope.$on('refresh', function() {
      init();
    });


    $scope.startTrial = function() {

      var uuid = $rootScope.user_info.device.uuid;
      
      var req_url = 'http://s.05day.com/u/start-trial/' + uuid;
      
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  var rtn = data;
	  if(!rtn.result) {
	    $cordovaToast.showShortCenter('free trial 이미 사용하셨습니다');
	    return;
	  }

	  // 계정정보 다시 얻기
	  $rootScope.get_user_info();
	  $cordovaToast.showShortCenter('모든 컨텐츠 2일간 무료로 제공됩니다');	  
	}).
	error(function(data, status, headers, config) {
	  $cordovaToast.showShortCenter('네트워크 상태 불안정');
	  //alert('[error] 네트워크 장애 다시시도해주세요');
	});
      
      //$rootScope.user_info.is_free_trial_done = true;
    };

    
  }]);


angular.module('starter.controllers').service('dayword_info', function() {
  
  this.p = {};


  this.set = function(dayword_info) {
    this.p = dayword_info;
  };

});
