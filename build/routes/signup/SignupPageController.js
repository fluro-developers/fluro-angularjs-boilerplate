SignupPageController.resolve = {
    seo: function(FluroSEOService) {
        FluroSEOService.pageTitle = 'Sign up';
        return true;
    },
}

SignupPageController.data = {
    denyAuthenticated: true,
}

app.controller('SignupPageController', SignupPageController);

function SignupPageController($scope, $q, PurchaseService, $rootScope, Fluro, $state, $stateParams, FluroBreadcrumbService,  FluroContent, FluroTokenService) {


    $scope.credentials = {}

    //Object to store the current state of this page
    $scope.settings = {};

    //////////////////////////////////////

    function redirectOnSignupComplete() {


        if($stateParams.package)  {
            return $state.go('package', {slug:$stateParams.package});
        }


        //If returnTo was set then return them to the video they wanted to watch
        if($stateParams.returnTo) {

            //Find out how long the breadcrumb trail is
            var trailLength =  FluroBreadcrumbService.trail.length;
            //Get the page before this login form
            var lastPage = FluroBreadcrumbService.trail[trailLength-2];

            return FluroBreadcrumbService.backTo(lastPage);
        }

        return $state.go('home');
    }

    //////////////////////////////////////

    $scope.signup = function() {

    	if(!$scope.credentials.firstName || !$scope.credentials.firstName.length) {
    		return $scope.settings.error = 'First Name is a required field'
    	}

    	if(!$scope.credentials.lastName || !$scope.credentials.lastName.length) {
    		return $scope.settings.error = 'Last Name is a required field'
    	}

    	if(!$scope.credentials.username || !$scope.credentials.username.length) {
    		return $scope.settings.error = 'Email Address is a required field'
    	}

    	if(!$scope.credentials.password || !$scope.credentials.password.length) {
    		return $scope.settings.error = 'Password is a required field'
    	}

    	if(!$scope.credentials.confirmPassword || !$scope.credentials.confirmPassword.length) {
    		return $scope.settings.error = 'Please confirm your password'
    	}

    	if($scope.credentials.confirmPassword != $scope.credentials.password) {
    		return $scope.settings.error = 'Your password and confirm password do not match'
    	}



    	//Set state to processing
    	$scope.settings.state = 'processing';
    	$scope.settings.error = null;

        //////////////////////////////////////

        //Sign in and authorise as a persona using this application
        //This will mean the token returned combines the application's permissions and the application user's permissions
        var request = FluroTokenService.signup($scope.credentials, {application:true});

        //////////////////////////////////////

        //Login and authentication was successful
        function signupSuccess(res) {
        	console.log('Signup success!!');

            ///////////////////////////////////////////////////

            //Check if there are any free products to collect upon signup
            var freeProductIDs = _.chain($rootScope.applicationData.collectOnArrival)
            .filter(function(product) {
                return Number(product.amount) == 0;
            })
            .map(function(product) {
                return product._id;
            })
            .value();

            ///////////////////////////////////////////////////

            //If there aren't any free products
            //just redirect to the watch page
            if(!freeProductIDs || !freeProductIDs.length) {



                //Just head straight to search
                return redirectOnSignupComplete();
            }

            //Tell the PurchaseService to collect free products on arrival
            PurchaseService.collectFreeProducts(freeProductIDs).then(function(res) {
                return redirectOnSignupComplete();
            }, function(err) {
                return redirectOnSignupComplete();
            });

        }

        //////////////////////////////////////

        //Login failed
        function loginFailed(err) {
            $scope.settings.state = 'ready';
            console.log('FAILED', err);
            $scope.settings.error = err.data;
        }

        //////////////////////////////////////

        //Login failed
        function signupFailed(err) {
        	$scope.settings.state = 'ready';
            console.log('FAILED', err);

            if(err.data.errors) {

                var errors =  _.map(err.data.errors, function(err) {
                    return err.message;
                })
                return $scope.settings.error = errors[0];
            }

            $scope.settings.error = err.data;

        }

        //////////////////////////////////////

        //Listen for the promise result
        request.then(signupSuccess, signupFailed);

    }


}
