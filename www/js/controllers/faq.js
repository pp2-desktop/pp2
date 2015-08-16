angular.module('starter.controllers')
  .controller('faqCtrl', ['$scope', '$rootScope', '$http', '$ionicScrollDelegate', 'filterFilter', '$state', '$ionicHistory', function($scope, $rootScope, $http, $ionicScrollDelegate, filterFilter, $state, $ionicHistory){

    $scope.last_place = function() {
      $ionicHistory.nextViewOptions({
	disableBack: true
      });
      $state.go($rootScope.place);
    };
    
  }]);
