angular.module('starter.controllers')
  .controller('daytaskdetailCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$stateParams', '$ionicModal', '$window', 'quizService', '$timeout', '$state', '$ionicTabsDelegate', '$sce', '$cordovaSpinnerDialog', '$ionicHistory', '$cordovaToast', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $stateParams, $ionicModal, $window, quizService, $timeout, $state, $ionicTabsDelegate, $sce, $cordovaSpinnerDialog, $ionicHistory, $cordovaToast){

    var _date = $stateParams.date.split("-");
    var _lv = quizService.get_lv();

    var d = new Date(_date[0], _date[1]-1, _date[2]);
    $scope.date = new Date(_date[0], _date[1]-1, _date[2]);
    
    $scope.title = d;

    $scope.quiz = { lv: '-1'};
    $scope.paragraph = 'aa';
    $scope.paragraph_ko = 'bb';

    $scope.is_done = false;
    $scope.result = '결과 보기';

    //$scope.grammarQuizs = [];
    $scope.incompleteQuizs = [];
    //$scope.qnrQuizs = [];
    $scope.readingQuizs = [];
    $scope.listeningQuizs = [];


    $scope.is_v = false;


    $scope.is_existing = false;


    $scope.$on('backbtn', function() {
      $rootScope.menu_opt.prev_refresh = true;
      $rootScope.menu_opt.prev_find = false;
      $rootScope.menu_opt.refresh = true;
      $rootScope.menu_opt.find = false;
    });
    //$scope.playerVars = {};

    $rootScope.menu_opt.prev_refresh = $rootScope.menu_opt.refresh;
    $rootScope.menu_opt.prev_find = $rootScope.menu_opt.find;
    $rootScope.menu_opt.refresh = false;
    $rootScope.menu_opt.find = true;

    $scope.player_container = [];

    $scope.$on('pause', function() {
      for(var i=0; i<$scope.player_container.length; i++) {
	$scope.player_container[i].pauseVideo();
      }
    });
    
    var playerId = {};


    $scope.$on('youtube.player.ready', function ($event, player) {
      playerId[player.v] = {end:false, start: player.B.currentTime, is_playing: false};
      $scope.player_container.push(player);
    });


    
    $scope.$on('youtube.player.ended', function ($event, player) {
      playerId[player.v].end = true;
    });
    
    
    $scope.$on('youtube.player.playing', function ($event, player) {

      if( playerId[player.v].end == null || playerId[player.v].end == undefined )   {
	playerId[player.v].end = true;
      }

      if( playerId[player.v].end == true ) {
	playerId[player.v].end = false;
	player.seekTo(playerId[player.v].start);
      }

      for( var i=0; i<$scope.player_container.length; i++ ) {
	var _v = $scope.player_container[i];
	
	if( $scope.player_container[i] != player ) {
	  if(playerId[_v.v].is_playing) {
	    $scope.player_container[i].pauseVideo();
	  }
	} else {
	  playerId[_v.v].is_playing = true;
	}
      }

    });
    
    

    if(_lv == 1) {
      $scope.quiz.lv = '오늘의 퀴즈 I';
    } else if(_lv) {
      $scope.quiz.lv = '오늘의 퀴즈 II';
    } else {
      alert('퀴즈 난이도 없음 문제발생');
    }

    $scope.prop = {
      "type": "select", 
      "value": $scope.quiz.lv, 
      "values": [ "오늘의 퀴즈 I", "오늘의 퀴즈 II"]
    };


    // 퀴즈가 바뀌는 경우 다시 요청함
    var is_init = false;
    $scope.$watch("prop.value", function(newValue, oldValue) {
      if(!is_init) {
	is_init = true;
	return;
      }

      
      $scope.is_v = false;
      
      var _lv = 1;
      if(newValue == '오늘의 퀴즈 I') {
	$scope.quiz.lv = '오늘의 퀴즈 I';
	_lv = 1;
	$scope.player_container = [];
	quizService.set_lv(1);
      } else {
	$scope.quiz.lv = '오늘의 퀴즈 II';
	_lv = 2;
	$scope.player_container = [];
	quizService.set_lv(2);
      }

      $cordovaSpinnerDialog.show("","퀴즈를 로딩중입니다", true);

      var req_url = 'http://s.05day.com/q/' + _lv + '/' + $stateParams.date;
      //var req_url = 'http://127.0.0.1:3000/q/' + _lv + '/' + $stateParams.date;
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  if(!data.result) {
	    //$cordovaSpinnerDialog.hide();
	    quiz_not_yet();
	    $scope.is_done = false;
	    $scope.is_existing = false;
	    $cordovaSpinnerDialog.hide();
	    return;
	  }

	  $scope.is_existing = true;

	  var doc = data.doc;
	  setQuiz(doc);
	  $cordovaSpinnerDialog.hide();
	  //$rootScope.track('quiz');
	  var analytics = navigator.analytics;
	analytics.setTrackingId('UA-65058003-1');
	analytics.sendAppView('quiz', function() {}, function() {alert('anaytics 오류');});
	}).
	error(function(data, status, headers, config) {
	  //alert("[error] 퀴즈가져오기 실패");
	  $cordovaSpinnerDialog.hide();
	  $cordovaToast.showShortCenter('네트워크 상태 불안정');
	});  
    });

    var quiz_not_yet = function() {
      $scope.incompleteQuizs = [];
      //$scope.qnrQuizs = [];
      $scope.readingQuizs = [];
      $scope.listeningQuizs = [];
      quizService.reset();
      $scope.paragraph = '';
      $scope.paragraph_ko = '';
    };


    var setQuiz = function(doc) {
      $scope.incompleteQuizs = [];
      //$scope.qnrQuizs = [];
      $scope.readingQuizs = [];
      quizService.reset();
      $scope.paragraph = doc.paragraph;
      $scope.paragraph_ko = doc.paragraph_ko;
      $scope.listeningQuizs = [];

      for( var i=0; i<doc.listening_questions.length; i++ ) {
	var each_quiz = doc.listening_questions[i];
	each_quiz.question_container = [];
	each_quiz.opts = {
	  autoplay: 0,
	  controls: 0,
	  html5: 1,
	  modesbranding: 0,
	  iv_load_policy: 3,
	  showinfo: 0,
	  rel:0,
	  start: each_quiz.start,
	  end: each_quiz.end,
	  playsinline: 1
	};
	
	var lq = each_quiz.questions;

	for(var t=0; t<lq.length; t++) {

	  var each_quiz2 = {};
	  each_quiz2.question = lq[t].title;
	  each_quiz2.correct_ans = lq[t].correct_num;
	  each_quiz2.explain = lq[t].solution;
	  each_quiz2.ans = -1;
	  each_quiz2.is_correct = false;
	  
	  each_quiz2.choices = [];
	  for(k in lq[t].answers)  {
	    pObj = lq[t].answers[k];
	    for(p  in pObj) {
	      choice = pObj[p];
	      each_quiz2.choices.push(choice);
	    }
	  }  
	  each_quiz.question_container.push(each_quiz2);
	}
	
	$scope.listeningQuizs.push(each_quiz);
      }

      //$scope.quiz.lv = doc.lv;
      quizService.set_lv(Number(doc.lv));

      
      var iq = doc.incomplete_questions;
    
      for(i=0; i<iq.length; i++) {

	each_quiz = {};
	each_quiz.question = iq[i].title;
	each_quiz.correct_ans = iq[i].correct_num;
	each_quiz.explain = iq[i].solution;

	each_quiz.ans = -1;
	each_quiz.is_correct = false;
	each_quiz.choices = [];

	for(var k in iq[i].answers)  {
	
	  var pObj = iq[i].answers[k];
	  for(var p  in pObj) {
	 
	    var choice = pObj[p];
	    each_quiz.choices.push(choice);
	  }
	}
	$scope.incompleteQuizs.push(each_quiz);
      }


      /*
      var qnrq = doc.qnr_questions;
      for(i=0; i<qnrq.length; i++) {

	each_quiz = {};
	each_quiz.question = qnrq[i].title;
	each_quiz.correct_ans = qnrq[i].correct_num;
	each_quiz.explain = qnrq[i].solution;

	each_quiz.ans = -1;
	each_quiz.is_correct = false;
	each_quiz.choices = [];

	for(k in qnrq[i].answers)  {
	
	  pObj = qnrq[i].answers[k];
	  for(p in pObj) {
	 
	    choice = pObj[p];
	    each_quiz.choices.push(choice);
	  }
	}
	$scope.qnrQuizs.push(each_quiz);
      }
      */

      $scope.readingQuizs = [];
      var rq = doc.reading_questions;
      for(i=0; i<rq.length; i++) {
	each_quiz = {};
	each_quiz.question = rq[i].title;
	each_quiz.correct_ans = rq[i].correct_num;
	each_quiz.explain = rq[i].solution;

	each_quiz.ans = -1;
	each_quiz.is_correct = false;
	
	each_quiz.choices = [];
	for(k in rq[i].answers)  {
	  pObj = rq[i].answers[k];
	  for(p  in pObj) {
	    choice = pObj[p];
	    each_quiz.choices.push(choice);
	  }
	}
	$scope.readingQuizs.push(each_quiz);
      }

      
      $scope.is_existing = true;
      $scope.is_v = true;
      $scope.is_done = false;
    };

    // req 퀴즈가져오기
    $cordovaSpinnerDialog.show("","퀴즈를 로딩중입니다", true);

    var req_url = 'http://s.05day.com/q/' + _lv + '/' + $stateParams.date;
    //var req_url = 'http://127.0.0.1:3000/q/' + _lv + '/' + $stateParams.date;
    $http.get(req_url).
      success(function(data, status, headers, config) {
	 $scope.is_existing = false;
	
	if(!data.result) {
	  $cordovaSpinnerDialog.hide();
	  quiz_not_yet();
	  return;
	}

	var doc = data.doc;
	setQuiz(doc);
	$cordovaSpinnerDialog.hide();
	//$rootScope.track('quiz');
	var analytics = navigator.analytics;
	analytics.setTrackingId('UA-65058003-1');
	analytics.sendAppView('quiz', function() {}, function() {alert('anaytics 오류');});
      }).
      error(function(data, status, headers, config) { 
	$cordovaSpinnerDialog.hide();
	$cordovaToast.showShortCenter('네트워크 상태 불안정');
      });



    $scope.showResult = function() {
      
      for(var i=0; i<$scope.player_container.length; i++) {
	$scope.player_container[i].stopVideo();
      }

      $cordovaSpinnerDialog.show("","퀴즈 결과 계산중", true);

      $timeout( function() {
	for(var i in $scope.incompleteQuizs) {
	  if($scope.incompleteQuizs[i].ans == $scope.incompleteQuizs[i].correct_ans) {
	    $scope.incompleteQuizs[i].is_correct = true;
	  }
	}
		
	for(i in $scope.readingQuizs) {
	  if($scope.readingQuizs[i].ans == $scope.readingQuizs[i].correct_ans) {
	    $scope.readingQuizs[i].is_correct = true;
	  }
	}

	for(i=0; i< $scope.listeningQuizs.length; i++) {
	  var each_quiz = $scope.listeningQuizs[i];
	  console.log(each_quiz);
	  for(var t=0; t<each_quiz.question_container.length; t++) {

	    if(each_quiz.question_container[t].correct_ans == each_quiz.question_container[t].ans) {

	      $scope.listeningQuizs[i].question_container[t].is_correct = true;
	    }
	  }
	}
	
	quizService.set($scope.incompleteQuizs, $scope.readingQuizs, $scope.listeningQuizs, $scope.paragraph, $scope.paragraph_ko);



	// 퀴즈 완료했다고 결과 보내줌 (날짜, 점수)
	var uid = $scope.user_info.device.uuid;
	if($scope.user_info.fb.id != -1) {
	  uid = $scope.user_info.fb.id;
	}


	// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
	var req_url = 'http://s.05day.com/u/add-daily-quiz/' + uid + '/' + quizService.get_lv() + '/' + $stateParams.date;
	$http.get(req_url).
	  success(function(data, status, headers, config) {
	  }).
	  error(function(data, status, headers, config) {

	  });
	$rootScope.q.done_container.push($stateParams.date);
	// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

	
	$window.location = "#app/day-task-detail/result/" + $stateParams.date;
	
	// is done에서 결정됨
	setTimeout(function() {
	  $scope.is_done = true;
	}, 1000);
	$cordovaSpinnerDialog.hide();
      }, 500);
    };

    /*
    $scope.goResult = function() {
      alert('총 퀴즈 결과 보기');
    };
    */
    
    $scope.goTodayquiz = function() {
      $rootScope.menu_opt.prev_refresh = true;
      $rootScope.menu_opt.prev_find = false;
      $rootScope.menu_opt.refresh = true;
      $rootScope.menu_opt.find = false;
      $ionicHistory.goBack();
      //$state.go('app.day-task');
    };				 
    

  }]);



angular.module('starter.controllers').directive('dynamic', function ($compile) {

  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.dynamic, function(html) {
        ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
});

