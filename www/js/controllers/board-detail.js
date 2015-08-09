angular.module('starter.controllers')
  .controller('boarddetailCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$timeout', '$stateParams', '$window', '$ionicModal', '$cordovaToast', '$cordovaDialogs', '$cordovaSpinnerDialog', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $timeout, $stateParams, $window, $ionicModal, $cordovaToast, $cordovaDialogs, $cordovaSpinnerDialog) {

    $scope.$on('refresh', function() {
      $scope.comment_container = [];
      init();
    });


    $scope.reply_container = {};
    
    $scope.post_info = { subject: '', comment: '', name: '', placeholder: '', email: '', is_modify: false, id: null};
    $scope.reply_info = { reply: '', comment_id: '', name: '', email: '', is_modify: false, id: null};


    var reset_post_info = function() {
      $scope.post_info = { subject: '', comment: '', name: '', placeholder: '', email: '', is_modify: false, id: null};
    };

    var reset_reply_info = function() {
      $scope.reply_info = { reply: '', comment_id: '', name: '', email: '', is_modify: false, id: null};
    };


    $ionicModal.fromTemplateUrl('templates/board-post.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/board-reply.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal_reply = modal;
    });
    
    $scope.openModal = function() {
      $scope.modal.show();
      $scope.post_info.is_modify = false;
      $timeout( function() {
	$scope.post_info.comment = '본문을 입력해주세요';
      }, 300);

      $timeout( function() {
	$scope.post_info.comment = '';
      }, 2000);
    };


    $scope.openModifyModal = function(subject, comment, id) {
      
      $scope.post_info.subject = subject;
      $scope.post_info.comment = comment;
      $scope.post_info.comment = $scope.post_info.comment.replace(/<br \/>/gi,'\n');
      
      $scope.post_info.id = id;
      $scope.post_info.is_modify = true;
      $scope.modal.show();
    };

    
    $scope.closeModal = function() {
      $scope.modal.hide();
    };


    $scope.comment_container = [];
    $scope.type = $stateParams.detail;
    $scope.db = '';
    $scope.is_next = false;

    var _url = 'http://s.05day.com/b/';
    //var _url = 'http://127.0.0.1:3000/b/';
    
    var readableTitle = function(type) {
      $scope.db = 'board_' + type;
      
      if(type == 'studygroup') {
	return '스터디그룹';
      } else if(type == 'qna_english') {
	return '영어관련 묻고 답하기';
      } else if (type == 'toeic') {
	return '토익 게시판';
      } else if (type == 'oversea') {
	return '유학 게시판';
      }

      return null;
    };
    $scope.title = readableTitle($stateParams.detail);


    var init = function() {
      $cordovaSpinnerDialog.show("","게시글 가져오는 중", true);
      var req_url = _url + encodeURIComponent($scope.db) + '/' + encodeURIComponent($scope.comment_container.length);
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  
	  var rtn = data;

	  if(!rtn.result) {
	    $cordovaToast.showShortCenter('게시글 정보 가져오기 실패');
	    $cordovaSpinnerDialog.hide();
	  } else {
	    $scope.is_next = rtn.is_next;
	    $scope.comment_container = rtn.comment_container;

	    for(var i=0; i<$scope.comment_container.length; i++) {
	      if(i==0) {
		$scope.comment_container[i].is_open = true;
	      } else {
		$scope.comment_container[i].is_open = false;
	      }
	    }

	    get_reply(0, $scope.comment_container.length);
	    $cordovaSpinnerDialog.hide();
	    $cordovaToast.showShortCenter('게시글 갱신 완료');
	    //$rootScope.track($stateParams.detail);
	    var analytics = navigator.analytics;
	    analytics.setTrackingId('UA-65058003-1');
	    analytics.sendAppView($stateParams.detail, function() {}, function() {alert('anaytics 오류');});

	    if($scope.comment_container.length > 0 ) {
	      var req_url =  _url + '/view-comment/' + encodeURIComponent($scope.db) + '/' + encodeURIComponent($scope.comment_container[0]._id);
	      $http.get(req_url).
		success(function(data, status, headers, config) {
		}).
		error(function(data, status, headers, config) {
		});
	      }
	  }
	  
	}).
	error(function(data, status, headers, config) {
	  $cordovaSpinnerDialog.hide();
	  $cordovaToast.showShortCenter('게시글 요청중 네트워크 상태 불안정');
	  //alert('[error] 홈 요청중');
	});
    };
    init();



    var get_reply = function(startAt, endAt) {

      for(var i=startAt; i<endAt; i++) {
	$scope.comment_container[i].is_open_reply = false;
	$scope.comment_container[i].replys = [];

	var id = $scope.comment_container[i]._id;
	
	var req_url =  _url + '/get-reply/' + encodeURIComponent($scope.db) + '/' + encodeURIComponent(id);


	$http.get(req_url).
	  success(function(data, status, headers, config) {
	    var rtn = data;

	    if(!rtn.result) {
	      //alert('[error] reply 가져오기 실패');
	    } else {

	      for(var i=0; i<$scope.comment_container.length; i++) {
		
		if($scope.comment_container[i]._id == rtn.id) {
		  $scope.comment_container[i].replys = rtn.replys;
		}
	      };

	    }

	  }).
	  error(function(data, status, headers, config) {
	    alert('[error] 네트워크 문제 reply 가져오기 실패');
	  });	
      }

      $scope.open_replys = function(idx) {
	if($scope.comment_container[idx].replys.length <= 0) {
	  return;
	}
	$scope.comment_container[idx].is_open_reply = true;
      };

      $scope.close_replys = function(idx) {
	$scope.comment_container[idx].is_open_reply = false;
      };

      /*
      $scope.refresh_comment = function() {
	alert('fresh comment');
      };
      */
	    /*
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  // [ , , , , , , , ,];
	  var rtn = data;

	  if(!rtn.result) {
	    alert('[error] 게시판 정보 가져오기 실패');
	  } else {
	    var reply_cnt_container = rtn.reply_cnt_container;

	    for(var i=0; i<reply_cnt_container.length; i++) {
	      $scope.comment_container[i].reply_cnt = reply_cnt_container[i];	      
	    }
	  }
	  
	}).
	error(function(data, status, headers, config) {
	  //alert('[error] 홈 요청중');
	});
      */
    };

    $scope.open_comment = function(idx) {
      if($scope.comment_container.length > idx) {
	// http request view count++;
	$scope.comment_container[idx].is_open = true;

	var req_url =  _url + '/view-comment/' + encodeURIComponent($scope.db) + '/' + encodeURIComponent($scope.comment_container[idx]._id);
	$http.get(req_url).
	  success(function(data, status, headers, config) {
	  }).
	  error(function(data, status, headers, config) {
	  });
      }
    };




    $scope.post_comment = function() {
      if($rootScope.user_info.fb.id == -1) {
	$rootScope.open_login();
      } else {
	$scope.openModal();
      }
    };


    $scope.upload_comment = function() {
      if($scope.post_info.subject == '') {
	//alert('제목이 비어있습니다');
	$cordovaToast.showShortCenter('제목이 비어있습니다');
      } else if($scope.post_info.comment == '') {
	//alert('본문이 비어있습니다');
	$cordovaToast.showShortCenter('본문이 비어있습니다');
      } else {

	/*
	var c = { name: 'huni', view: 0, subject: $scope.post_info.subject, comment: $scope.post_info.comment, img:'', email: 'pp@gg.com'};
	 */
	$cordovaSpinnerDialog.show("","게시글 업로드중", true);
	$scope.post_info.comment = $scope.post_info.comment.replace(/\r?\n/g, '<br />');

	var c = { name: $rootScope.user_info.fb.name, view: 0, subject: $scope.post_info.subject, comment: $scope.post_info.comment, img:'', email: $rootScope.user_info.fb.email, fid: $rootScope.user_info.fb.id };

	var req_url = _url + '/comment/' + encodeURIComponent($scope.db);
	
	if($scope.post_info.is_modify) {
	  req_url = _url + '/m-comment/' + encodeURIComponent($scope.db) + '/'+ encodeURIComponent($scope.post_info.id);
	}

	$http({
	  url: req_url,
	  method: "POST",
	  data: { 'comment' : c }
	  //data: $scope.data.parent
	})
	  .then(function(response) {

	    if($scope.post_info.is_modify) {
	      
	      for(var i=0; i<$scope.comment_container.length; i++) {
		if($scope.comment_container[i]._id == $scope.post_info.id) {
		  $scope.comment_container[i].subject = $scope.post_info.subject;
		  $scope.comment_container[i].comment = $scope.post_info.comment;
		  $scope.closeModal();
		  break;
		}
	      }
	      reset_post_info();
	      $cordovaSpinnerDialog.hide();	      
	    } else {
	      $scope.comment_container = [];
	      init();
	      $scope.closeModal();
	      reset_post_info();
	      $cordovaSpinnerDialog.hide();
	    }
	    //$scope.post_info = { subject: '', comment: '', name: '', placeholder: ''};
	  }, function(response) { 
	    alert('[error] 게시글 저장 실패');
	    $scope.closeModal();
	    reset_post_info();
	    $cordovaSpinnerDialog.hide();
	    //$scope.post_info = { subject: '', comment: '', name: '', placeholder: ''};
	
	  });
      }
    };

    $scope.upload_reply = function() {
      
      if($scope.reply_info.comment_id == '') {
	alert('게시글 id 비어있습니다');
      } else if($scope.reply_info.reply  == '') {
	$cordovaToast.showShortCenter('댓글이 비어있습니다');
      } else {
	$cordovaSpinnerDialog.show("","댓글 업로드중", true);
	//var r = { comment_id: $scope.reply_info.id, reply: $scope.reply_info.reply, name: 'huni', emai: 'pp@gg.com'};
	$scope.reply_info.reply = $scope.reply_info.reply.replace(/\r?\n/g, '<br />');
	
	var r = { comment_id: $scope.reply_info.comment_id, reply: $scope.reply_info.reply, name:$rootScope.user_info.fb.name, email:$rootScope.user_info.fb.email, fid: $rootScope.user_info.fb.id};



	var req_url = _url + '/comment/reply/' + $scope.db;
	
	if($scope.reply_info.is_modify) {
	  req_url = _url + '/m-reply/' + encodeURIComponent($scope.db) + '/'+ encodeURIComponent($scope.reply_info.id);
	}


	$http({
	  url: req_url,
	  method: "POST",
	  data: { 'reply' : r }
	})
	  .then(function(response) {
	    // for id 기준으로
	    var comment_id = $scope.reply_info.comment_id;
	    var req_url =  _url + '/get-reply/' + encodeURIComponent($scope.db) + '/' +  encodeURIComponent(comment_id);

	    $http.get(req_url).
	      success(function(data, status, headers, config) {
		var rtn = data;

		if(!rtn.result) {
		  $cordovaToast.showShortCenter('댓글 갱신 실패');
		  $scope.modal_reply.hide();
		  $cordovaSpinnerDialog.hide();
		} else {

		  for(var i=0; i<$scope.comment_container.length; i++) {
		    
		    if($scope.comment_container[i]._id == rtn.id) {
		      $scope.comment_container[i].replys = rtn.replys;
		      $scope.comment_container[i].is_open_reply = true;
		      break;
		    }
		  };


		  $scope.modal_reply.hide();
		  reset_reply_info();
		  $cordovaSpinnerDialog.hide();
		}

	      }).
	      error(function(data, status, headers, config) {
		$cordovaToast.showShortCenter('네트워크 문제로 댓글 가져오기 실패');
		$scope.modal_reply.hide();
		$cordovaSpinnerDialog.hide();
		//alert('[error] 네트워크 문제 reply 가져오기 실패');
	      });	
	    
	    
	    
	  }, function(response) { 
	    //alert('[error] 댓글 저장 실패');
	    $cordovaToast.showShortCenter('네트워크 문제로 댓글 저장 실패');
	    $scope.modal_reply.hide();
	    reset_reply_info();
	    $cordovaSpinnerDialog.hide();
	  });
      }
    };


    $scope.cancel = function(index) {
      if(index == 0) {
	$scope.closeModal();
	reset_post_info();
      } else {
	$scope.modal_reply.hide();
	reset_reply_info();
      }
    };



    $scope.post_reply = function(idx) {
      if($rootScope.user_info.fb.id == -1) {	
	$rootScope.login_modal.show();
      } else {
	$scope.reply_info.comment_id = $scope.comment_container[idx]._id;
	$scope.modal_reply.show();

	$timeout( function() {
	  $scope.reply_info.reply = '댓글을 입력해주세요';
	}, 300);

	$timeout( function() {
	  $scope.reply_info.reply = '';
	}, 500);
      }
    };


    $scope.post_remove = function(idx) {
      $cordovaDialogs.confirm('정말 게시글을 삭제하시겠습니까?', '경고', ['삭제하기','취소'])
	.then(function(buttonIndex) {

	  var btnIndex = buttonIndex;

	  if(btnIndex == 1) {

	    if($scope.comment_container.length < idx ){
	      //alert('[error]삭제하고자 하는 게시글이 없습니다');
	      $cordovaToast.showShortCenter('게시글이 이미 삭제되었습니다');
	    } else {
	      $cordovaSpinnerDialog.show("","게시글 삭제중", true);
	      var req_url =  _url + '/remove-comment/' + encodeURIComponent($scope.db) + '/' + encodeURIComponent($scope.comment_container[idx]._id);
	      $http.get(req_url).
		success(function(data, status, headers, config) {
		  var rtn = data;

		  if(!rtn.result) {
		    $cordovaToast.showShortCenter('게시글 삭제 실패');
		    $cordovaSpinnerDialog.hide();
		  } else {
		    $cordovaToast.showShortCenter('성공적으로 게시글 삭제 되었습니다');
		    $scope.comment_container = [];
		    $cordovaToast.showShortCenter('게시글 갱신하기');
		    $cordovaSpinnerDialog.hide();
		    init();
		    
		  }

		}).
		error(function(data, status, headers, config) {
		  $cordovaSpinnerDialog.hide();
		  $cordovaToast.showShortCenter('네트워크 문제로 게시글 삭제 실패');
		});
	    }
	  }
	});
    };


    $scope.reply_remove = function(comment_id, reply_id) {
      $cordovaDialogs.confirm('정말 댓글을 삭제하시겠습니까?', '경고', ['삭제하기','취소'])
	.then(function(buttonIndex) {

	  var btnIndex = buttonIndex;

	  if(btnIndex == 1) {
	      var req_url =  _url + '/remove-reply/' + encodeURIComponent($scope.db) + '/' + encodeURIComponent(reply_id);
	    $cordovaSpinnerDialog.show("","댓글 삭제중", true);
	      $http.get(req_url).
		success(function(data, status, headers, config) {
		  var rtn = data;

		  if(!rtn.result) {
		    $cordovaToast.showShortCenter('댓글 삭제 실패');
		    $cordovaSpinnerDialog.hide();
		  } else {

		    //http req 댓글 갱신
		    var req_url =  _url + '/get-reply/' + encodeURIComponent($scope.db) + '/' + encodeURIComponent(comment_id);
		    $http.get(req_url).
		      success(function(data, status, headers, config) {
			var rtn = data;

			if(!rtn.result) {
			  //alert('[error] reply 가져오기 실패');
			  $cordovaToast.showShortCenter('댓글 갱신 실패');
			  $cordovaSpinnerDialog.hide();
			} else {

			  for(var i=0; i<$scope.comment_container.length; i++) {
			    
			    if($scope.comment_container[i]._id == rtn.id) {
			      $scope.comment_container[i].replys = rtn.replys;
			      if(rtn.replys.length <= 0) {
				$scope.comment_container[i].is_open_reply = false;
			      }
			      break;
			    }
			  };
			  $cordovaSpinnerDialog.hide();
			  $cordovaToast.showShortCenter('성공적으로 댓글이 삭제 되었습니다');

			}

		      }).
		      error(function(data, status, headers, config) {
			$cordovaSpinnerDialog.hide();
			//alert('[error] 네트워크 문제 reply 가져오기 실패');
			$cordovaToast.showShortCenter('네트워크 문제 댓글 삭제실패');
		      });	
		  }

		}).
		error(function(data, status, headers, config) {
		  //alert('[error] 네트워크 문제 댓글 삭제시도');
		  $cordovaSpinnerDialog.hide();
		  $cordovaToast.showShortCenter('네트워크 문제 댓글 삭제실패');
		});
	    
	  }
	});
    };

    
    $scope.post_modify = function(idx) {
      $scope.openModifyModal($scope.comment_container[idx].subject,
			     $scope.comment_container[idx].comment,
			     $scope.comment_container[idx]._id);
      // id기준으로 보내서 수정하고
      // refresh
    };

    $scope.reply_modify = function(c_id, r_id, reply) {
      
      $scope.reply_info.reply = reply;
      $scope.reply_info.is_modify = true;
      $scope.reply_info.id = r_id;
      $scope.reply_info.comment_id = c_id;



      $scope.reply_info.reply = $scope.reply_info.reply.replace(/<br \/>/gi,'\n');
      
      $scope.modal_reply.show();




      // id기준으로 보내서 수정하고
      // refresh
    };
    
    
    $scope.c_more = function() {
      $cordovaSpinnerDialog.show("","게시글 다가져오기", true);
      var req_url = _url + $scope.db + '/' + $scope.comment_container.length;
      $http.get(req_url).
	success(function(data, status, headers, config) {
	  
	  var rtn = data;


	  if(!rtn.result) {
	    $cordovaToast.showShortCenter('게시글 더 가져오기 실패');
	    $cordovaSpinnerDialog.hide();
	  } else {
	    console.log(rtn);
	    $scope.is_next = rtn.is_next;
	    var startAt = $scope.comment_container.length;
	    for(var i=0; i<rtn.comment_container.length; i++) {
	      rtn.comment_container[i].is_open = false;
	    }
	    $scope.comment_container = $scope.comment_container.concat(rtn.comment_container);


	    get_reply(startAt, $scope.comment_container.length);

	    $ionicScrollDelegate.scrollBy(0, $window.innerHeight/2, true);
	    $cordovaSpinnerDialog.hide();
	  }
	  
	}).
	error(function(data, status, headers, config) {
	  $cordovaSpinnerDialog.hide();
	  $cordovaToast.showShortCenter('네트워크 문제로 게시글 가져오기실패');
	  //alert('[error] 홈 요청중');
	});
    };
    
    
  }]);



angular.module('starter.controllers').directive('textarea', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attr){
      var update = function(){
        element.css("height", "auto");
        var height = element[0].scrollHeight; 
        element.css("height", element[0].scrollHeight + "px");
      };
      scope.$watch(attr.ngModel, function(){
        update();
      });
    }
  };
});


/*
 var test = function() {
      
      for(var i=0; i<10; i++) {

	var c = { _id: i.toString(), date: new Date(), name: 'huni', view: 0, title: '', body: '', img:'', email: 'pp@gg.com', is_open_reply: false, reply_container: []};
	$scope.board_container.push(c);
      }

      for(var j=0; j<10; j++) {
	
	for(var r=0; r<5; r++) {
	  var d = { reply_id: j.toString(), _id: i.toString(), date: new Date(), name: 'huni', body: '특히 거평타운/751 더깨끗하고 더카레집은 배달을 주로해서 그나마 이런짓하는게들한편인데 유독 이 정운이라는 식당만 계속 그러네요.', email: 'pp@gg.com'};

	  $scope.board_container[j].reply_container.push(d);
	}
      }

    };
*/
