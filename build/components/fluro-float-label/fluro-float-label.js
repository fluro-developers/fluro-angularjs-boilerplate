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