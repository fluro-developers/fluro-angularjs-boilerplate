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