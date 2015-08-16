angular.module('starter.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $ionicViewService, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicTabsDelegate, $ionicActionSheet, $cordovaInAppBrowser, $ionicHistory, $window, $cordovaDialogs, $cordovaOauth,  $cordovaNetwork, $http, $cordovaToast, $cordovaSQLite, $interval, $cordovaDevice, $ionicPlatform, $cordovaSpinnerDialog) {
    // Form data for the login modal
    $scope.loginData = {};
    $rootScope.is_watch_video = false;

    $rootScope.network = {type: 'none', is_online: true};


    //$rootScope.user = { lv: 1};

    // db 에서 정보가져와서 채워주기
    // uid 는 sqlite같은곳에 저장
    $rootScope.place = 'app.home';

    $rootScope.user_info = {
      device: { app_version: -1, uuid: -1, word_on: false, word_on: false, quiz_on: false,  word_date: -1, quiz_date: -1, is_free_trial_done: true},
      fb: { id:-1, gender:'', link: '', name: '', email: '', word_on: false, quiz_on: false, word_date: -1, quiz_date: -1},
      is_iap_init: false
      //is_paid_device: false
    };

    $rootScope.q = {lv:1, done_container: []};

    var promise = null;
    var acquire_uuid = function() {
      promise = $interval(function() {
	if($rootScope.user_info.device.uuid != -1) {
	  $rootScope.$broadcast('refreshHome');
	  $interval.cancel(promise);
	} else {
	  //alert('[debug] uuid 없음');
	  $rootScope.user_info.device.uuid = $cordovaDevice.getUUID();
	}
      }, 1000);
    };
    acquire_uuid();

    $rootScope.get_user_info = function() {
      // device 정보 요청하기

      if($rootScope.user_info.device.uuid == -1 || $rootScope.user_info.device.uuid == undefined) {
	$cordovaToast.showShortCenter('디바이스 uuid 없음');
	return; 
      }

      //$cordovaToast.showShortCenter('계정정보 갱신중');
      
      //$rootScope.user_info.device.uuid = $cordovaDevice.getUUID();
      
      var req_url = 'http://s.05day.com/u/get-info/' + $rootScope.user_info.device.uuid;
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  var rtn = data;
	  
	  if(!rtn.result) {
	    // error 번호 정의하기
	    //$cordovaToast.showShortCenter('네트워크 상태 디바이스 정보 가져오기 실패');
	    return;
	  } else {
	    $rootScope.user_info.device.is_free_trial_done = rtn.user_info.is_free_trial_done;
	    $rootScope.user_info.device.word_date = rtn.user_info.word_date;
	    $rootScope.user_info.device.quiz_date = rtn.user_info.quiz_date;
	    $rootScope.user_info.device.word_on = rtn.user_info.word_on;
	    $rootScope.user_info.device.quiz_on = rtn.user_info.quiz_on;
	    //$cordovaToast.showShortCenter('디바이스 계정 업데이트 완료');
	  }
	  
	}).
	error(function(data, status, headers, config) {
	  $cordovaToast.showShortCenter('오프라인 상태');
	});


      // fb 유저 정보요청하기

      if($rootScope.user_info.fb.id != -1 && $rootScope.user_info.fb.id != undefined) {
	var req_url2 = 'http://s.05day.com/u/get-fb-info/' + $rootScope.user_info.fb.id;
	$http.get(req_url2).
	  success(function(data, status, headers, config) {
	    var rtn = data;
	    
	    if(!rtn.result) {
	      // error 번호 정의하기
	      //alert('[error] 유저정보 가져오다가 문제발생');
	      $cordovaToast.showShortCenter('네트워크 상태 fb 유저정보 가져오기 실패');
	      
	      if($rootScope.network.is_online) {
		$rootScope.remove($rootScope.user_info.fb.id);
		//$cordovaToast.showShortCenter('디바이스에서 fb계정 정보 삭제');
	      }
	      return;
	    } else {
	      $rootScope.user_info.fb.word_date = rtn.user_fb_info.word_date;
	      $rootScope.user_info.fb.quiz_date = rtn.user_fb_info.quiz_date;
	      $rootScope.user_info.fb.word_on = rtn.user_fb_info.word_on;
	      $rootScope.user_info.fb.quiz_on = rtn.user_fb_info.quiz_on;

	      $rootScope.user_info.fb.email = rtn.user_fb_info.email;
	      $rootScope.user_info.fb.name = rtn.user_fb_info.name;
	      $rootScope.user_info.fb.gender = rtn.user_fb_info.gender;

	      //$cordovaToast.showShortCenter('Facebook계정 업데이트 완료');
	    }
	    
	  }).
	  error(function(data, status, headers, config) {
	    $cordovaToast.showShortCenter('오프라인 상태');
	  });
	 
      }

    };




    $rootScope.insert = function(id) {
      var query = "INSERT INTO user_fb_info (id) VALUES (?)";
      $cordovaSQLite.execute($rootScope.db, query, [id]).then(function(res) {
	//alert('db insert 성공');
      }, function (err) {
	//alert('db insert 실패');
      });
    };


    $rootScope.select = function() {
      var query = "SELECT * FROM user_fb_info";
      $cordovaSQLite.execute($rootScope.db, query, []).then(function(res) {
        if(res.rows.length > 0) {
	  $rootScope.user_info.fb.id = res.rows.item(0).id;
	  $rootScope.get_user_info();
	  //alert(res.rows.item(0).id);
	  /*
          console.log("SELECTED -> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname);
	   */
        } else {
	  $rootScope.get_user_info();
	  //$cordovaToast.showShortCenter('[debug] Facebook로그아웃 상태');
          //alert("No results found");
        }
      }, function (err) {
	alert(err);
        console.error(err);
      });
    };

    $rootScope.remove = function(id) {
      var query = "DELETE FROM user_fb_info where id= ?;";
      $cordovaSQLite.execute($rootScope.db, query, [id]).then(function(res) {
	//$cordovaToast.showShortCenter('[debug] db에서 Facebook계정 삭제 성공');
      }, function (err) {
	//$cordovaToast.showShortCenter('[debug] db에서 Facebook계정 삭제 실패');
	alert(err);
      });
    };


    $ionicPlatform.ready(function(){
      //$rootScope.get_user_info();
      // 못가져오는 경우가 가끔 있음 분석해야함
      //$timeout( function(){ $rootScope.get_user_info(); }, 4000);
    });
    
      
      $ionicModal.fromTemplateUrl('templates/login-auth.html', {
	scope: $rootScope,
	animation: 'slide-in-up'
      }).then(function(modal) {
	$rootScope.login_modal = modal;
      });

    //var _appId = 1712769318950469;
    var _appId = 721790297932382;
    
    $rootScope.login = function() {
      if(!$rootScope.user_info.device.is_free_trial_done) {
	$cordovaToast.showShortCenter('오늘의 단어에 가셔서 무료체험하기 버튼을 먼저 클릭해주세요');
	return;
      }

      var is_paid_device = false;
      if($rootScope.user_info.device.word_on || $rootScope.user_info.device.quiz_on) {
	is_paid_device = true;
      }
      
      $cordovaOauth.facebook(_appId, ["email"]).then(function(result) {
	var req_url = 'https://graph.facebook.com/me?access_token=' + result['access_token'];
	
	$http.get(req_url).
	  success(function(data, status, headers, config) {

	    $rootScope.user_info.fb = data;
	    //$rootScope.user_info.is_login = true;
	    
	    $http({
	      url: 'http://s.05day.com/u/get-fb-info',
	      method: "POST",
	      data: { 'data' : $rootScope.user_info.fb }
	      //data: $scope.data.parent
	    })
	      .then(function(res) {

		var rtn = res.data;

		if(!rtn.result) {
		  //$rootScope.user_info.is_login = false;
		  $rootScope.user_info.fb = { id:-1, gender:'', link: '', name: '', email: '', word_on: false, quiz_on: false, word_date: -1, quiz_date: -1};
		} else {
		  //$rootScope.user_info.is_login = true;

		  $rootScope.user_info.fb.word_date = rtn.user_info.word_date;
		  $rootScope.user_info.fb.quiz_date = rtn.user_info.quiz_date;
		  $rootScope.user_info.fb.word_on = rtn.user_info.word_on;
		  $rootScope.user_info.fb.quiz_on = rtn.user_info.quiz_on;

		  $rootScope.user_info.device.is_free_trial_done = true;
		  //$rootScope.is_fb_transfer_done = true;

		  $rootScope.insert($rootScope.user_info.fb.id);

		  if(is_paid_device) {
		    $rootScope.close_login();
		    $cordovaToast.showShortCenter('Facebook 로그인 성공');
		    $scope.$broadcast('update');
		    $rootScope.update_dailyquiz($rootScope.q.lv, false);
		    $window.location = "#app/user-setting";
		  } else {
		    $rootScope.close_login();
		    $scope.$broadcast('update');
		    $cordovaToast.showShortCenter('Facebook 로그인 성공');
		    $rootScope.update_dailyquiz($rootScope.q.lv, false);
		  }

		}
		
	      }, function(res) { 
		alert('[error] fb계정 가져오기 실패');
	      });
	  }).
	  error(function(data, status, headers, config) {
	    alert('[error] facebook 정보 가져오기 실패');
	  });
	
      }, function(error) {
	alert(error);
      });
    };

    $rootScope.open_login = function() {
      $rootScope.login_modal.show();
    };

    $rootScope.close_login = function() {
      $rootScope.login_modal.hide();
    };

    $rootScope.logout = function() {
      $rootScope.remove($rootScope.user_info.fb.id);
      $rootScope.user_info.fb = { id:-1, gender:'', link: '', name: '', email: '', word_on: false, quiz_on: false, word_date: -1, quiz_date: -1};
      $rootScope.login_modal.hide();
      $cordovaToast.showShortCenter('Facebook 로그아웃 성공');
      $rootScope.update_dailyquiz($rootScope.q.lv, false);
      // 로그아웃시 sqllite 에서도 삭제
    };

  

    $rootScope.onTabSelected = function(index){
      $ionicViewService.nextViewOptions({
	disableBack: true
      });

      if(index == 0) {
	//$rootScope.status = STATUS.HOME;
	$rootScope.menu_opt.prev_refresh = true;
	$rootScope.menu_opt.prev_find = true;
	$rootScope.menu_opt.refresh = true;
	$rootScope.menu_opt.find = true;
	$rootScope.place = 'app.home';
	$state.go('app.home');
      } else if(index == 1) {
	//$rootScope.status = STATUS.TASK;
	$rootScope.menu_opt.prev_refresh = true;
	$rootScope.menu_opt.prev_find = false;
	$rootScope.menu_opt.refresh = true;
	$rootScope.menu_opt.find = false;
	$rootScope.place = 'app.day-word';
	$state.go('app.day-word');
      } else if(index == 2) {
	$rootScope.menu_opt.prev_refresh = false;
	$rootScope.menu_opt.prev_find = false;
	$rootScope.menu_opt.refresh = false;
	$rootScope.menu_opt.find = false;
	$rootScope.place = 'app.day-task';
	$state.go('app.day-task');
	//$rootScope.$broadcast('refreshHome2');
      } else if(index == 3) {
	$rootScope.menu_opt.prev_refresh = false;
	$rootScope.menu_opt.prev_find = false;
	$rootScope.menu_opt.refresh = false;
	$rootScope.menu_opt.find = false;
	$rootScope.place = 'app.try-quiz';
	$state.go('app.try-quiz');
      } else if(index == 4) {
	$rootScope.menu_opt.prev_refresh = true;
	$rootScope.menu_opt.prev_find = true;
	$rootScope.menu_opt.refresh = true;
	$rootScope.menu_opt.find = true;
	$rootScope.place = 'app.board';
	$state.go('app.board');
      }
    };



    //$rootScope.is_loading = false;

    $rootScope.menu_opt = {refresh: true, find: true, prev_refrsh: true, prev_find: true};
    
    $rootScope.myGoBack = function() {

      //$rootScope.is_loading = false;
      if($ionicHistory.viewHistory().currentView.stateName == 'app.parent') {
	//$rootScope.status = STATUS.HOME;
      } else if($ionicHistory.viewHistory().currentView.stateName == 'app.parent-child') {
	//$rootScope.status = STATUS.PARENT_CHILD;	
      } else if($ionicHistory.viewHistory().currentView.stateName == 'app.child') {
	//$rootScope.status = STATUS.PARENT;	
      } else {
	//$scope.$broadcast('back');
      }
      
      $rootScope.menu_opt.refresh = $rootScope.menu_opt.prev_refrsh;
      $rootScope.menu_opt.find = $rootScope.menu_opt.prev_find;
      $rootScope.menu_opt.prev_refrsh = true;
      $rootScope.menu_opt.prev_find = true;


      var status  = $state.current.name;

      if (status == 'app.day-task-detail') {
	$rootScope.menu_opt.refresh = false;
	$rootScope.menu_opt.prev_refrsh = false;
	$rootScope.menu_opt.find = false;
	$rootScope.menu_opt.prev_find = false;
      } else if (status == 'app.day-task-result') {
	$rootScope.menu_opt.refresh = false;
	$rootScope.menu_opt.prev_refrsh = false;
	$rootScope.menu_opt.find = true;
	$rootScope.menu_opt.prev_find = true;
      }

      
      $ionicHistory.goBack();
    };

    /*
    $rootScope.status = STATUS.HOME;
    $rootScope.changeTabs = function() {
      $ionicTabsDelegate.select(2);
    };
    */

    $rootScope.refresh = function() {
      // 그냥 refresh 이벤트 1개면 될듯 어짜피 포커스없으면 불리지가 않음
      var status  = $state.current.name;
      if(status == 'app.home') {
	$scope.$broadcast('refreshHome');
      }
      else if(status == 'app.parent-child') {
	$scope.$broadcast('refreshParentchild');
      }
      else if(status == 'app.parent') {
	$scope.$broadcast('refreshParent');
      }
      else if(status == 'app.child') {
	$scope.$broadcast('refreshChild');
      } else {
	$scope.$broadcast('refresh');
      }
      /*
      else if($rootScope.status == STATUS.BOARD) {
	$scope.$broadcast('refreshBoard');
      }
      */
    };


    
     $rootScope.more = function() {
       alert('controller.js more');
       $ionicActionSheet.show({
	 titleText: 'ActionSheet Example',
	 buttons: [
           { text: '<i class="icon ion-share"></i> Share' },
           { text: '<i class="icon ion-arrow-move"></i> Move' },
	 ],
	 destructiveText: 'Delete',
	 cancelText: 'Cancel',
	 cancel: function() {
           console.log('CANCELLED');
	 },
	 buttonClicked: function(index) {
           console.log('BUTTON CLICKED', index);
           return true;
	 },
	 destructiveButtonClicked: function() {
           console.log('DESTRUCT');
           return true;
	 }
       });
    };
     

    $rootScope.find = function() {
      
      var status  = $state.current.name;
      if(status == 'app.day-task-detail' || status == 'app.day-task-result' || status == 'app.day-word-detail') {
	$rootScope.open_dict();
      } else if(status == 'app.home' || status == 'app.parent' || status == 'app.child' || status == 'app.parent-child') {
	$cordovaToast.showShortCenter('동영상 검색 서비스 준비중입니다');

      }
      
      /*
      $cordovaToast.showShortCenter('서비스 준비중입니다');
      return;
      $cordovaDialogs.prompt('원하시는 동영상 찾기', '검색', ['검색', '취소'], '키워드 입력')
	.then(function(result) {
	  // no button = 0, 'OK' = 1, 'Cancel' = 2
	  var keyword = result.input1;
	  var btnIndex = result.buttonIndex;
	  
	  if(btnIndex == 1) {
	    //var args = {keyword: keyword};
	    //$rootScope.$broadcast('find', args);
	    $scope.keyword = keyword;
	    $ionicModal.fromTemplateUrl('templates/find.html', {
	      scope: $scope
	    }).then(function(modal) {
	      $scope.modal = modal;
	      $scope.modal.show();
	    });

	  }
	});
      */
    };

    $scope.closeFind = function() {
      $scope.modal.hide();
      $scope.keyword = '';
    };

    $scope.$on('cordovaPauseEvent', function() {
      $scope.$broadcast('pause');
      $cordovaInAppBrowser.close();
    });




    // 강제 업데이트 때문에 중요
    $scope.$on('cordovaResumeEvent', function() {
      $scope.$broadcast('refresh');
	if(ionic.Platform.isIOS()) {
	  var options = {
	    location: 'no',
	    clearcache: 'yes',
	    toolbar: 'no',
	    allowInlineMediaPlayback: 'yes'
	  };
	} else {
	  options = {
	    location: 'no',
	    clearcache: 'yes',
	    toolbar: 'no'
	  };
	}

	if($rootScope.is_watch_video) {

	  $cordovaDialogs.confirm('동영상을 다시 보시겠습니까?', '알림', ['다시보기','닫기'])
	    .then(function(buttonIndex) {

	      var btnIndex = buttonIndex;

	      if(btnIndex == 1) {

		if($rootScope.network.is_online) {
		  
		  $cordovaInAppBrowser.open($scope.url, '_blank', options)
		    .then(function(event) {
		    })
		    .catch(function(event) {
		    });

		} else {
		  $cordovaDialogs.alert('오프라인 상태에서는 동영상을 보실수 없습니다.', '오류', '닫기')
		    .then(function() {
		      $rootScope.is_watch_video = false;
		    });
		}
	      } else if(btnIndex == 2) {
		$rootScope.is_watch_video = false;
	      }
	      
	    });
	}
    });



