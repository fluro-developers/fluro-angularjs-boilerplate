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