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