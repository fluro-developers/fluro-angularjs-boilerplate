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