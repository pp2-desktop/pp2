// 돌아가기 버튼 만들어보기history back
angular.module('starter.controllers')
  .controller('dayStoreCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$filter', '$window', '$cordovaDialogs', '$timeout', '$ionicHistory', '$stateParams', '$state', '$cordovaToast', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $filter, $window, $cordovaDialogs, $timeout, $ionicHistory, $stateParams, $state, $cordovaToast){

    $scope.where = $stateParams.where;

    $rootScope.menu_opt.prev_refresh = $rootScope.menu_opt.refresh;
    $rootScope.menu_opt.prev_find = $rootScope.menu_opt.find;
    $rootScope.menu_opt.refresh = false;
    $rootScope.menu_opt.find = false;

    $scope.buy_item = function(index) {

      var itemType = "word";
      
      if(index == 0) {
	itemType = "word";
	$cordovaToast.showShortCenter('오늘의 단어 선택');
      } else if (index == 1) {
	itemType = "quiz";
	$cordovaToast.showShortCenter('오늘의 퀴즈 선택');
      } else if (index == 2) {
	itemType = "word.quiz";
	$cordovaToast.showShortCenter('영어데이 콤보 선택');
      } else if (index == 3) {
	itemType = "word.quiz.ayear";
	$cordovaToast.showShortCenter('1년 자유 이용권 선택');
      } else {
	alert("[error] 아이템을 찾을수 없습니다");
	return;
      }

      if((window.device && device.platform == "Android") && typeof inappbilling !== "undefined") {
	inappbilling.consumePurchase(function(data) {
	  $scope.purchase(itemType);
	}, function(err) {
	  $scope.purchase(itemType);
	}, itemType);
      };

    };


    $scope.purchase = function(itemType) {

      if((window.device && device.platform == "Android") && typeof inappbilling !== "undefined") {
        inappbilling.buy(function(data) {

	  $scope.buy(itemType);
	  
        }, function(errorBuy) {
	  alert(errorBuy);
        }, 
			 itemType);
      }

    };


    $scope.buy = function(item) {
      var req_url = 'http://s.05day.com/u/buy/' + $rootScope.user_info.device.uuid + '/' + item;
      
      if($rootScope.user_info.fb.id != -1) {
	req_url = 'http://s.05day.com/u/fbuy/' + $rootScope.user_info.fb.id + '/' + item;
      } 
      
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  var rtn = data;
	  
	  if(!rtn.result) {

	    $cordovaDialogs.alert('서버 문제로 구매에 실패하였습니다. support@05day.com 문의해주세요.', '오류', '확인')
	      .then(function() {
		
	      });
	    
	  } else {

	    $cordovaDialogs.alert('메뉴 -> 내 계정 -> 유료컨텐츠 남은기간에서 종료일 확인 가능.', '결제성공', '확인')
	      .then(function() {
		$rootScope.get_user_info();
		$scope.home();
		if((window.device && device.platform == "Android") && typeof inappbilling !== "undefined") {
		  inappbilling.consumePurchase(function(data) {
		  }, function(err) {
		  }, item);
		};
	      });

	  }
	  
	}).
	error(function(data, status, headers, config) {

	    $cordovaDialogs.alert('네트워크 문제로 구매에 실패하였습니다. support@05day.com 문의해주세요.', '오류', '확인')
	      .then(function() {
		
	      });
	  
	});
    };

    $scope.close = function() {
      $ionicHistory.goBack();
    };

    $scope.home = function() {
      $ionicHistory.nextViewOptions({
	disableBack: true
      });


      $rootScope.menu_opt.prev_refresh = true;
      $rootScope.menu_opt.prev_find = true;
      $rootScope.menu_opt.refresh = true;
      $rootScope.menu_opt.find = true;

      $state.go('app.home');
    };
    
  }]);
