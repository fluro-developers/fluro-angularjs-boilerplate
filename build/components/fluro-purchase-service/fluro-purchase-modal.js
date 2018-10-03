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
