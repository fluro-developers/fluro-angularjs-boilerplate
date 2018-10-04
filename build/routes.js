
app.config(function($stateProvider) {

    

    $stateProvider.state('app', {
        url: '/',
        templateUrl: 'routes/app/app.html',
        controller: AppRouteController,
        data: AppRouteController.data,
        resolve: AppRouteController.resolve,
        redirectTo: 'app.home',
    });



    $stateProvider.state('app.home', {
        url: '',
        templateUrl: 'routes/app.home/home.html',
        controller: HomeController,
        data: HomeController.data,
        resolve: HomeController.resolve
    });


    // $stateProvider.state('app.message', {
    //     url: 'message/:id',
    //     templateUrl: 'routes/app.message/message.html',
    //     controller: MessageRouteController,
    //     data: MessageRouteController.data,
    //     resolve: MessageRouteController.resolve
    // });

    ///////////////////////////////////////////

})