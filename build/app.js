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