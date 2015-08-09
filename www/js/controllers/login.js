angular.module('starter.controllers')
  .controller('loginCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter','$cordovaOauth', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $cordovaOauth){

    /*
    var _appId = 1712769318950469;
    
    $scope.login = function(provider) {

      $cordovaOauth.facebook(_appId, ["email"]).then(function(result) {
	var req_url = 'https://graph.facebook.com/me?access_token=' + result['access_token'];
	
	$http.get(req_url).
	  success(function(data, status, headers, config) {

	    $rootScope.user_info.fb = data;

	    for( var i in data ) {
	      alert(i);
	      alert(data[i]);
	    }

	    //$rootScope.is_fb_login = true;


	    // 서버에 전송하고 db에 저장
	  }).
	  error(function(data, status, headers, config) {
	    alert('[error] facebook 정보 가져오기 실패');
	  });
	
      }, function(error) {
	alert(error);
      });

    };
     */
    
  }]);
