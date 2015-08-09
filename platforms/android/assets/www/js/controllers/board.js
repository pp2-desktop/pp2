angular.module('starter.controllers')
  .controller('boardCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$timeout', '$window', '$cordovaGoogleAnalytics', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $timeout, $window, $cordovaGoogleAnalytics){
    
    // req home 요청
    /*
    $scope.board_container = [ { title: 'Reggae', id: 1 },
			       { title: 'Chill', id: 2 },
			       { title: 'Dubstep', id: 3 },
			       { title: 'Indie', id: 4 },
			       { title: 'Rap', id: 5 },
			       { title: 'Cowbell', id: 6 }];
     */

    /*
    $scope.$on('refreshBoard', function() {
      $rootScope.is_loading = true;
      $timeout(function() {
	$rootScope.is_loading = false;
      }, 5000);
    });
    */


    $scope.board_detail = function(index) {
      
      if(index == 0) {
	$window.location.href = '#/app/board/qna_english';
      } else if(index == 1) {
	$window.location.href = '#/app/board/studygroup';
      } else if(index == 2){
	$window.location.href = '#/app/board/toeic';
      } else if(index == 3){
	$window.location.href = '#/app/board/oversea';
      }

    };      

    
  }]);



//http://www.cnblogs.com/Answer1215/p/4086308.html
