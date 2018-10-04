//Constants
//This is where you can change the default settings in the boilerplate
var DEFAULT_HOME_STATE = 'app.home';

//////////////////////////////////////////////////

/**
 * Addin your own dependencies in here
 */
var app = angular.module('fluro', [
    'fluro.boilerplate', // build/boilerplate.js
    //anything else you want to add
]);

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

/**
 * Write your own application logic in here
 */
//Custom App Code
//Your application specific code goes here

app.run(function($rootScope, $uibModalStack, NotificationService) {


	$rootScope.notifications = NotificationService;


    //Listen for when the user starts navigating to a new page
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
        //Close any modals that are open
        $uibModalStack.dismissAll();

    })

});
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

boilerplate.config(function($stateProvider, $animateProvider, $compileProvider, $httpProvider, FluroProvider, $urlRouterProvider, $locationProvider, $analyticsProvider) {


     //Add ng-animate-disable feature
    $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);



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
        $rootScope.menuExpanded = false;

        //Reload and go to home state
        $state.go(DEFAULT_HOME_STATE);
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
        $rootScope.menuExpanded = false;



        ///////////////////////////////////////////////

        //If a redirect has been set on the state
        if (toState.redirectTo) {

            //prevent the default
            event.preventDefault();
            //Navigate to the redirect
            $state.go(toState.redirectTo, toParams);
            return;
        }

        


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
                    $state.go(DEFAULT_HOME_STATE);
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

        $rootScope.bodyClass = _.kebabCase('route-' + toState.name);
    });

    //////////////////////////////////////////////////////////////////

    //Make touch devices more responsive
    FastClick.attach(document.body);

});


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
app.directive('dateselect', function($document) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'admin-date-select/admin-date-select.html',
        scope: {
            boundModel: '=ngModel',
            label: '=ngLabel',
            minDate: '=minDate',
            initDate: '=initDate',
            useTime: '=useTime',
            required: '=',
            rounding: '=',
            forceDate: '=',
        },
        link: function($scope, element, attr) {


            ////////////////////////////////////////////////

            function elementClick(event) {
                //Clicked inside
                event.stopPropagation();
            }

            function documentClick(event) {
                //Clicked outside
                $scope.$apply(function() {
                    $scope.open = false;
                });
            }

            //Listen for when this date select is open
            $scope.$watch('settings.open', function(bol) {
                if (bol) {
                    element.on('click', elementClick);
                    $document.on('click', documentClick);
                } else {
                    element.off('click', elementClick);
                    $document.off('click', documentClick);
                }
            })

        },
        controller: function($scope, $timeout) {

            $scope.settings = {
                dateModel:new Date()
            }

            if($scope.forceDate && !$scope.boundModel) {
                $scope.boundModel = new Date();
            }

            ///////////////////////////////////////

            //Rounding factor
            var coeff = 1000 * 60 * 5;

            // if ($scope.boundModel) {

            //     $scope.settings.model = new Date($scope.boundModel);
            // } else {
            //     $scope.settings.model = new Date();
            // }

            ///////////////////////////////////////

            // $scope.$watch('settings.open', function(open) {
            //     if (open) {
            //         if(!$scope.boundModel) {
            //             $scope.boundModel = new Date($scope.settings.model);
            //         }
            //     }
            // })

            ///////////////////////////////////////

            $scope.removeDate = function() {
                $scope.boundModel = null;
                //console.log('Remove Date')
            }

            ///////////////////////////////////////

            //round to nearest 5mins
            if ($scope.rounding) {
                // if (_.isDate($scope.settings.model)) {
                    // $scope.settings.model = new Date(Math.round($scope.settings.model.getTime() / coeff) * coeff)
                // }
                if (_.isDate($scope.boundModel)) {
                    $scope.boundModel = new Date(Math.round($scope.boundModel.getTime() / coeff) * coeff)
                }
            }

            ///////////////////////////////////////
            ///////////////////////////////////////

            function updateLabel() {
                // console.log('RESET Bound Model',$scope.boundModel)
                if ($scope.boundModel) {
                    var date = new Date($scope.boundModel);
                    if (!$scope.useTime) {
                        $scope.readable = date.format('D j F');
                    } else {
                        $scope.readable = date.format('D j F g:i') + '<span class="meridian">' + date.format('a') + '</span>';
                    }
                    //$scope.readable = date.format('D j F g:i') + '<span class="meridian">' + date.format('a') +'</span>';
                } else {
                    if ($scope.label) {
                        $scope.readable = $scope.label;
                    } else {
                        $scope.readable = 'None provided';
                    }
                }
            }

            /**
            var cancelWatch;

            function stopWatchingBoundModel() {
                if(cancelWatch) {
                   cancelWatch();
                }
            }

            function startWatchingBoundModel() {
                cancelWatch = $scope.$watch('boundModel', boundModelUpdated);
            }
            

            function boundModelUpdated() {
                stopWatchingBoundModel();

                console.log('BOUND MODEL CHANGED', $scope.boundModel);
                $scope.settings.model = angular.copy($scope.boundModel);
                updateLabel();

                startWatchingBoundModel();
            }

            //Start watching to start with
            startWatchingBoundModel();
            /**/


            $scope.$watch('boundModel', boundModelChanged, true);
            $scope.$watch('settings.dateModel', dateModelChanged, true);

            function boundModelChanged() {
                if($scope.settings.dateModel != $scope.boundModel) {
                    $scope.settings.dateModel = $scope.boundModel = new Date($scope.boundModel)
                }
                updateLabel();
            }

            function dateModelChanged() {
                if($scope.boundModel != $scope.settings.dateModel) {
                $scope.boundModel = $scope.settings.dateModel = new Date($scope.settings.dateModel)
                }
                updateLabel();
            }

            /**
            //Watch for changes
            $scope.$watch('settings.dateModel', function() {
                // console.log('MODEL CHANGE', data);
                // //Link to the bound model`
                if ($scope.settings.open) {
                    $scope.boundModel = angular.copy($scope.settings.dateModel);
                }

                updateLabel();

            }, true)
            /**/
        }

    };

});
// app.directive('myDirective', function (httpPostFactory) {
//     return {
//         restrict: 'A',
//         scope: true,
//         link: function (scope, element, attr) {

//             element.bind('change', function () {
//                 var formData = new FormData();
//                 formData.append('file', element[0].files[0]);
//                 httpPostFactory('upload_image.php', formData, function (callback) {
//                    // recieve image name to use in a ng-src 
//                     console.log(callback);
//                 });
//             });

//         }
//     };
// });

// app.factory('httpPostFactory', function ($http) {
//     return function (file, data, callback) {
//         $http({
//             url: file,
//             method: "POST",
//             data: data,
//             headers: {'Content-Type': undefined}
//         }).success(function (response) {
//             callback(response);
//         });
//     };
// });








app.directive('personaImageReplaceForm', function(Fluro, $http, $timeout) {

    return {
        restrict: 'E',
        scope: {
            personaID: '=ngModel',
            cacheBuster: '=ngCache',
            resetToken:'=?resetToken',
        },
        // Replace the div with our template
        templateUrl: 'admin-persona-image-replace/persona-image-replace-form.html',
        // controller: 'PersonaImageReplaceController',
        link: function($scope, $element, $attr) {


            $scope.settings = {
                state:'ready',
            }

            var fileInput;

            ///////////////////////////////////////////

            $scope.$watch('settings.state', function(state) {

                if(fileInput) {
                    fileInput.off('change')
                }


                // if(state == 'ready') {
                    fileInput = $element.find('#file');
                    fileInput.on('change', fileSelected)
                    console.log('Found File Input!');
                // }
            })


            $scope.$on('$destroy', function(){
                if(fileInput) {
                    fileInput.off('change')
                }
            })
           


            ///////////////////////////////////////////

            function uploadComplete(res) {
                $scope.settings.state = 'complete';
                console.log('uploadCompleted', res);

                $timeout(function() {


                if(!$scope.cacheBuster) {
                    $scope.cacheBuster = 1;
                }

                $scope.cacheBuster++;

                })
            }

            ///////////////////////////////////////////

            function uploadFailed(err) {
                $scope.settings.state = 'error';
                $scope.settings.errorMessage = err.data;
                console.log('UPLOAD FAILED', err)
            }

            ////////////////////////////////////////////////////

            function fileSelected(event) {

                $scope.settings.state = 'processing';

                //Create new formData object
                var formData = new FormData();
                formData.append('file', fileInput[0].files[0]);

                ///////////////////////////////////////////

                //URL to send to
                var uploadURL = Fluro.apiURL + '/persona/' + $scope.personaID + '/image';

                if($scope.resetToken && $scope.resetToken.length) {
                    uploadURL += '?resetToken=' + $scope.resetToken;
                }

                //Make the request
                $http({
                        url: uploadURL,
                        method: "POST",
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        }
                    })
                    .then(uploadComplete, uploadFailed);
            }
        }
    }
});

/**
app.controller('PersonaImageReplaceController', function($scope, FluroContent, $http, Fluro) {

    $scope.photoReplace = {};

    /////////////////////////////////   
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////

    $scope.upload = function() {

        console.log('Select and upload')

        var fileInput = document.getElementById('file').files[0],
            fileReader = new FileReader();

        ///////////////////////////////////////////

        fileReader.onloadend = function(event) {
            var data = event.target.result;

            console.log('File Loaded');

            ///////////////////////////////////////////

            function uploadComplete(res) {
                console.log('uploadCompleted', res);
            }

            ///////////////////////////////////////////

            function uploadFailed(er) {
                console.log('UPLOAD FAILED', err)
            }

            ///////////////////////////////////////////

            var uploadURL = Fluro.apiURL + '/persona/' + $scope.personaID + '/image';

            $http.post(uploadURL, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity
            }).then(uploadComplete, uploadFailed);
        }

        ///////////////////////////////////////////

        fileReader.readAsBinaryString(fileInput);

    }



    // $scope.uploadFile = function(files) {

    //     console.log('Upload Files!', files);

    //     //Take the first selected file
    //     var fd = new FormData();
    //     fd.append("file", files[0]);


    //     var uploadURL = Fluro.apiURL + '/persona/' + $scope.model._id + '/image';

    //     ///////////////////////////////////////////

    //     function uploadComplete(res) {
    //         console.log('uploadCompleted', res);
    //     }

    //     ///////////////////////////////////////////

    //     function uploadFailed(er) {
    //         console.log('UPLOAD FAILED', err)
    //     }

    //     ///////////////////////////////////////////

    //     $http.post(uploadURL, fd, {
    //         // withCredentials: true,
    //         // headers: {'Content-Type': undefined },
    //         transformRequest: angular.identity
    //     }).then(uploadComplete, uploadFailed);



    // };



    /////////////////////////////////

    $scope.showReplaceDialog = function() {
        $scope.photoReplace.show = true;
    }

    /////////////////////////////////

});

/**/

(function() {
    
    Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    Date.longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    Date.shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    Date.longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // defining patterns
    var replaceChars = {
        // Day
        d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
        D: function() { return Date.shortDays[this.getDay()]; },
        j: function() { return this.getDate(); },
        l: function() { return Date.longDays[this.getDay()]; },
        N: function() { return (this.getDay() == 0 ? 7 : this.getDay()); },
        S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
        w: function() { return this.getDay(); },
        z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
        // Week
        W: function() { 
            var target = new Date(this.valueOf());
            var dayNr = (this.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            var firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            return 1 + Math.ceil((firstThursday - target) / 604800000);
        },
        // Month
        F: function() { return Date.longMonths[this.getMonth()]; },
        m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
        M: function() { return Date.shortMonths[this.getMonth()]; },
        n: function() { return this.getMonth() + 1; },
        t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
        // Year
        L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
        o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
        Y: function() { return this.getFullYear(); },
        y: function() { return ('' + this.getFullYear()).substr(2); },
        // Time
        a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
        A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
        B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
        g: function() { return this.getHours() % 12 || 12; },
        G: function() { return this.getHours(); },
        h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
        H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
        i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
        s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
        u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
    '0' : '')) + m; },
        // Timezone
        e: function() { return "Not Yet Supported"; },
        I: function() {
            var DST = null;
                for (var i = 0; i < 12; ++i) {
                        var d = new Date(this.getFullYear(), i, 1);
                        var offset = d.getTimezoneOffset();
    
                        if (DST === null) DST = offset;
                        else if (offset < DST) { DST = offset; break; }                     else if (offset > DST) break;
                }
                return (this.getTimezoneOffset() == DST) | 0;
            },
        O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
        P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
        T: function() { return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); },
        Z: function() { return -this.getTimezoneOffset() * 60; },
        // Full Date/Time
        c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
        r: function() { return this.toString(); },
        U: function() { return this.getTime() / 1000; }
    };

    // Simulates PHP's date function
    Date.prototype.format = function(format) {
        var date = this;
        return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
            return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
        });
    };

}).call(this);

(function () {
	'use strict';
	
	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @version 1.0.3
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */
	
	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/
	
	
	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} options The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;
	
		options = options || {};
	
		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;
	
	
		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;
	
	
		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;
	
	
		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;
	
	
		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;
	
	
		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;
	
	
		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;
	
	
		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;
	
		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;
	
		if (FastClick.notNeeded(layer)) {
			return;
		}
	
		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}
	
	
		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}
	
		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}
	
		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);
	
		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};
	
			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}
	
		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {
	
			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}
	
	
	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;
	
	
	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
	
	
	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);
	
	
	/**
	 * iOS 6.0(+?) requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);
	
	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;
	
	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {
	
		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}
	
			break;
		case 'input':
	
			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}
	
			break;
		case 'label':
		case 'video':
			return true;
		}
	
		return (/\bneedsclick\b/).test(target.className);
	};
	
	
	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}
	
			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};
	
	
	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;
	
		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}
	
		touch = event.changedTouches[0];
	
		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};
	
	FastClick.prototype.determineEventType = function(targetElement) {
	
		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}
	
		return 'click';
	};
	
	
	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;
	
		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};
	
	
	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;
	
		scrollParent = targetElement.fastClickScrollParent;
	
		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}
	
				parentElement = parentElement.parentElement;
			} while (parentElement);
		}
	
		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};
	
	
	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	
		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}
	
		return eventTarget;
	};
	
	
	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;
	
		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}
	
		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];
	
		if (deviceIsIOS) {
	
			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}
	
			if (!deviceIsIOS4) {
	
				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}
	
				this.lastTouchIdentifier = touch.identifier;
	
				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}
	
		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;
	
		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;
	
		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}
	
		return true;
	};
	
	
	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;
	
		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}
	
		return false;
	};
	
	
	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}
	
		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}
	
		return true;
	};
	
	
	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {
	
		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}
	
		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}
	
		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};
	
	
	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
	
		if (!this.trackingClick) {
			return true;
		}
	
		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}
	
		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;
	
		this.lastClickTime = event.timeStamp;
	
		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;
	
		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];
	
			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}
	
		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}
	
				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {
	
			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}
	
			this.focus(targetElement);
			this.sendClick(targetElement, event);
	
			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}
	
			return false;
		}
	
		if (deviceIsIOS && !deviceIsIOS4) {
	
			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}
	
		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}
	
		return false;
	};
	
	
	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};
	
	
	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {
	
		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}
	
		if (event.forwardedTouchEvent) {
			return true;
		}
	
		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}
	
		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
	
			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {
	
				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}
	
			// Cancel the event
			event.stopPropagation();
			event.preventDefault();
	
			return false;
		}
	
		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};
	
	
	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;
	
		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}
	
		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}
	
		permitted = this.onMouse(event);
	
		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}
	
		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};
	
	
	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;
	
		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}
	
		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};
	
	
	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
	
		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}
	
		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];
	
		if (chromeVersion) {
	
			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');
	
				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
	
			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}
	
		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
	
			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');
	
				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}
	
		// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none') {
			return true;
		}
	
		return false;
	};
	
	
	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} options The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};
	
	
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
	
		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

app.directive('extendedFieldRender', function($compile, $templateCache) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            field: '=ngField', //Field information -- this is what the field looks like
            model: '=ngModel', //Host object we look for the data on (the data object) -- this is the data in the field
        },
        templateUrl: 'extended-field-render/extended-field-render.html',
        link: function($scope, $element, $attrs) {

            //Get the model
            //$scope.model = $scope.host[$scope.field.key];

            $scope.showField = true;
            ////////////////////////////////////////

            // $scope.viewInModal = function(item) {
            //     console.log('View in modal', item)
            //     // ModalService.view(item);
            // }

            // $scope.editInModal = function(item) {
            //     console.log('Edit in modal', item)
            //     // ModalService.edit(item);
            // }

            ////////////////////////////////////////

            var template = '';


            switch ($scope.field.type) {
                case 'void':
                case 'null':
                case '':
                    return $element.empty();
                    break;
            }


            // if(!$scope.model[$scope.field.key]) {
            //     return $scope.showField = false;
            // }
            ////////////////////////////////////////


            if ($scope.field.type == 'group') {

                if ($scope.field.asObject) {

                    //Check if multi group or singular
                    if (_.isArray($scope.model[$scope.field.key])) {

                        // template = '<pre ng-repeat="group in model">{{group | json}}</pre>';
                        template = '<div ng-repeat="group in model[field.key]" class="panel panel-default"><div class="panel-heading">{{field.title}} {{$index + 1}}</div><div class="panel-body"><extended-field-render ng-model="group" ng-field="subField" ng-repeat="subField in field.fields"/></div></div>';
                    } else {
                        template = '<extended-field-render ng-model="model[field.key]" ng-field="subField" ng-repeat="subField in field.fields"/>';
                    }
                } else {
                    template = '<extended-field-render ng-model="model" ng-field="subField" ng-repeat="subField in field.fields"/>';

                    //<div ng-repeat="subField in field.fields"> <extended-field-render ng-host="host" ng-model="model" ng-field="subField"></extended-field-render> </div>'; // <extended-field-render ng-host="host" ng-model="group[subField.key]" ng-field="subField"></extended-field-render>
                    // template = '<div class="{{field.className}}"><div ng-repeat="subField in field.fields" class="{{subField.className}}"><pre>{{field | json}}</pre><extended-field-render ng-host="host" ng-model="host[subField.key]" ng-field="subField" ></extended-field-render></div></div>';

                }
            } else {
                //console.log('BOOOOM', $scope.field.key, $scope.model, $scope.model[$scope.field.key])
                //

                if (_.isArray($scope.model[$scope.field.key]) && $scope.model[$scope.field.key].length) {

                    template = $templateCache.get('extended-field-render/field-types/multiple-value.html');
                    //template = '<ol><li class="value in model[field.key]">{{value}}</li></ol>';
                } else {

                    if($scope.model[$scope.field.key] && !_.isArray($scope.model[$scope.field.key])) {
                        template = $templateCache.get('extended-field-render/field-types/value.html');
                    }

                    //template = '<div>{{model[field.key]}}</div>';
                }

                /*
                if (_.isArray($scope.model[$scope.field.key])) {
                    template = '<ol><li class="value in model[field.key]">{{value}}</li></ol>';
                } else {
                    template = '<div>{{model}}</div>';
                }
                */
            }



            ////////////////////////////////////////

            if (template.length) {

                var cTemplate = $compile(template)($scope);

                var contentHolder = $element.find('[field-transclude]');


                if ($scope.field.type == 'group') {
                    contentHolder.addClass($scope.field.className).append(cTemplate);
                } else {
                    $element.addClass($scope.field.className);
                    contentHolder.replaceWith(cTemplate);
                }
            } else {

                $scope.showField = false;
                $element.empty();
            }


        }
    };
})

/////////////////////////////////////////////////////////////////


app.directive('extendedFields', function($compile) {

    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {

            if ($scope.definition) {
                //Flatten all the fields that are defined
                $scope.flattenedFields = getFlattenedFields($scope.definition.fields);
            }
            var template = '<field-edit-render ng-model="item.data[field.key]" ng-field="field" ng-repeat="field in flattenedFields"></field-edit-render>';

            //Compile the template and replace
            var cTemplate = $compile(template)($scope);
            $element.append(cTemplate);

        }
    };
});
function getFlattenedFields(array) {
    return _.chain(array).map(function(field) {
        if (field.type == 'group') {

            console.log('GROUP', field);
            return getFlattenedFields(field.fields);
        } else {
            return field;
        }
    }).flatten().value();
}

/////////////////////////////////////////////////////////////////

// app.directive('viewExtendedFields', function($compile) {
//     return {
//         restrict: 'A',
//         link: function($scope, $element, $attrs) {
//             if($scope.definition) {
//                 $scope.flattenedFields = getFlattenedFields($scope.definition.fields);
//             }
//             var template = '<field-view-render ng-model="item.data[field.key]" ng-field="field" ng-repeat="field in flattenedFields"></field-view-render>';

//             //Compile the template and replace
//             var cTemplate = $compile(template)($scope);
//             $element.append(cTemplate);

//         }
//     };
// });


/////////////////////////////////////////////////////////////////

app.directive('viewExtendedFields', function($compile) {
    return {
        restrict: 'A',
        scope:{
            item:'=',
            definition:'=',
        },
        link: function($scope, $element, $attrs) {

            if($scope.definition) {

            
            $scope.fields = $scope.definition.fields;
            console.log('what are the fields?', $scope.fields)
            console.log('current definition', $scope.definition)

            var template = '<extended-field-render ng-model="item.data" ng-field="field" ng-repeat="field in fields"></extended-field-render>';
            var cTemplate = $compile(template)($scope);
            $element.append(cTemplate);

            }





            /**
            if($scope.definition) {
                $scope.flattenedFields = getFlattenedFields($scope.definition.fields);
            }
            var template = '<field-view-render ng-model="item.data[field.key]" ng-field="field" ng-repeat="field in flattenedFields"></field-view-render>';

            //Compile the template and replace
            var cTemplate = $compile(template)($scope);
            $element.append(cTemplate);

            /**/

        }
    };
});


/////////////////////////////////////////////////////////////////


app.directive('extendedFields', function($compile) {

    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {

            if ($scope.definition) {
                //Flatten all the fields that are defined
                $scope.flattenedFields = getFlattenedFields($scope.definition.fields);
            }
            var template = '<field-edit-render ng-model="item.data[field.key]" ng-field="field" ng-repeat="field in flattenedFields"></field-edit-render>';

            //Compile the template and replace
            var cTemplate = $compile(template)($scope);
            $element.append(cTemplate);

        }
    };
});

/////////////////////////////////////////////////////////////////


app.directive('fieldViewRender', function($compile) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            field: '=ngField',
            model: '=ngModel'
        },
        templateUrl: 'views/ui/field-view-render.html',
        controller: function($scope, ModalService) {


            $scope.viewInModal = function(item) {
                console.log('View in modal', item)
                ModalService.view(item);
            }

            $scope.editInModal = function(item) {
                console.log('Edit in modal', item)
                ModalService.edit(item);
            }


            if (_.isArray($scope.model)) {
                $scope.multiple = true;
            }





            if ($scope.field.minimum == 1 && $scope.field.maximum == 1) {
                $scope.viewModel = [$scope.model];
            } else {
                $scope.viewModel = $scope.model;
            }
        }
    };
});


app.directive('fieldObjectRender', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            model: '=ngModel'
        },
        link: function($scope) {
            $scope.create = function() {
                if (!$scope.model) {
                    $scope.model = {}
                }
            }


        },
        template: '<div><pre>{{model | json}}</pre><a class="btn btn-default" ng-click="create()" ng-if="!model"><span>Add</span><i class="fa fa-plus"></i></a><div ng-if="model"><json-editor config="model"/></div></div>',
    }
});

