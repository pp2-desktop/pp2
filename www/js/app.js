// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'angularMoment', 'pickadate', 'ngCordovaOauth', 'youtube-embed'])

  .run(function($ionicPlatform, $cordovaStatusbar, $cordovaDevice, $rootScope, $cordovaSQLite, $cordovaNetwork, $cordovaToast, $cordovaAppVersion, $http, $cordovaPush) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
	cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      /*
      if (window.StatusBar) {
	// org.apache.cordova.statusbar required
	StatusBar.styleDefault();
      }
      */
      // google youtube api 인증
    
      /*
      var androidConfig = {
	"senderID": '251697108376'
      };

      $cordovaPush.register(androidConfig).then(function(result) {
	//alert('push reg config ok');
      }, function(err) {
	//alert('push reg config error');
      });
      
      $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
	switch(notification.event) {
        case 'registered':
          if (notification.regid.length > 0 && $rootScope.user_info.device.uuid != -1) {
	    
	    var req_url = 'http://s.05day.com/p/a/' +  $rootScope.user_info.device.uuid + '/' + notification.regid;
	    
	    $http.get(req_url).
	      success(function(data, status, headers, config) {
	      }).
	      error(function(data, status, headers, config) {
	      });
	    
	    //alert(notification.regid);
            //alert('registration ID = ' + notification.regid);
          }
          break;

        case 'message':
          //alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
	  $cordovaToast.showShortCenter(notification.message);
          break;

        case 'error':
          alert('GCM error = ' + notification.msg);
          break;

        default:
          alert('An unknown GCM event has occurred');
          break;
	}
      });
      */


      var iosConfig = {
	"badge": true,
	"sound": true,
	"alert": true
      };

      
      if(ionic.Platform.isIOS()) {
	window.IDFVPlugin.getIdentifier(function(result){ 
	  $rootScope.user_info.device.uuid = result;

	  $cordovaPush.register(iosConfig).then(function(deviceToken) {
	    var req_url = 'http://s.05day.com/p/i/' +  $rootScope.user_info.device.uuid + '/' + deviceToken;
	    
	    $http.get(req_url).
	      success(function(data, status, headers, config) {
	      }).
	      error(function(data, status, headers, config) {
	      });
	    
	  }, function(err) {
	    alert("Registration error: " + err);
	  });
	  
	},function(error){ alert(error); });
      }

   




      if((window.device && device.platform == 'iOS') && window.storekit) {
        storekit.init({
          debug:    true,
          ready:    function() {
            storekit.load(['wordEday', 'quizEday', 'wordquizEday', 'oneyearEday'], function (products, invalidIds) {
	      console.log(products);
              //console.log("In-app purchases are ready to go");
            });
          },
	  
          purchase: function(transactionId, productId, receipt) {
            if(productId === 'wordEday') {
	      
              alert('단어');
            } else if(productId == 'quizEday') {
	      
              alert('퀴즈');
	    } else if(productId == 'wordquizEday') {
	      
              alert('영어데이 콤보');
	    } else if(productId == 'oneyearEday') {
	      
              alert('1년');
	    }
	    
          },
          restore:  function(transactionId, productId, transactionReceipt) {
            if(productId === 'productId1') {
              console.log("Restored product id 1 purchase");
            }
          },
          error:    function(errorCode, errorMessage) {
            console.log("ERROR: " + errorMessage);
          }
        });
      }

      
      $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
	if (notification.alert) {
          navigator.notification.alert(notification.alert);
	}

	// media 수정해야함, 소리안남
	if (notification.sound) {
          var snd = new Media(event.sound);
          snd.play();
	}

	if (notification.badge) {
          $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
            // Success!
          }, function(err) {
            // An error occurred. Show a message to the user
          });
	}
      });


      
      
      $cordovaAppVersion.getAppVersion().then(function (version) {
	$rootScope.user_info.device.app_version = version;
      });
      //$rootScope.get_user_info();
      onDeviceReady();

      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
	$rootScope.network.type = $cordovaNetwork.getNetwork();
	var _msg = $rootScope.network.type + '로 연결되었습니다';
	$cordovaToast.showShortCenter(_msg);
	
	$rootScope.network.is_online = true;
      });

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
	//var offlineState = networkState;
	$cordovaToast.showShortCenter('오프라인 상태');
	$rootScope.network.is_online = false;
      });


      $rootScope.db = $cordovaSQLite.openDB("pp2.db");
      $cordovaSQLite.execute( $rootScope.db, "CREATE TABLE IF NOT EXISTS user_fb_info (id integer primary key)");
      $rootScope.select();
      
      /*
      if((window.device && device.platform == "Android") && typeof inappbilling !== "undefined") {
	inappbilling.init(function(resultInit) {
	  //alert('inappbilling.init');
	  //alert(resultInit);
	  //$rootScope.user_info.is_iap_init = true;
	  //alert('성공');
	},
			  function(errorInit) {
			    alert(errorInit);
			    //alert('inappbilling.error');
			    //alert(errorInit);
			  }, 
			  {showLog: true},
			  ["word", "quiz", "word.quiz", "word.quiz.ayear"]);
      }
       */
      
	
	//$rootScope.db = $cordovaSQLite.openDB("my.db");
	//alert(db);
	//$cordovaPlugin.someFunction().then(success, error);
      
      function onDeviceReady() {
        document.addEventListener("pause", function (event) {
          $rootScope.$broadcast('cordovaPauseEvent');
        });

        document.addEventListener("resume", function (event) {
          $rootScope.$broadcast('cordovaResumeEvent');
        });
      }

    });
  })
  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, pickadateI18nProvider) {
    $ionicConfigProvider.tabs.position('bottom');

    pickadateI18nProvider.translations = {
      prev: '<button style="color:black;" class="button-clear"><i style="font-size: 25px;" class="ion-arrow-left-c"></i></button>',
      next: '<button style="color:black;" class="button-clear"><i style="font-size: 25px;" class="ion-arrow-right-c"></i></button>'
    };
    
    $stateProvider

      .state('app', {
	url: "/app",
	abstract: true,
	templateUrl: "templates/menu.html",
	controller: 'AppCtrl'
      })

      .state('app.search', {
	url: "/search",
	views: {
	  'menuContent': {
            templateUrl: "templates/search.html"
	  }
	}
      })

      .state('app.browse', {
	url: "/browse",
	views: {
	  'menuContent': {
            templateUrl: "templates/browse.html"
	  }
	}
      })
      .state('app.home', {
	url: "/home",
	views: {
          'menuContent': {
            templateUrl: "templates/home.html",
            controller: 'homeCtrl'
          }
	}
      })
      .state('app.board', {
	url: "/board",
	views: {
          'menuContent': {
            templateUrl: "templates/board.html",
            controller: 'boardCtrl'
          }
	}
      })
    .state('app.board-detail', {
    url: "/board/:detail",
    views: {
      'menuContent': {
        templateUrl: "templates/board-detail.html",
        controller: 'boarddetailCtrl'
      }
    }})
      .state('app.studygroup', {
	url: "/studygroup",
	views: {
          'menuContent': {
            templateUrl: "templates/studygroup.html",
            controller: 'studygroupCtrl'
          }
	}
      })
      .state('app.faq', {
	url: "/faq",
	views: {
          'menuContent': {
            templateUrl: "templates/faq.html",
            controller: 'faqCtrl'
          }
	}
      })
      .state('app.notice', {
	url: "/notice",
	views: {
          'menuContent': {
            templateUrl: "templates/notice.html",
            controller: 'noticeCtrl'
          }
	}
      })
      .state('app.chat', {
	url: "/chat",
	views: {
          'menuContent': {
            templateUrl: "templates/chat.html",
            controller: 'chatCtrl'
          }
	}
      })
    
      .state('app.single', {
	url: "/playlists/:playlistId",
	views: {
	  'menuContent': {
            templateUrl: "templates/playlist.html",
            controller: 'PlaylistCtrl'
	  }
	}
      })
      .state('app.parent-child', {
	url: "/home/parent-child/:parent",
	views: {
          'menuContent': {
            templateUrl: "templates/parent-child.html",
            controller: 'parentChildCtrl'
          }
	}
      })
      .state('app.parent', {
	url: "/home/:parent",
	views: {
          'menuContent': {
            templateUrl: "templates/parent.html",
            controller: 'parentCtrl'
          }
	}
      })
      .state('app.child', {
	url: "/home/:parent/:child",
	views: {
          'menuContent': {
            templateUrl: "templates/child.html",
            controller: 'childCtrl'
          }
	}
      })
      .state('app.day-task', {
	url: "/day-task",
	views: {
          'menuContent': {
            templateUrl: "templates/day-task.html",
            controller: 'daytaskCtrl'
          }
	}
      })
      .state('app.day-task-detail', {
	url: "/day-task-detail/:date",
	views: {
          'menuContent': {
            templateUrl: "templates/day-task-detail.html",
            controller: 'daytaskdetailCtrl'
          }
	}
      })
      .state('app.day-task-result', {
	url: "/day-task-detail/result/:date",
	views: {
          'menuContent': {
            templateUrl: "templates/day-task-result.html",
            controller: 'daytaskresultCtrl'
          }
	}
      })
      .state('app.day-word', {
	url: "/day-word",
	views: {
          'menuContent': {
            templateUrl: "templates/day-word.html",
            controller: 'daywordCtrl'
          }
	}
      })
      .state('app.day-word-detail', {
	url: "/day-word-detail",
	views: {
          'menuContent': {
            templateUrl: "templates/day-word-detail.html",
            controller: 'daywordDetailCtrl'
          }
	}
      })
     .state('app.try-quiz', {
	url: "/try-quiz",
	views: {
          'menuContent': {
            templateUrl: "templates/try-quiz.html",
            controller: 'tryquizCtrl'
          }
	}
      })
      .state('app.user-setting', {
	url: "/user-setting",
	views: {
          'menuContent': {
            templateUrl: "templates/user-setting.html",
            controller: 'userSettingCtrl'
          }
	}
      })
      .state('app.day-store', {
	url: "/day-store/:where",
	views: {
          'menuContent': {
            templateUrl: "templates/day-store.html",
            controller: 'dayStoreCtrl'
          }
	}
      })
      .state('app.login', {
	url: "/login",
	views: {
          'menuContent': {
            templateUrl: "templates/login.html",
            controller: 'loginCtrl'
          }
	}
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
  });
