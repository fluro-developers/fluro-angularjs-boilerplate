MyAccountController.resolve = {
    seo: function(FluroSEOService, $rootScope) {
        FluroSEOService.pageTitle = $rootScope.user.firstName;
        return true;
    },
    purchases: function(FluroContent) {
        return FluroContent.endpoint('my/purchases', false, true).query({
            populateLicenses: true,
        }).$promise;
    },
    posts: function(FluroContentRetrieval, $rootScope) {

        if (!$rootScope.user || !$rootScope.user.persona) {
            return [];
        }

        //////////////////////////////////////////////

        var queryDetails = {
            _type: "post",
            definition: {
                $in: ['comment', 'note'],
            },
            managedAuthor: $rootScope.user.persona,
        }

        var selectFields = 'title parent definition created';

        /////////////////////////////////////////

        //Request an update of all available events today
        var promise = FluroContentRetrieval.query(queryDetails, null, null, {
            noCache: true,
            select: selectFields
        }, null);

        return promise;
    },
    paymentMethods: function($q, FluroContent, PurchaseService) {

        //Find all payment methods for the user

        //Defer the promise
        var deferred = $q.defer();

        //Check the application data for the payment gateway to use
        var paymentGateway = PurchaseService.applicationPaymentGateway();

        //If a gateway is set
        if (paymentGateway) {
            //Retrieve all cards for the current user for the specified payment gateway
            return PurchaseService.retrievePaymentMethods(paymentGateway._id);
        } else {
            deferred.resolve([]);
        }

        //Return the promise;
        return deferred.promise;
    },
}

MyAccountController.data = {
    requireLogin: true,
},

app.controller('MyAccountController', MyAccountController);

function MyAccountController($scope, $rootScope, purchases, posts, FluroTokenService, paymentMethods, PurchaseService, FluroContent) {


    ////////////////////////////////////////////////////

    function updatePurchases(purchaseList) {


        ////////////////////////////////////////////////////////

        var cleaned = _.chain(purchaseList)
        .map(function(purchase) {

            if(purchase.purchaser) {
                purchase.grantedBy = purchase.purchaser.name
            }

            if(purchase.managedPurchaser) {
                purchase.grantedBy = purchase.managedPurchaser.title
            }



            var userPersona = $rootScope.user.persona;
            var userID = $rootScope.user._id;

            //////////////////////////////////////////////////

            var managedPurchaser = purchase.managedPurchaser;
            var purchaser = purchase.purchaser;

            if(managedPurchaser && managedPurchaser._id) {
                managedPurchaser = managedPurchaser._id;
            }

            if(purchaser && purchaser._id) {
                purchaser = purchaser._id;
            }


            //////////////////////////////////////////////////
            //////////////////////////////////////////////////

            //Start by assuming the user owns this purchase
            purchase.owned = true;

            if(purchaser && purchaser != userID) {
                purchase.owned = false;
            }

            if(managedPurchaser && (managedPurchaser != userPersona)) {
                purchase.owned = false;
            }

            //////////////////////////////////////////////////

            return purchase;

        })
        .value();

        ////////////////////////////////////////////////////////

        $scope.ownedPurchases = _.filter(cleaned, {owned:true});
        $scope.licensedPurchases = _.filter(cleaned, {owned:false});
        $scope.purchases = cleaned;


    }

    ////////////////////////////////////////////////////

    //Add all the purchases in the list
    updatePurchases(purchases);

    ////////////////////////////////////////////////////
    $scope.methods = paymentMethods;

    $scope.expanded = {};

    $scope.settings = {
        activeTab:'purchases',
        cacheBuster:1,
    }

    //////////////////////////////////////////////////////

    if($scope.ownedPurchases.length == 1) {
       $scope.expanded.purchase = $scope.ownedPurchases[0];
    }
    //////////////////////////////////////////////////////

    var comments = [];
    var notes = [];

    _.each(posts, function(post) {
        switch(post.definition) {
            case 'vodComment':
                comments.push(post);
            break;
            case 'vodNote':
                notes.push(post);
            break;
        }
    })

    //////////////////////////////////////////////////////

    $scope.getParentSref = function(parent) {
        switch(parent.definition) {
            case 'vodEvent':
                return "stream({slug:'"+parent.slug+"'})";
            break;
            case'vodEpisode':
                return "watchVideo({slug:'"+parent.slug+"'})";
            break;
        }
    }

    //////////////////////////////////////////////////////

    $scope._proposedLicense = {};

    $scope.sendInvite = function(purchase) {

        $scope._proposedLicense.processing = true;

        var details = angular.copy($scope._proposedLicense);
        details.redirect = '/invited';
        details.purchase = purchase._id;

        var request = FluroTokenService.applicationRequest(details, '/invite');

        request.then(function(res) {

            //Immediately push in the license
            purchase.managedLicense.push(res.data);

            $scope._proposedLicense = {};

            console.log('Invitation request made', res);
        }, function(err) {

            $scope._proposedLicense.processing = false;

            console.log('Invitation request failed', err);
        });
    }

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////

    $scope.licensesUsed = function(purchase) {

        var total = 0;

        var licenses = purchase.license.length;
        var managedLicenses = purchase.managedLicense.length;

        //Licenses
        total += licenses;
        total += managedLicenses;

        return total;

    }


    $scope.licensesAvailable = function(purchase) {

        var total = purchase.limit-1;
        var licensesUsed = $scope.licensesUsed(purchase);

        return total - licensesUsed;

    }

    //////////////////////////////////////////////////////

    $scope.comments = comments;

    $scope.uniqueComments = _.chain(comments)
    .uniqBy(function(comment) {
        return comment.parent._id;
    })
    .orderBy(function(comment) {
        var date = new Date(comment.created);
        return date.getTime();
    })
    .value();

    //////////////////////////////////////////////////////

    $scope.notes = notes;
    $scope.uniqueNotes = _.chain(notes)
    .uniqBy(function(comment) {
        return comment.parent._id;
    })
    .orderBy(function(comment) {
        var date = new Date(comment.created);
        return date.getTime();
    })
    .value();

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////

    $scope.toggleExpanded = function(type, item) {

        if($scope.ownedPurchases.length > 1) {
            if($scope.expanded[type] == item) {
                $scope.expanded[type] = null;
            } else {
                $scope.expanded[type] = item;
            }
        }
    }

    //////////////////////////////////////////////////////

    $scope.cancelSubscription = function(purchase) {

        console.log('Cancel')

        function cancelSuccess(res) {
            console.log('Subscription cancelled', res)
            FluroContent.endpoint('my/purchases', false, true).query({}).$promise.then(function(purchases) {

                updatePurchases(purchases);

            });
        }

        function cancelFailed(err) {
            console.log('Subscription cancel error', err)
        }

        PurchaseService.cancelSubscription(purchase).then(cancelSuccess, cancelFailed);
    }

}


