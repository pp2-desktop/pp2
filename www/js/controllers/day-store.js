// 돌아가기 버튼 만들어보기history back
angular.module('starter.controllers')
  .controller('dayStoreCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$filter', '$window', '$cordovaDialogs', '$timeout', '$ionicHistory', '$stateParams', '$state', '$cordovaToast', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $filter, $window, $cordovaDialogs, $timeout, $ionicHistory, $stateParams, $state, $cordovaToast){

    $scope.where = $stateParams.where;

    $rootScope.menu_opt.prev_refresh = $rootScope.menu_opt.refresh;
    $rootScope.menu_opt.prev_find = $rootScope.menu_opt.find;
    $rootScope.menu_opt.refresh = false;
    $rootScope.menu_opt.find = false;


    $scope.is_word_disable_purchase = false;
    $scope.is_quiz_disable_purchase = false;
    $scope.is_wordquiz_disable_purchase = false;
    $scope.is_wordquiz_ayear_disable_purchase = false;
    
    /*
    var active_purchase = function(type) {
      if(type == 0) {

	$scope.is_word_disable_purchase = false;
      } else if(type == 1) {

	$scope.is_quiz_disable_purchase = false;
      } else if(type == 2) {

	$scope.is_wordqquiz_disable_purchase = false;
      } else if(type == 3) {

	$scope.is_wordquiz_ayear_purchase = false;
      } else {
	alert("[error] active 아이템 번호를 찾을수 없습니다");
      }
    };
    */

    
    $scope.disable_purchase = function(type) {
      
      if (type == 0) {
	$scope.is_word_disable_purchase = true;
      } else if (type == 1) {
	
	$scope.is_quiz_disable_purchase = true;
      } else if (type == 2) {
	
	$scope.is_wordquiz_disable_purchase = true;
      } else if (type == 3) {
	
	$scope.is_wordquiz_ayear_disable_purchase = true;
      } else {
	
	alert("[error] 아이템 번호를 찾을수 없습니다");
      }

      //var selftype = type;
      //alert(type);
      
      $timeout( function() {
	if(type == 0) {
	  $scope.is_word_disable_purchase = false;
	} else if(type == 1) {

	  $scope.is_quiz_disable_purchase = false;
	} else if(type == 2) {

	  $scope.is_wordquiz_disable_purchase = false;
	} else if(type == 3) {

	  $scope.is_wordquiz_ayear_disable_purchase = false;
	} else {
	  alert("[error] active 아이템 번호를 찾을수 없습니다");
	}
      }, 4000);
      
    };


    $scope.buy_item = function(index) {

      var itemType = "wordEday";
      
      if(index == 0) {
	itemType = "wordEday";
	//$cordovaToast.showShortCenter('오늘의 단어 선택');
      } else if (index == 1) {
	itemType = "quizEday";
	//$cordovaToast.showShortCenter('오늘의 퀴즈 선택');
      } else if (index == 2) {
	itemType = "wordquizEday";
	//$cordovaToast.showShortCenter('영어데이 콤보 선택');
      } else if (index == 3) {
	itemType = "oneyearEday";
	//$cordovaToast.showShortCenter('1년 자유 이용권 선택');
      } else {
	alert("[error] 아이템을 찾을수 없습니다");
	return;
      }

      $scope.disable_purchase(index);

      if((window.device && device.platform == 'iOS') && window.storekit) {
        storekit.purchase(itemType);
      }

      /*
      if((window.device && device.platform == "Android") && typeof inappbilling !== "undefined") {
	inappbilling.consumePurchase(function(data) {
	  $scope.purchase(itemType);
	}, function(err) {
	  $scope.purchase(itemType);
	}, itemType);
      };
      */
    };

    $rootScope.purchased = function(itemType) {
      //alert(itemType);
      $scope.buy(itemType);
    };


    /*
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
    */

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

	    $cordovaDialogs.alert('메뉴 -> 내 계정 -> 유료컨텐츠 남은기간에서 종료일 확인 가능', '결제성공', '확인')
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
      $state.go($rootScope.place);
    };
    
  }]);
