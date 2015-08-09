angular.module('starter.controllers')
  .controller('parentCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$stateParams', '$window', '$timeout', '$cordovaSpinnerDialog', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $stateParams, $window, $timeout, $cordovaSpinnerDialog){
    
    $scope.goChild = function(parent, child) {
      $window.location.href = '#/app/home/' + parent + '/' + child;
    };

    $scope.$on('refreshParent', function() {
      //alert('parent');
      $cordovaSpinnerDialog.show("","동영상 가져오는 중", true);
      
      $http.get('http://s.05day.com/v/' + $scope.parent).
	success(function(data, status, headers, config) {
	  var rtn = data;

	  if(!rtn.result) {
	    alert('[error] 컨텐츠 목록 가져오다가 실패');
	    return;
	  }
	  $scope.child_container = rtn.child_container;
	  $cordovaSpinnerDialog.hide();
	  $ionicScrollDelegate.scrollTop(true);
	}).
	error(function(data, status, headers, config) {
	  $cordovaSpinnerDialog.hide();
	  //alert('[error] 홈 요청중');
	});
    });


    var init = function() {
      $rootScope.status = STATUS.PARENT;
      $scope.parent = $stateParams.parent;
      $scope.title = $scope.parent.toUpperCase();
      $http.get('http://s.05day.com/v/' + $scope.parent).
	success(function(data, status, headers, config) {
	  var rtn = data;

	  if(!rtn.result) {
	    alert('[error] 컨텐츠 목록 가져오다가 실패');
	    return;
	  }
	  
	  $scope.child_container = rtn.child_container;

	}).
	error(function(data, status, headers, config) {
	  //alert('[error] 홈 요청중');
	});
    };
    init();

  }]);


// peppa s1
// peppa s2 click -> /kidzone/peppa s2/


/*
 var c = {};
 c.vid = 'EoH6I7uwoxM';
 c.parent = 'kidzone';
 c.child = 'peppa pig s1';
 c.cnt = 5;
 c.title = '페파피그 시즌1';
 c.date = new Date();
 
 var c1 = {};
 c1.vid = '6YljEB_wUMs';
 c1.parent = 'kidzone';
 c1.child = 'peppa pig s2';
 c1.cnt = 5;
 c1.title = '페파피그 시즌2';
 c1.date = new Date();

 $scope.child_container.push(c);
 $scope.child_container.push(c1);
 */