//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

app.controller('PaymentMethodReplaceController', function($scope, $state, $timeout, FluroContent, PurchaseService) {


    $scope.settings = {
        addCard: {}
    };

    //Get ready for errors
    $scope.errors = {};
    $scope.invalid = false;

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////

    $scope.hasErrors = function() {
        return _.keys($scope.errors).length
    }



    //////////////////////////////////////////////////////

    $scope.replaceWithNewCard = function(purchase, newCard) {

        $scope.settings.state = 'processing';

        //Create the new card
        PurchaseService.createPaymentMethod(newCard).then(cardCreateSuccess, cardReplaceError);

        function cardCreateSuccess(createdMethod) {
            console.log('Card Create Success', createdMethod)
            PurchaseService.replacePaymentMethod(purchase, createdMethod).then(function(res) {
                //Method was replaced successfully
                purchase.method = createdMethod;
                $scope.settings.state = 'default';
            }, cardReplaceError);
        }

        function cardReplaceError(err) {
            $scope.settings.state = 'error';

            if (err.message) {
                return $scope.settings.errorMessage = err.message;
            }

            if (err.error) {
                if (err.error.message) {
                    return $scope.settings.errorMessage = err.error.message;
                }
                return $scope.settings.errorMessage = err.error;
            }

            return err;
        }

    }



    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////

    //Watch for changes to purchase data
    $scope.$watch('settings.addCard', function(data) {

        //Reset the errors
        $scope.errors = {};

        //Check if a name has been provided
        if (!data.name || !data.name.length) {
            $scope.errors['cardname'] = 'Card name is required'
        }

        //Make sure a number has been provided
        if (!data.number || !data.number.length) {
            $scope.errors['cardnumber'] = 'Card number is required'
        }

        //Ensure an expiry month has been provided
        if (!data.exp_month || !data.exp_month.length) {
            $scope.errors['exp_month'] = 'Card expiry month is required'
        }

        //Ensure an expiry year has been provided
        if (!data.exp_year || !data.exp_year.length) {
            $scope.errors['exp_year'] = 'Card expiry year is required'
        }

        //Ensure a CVC number has been provided
        if (!data.cvc || !data.cvc.length) {
            $scope.errors['cvc'] = 'Card Validation number is required'
        }

        ////////////////////////////////////////////////////////////

        //Check if there are any errors
        var hasErrors = _.keys($scope.errors).length;

        //If there are errors then mark as invalid
        if (hasErrors) {
            $scope.invalid = true;
        } else {
            $scope.invalid = false;
        }

    }, true);



});

/**/
