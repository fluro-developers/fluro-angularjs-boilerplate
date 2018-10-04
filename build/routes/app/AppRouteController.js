AppRouteController.resolve = {
    session: function(FluroContent, $q) {

    	var deferred = $q.defer();

    	//////////////////////

        FluroContent.endpoint('session').get()
        .$promise
        .then(function(user) {

        	//Resolve with the currently logged in user
        	return deferred.resolve(user);

        }, function(err) {
        	//Change this if you want to ensure the user login
        	//or redirect to a login route 
        	return deferred.resolve(null);
        });

        //////////////////////

        return deferred.promise;
    },
}

////////////////////////////////////////////////////////////

AppRouteController.data = {
    // requireLogin: true,
}

////////////////////////////////////////////////////////////

function AppRouteController($scope, $rootScope, session) {

	// console.log('TODO CHECK IF $rootScope.user ALREADY EXISTS HERE')
	$rootScope.user = session;
}
