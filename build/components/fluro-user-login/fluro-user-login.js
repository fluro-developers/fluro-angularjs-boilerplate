app.controller('UserLoginController', function($scope, $http, FluroTokenService, NotificationService) {
    

    ////////////////////////////////////////

    $scope.credentials = {}
    
    $scope.status = 'ready';
    
    ////////////////////////////////////////

    $scope.signup = function(options) {
        
        $scope.status = 'processing';
     
     	//Signup for a new persona
        var request = FluroTokenService.signup($scope.credentials, options)
        
        request.then(function(res) {
            $scope.status = 'ready';
            NotificationService.message('Hi ' + res.data.firstName)
        }, function(res) {
            $scope.status = 'ready';
            NotificationService.message(String(res.data), 'danger')
        })
    }
    
    ////////////////////////////////////////

    $scope.login = function(options) {
        
        $scope.status = 'processing';
        var request = FluroTokenService.login($scope.credentials, options);

        request.then(function(res) {
            $scope.status = 'ready';
            NotificationService.message('Welcome back ' + res.data.firstName)
        }, function(res) {
            $scope.status = 'ready';
            console.log('FAILED', res);

            if(res.status == -1) {

                var appDevelopmentURL = getMetaKey('app_dev_url');

                ////////////////////////////////////////////

                if(appDevelopmentURL && appDevelopmentURL.length) {
                    NotificationService.message('Update your trusted hosts for (' + appDevelopmentURL + ') to allow from this origin', 'danger')
                } else {
                    NotificationService.message('Network Security Error', 'danger')
                }

                ////////////////////////////////////////////


            } else {
                NotificationService.message(String(res.data), 'danger')
            }
        })
    }
   
});

