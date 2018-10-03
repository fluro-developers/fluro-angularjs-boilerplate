var boilerplate = angular.module('fluro.boilerplate', [
    'ngAnimate',
    'ngResource',
    'ui.router',
    'ngTouch',
    'fluro.config',
    'fluro.access',
    'fluro.validate',
    'fluro.interactions',
    'fluro.content',
    'fluro.asset',
    'fluro.socket',
    'fluro.video',
    'angular.filter',
    'formly',
    'ui.bootstrap',
    'formlyBootstrap',
    'angulartics',
    'angulartics.google.analytics'
])



/////////////////////////////////////////////////////////////////////

function getMetaKey(stringKey) {
    var metas = document.getElementsByTagName('meta');

    for (i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute("property") == stringKey) {
            return metas[i].getAttribute("content");
        }
    }
    return "";
}


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

boilerplate.config(function($stateProvider, $compileProvider, $httpProvider, FluroProvider, $urlRouterProvider, $locationProvider, $analyticsProvider) {

    // make sure include provided client app tracker and fluro tracker
    $analyticsProvider.settings.ga.additionalAccountNames = ['fluro'];
    // send user properties as well
    $analyticsProvider.settings.ga.additionalAccountHitTypes.setUserProperties = true;
    // when using user timing/duration
    $analyticsProvider.settings.ga.additionalAccountHitTypes.userTiming = true;


    //Dont include all the angular comments and ng-scope classes
    $compileProvider.debugInfoEnabled(false);

    ///////////////////////////////////////////////////

    //Get the access token and the API URL
    var accessToken = getMetaKey('fluro_application_key');
    var apiURL = getMetaKey('fluro_url');

    ///////////////////////////////////////////////////

    //Create the initial config setup
    var initialConfig = {
        apiURL: apiURL,
        token: accessToken,
        sessionStorage: false, //Change this if you want to use local storage  or session storage
        backupToken: accessToken,
    }

    ///////////////////////////////////////////

    //Check if we are developing an app locally
    var appDevelopmentURL = getMetaKey('app_dev_url');

    //If an app development url is set then we know where to login etc
    if (appDevelopmentURL && appDevelopmentURL.length) {
        initialConfig.appDevelopmentURL = appDevelopmentURL;
    } else {
        //Set HTML5 mode to true when we deploy
        //otherwise live reloading will break in local dev environment
        $locationProvider.html5Mode(true);
    }

    ///////////////////////////////////////////

    //Set the initial config
    FluroProvider.set(initialConfig);

    ///////////////////////////////////////////

    //Http Intercpetor to check auth failures for xhr requests
    if (!accessToken) {
        $httpProvider.defaults.withCredentials = true;
    }

    $httpProvider.interceptors.push('FluroAuthentication');


    $urlRouterProvider.otherwise("/");


});

/////////////////////////////////////////////////////////////////////

boilerplate.run(function($rootScope, $sessionStorage, PurchaseService, Asset, FluroTokenService, FluroSEOService, FluroContent, FluroBreadcrumbService, FluroScrollService, $location, $timeout, $state, $analytics) {


    //Add all of the services we might need to access via the DOM
    //to the rootscope so we can use them like {{$root.asset.imageUrl()}}
    $rootScope.asset = Asset;
    $rootScope.$state = $state;
    $rootScope.session = $sessionStorage;
    $rootScope.breadcrumb = FluroBreadcrumbService;
    $rootScope.purchaseService = PurchaseService;
    $rootScope.scroll = FluroScrollService;
    $rootScope.seo = FluroSEOService;

    //////////////////////////////////////////////////////////////////

    if (!applicationData) {
        //No application data was loaded from the server
        //this is usually a deal breaker
        return;
    }

    //Add the application data to the $rootScope
    $rootScope.applicationData = applicationData;

    //////////////////////////////////////////////////////////////////

    if (applicationUser && applicationUser._id) {
        // $rootScope.user = applicationUser;

        $analytics.setUsername(applicationUser._id); // fluro id
        $analytics.setAlias(applicationUser.email); // user email
        $analytics.setUserProperties({
            dimension1: applicationUser.account._id // fluro account id
        });
    }

    //////////////////////////////////////////////////////////////////

    //Add the site name as the first part of our page title for seo
    //Use the application title by default
    var siteName = _.get(applicationData, '_application.title');
    if (siteName && siteName.length) {
        FluroSEOService.siteTitle = siteName;
    }

    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////

    //Set a default SEO image just incase we don't set one on child pages
    var defaultImageID = _.get(applicationData, 'publicData.seoImage');
    var applicationID = _.get(applicationData, '_application._id');

    if (defaultImageID) {
        if (defaultImageID._id) {
            defaultImageID = defaultImageID._id;
        }

        FluroSEOService.defaultImageURL = Asset.imageUrl(defaultImageID, 640, null, {
            from: applicationID,
            extension: 'jpg'
        });
    }

    /////////////////////////////////////////////////////////////

    //Set a default SEO description for when pages are shared to Facebook and other
    //social media networks
    var defaultSEODescription = _.get(applicationData, 'publicData.seoDescription');
    FluroSEOService.defaultDescription = defaultSEODescription;

    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////

    //Helper function for logging out from anywhere
    //You can use this in the DOM by calling {{$root.logout}}
    $rootScope.logout = function() {
        FluroTokenService.logout();

        //Hide the sidebar
        $rootScope.sidebarExpanded = false;

        //Reload and go to home state
        $state.go('home');
    }

    //////////////////////////////////////////////////////////////////

    //Watch for any changes to the logged in user and then
    //refresh the user's current purchases
    $rootScope.$watch('user', function(user) {
        PurchaseService.refreshPurchases();
    })

    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////

    //Listen for when the user navigates to a new page
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {

        //Close the sidebar
        $rootScope.sidebarExpanded = false;

        ///////////////////////////////////////////////

        //Check if the user has logged in
        var isLoggedIn = $rootScope.user;

        //Check if there is any specific behaviours defined
        //on the state in app.config
        if (toState.data) {

            //If deny authenticated is set
            if (toState.data.denyAuthenticated) {
                //Check if the user is logged in
                if (isLoggedIn) {

                    //If the user is logged in
                    //Stop the state change
                    event.preventDefault();

                    //Go to home page instead
                    $state.go('home');
                    return;
                }
            }

            //////////////////////////////////

            //If require login is set
            if (toState.data.requireLogin) {

                //Check if the user is logged in
                if (!isLoggedIn) {

                    //If the user is not logged in
                    //Stop the state change
                    event.preventDefault();

                    //Go to login page instead
                    $state.go('login.form');
                    $rootScope.$broadcast('$preloaderHide');
                    return;
                }
            }
        }
    });

    //////////////////////////////////////////////////////////////////

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        //Broadcast the error to the console
        throw error;
    });

    //////////////////////////////////////////////////////////////////

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
        //Update the state name so we can use it for CSS classes in the DOM
        $rootScope.currentState = toState.name;
    });

    //////////////////////////////////////////////////////////////////

    //Make touch devices more responsive
    FastClick.attach(document.body);

});