/*
    $ionicModal.fromTemplateUrl('templates/in-app-purchase.html', {
      scope: $rootScope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $rootScope.in_app_purchase_modal = modal;
    });
    
    $rootScope.openInappPurchaseModal = function() {
      $rootScope.in_app_purchase_modal.show();
    };
    
    $rootScope.closeInappPurchaseModal = function() {
      $rootScope.in_app_purchase_modal.hide();
    };

    $rootScope.buy_item = function(type) {
      
      inappbilling.buy(function(data) {
	alert("PURCHASE SUCCESSFUL");
	alert(data);
      }, function(errorBuy) {
	alert("PURCHASE FAIL");
	alert(errorBuy);
      }, "quiz");
    };
  */

   /*
   $rootScope.track = function(where) {
     
     if($rootScope.user_info.device.uuid == -1) {
       return ;
     }
     var track_url = 'http://s.05day.com/l/' + $rootScope.user_info.device.uuid + '/' + where;

     $http.get(track_url).
       success(function(data, status, headers, config) {
       }).
       error(function(data, status, headers, config) {
       });
   };
   */


    $rootScope.check_view_history = function(uid, req_view_container, callback) {
      $http({
	url: 'http://s.05day.com/u/view-history/',
	method: "POST",
	data: { 'req_view_container': req_view_container, 'uid': uid }
	//data: $scope.data.parent
      })
	.then(function(res) {

	  var rtn = res.data;
	  if(!rtn.result) {
	    callback(false, []);
	    
	  } else {
	    callback(true, rtn.view_container);

	  }
	  
	}, function(res) {
	  callback(false, []);
	  alert('[error] 뷰 체크 하는중 실패');
	});
    };

    $rootScope.open_dict = function(type) {

      var dict_url = 'http://m.endic.naver.com/';
      if(type == 'naver' || type == null || type == undefined) {
	dict_url = 'http://m.endic.naver.com/';
      }

      if(ionic.Platform.isIOS()) {
	var optiond = {
	  location: 'no',
	  clearcache: 'no',
	  toolbar: 'yes',
	  allowInlineMediaPlayback: 'yes'
	};
      } else {
	optiond = {
	  location: 'yes',
	  clearcache: 'no',
	  toolbar: 'yes'
	};
      }
      
      $cordovaInAppBrowser.open(dict_url, '_blank', optiond)
	.then(function(event) {
          // success
	})
	.catch(function(event) {
          // error
	});
    };
  

    $rootScope.watchVideo = function(parent, child, vid) {
      
      if($rootScope.network.is_online) {
	$rootScope.is_watch_video = true;

	if(ionic.Platform.isIOS()) {
	  var options = {
	    location: 'no',
	    clearcache: 'yes',
	    toolbar: 'no',
	    allowInlineMediaPlayback: 'yes'
	  };
	} else {
	  options = {
	    location: 'no',
	    clearcache: 'yes'
	  };
	}

	//$scope.url = 'http://v.05day.com/#/v/' + encodeURIComponent(parent) + '/' + encodeURIComponent(child) + '/' + encodeURIComponent(vid) + '/1234';
	if($rootScope.user_info.fb.id != -1) {
	  $scope.url = 'http://v.05day.com/#/v/' + encodeURIComponent(parent) + '/' + encodeURIComponent(child) + '/' + encodeURIComponent(vid) + '/' + $rootScope.user_info.fb.id;
	} else {
	  $scope.url = 'http://v.05day.com/#/v/' + encodeURIComponent(parent) + '/' + encodeURIComponent(child) + '/' + encodeURIComponent(vid) + '/' + $rootScope.user_info.device.uuid;
	}

	document.addEventListener("deviceready", function () {

	  $cordovaInAppBrowser.open($scope.url, '_blank', options)
	    .then(function(event) {
              // success
	      $rootScope.$broadcast('update_view', vid);
	    })
	    .catch(function(event) {
              // error
	    });

	  $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event) {
	    if (event.url.match("http://pp2.com")) {
	      $rootScope.is_watch_video = false;
              $cordovaInAppBrowser.close();
	    } else {
	      $scope.url = event.url;
	    }
	  });
	  $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event) {
	    if (event.url.match("http://pp2.com")) {
	      $rootScope.is_watch_video = false;
	    } else {
	      $scope.url = event.url;
	    }
	  });
	}, false);

      } else {
	$cordovaDialogs.alert('오프라인 상태에서는 동영상을 보실수 없습니다.', '오류', '닫기')
	  .then(function() {
	    
	  });
      }
    };



    $rootScope.update_dailyquiz = function(lv, is_spin) {
      var uid = $scope.user_info.device.uuid;
      if($scope.user_info.fb.id != -1) {
	uid = $scope.user_info.fb.id;
      }
      
      if(is_spin) {
	$cordovaSpinnerDialog.show("","퀴즈 정보 가져오는중", true);
      }
      
      var req_url = 'http://s.05day.com/u/daily-quiz/' + uid + '/' + lv;
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  var rtn = data;
	  $rootScope.q.done_container = rtn.done_container;
	  $rootScope.q.lv = lv;

	  if(is_spin) {
	    $cordovaSpinnerDialog.hide();
	  }
	}).
	error(function(data, status, headers, config) {
	  alert('[error] 데일리퀴즈 정보 가져오다가 실패');
	  if(is_spin) {
	    $cordovaSpinnerDialog.hide();
	  }
	});
    };
    
  })
  .controller('PlaylistCtrl', function($scope, $stateParams) {
    
  });
//$state.go('app.board');
