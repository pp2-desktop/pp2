
angular.module('starter.controllers')
  .controller('daytaskresultCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$stateParams', '$window', 'quizService', '$state', '$ionicTabsDelegate', '$ionicHistory', '$cordovaSpinnerDialog', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $stateParams, $window, quizService, $state, $ionicTabsDelegate, $ionicHistory, $cordovaSpinnerDialog){

    $scope.is_v = false;
    
     var playerId = {};

    $scope.player_container = [];
    
    $scope.$on('pause', function() {
      for(var i=0; i<$scope.player_container.length; i++) {
	$scope.player_container[i].pauseVideo();
      }
    });
    
    $scope.$on('youtube.player.ready', function ($event, player) {
      
      playerId[player.v] = {end:false, start: player.B.currentTime};
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
    });


    var init = function() {
      setTimeout( function() {
	$cordovaSpinnerDialog.hide();
      }, 500);
      $cordovaSpinnerDialog.show("","퀴즈 결과 로딩중", true);
    };
    init();


    $rootScope.menu_opt.prev_refresh = $rootScope.menu_opt.refresh;
    $rootScope.menu_opt.prev_find = $rootScope.menu_opt.find;
    $rootScope.menu_opt.refresh = false;
    $rootScope.menu_opt.find = true;

    var _date = $stateParams.date.split("-");
    var _lv = quizService.get_lv();

    var d = new Date(_date[0], _date[1]-1, _date[2]);
    $scope.title = d;
    
    $scope.lv = quizService.lv;

    $scope.total_grade = 0.0;

    
    $scope.incompleteQuizs = quizService.incompleteQuizs;
    $scope.readingQuizs = quizService.readingQuizs;
    $scope.listeningQuizs = quizService.listeningQuizs;

    
    $scope.paragraph = quizService.paragraph;
    $scope.paragraph_ko = quizService.paragraph_ko;


    $scope.incompleteQuizs_grade = 0;
    $scope.readingQuizs_grade = 0;
    $scope.listeningQuizs_grade = 0;

    var correct_cnt = 0;
    for(var i=0; i<$scope.incompleteQuizs.length; i++) {
      if($scope.incompleteQuizs[i].is_correct) {
	correct_cnt++;
      }
    }
    $scope.incompleteQuizs_grade =  (correct_cnt / $scope.incompleteQuizs.length) * 100;
    $scope.total_grade += $scope.incompleteQuizs_grade;
    $scope.incompleteQuizs_grade = $scope.incompleteQuizs_grade.toFixed(2);
    
    
    correct_cnt = 0;
    for(i=0; i<$scope.readingQuizs.length; i++) {
      if($scope.readingQuizs[i].is_correct) {
	correct_cnt++;
      }
    }
    $scope.readingQuizs_grade =  (correct_cnt / $scope.readingQuizs.length) * 100;
    $scope.total_grade += $scope.readingQuizs_grade;
    $scope.readingQuizs_grade =     $scope.readingQuizs_grade.toFixed(2);



    var num_qestions = 0;
    correct_cnt = 0;

    /*
    var script_html = "<b>Check in</b><p>F: Good morning, sir. Can I see your ticket and passport? </p><p>M: Certainly. There you are. </p> <p> F: Thank you. Okay and how many suitcases will you be checking in?</p><p> M: Just one suitcase.</p><p>F: Did you pack your bagage yourself?</p><p>M: Yes, I did.</p><p>F: Do you have any electrical goods?</p><p>M: I have an electric shaver in my hand luggage. Is that okay?</p><p>F: That's fine. So nothing in your suitcase?</p><p>M: No.</p><p>F: Okay. Would you like a window or an aisle seat?</p><p>M: A window seat, please.</p><p>F: Okay. Just one moment. This is your seat number and the departure gate. You can go straight through to the departure lounge. Enjoy your flight. </p><p>M: What time will we be boarding?</p><p>F: We begin boarding at 7.</p><p>M: Okay. Thank you.</p>";
    */
    for(i=0; i< $scope.listeningQuizs.length; i++) {


      //$scope.listeningQuizs[i].script = script_html;
      
      var each_quiz = $scope.listeningQuizs[i];
      for(var t=0; t<each_quiz.question_container.length; t++) {
	num_qestions++;
	if($scope.listeningQuizs[i].question_container[t].is_correct) {
	  correct_cnt++;
	}
      }
    }

    
    $scope.listeningQuizs_grade =  (correct_cnt / num_qestions) * 100;
    $scope.total_grade += $scope.listeningQuizs_grade;
    $scope.listeningQuizs_grade = $scope.listeningQuizs_grade.toFixed(2);

    
    $scope.total_grade = ($scope.total_grade / 3.0).toFixed(2);


    
    
    

    $scope.is_v = true;


    $scope.goTodayquiz = function() {
      
      $ionicHistory.goBack();
      //$state.go('app.day-task');
    };


  }]);
