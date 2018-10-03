ArticleViewController.resolve = {
    item: function($stateParams, FluroContent) {
        return FluroContent.resource('article/' + $stateParams.id).get({}).$promise;
    },
    seo: function(FluroSEOService, Asset, item) {

        //Set the page title as the title of the article
        FluroSEOService.pageTitle = item.title;

        //Get variables from your article item
        var articleImage = _.get(item, 'data.publicData.image');
        var articleDescription = _.get(item, 'data.publicData.shortDescription');

        FluroSEOService.imageURL = Asset.imageUrl(articleImage, 640);
        FluroSEOService.description = articleDescription;
        return true;
    },
};

ArticleViewController.data = {
    requireLogin: true,
}

app.controller('ArticleViewController', ArticleViewController);

function ArticleViewController($scope) {

}
