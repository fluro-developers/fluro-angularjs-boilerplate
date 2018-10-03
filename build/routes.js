
app.config(function($stateProvider) {

    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////

    // !important not to change 'home' as the state name
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'routes/home/home.html',
        controller: HomeController,
        data: HomeController.data,
        resolve: HomeController.resolve
    });

    ///////////////////////////////////////////

    $stateProvider.state('search', {
        url: '/search',
        templateUrl: 'routes/search/search.html',
        controller: SearchPageController,
        data: SearchPageController.data,
        resolve: SearchPageController.resolve
    });

    ///////////////////////////////////////////

    $stateProvider.state('article', {
        url: '/article/:id',
        templateUrl: 'routes/article/article.html',
        controller: ArticleViewController,
        data: ArticleViewController.data,
        resolve: ArticleViewController.resolve
    });

    ///////////////////////////////////////////

    $stateProvider.state('myaccount', {
        url: '/my-account',
        templateUrl: 'routes/myaccount/myaccount.html',
        controller: MyAccountController,
        data: MyAccountController.data,
        resolve: MyAccountController.resolve
    });

    ///////////////////////////////////////////

    $stateProvider.state('login', {
        url: '/login?returnTo&package',
        abstract: true,
        template: '<div ui-view></div>',
        controller: LoginPageController,
    });

    $stateProvider.state('login.form', {
        url: '',
        templateUrl: 'routes/login/login.form.html',
        data: LoginPageController.data,
        resolve: LoginPageController.resolve
    });

    $stateProvider.state('login.forgot', {
        url: '/forgot',
        templateUrl: 'routes/login.forgot/forgot.html',
        data: {
            denyAuthenticated: true,
        },
        resolve: {
            seo: function(FluroSEOService) {
                FluroSEOService.pageTitle = 'Forgot Password';
                return true;
            },
        }
    });

    ///////////////////////////////////////////

    $stateProvider.state('signup', {
        url: '/signup?returnTo',
        templateUrl: 'routes/signup/signup.html',
        controller: SignupPageController,
        data: SignupPageController.data,
        resolve: SignupPageController.resolve
    });

    ///////////////////////////////////////////

    $stateProvider.state('reset', {
        url: '/reset-password?token',
        templateUrl: 'routes/reset/reset.html',
        controller: ResetPasswordPageController,
        resolve: ResetPasswordPageController.resolve
    });

    ///////////////////////////////////////////

})