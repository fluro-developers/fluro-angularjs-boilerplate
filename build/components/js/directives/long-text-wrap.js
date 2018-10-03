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