app.directive('fieldEditRender', function($compile) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            field: '=ngField',
            model: '=ngModel'
        },
        link: function($scope, $element, $attrs) {


            var template = '<div class="form-group"><label>{{field.title}}</label><input ng-model="model" class="form-control" placeholder="{{field.title}}"></div>';


            if ($scope.field.params) {
                $scope.config = $scope.field.params;
            } else {
                $scope.config = {};
            }

            if ($scope.config.restrictType) {
                $scope.config.type = $scope.config.restrictType;
            }




            $scope.config.minimum = $scope.field.minimum;
            $scope.config.maximum = $scope.field.maximum;

            //What directive should we use to render the input
            var renderName = $scope.field.directive;

            switch ($scope.field.type) {
                case 'reference':
                    $scope.config.allowedValues = $scope.field.allowedReferences;
                    $scope.config.defaultValues = $scope.field.defaultReferences;
                    //$scope.config.type = $scope.field.defaultReferences;
                    $scope.config.canCreate = true;
                    renderName = 'content-select';
                    break;
                default:
                    $scope.config.allowedValues = $scope.field.allowedValues;
                    $scope.config.defaultValues = $scope.field.defaultValues;
                    break;
            }

            var attributes = '';

            switch ($scope.field.type) {
                case 'boolean':
                    attributes = 'type="checkbox" ';
                    break;
                case 'float':
                case 'integer':
                case 'number':
                    attributes = 'type="number" ';
                    break;
                case 'email':
                    attributes = 'type="email" ';
                    break;
                case 'date':
                    attributes = 'type="date" ';
                    break;
                case 'reference':
                case 'string':
                    attributes = 'type="text" ';
                    break;
                case 'object':
                    renderName = 'field-object-render';
                    break;

                case 'void':
                    return
                    break;
            }

            if (!renderName) {
                renderName = 'input';
            }

            if (renderName == 'date-select') {
                renderName = 'dateselect';
            }



            switch (renderName) {
                case 'input':
                    if ($scope.field.type == 'boolean') {
                        template = '<div class="form-group"><div class="checkbox"><label><' + renderName + ' ' + attributes + ' ng-model="model"/>{{field.title}}</label></div></div>';
                    } else {
                        template = '<div class="form-group"><label>{{field.title}}</label><' + renderName + ' ' + attributes + ' ng-model="model" placeholder="{{field.title}}" class="form-control" ng-params="config"/></div>';
                    }
                    break;
                case 'textarea':
                    template = '<div class="form-group"><label>{{field.title}}</label><' + renderName + ' ' + attributes + ' ng-model="model" placeholder="{{field.title}}" class="form-control" ng-params="config"/></div>';
                    break;
                case 'select':
                    template = '<div class="form-group"><label>{{field.title}}</label><select ' + attributes + ' ng-model="model" class="form-control" ng-params="config">';
                    _.each($scope.field.options, function(option) {
                        template += '<option value="' + option.value + '">' + option.name + '</option>';
                    })

                    template += '</select></div>';
                    break;
                default:
                    template = '<div class="form-group"><label>{{field.title}}</label><' + renderName + ' ' + attributes + ' ng-model="model" ng-params="config"/></div>';
                    break;

            }


            if (template && template.length) {
                //Compile the template and replace
                var cTemplate = $compile(template)($scope);
                $element.replaceWith(cTemplate);
            }

        }
    };
});
app.service('FluroBreadcrumbService', function($rootScope, $timeout, $state) {

    var controller = {
        trail: [],
    };

    ///////////////////////////////////////

    //Private variables
    var backButtonPress;
    var scrollPositions = {};

    ///////////////////////////////////////

    //Initialize a breadcrumb trail
    controller.trail = [];

    ///////////////////////////////////////

    //Change of state started
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
        //Get the href for the url we're going to
        var path = $state.href(fromState, fromParams);

        //Store the scroll position of where we are currently
        var previousScrollPosition = document.body.scrollTop;
        scrollPositions[path] = previousScrollPosition;
        
    });

    ///////////////////////////////////////

    //Listen for a change to the current state
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {

        //Clear the breadcrumb if we are at the home page
        if(toState.name == 'home') {
            controller.trail.length =0;
        }

        //If the user is navigating back
        if (backButtonPress) {

            //Get the href for the url we're going to
            var path = $state.href(toState, toParams);

            //Get the last scroll position
            var previousScrollPosition = scrollPositions[path];

            //If there is a scroll position previously set
            if (previousScrollPosition) {
                //Move to that scroll position
                $timeout(function() {
                    document.body.scrollTop = previousScrollPosition;
                })
            } else {
                //Otherwise set scroll to 0
                document.body.scrollTop = 0;
            }

            //Remove the previous set breadcrumb
            controller.trail.pop();
            controller.trail.pop();

            //Reset the back button variable
            backButtonPress = false;
        } else {
            //New state so set scroll to 0
            document.body.scrollTop = 0;
        }

        // if(toState)
        //Override here to 
        // switch (toState.name) {
        //     case 'home':
        //     case 'songs':
        //     case 'events':
        //         controller.trail.length = 0;
        //         break;
        // }


        //Add the current state with its parameters to the breadcrumb
        controller.trail.push({
            // title:
            name: toState.name,
            params: toParams
        });
    });




    ///////////////////////////////////////

    //Get the first defined state with a name from the router
    controller.topState = _.find($state.get(), function(state) {
        return (state.name && state.name.length);
    })

    ///////////////////////////////////////

    controller.top = function() {

        controller.trail.length = 0;

        if (controller.topState) {
            //Go to the home state
            $state.go(controller.topState);
        }
    }

    ///////////////////////////////////////

    controller.clear = function() {
        controller.trail.length = 0;
    }

    ///////////////////////////////////////

    controller.backTo = function(breadcrumbItem) {

        // console.log('Back to', breadcrumbItem);

        var index = controller.trail.indexOf(breadcrumbItem);
        if(index != -1) {
            controller.trail.length = index;
            $state.go(breadcrumbItem.name, breadcrumbItem.params);
            return;
        }
    }

    ///////////////////////////////////////

    controller.back = function() {

        //If we only have one breadcrumb in the list then we can't go back any further
        if (!controller.trail.length) {
            return;
        }

        /////////////////////////////

        //And get the last in the breadcrumb
        backButtonPress = true;

        var count = controller.trail.length;
        var previousState = controller.trail[count - 2];


        //If we have a state to go back to
        if (previousState) {
            //Go to the previous state
            $state.go(previousState.name, previousState.params);
        } else {
            //Go up a level if we can
            if ($state.$current.parent && $state.$current.parent.self.name.length) {
                $state.go('^');
            } else {
                //Otherwise just go to the top state
                $state.go(controller.topState);
            }
        }
    }

    ///////////////////////////////////////

    return controller;

});
app.directive('dropover', function($document, $timeout) {

    return {
        restrict: 'A',
        scope:true,
        /**
        scope: {
            dropover: '=dropoverModel',
        },
        /**/
        link: function($scope, $element) {

            if(!$scope.dropover) {
                $scope.dropover = {}
            }

            $document.click(function(event) {

                // console.log('Close dropover');

                var isChild = $element.has(event.target).length > 0; //$($element).has(event.target).length > 0;
                var isSelf = $element[0] == event.target;
                var isInside = isChild || isSelf;


                $timeout(function() {
                    $scope.dropover.open = isInside;
                })


            })
        },
    };
});
app.directive('filterBlock', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'fluro-filter-block/fluro-filter-block.html',
        scope: {
            title: '@',
            target: '=',
            items: '=',
            getpath: '@',
            setpath: '@',
            specific: '=?',
        },
        controller: 'FluroFilterBlockController',
        link: function(scope, element, attrs) {

        }
    };
});

