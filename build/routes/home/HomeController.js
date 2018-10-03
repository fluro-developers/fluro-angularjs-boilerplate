
////////////////////////////////////////////////////////

//Add your resolves for this route
HomeController.resolve = {
    seo: function(FluroSEOService, Asset, $rootScope) {
        FluroSEOService.pageTitle = null;
        return true;
    },
}


////////////////////////////////////////////////////////

//Add any extra ui router settings
HomeController.data = {
    // requireLogin: true,
}

////////////////////////////////////////////////////////

function HomeController($scope) {

	$scope.message = 'Welcome to the Fluro Angular boilerplate';
}
