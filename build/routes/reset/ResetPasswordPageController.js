ResetPasswordPageController.resolve = {
    token: function($stateParams) {
        return $stateParams.token;
    },
    user: function($q, token, FluroTokenService) {
        //Deferred
        var deferred = $q.defer();

        var request = FluroTokenService.retrieveUserFromResetToken(token, {
            application: true
        });

        request.then(function(res) {
            return deferred.resolve(res.data);
        }, function(err){
            // still resolve but pass error to display
            return deferred.resolve(err.data);
        })

        return deferred.promise;

    },
    seo: function(FluroSEOService) {
        FluroSEOService.pageTitle = 'Reset Password';
        return true;
    },
}

app.controller('ResetPasswordPageController', ResetPasswordPageController);

function ResetPasswordPageController($scope, $rootScope, PurchaseService, $state, FluroTokenService, $http, user, token) {

      $scope.settings = {};

      if(user && user._id){
        $scope.persona = user;
      } else {
        $scope.settings.state = 'error';
        $scope.settings.errorMessage = user;
      }
      $scope.token = token;

      //////////////////////////////////////





      //////////////////////////////////////
      //////////////////////////////////////
      //////////////////////////////////////
      //////////////////////////////////////
      //////////////////////////////////////


      $scope.update = function() {
          $scope.settings.state = 'processing';


          function resetSuccess(res) {
              $scope.settings.state = 'complete';
              $state.go('home')
          }

          function resetFailed(err) {
              $scope.settings.state = 'failed';
              $scope.settings.errorMessage = err.data;
          }

          var request = FluroTokenService.updateUserWithToken(token, $scope.persona, {application:true});

          request.then(resetSuccess, resetFailed);

      }

      //////////////////////////////////////

      /**

      //Load the URL
      var url = '/fluro/application/reset/' + $stateParams.token;

      //////////////////////////////////////

      function success(res) {

          $scope.persona = res.data;
      }

      function failed(err) {
          console.log('Error', err);
      }

      //////////////////////////////////////

      $http.get(url).then(success, failed);



      /**/

}