app.controller('FluroFilterBlockController', function($scope) {

    if (!$scope.target) {
        $scope.target = {};
    }

    $scope.settings = {};

    ///////////////////////////////////////////////////

    //If we have specific filters set
    if ($scope.specific) {
        $scope.filterItems = $scope.specific;
    } else {
        $scope.filterItems = [];
    }


    $scope.clicked = function() {

        // var hasFilters = $scope.hasFilters();
        // if (hasFilters) {
        //     $scope.setFilter();
        // } else {
            $scope.settings.expanded = !$scope.settings.expanded;
        // }
    }

    ///////////////////////////////////////////////////

    $scope.getTitle = function() {
        var selected = _.get($scope.target, $scope.setpath);
        if (selected) {
            return selected.title;
        } else {
            return $scope.title;
        }

    }

    ///////////////////////////////////////////////////

    $scope.setFilter = function(value) {
        _.set($scope.target, $scope.setpath, value);

        console.log('Collapse')
        $scope.settings.expanded = false;
    }

    ///////////////////////////////////////////////////

    $scope.isExpanded = function() {

        if ($scope.settings.expanded) {
            return true;
        }

        // if ($scope.hasFilters()) {
        //     return true;
        // }

        return false;
    }

    ///////////////////////////////////////////////////

    $scope.toggleFilter = function(value) {
        var selected = $scope.isActiveFilter(value);
        if (selected) {
            $scope.setFilter();
        } else {
            $scope.setFilter(value);
        }
    }

    ///////////////////////////////////////////////////

    $scope.isActiveFilter = function(value) {

        var selected = _.get($scope.target, $scope.setpath);
        
        if(value && selected) {
            return (selected._id == value._id);
        } else {
            return value == selected;
        }
    }

    ///////////////////////////////////////////////////

    $scope.hasFilters = function() {
        var existingFilter = _.get($scope.target, $scope.setpath);
        if (existingFilter) {
            return true;
        }
    }



    ///////////////////////////////////////////////////

    $scope.$watch('items', function(items) {

        if (!items || !items.length) {
            return $scope.filterItems = [];
        }


        if ($scope.specific) {
            return $scope.filterItems = $scope.specific;
        } else {
            //Get the filter item options
            $scope.filterItems = _.chain(items)
                .map(function(item) {
                    var values = _.get(item, $scope.getpath);

                    return values;
                })
                .flattenDeep()
                .compact()
                .uniqBy(function(option) {
                    return option._id;
                })
                .orderBy(function(option) {
                    return option.title;
                })
                .value();
        }
    })

    // $scope.clicked = function($event) {
    //     if($scope.asLink) {
    //         $state.go('watchVideo',{id:$scope.model._id, from:$scope.fromProduct})
    //     }
    // }


});
app.directive('floatLabel', function() {
    return {
        restrict: 'A',
        scope: true,
        compile: function($element, $attrs) {

            var templateAttributes = [],
                template, attr;

            // if there is no placeholder, there is no use for this directive
            if (!$attrs.placeholder) {
                throw 'Floating label needs a placeholder';
            }

            // copy existing attributes from
            for (attr in $attrs) {
                if ($attrs.hasOwnProperty(attr) && attr.substr(0, 1) !== '$' && attr !== 'floatLabel') {
                    templateAttributes.push($attrs.$attr[attr] + '="' + $attrs[attr] + '"');
                }
            }

            // if there wasn't a ngModel binded to input, generate a key for the ngModel and add it
            if (!$attrs.ngModel) {

                function generateNgModelKey(inputBox) {
                    var inputId = inputBox.attr('id') || '',
                        inputName = inputBox.attr('name') || '';

                    if (inputId.length === 0 && inputName.length === 0) {
                        throw 'If no ng-model is defined, the input should have an id or a name';
                    }

                    return 'input_' + (inputId ? inputId : inputName);
                }


                templateAttributes.push('ng-model="' + generateNgModelKey($element) + '"');
            }

            // html template for the directive
            template = '<div class="float-label">' +
                '<label ng-class="{ \'active\': showLabel }">' + $attrs.placeholder + '</label>' +
                '<input ' + templateAttributes.join(' ') + ' />' +
                '</div>';

            //Replace with template
            console.log('Replace with template')
            $element.replaceWith(angular.element(template));

            return {
                post: function($scope, $element, $attrs) {

                    var inputBox = $element.find('input'),
                        ngModelKey = inputBox.attr('ng-model');

                    $scope.showLabel = false;



                    $scope.$watch(ngModelKey, function(newValue) {

                        console.log('VALUE', ngModelKey, newValue);
                        // if the field is not empty, show the label, otherwise hide it
                        $scope.showLabel = typeof newValue === 'string' && newValue.length > 0;
                    });

                },
            };
        }
    };
});
app.directive('infinitePager', function($timeout, $sessionStorage) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            var perPage = 16;
            
            if($attr.perPage) {
                perPage = parseInt($attr.perPage);
            }
            
            $scope.pager = {
                currentPage: 0,
                limit: perPage,
            };

            $scope.pages = [];

    
            /////////////////////////////////////////////////////
            
            $scope.$watch($attr.items, function(items) {
                
                $scope.allItems = items;
                
                if($scope.allItems) {
                    $scope.pages.length = 0;
                    $scope.pager.currentPage = 0;
                   
                    $scope.totalPages = Math.ceil($scope.allItems.length / $scope.pager.limit) - 1;
                      $scope.updateCurrentPage();
                }
            });
    
            /////////////////////////////////////////////////////
           
            //Update the current page
            $scope.updateCurrentPage = function() {


                
                if ($scope.allItems.length < ($scope.pager.limit * ($scope.pager.currentPage - 1))) {
                    $scope.pager.currentPage = 0;
                }
        
                var start = ($scope.pager.currentPage * $scope.pager.limit);
                var end = start + $scope.pager.limit;
        
                //Slice into seperate chunks
                var sliced = _.slice($scope.allItems, start, end);
                $scope.pages.push(sliced);
            }
    
            /////////////////////////////////////////////////////
             var timer;
            
            $scope.nextPage = function() {
                if ($scope.pager.currentPage < $scope.totalPages) {
                    $timeout.cancel(timer);
                    timer = $timeout(function() {
                        $scope.pager.currentPage = ($scope.pager.currentPage + 1);
                        $scope.updateCurrentPage();
                    });
                } else {
                    $scope.updateCurrentPage();
                }
            }
            
            /////////////////////////////////////////////////////
        }
    };
    
})
app.controller('FluroInteractionButtonSelectController', function($scope, FluroValidate) {


    /////////////////////////////////////////////////////////////////////////

    var to = $scope.to;
    var opts = $scope.options;

    $scope.selection = {
        values: [],
        value: null,
    }


    /////////////////////////////////////////////////////////////////////////

    //Get the definition
    var definition = $scope.to.definition;

    //Minimum and maximum
    var minimum = definition.minimum;
    var maximum = definition.maximum;

    if(!minimum) {
        minimum = 0;
    }

    if(!maximum) {
        maximim = 0;
    }

    $scope.multiple = (maximum != 1);


    /////////////////////////////////////////////////////////////////////////

    $scope.dragControlListeners = {
        //accept: function (sourceItemHandleScope, destSortableScope) {return boolean}//override to determine drag is allowed or not. default is true.
        //itemMoved: function (event) {//Do what you want},
        orderChanged: function(event) {
            //Do what you want
            $scope.model[opts.key] = angular.copy($scope.selection.values);
        },
        //containment: '#board'//optional param.
        //clone: true //optional param for clone feature.
        //allowDuplicates: false //optional param allows duplicates to be dropped.
    };


    /////////////////////////////////////////////////////////////////////////

    $scope.selectBox = {}

    $scope.selectUpdate = function() {
        if(!$scope.selectBox.item) {
            return;
        }
        $scope.selection.values.push($scope.selectBox.item);
        $scope.model[opts.key] = angular.copy($scope.selection.values);
    }

    /////////////////////////////////////////////////////////////////////////




    $scope.canAddMore = function() {

        if(!maximum) {
            return true;
        }
       
        if($scope.multiple) {
            return ($scope.selection.values.length < maximum);
        } else {
            if(!$scope.selection.value) {
                return true;
            }
        }
        
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.contains = function(value) {
        if ($scope.multiple) {
            //Check if the values are selected
            return _.includes($scope.selection.values, value);
        } else {
            return $scope.selection.value == value;
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.select = function(value) {

        if ($scope.multiple) {
            if (!$scope.canAddMore()) {
                return;
            }
            $scope.selection.values.push(value);
        } else {
            $scope.selection.value = value;
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.deselect = function(value) {
        if ($scope.multiple) {
            _.pull($scope.selection.values, value);
        } else {
            $scope.selection.value = null;
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.toggle = function(reference) {

        if ($scope.contains(reference)) {
            $scope.deselect(reference);
        } else {
            $scope.select(reference);
        }

        //Update model
        setModel();
    }


    /////////////////////////////////////////////////////////////////////////

    // initialize the checkboxes check property
    $scope.$watch('model', function(newModelValue, oldModelValue) {


        if (newModelValue != oldModelValue) {
            var modelValue;

            //If there is properties in the FORM model
            if (_.keys(newModelValue).length) {

                //Get the model for this particular field
                modelValue = newModelValue[opts.key];

                if ($scope.multiple) {
                    if (modelValue && _.isArray(modelValue)) {
                        $scope.selection.values = angular.copy(modelValue);
                    } else {
                        $scope.selection.values = [];
                    }
                } else {
                    $scope.selection.value = angular.copy(modelValue);
                }
            }
        }
    }, true);


    /////////////////////////////////////////////////////////////////////////

    function checkValidity() {

        var validRequired;
        var validInput = FluroValidate.validate($scope.model[$scope.options.key], definition);

        //Check if multiple
        if ($scope.multiple) {
            if ($scope.to.required) {
                validRequired = _.isArray($scope.model[opts.key]) && $scope.model[opts.key].length > 0;
            }
        } else {
            if ($scope.to.required) {
                if ($scope.model[opts.key]) {
                    validRequired = true;
                }
            }
        }

        if ($scope.fc) {
            $scope.fc.$setValidity('required', validRequired);
            $scope.fc.$setValidity('validInput', validInput);
        }
    }

    /////////////////////////////////////////////////////////////////////////

    function setModel() {
        if ($scope.multiple) {
            $scope.model[opts.key] = angular.copy($scope.selection.values);
        } else {
            $scope.model[opts.key] = angular.copy($scope.selection.value);
        }

        if ($scope.fc) {
            $scope.fc.$setTouched();
        }

        //console.log('Model set!', $scope.model[opts.key]);
        checkValidity();
    }

    /////////////////////////////////////////////////////////////////////////

    if (opts.expressionProperties && opts.expressionProperties['templateOptions.required']) {
        $scope.$watch(function() {
            return $scope.to.required;
        }, function(newValue) {
            checkValidity();
        });
    }

    /////////////////////////////////////////////////////////////////////////

    if ($scope.to.required) {
        var unwatchFormControl = $scope.$watch('fc', function(newValue) {
            if (!newValue) {
                return;
            }
            checkValidity();
            unwatchFormControl();
        });
    }

    /////////////////////////////////////////////////////////////////////////
})
app.run(function(formlyConfig, $templateCache) {

    formlyConfig.setType({
        name: 'dob-select',
        templateUrl: 'fluro-interaction-form/dob-select/fluro-dob-select.html',
        //controller: 'FluroInteractionDobSelectController',
        wrapper: ['bootstrapHasError'],
    });

});

app.run(function(formlyConfig, $templateCache) {

    formlyConfig.setType({
        name: 'embedded',
        templateUrl: 'fluro-interaction-form/embedded/fluro-embedded.html',
        controller: 'FluroInteractionNestedController',
        wrapper: ['bootstrapHasError'],
    });

});

/**

app.controller('FluroEmbeddedDefinitionController', function($scope, $http, Fluro, $filter, FluroValidate) {


})

/**/
app.directive('interactionForm', function($compile) {
    return {
        restrict: 'E',
        //replace: true,
        scope: {
            model: '=ngModel',
            integration: '=ngPaymentIntegration',
            vm: '=?config',
            callback: '=?callback',
        },
        transclude: true,
        controller: 'InteractionFormController',
        template: '<div class="fluro-interaction-form" ng-transclude-here />',
        link: function($scope, $element, $attrs, $ctrl, $transclude) {
            $transclude($scope, function(clone, $scope) {
                $element.find('[ng-transclude-here]').append(clone); // <-- will transclude it's own scope
            });
        },
    };
});

////////////////////////////////////////////////////////////////////////

app.directive('webform', function($compile) {
    return {
        restrict: 'E',
        //replace: true,
        scope: {
            model: '=ngModel',
            integration: '=ngPaymentIntegration',
            vm: '=?config',
            debugMode: '=?debugMode',
            callback: '=?callback',
            linkedEvent: '=?linkedEvent',
        },
        transclude: true,
        controller: 'InteractionFormController',
        templateUrl: 'fluro-interaction-form/fluro-web-form.html',
        link: function($scope, $element, $attrs, $ctrl, $transclude) {
            $transclude($scope, function(clone, $scope) {

                $scope.transcludedContent = clone;

                //$element.find('[ng-transclude-here]').append(clone); // <-- will transclude it's own scope
            });
        },
    };
});


app.config(function(formlyConfigProvider) {

    /*
    formlyConfigProvider.setWrapper({
      name: 'validation',
      types: ['currency'],
      templateUrl: 'error-messages.html'
    });
*/





    formlyConfigProvider.setType({
        name: 'currency',
        extends: 'input',
        controller: function($scope) {
            /*
            //console.log('CURRENCY SCOPE', $scope);

            $scope.$watch('model[options.key]', function(val) {

                if(!$scope.model[$scope.options.key] && $scope.model[$scope.options.key] != 0 ) {
                    //console.log('Set!')
                    $scope.model[$scope.options.key] = 0;
                }
            })
            /**/
        },

        wrapper: ['bootstrapLabel', 'bootstrapHasError'],
        defaultOptions: {
            ngModelAttrs: {
                currencyDirective: {
                    attribute: 'ng-currency'
                },
                fractionValue: {
                    attribute: 'fraction',
                    bound: 'fraction'
                },
                minimum: {
                    attribute: 'min',
                    bound: 'min'
                },
                maximum: {
                    attribute: 'max',
                    bound: 'max'
                }
            },
            templateOptions: {
                customAttrVal: '',
                required: true,
                fraction: 2,
            },
            validators: {
                validInput: {
                    expression: function($viewValue, $modelValue, scope) {

                        var numericValue = Number($modelValue);

                        if (isNaN(numericValue)) {
                            return false;
                        }

                        //Get Minimum and Maximum Amounts
                        var minimumAmount = scope.options.data.minimumAmount;
                        var maximumAmount = scope.options.data.maximumAmount;

                        if (minimumAmount && numericValue < minimumAmount) {
                            return false;
                        }

                        if (maximumAmount && numericValue > maximumAmount) {
                            return false;
                        }

                        return true;
                    }
                }
            }
        }
    });


})

////////////////////////////////////////////////////////////////////////

app.run(function(formlyConfig, $templateCache) {

    formlyConfig.templateManipulators.postWrapper.push(function(template, options, scope) {
        var fluroErrorTemplate = $templateCache.get('fluro-interaction-form/field-errors.html');
        return '<div>' + template + fluroErrorTemplate + '</div>';
    });

    //////////////////////////////////

    /*
    formlyConfig.setType({
        name: 'value-select',
        templateUrl: 'fluro-interaction-form/fluro-value-select.html',
        controller: 'FluroValueSelectController',
        defaultOptions: {
            //noFormControl: true,
        },
    });
*/




    formlyConfig.setType({
        name: 'multiInput',
        templateUrl: 'fluro-interaction-form/multi.html',
        defaultOptions: {
            noFormControl: true,
            wrapper: ['bootstrapLabel', 'bootstrapHasError'],
            templateOptions: {
                inputOptions: {
                    wrapper: null
                }
            }
        },
        controller: /* @ngInject */ function($scope) {
            $scope.copyItemOptions = copyItemOptions;

            function copyItemOptions() {
                return angular.copy($scope.to.inputOptions);
            }
        }
    });

    /**
    // set templates here
    formlyConfig.setType({
        name: 'nested',
        templateUrl: 'fluro-interaction-form/nested/fluro-nested.html',
        controller: function($scope) {

            $scope.$watch('model[options.key]', function(keyModel) {
                if (!keyModel) {
                    $scope.model[$scope.options.key] = [];
                }
            })

            ////////////////////////////////////

            //Definition
            var def = $scope.to.definition;

            var minimum = def.minimum;
            var maximum = def.maximum;
            var askCount = def.askCount;

            if (!minimum) {
                minimum = 0;
            }

            if (!maximum) {
                maximum = 0;
            }

            if (!askCount) {
                askCount = 0;
            }

            //////////////////////////////////////

            if (minimum && askCount < minimum) {
                askCount = minimum;
            }

            if (maximum && askCount > maximum) {
                askCount = maximum;
            }

            //////////////////////////////////////

            if (maximum == 1 && minimum == 1 && $scope.options.key) {
                ////console.log('Only 1!!!', $scope.options)
            } else {
                if (askCount && !$scope.model[$scope.options.key].length) {
                    _.times(askCount, function() {
                        $scope.model[$scope.options.key].push({});
                    });
                }
            }

            $scope.addAnother = function() {
                $scope.model[$scope.options.key].push({});
            }

            ////////////////////////////////////

            $scope.canRemove = function() {
                if (minimum) {
                    if ($scope.model[$scope.options.key].length > minimum) {
                        return true;
                    }
                } else {
                    return true;
                }
            }

            ////////////////////////////////////

            $scope.canAdd = function() {
                if (maximum) {
                    if ($scope.model[$scope.options.key].length < maximum) {
                        return true;
                    }
                } else {
                    return true;
                }
            }


            $scope.copyFields = function() {
                return angular.copy($scope.options.data.fields);
            }
        }
        //defaultValue:[],
        //noFormControl: true,
        //template: '<formly-form model="model[options.key]" fields="options.data.fields"></formly-form>'
    });

/**/

    //////////////////////////////////

    formlyConfig.setType({
        name: 'payment',
        templateUrl: 'fluro-interaction-form/payment/payment.html',
        //controller: 'FluroPaymentController',
        defaultOptions: {
            noFormControl: true,
        },
    });

    /**/
    formlyConfig.setType({
        name: 'custom',
        templateUrl: 'fluro-interaction-form/custom.html',
        controller: 'CustomInteractionFieldController',
        wrapper: ['bootstrapHasError']
    });

    formlyConfig.setType({
        name: 'button-select',
        templateUrl: 'fluro-interaction-form/button-select/fluro-button-select.html',
        controller: 'FluroInteractionButtonSelectController',
        wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    });



    formlyConfig.setType({
        name: 'date-select',
        templateUrl: 'fluro-interaction-form/date-select/fluro-date-select.html',
        wrapper: ['bootstrapLabel', 'bootstrapHasError']
    });



    formlyConfig.setType({
        name: 'terms',
        templateUrl: 'fluro-interaction-form/fluro-terms.html',
        wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    });


    formlyConfig.setType({
        name: 'order-select',
        templateUrl: 'fluro-interaction-form/order-select/fluro-order-select.html',
        controller: 'FluroInteractionButtonSelectController',
        wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    });

    /**/

});

////////////////////////////////////////////////////////////////////////

app.controller('CustomInteractionFieldController', function($scope, FluroValidate) {
    $scope.$watch('model[options.key]', function(value) {
        if (value) {
            if ($scope.fc) {
                $scope.fc.$setTouched();
            }
        }
    }, true);
});

/*
////////////////////////////////////////////////////////////////////////

app.controller('FluroValueSelectController', function($scope, FluroValidate) {

    //Minimum and maximum
    var minimum = $scope.to.definition.minimum;
    var maximum = $scope.to.definition.maximum;

    //multiple
    var multiple = (maximum != 1)

    if (!$scope.model[$scope.options.key]) {
        if (multiple) {
            $scope.model[$scope.options.key] = [];
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.$watch('model[options.key]', function(value) {
        if (value) {
            $scope.fc.$setTouched();
        }
    }, true);

    /////////////////////////////////////////////////////////////////////////

    $scope.contains = function(value) {

        if (multiple) {
            return _.contains($scope.model[$scope.options.key], value);
        } else {
            return ($scope.model[$scope.options.key] == value);
        }
    }

    /////////////////////////////////////////////////////////////////////////

    function checkValidity() {
        var valid = FluroValidate.validate($scope.model[$scope.options.key], $scope.to.definition);

        //Set the valid vaue
        $scope.fc.$setValidity('validInput', valid);
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.toggle = function(value) {


        if (!$scope.contains(value)) {
            if (multiple) {
                $scope.model[$scope.options.key].push(value);
            } else {
                //Make this value the active value
                $scope.model[$scope.options.key] = value;
            }
        } else {
            if (multiple) {
                _.pull($scope.model[$scope.options.key], value);
            } else {
                $scope.model[$scope.options.key] = null;
            }
        }

        $scope.fc.$setTouched();
        checkValidity();
    }
});
*/

/*
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function setTouched(fc) {
    if (fc) {
        if (fc.$setTouched) {
            fc.$setTouched();
        } else {
            _.each(fc, function(f) {
                f.$setTouched();
            })
        }
    }
}

////////////////////////////////////////////////////////////////////////

function setUntouched(fc) {
    if (fc) {
        if (fc.$setUntouched) {
            fc.$setUntouched();
        } else {
            _.each(fc, function(f) {
                f.$setUntouched();
            })
        }
    }
}

////////////////////////////////////////////////////////////////////////


function setDirty(fc) {
    if (fc) {
        if (fc.$setDirty) {
            fc.$setDirty();
        } else {
            _.each(fc, function(f) {
                f.$setDirty();
            })
        }
    }
}

////////////////////////////////////////////////////////////////////////

function setValidity(fc, str, valid) {
    if (fc) {
        if (fc.$setValidity) {
            fc.$setValidity(str, valid);
        } else {
            _.each(fc, function(f) {
                f.$setValidity(str, valid);
            })
        }
    }
}

*/

////////////////////////////////////////////////////////////////////////



/*
app.controller('FluroInteractionReferenceSelectController', function($scope, FluroValidate, FluroContent) {

    //Get the definition
    var definition = $scope.to.definition;

    //Minimum and maximum
    var minimum = definition.minimum;
    var maximum = definition.maximum;

    /////////////////////////////////////////////////////////////////////////

    //Setup Model as array if multiple
    var multiple = (maximum != 1)

    if (!$scope.model[$scope.options.key]) {
        if (multiple) {
            $scope.model[$scope.options.key] = [];
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.$watch('model[options.key]', function() {
        checkValidity();
    })

    /////////////////////////////////////////////////////////////////////////

    $scope.contains = function(value) {
        if (!$scope.model[$scope.options.key]) {
            $scope.model[$scope.options.key] = [];
        }
        if (multiple) {
            return _.contains($scope.model[$scope.options.key], value);
        } else {
            return ($scope.model[$scope.options.key] == value);
        }
    }

   
    
    /////////////////////////////////////////////////////////////////////////

    function checkValidity() {
        var valid = FluroValidate.validate($scope.model[$scope.options.key], definition);
        //console.log('VALID?', valid)
        //Set the valid vaue
        setValidity($scope.fc, 'validInput', valid);
    }


    /////////////////////////////////////////////////////////////////////////

    $scope.toggle = function(value) {
        if (!$scope.contains(value)) {
            if (multiple) {
                if (!$scope.model[$scope.options.key]) {
                    $scope.model[$scope.options.key] = [];
                }
                $scope.model[$scope.options.key].push(value);
            } else {
                //Make this value the active value
                $scope.model[$scope.options.key] = value;
            }
        } else {
            if (multiple) {
                if (!$scope.model[$scope.options.key]) {
                    $scope.model[$scope.options.key] = [];
                }
                _.pull($scope.model[$scope.options.key], value);
            } else {
                $scope.model[$scope.options.key] = null;
            }
        }
       
        setTouched($scope.fc);
        checkValidity();
    }

    /////////////////////////////////////////////////////////////////////////

    if (definition.allowedReferences && definition.allowedReferences.length) {
        $scope.references = definition.allowedReferences;
    } else {
        //Load up the options by querying the database
        FluroContent.resource(definition.params.restrictType).query().$promise.then(function(res) {
            $scope.references = res;
        }, function(res) {
            //console.log('Error retrieving references')
        });
    }

    /////////////////////////////////////////////////////////////////////////

});

*/


////////////////////////////////////////////////////////////////////////

app.controller('FluroDateSelectController', function($scope) {

    $scope.today = function() {
        $scope.model[$scope.options.key] = new Date();
    };


    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd/MM/yyyy'];
    $scope.format = $scope.formats[0];


});



////////////////////////////////////////////////////////////////////////


app.controller('InteractionFormController', function($scope, $q, $timeout,$rootScope, FluroAccess, $parse, $filter, formlyValidationMessages, FluroContent, FluroContentRetrieval, FluroValidate, FluroInteraction) {

    /////////////////////////////////////////////////////////////////

    if (!$scope.vm) {
        $scope.vm = {}
    }

    /////////////////////////////////////////////////////////////////

    //Keep this available to all field scopes
    //this is used so that other fields can get calculated total
    //not just the payment summary field
    $formScope = $scope;


    if($scope.debugMode) {
        console.log('-- DEBUG MODE --')
    }
    /////////////////////////////////////////////////////////////////

    // The model object that we reference
    // on the  element in index.html
    if ($scope.vm.defaultModel) {
        $scope.vm.model = angular.copy($scope.vm.defaultModel);
    } else {
        $scope.vm.model = {};
    }

    /////////////////////////////////////////////////////////////////

    // An array of our form fields with configuration
    // and options set. We make reference to this in
    // the 'fields' attribute on the  element
    $scope.vm.modelFields = [];

    /////////////////////////////////////////////////////////////////

    //Keep track of the state of the form
    $scope.vm.state = 'ready';


    /////////////////////////////////////////////////////////////////

    $scope.correctPermissions = true;

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    $scope.readyToSubmit = false;

    $scope.$watch('vm.modelForm.$invalid + vm.modelForm.$error', function() {


        // $scope.readyToSubmit = true;
        // return;

        //Interaction Form
        var interactionForm = $scope.vm.modelForm;

        if (!interactionForm) {
            // //console.log('Invalid no form')
            return $scope.readyToSubmit = false;
        }

        if (interactionForm.$invalid) {
            // //console.log('Invalid because its invalid', interactionForm);
            return $scope.readyToSubmit = false;
        }

        if (interactionForm.$error) {

            // //console.log('Has an error', interactionForm.$error);

            if (interactionForm.$error.required && interactionForm.$error.required.length) {
                // //console.log('required input not provided');
                return $scope.readyToSubmit = false;
            }

            if (interactionForm.$error.validInput && interactionForm.$error.validInput.length) {
                // //console.log('valid input not provided');
                return $scope.readyToSubmit = false;
            }
        }

        // //console.log('Form should be good to go')

        //It all worked so set to true
        $scope.readyToSubmit = true;

    }, true)

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    formlyValidationMessages.addStringMessage('required', 'This field is required');

    /*
    formlyValidationMessages.messages.required = function($viewValue, $modelValue, scope) {
        return scope.to.label + ' is required';
    }
    */

    formlyValidationMessages.messages.validInput = function($viewValue, $modelValue, scope) {
        return scope.to.label + ' is not a valid value';
    }

    formlyValidationMessages.messages.date = function($viewValue, $modelValue, scope) {
        return scope.to.label + ' is not a valid date';
    }

    /////////////////////////////////////////////////////////////////

    $scope.reset = function() {

        //Reset
        if ($scope.vm.defaultModel) {
            $scope.vm.model = angular.copy($scope.vm.defaultModel);
        } else {
            $scope.vm.model = {};
        }
        $scope.vm.modelForm.$setPristine();
        $scope.vm.options.resetModel();




        //Clear the response from previous submission
        $scope.response = null;
        $scope.vm.state = 'ready';


        //Reset after state change
        //console.log('Broadcast reset')
        $scope.$broadcast('form-reset');

    }

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    //Function to run on permissions
    // function checkPermissions() {
    //     if ($rootScope.user) {
    //         //Check if we have the correct permissions
    //         var canCreate = FluroAccess.can('create', $scope.model.definitionName);
    //         var canSubmit = FluroAccess.can('submit', $scope.model.definitionName);

    //         //Allow if the user can create or submit
    //         $scope.correctPermissions = (canCreate | canSubmit);
    //     } else {
    //         //Just do this by default
    //         $scope.correctPermissions = true;
    //     }
    // }

    // /////////////////////////////////////////////////////////////////

    // //Watch if user login changes
    // $scope.$watch(function() {
    //     return $rootScope.user;
    // }, checkPermissions)

    /////////////////////////////////////////////////////////////////

    $scope.$watch('model', function(newData, oldData) {


        // //console.log('Model changed');
        if (!$scope.model || $scope.model.parentType != 'interaction') {
            return; //$scope.model = {};
        }

        /////////////////////////////////////////////////////////////////

        //check if we have the correct permissions



        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        // The model object that we reference
        // on the  element in index.html
        // $scope.vm.model = {};
        if ($scope.vm.defaultModel) {
            $scope.vm.model = angular.copy($scope.vm.defaultModel);
        } else {
            $scope.vm.model = {};
        }


        // An array of our form fields with configuration
        // and options set. We make reference to this in
        // the 'fields' attribute on the  element
        $scope.vm.modelFields = [];

        /////////////////////////////////////////////////////////////////

        //Keep track of the state of the form
        $scope.vm.state = 'ready';

        /////////////////////////////////////////////////////////////////

        //Add the submit function
        $scope.vm.onSubmit = submitInteraction;

        /////////////////////////////////////////////////////////////////

        //Keep track of any async promises we need to wait for
        $scope.promises = [];

        /////////////////////////////////////////////////////////////////

        //Submit is finished
        $scope.submitLabel = 'Submit';

        if ($scope.model && $scope.model.data && $scope.model.data.submitLabel && $scope.model.data.submitLabel.length) {
            $scope.submitLabel = $scope.model.data.submitLabel;
        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        //Add the required contact details
        var interactionFormSettings = $scope.model.data;

        if (!interactionFormSettings) {
            interactionFormSettings = {};
        }

        if (!interactionFormSettings.allowAnonymous && !interactionFormSettings.disableDefaultFields) {
            interactionFormSettings.requireFirstName = true;
            interactionFormSettings.requireLastName = true;
            interactionFormSettings.requireGender = true;
            interactionFormSettings.requireEmail = true;

            switch (interactionFormSettings.identifier) {
                case 'both':
                    interactionFormSettings.requireEmail =
                        interactionFormSettings.requirePhone = true;
                    break;
                case 'email':
                    interactionFormSettings.requireEmail = true;
                    break;
                case 'phone':
                    interactionFormSettings.requirePhone = true;
                    break;
                case 'either':
                    interactionFormSettings.askPhone = true;
                    interactionFormSettings.askEmail = true;
                    break;
            }
        }


        /////////////////////////////////////////////////////////////////

        var firstNameField;
        var lastNameField;
        var genderField;

        /////////////////////////////////////////////////////////////////

        //Gender
        if (interactionFormSettings.askGender || interactionFormSettings.requireGender) {
            genderField = {
                    key: '_gender',
                    type: 'select',
                    templateOptions: {
                        type: 'email',
                        label: 'Title',
                        placeholder: 'Please select a title',
                        options: [{
                            name: 'Mr',
                            value: 'male'
                        }, {
                            name: 'Ms / Mrs',
                            value: 'female'
                        }],
                        required: interactionFormSettings.requireGender,
                        onBlur: 'to.focused=false',
                        onFocus: 'to.focused=true',
                    },
                    validators: {
                        validInput: function($viewValue, $modelValue, scope) {
                            var value = $modelValue || $viewValue;
                            return (value == 'male' || value == 'female');
                        }
                    }
                }
                //$scope.vm.modelFields.push(newField);
        }

        /////////////////////////////////////////////////////////////////

        //First Name
        if (interactionFormSettings.askFirstName || interactionFormSettings.requireFirstName) {
            firstNameField = {
                key: '_firstName',
                type: 'input',
                templateOptions: {
                    type: 'text',
                    label: 'First Name',
                    placeholder: 'Please enter your first name',
                    required: interactionFormSettings.requireFirstName,
                    onBlur: 'to.focused=false',
                    onFocus: 'to.focused=true',
                }
            }

        }

        /////////////////////////////////////////////////////////////////

        //Last Name
        if (interactionFormSettings.askLastName || interactionFormSettings.requireLastName) {
            lastNameField = {
                key: '_lastName',
                type: 'input',
                templateOptions: {
                    type: 'text',
                    label: 'Last Name',
                    placeholder: 'Please enter your last name',
                    required: interactionFormSettings.requireLastName,
                    onBlur: 'to.focused=false',
                    onFocus: 'to.focused=true',
                }
            }

        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        if (genderField && firstNameField && lastNameField) {

            genderField.className = 'col-sm-2';

            firstNameField.className =
                lastNameField.className = 'col-sm-5';

            $scope.vm.modelFields.push({
                fieldGroup: [genderField, firstNameField, lastNameField],
                className: 'row'
            });
        } else if (firstNameField && lastNameField && !genderField) {
            firstNameField.className =
                lastNameField.className = 'col-sm-6';

            $scope.vm.modelFields.push({
                fieldGroup: [firstNameField, lastNameField],
                className: 'row'
            });
        } else {
            if (genderField) {
                $scope.vm.modelFields.push(genderField);
            }

            if (firstNameField) {
                $scope.vm.modelFields.push(firstNameField);
            }

            if (lastNameField) {
                $scope.vm.modelFields.push(lastNameField);
            }
        }



        /////////////////////////////////////////////////////////////////

        //Email Address
        if (interactionFormSettings.askEmail || interactionFormSettings.requireEmail) {
            var newField = {
                key: '_email',
                type: 'input',
                templateOptions: {
                    type: 'email',
                    label: 'Email Address',
                    placeholder: 'Please enter a valid email address',
                    required: interactionFormSettings.requireEmail,
                    onBlur: 'to.focused=false',
                    onFocus: 'to.focused=true',
                },
                validators: {
                    validInput: function($viewValue, $modelValue, scope) {
                        var value = $modelValue || $viewValue;
                        return validator.isEmail(value);
                    }
                }
            }

            if (interactionFormSettings.identifier == 'either') {
                newField.expressionProperties = {
                    'templateOptions.required': function($viewValue, $modelValue, scope) {
                        if (!scope.model._phoneNumber || !scope.model._phoneNumber.length) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }

            $scope.vm.modelFields.push(newField);
        }


        /////////////////////////////////////////////////////////////////

        //Ask Phone Number
        if (interactionFormSettings.askPhone || interactionFormSettings.requirePhone) {
            var newField = {
                key: '_phoneNumber',
                type: 'input',
                templateOptions: {
                    type: 'tel',
                    label: 'Contact Phone Number',
                    placeholder: 'Please enter a contact phone number',
                    required: interactionFormSettings.requirePhone,
                    onBlur: 'to.focused=false',
                    onFocus: 'to.focused=true',
                }
            }

            if (interactionFormSettings.identifier == 'either') {
                newField.expressionProperties = {
                    'templateOptions.required': function($viewValue, $modelValue, scope) {
                        if (!scope.model._email || !scope.model._email.length) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }

            }


            $scope.vm.modelFields.push(newField);
        }

        /////////////////////////////////////////////////////////////////

        //Age / Date of birth
        if (interactionFormSettings.askDOB || interactionFormSettings.requireDOB) {
            var newField = {
                key: '_dob',
                type: 'dob-select',
                templateOptions: {
                    label: 'Date of birth',
                    placeholder: 'Please provide your date of birth',
                    required: interactionFormSettings.requireDOB,
                    maxDate: new Date(),
                    onBlur: 'to.focused=false',
                    onFocus: 'to.focused=true',
                    // params:{
                    //     hideAge:true,
                    // }

                }
            }

            $scope.vm.modelFields.push(newField);
        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        function addFieldDefinition(array, fieldDefinition) {


            if (fieldDefinition.params && fieldDefinition.params.disableWebform) {
                //If we are hiding this field then just do nothing and return here
                return;
            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //Create a new field
            var newField = {};
            newField.key = fieldDefinition.key;

            /////////////////////////////

            //Add the class name if applicable
            if (fieldDefinition.className) {
                newField.className = fieldDefinition.className;
            }

            /////////////////////////////

            //Template Options
            var templateOptions = {};
            templateOptions.type = 'text';
            templateOptions.label = fieldDefinition.title;
            templateOptions.description = fieldDefinition.description;
            templateOptions.params = fieldDefinition.params;

            //Attach a custom error message
            if (fieldDefinition.errorMessage) {
                templateOptions.errorMessage = fieldDefinition.errorMessage;
            }

            //Include the definition itself
            templateOptions.definition = fieldDefinition;

            /////////////////////////////

            //Add a placeholder
            if (fieldDefinition.placeholder && fieldDefinition.placeholder.length) {
                templateOptions.placeholder = fieldDefinition.placeholder;
            } else if (fieldDefinition.description && fieldDefinition.description.length) {
                templateOptions.placeholder = fieldDefinition.description;
            } else {
                templateOptions.placeholder = fieldDefinition.title;
            }

            /////////////////////////////

            //Require if minimum is greater than 1 and not a field group
            templateOptions.required = (fieldDefinition.minimum > 0);

            /////////////////////////////

            templateOptions.onBlur = 'to.focused=false';
            templateOptions.onFocus = 'to.focused=true';

            /////////////////////////////

            //Directive or widget
            switch (fieldDefinition.directive) {
                case 'reference-select':
                case 'value-select':
                    //Detour here
                    newField.type = 'button-select';
                    break;
                case 'select':
                    newField.type = 'select';
                    break;
                case 'wysiwyg':
                    newField.type = 'textarea';
                    break;
                default:
                    newField.type = fieldDefinition.directive;
                    break;
            }


            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //Allowed Options

            switch (fieldDefinition.type) {

                case 'reference':
                    //If we have allowed references specified
                    if (fieldDefinition.allowedReferences && fieldDefinition.allowedReferences.length) {
                        templateOptions.options = _.map(fieldDefinition.allowedReferences, function(ref) {
                            return {
                                name: ref.title,
                                value: ref._id,
                            }
                        });
                    } else {
                        //We want to load all the options from the server
                        templateOptions.options = [];

                        if (fieldDefinition.sourceQuery) {

                            //We use the query to find all the references we can find
                            var queryId = fieldDefinition.sourceQuery;
                            if (queryId._id) {
                                queryId = queryId._id;
                            }

                            /////////////////////////

                            var options = {};

                            //If we need to template the query
                            if (fieldDefinition.queryTemplate) {
                                options.template = fieldDefinition.queryTemplate;
                                if (options.template._id) {
                                    options.template = options.template._id;
                                }
                            }

                            /////////////////////////

                            //Now retrieve the query
                            var promise = FluroContentRetrieval.getQuery(queryId, options);

                            //Now get the results from the query
                            promise.then(function(res) {
                                ////console.log('Options', res);
                                templateOptions.options = _.map(res, function(ref) {
                                    return {
                                        name: ref.title,
                                        value: ref._id,
                                    }
                                })
                            });
                        } else {

                            if (fieldDefinition.directive != 'embedded') {
                                if (fieldDefinition.params.restrictType && fieldDefinition.params.restrictType.length) {
                                    //We want to load all the possible references we can select
                                    FluroContent.resource(fieldDefinition.params.restrictType).query().$promise.then(function(res) {
                                        templateOptions.options = _.map(res, function(ref) {
                                            return {
                                                name: ref.title,
                                                value: ref._id,
                                            }
                                        })
                                    });
                                }
                            }
                        }
                    }
                    break;
                default:
                    //Just list the options specified
                    if (fieldDefinition.options && fieldDefinition.options.length) {
                        templateOptions.options = fieldDefinition.options;
                    } else {
                        templateOptions.options = _.map(fieldDefinition.allowedValues, function(val) {
                            return {
                                name: val,
                                value: val
                            }
                        });
                    }
                    break;
            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //If there is custom attributes
            if (fieldDefinition.attributes && _.keys(fieldDefinition.attributes).length) {
                newField.ngModelAttrs = _.reduce(fieldDefinition.attributes, function(results, attr, key) {
                    var customKey = 'customAttr' + key;
                    results[customKey] = {
                        attribute: key
                    };

                    //Custom Key
                    templateOptions[customKey] = attr;

                    return results;
                }, {});
            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //What kind of data type, override for things like checkbox
            //if (fieldDefinition.type == 'boolean') {
            if (fieldDefinition.directive != 'custom') {
                switch (fieldDefinition.type) {
                    case 'boolean':
                        if (fieldDefinition.params && fieldDefinition.params.storeCopy) {
                            newField.type = 'terms';
                        } else {
                            newField.type = 'checkbox';
                        }

                        break;
                    case 'number':
                    case 'float':
                    case 'integer':
                    case 'decimal':
                        templateOptions.type = 'input';
                        // templateOptions.step = 'any';

                        if (!newField.ngModelAttrs) {
                            newField.ngModelAttrs = {};
                        }

                        /////////////////////////////////////////////

                        //Only do this if its an integer cos iOS SUCKS!
                        if (fieldDefinition.type == 'integer') {
                            // //console.log('Is integer');

                            templateOptions.type = 'number';
                            templateOptions.baseDefaultValue = 0;
                            //Force numeric keyboard
                            newField.ngModelAttrs.customAttrpattern = {
                                attribute: 'pattern',
                            }

                            newField.ngModelAttrs.customAttrinputmode = {
                                attribute: 'inputmode',
                            }

                            //Force numeric keyboard
                            templateOptions.customAttrpattern = "[0-9]*";
                            templateOptions.customAttrinputmode = "numeric"


                            /////////////////////////////////////////////

                            // //console.log('SET NUMERICINPUT')

                            if (fieldDefinition.params) {
                                if (parseInt(fieldDefinition.params.maxValue) !== 0) {
                                    templateOptions.max = fieldDefinition.params.maxValue;
                                }

                                if (parseInt(fieldDefinition.params.minValue) !== 0) {
                                    templateOptions.min = fieldDefinition.params.minValue;
                                } else {
                                    templateOptions.min = 0;
                                }
                            }

                        }
                        break;
                }

            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //Default Options

            if (fieldDefinition.maximum == 1) {
                if (fieldDefinition.type == 'reference' && fieldDefinition.directive != 'embedded') {
                    if (fieldDefinition.defaultReferences && fieldDefinition.defaultReferences.length) {

                        if (fieldDefinition.directive == 'search-select') {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultReferences[0];
                        } else {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultReferences[0]._id;
                        }
                    }
                } else {
                    if (fieldDefinition.defaultValues && fieldDefinition.defaultValues.length) {

                        if (templateOptions.type == 'number') {
                            templateOptions.baseDefaultValue = Number(fieldDefinition.defaultValues[0]);
                        } else {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultValues[0];
                        }
                    }
                }
            } else {
                if (fieldDefinition.type == 'reference' && fieldDefinition.directive != 'embedded') {
                    if (fieldDefinition.defaultReferences && fieldDefinition.defaultReferences.length) {
                        if (fieldDefinition.directive == 'search-select') {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultReferences;
                        } else {
                            templateOptions.baseDefaultValue = _.map(fieldDefinition.defaultReferences, function(ref) {
                                return ref._id;
                            });
                        }
                    } else {
                        templateOptions.baseDefaultValue = [];
                    }
                } else {
                    if (fieldDefinition.defaultValues && fieldDefinition.defaultValues.length) {

                        if (templateOptions.type == 'number') {
                            templateOptions.baseDefaultValue = _.map(fieldDefinition.defaultValues, function(val) {
                                return Number(val);
                            });
                        } else {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultValues;
                        }
                    }
                }
            }


            /////////////////////////////

            //Append the template options
            newField.templateOptions = templateOptions;

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            newField.validators = {
                validInput: function($viewValue, $modelValue, scope) {
                    var value = $modelValue || $viewValue;

                    if (!value) {
                        return true;
                    }


                    var valid = FluroValidate.validate(value, fieldDefinition);

                    if (!valid) {
                        ////console.log('Check validation', fieldDefinition.title, value)
                    }
                    return valid;
                }
            }

            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////


            if (fieldDefinition.directive == 'embedded') {
                newField.type = 'embedded';

                //Check if its an array or an object
                if (fieldDefinition.maximum == 1 && fieldDefinition.minimum == 1) {
                    templateOptions.baseDefaultValue = {
                        data: {}
                    };
                } else {

                    var askCount = 0;

                    if (fieldDefinition.askCount) {
                        askCount = fieldDefinition.askCount;
                    }

                    ////console.log('ASK COUNT PLEASE', askCount);

                    //////////////////////////////////////

                    if (fieldDefinition.minimum && askCount < fieldDefinition.minimum) {
                        askCount = fieldDefinition.minimum;
                    }

                    if (fieldDefinition.maximum && askCount > fieldDefinition.maximum) {
                        askCount = fieldDefinition.maximum;
                    }

                    //////////////////////////////////////

                    var initialArray = [];

                    //Fill with the asking amount of objects
                    if (askCount) {
                        _.times(askCount, function() {
                            initialArray.push({});
                        });
                    }

                    ////console.log('initial array', initialArray);
                    //Now set the default value
                    templateOptions.baseDefaultValue = initialArray;
                }

                //////////////////////////////////////////

                //Create the new data object to store the fields
                newField.data = {
                    fields: [],
                    dataFields: [],
                    replicatedFields: []
                }

                //////////////////////////////////////////

                //Link to the definition of this nested object
                var fieldContainer = newField.data.fields;
                var dataFieldContainer = newField.data.dataFields;


                //////////////////////////////////////////

                //Loop through each sub field inside a group
                if (fieldDefinition.fields && fieldDefinition.fields.length) {
                    _.each(fieldDefinition.fields, function(sub) {
                        addFieldDefinition(fieldContainer, sub);
                    });
                }

                //////////////////////////////////////////

                var promise = FluroContent.endpoint('defined/' + fieldDefinition.params.restrictType).get().$promise;

                promise.then(function(embeddedDefinition) {

                    //Now loop through and all all the embedded definition fields
                    if (embeddedDefinition && embeddedDefinition.fields && embeddedDefinition.fields.length) {
                        var childFields = embeddedDefinition.fields;

                        //Exclude all specified fields
                        if (fieldDefinition.params.excludeKeys && fieldDefinition.params.excludeKeys.length) {
                            childFields = _.reject(childFields, function(f) {
                                return _.includes(fieldDefinition.params.excludeKeys, f.key);
                            });
                        }


                        //console.log('EXCLUSIONS', fieldDefinition.params.excludeKeys, childFields);

                        //Loop through each sub field inside a group
                        _.each(childFields, function(sub) {
                            addFieldDefinition(dataFieldContainer, sub);
                        })
                    }
                });

                //////////////////////////////////////////

                //Keep track of the promise
                $scope.promises.push(promise);

                //////////////////////////////////////////

                // //Need to keep it dynamic so we know when its done
                // newField.expressionProperties = {
                //     'templateOptions.embedded': function() {
                //         return promise;
                //     }
                // }



            }

            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////

            if (fieldDefinition.type == 'group' && fieldDefinition.fields && fieldDefinition.fields.length || fieldDefinition.asObject) {


                var fieldContainer;

                if (fieldDefinition.asObject) {

                    /*
                    newField = {
                        type: 'nested',
                        className: fieldDefinition.className,
                        data: {
                            fields: []
                        }
                    }
                    */
                    newField.type = 'nested';

                    //Check if its an array or an object
                    if (fieldDefinition.key && fieldDefinition.maximum == 1 && fieldDefinition.minimum == 1) {
                        templateOptions.baseDefaultValue = {};
                    } else {

                        var askCount = 0;

                        if (fieldDefinition.askCount) {
                            askCount = fieldDefinition.askCount;
                        }

                        //////////////////////////////////////

                        if (fieldDefinition.minimum && askCount < fieldDefinition.minimum) {
                            askCount = fieldDefinition.minimum;
                        }

                        if (fieldDefinition.maximum && askCount > fieldDefinition.maximum) {
                            askCount = fieldDefinition.maximum;
                        }

                        //////////////////////////////////////

                        var initialArray = [];

                        //Fill with the asking amount of objects
                        if (askCount) {
                            _.times(askCount, function() {
                                initialArray.push({});
                            });
                        }

                        // //console.log('initial array', initialArray);
                        //Now set the default value
                        templateOptions.baseDefaultValue = initialArray;
                    }

                    newField.data = {
                        fields: [],
                        replicatedFields: [],
                    }

                    //Link to the definition of this nested object
                    fieldContainer = newField.data.fields;

                } else {
                    //Start again
                    newField = {
                        fieldGroup: [],
                        className: fieldDefinition.className,
                    }

                    //Link to the sub fields
                    fieldContainer = newField.fieldGroup;
                }

                //Loop through each sub field inside a group
                _.each(fieldDefinition.fields, function(sub) {
                    addFieldDefinition(fieldContainer, sub);
                });
            }

            /////////////////////////////

            //Check if there are any expressions added to this field


            if (fieldDefinition.expressions && _.keys(fieldDefinition.expressions).length) {

                //Include Expression Properties
                // if (!newField.expressionProperties) {
                //     newField.expressionProperties = {};
                // }

                //////////////////////////////////////////

                //Add the hide expression if added through another method
                if (fieldDefinition.hideExpression && fieldDefinition.hideExpression.length) {
                    fieldDefinition.expressions.hide = fieldDefinition.hideExpression;
                }

                //////////////////////////////////////////

                //Get all expressions and join them together so we just listen once
                var allExpressions = _.values(fieldDefinition.expressions).join('+');

                //////////////////////////////////////////

                //Now create a watcher
                newField.watcher = {
                    expression: function(field, scope) {
                        //Return the result
                        return $parse(allExpressions)(scope);
                    },
                    listener: function(field, newValue, oldValue, scope, stopWatching) {

                        //Parse the expression on the root scope vm
                        if (!scope.interaction) {
                            scope.interaction = $scope.vm.model;
                        }

                        //Loop through each expression that needs to be evaluated
                        _.each(fieldDefinition.expressions, function(expression, key) {

                            //Get the value
                            var retrievedValue = $parse(expression)(scope);

                            //Get the field key
                            var fieldKey = field.key;

                            ///////////////////////////////////////

                            switch (key) {
                                case 'defaultValue':
                                    if (!field.formControl || !field.formControl.$dirty) {
                                        return scope.model[fieldKey] = retrievedValue;
                                    }
                                    break;
                                case 'value':
                                    return scope.model[fieldKey] = retrievedValue;
                                    break;
                                case 'required':
                                    return field.templateOptions.required = retrievedValue;
                                    break;
                                case 'hide':
                                    return field.hide = retrievedValue;
                                    break;
                                    // case 'label':
                                    //     if(retrievedValue) {
                                    //         var string = String(retrievedValue);
                                    //         return field.templateOptions.label = String(retrievedValue);
                                    //     }
                                    //     break;
                            }

                        });

                    }



                    ///////////////////////////////////////
                }


                //Replace expression
                //var replaceExpression = expression.replace(new RegExp('model', 'g'), 'vm.model');



                /*
                    //Add the expression properties
                    newField.expressionProperties[key] = function($viewValue, $modelValue, scope) {


                        //Replace expression
                        var replaceExpression = expression.replace(new RegExp('model', 'g'), 'vm.model');

           


                       // var retrievedValue = $parse(replaceExpression)($scope);
                        var retrievedValue = _.get($scope, replaceExpression);

                         //console.log('Testing retrieved value from GET', retrievedValue, replaceExpression);

                        ////////////////////////////////////////

                        

                        return retrievedValue;
                    }
                    /**/
                //});
            }

            /////////////////////////////

            if (fieldDefinition.hideExpression) {
                newField.hideExpression = fieldDefinition.hideExpression;
            }

            /////////////////////////////

            if (!newField.fieldGroup) {
                //Create a copy of the default value
                newField.defaultValue = angular.copy(templateOptions.baseDefaultValue);
            }


            /////////////////////////////

            if (newField.type == 'pathlink') {
                return;
            }

            /////////////////////////////
            //Push our new field into the array
            array.push(newField);


        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        //Loop through each defined field and add it to our form
        _.each($scope.model.fields, function(fieldDefinition) {
            addFieldDefinition($scope.vm.modelFields, fieldDefinition);
        });

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        //Add the required contact details

        if (!$scope.model.paymentDetails) {
            $scope.model.paymentDetails = {};
        }

        var paymentSettings = $scope.model.paymentDetails;

        /////////////////////////////////////////////////////////////////

        //Credit Card Details
        if (paymentSettings.required || paymentSettings.allow) {

            //Setup the wrapper fields
            var paymentWrapperFields = [];
            var paymentCardFields = [];


            // //console.log('PAYMENT SETTINGS REQUIRED', paymentSettings.required)

            // paymentWrapperFields.push({
            //     template: '<h4><i class="fa fa-credit-card"></i> Payment details</h4>'
            // });


            // //console.log('BEFORE SCOPE', $scope);

            if (paymentSettings.required) {

                console.log('Payment is set to required');

                //Add the payment summary
                paymentWrapperFields.push({
                    templateUrl: 'fluro-interaction-form/payment/payment-summary.html',
                    controller: function($scope, $parse) {

                        //Add the payment details to the scope
                        $scope.paymentDetails = paymentSettings;


                        //Start with the required amount
                        var requiredAmount = paymentSettings.amount;

                        //Store the calculatedAmount on the scope
                        $formScope.vm.model.calculatedTotal  = requiredAmount;
                        $scope.calculatedTotal = requiredAmount;

                        /////////////////////////////////////////////////////

                        var watchString = '';

                        ////////////////////////////////////////
                        ////////////////////////////////////////

                        //Map each modifier to a property string and combine them all at once
                        var modelVariables = _.chain(paymentSettings.modifiers)
                            .map(function(paymentModifier) {
                                var string = '(' + paymentModifier.expression + ') + (' + paymentModifier.condition + ')';
                                return string;
                            })
                            .flatten()
                            .compact()
                            .uniq()
                            .value();


                        if (modelVariables.length) {
                            watchString = modelVariables.join(' + ');
                        }

                        ////////////////////////////////////////

                        if (watchString.length) {
                            if ($scope.debugMode) {
                                console.log('Watching changes', watchString);
                            }

                            $scope.$watch(watchString, calculateTotal);
                        } else {
                            console.log('No watch string provided')
                            //Store the calculatedAmount on the scope
                            $scope.calculatedTotal = requiredAmount;
                            $scope.modifications = [];
                        }

                        /////////////////////////////////////////////////////

                        function calculateTotal() {

                            console.log('calculate');

                            if ($scope.debugMode) {
                                console.log('Recalculate total');
                            }

                            //Store the calculatedAmount on the scope
                            $scope.calculatedTotal = requiredAmount;

                            $scope.modifications = [];


                            if (!paymentSettings.modifiers || !paymentSettings.modifiers.length) {

                                if ($scope.debugMode) {
                                    console.log('No payment modifiers set');
                                }

                                return;
                            }

                            //Loop through each modifier
                            _.each(paymentSettings.modifiers, function(modifier) {

                                var parsedValue = $parse(modifier.expression)($scope);
                                parsedValue = Number(parsedValue);

                                if (isNaN(parsedValue)) {

                                    if ($scope.debugMode) {
                                        console.log('Payment modifier error', modifier.title, parsedValue);
                                    }
                                    //throw Error('Invalid or non-numeric pricing modifier ' + modifier.title);
                                    return;
                                }

                                /////////////////////////////////////////

                                var parsedCondition = true;

                                if (modifier.condition && String(modifier.condition).length) {
                                    parsedCondition = $parse(modifier.condition)($scope);
                                }

                                //If the condition returns false then just stop here and go to the next modifier
                                if (!parsedCondition) {
                                    if ($scope.debugMode) {
                                        console.log('inactive', modifier.title, modifier, $scope);
                                    }
                                    return
                                }

                                /////////////////////////////////////////

                                var operator = '';
                                var operatingValue = '$' + parseFloat(parsedValue / 100).toFixed(2);

                                switch (modifier.operation) {
                                    case 'add':
                                        operator = '+';
                                        $scope.calculatedTotal = $scope.calculatedTotal + parsedValue;
                                        break;
                                    case 'subtract':
                                        operator = '-';
                                        $scope.calculatedTotal = $scope.calculatedTotal - parsedValue;
                                        break;
                                    case 'divide':
                                        operator = '÷';
                                        operatingValue = parsedValue;
                                        $scope.calculatedTotal = $scope.calculatedTotal / parsedValue;
                                        break;
                                    case 'multiply':
                                        operator = '×';
                                        operatingValue = parsedValue;
                                        $scope.calculatedTotal = $scope.calculatedTotal * parsedValue;
                                        break;
                                    case 'set':
                                        $scope.calculatedTotal = parsedValue;
                                        break;
                                }

                                //Let the front end know that this modification was made
                                $scope.modifications.push({
                                    title: modifier.title,
                                    total: $scope.calculatedTotal,
                                    description: operator + ' ' + operatingValue,
                                    operation: modifier.operation,
                                });
                            })


                            //If the modifiers change the price below 0 then change the total back to 0
                            if (!$scope.calculatedTotal || isNaN($scope.calculatedTotal) || $scope.calculatedTotal < 0) {
                                $scope.calculatedTotal = 0;
                            }

                            //Add the calculated total to the rootscope

                            $timeout(function() {
                                $formScope.vm.model.calculatedTotal = $scope.calculatedTotal;
                            })
                            
                            // //console.log('CALCULATED TOTAL', $scope.calculatedTotal);

                            //Check if we should be hiding this because of payment modifiers
                            // vm.calculatedTotal = $scope.calculatedTotal;

                        }

                        /**/
                    },
                });
            } else {

                var amountDescription = 'Please enter an amount (' + String(paymentSettings.currency).toUpperCase() + ')';


                //Limits of amount
                var minimum = paymentSettings.minAmount;
                var maximum = paymentSettings.maxAmount;
                var defaultAmount = paymentSettings.amount;

                ///////////////////////////////////////////

                var paymentErrorMessage = 'Invalid amount';

                ///////////////////////////////////////////

                if (minimum) {
                    minimum = (parseInt(minimum) / 100);
                    paymentErrorMessage = 'Amount must be a number at least ' + $filter('currency')(minimum, '$');

                    amountDescription += 'Enter at least ' + $filter('currency')(minimum, '$') + ' ' + String(paymentSettings.currency).toUpperCase();
                }

                if (maximum) {
                    maximum = (parseInt(maximum) / 100);
                    paymentErrorMessage = 'Amount must be a number less than ' + $filter('currency')(maximum, '$');

                    amountDescription += 'Enter up to ' + $filter('currency')(maximum, '$') + ' ' + String(paymentSettings.currency).toUpperCase();;
                }


                if (minimum && maximum) {
                    amountDescription = 'Enter a numeric amount between ' + $filter('currency')(minimum) + ' and  ' + $filter('currency')(maximum) + ' ' + String(paymentSettings.currency).toUpperCase();;
                    paymentErrorMessage = 'Amount must be a number between ' + $filter('currency')(minimum) + ' and ' + $filter('currency')(maximum);
                }

                ///////////////////////////////////////////

                //Add the option for putting in a custom amount of money
                var fieldConfig = {
                    key: '_paymentAmount',
                    type: 'currency',
                    //defaultValue: 'Cade Embery',
                    templateOptions: {
                        type: 'text',
                        label: 'Amount',
                        description: amountDescription,
                        placeholder: '0.00',
                        required: true,
                        errorMessage: paymentErrorMessage,
                        min: minimum,
                        max: maximum,
                        onBlur: 'to.focused=false',
                        onFocus: 'to.focused=true',
                    },
                    data: {
                        customMaxLength: 8,
                        minimumAmount: minimum,
                        maximumAmount: maximum,
                    },
                };

                if (minimum) {
                    fieldConfig.defaultValue = minimum;
                }

                paymentWrapperFields.push({
                    'template': '<hr/><h3>Payment Details</h3>'
                });
                paymentWrapperFields.push(fieldConfig);
            }

            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////

            //Setup debug card details
            var defaultCardName;
            var defaultCardNumber;
            var defaultCardExpMonth;
            var defaultCardExpYear;
            var defaultCardCVN;

            //If testing mode
            if ($scope.debugMode) {
                defaultCardName = 'John Citizen';
                defaultCardNumber = '4242424242424242';
                defaultCardExpMonth = '05';
                defaultCardExpYear = '2020';
                defaultCardCVN = '123';
            }

            //////////////////////////////////////////////////////////

            paymentCardFields.push({
                key: '_paymentCardName',
                type: 'input',
                defaultValue: defaultCardName,
                templateOptions: {
                    type: 'text',
                    label: 'Card Name',
                    placeholder: 'Card Name',
                    required: paymentSettings.required,
                    onBlur: 'to.focused=false',
                    onFocus: 'to.focused=true',
                },
            });

            /////////////////////////////////////////

            paymentCardFields.push({
                key: '_paymentCardNumber',
                type: 'input',
                defaultValue: defaultCardNumber,
                templateOptions: {
                    type: 'text',
                    label: 'Card Number',
                    placeholder: 'Card Number',
                    required: paymentSettings.required,
                    onBlur: 'to.focused=false',
                    onFocus: 'to.focused=true',
                },
                validators: {
                    validInput: function($viewValue, $modelValue, scope) {

                        /////////////////////////////////////////////
                        var luhnChk = function(a) {
                            return function(c) {

                                if (!c) {
                                    return false;
                                }
                                for (var l = c.length, b = 1, s = 0, v; l;) v = parseInt(c.charAt(--l), 10), s += (b ^= 1) ? a[v] : v;
                                return s && 0 === s % 10
                            }
                        }([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]);

                        /////////////////////////////////////////////

                        var value = $modelValue || $viewValue;
                        var valid = luhnChk(value);
                        return valid;
                    }
                },
            });

            paymentCardFields.push({
                className: 'row clearfix',
                fieldGroup: [{
                    key: '_paymentCardExpMonth',
                    className: "col-xs-6 col-sm-5",
                    type: 'input',
                    defaultValue: defaultCardExpMonth,
                    templateOptions: {
                        type: 'text',
                        label: 'Expiry Month',
                        placeholder: 'MM',
                        required: paymentSettings.required,
                        onBlur: 'to.focused=false',
                        onFocus: 'to.focused=true',
                    }
                }, {
                    key: '_paymentCardExpYear',
                    className: "col-xs-6 col-sm-5",
                    type: 'input',
                    defaultValue: defaultCardExpYear,
                    templateOptions: {
                        type: 'text',
                        label: 'Expiry Year',
                        placeholder: 'YYYY',
                        required: paymentSettings.required,
                        onBlur: 'to.focused=false',
                        onFocus: 'to.focused=true',
                    }
                }, {
                    key: '_paymentCardCVN',
                    className: "col-xs-4 col-sm-2",
                    type: 'input',
                    defaultValue: defaultCardCVN,
                    templateOptions: {
                        type: 'text',
                        label: 'CVN',
                        placeholder: 'CVN',
                        required: paymentSettings.required,
                        onBlur: 'to.focused=false',
                        onFocus: 'to.focused=true',
                    }
                }]
            });

            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////

            //Create the credit card field group
            var cardDetailsField = {
                className: "payment-details",
                fieldGroup: paymentCardFields,
                hideExpression: function($viewValue, $modelValue, scope) {

                    //If the calculated total is exactly 0
                    if($formScope.vm.model.calculatedTotal === 0) {
                        return true;
                    }
                }
            }

            //////////////////////////////////////////////////////////

            if (paymentSettings.allowAlternativePayments && paymentSettings.paymentMethods && paymentSettings.paymentMethods.length) {

                //Create a method selection widget
                var methodSelection = {
                    className: "payment-method-select",
                    //defaultValue:{},
                    //key:'methods',
                    // fieldGroup:cardDetailsField,
                    data: {
                        fields: [cardDetailsField],
                        settings: paymentSettings,
                    },
                    controller: function($scope) {

                        //Payment Settings on scope
                        $scope.settings = paymentSettings;

                        //Options
                        $scope.methodOptions = _.map(paymentSettings.paymentMethods, function(method) {
                            return method;
                        });

                        //Add card at the start
                        $scope.methodOptions.unshift({
                            title: 'Pay with Card',
                            key: 'card',
                        });

                        ////////////////////////////////////////

                        if (!$scope.model._paymentMethod) {
                            $scope.model._paymentMethod = 'card';
                        }

                        //Select the first method by default
                        $scope.selected = {
                            method: $scope.methodOptions[0]
                        };

                        $scope.selectMethod = function(method) {
                            $scope.settings.showOptions = false;
                            $scope.selected.method = method;
                            $scope.model._paymentMethod = method.key;
                        }
                    },
                    templateUrl: 'fluro-interaction-form/payment/payment-method.html',
                    hideExpression: function($viewValue, $modelValue, scope) {

                        //If the calculated total is exactly 0
                        if($formScope.vm.model.calculatedTotal === 0) {
                            return true;
                        }
                    }
                };

                paymentWrapperFields.push(methodSelection);

            } else {
                //Push the card details
                paymentWrapperFields.push(cardDetailsField);
            }

            //////////////////////////////////////////////////////////

            // $scope.vm.modelFields = $scope.vm.modelFields.concat(paymentWrapperFields);

            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////

            $scope.vm.modelFields.push({
                fieldGroup: paymentWrapperFields,

            });
        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        //Wait for all async promises to resolve

        if (!$scope.promises.length) {
            $scope.promisesResolved = true;
        } else {
            $scope.promisesResolved = false;

            $q.all($scope.promises).then(function() {
                $scope.promisesResolved = true;

                //updateErrorList();
                //Update the error list
                // $scope.errorList = getAllErrorFields($scope.vm.modelFields);
                // //console.log('All promises resolved', $scope.errorList);

                // _.each($scope.errorList, function(field) {
                //     //console.log('FIELD', field.templateOptions.label, field.formControl)
                // })

            });
        }
    });




    /////////////////////////////////////////////////////////////////

    function getAllErrorFields(array) {
        return _.chain(array).map(function(field) {
                if (field.fieldGroup && field.fieldGroup.length) {

                    return getAllErrorFields(field.fieldGroup);

                } else if (field.data && ((field.data.fields && field.data.fields.length) || (field.data.dataFields && field.data.dataFields) || (field.data.replicatedFields && field.data.replicatedFields))) {
                    var combined = [];
                    combined = combined.concat(field.data.fields, field.data.dataFields, field.data.replicatedFields);
                    combined = _.compact(combined);
                    return getAllErrorFields(combined);
                } else {
                    return field;
                }
            })
            .flatten()
            .value();
    }

    /////////////////////////////////////////////////////////////////

    $scope.$watch('vm.modelFields', function(fields) {
        ////console.log('Interaction Fields changed')
        $scope.errorList = getAllErrorFields(fields);

        ////console.log('Error List', $scope.errorList);
    }, true)


    /////////////////////////////////////////////////////////////////


    function submitInteraction() {

        // //console.log('Submitting interaction')

        //Sending
        $scope.vm.state = 'sending';

        var interactionKey = $scope.model.definitionName;
        var interactionDetails = angular.copy($scope.vm.model);

        /////////////////////////////////////////////////////////

        //Asking for Payment
        var requiresPayment;
        var allowsPayment;

        /////////////////////////////////////////////////////////


        var paymentConfiguration = $scope.model.paymentDetails;


        //Check if we have supplied payment details
        if (paymentConfiguration) {
            requiresPayment = paymentConfiguration.required;
            allowsPayment = paymentConfiguration.allow;
        }

         // //console.log('PAYMENT CONFIG', paymentConfiguration)
         // //console.log('PAYMENT ALLOWED REQUIRED', requiresPayment, allowsPayment)

        /////////////////////////////////////////////////////////

        //Check if we need a payment
        if (requiresPayment || allowsPayment) {

            

            ////////////////////////////////////

            var paymentDetails = {};

            ////////////////////////////////////

            //Check if we can use alternative payment methods
            if (paymentConfiguration.allowAlternativePayments && paymentConfiguration.paymentMethods) {

                var selectedMethod = interactionDetails._paymentMethod;
                //If the user chose an alternative payment
                if (selectedMethod && selectedMethod != 'card') {

                    //Mark which method we are using as an alternative method
                    paymentDetails.method = selectedMethod;

                    //Skip straight through to process the request
                    return processRequest();
                }
            }

            ////////////////////////////////////

            //Only stop here if we REQUIRE payment
            if(requiresPayment) {

                //console.log('TESTING REQUIRES PAYMENT', $formScope);
                //If payment modifiers have removed the need for charging a payment
                if (!$formScope.vm.model.calculatedTotal) {
                    //console.log('No payment required', allowsPayment, requiresPayment);
                    return processRequest();
                }
            }

            ////////////////////////////////////

            //Get the payment integration 
            var paymentIntegration = $scope.integration;

            if (!paymentIntegration || !paymentIntegration.publicDetails) {

                if (paymentConfiguration.required) {
                    //console.log('No payment integration was supplied for this interaction but payments are required');
                } else {
                    //console.log('No payment integration was supplied for this interaction but payments are set to be allowed');
                }

                alert('This form has not been configured properly. Please notify the administrator of this website immediately.')
                $scope.vm.state = 'ready';
                return;
            }

            /////////////////////////////////////////////////////////

            //var paymentDetails = {};

            //Ensure we tell the server which integration to use to process payment
            paymentDetails.integration = paymentIntegration._id;

            //Now get the required details for making the transaction
            switch (paymentIntegration.module) {
                case 'eway':

                    if (!window.eCrypt) {
                        //console.log('ERROR: Eway is selected for payment but the eCrypt script has not been included in this application visit https://eway.io/api-v3/#encrypt-function for more information');
                        return $scope.vm.state = 'ready';
                    }

                    //Get encrypted token from eWay
                    //var liveUrl = 'https://api.ewaypayments.com/DirectPayment.json';
                    //var sandboxUrl = 'https://api.sandbox.ewaypayments.com/DirectPayment.json';

                    /////////////////////////////////////////////

                    //Get the Public Encryption Key
                    var key = paymentIntegration.publicDetails.publicKey;

                    /////////////////////////////////////////////

                    //Get the card details from our form
                    var cardDetails = {};
                    cardDetails.name = interactionDetails._paymentCardName;
                    cardDetails.number = eCrypt.encryptValue(interactionDetails._paymentCardNumber, key);
                    cardDetails.cvc = eCrypt.encryptValue(interactionDetails._paymentCardCVN, key);

                    var expiryMonth = String(interactionDetails._paymentCardExpMonth);
                    var expiryYear = String(interactionDetails._paymentCardExpYear);

                    if (expiryMonth.length < 1) {
                        expiryMonth = '0' + expiryMonth;
                    }
                    cardDetails.exp_month = expiryMonth;
                    cardDetails.exp_year = expiryYear.slice(-2);

                    //Send encrypted details to the server
                    paymentDetails.details = cardDetails;

                    //Process the request
                    return processRequest();

                    break;
                case 'stripe':

                    if (!window.Stripe) {
                        //console.log('ERROR: Stripe is selected for payment but the Stripe API has not been included in this application');
                        return $scope.vm.state = 'ready';
                    }
                    //Get encrypted token from Stripe
                    var liveKey = paymentIntegration.publicDetails.livePublicKey;
                    var sandboxKey = paymentIntegration.publicDetails.testPublicKey;

                    var key = liveKey;

                    /////////////////////////////////////////////

                    if (paymentIntegration.publicDetails.sandbox) {
                        key = sandboxKey;
                    }

                    /////////////////////////////////////////////

                    //Set the stripe key
                    Stripe.setPublishableKey(key);

                    /////////////////////////////////////////////

                    //Get the card details from our form
                    var cardDetails = {};
                    cardDetails.name = interactionDetails._paymentCardName;
                    cardDetails.number = interactionDetails._paymentCardNumber;
                    cardDetails.cvc = interactionDetails._paymentCardCVN;
                    cardDetails.exp_month = interactionDetails._paymentCardExpMonth;
                    cardDetails.exp_year = interactionDetails._paymentCardExpYear;

                    /////////////////////////////////////////////

                    Stripe.card.createToken(cardDetails, function(status, response) {
                        if (response.error) {
                            //Error creating token
                            // Notifications.error(response.error);
                            //console.log('Stripe token error', response);
                            $scope.processErrorMessages = [response.error.message];
                            $scope.vm.state = 'error';


                        } else {
                            //Include the payment details
                            paymentDetails.details = response;
                            return processRequest();
                        }
                    });
                    break;
            }
        } else {
            return processRequest();
        }


        ///////////////////////////////////////////////////////////////////////

        function processRequest() {

            /////////////////////////////////////////////////////////

            //Delete payment details (we don't send these to fluro)
            delete interactionDetails._paymentCardCVN;
            delete interactionDetails._paymentCardExpMonth;
            delete interactionDetails._paymentCardExpYear;
            delete interactionDetails._paymentCardName;
            delete interactionDetails._paymentCardNumber;

            /////////////////////////////////////////////////////////

            //Log the request
            ////console.log('Process request', interactionKey, interactionDetails, paymentDetails);

            /////////////////////////////////////////////////////////

            //Allow user specified payment
            if (interactionDetails._paymentAmount) {
                paymentDetails.amount = (parseFloat(interactionDetails._paymentAmount) * 100);
            }

            /////////////////////////////////////////////////////////

            //Attempt to send information to interact endpoint
            var request = FluroInteraction.interact($scope.model.title, interactionKey, interactionDetails, paymentDetails, $scope.linkedEvent);


            //////////////////////////////////

            //When the promise results fire the callbacks
            request.then(submissionSuccess, submissionFail)

            //////////////////////////////////
            //////////////////////////////////
            //////////////////////////////////
            //////////////////////////////////

            function submissionSuccess(res) {
                /**
                //TESTING
                $scope.vm.state = 'ready';
                return //console.log('RES TEST', res);
                /**/

                //Reset
                if ($scope.vm.defaultModel) {
                    $scope.vm.model = angular.copy($scope.vm.defaultModel);
                } else {
                    $scope.vm.model = {};
                }


                $scope.vm.modelForm.$setPristine();
                $scope.vm.options.resetModel();

                //Reset the form scope
                $formScope = $scope;

                // $scope.vm.model = {}
                // $scope.vm.modelForm.$setPristine();
                // $scope.vm.options.resetModel();

                //Response from server incase we want to use it on the thank you page
                $scope.response = res;

                //Change state
                $scope.vm.state = 'complete';
            }

            //////////////////////////////////
            //////////////////////////////////
            //////////////////////////////////
            //////////////////////////////////
            //////////////////////////////////


            function submissionFail(res) {


                //console.log('Interaction Failed', res);
                // Notifications.error(res.data);

                $scope.vm.state = 'error';

                if (!res.data) {
                    return $scope.processErrorMessages = ['Error: ' + res];
                }

                if (res.data.error) {
                    if (res.data.error.message) {
                        return $scope.processErrorMessages = [res.error.message];
                    } else {
                        return $scope.processErrorMessages = [res.error];
                    }
                }

                if (res.data.errors) {
                    return $scope.processErrorMessages = _.map(res.data.errors, function(error) {
                        return error.message;
                    });
                }

                if (_.isArray(res.data)) {
                    return $scope.processErrorMessages = res.data;
                } else {
                    $scope.processErrorMessages = [res.data];
                }



                //$scope.vm.state = 'ready';
            }


        }
    }

});
////////////////////////////////////////////////////////////////////////

app.directive('postForm', function($compile) {
    return {
        restrict: 'E',
        //replace: true,
        scope: {
            model: '=ngModel',
            host: '=hostId',
            reply: '=?reply',
            thread: '=?thread',
            userStore: '=?user',
            vm: '=?config',
            debugMode: '=?debugMode',
            callback:'=?callback',
        },
        transclude: true,
        controller: 'PostFormController',
        templateUrl: 'fluro-interaction-form/fluro-web-form.html',
        link: function($scope, $element, $attrs, $ctrl, $transclude) {
            $transclude($scope, function(clone, $scope) {
                $scope.transcludedContent = clone;
            });
        },
    };
});


app.directive('recaptchaRender', function($window) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs, $ctrl) {

            //Check if we need to use recaptcha
            if ($scope.model.data && $scope.model.data.recaptcha) {

                //Recaptcha
                var element = $element[0];

                ////////////////////////////////////////////////

                var cancelWatch;

                //If recaptcha hasn't loaded yet wait for it to load
                if (window.grecaptcha) {
                    activateRecaptcha(window.grecaptcha)
                } else {

                    //Listen for when recaptcha exists
                    cancelWatch = $scope.$watch(function() {
                        return window.grecaptcha;
                    }, activateRecaptcha);
                }

                ////////////////////////////////////////////////

                function activateRecaptcha(recaptcha) {

                    console.log('Activate recaptcha!!');
                    if (cancelWatch) {
                        cancelWatch();
                    }

                    if (recaptcha) {
                        $scope.vm.recaptchaID = recaptcha.render(element, {
                            sitekey: '6LelOyUTAAAAADSACojokFPhb9AIzvrbGXyd-33z'
                        });
                    }
                }
            }

            ////////////////////////////////////////////////

        },
    };
});

app.controller('PostFormController', function($scope, $rootScope, $q, $http, Fluro, FluroAccess, $parse, $filter, formlyValidationMessages, FluroContent, FluroContentRetrieval, FluroValidate, FluroInteraction) {





    /////////////////////////////////////////////////////////////////

    if (!$scope.thread) {
        $scope.thread = [];
    }

    /////////////////////////////////////////////////////////////////

    if (!$scope.vm) {
        $scope.vm = {}
    }
    /////////////////////////////////////////////////////////////////
    //Attach unique ID of this forms scope
    // $scope.vm.formScopeID = $scope.$id;




    //Resolve promises by default
    $scope.promisesResolved = true;
    $scope.correctPermissions = true;

    /////////////////////////////////////////////////////////////////

    // The model object that we reference
    // on the  element in index.html
    if ($scope.vm.defaultModel) {
        $scope.vm.model = angular.copy($scope.vm.defaultModel);
    } else {
        $scope.vm.model = {};
    }

    /////////////////////////////////////////////////////////////////

    // An array of our form fields with configuration
    // and options set. We make reference to this in
    // the 'fields' attribute on the  element
    $scope.vm.modelFields = [];

    /////////////////////////////////////////////////////////////////

    //Keep track of the state of the form
    $scope.vm.state = 'ready';


    /////////////////////////////////////////////////////////////////

    //  $scope.$watch('vm.modelForm', function(form) {
    //     console.log('Form Validation', form);
    // }, true)

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    $scope.readyToSubmit = false;

    $scope.$watch('vm.modelForm.$invalid + vm.modelForm.$error', function() {


        // $scope.readyToSubmit = true;
        // return;

        //Interaction Form
        var interactionForm = $scope.vm.modelForm;

        if (!interactionForm) {
            // console.log('Invalid no form')
            return $scope.readyToSubmit = false;
        }

        if (interactionForm.$invalid) {
            // console.log('Invalid because its invalid', interactionForm);
            return $scope.readyToSubmit = false;
        }

        if (interactionForm.$error) {

            // console.log('Has an error', interactionForm.$error);

            if (interactionForm.$error.required && interactionForm.$error.required.length) {
                // console.log('required input not provided');
                return $scope.readyToSubmit = false;
            }

            if (interactionForm.$error.validInput && interactionForm.$error.validInput.length) {
                // console.log('valid input not provided');
                return $scope.readyToSubmit = false;
            }
        }

        // console.log('Form should be good to go')

        //It all worked so set to true
        $scope.readyToSubmit = true;

    }, true)

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    formlyValidationMessages.addStringMessage('required', 'This field is required');

    /*
    formlyValidationMessages.messages.required = function($viewValue, $modelValue, scope) {
        return scope.to.label + ' is required';
    }
    */

    formlyValidationMessages.messages.validInput = function($viewValue, $modelValue, scope) {
        return scope.to.label + ' is not a valid value';
    }

    formlyValidationMessages.messages.date = function($viewValue, $modelValue, scope) {
        return scope.to.label + ' is not a valid date';
    }

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    function resetCaptcha() {


        //Recaptcha ID
        var recaptchaID = $scope.vm.recaptchaID;

        console.log('Reset Captcha', recaptchaID);

        if (window.grecaptcha && recaptchaID) {
            window.grecaptcha.reset(recaptchaID);
        }
    }

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    $scope.reset = function() {

        //Reset
        if ($scope.vm.defaultModel) {
            $scope.vm.model = angular.copy($scope.vm.defaultModel);
        } else {
            $scope.vm.model = {};
        }
        $scope.vm.modelForm.$setPristine();
        $scope.vm.options.resetModel();

        //Reset the captcha
        resetCaptcha();

        //Clear the response from previous submission
        $scope.response = null;
        $scope.vm.state = 'ready';

        //Reset after state change
        console.log('Broadcast reset')
        $scope.$broadcast('form-reset');

    }

    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////

    //Function to run on permissions
    // function checkPermissions() {
    //     if ($rootScope.user) {
    //         //Check if we have the correct permissions
    //         var canCreate = FluroAccess.can('create', $scope.model.definitionName);
    //         var canSubmit = FluroAccess.can('submit', $scope.model.definitionName);

    //         //Allow if the user can create or submit
    //         $scope.correctPermissions = (canCreate | canSubmit);
    //     } else {
    //         //Just do this by default
    //         $scope.correctPermissions = true;
    //     }
    // }

    // /////////////////////////////////////////////////////////////////

    // //Watch if user login changes
    // $scope.$watch(function() {
    //     return $rootScope.user;
    // }, checkPermissions)

    /////////////////////////////////////////////////////////////////

    $scope.$watch('model', function(newData, oldData) {

        // console.log('Model changed');
        if (!$scope.model || $scope.model.parentType != 'post') {
            return; //$scope.model = {};
        }

        /////////////////////////////////////////////////////////////////

        //check if we have the correct permissions
        // checkPermissions();

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        // The model object that we reference
        // on the  element in index.html
        // $scope.vm.model = {};
        if ($scope.vm.defaultModel) {
            $scope.vm.model = angular.copy($scope.vm.defaultModel);
        } else {
            $scope.vm.model = {};
        }


        // An array of our form fields with configuration
        // and options set. We make reference to this in
        // the 'fields' attribute on the  element
        $scope.vm.modelFields = [];

        /////////////////////////////////////////////////////////////////

        //Keep track of the state of the form
        $scope.vm.state = 'ready';

        /////////////////////////////////////////////////////////////////

        //Add the submit function
        $scope.vm.onSubmit = submitPost;

        /////////////////////////////////////////////////////////////////

        //Keep track of any async promises we need to wait for
        $scope.promises = [];

        /////////////////////////////////////////////////////////////////

        //Submit is finished
        $scope.submitLabel = 'Submit';

        if ($scope.model && $scope.model.data && $scope.model.data.submitLabel && $scope.model.data.submitLabel.length) {
            $scope.submitLabel = $scope.model.data.submitLabel;
        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        //Add the required contact details
        var interactionFormSettings = $scope.model.data;

        if (!interactionFormSettings) {
            interactionFormSettings = {};
        }

        /////////////////////////////////////////////////////////////////
        /**/
        //Email Address
        // // if (interactionFormSettings.askEmail || interactionFormSettings.requireEmail) {
        // var newField = {
        //     key: 'body',
        //     type: 'textarea',
        //     templateOptions: {
        //         // type: 'email',
        //         label: 'Body',
        //         placeholder: 'Enter your comment here',
        //         required: true,
        //         // required: interactionFormSettings.requireEmail,
        //         onBlur: 'to.focused=false',
        //         onFocus: 'to.focused=true',
        //         rows: 4,
        //         cols: 15
        //     },
        // }

        //Push the body
        // $scope.vm.modelFields.push(newField);
        // }
        /**/

        /////////////////////////////////////////////////////////////////

        //Push the extra data object
        // var dataObject = {
        //     key: 'data',
        //     type:'nested',
        //     fieldGroup: [],
        //     // templateOptions:{
        //     //     baseDefaultValue:{}
        //     // }
        // }


        // $scope.vm.modelFields.push(dataObject);

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        function addFieldDefinition(array, fieldDefinition) {

            if (fieldDefinition.params && fieldDefinition.params.disableWebform) {
                //If we are hiding this field then just do nothing and return here
                return;
            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //Create a new field
            var newField = {};
            newField.key = fieldDefinition.key;

            /////////////////////////////

            //Add the class name if applicable
            if (fieldDefinition.className) {
                newField.className = fieldDefinition.className;
            }

            /////////////////////////////

            //Template Options
            var templateOptions = {};
            templateOptions.type = 'text';
            templateOptions.label = fieldDefinition.title;
            templateOptions.description = fieldDefinition.description;
            templateOptions.params = fieldDefinition.params;

            //Attach a custom error message
            if (fieldDefinition.errorMessage) {
                templateOptions.errorMessage = fieldDefinition.errorMessage;
            }

            //Include the definition itself
            templateOptions.definition = fieldDefinition;

            /////////////////////////////

            //Add a placeholder
            if (fieldDefinition.placeholder && fieldDefinition.placeholder.length) {
                templateOptions.placeholder = fieldDefinition.placeholder;
            } else if (fieldDefinition.description && fieldDefinition.description.length) {
                templateOptions.placeholder = fieldDefinition.description;
            } else {
                templateOptions.placeholder = fieldDefinition.title;
            }

            /////////////////////////////

            //Require if minimum is greater than 1 and not a field group
            templateOptions.required = (fieldDefinition.minimum > 0);

            /////////////////////////////

            templateOptions.onBlur = 'to.focused=false';
            templateOptions.onFocus = 'to.focused=true';

            /////////////////////////////

            //Directive or widget
            switch (fieldDefinition.directive) {
                case 'reference-select':
                case 'value-select':
                    //Detour here
                    newField.type = 'button-select';
                    break;
                case 'select':
                    newField.type = 'select';
                    break;
                case 'wysiwyg':
                    newField.type = 'textarea';
                    break;
                default:
                    newField.type = fieldDefinition.directive;
                    break;
            }


            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //Allowed Options

            switch (fieldDefinition.type) {

                case 'reference':
                    //If we have allowed references specified
                    if (fieldDefinition.allowedReferences && fieldDefinition.allowedReferences.length) {
                        templateOptions.options = _.map(fieldDefinition.allowedReferences, function(ref) {
                            return {
                                name: ref.title,
                                value: ref._id,
                            }
                        });
                    } else {
                        //We want to load all the options from the server
                        templateOptions.options = [];

                        if (fieldDefinition.sourceQuery) {

                            //We use the query to find all the references we can find
                            var queryId = fieldDefinition.sourceQuery;
                            if (queryId._id) {
                                queryId = queryId._id;
                            }

                            /////////////////////////

                            var options = {};

                            //If we need to template the query
                            if (fieldDefinition.queryTemplate) {
                                options.template = fieldDefinition.queryTemplate;
                                if (options.template._id) {
                                    options.template = options.template._id;
                                }
                            }

                            /////////////////////////

                            //Now retrieve the query
                            var promise = FluroContentRetrieval.getQuery(queryId, options);

                            //Now get the results from the query
                            promise.then(function(res) {
                                //console.log('Options', res);
                                templateOptions.options = _.map(res, function(ref) {
                                    return {
                                        name: ref.title,
                                        value: ref._id,
                                    }
                                })
                            });
                        } else {

                            if (fieldDefinition.directive != 'embedded') {
                                if (fieldDefinition.params.restrictType && fieldDefinition.params.restrictType.length) {
                                    //We want to load all the possible references we can select
                                    FluroContent.resource(fieldDefinition.params.restrictType).query().$promise.then(function(res) {
                                        templateOptions.options = _.map(res, function(ref) {
                                            return {
                                                name: ref.title,
                                                value: ref._id,
                                            }
                                        })
                                    });
                                }
                            }
                        }
                    }
                    break;
                default:
                    //Just list the options specified
                    if (fieldDefinition.options && fieldDefinition.options.length) {
                        templateOptions.options = fieldDefinition.options;
                    } else {
                        templateOptions.options = _.map(fieldDefinition.allowedValues, function(val) {
                            return {
                                name: val,
                                value: val
                            }
                        });
                    }
                    break;
            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //If there is custom attributes
            if(fieldDefinition.attributes && _.keys(fieldDefinition.attributes).length) {
                newField.ngModelAttrs = _.reduce(fieldDefinition.attributes, function(results, attr, key) {
                    var customKey = 'customAttr' + key;
                    results[customKey] = {
                        attribute:key
                    };

                    //Custom Key
                    templateOptions[customKey] = attr;

                    return results;
                }, {});
            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //What kind of data type, override for things like checkbox
            //if (fieldDefinition.type == 'boolean') {
            if (fieldDefinition.directive != 'custom') {
                switch (fieldDefinition.type) {
                    case 'boolean':
                        if (fieldDefinition.params && fieldDefinition.params.storeCopy) {
                            newField.type = 'terms';
                        } else {
                            newField.type = 'checkbox';
                        }

                        break;
                    case 'number':
                    case 'float':
                    case 'integer':
                    case 'decimal':
                        templateOptions.type = 'input';
                        // templateOptions.step = 'any';

                        if (!newField.ngModelAttrs) {
                            newField.ngModelAttrs = {};
                        }

                        /////////////////////////////////////////////

                        //Only do this if its an integer cos iOS SUCKS!
                        if (fieldDefinition.type == 'integer') {
                            // console.log('Is integer');

                            templateOptions.type = 'number';
                            templateOptions.baseDefaultValue = 0;
                            //Force numeric keyboard
                            newField.ngModelAttrs.customAttrpattern = {
                                attribute: 'pattern',
                            }

                            newField.ngModelAttrs.customAttrinputmode = {
                                attribute: 'inputmode',
                            }

                            //Force numeric keyboard
                            templateOptions.customAttrpattern = "[0-9]*";
                            templateOptions.customAttrinputmode = "numeric"


                            /////////////////////////////////////////////

                            // console.log('SET NUMERICINPUT')

                            if (fieldDefinition.params) {
                                if (parseInt(fieldDefinition.params.maxValue) !== 0) {
                                    templateOptions.max = fieldDefinition.params.maxValue;
                                }

                                if (parseInt(fieldDefinition.params.minValue) !== 0) {
                                    templateOptions.min = fieldDefinition.params.minValue;
                                } else {
                                    templateOptions.min = 0;
                                }
                            }

                        }
                        break;
                }

            }

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            //Default Options

            if (fieldDefinition.maximum == 1) {
                if (fieldDefinition.type == 'reference' && fieldDefinition.directive != 'embedded') {
                    if (fieldDefinition.defaultReferences && fieldDefinition.defaultReferences.length) {

                        if (fieldDefinition.directive == 'search-select') {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultReferences[0];
                        } else {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultReferences[0]._id;
                        }
                    }
                } else {
                    if (fieldDefinition.defaultValues && fieldDefinition.defaultValues.length) {

                        if (templateOptions.type == 'number') {
                            templateOptions.baseDefaultValue = Number(fieldDefinition.defaultValues[0]);
                        } else {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultValues[0];
                        }
                    }
                }
            } else {
                if (fieldDefinition.type == 'reference' && fieldDefinition.directive != 'embedded') {
                    if (fieldDefinition.defaultReferences && fieldDefinition.defaultReferences.length) {
                        if (fieldDefinition.directive == 'search-select') {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultReferences;
                        } else {
                            templateOptions.baseDefaultValue = _.map(fieldDefinition.defaultReferences, function(ref) {
                                return ref._id;
                            });
                        }
                    } else {
                        templateOptions.baseDefaultValue = [];
                    }
                } else {
                    if (fieldDefinition.defaultValues && fieldDefinition.defaultValues.length) {

                        if (templateOptions.type == 'number') {
                            templateOptions.baseDefaultValue = _.map(fieldDefinition.defaultValues, function(val) {
                                return Number(val);
                            });
                        } else {
                            templateOptions.baseDefaultValue = fieldDefinition.defaultValues;
                        }
                    }
                }
            }


            /////////////////////////////

            //Append the template options
            newField.templateOptions = templateOptions;

            /////////////////////////////
            /////////////////////////////
            /////////////////////////////

            newField.validators = {
                validInput: function($viewValue, $modelValue, scope) {
                    var value = $modelValue || $viewValue;

                    if (!value) {
                        return true;
                    }


                    var valid = FluroValidate.validate(value, fieldDefinition);

                    if (!valid) {
                        //console.log('Check validation', fieldDefinition.title, value)
                    }
                    return valid;
                }
            }

            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////


            if (fieldDefinition.directive == 'embedded') {
                newField.type = 'embedded';

                //Check if its an array or an object
                if (fieldDefinition.maximum == 1 && fieldDefinition.minimum == 1) {
                    templateOptions.baseDefaultValue = {
                        data: {}
                    };
                } else {

                    var askCount = 0;

                    if (fieldDefinition.askCount) {
                        askCount = fieldDefinition.askCount;
                    }

                    //console.log('ASK COUNT PLEASE', askCount);

                    //////////////////////////////////////

                    if (fieldDefinition.minimum && askCount < fieldDefinition.minimum) {
                        askCount = fieldDefinition.minimum;
                    }

                    if (fieldDefinition.maximum && askCount > fieldDefinition.maximum) {
                        askCount = fieldDefinition.maximum;
                    }

                    //////////////////////////////////////

                    var initialArray = [];

                    //Fill with the asking amount of objects
                    if (askCount) {
                        _.times(askCount, function() {
                            initialArray.push({});
                        });
                    }

                    //console.log('initial array', initialArray);
                    //Now set the default value
                    templateOptions.baseDefaultValue = initialArray;
                }

                //////////////////////////////////////////

                //Create the new data object to store the fields
                newField.data = {
                    fields: [],
                    dataFields: [],
                    replicatedFields: []
                }

                //////////////////////////////////////////

                //Link to the definition of this nested object
                var fieldContainer = newField.data.fields;
                var dataFieldContainer = newField.data.dataFields;


                //////////////////////////////////////////

                //Loop through each sub field inside a group
                if (fieldDefinition.fields && fieldDefinition.fields.length) {
                    _.each(fieldDefinition.fields, function(sub) {
                        addFieldDefinition(fieldContainer, sub);
                    });
                }

                //////////////////////////////////////////

                var promise = FluroContent.endpoint('defined/' + fieldDefinition.params.restrictType).get().$promise;


                promise.then(function(embeddedDefinition) {

                    //Now loop through and all all the embedded definition fields
                    if (embeddedDefinition && embeddedDefinition.fields && embeddedDefinition.fields.length) {
                        var childFields = embeddedDefinition.fields;

                        //Exclude all specified fields
                        if (fieldDefinition.params.excludeKeys && fieldDefinition.params.excludeKeys.length) {
                            childFields = _.reject(childFields, function(f) {
                                return _.includes(fieldDefinition.params.excludeKeys, f.key);
                            });
                        }

                        // console.log('EXCLUSIONS', fieldDefinition.params.excludeKeys, childFields);
                        //Loop through each sub field inside a group
                        _.each(childFields, function(sub) {
                            addFieldDefinition(dataFieldContainer, sub);
                        })
                    }
                });

                //////////////////////////////////////////

                //Keep track of the promise
                $scope.promises.push(promise);

                //////////////////////////////////////////

                // //Need to keep it dynamic so we know when its done
                // newField.expressionProperties = {
                //     'templateOptions.embedded': function() {
                //         return promise;
                //     }
                // }
            }

            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////

            if (fieldDefinition.type == 'group' && fieldDefinition.fields && fieldDefinition.fields.length || fieldDefinition.asObject) {
                var fieldContainer;

                if (fieldDefinition.asObject) {

                    /*
                    newField = {
                        type: 'nested',
                        className: fieldDefinition.className,
                        data: {
                            fields: []
                        }
                    }
                    */
                    newField.type = 'nested';

                    //Check if its an array or an object
                    if (fieldDefinition.key && fieldDefinition.maximum == 1 && fieldDefinition.minimum == 1) {
                        templateOptions.baseDefaultValue = {};
                    } else {

                        var askCount = 0;

                        if (fieldDefinition.askCount) {
                            askCount = fieldDefinition.askCount;
                        }

                        //////////////////////////////////////

                        if (fieldDefinition.minimum && askCount < fieldDefinition.minimum) {
                            askCount = fieldDefinition.minimum;
                        }

                        if (fieldDefinition.maximum && askCount > fieldDefinition.maximum) {
                            askCount = fieldDefinition.maximum;
                        }

                        //////////////////////////////////////

                        var initialArray = [];

                        //Fill with the asking amount of objects
                        if (askCount) {
                            _.times(askCount, function() {
                                initialArray.push({});
                            });
                        }

                        // console.log('initial array', initialArray);
                        //Now set the default value
                        templateOptions.baseDefaultValue = initialArray;
                    }

                    newField.data = {
                        fields: [],
                        replicatedFields: [],
                    }

                    //Link to the definition of this nested object
                    fieldContainer = newField.data.fields;

                } else {
                    //Start again
                    newField = {
                        fieldGroup: [],
                        className: fieldDefinition.className,
                    }

                    //Link to the sub fields
                    fieldContainer = newField.fieldGroup;
                }

                //Loop through each sub field inside a group
                _.each(fieldDefinition.fields, function(sub) {
                    addFieldDefinition(fieldContainer, sub);
                });
            }

            /////////////////////////////

            //Check if there are any expressions added to this field


            if (fieldDefinition.expressions && _.keys(fieldDefinition.expressions).length) {

                //Include Expression Properties
                // if (!newField.expressionProperties) {
                //     newField.expressionProperties = {};
                // }

                //////////////////////////////////////////

                //Add the hide expression if added through another method
                if (fieldDefinition.hideExpression && fieldDefinition.hideExpression.length) {
                    fieldDefinition.expressions.hide = fieldDefinition.hideExpression;
                }

                //////////////////////////////////////////

                //Get all expressions and join them together so we just listen once
                var allExpressions = _.values(fieldDefinition.expressions).join('+');

                //////////////////////////////////////////

                //Now create a watcher
                newField.watcher = {
                    expression: function(field, scope) {
                        //Return the result
                        return $parse(allExpressions)(scope);
                    },
                    listener: function(field, newValue, oldValue, scope, stopWatching) {

                        //Parse the expression on the root scope vm
                        if (!scope.interaction) {
                            scope.interaction = $scope.vm.model;
                        }

                        //Loop through each expression that needs to be evaluated
                        _.each(fieldDefinition.expressions, function(expression, key) {

                            //Get the value
                            var retrievedValue = $parse(expression)(scope);

                            //Get the field key
                            var fieldKey = field.key;

                            ///////////////////////////////////////

                            switch (key) {
                                case 'defaultValue':
                                    if (!field.formControl || !field.formControl.$dirty) {
                                        return scope.model[fieldKey] = retrievedValue;
                                    }
                                    break;
                                case 'value':
                                    return scope.model[fieldKey] = retrievedValue;
                                    break;
                                case 'required':
                                    return field.templateOptions.required = retrievedValue;
                                    break;
                                case 'hide':
                                    return field.hide = retrievedValue;
                                    break;
                                    // case 'label':
                                    //     if(retrievedValue) {
                                    //         var string = String(retrievedValue);
                                    //         return field.templateOptions.label = String(retrievedValue);
                                    //     }
                                    //     break;
                            }

                        });

                    }



                    ///////////////////////////////////////
                }


                //Replace expression
                //var replaceExpression = expression.replace(new RegExp('model', 'g'), 'vm.model');



                /*
                    //Add the expression properties
                    newField.expressionProperties[key] = function($viewValue, $modelValue, scope) {


                        //Replace expression
                        var replaceExpression = expression.replace(new RegExp('model', 'g'), 'vm.model');

           


                       // var retrievedValue = $parse(replaceExpression)($scope);
                        var retrievedValue = _.get($scope, replaceExpression);

                         console.log('Testing retrieved value from GET', retrievedValue, replaceExpression);

                        ////////////////////////////////////////

                        

                        return retrievedValue;
                    }
                    /**/
                //});
            }

            /////////////////////////////

            if (fieldDefinition.hideExpression) {
                newField.hideExpression = fieldDefinition.hideExpression;
            }

            /////////////////////////////

            if (!newField.fieldGroup) {
                //Create a copy of the default value
                newField.defaultValue = angular.copy(templateOptions.baseDefaultValue);
            }


            /////////////////////////////

            if (newField.type == 'pathlink') {
                return;
            }

            /////////////////////////////
            //Push our new field into the array
            array.push(newField);


        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////

        //Loop through each defined field and add it to our form
        _.each($scope.model.fields, function(fieldDefinition) {
            addFieldDefinition($scope.vm.modelFields, fieldDefinition);
        });
    });

    /////////////////////////////////////////////////////////////////

    function getAllErrorFields(array) {
        return _.chain(array).map(function(field) {
                if (field.fieldGroup && field.fieldGroup.length) {

                    return getAllErrorFields(field.fieldGroup);

                } else if (field.data && ((field.data.fields && field.data.fields.length) || (field.data.dataFields && field.data.dataFields) || (field.data.replicatedFields && field.data.replicatedFields))) {
                    var combined = [];
                    combined = combined.concat(field.data.fields, field.data.dataFields, field.data.replicatedFields);
                    combined = _.compact(combined);
                    return getAllErrorFields(combined);
                } else {
                    return field;
                }
            })
            .flatten()
            .value();
    }

    /////////////////////////////////////////////////////////////////

    $scope.$watch('vm.modelFields', function(fields) {
        //console.log('Interaction Fields changed')
        $scope.errorList = getAllErrorFields(fields);

        //console.log('Error List', $scope.errorList);
    }, true)



    /////////////////////////////////////////////////////////////////

    //Submit the
    function submitPost() {

        //Sending
        $scope.vm.state = 'sending';

        var submissionKey = $scope.model.definitionName;
        var submissionModel = {
            data: angular.copy($scope.vm.model)
        }

        /////////////////////////////////////////////////////////

        var hostID = $scope.host;

        /////////////////////////////////////////////////////////

        //If its a reply then mark it as such
        if ($scope.reply) {
            submissionModel.reply = $scope.reply;
        }

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        //If we have a recaptcha id present then use it
        if (typeof $scope.vm.recaptchaID !== 'undefined') {
            var response = window.grecaptcha.getResponse($scope.vm.recaptchaID);
            submissionModel['g-recaptcha-response'] = response;
        }

        /////////////////////////////////////////////////////////


        var request;

        //If a user store has been provided
        if ($scope.userStore) {

            //Get the required config
            $scope.userStore.config().then(function(config) {


                var postURL = Fluro.apiURL + '/post/' + hostID + '/' + submissionKey;

                //Make the request using the user stores configuration
                request = $http.post(postURL, submissionModel, config)

                //When the promise results fire the callbacks
                request.then(function(res) {
                    return submissionSuccess(res.data);
                }, function(res) {
                    return submissionFail(res.data);
                })
            });

        } else {

            //Attempt to send information to post endpoint
            request = FluroContent.endpoint('post/' + hostID + '/' + submissionKey).save(submissionModel).$promise;

            //When the promise results fire the callbacks
            request.then(submissionSuccess, submissionFail)
        }

        //////////////////////////////////        

        function submissionSuccess(res) {
            //Reset
            if ($scope.vm.defaultModel) {
                $scope.vm.model = angular.copy($scope.vm.defaultModel);
            } else {
                $scope.vm.model = {
                    data: {}
                };
            }
            $scope.vm.modelForm.$setPristine();
            $scope.vm.options.resetModel();

            //Reset the captcha
            resetCaptcha();

            // $scope.vm.model = {}
            // $scope.vm.modelForm.$setPristine();
            // $scope.vm.options.resetModel();

            //Response from server incase we want to use it on the thank you page
            $scope.response = res;

            //If there is a thread push this into it
            if ($scope.thread) {
                $scope.thread.push(res);
            }

            //Change state
            $scope.vm.state = 'complete';
        }

        //////////////////////////////////
        //////////////////////////////////
        //////////////////////////////////
        //////////////////////////////////
        //////////////////////////////////

        function submissionFail(res) {
            $scope.vm.state = 'error';

            if (!res.data) {
                return $scope.processErrorMessages = ['Error: ' + res];
            }

            if (res.data.error) {
                if (res.data.error.message) {
                    return $scope.processErrorMessages = [res.error.message];
                } else {
                    return $scope.processErrorMessages = [res.error];
                }
            }

            if (res.data.errors) {
                return $scope.processErrorMessages = _.map(res.data.errors, function(error) {
                    return error.message;
                });
            }

            if (_.isArray(res.data)) {
                return $scope.processErrorMessages = res.data;
            } else {
                $scope.processErrorMessages = [res.data];
            }
        }
    }

});
app.directive('postThread', function(FluroContent) {
    return {
        restrict: 'E',
        transclude:true,
        scope:{
          definitionName:"=?type",
          host:"=?hostId",
          thread:"=?thread",
        },
        // template:'<div class="post-thread" ng-transclude></div>',
        link:function($scope, $element, $attrs, $ctrl, $transclude) {
            $transclude($scope, function (clone, $scope) {
                $element.replaceWith(clone); // <-- will transclude it's own scope
            });
        },
        controller:function($scope, $filter) {

        	$scope.outer = $scope.$parent;

            if(!$scope.thread) {
                $scope.thread = [];
            }
            
            //////////////////////////////////////////////////

        	$scope.$watch('host + definitionName', function() {

                var hostID = $scope.host;
                var definitionName = $scope.definitionName;

                if(!hostID || !definitionName) {
                    return;
                } 

                var request = FluroContent.endpoint('post/' + hostID + '/' + definitionName, true, true)
                .query()
                .$promise;

                function postsLoaded(res) {
                    var allPosts = res;


                    $scope.thread = _.chain(res)
                    .map(function(post) {

                        // console.log('POST', post._id, post.reply);
                        //Find all replies to this post
                        post.thread = _.filter(allPosts, function(sub) {
                            return (sub.reply == post._id);
                        });

                        // console.log('THREAD TEST', post.thread);

                        // console.log('find all replies that match', post._id)

                        //If it's a top level post then send it back
                        if(!post.reply) {
                            return post;
                        }
                    })
                    .compact()
                    .value();

                    // console.log('Load up the nested thread', $scope.thread);

                    // console.log('Posts loaded', res)
                    
                }

                function postsError(res) {
                    // console.log('Error loading posts', res);
                    $scope.thread = []
                }

                //Load the posts
                request.then(postsLoaded, postsError);
        	})
        },
    }
});
/**/
app.run(function(formlyConfig, $templateCache) {

    formlyConfig.setType({
        name: 'nested',
        templateUrl: 'fluro-interaction-form/nested/fluro-nested.html',
        controller: 'FluroInteractionNestedController',
    });

});

//////////////////////////////////////////////////////////

app.controller('FluroInteractionNestedController', function($scope) {


    //Definition
    var def = $scope.to.definition;

    ////////////////////////////////////

    var minimum = def.minimum;
    var maximum = def.maximum;

    ////////////////////////////////////

    $scope.$watch('model[options.key]', function(model) {
        if (!model) {
            //console.log('Reset Model cos no value!')
            resetDefaultValue();
        }
    });

    ////////////////////////////////////


    function resetDefaultValue() {
        var defaultValue = angular.copy($scope.to.baseDefaultValue);
        if(!$scope.model) {
            console.log('NO RESET Reset Model Values', $scope.options.key, defaultValue);
        }
        $scope.model[$scope.options.key] = defaultValue;
    }

    ////////////////////////////////////

    //Listen for a reset event
    $scope.$on('form-reset', resetDefaultValue);

    ////////////////////////////////////

    $scope.addAnother = function() {

        console.log('Add another')
        $scope.model[$scope.options.key].push({});
    }

    ////////////////////////////////////

    $scope.canRemove = function() {
        if (minimum) {
            if ($scope.model[$scope.options.key].length > minimum) {
                return true;
            }
        } else {
            return true;
        }
    }

    ////////////////////////////////////

    $scope.canAdd = function() {
        if (maximum) {
            if ($scope.model[$scope.options.key].length < maximum) {
                return true;
            }
        } else {
            return true;
        }
    }


    $scope.copyFields = function() {

        var copiedFields = angular.copy($scope.options.data.fields);
        $scope.options.data.replicatedFields.push(copiedFields);

        return copiedFields;
    }

    $scope.copyDataFields = function() {
        var copiedFields = angular.copy($scope.options.data.dataFields);
        $scope.options.data.replicatedFields.push(copiedFields);
        return copiedFields;
    }
});
/**/
app.run(function(formlyConfig, $templateCache) {

    formlyConfig.setType({
        name: 'search-select',
        templateUrl: 'fluro-interaction-form/search-select/fluro-search-select.html',
        controller: 'FluroSearchSelectController',
        wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    });

});

app.controller('FluroSearchSelectController', function($scope, $http, Fluro, $filter, FluroValidate) {


    /////////////////////////////////////////////////////////////////////////

    //Search Object
    $scope.search = {};

    //Proposed value
    $scope.proposed = {}

    /////////////////////////////////////////////////////////////////////////

    var to = $scope.to;
    var opts = $scope.options;

    //Selection Object
    $scope.selection = {};

    /////////////////////////////////////////////////////////////////////////

    //Get the definition
    var definition = $scope.to.definition;


    /////////////////////////////////////////////////////////////////////////

    if (!definition.params) {
        definition.params = {};
    }

    /////////////////////////////////////////////////////////////////////////

    var restrictType = definition.params.restrictType;

    //Add maximum search results
    var searchLimit = definition.params.searchLimit;
    if (!searchLimit) {
        searchLimit = 10;
    }

    /////////////////////////////////////////////////////////////////////////

    //console.log('DEFINITION', definition);

    //Minimum and maximum
    var minimum = definition.minimum;
    var maximum = definition.maximum;

    if (!minimum) {
        minimum = 0;
    }

    if (!maximum) {
        maximim = 0;
    }

    $scope.multiple = (maximum != 1);

    if($scope.multiple) {
        if($scope.model[opts.key] && _.isArray($scope.model[opts.key])) {
            $scope.selection.values = angular.copy($scope.model[opts.key]);
        }
    } else {
        if($scope.model[opts.key]) {
            $scope.selection.value = $scope.model[opts.key];
        }
    }

    /////////////////////////////////////////////////////////////////////////


    $scope.canAddMore = function() {

        if (!maximum) {
            return true;
        }

        if ($scope.multiple) {
            return ($scope.selection.values.length < maximum);
        } else {
            if (!$scope.selection.value) {
                return true;
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////

    $scope.contains = function(value) {
        if ($scope.multiple) {
            //Check if the values are selected
            return _.includes($scope.selection.values, value);
        } else {
            return $scope.selection.value == value;
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.$watch('model', function(newModelValue, oldModelValue) {
        if (newModelValue != oldModelValue) {

            var modelValue;


            //If there is properties in the FORM model
            if (_.keys(newModelValue).length) {

                //Get the model for this particular field
                modelValue = newModelValue[opts.key];


               

                if ($scope.multiple) {
                    if (modelValue && _.isArray(modelValue)) {
                        $scope.selection.values = angular.copy(modelValue);
                    } else {
                        $scope.selection.values = [];
                    }
                } else {
                    $scope.selection.value = angular.copy(modelValue);
                }
            }
        }
    }, true);

    /////////////////////////////////////////////////////////////////////////

    function setModel() {

        if ($scope.multiple) {
            $scope.model[opts.key] = angular.copy($scope.selection.values);
        } else {
            $scope.model[opts.key] = angular.copy($scope.selection.value);
        }

        if ($scope.fc) {
            $scope.fc.$setTouched();
        }


        checkValidity();
    }

    /////////////////////////////////////////////////////////////////////////

    if (opts.expressionProperties && opts.expressionProperties['templateOptions.required']) {
        $scope.$watch(function() {
            return $scope.to.required;
        }, function(newValue) {
            checkValidity();
        });
    }

    /////////////////////////////////////////////////////////////////////////

    if ($scope.to.required) {
        var unwatchFormControl = $scope.$watch('fc', function(newValue) {
            if (!newValue) {
                return;
            }
            checkValidity();
            unwatchFormControl();
        });
    }

    /////////////////////////////////////////////////////////////////////////

    function checkValidity() {


        var validRequired;
        var validInput = FluroValidate.validate($scope.model[$scope.options.key], definition);

        //Check if multiple
        if ($scope.multiple) {
            if ($scope.to.required) {
                validRequired = _.isArray($scope.model[opts.key]) && $scope.model[opts.key].length > 0;
            }
        } else {
            if ($scope.to.required) {
                if ($scope.model[opts.key]) {
                    validRequired = true;
                }
            }
        }

        if ($scope.fc) {

            $scope.fc.$setValidity('required', validRequired);
            $scope.fc.$setValidity('validInput', validInput);
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.select = function(value) {

        //console.log('SELECT', value)

        if ($scope.multiple) {
            if (!$scope.canAddMore()) {
                return;
            }
            $scope.selection.values.push(value);


        } else {
            $scope.selection.value = value;

        }

        //Clear proposed item
        $scope.proposed = {};

        //Set the model
        setModel();


    }

    /////////////////////////////////////////////////////////

    $scope.retrieveReferenceOptions = function(val) {


        ////////////////////////

        //Create Search Url
        var searchUrl = Fluro.apiURL + '/content';
        if (restrictType) {
            searchUrl += '/' + restrictType;
        }
        searchUrl += '/search';

        ////////////////////////

        return $http.get(searchUrl + '/' + val, {
            ignoreLoadingBar: true,
            params: {
                limit: searchLimit,
            }
        }).then(function(response) {

            //Got the results
            var results = response.data;

            return _.reduce(results, function(filtered, item) {
                var exists = _.some($scope.selection.values, {
                    '_id': item._id
                });
                if (!exists) {
                    filtered.push(item);
                }
                return filtered;
            }, []);

        });

    }

    ////////////////////////////////////////////////////////////

    $scope.getValueLabel = function(value) {
        if(definition.options && definition.options.length) {
            var match = _.find(definition.options, {value:value});
            if(match && match.name) {
                return match.name;
            }
        }

        return value;
    }

    ////////////////////////////////////////////////////////////

    $scope.retrieveValueOptions = function(val) {

        if (definition.options && definition.options.length) {

            var options = _.reduce(definition.options, function(results, item) {

                var exists;

                if ($scope.multiple) {
                    exists = _.includes($scope.selection.values, item.value);
                } else {
                    exists = $scope.selection.value == item.value;
                }

                if (!exists) {
                    results.push({
                        name:item.name,
                        value:item.value,
                    });
                }

                return results;
            }, []);


            return $filter('filter')(options, val);

        } else if (definition.allowedValues && definition.allowedValues.length) {

            var options = _.reduce(definition.allowedValues, function(results, allowedValue) {

                var exists;

                if ($scope.multiple) {
                    exists = _.includes($scope.selection.values, allowedValue);
                } else {
                    exists = $scope.selection.value == allowedValue;
                }

                if (!exists) {
                    results.push({
                        name:allowedValue,
                        value:allowedValue,
                    });
                }

                return results;
            }, []);

            console.log('Options', options)

            return $filter('filter')(options, val);
        }
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.deselect = function(value) {
        if ($scope.multiple) {
            _.pull($scope.selection.values, value);
        } else {
            delete $scope.selection.value;
        }

        setModel();
    }

    /////////////////////////////////////////////////////////////////////////

    $scope.toggle = function(reference) {
        if ($scope.contains(reference)) {
            $scope.deselect(reference);
        } else {
            $scope.select(reference);
        }

        //Update model
        //setModel();
    }

})
app.run(function(formlyConfig, $templateCache) {

    formlyConfig.setType({
        name: 'value',
        templateUrl: 'fluro-interaction-form/value/value.html',
        //controller: 'FluroInteractionDobSelectController',
        wrapper: ['bootstrapHasError'],
    });

});

app.service('NotificationService', function($timeout) {


	var controller = {
		messages:[],
	};

	/////////////////////////////////////
	
	controller.lastMessage = function() {
		return _.last(controller.messages);
	}
	/////////////////////////////////////

	controller.message = function(string, style, duration) {

		if(!style) {
			style = 'info';
		}

		if(!duration) {
			duration = 3000;
		}

		var message = {
			text:string,
			style:style,
			duration:duration,
		}

		//Add the message to the list
		controller.messages.push(message);

		//Remove it after duration
		$timeout(function() {
			_.pull(controller.messages, message);
		}, message.duration);

	}
	/////////////////////////////////////

	return controller;
})
app.directive('preloadImage', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.aspect = angular.isDefined(attrs.aspect) ? scope.$parent.$eval(attrs.aspect) : 0;

            if (scope.aspect) {
                element.wrap('<div class="preload-image-outer aspect-ratio" style="padding-bottom:' + scope.aspect + '%"></div>');
            } else {
                element.wrap('<div class="preload-image-outer"></div>');
            }

            var preloader = angular.element('<span class="image-preloader"><i class="fa fa-spinner fa-spin"/></span>');

            element.on('load', function() {
                element.removeClass('preload-hide');
                element.addClass('preload-show');

                preloader.remove();
            });

            element.on('error', function(err) {
                element.removeClass('preload-hide');
                element.addClass('preload-show');

                preloader.remove();
            });

            if (attrs.ngSrc && attrs.ngSrc.length) {
                element.addClass('preload-hide');
                element.parent().append(preloader);
            }
        }
    };
});
app.directive('fluroPreloader', function() {
    return {
        restrict: 'E',
        replace:true,
        scope:{},
        templateUrl:'fluro-preloader/fluro-preloader.html',
        controller:'FluroPreloaderController',
        link: function(scope, element, attrs) {
            
        }
    };
});

app.controller('FluroPreloaderController', function($scope, $state, $rootScope, $timeout) {
    

    //////////////////////////////////////////////////////////////////

    var preloadTimer;

    $scope.preloader = {
        class:'reset'
    }

    //////////////////////////////////////////////////////////////////

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {

        //If dont show a preloader then just go woot and continue
        // if($rootScope.noPreloader) {
        //     $rootScope.noPreloader = false;
        //     return;
        // }

        $scope.preloader.class = 'reset';
        preloadTimer = $timeout(function() {
            $scope.preloader.class = 'loading';
        });

        // 
        // console.log('Pause state change')
        // //We want to pause the stateChange
        // event.preventDefault();

        // //Preloader class set to reset
        // $scope.preloader.class = 'reset';

        // //Then set the preloader to loading
        // preloadTimer = $timeout(function() {
        //     $scope.preloader.class = 'loading';
        // }, 0)

        // //Then wait a second
        // $timeout(function() {

        //     console.log('Continue loading state')
        //     //This time no preloader
        //     $rootScope.noPreloader = true;

        //     //Now go to go the state
        //     $state.go(toState, toParams);

        // }, 200)

    });

    //////////////////////////////////////////////////////////////////

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {

        ////////////////////////////////////////////////////
        //If the preloader wasn't fast enough to start cancel it
        if (preloadTimer) {
            $timeout.cancel(preloadTimer);
            preloadTimer = null;
        }

        //Reset Preloader
        $scope.preloader.class = 'reset';

    });

    //////////////////////////////////////////////////////////////////

    $rootScope.$on('$preloaderHide', hidePreloader);
    $rootScope.$on('$stateChangeSuccess', hidePreloader);

    //Hide the preloader
    function hidePreloader(event, toState, toParams, fromState, fromParams, error) {
            // console.log('hide preloader')
        ////////////////////////////////////////////////////

        //If the preloader wasn't fast enough to start cancel it
        if (preloadTimer) {
            $timeout.cancel(preloadTimer);
            preloadTimer = null;
        }

        //If the preloader did show
        if ($scope.preloader.class == 'loading') {
            //Wait a little bit then hide the preloader
            $timeout(function() {
                // console.log('preloader has loaded');
                $scope.preloader.class = 'loaded';
            }, 600)
        }

    };


    //////////////////////////////////////////////////////////////////

    // $scope.clicked = function($event) {
    //     if($scope.asLink) {
    //         $state.go('watchVideo',{id:$scope.model._id, from:$scope.fromProduct})
    //     }
    // }


});
app.controller('PurchaseModalController', function($scope, fullProduct, existingCards, PurchaseService) {
    
    $scope.settings = {
        state:'ready',
    }

    ///////////////////////////////////////////////////////////

    //Get the product
    $scope.product = fullProduct;
    $scope.methods = existingCards;

    ///////////////////////////////////////////////////////////

    //Get the payment gateway
    var paymentIntegration = PurchaseService.applicationPaymentGateway();
    

        ///////////////////////////////////////////////////////////

    if(paymentIntegration) {
        
        //If this integration is set to sandbox
        if(paymentIntegration.publicDetails && paymentIntegration.publicDetails.sandbox) {

            //Setup sandbox testing details
            $scope.card = {
                number:'4242424242424242',
                name:'John Smith',
                exp_month:'02',
                exp_year:'2019',
                saveCard:true,
            }

        } else {

            //Otherwise just default to normal card
            $scope.card = {
                number:'',
                name:'',
                exp_month:'',
                exp_year:'',
                saveCard:true,
            };
        }
    }

    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    
    function purchaseSuccess(res) {
         $scope.settings.state = 'purchased';
        console.log('Purchase Success!', res);
    }
    

    function purchaseFailed(res) {
        $scope.settings.state = 'error';
        $scope.settings.errorMessage = res.data;
        console.log('Purchase failed!', res);
    }
    
    ///////////////////////////////////////////////////////
    
    $scope.purchaseWithCard = function(productID, cardDetails) {
        
        //Set the state to processing
        $scope.settings.state = 'processing';
        
        //Purchase the product with the specified card
        var request = PurchaseService.purchase(productID, cardDetails);
        
        // console.log('GOT REQUEST', request);

        request.then(purchaseSuccess, purchaseFailed);
    }
    
    ///////////////////////////////////////////////////////

    $scope.purchaseWithMethod = function(productID, method) {
        
        $scope.settings.state = 'processing';
        
        var request = PurchaseService.purchase(productID, null, method);
        
        request.then(purchaseSuccess, purchaseFailed)
    }
    
    ///////////////////////////////////////////////////////

     $scope.purchaseFree = function(productID) {
        
        $scope.settings.state = 'processing';
        
        var request = PurchaseService.purchase(productID);
        
        request.then(purchaseSuccess, purchaseFailed)
    }
    
    ///////////////////////////////////////////////////////

    /**/
    
})

app.service('PurchaseService', function($rootScope, $q, Fluro, FluroContent, $uibModal, $http) {

    var controller = {
        purchases: [],
    };

    /////////////////////////////////////////////    

    //Helper function to quickly retrieve the payment gateway information
    //that has been set on the application
    controller.applicationPaymentGateway = function() {

        //Check the application data for the payment gateway to use
        return _.get($rootScope, 'applicationData.paymentGateway');
    }

    /////////////////////////////////////////////    

    //Helper function to quickly retrieve all of a user's existing payment methods
    //and saved cards for a specified payment integration
    controller.retrievePaymentMethods = function(integrationID) {


        var deferred = $q.defer();

        ////////////////////////////////////////////

        //If there is no 
        if(!integrationID || !integrationID.length) {
            deferred.reject('No payment gateway has been specified for this application');
        } else {

            //Make the call
            FluroContent.endpoint('payment/method/' + integrationID)
            .query({})
            .$promise
            .then(deferred.resolve, deferred.reject);
        }

        ////////////////////////////////////////////

        return deferred.promise;
    }

    /////////////////////////////////////////////    

    //Helper function to refresh a users purchased list
    //This is fired whenever a user makes a new purchase
    controller.refreshPurchases = function() {

        //If no user is present then...
        if (!$rootScope.user) {
            //our purchase list is empty
            return controller.purchases = [];
        }

        /////////////////////////////////////////////    

        //Callback once purchases have been successfully reloaded
        function purchaseReloadSuccess(res) {
            console.log('Purchase reload success');
            controller.purchases = res.data;

            //Broadcas a message
            $rootScope.$broadcast('purchases.refreshed');
        }

        /////////////////////////////////////////////    

        //Callback if the reload request failed
        function purchaseReloadFail(err) {
            console.log('Error reloading purchases', err);
            controller.purchases = [];
        }


        /////////////////////////////////////////////    

        //Get the account ID of the logged in user
        var accountID = $rootScope.user.account;
        if (accountID._id) {
            accountID = accountID._id;
        }

        /////////////////////////////////////////////    

        //Make the request to Fluro and get back all the purchases for the current user
        //from the account
        var promise = $http.get(Fluro.apiURL + '/my/purchases?simple=true&account=' + accountID);
        promise.then(purchaseReloadSuccess, purchaseReloadFail);

        //Return the promise if another service or controller wants access to it
        return promise;

    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    //Helper function to find out of the user has purchased a specified product
    controller.hasPurchased = function(productID) {
        return _.some(controller.purchases, {
            product: productID
        });
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    //Helper function to check if a user has purchased any products specified in an array
    controller.hasPurchasedAny = function(productIDs) {
        return _.some(controller.purchases, function(purchase) {
            return _.includes(productIDs, purchase.product);
        });
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    //Create / Add a new payment method
    controller.createPaymentMethod = function(card) {

        


        //Create a promise
        var deferred = $q.defer();

        ///////////////////////////////////////////

        var paymentGateway = controller.applicationPaymentGateway();


        if (!paymentGateway || !paymentGateway._id) {
            createMethodFailed({
                data: 'No payment gateway has been configured for this application'
            })
        }

        ///////////////////////////////////////////

        //Function that actually sends the data to the server to create the payment method
        function createMethod(paymentMethod) {
            //Create
            FluroContent.endpoint('payment/method/' + paymentGateway._id)
                .save(paymentMethod)
                .$promise
                .then(createMethodSuccess, createMethodFailed);
        }

        //Use this function to fail the createPaymentMethod process
        function createMethodFailed(err) {
            console.log('Error creating payment method', paymentGateway, err);
            deferred.reject(err);
        }

        //Use this function once the method has actually been created
        function createMethodSuccess(res) {
            deferred.resolve(res);
        }

        ///////////////////////////////////////////
        ///////////////////////////////////////////
        ///////////////////////////////////////////     
        ///////////////////////////////////////////

        //Check which module we the paymentGateway uses for integration
        switch (paymentGateway.module) {
            case 'stripe':
                //If stripe is not included then reject the promise immediately
                if (!window.Stripe) {
                    console.log('STRIPE.JS HAS NOT BEEN INCLUDED');
                    createMethodFailed({
                        data: 'stripe.js must be included in index.html'
                    });
                } else {

                    //Get the payment gateway public keys
                    if (paymentGateway.publicDetails) {
                        if (paymentGateway.publicDetails.sandbox) {
                            //If the gateway is set to sandbox then use the sandbox public key
                            Stripe.setPublishableKey(paymentGateway.publicDetails.testPublicKey);
                        } else {
                            //If the gateway is set to live then use the live public key
                            Stripe.setPublishableKey(paymentGateway.publicDetails.livePublicKey);
                        }
                    }

                    //////////////////////////////////////////////////////

                    //Send the card details to stripe and get a token
                    Stripe.card.createToken(card, function(status, response) {

                        //If stripe sent us back an error
                        if (response.error) {
                            //Reject the promise
                            createMethodFailed(response);
                        } else {

                            //If we get here then we were able to create a customer and token in stripe
                            // Get the token ID:
                            var token = response.id;

                            //Use the token we just created and send it to the server
                            createMethod({
                                source: token
                            });
                        }
                    });
                }
                break;
            default:

                //Invalid paymentGateway module, it's either an invalid integration supplied
                //or we haven't written into the switch statement above how to handle it
                createMethodFailed({
                    data: paymentGateway.module + ' is not a valid payment integration'
                });
                break;
        }

        //Return the promise
        return deferred.promise;

    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    //Helper function for deleting a payment method from the server
    controller.removePaymentMethod = function(methodID) {

        //Method
        return FluroContent.endpoint('payment/method/' + methodID)
            .delete()
            .$promise
            .then(paymentMethodDeleted, paymentMethodError)
    }


    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    //Helper function to replace the card on an existing purchase
    //Just provide the purchase id and the payment method, The payment method will need
    //to exist on the server before you can use it
    controller.replacePaymentMethod = function(purchase, method) {

        //We just need the IDs
        var methodID = method._id;
        var purchaseID = purchase._id;

        ///////////////////////////////////////////

        //Callback for when the method was updated successfully
        function replaceMethodSuccess(res) {
            //Replace with the full method object
            purchase.method = method;
        }

        //Callback when the method could not be replaced
        function replaceMethodFailed(err) {
            console.log('Card Replace failed', err);
        }

        //Make the PUT request to the server
        var request = FluroContent.endpoint('purchase/' + purchaseID + '/method/' + methodID)
            .update({})
            .$promise;


        request.then(replaceMethodSuccess, replaceMethodFailed);

        return request;

    }

    ////////////////////////////////////////////////////////////////////////////

    //Helper method for cancelling a renewable purchase
    controller.cancelSubscription = function(purchase) {

        console.log('Cancelling', purchase);
        var promise = FluroContent.endpoint('purchase/' + purchase._id + '/cancel')
            .update({})
            .$promise;

        ///////////

        //Cancel completed
        promise.then(controller.refreshPurchases);

        return promise;
    }

    ////////////////////////////////////////////////////////////////////////////

    controller.collectFreeProducts = function(productIDs, forceNewPurchase) {

        // console.log('Collect free products on arrival');

        //////////////////////////////////////

        //Get the payment gateway
        var paymentGateway = controller.applicationPaymentGateway();

        //////////////////////////////////////

        //Create all the purchase requests
        var requests = _.map(productIDs, function(productID) {

            //Create the purchase order
            var purchaseDetails = {};
            purchaseDetails.product = productID;

            if (paymentGateway && paymentGateway._id) {
                purchaseDetails.integration = paymentGateway._id;
                purchaseDetails.forceNewPurchase = forceNewPurchase;
            }

            //Return the purchase request
            return FluroContent.endpoint('payment/purchase').save(purchaseDetails).$promise;
        });

        //Return the promise of all requests being triggered
        var request = $q.all(requests);

        //Listen for requests to be complete and then refresh purchases
        request.then(function() {
            controller.refreshPurchases();
        })

        //Return the request to the caller
        return request;
    }

    ////////////////////////////////////////////////////////////////////////////

    //Actually purchase a product with either specific card details or an existing method
    controller.purchase = function(productID, card, method) {

        //Create a promise
        var deferred = $q.defer();

        //////////////////////////////////////

        //Get the payment gateway
        var paymentGateway = controller.applicationPaymentGateway();

        //////////////////////////////////////

        //Create the purchase order
        var purchaseDetails = {};
        purchaseDetails.product = productID;

        if (paymentGateway && paymentGateway._id) {
            purchaseDetails.integration = paymentGateway._id;
        }
        //////////////////////////////////////

        //Callback once the purchase is successful
        function purchaseComplete(res) {
            controller.refreshPurchases();
            deferred.resolve(res);
        }

        //Callback when the purchase fails
        function purchaseFailed(err) {
            console.log('Purchase Error', err);
            deferred.reject(err);
        }

        //////////////////////////////////////
        //////////////////////////////////////
        //////////////////////////////////////

        //Purchase with an existing payment method
        if (method) {
            purchaseDetails.payment = {
                method: method._id
            }

            //Make the payment request
            var request = FluroContent.endpoint('payment/purchase').save(purchaseDetails).$promise;

            //Listen for purchase complete
            request.then(purchaseComplete, purchaseFailed);

            //Return the request
            return request;
        }

        //////////////////////////////////////
        //////////////////////////////////////
        //////////////////////////////////////

        //Purchase with a new card
        if (card) {

            if(!paymentGateway || !paymentGateway._id) {
                deferred.reject({
                    data: 'A payment gateway integration has not been configured for this application'
                });
            }

            ///////////////////////////////////////////

            //If we are wanting to save the card for later
            if (card.saveCard) {
                purchaseDetails.saveCard = true;
            }

            ///////////////////////////////////////////

            switch (paymentGateway.module) {
                case 'stripe':

                    if (!window.Stripe) {
                        console.log('STRIPE.JS HAS NOT BEEN INCLUDED');
                        deferred.reject({
                            data: 'stripe.js must be included in index.html'
                        });
                    } else {

                        if (paymentGateway.publicDetails) {
                            if (paymentGateway.publicDetails.sandbox) {
                                Stripe.setPublishableKey(paymentGateway.publicDetails.testPublicKey);
                            } else {
                                Stripe.setPublishableKey(paymentGateway.publicDetails.livePublicKey);
                            }
                        }

                        ////////////////////////////////////////

                        //Strip any extra details from the card
                        var stripeCardParameters = {
                            number: card.number,
                            name: card.name,
                            exp_month: card.exp_month,
                            exp_year: card.exp_year,
                        };

                        //Create a new card in stripe
                        Stripe.card.createToken(stripeCardParameters, function(status, response) {

                            //Failed
                            if (response.error) {
                                return deferred.reject({
                                    data: response.error
                                });
                            }

                            // Get the token ID:
                            var token = response.id;

                            //Use the token we just created
                            purchaseDetails.payment = {
                                source: token
                            };

                            //Make the payment request
                            FluroContent.endpoint('payment/purchase')
                                .save(purchaseDetails)
                                .$promise
                                .then(purchaseComplete, purchaseFailed);

                        });
                    }

                    break;
                default:
                    console.log(paymentGateway.module + ' is not a valid payment gateway');
                    deferred.reject(paymentGateway.module + ' is not a valid payment gateway');
                    break;
            }
        } else {

            //Make the purchase without a card
            //Usually free products
            FluroContent.endpoint('payment/purchase')
                .save(purchaseDetails)
                .$promise
                .then(purchaseComplete, purchaseFailed);
        }

        //Return the promise
        return deferred.promise;
    }


    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    controller.modal = function(productID, productDefinition) {
        //If the user is not logged in then we can't purchase the product
        if (!$rootScope.user) {
            return console.log('Cant open');
        }

        if (!productDefinition) {
            return console.log('Please specify the type of product to open modal');
        }

        //We only need the id of the product
        if (productID._id) {
            productID = productID._id;
        }

        console.log('Get product', productID);

        ///////////////////////////////////////////////

        //Spawn a modal
        var modalInstance = $uibModal.open({
            backdrop: 'static',
            templateUrl: 'fluro-purchase-service/payment-modal.html',
            controller: 'PurchaseModalController',
            resolve: {
                fullProduct: function(FluroContent) {
                    return FluroContent.resource(productDefinition + '/' + productID).get().$promise;
                },
                existingCards: function($q, FluroContent) {

                    //Defer the promise
                    var deferred = $q.defer();

                    //Check the application data for the payment gateway to use
                    var paymentGateway = controller.applicationPaymentGateway();

                    //If a gateway is set
                    if (paymentGateway) {

                        //Simplify to just the ID
                        if (paymentGateway._id) {
                            paymentGateway = paymentGateway._id;
                        }

                        //Retrieve all cards for the current user for the specified payment gateway
                        return controller.retrievePaymentMethods(paymentGateway);

                    } else {
                        // console.log('No valid payment integration set for this application');
                        deferred.resolve([]);
                    }

                    //Return the promise;
                    return deferred.promise;
                }
            },
        });

        return modalInstance;
    }

    /////////////////////////////////////////////   

    return controller;


});
app.directive('scrollActive', function($compile, $timeout, $window, FluroScrollService) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {

            ////////////////////////////////////////////////

            var onActive;
            var onBefore;
            var onAfter;
            var onAnchor;

            ////////////////////////////////////////////////

            var currentContext = '';
            var anchored;

            ////////////////////////////////////////////////

            if ($attrs.onActive) {
                onActive = function() {
                    $scope.$eval($attrs.onActive);
                }
            }

            if ($attrs.onAnchor) {
                onAnchor = function() {
                    $scope.$eval($attrs.onAnchor);
                }
            }

            if ($attrs.onAfter) {
                onAfter = function() {
                    $scope.$eval($attrs.onAfter);
                }
            }

            if ($attrs.onBefore) {
                onBefore = function() {
                    $scope.$eval($attrs.onBefore);
                }
            }


            ////////////////////////////////////////////////


            //Check if there is a parent we should be looking at instead of the body
            var parent = $element.closest('[scroll-active-parent]');
            var body = angular.element('body');

            ////////////////////////////////////////////////
            ////////////////////////////////////////////////

            if (parent.length) {
                //Listen for the parent scroll value
                parent.bind("scroll", updateParentScroll);
                $timeout(updateParentScroll, 10);
            } else {
                //Watch for changes to the main scroll value
                $scope.$watch(function() {
                    return FluroScrollService.getScroll();
                }, updateFromMainScroll);

                //Fire one for good measure
                $timeout(updateFromMainScroll, 10);
            }

            ////////////////////////////////////////////////
            ////////////////////////////////////////////////
            ////////////////////////////////////////////////
            ////////////////////////////////////////////////
            ////////////////////////////////////////////////

            function setScrollContext(context) {
                if (currentContext != context) {
                    currentContext = context;

                    $timeout(function() {

                        switch (context) {
                            case 'active':
                                $element.removeClass('scroll-after');
                                $element.removeClass('scroll-before');
                                $element.addClass('scroll-active');
                                $scope.scrollActive = true;
                                $scope.scrollBefore = false;
                                $scope.scrollAfter = false;

                                if (onActive) {
                                    onActive();
                                }

                                break;
                            case 'before':
                                $element.removeClass('scroll-after');
                                $element.addClass('scroll-before');
                                $element.removeClass('scroll-active');
                                $scope.scrollActive = false;
                                $scope.scrollBefore = true;
                                $scope.scrollAfter = false;

                                if (onBefore) {
                                    onBefore();
                                }

                                break;
                            case 'after':
                                $element.addClass('scroll-after');
                                $element.removeClass('scroll-before');
                                $element.removeClass('scroll-active');
                                $scope.scrollActive = false;
                                $scope.scrollBefore = false;
                                $scope.scrollAfter = true;

                                if (onAfter) {
                                    onAfter();
                                }

                                break;
                        }
                    })
                }
            }



            //////////////////////////////////////////////
            //////////////////////////////////////////////

            function updateParentScroll() {


                //Get the scroll value
                var scrollValue = parent.scrollTop();

                /////////////////////////

                //constants
                var viewportHeight = parent.height();
                var contentHeight = parent.get(0).scrollHeight;

                //////////////////////////////////////////////

                //Limits and markers
                var viewportHalf = (viewportHeight / 2);
                var maxScroll = contentHeight - viewportHeight;

                //Scroll
                var startView = 0;
                var endView = startView + viewportHeight;
                var halfView = endView - (viewportHeight / 2);


                /////////////////////////

                //Element Dimensions
                var elementHeight = $element.outerHeight();
                var elementStart = $element.position().top;
                var elementEnd = elementStart + elementHeight;
                var elementHalf = elementStart + (elementHeight / 4);

                ///////////////////////////////////////////////////
                ///////////////////////////////////////////////////

                //If an anchor callback has been specified
                if (onAnchor) {
                    var start = parseInt(startView);
                    var rangeStart = parseInt(elementStart);
                    var rangeEnd = parseInt(elementHalf);
                    
                    console.log(rangeStart, start, rangeEnd);
                    
                    if (start >= rangeStart && start < rangeEnd) {
                        if(!anchored) {
                            anchored = true;
                            if (anchored) {
                                onAnchor();
                            }
                        }
                    } else {
                        anchored = false;
                    }
                }


                ///////////////////////////////////////////////////

                //Check if the entire element is viewable on screen
                var entirelyViewable = (elementStart >= startView) && (elementEnd <= endView);

                ///////////////////////////////////////////////////

                //console.log('Scroll Value', entirelyViewable, scrollValue, halfView);
                if (entirelyViewable) {
                    return setScrollContext('active');
                }

                //Scrolled past the content so set to after
                if (halfView >= elementEnd) {
                    return setScrollContext('after');
                }

                //If element reaches half of the screen viewport
                if (halfView >= elementStart) {
                    return setScrollContext('active');
                }

                //If we reach the end of the page
                if (startView >= (maxScroll - 200)) {
                    return setScrollContext('active');
                }

                //Otherwise we havent reached the element yet
                return setScrollContext('before');



            }

            //////////////////////////////////////////////
            //////////////////////////////////////////////

            function updateFromMainScroll(scrollValue) {


                //constants
                var windowHeight = $window.innerHeight;
                var documentHeight = body.height();

                //////////////////////////////////////////////

                //Limits and markers
                var windowHalf = (windowHeight / 2);
                var maxScroll = documentHeight - windowHeight;

                //Scroll
                var startView = scrollValue;
                if(!startView) {
                    startView = 0;
                }
                var endView = startView + windowHeight;
                var halfView = endView - (windowHeight / 2)

                ///////////////////////////////////////////////////

                //Element
                var elementHeight = $element.outerHeight();
                var elementStart = $element.offset().top;
                var elementEnd = elementStart + elementHeight;
                var elementHalf = elementStart + (elementHeight / 4);

                ///////////////////////////////////////////////////
                ///////////////////////////////////////////////////

                //If an anchor callback has been specified
                if (onAnchor) {
                    var start = parseInt(startView);
                    var rangeStart = parseInt(elementStart);
                    var rangeEnd = parseInt(elementHalf);

                    console.log(rangeStart, start, rangeEnd);
                    
                    if (start >= rangeStart && start < rangeEnd) {
                        if(!anchored) {
                            anchored = true;
                            if (anchored) {
                                onAnchor();
                            }
                        }
                    } else {
                        anchored = false;
                    }
                }
                

                ///////////////////////////////////////////////////

                //Check if the entire element is viewable on screen
                var entirelyViewable = (elementStart >= startView) && (elementEnd <= endView);

                ///////////////////////////////////////////////////

                //console.log('Scroll Value', entirelyViewable, scrollValue, halfView);
                if (entirelyViewable) {
                    return setScrollContext('active');
                }

                //Scrolled past the content so set to after
                if (halfView >= elementEnd) {
                    return setScrollContext('after');
                }

                //If element reaches half of the screen viewport
                if (halfView >= elementStart) {
                    return setScrollContext('active');
                }

                //If we reach the end of the page
                if (startView >= (maxScroll - 200)) {
                    return setScrollContext('active');
                }


                //Otherwise we havent reached the element yet
                return setScrollContext('before');

            }

        }
    };
});
app.service('FluroScrollService', function($window, $location, $timeout) {

    var controller = {};
    
    /////////////////////////////////////
    
    controller.cache = {}
    
    /////////////////////////////////////

    controller.direction = 'down';

    /////////////////////////////////////

    var _value = 0;
    var body = angular.element('html,body');

     /////////////////////////////////////
   
    /////////////////////////////////////

    // angular.element($window).on('hashchange', function (event) {
    //     console.log('Event', window.location.hash);
    //     //var previousValue = _value;

    //     // Do what you need to do here like... getting imageId from #
    //     //var currentImageId = $location.search().imageId;
    //    // event.preventDefault();
    //    // event.stopPropagation();

    //     //Set scroll to previous value
    //     body.scrollTop(_value);

    //     var hash = $location.hash();
    //     controller.scrollToId(hash, 'slow');
    //     console.log('Hashchanged', hash, 'slow');


    //     //return false;
    // });


    /////////////////////////////////////

    controller.setAnchor = function(id) {
        $location.hash('jump-to-' + id);
    }

    /////////////////////////////////////

    controller.getAnchor = function() {
        var hash = $location.hash();
        if (_.startsWith(hash, 'jump-to-')) {
            return hash.substring(8);
        } else {
            return hash;
        }
    }

    /////////////////////////////////////

    function updateScroll() {
        var v = this.pageYOffset;

        if (_value != this.pageYOffset) {
            if (v < _value) {
                controller.direction = 'up';
            } else {
                controller.direction = 'down';
            }


            $timeout(function() {
                _value = this.pageYOffset;
            });
        }
    }

    /////////////////////////////////////

    controller.scrollToID =
        controller.scrollToId = function(id, speed, selector, offset) {

            if (speed != 0 && !speed) {
                speed = 'fast';
            }

            var $target = angular.element('#' + id);

            if ($target && $target.offset && $target.offset()) {
                if (!selector) {
                    selector = 'body,html';
                }


                var pos = $target.offset().top;

                //If theres an offset
                if(offset) {
                    pos += Number(offset);
                }

                angular.element(selector).animate({
                    scrollTop: pos
                }, speed);
            }

    }

    /////////////////////////////////////

    controller.scrollToPosition =
        controller.scrollTo = function(pos, speed, selector, offset) {

            if (speed != 0 && !speed) {
                speed = 'fast';
            }

            if (!selector) {
                selector = 'body,html';
            }


             //If theres an offset
            if(offset) {
                pos += Number(offset);
            }

            angular.element(selector).animate({
                scrollTop: pos
            }, speed);
    }

    /////////////////////////////////////

    controller.get =
    controller.getScroll = function() {
        return _value;
    }

    /////////////////////////////////////

    controller.getMax = function(selector) {

        if (!selector) {
            selector = 'body,html';
        }

        var bodyHeight = angular.element(selector).height();
        var windowHeight = $window.innerHeight;

        return (bodyHeight - windowHeight);
    }


    controller.getHalfPoint = function() {
        return ($window.innerHeight / 2);
    }

    controller.getWindowHeight = function() {
        return $window.innerHeight;
    }

    /////////////////////////////////////

    angular.element($window).bind("scroll", updateScroll);

    //Update the scroll on init
    updateScroll();

    /////////////////////////////////////

    return controller;

});
app.service('FluroSEOService', function($rootScope, $location) {

    var controller = {
    }

    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////

    $rootScope.$watch(function() {
        return controller.siteTitle + ' | ' + controller.pageTitle;
    }, function() {
        controller.headTitle = '';

        if(controller.siteTitle && controller.siteTitle.length) {
            controller.headTitle += controller.siteTitle;

            if(controller.pageTitle && controller.pageTitle.length) {
                controller.headTitle += ' | ' + controller.pageTitle;
            }
        } else {
            if(controller.pageTitle && controller.pageTitle.length) {
                controller.headTitle = controller.pageTitle;
            }
        }
    });

    ///////////////////////////////////////
    ///////////////////////////////////////

    controller.getImageURL = function() {

        //Get the default image URL
        var url = controller.defaultImageURL;

        if(controller.imageURL && controller.imageURL.length) {
            url = controller.imageURL;
        }

        return url;
    }

    ///////////////////////////////////////
    ///////////////////////////////////////

    controller.getDescription = function() {

        //Get the default image URL
        var description = controller.defaultDescription;

        if(controller.description) {
            description = controller.description;
        }

        if(description && description.length) {
            return description;
        } else {
            return '';
        }
    }


    //////////////////////////////////////////////////////////////////

    //Get the default site wide Social sharing image
    
    


    ///////////////////////////////////////
    ///////////////////////////////////////

    //Listen to change in the state
    $rootScope.$on('$stateChangeSuccess', function() {
        controller.url = $location.$$absUrl;
    });

    //Listen to change in the state
    $rootScope.$on('$stateChangeStart', function() {

        //Reset SEO stuff
        controller.description = null;
        controller.imageURL = null;

        console.log('REset SEO');
    });


    ///////////////////////////////////////

    return controller;

});
app.directive('statWidget', function() {
    return {
        restrict: 'E',
        // replace: true,
        // template:'<span ng-transclude></span>',
        scope: {
            item: '=',
            stat: '@',
            myStats: '=?myStats',
        },
        controller: 'FluroStatWidgetController',
        transclude: true,
        link: function($scope, $element, $attrs, $ctrl, $transclude) {
            $transclude($scope, function(clone, $scope) {
                $element.replaceWith(clone);
            });
        },
    };
});

/////////////////////////////////////////////////////////////////////////

app.controller('FluroStatWidgetController', function($scope, $timeout, FluroContent) {

    if (!$scope.myStats) {
        $scope.myStats = {};
    }

    //////////////////////////////////////////////////

    $scope.processing = false;

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////

    //Watch for stat changes
    $scope.$watch(function() {

        var myStatValue = $scope.myStats['_' + $scope.stat];
        var totalStatValue = 0;

        if ($scope.item.stats && $scope.item.stats['_' + $scope.stat]) {
            totalStatValue = $scope.item.stats['_' + $scope.stat];
        }

        //Watch for when either my stats change or the total stats change
        return myStatValue + '-' + totalStatValue;

    }, function(tally) {

        var myStatValue = $scope.myStats['_' + $scope.stat];
        var totalStatValue = 0;

        if ($scope.item.stats && $scope.item.stats['_' + $scope.stat]) {
            totalStatValue = $scope.item.stats['_' + $scope.stat];
        }


        //Update my total
        $scope.myTotal = myStatValue;

        //Update the total of everybody
        $scope.total = totalStatValue
    });


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////

    $scope.toggle = function() {

        //We can't do anything if we don't know what the item or the stat is
        if (!$scope.item || !$scope.stat) {
            return;
        }

        ////////////////////////////////////

        //If theres no stats yet then create the object
        if (!$scope.item.stats) {
            $scope.item.stats = {};
        }

        ////////////////////////////////////

        //Get the simple variables we need
        var statName = $scope.stat;
        var itemID = $scope.item._id;

        ////////////////////////////////////

        var prevCount;

        if ($scope.myStats) {
            //Check unique count for current stats
            prevCount = $scope.myStats['_' + statName];
        }

        ////////////////////////////////////

        //Hit the toggle endpoint
        var request = FluroContent.endpoint('stat/' + itemID + '/' + statName).update({}).$promise;

        $scope.processing = true;
        ////////////////////////////////////

        //Once the request has completed
        request.then(function(res) {

            $scope.processing = false;
            $timeout(function() {

                //If previously we had a value for this stat
                if ($scope.myStats) {

                    //If it was 1
                    if (prevCount) {
                        //Change the current users stats to 0
                        $scope.myStats['_' + statName] = 0;
                    } else {
                        //Change the current users stats to 1
                        $scope.myStats['_' + statName] = 1;
                    }
                }


                //Update the stats on the item object itself
                $scope.item.stats['_' + statName] = res.total;
            });

            ////////////////////////////////////

        }, function(err) {
            $scope.processing = false;
            console.log('Error updating stat', err);
        })
    }
});
app.controller('UserLoginController', function($scope, $http, FluroTokenService, NotificationService) {
    

    ////////////////////////////////////////

    $scope.credentials = {}
    
    $scope.status = 'ready';
    
    ////////////////////////////////////////

    $scope.signup = function(options) {
        
        $scope.status = 'processing';
     
     	//Signup for a new persona
        var request = FluroTokenService.signup($scope.credentials, options)
        
        request.then(function(res) {
            $scope.status = 'ready';
            NotificationService.message('Hi ' + res.data.firstName)
        }, function(res) {
            $scope.status = 'ready';
            NotificationService.message(String(res.data), 'danger')
        })
    }
    
    ////////////////////////////////////////

    $scope.login = function(options) {
        
        $scope.status = 'processing';
        var request = FluroTokenService.login($scope.credentials, options);

        request.then(function(res) {
            $scope.status = 'ready';
            NotificationService.message('Welcome back ' + res.data.firstName)
        }, function(res) {
            $scope.status = 'ready';
            console.log('FAILED', res);

            if(res.status == -1) {

                var appDevelopmentURL = getMetaKey('app_dev_url');

                ////////////////////////////////////////////

                if(appDevelopmentURL && appDevelopmentURL.length) {
                    NotificationService.message('Update your trusted hosts for (' + appDevelopmentURL + ') to allow from this origin', 'danger')
                } else {
                    NotificationService.message('Network Security Error', 'danger')
                }

                ////////////////////////////////////////////


            } else {
                NotificationService.message(String(res.data), 'danger')
            }
        })
    }
   
});


app.directive('hamburger', function() {
    return {
        restrict: 'E', 
        replace:true, 
        template:'<div class="hamburger"> \
		  <span></span> \
		  <span></span> \
		  <span></span> \
		  <span></span> \
		</div>', 
        link: function($scope, $elem, $attr) {
        } 
    } 
});
app.directive('compileHtml', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                return scope.$eval(attrs.compileHtml);
            }, function(value) {



                element.html(value);
                $compile(element.contents())(scope);
            });
        }
    };
});

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

app.directive('httpSrc', function($http) {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var requestConfig = {
                method: 'get',
                url: attrs.httpSrc,
                responseType: 'arraybuffer',
                cache: 'true'
            };

            $http(requestConfig).then(function(res) {
               var b64 = _arrayBufferToBase64(res.data);

                attrs.$set('src', "data:image/jpeg;base64," + b64);
            }, function(err) {
                console.log('HTTP IMAGE LOAD ERROR', err);
            });
        }
    }
});


app.directive('httpBgSrc', function($http, Fluro) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var requestConfig = {
                method: 'get',
                url: attrs.httpBgSrc,
                responseType: 'arraybuffer',
                cache: 'true'
            };
            $http(requestConfig)
                .then(function(res) {
                    var b64 = _arrayBufferToBase64(res.data);

                    element.css('backgroundImage', "url(data:image/jpeg;base64," + b64 + ')');
                }, function(err) {
                console.log('HTTP IMAGE LOAD ERROR', err);
            });
        },

    }
});
app.directive('infinitePager', function($timeout, $sessionStorage) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            var perPage = 16;
            
            if($attr.perPage) {
                perPage = parseInt($attr.perPage);
            }
            
            $scope.pager = {
                currentPage: 0,
                limit: perPage,
            };

            $scope.pages = [];

    
            /////////////////////////////////////////////////////
            
            $scope.$watch($attr.items, function(items) {
                
                $scope.allItems = items;
                
                if($scope.allItems) {
                    $scope.pages.length = 0;
                    $scope.pager.currentPage = 0;
                   
                    $scope.totalPages = Math.ceil($scope.allItems.length / $scope.pager.limit) - 1;
                      $scope.updateCurrentPage();
                }
            });
    
            /////////////////////////////////////////////////////
           
            //Update the current page
            $scope.updateCurrentPage = function() {


                
                if ($scope.allItems.length < ($scope.pager.limit * ($scope.pager.currentPage - 1))) {
                    $scope.pager.currentPage = 0;
                }
        
                var start = ($scope.pager.currentPage * $scope.pager.limit);
                var end = start + $scope.pager.limit;
        
                //Slice into seperate chunks
                var sliced = _.slice($scope.allItems, start, end);
                $scope.pages.push(sliced);
            }
    
            /////////////////////////////////////////////////////
             var timer;
            
            $scope.nextPage = function() {
                if ($scope.pager.currentPage < $scope.totalPages) {
                    $timeout.cancel(timer);
                    timer = $timeout(function() {
                        $scope.pager.currentPage = ($scope.pager.currentPage + 1);
                        $scope.updateCurrentPage();
                    });
                } else {
                    $scope.updateCurrentPage();
                }
            }
            
            /////////////////////////////////////////////////////
        }
    };
    
})
app.directive('longTextWrap', function() {


	return {
		restrict:'E',
		transclude:true,
		template:'<div class="long-text-wrap" ng-class="{expanded:ltSettings.expanded}" ><div class="long-text-wrap-inner" ng-transclude></div><a class="long-text-wrap-link" ng-click="ltSettings.expanded = !ltSettings.expanded"><div><span>Read more<span><i class="fa fa-angle-down"></i></div></a></div>',
		controller:function($scope) {
			$scope.ltSettings = {};
		}
	}
})
app.filter('capitalise', function() {
	return function (str) {
		return _.upperCase(str);
	}
})

app.filter('commaSummary', function() {
    return function (arrayOfObjects, limit) {

        if(!limit) {
            limit = 20;
        }

        var names = _.chain(arrayOfObjects)
        .map(function(object) {
            return object.title;
        })
        .compact()
        .value();

        var string = names.join(', ');

        if(string.length >=limit) {
            string = string.substr(0,limit) + '...';
        }

        return string;
    }
})

app.filter('dateInitials', function($rootScope) {

    return function(string) {

        switch (string) {
            case 'year':
                return 'yr'
                break;
            case 'day':
                return 'day'
                break;
            case 'week':
                return 'wk'
                break
            case 'month':
                return 'mo'
                break
            case 'once':
                return 'once'
                break
            default:
                return string[0] + string[1];
                break;
        }

    };
});
app.filter('filesize', function() {


     /*function calculateAge(birthday) { // birthday is a date
         var ageDifMs = Date.now() - birthday.getTime();
         var ageDate = new Date(ageDifMs); // miliseconds from epoch
         return Math.abs(ageDate.getUTCFullYear() - 1970);
     }
     */

     return function(bytes) { 
           var sizes = ['Bytes', 'kb', 'mb', 'gb', 'tb'];
		   if (bytes == 0) return '0 Byte';
		   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		   return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
     }; 
     
});


app.filter('maplink', function() {
    return function(location) {



        var pieces = [];

        if (location.title && location.title.length) {
            pieces.push(location.title);
        }

        if (location.addressLine1 && location.addressLine1.length) {
            pieces.push(location.addressLine1);
        }

        if (location.addressLine2 && location.addressLine2.length) {
            pieces.push(location.addressLine2);
        }

        if (location.state && location.state.length) {
            pieces.push(location.state);
        }

        if (location.suburb && location.suburb.length) {
            pieces.push(location.suburb);
        }

        if (location.postalCode && location.postalCode.length) {
            pieces.push(location.postalCode);
        }

        var url = 'https://www.google.com/maps/place/' + pieces.join('+');


        return url;
    }
})
app.filter('readableDate', function() {
    return function(event, style) {

        if(!event) {
            return;
        }

        if(!event.startDate) {
            return;
        }

        var startDate = new Date(event.startDate);
        var endDate = new Date(event.endDate);

       

        ///////////////////////////////////////////////

        var noEndDate = startDate.format('g:ia j M Y') == endDate.format('g:ia j M Y');
        var sameYear = (startDate.format('Y') == endDate.format('Y'));
        var sameMonth = (startDate.format('M Y') == endDate.format('M Y'));
        var sameDay = (startDate.format('j M Y') == endDate.format('j M Y'));

        switch (style) {
            case 'short':
                // console.log('SHORT', startDate, endDate);
                if (noEndDate) {
                    return startDate.format('j M')
                }

                if (sameDay) {
                    //8am - 9am Thursday 21 May 2016
                    return startDate.format('j M')
                }

                if (sameMonth) {
                    //20 - 21 May 2016
                    return startDate.format('j') + '-' + endDate.format('j M')
                }

                if (sameYear) {
                    //20 Aug - 21 Sep 2016
                    return startDate.format('j') + '-' + endDate.format('j M')
                }

                //20 Aug 2015 - 21 Sep 2016
                return startDate.format('j M Y') + ' - ' + endDate.format('j M Y')

                break;
            default:
                if (noEndDate) {
                    return startDate.format('g:ia l j M Y')
                }

                if (sameDay) {
                    //8am - 9am Thursday 21 May 2016
                    return startDate.format('g:ia') + ' - ' + endDate.format('g:ia l j M Y')
                }

                if (sameMonth) {
                    //20 - 21 May 2016
                    return startDate.format('j') + '-' + endDate.format('j M Y')
                }

                if (sameYear) {
                    //20 Aug - 21 Sep 2016
                    return startDate.format('j M') + ' - ' + endDate.format('j M Y')
                }

                //20 Aug 2015 - 21 Sep 2016
                return startDate.format('j M Y') + ' - ' + endDate.format('j M Y')

                break;
        }

    };
});
app.filter('readableDuration', function() {


    // return function convertTime(seconds) {


    //     var time = seconds;
    //     // time = parseInt(time / 60);

    //     var minutes = time % 60;
    //     time = parseInt(time / 60);

    //     var hours = time % 24;
    //     var out = "";

    //     if (hours && hours > 0) out += hours + " " + ((hours == 1) ? "hr" : "hrs") + " ";
    //     if (minutes && minutes > 0) out += minutes + " " + ((minutes == 1) ? "min" : "mins") + " ";
    //     if (seconds && seconds > 0) out += seconds + " " + ((seconds == 1) ? "sec" : "secs") + " ";

    //     return out.trim();
    // }


    return  function(duration) {
        var hour = 0;
        var min = 0;
        var sec = 0;

        if (duration) {
            if (duration >= 60) {
                min = Math.floor(duration / 60);
                sec = duration % 60;
            } else {
                sec = duration;
            }

            if (min >= 60) {
                hour = Math.floor(min / 60);
                min = min - hour * 60;
            }

            // if (hour < 10) {
            //     hour = '0' + hour;
            // }
            // if (min < 10) {
            //     min = '0' + min;
            // }
            // if (sec < 10) {
            //     sec = '0' + sec;
            // }
        }

        var out = '';

        if(hour) {
        	out += hour + ' hr';
        	if(hour > 1) {
        		out += 's ';
        	} else {
        		out += ' ';
        	}
        }

        if(min) {
        	out += min + ' min';
        	if(min > 1) {
        		out += 's ';
        	} else {
        		out += ' ';
        	}
        }

        if(sec && !hour) {
        	out += sec + ' sec';
        	if(sec > 1) {
        		out += 's ';
        	} else {
        		out += ' ';
        	}
        }

        return out.trim();
    }





});
// app.filter('reword', function($rootScope) {
// 	return function (str) {

// 		// console.log('TEST', str, $rootScope.applicationData);

// 		var translations = _.get($rootScope.applicationData, 'translations');
// 		var replacement = _.find(translations, {from:str});

// 		if(replacement) {

// 			console.log('Replace', replacement.from, replacement.to);
// 			return str.replace(new RegExp(replacement.from, 'g'), replacement.to);
// 		} else {
// 			return str;
// 		}
// 	}
// });



 app.filter('reword', function($rootScope) {

 	console.log('Get Translations')
	var translations = _.get($rootScope.applicationData, 'translations');


      return function(string) {


      	//Loop through each translatedWord
   			_.each(translations, function(set) {

   				// console.log('REPLACE', set.from, string);
   				string = string.replace(new RegExp(set.from, 'g'), set.to);
   			});

   			// console.log('Replaced', string);

   			return string
    		
    		
		};





    });

app.filter('timeago', function(){
  return function(date){
    return moment(date).fromNow();
  };
});

app.service('CheckinEventService', function ($q, $rootScope, FluroContentRetrieval) {


	var service = {};

	/////////////////////////////////////////
	

	var request;

	service.reload = function(force) {

		if(request && !force) {
			return request;
		}

		/////////////////////////////////////////

		//Get start of today
        var thismorning = new Date();
        thismorning.setHours(0,0,0,0);

        // //Get end of today
        var tonight = new Date();
        tonight.setHours(23,59,0,0);

        //Find all events that are running today
        var queryDetails = {
            "_type":"event",
            "startDate": {
                "$lte": "date('"+tonight+"')"
            },
            "endDate": {
                "$gte": "date('"+thismorning+"')"
            },
        }


		/////////////////////////////////////////

		//Set status to processing
		service.processing = true;

		var requestOptions = {
			noCache:true,
		}

		//Now we make the request to the server
		request = FluroContentRetrieval.query(queryDetails, null, null, requestOptions, null);

		//Listen for the promise to resolve
        request.then(function(res) {

        	//Update the status
        	service.processing = false;

        	//Update the event list
            service.events = res;
           
           	console.log('EventService.reload complete', res);

           	//Kill off the request so we dont load more than we need to
           	request = null;

        }, function(err) {

        	//Update the status
        	service.processing = false;
            console.log('EventService.reload error', err);

            //Kill off the request so we dont load more than we need to
            request = null;
        });
		

	}

	/////////////////////////////////////////

	service.eventRequiresPin = function(event) {
		//check if the app needs a pin number
        var appNeedsPin = _.get($rootScope, 'appData.requirePin');
        //check if the event requires a pin number
        var eventNeedsPin = _.get(event, 'checkinData.requirePin');
        return (appNeedsPin || eventNeedsPin);
	}


	////////////////////////////////////////////////

    controller.eventIsOpen = function(event) {

        var now = new Date();

        //Get the checkin times
        var checkinTimes = service.getEventCheckinTimes(event);

        //Check whether we are within the checkin time for this event
        return ((now >= checkinTimes.startDate) && (now <= checkinTimes.endDate));
    }

	////////////////////////////////////////////////

    service.getEventCheckinTimes = function(event) {

        var startDate = new Date(event.startDate);
        startDate.setSeconds(0, 0);

        var endDate = new Date(event.endDate);
        endDate.setSeconds(0, 0);

        ///////////////////////////////////////////////////

        if (startDate.getTime() == endDate.getTime()) {
            //15 minutes
            var defaultEventLength = 60 * 60000;
            endDate = new Date(startDate.getTime() + defaultEventLength);
        }

        ///////////////////////////////////////////////////

        //30 minutes by default
        var checkinStartOffset = 90;
        var checkinEndOffset = 90;

        if (event.checkinData) {
            if (event.checkinData.checkinStartOffset) {
                checkinStartOffset = event.checkinData.checkinStartOffset;
            }

            if (event.checkinData.checkinEndOffset) {
                checkinEndOffset = event.checkinData.checkinEndOffset;
            }
        }

        ///////////////////////////////////////

        //Change the minutes to milliseconds
        checkinStartOffset = checkinStartOffset * 60000;
        checkinEndOffset = checkinEndOffset * 60000;

        //Get the dates with the offsets added
        startDate = new Date(startDate.getTime() - checkinStartOffset);
        endDate = new Date(endDate.getTime() + checkinEndOffset);

        return {
            startDate:startDate,
            endDate:endDate,
        };
    }

	/////////////////////////////////////////


	return service;

})
app.service('IdleTimeoutService', function($interval, NotificationService) {

    //Private variables
    var interval;
    var _defaultSecondsLeft = 60;

    ///////////////////////////////////////////////////////////

    var listeners = [];

    ///////////////////////////////////////////////////////////

    var service = {
        seconds: _defaultSecondsLeft,
    }

    service.addListener = function(func) {
        listeners.push(func);
    }

    service.removeListener = function(func) {
        _.pull(listeners, func);
    }

    ///////////////////////////////////////////////////////////

    function countdown() {

        if (service.seconds <= 0) {
            //Each function listening to the timer
            _.each(listeners, function(listener) {

                //Run the function
                listener();
            })

            return;
        }

        if (service.seconds < 10) {
            NotificationService.message('Restarting in ' + service.seconds, 'warning', 1000);
        }

        //take away one second
        service.seconds--;

        // console.log('Seconds left', service.seconds);
    }

    ///////////////////////////////////////////////////////////

    service.start = function() {
        if (interval) {
            return;
        }

        interval = $interval(countdown, 1000);
    }

    ///////////////////////////////////////////////////////////

    service.stop = function() {
        if (interval) {
            $interval.cancel(interval);
            interval = null;
        }
    }

    ///////////////////////////////////////////////////////////

    service.reset = function() {
        service.seconds = _defaultSecondsLeft;
    }

    ///////////////////////////////////////////////////////////

    return service;
});
app.service('PrinterService', function($q, $rootScope, FluroContent) {


    var service = {

    };

    /////////////////////////////////////////

    var request;

    service.reload = function(force) {

        if (request && !force) {
            return request;
        }

        /////////////////////////////////////////

        //Set status to processing
        service.processing = true;

        request = FluroContent.endpoint('printer').query({
            noCache: true
        }).$promise;

        /////////////////////////////////////////

        //Listen for the promise to resolve
        request.then(function(res) {

            //Update the status
            service.processing = false;

            //Update the event list
            service.printers = res;

            console.log('PrinterService.reload complete', res);

            //Kill off the request
            request = null;

        }, function(err) {

            //Update the status
            service.processing = false;
            console.log('PrinterService.reload error', err);

            //Kill off the request
            request = null;
        });
    }

    ////////////////////////////////////////////////////////


    service.reprint = function(checkin) {

        if(checkin.reprinting) {
            return console.log('already reprinting');
        }

        if(!$localStorage.printStationID) {
            return console.log('No local storage printer id has been set');
        }

        checkin.reprinting = true;

        //////////////////////////////////

        var promise = FluroContent.endpoint('checkin/reprint/' + checkin._id).save({
            // printStationID:$localStorage.printStationID,
        }).$promise;

        //////////////////////////////////

        console.log('Reprint request made')
        promise.then(function(res) {
            console.log('Reprint complete')
            checkin.reprinting =false;
        }, function(err) {
            console.log('Reprint error', err)
            checkin.reprinting =false;
        })

    }




    /////////////////////////////////////////

    return service;

})
app.service('StalkerService', function() {

	var service = {
		trackedEvents:[],
		elapsed:0,
	};

	/////////////////////////////////////////

	service.reset = function() {
		service.trackedEvents = [];
		service.elapsed = 0;
	}

	/////////////////////////////////////////

	service.track = function(name, optionalData) {

		var event = {
			name:name,
			date:new Date(),
			duration:0,
			elapsed:0,
		}

        /////////////////////////////////////////

		//If there is already an event
		if(service.trackedEvents.length) {

			//Get the last event
			var lastEvent = service.trackedEvents[service.trackedEvents.length-1];

			if(lastEvent) {
				//Get the datetime of the last event
				var lastEventDate = moment(lastEvent.date);

				//And now
				var now = moment(event.date);

				//Find the difference between now and the last event date
	            var difference = now.diff(lastEventDate);

	            //Store the duration and the elapsed time
	            event.duration = difference;
	            event.elapsed = lastEvent.elapsed + difference;
	        }
        }

        /////////////////////////////////////////

		if(optionalData) {
			event.data = optionalData;
		}

		// console.log('STALKER', name, service.trackedEvents.length);
		service.trackedEvents.push(event)
	}

	/////////////////////////////////////////
	/////////////////////////////////////////


	return service;


});

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
