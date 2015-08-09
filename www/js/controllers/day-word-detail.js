angular.module('starter.controllers')
  .controller('daywordDetailCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$filter', '$window', '$cordovaDialogs', 'dayword_info', '$interval', '$cordovaToast', '$cordovaSpinnerDialog', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $filter, $window, $cordovaDialogs, dayword_info, $interval, $cordovaToast, $cordovaSpinnerDialog){

    /*
    $scope.$on('destory_word_detail', function() {
      $ionicHistory.clearCache();
      //$rootScope.myGoBack();
    });
    */
    var init = function() {
      setTimeout( function() {
	$cordovaSpinnerDialog.hide();
      }, 1000);
      $cordovaSpinnerDialog.show("","오늘의 단어 로딩중", true);
    };
    init();
    
    $rootScope.menu_opt.prev_refresh = $rootScope.menu_opt.refresh;
    $rootScope.menu_opt.prev_find = $rootScope.menu_opt.find;
    $rootScope.menu_opt.refresh = false;
    $rootScope.menu_opt.find = true;

    var cplayer_map = {};
    var cplayer = null;
    var cplayer_index = -1;
    
    $scope.is_v = false;

    $scope.v = {vid: '', opts: {}};
    

    $scope.dayword_info = dayword_info.p;

    if($scope.dayword_info.dayword_container == null ||
       $scope.dayword_info.dayword_container == undefined) {

      alert('[error] dayword_info 정보가없음');
      return;
    }


    for(var i=0; i<$scope.dayword_info.dayword_container.length; i++) {
      $scope.dayword_info.dayword_container[i].opts = {
	autoplay: 0,
	controls: 0,
	html5: 1,
	modesbranding: 0,
	iv_load_policy: 3,
	showinfo: 0,
	rel:0,
	start: $scope.dayword_info.dayword_container[i].start,
	end: $scope.dayword_info.dayword_container[i].end,
	playsinline: 1
      };
    };


    $scope.dayword_container = $scope.dayword_info.dayword_container;
    $scope.date = $scope.dayword_info.date;


    //$scope.word = {};

    
    var cnt = $scope.dayword_container.length;

    for(i=0; i<cnt; i++) {

      if($scope.dayword_container[i].word_container.length > 0) {
	
	$scope.dayword_container[i].word = $scope.dayword_container[i].word_container[0];
	
	$scope.dayword_container[i].word.prev = false;
	$scope.dayword_container[i].word.next = false;
	$scope.dayword_container[i].word.index = 0;
	
	$scope.dayword_container[i].time = {h:0, m:0, s: 0};

	
	if($scope.dayword_container[i].word_container.length > 1) {
	  $scope.dayword_container[i].word.next = true;
	} else {
	  $scope.dayword_container[i].word.next = false;
	}
      }      
    }


      
    var secondsToTime = function(secs) {
      var hours = Math.floor(secs / (60 * 60));
      
      var divisor_for_minutes = secs % (60 * 60);
      var minutes = Math.floor(divisor_for_minutes / 60);
      
      var divisor_for_seconds = divisor_for_minutes % 60;
      var seconds = Math.ceil(divisor_for_seconds);
      
      var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
      };
      return obj;
    };

    var is_auto_next = true;

    $scope.next_word = function(index, word_index) {
      if(is_auto_next) {
	$cordovaToast.showShortBottom('자동넘김 기능 비활성 되었습니다');
      }
      is_auto_next = false;
      var word_container = $scope.dayword_container[index].word_container;
      if(word_container.length > word_index) {
     	$scope.dayword_container[index].word = word_container[word_index+1];	
	var c_index = word_index + 1;
	
	$scope.dayword_container[index].word.index = c_index;

	//console.log(c_index);
	if(word_container.length-1 > c_index) {
	  $scope.dayword_container[index].word.next = true;
	} else {
	  $scope.dayword_container[index].word.next = false;
	}

	$scope.dayword_container[index].word.prev = true;
	
      } else {
	alert('에러발생');
      }
    };

    $scope.prev_word = function(index, word_index) {
      if(is_auto_next) {
	$cordovaToast.showShortBottom('자동넘김 기능 비활성 되었습니다');
      }
      is_auto_next = false;
      var word_container = $scope.dayword_container[index].word_container;
      
      $scope.dayword_container[index].word = word_container[word_index-1];

      if(word_index < 1) {
	$scope.dayword_container[index].word.prev = false;
      }
      $scope.dayword_container[index].word.next = true;
    };


    $scope.anext_word = function(index, word_index) {
      if(!is_auto_next) {
	return;
      }
      var word_container = $scope.dayword_container[index].word_container;
      if(word_container.length > word_index) {
     	$scope.dayword_container[index].word = word_container[word_index+1];	
	var c_index = word_index + 1;
	
	$scope.dayword_container[index].word.index = c_index;

	//console.log(c_index);
	if(word_container.length-1 > c_index) {
	  $scope.dayword_container[index].word.next = true;
	} else {
	  $scope.dayword_container[index].word.next = false;
	}

	$scope.dayword_container[index].word.prev = true;
	
      } else {
	alert('에러발생');
      }
    };

    var promise;   
    $scope.start = function() {
      promise = $interval(function() {
	if(cplayer &&  cplayer_index != -1) {
	  var rtn = secondsToTime(cplayer.getCurrentTime().toFixed(0));
	  console.log(rtn);
	  $scope.dayword_container[cplayer_index].time = rtn;


	  if($scope.dayword_container[cplayer_index].word.start+5 < cplayer.getCurrentTime()) {
	    if($scope.dayword_container[cplayer_index].word.index < $scope.dayword_container[cplayer_index].word_container.length-1) {
	      $scope.anext_word(cplayer_index, $scope.dayword_container[cplayer_index].word.index);
	    }
	  }

	  
	}
      }, 1000);

    };

    $scope.stop = function() {
      $interval.cancel(promise);
    };

    $scope.start();
    
    $scope.$on('$destroy', function() {
      $scope.stop();
    });

    /*
    stop = $interval(function() {
      if(cplayer &&  cplayer_index != -1) {
	var rtn = secondsToTime(cplayer.getCurrentTime().toFixed(0));
	console.log(rtn);
	$scope.dayword_container[cplayer_index].time = rtn;
      }
    }, 1000);
     */

    
    $scope.play_seek = function(index, start) {

      if(index < 0) {
	return;
      }
      
      if(!cplayer_map[index].is_playing) {	                     
	$cordovaToast.showShortCenter('동영상 재생시 가능합니다');
	return;
      }

      if(cplayer_map[index].is_pausing) {
	$cordovaToast.showShortCenter('동영상 재생시 가능합니다');
	return;
      }

      cplayer = cplayer_map[index].player;
      cplayer_index = index;

      cplayer_map[index].player.seekTo(start);
    };
    

    $scope.$on('youtube.player.ready', function ($event, player) {
      
      var p = {player: player, is_playing: false, is_pausing: false};
     
      for(var i=0; i<$scope.dayword_container.length; i++) {
	// id도 체크해야할듯 안그러면 다른 동영상이라도 0에서 시작하면 map에 들어가버림
	if($scope.dayword_container[i].start == player.B.currentTime) {
	  cplayer_map[i] = p;
	}
      }

    });

    $scope.$on('youtube.player.paused', function ($event, player) {
      
      for( i in cplayer_map ) {
	if( cplayer_map[i].player.v == player.v ) {
	  cplayer_map[i].is_pausing = true;
	}
      };
      
    });
    
    
    $scope.$on('youtube.player.ended', function ($event, player) {

      for( i in cplayer_map ) {
	if( cplayer_map[i].player.v == player.v ) {
	  cplayer_map[i].is_playing = false;
	  cplayer_map[i].is_pausing = false;
	}
      };
      
    
    });

    
    $scope.$on('youtube.player.playing', function ($event, player) {

      for( i in cplayer_map ) {
	if( cplayer_map[i].player.v == player.v ) {
	  
	  cplayer = player;
	  cplayer_index = i;

	  if(cplayer_map[i].is_pausing) {
	    cplayer_map[i].is_pausing = false;
	  }
	  
	  if(!cplayer_map[i].is_playing) {
	    cplayer_map[i].is_playing = true;
	    //cplayer_map[i].is_pausing = false;
	    player.seekTo($scope.dayword_info.dayword_container[i].start);
	  }

	} else {
	  if(cplayer_map[i].is_playing) {
	    cplayer_map[i].is_pausing = true;
	    cplayer_map[i].player.pauseVideo();
	  }
	}
      }
     
    });

    $scope.$on('pause', function() {
      for(var i in cplayer_map) {
	if(cplayer_map[i].is_playing) {
	  cplayer_map[i].is_pausing = true;
	  cplayer_map[i].player.pauseVideo();	  
	}
      }
    });
    

    $scope.is_v = true;
    
    
  }]);

