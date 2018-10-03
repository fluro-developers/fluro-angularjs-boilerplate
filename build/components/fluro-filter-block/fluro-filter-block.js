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