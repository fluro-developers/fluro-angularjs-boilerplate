SearchPageController.resolve = {
    seo: function(FluroSEOService) {
        FluroSEOService.pageTitle = 'Search';
        return true;
    },
    articles: function(FluroContent) {
        return FluroContent.resource('article').query().$promise;
    },
};

SearchPageController.data = {
    requireLogin: true,
}

app.controller('SearchPageController', SearchPageController);

function SearchPageController($scope) {

}
