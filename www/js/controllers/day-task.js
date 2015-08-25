angular.module('starter.controllers')
  .controller('daytaskCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$filter', '$window', '$cordovaDialogs', 'quizService', '$cordovaToast', '$cordovaSpinnerDialog', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $filter, $window, $cordovaDialogs, quizService, $cordovaToast, $cordovaSpinnerDialog){

    $scope.$on('refresh', function() {
      init();
    });

    var SAT = 6;
    var SUN = 0;

    $scope.calendar = {pickdate : $filter("date")(Date.now(), 'yyyy-MM-dd')};
    $scope.today = $scope.calendar.pickdate;

    var _time = new Date();
    _time.setDate(_time.getDate()-30);
    
    //$scope.minDate = '2014-04-01';
    $scope.minDate = $filter("date")(_time, 'yyyy-MM-dd');
    
    $scope.maxDate = $scope.calendar.pickdate;
    //$scope.maxDate = '2016-10-06';
    $scope.is_weekend = false;

    var date = new Date();
    $scope.month = date.getMonth() + 1;
    $scope.date = date.getDate();

    $scope.beginTask = function(index) {

      if(!$rootScope.network.is_online) {
	$cordovaDialogs.alert('오프라인 상태입니다.', '오류', '닫기')
	  .then(function() {
	  });
	return;
      } 
    
      if(!$rootScope.user_info.device.quiz_on && !$rootScope.user_info.fb.quiz_on) {
	$cordovaDialogs.confirm('오늘의 퀴즈 기간을 연장해주세요.', '유료회원 전용', ['스토어 가기','취소'])
	  .then(function(buttonIndex) {
	    // no button = 0, 'OK' = 1, 'Cancel' = 2
	    var btnIndex = buttonIndex;
	    if(btnIndex == 1) {
	      $window.location = "#app/day-store/quiz";
	    }
	   
	  });
	return;
      }


      quizService.set_lv(index);

      var t = new Date();
      var msg = t.getMonth()+1 + '월' + t.getDate() + '일' + '퀴즈에 도전하시겠습니까?';
      $cordovaDialogs.confirm(msg, '오늘의퀴즈 도전하기', ['도전하기','취소'])
	.then(function(buttonIndex) {
	  // no button = 0, 'OK' = 1, 'Cancel' = 2
	  var btnIndex = buttonIndex;
	  if(btnIndex == 1) {
	    $cordovaSpinnerDialog.show("","퀴즈 로딩중", true);
	    $window.location = "#app/day-task-detail/" + $scope.today;
	    setTimeout(function() {
	      $cordovaSpinnerDialog.hide();
	    }, 1000);
	  }
	});
    };
    

    var init = function() {
      var t = new Date();
      if(t.getDay() == SAT || t.getDay() == SUN) {
	$scope.is_weekend = true;
      }
      $scope.calendar.pickdate = $filter("date")(Date.now(), 'yyyy-MM-dd');
      $scope.today = $scope.calendar.pickdate;
      var date = new Date();
      $scope.month = date.getMonth() + 1;
      $scope.date = date.getDate();
    };
    init();
    

    $scope.$watch("calendar.pickdate", function(newValue, oldValue) {
      if(newValue == $scope.today) {
	return;
      }
      
      var _date = newValue.split("-");
      var d = new Date(_date[0], _date[1]-1, _date[2]);

      var n = d.getDay();
      if(n == SAT || n == SUN) {
	$scope.calendar.pickdate = oldValue;

	$cordovaDialogs.alert('주말에는 퀴즈가 열리지 않습니다', '알림', '닫기')
	  .then(function() {
	    // callback success
	  });
	
	$scope.calendar.pickdate = newValue;
	return;
      }


      if(!$rootScope.network.is_online) {
	$cordovaDialogs.alert('오프라인 상태입니다.', '오류', '닫기')
	  .then(function() {
	  });
	return;
      }

      if(!$rootScope.user_info.device.quiz_on && !$rootScope.user_info.fb.quiz_on) {
	$cordovaDialogs.confirm('오늘의 퀴즈 기간을 연장해주세요.', '유료회원 전용', ['스토어 가기','취소'])
	  .then(function(buttonIndex) {
	    // no button = 0, 'OK' = 1, 'Cancel' = 2
	    var btnIndex = buttonIndex;
	    if(btnIndex == 1) {
	      setTimeout(function() {
		$cordovaSpinnerDialog.hide();
	      }, 1000);
	      $cordovaSpinnerDialog.show("","스토어 이동중", false);
	      $window.location = "#app/day-store/quiz";
	    }

	  });
	return;
      }

      
      $scope.calendar.pickdate = newValue;

      var msg = d.getMonth()+1 + '월' + d.getDate() + '일' + '퀴즈에 도전하시겠습니까?';
      $cordovaDialogs.confirm(msg, '지난퀴즈 도전하기', ['도전하기','취소'])
	.then(function(buttonIndex) {
	  // no button = 0, 'OK' = 1, 'Cancel' = 2
	  var btnIndex = buttonIndex;
	  
	  //$rootScope.q.done_container.push(newValue);
	  
	  if(btnIndex == 1) {

	    $cordovaSpinnerDialog.show("","퀴즈 로딩중", true);
	    quizService.set_lv($rootScope.q.lv);
	    $window.location = "#app/day-task-detail/" + newValue;
	    
	    setTimeout(function() {
		$cordovaSpinnerDialog.hide();
	    }, 1000);

	  }
	});
    });


    /*
    $scope.getResult = function(lv, date) {
      if(date == 'now') {
	

      } else {

      }

    };
    */

    $scope.quiz = {lv: '난이도 I'};
    $scope.prop = {
      "type": "select", 
      "value": $scope.quiz.lv, 
      "values": [ "난이도 I", "난이도 II"] 
    };

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
	  //alert('[error] 네트워크 장애 다시시도해주세요');
	  $cordovaToast.showShortCenter('네트워크 상태 불안정');
	});
      
      //$rootScope.user_info.is_free_trial_done = true;
    };

 

     // 퀴즈가 바뀌는 경우 다시 요청함
    $scope.disabledDates = $rootScope.q.done_container;
    
    var is_init = false;
    $scope.$watch("prop.value", function(newValue, oldValue) {
      if(!is_init) {
	is_init = true;
	return;
      }

      $scope.is_v = false;
      if(newValue == '난이도 I') {
	$scope.quiz.lv = '난이도 I';
	$scope.disabledDates = $rootScope.q.done_container;

	quizService.set_lv(1);
	$rootScope.update_dailyquiz(1, true);
      } else {
	$scope.quiz.lv = '난이도 II';
	$scope.disabledDates = $rootScope.q.done_container;

	quizService.set_lv(2);
	$rootScope.update_dailyquiz(2, true);	
      }
    });


    $scope.$watch("q.done_container.length", function(newValue, oldValue) {
      $scope.disabledDates = $rootScope.q.done_container;
    });

 
    
  }]);


angular.module('starter.controllers').service('quizService', function() {

  this.lv = 1;
  this.incompleteQuizs = [];
  this.readingQuizs = [];
  this.listeningQuizs = [];
  this.paragraph = '';
  this.paragraph_ko = '';
  //this.vid = '';

  this.set = function(incompleteQuizs, readingQuizs, listeningQuizs, paragraph, paragraph_ko) {
    this.incompleteQuizs = incompleteQuizs;
    this.readingQuizs = readingQuizs;
    this.listeningQuizs = listeningQuizs;
    this.paragraph = paragraph;
    this.paragraph_ko = paragraph_ko;
  };

  this.set_lv = function(lv) {
    this.lv = lv;
  };

  this.get_lv = function() {
    return this.lv;
  };

  this.reset = function() {
    this.incompleteQuizs = [];
    this.readingQuizs = [];
    this.listeningQuizs = [];
    this.paragraph = '';
    this.paragraph_ko = '';
  };
  
});
