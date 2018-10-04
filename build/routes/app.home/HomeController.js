HomeController.resolve = {
    seo: function(FluroSEOService, Asset, $rootScope) {
        FluroSEOService.pageTitle = null;
        return true;
    },
}

////////////////////////////////////////////////////////////

HomeController.data = {
    // requireLogin: true,
}

////////////////////////////////////////////////////////////

function HomeController($scope, NotificationService) {


    $scope.notify = function(message) {
        NotificationService.message(message, 'warning', 1000);    

    }
}