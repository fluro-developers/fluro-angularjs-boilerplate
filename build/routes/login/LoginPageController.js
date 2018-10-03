LoginPageController.resolve = {
    seo: function(FluroSEOService) {
        FluroSEOService.pageTitle = 'Sign in';
        return true;
    },
}

LoginPageController.data = {
    denyAuthenticated: true,
}

app.controller('LoginPageController', LoginPageController);

function LoginPageController($scope, FluroBreadcrumbService,  $stateParams, $state, $http, Fluro, FluroContent, FluroTokenService) {


    $scope.credentials = {}

    //Object to store the current state of this page
    $scope.settings = {};

    //////////////////////////////////////


    $scope.sendResetToken = function() {



        $scope.settings.state = 'processing';

        //Tell the server that when the user clicks the reset link
        //it should take them to this url to retrieve the reset token


        var resetDetails = {}
        resetDetails.email = $scope.credentials.username;
        resetDetails.redirect = '/reset-password';

        //////////////////////////////////////

        var request = FluroTokenService.sendResetPasswordRequest(resetDetails, {
            application: true
        });

        function resetSuccess(res) {
            // NotificationService.message('Reset token has been sent')
            $scope.settings.state = 'complete';
        }

        function resetFailed(err) {

            $scope.settings.errorMessage = err.data.error;
            // NotificationService.message(err.data, 'danger')
            $scope.settings.state = 'error';
        }

        //Make the request
        request.then(resetSuccess, resetFailed);

    }


    //////////////////////////////////////

    $scope.backToLogin = function() {
        $scope.settings.state = null;
        $state.go('login.form');
    }
    //////////////////////////////////////


    $scope.login = function() {

        if (!$scope.credentials.username || !$scope.credentials.username.length) {
            return $scope.settings.error = 'Email Address is a required field'
        }

        if (!$scope.credentials.password || !$scope.credentials.password.length) {
            return $scope.settings.error = 'Password is a required field'
        }



        //Set state to processing
        $scope.settings.state = 'processing';
        $scope.settings.error = null;

        //////////////////////////////////////

        //Sign in and authorise as a persona using this application
        //This will mean the token returned combines the application's permissions and the application user's permissions
        var request = FluroTokenService.login($scope.credentials, {
            application: true
        });

        //////////////////////////////////////

        //Login and authentication was successful
        function loginSuccess(res) {


            $scope.settings.state = 'complete';

            if($stateParams.package)  {
                $state.go('package', {slug:$stateParams.package});
                return;
            }

            if($stateParams.returnTo) {

                //Find out how long the breadcrumb trail is
                var trailLength =  FluroBreadcrumbService.trail.length;
                //Get the page before this login form
                var lastPage = FluroBreadcrumbService.trail[trailLength-2];

                return FluroBreadcrumbService.backTo(lastPage);
            }

            //go straight to the watch page
            $state.go('search');
        }

        //////////////////////////////////////

        //Login failed
        function loginFailed(err) {
            $scope.settings.state = 'ready';
            console.log('FAILED', err);
            $scope.settings.error = err.data;
        }

        //////////////////////////////////////

        //Listen for the promise result
        request.then(loginSuccess, loginFailed);

    }


}
