// app.directive('myDirective', function (httpPostFactory) {
//     return {
//         restrict: 'A',
//         scope: true,
//         link: function (scope, element, attr) {

//             element.bind('change', function () {
//                 var formData = new FormData();
//                 formData.append('file', element[0].files[0]);
//                 httpPostFactory('upload_image.php', formData, function (callback) {
//                    // recieve image name to use in a ng-src 
//                     console.log(callback);
//                 });
//             });

//         }
//     };
// });

// app.factory('httpPostFactory', function ($http) {
//     return function (file, data, callback) {
//         $http({
//             url: file,
//             method: "POST",
//             data: data,
//             headers: {'Content-Type': undefined}
//         }).success(function (response) {
//             callback(response);
//         });
//     };
// });








app.directive('personaImageReplaceForm', function(Fluro, $http, $timeout) {

    return {
        restrict: 'E',
        scope: {
            personaID: '=ngModel',
            cacheBuster: '=ngCache',
            resetToken:'=?resetToken',
        },
        // Replace the div with our template
        templateUrl: 'admin-persona-image-replace/persona-image-replace-form.html',
        // controller: 'PersonaImageReplaceController',
        link: function($scope, $element, $attr) {


            $scope.settings = {
                state:'ready',
            }

            var fileInput;

            ///////////////////////////////////////////

            $scope.$watch('settings.state', function(state) {

                if(fileInput) {
                    fileInput.off('change')
                }


                // if(state == 'ready') {
                    fileInput = $element.find('#file');
                    fileInput.on('change', fileSelected)
                    console.log('Found File Input!');
                // }
            })


            $scope.$on('$destroy', function(){
                if(fileInput) {
                    fileInput.off('change')
                }
            })
           


            ///////////////////////////////////////////

            function uploadComplete(res) {
                $scope.settings.state = 'complete';
                console.log('uploadCompleted', res);

                $timeout(function() {


                if(!$scope.cacheBuster) {
                    $scope.cacheBuster = 1;
                }

                $scope.cacheBuster++;

                })
            }

            ///////////////////////////////////////////

            function uploadFailed(err) {
                $scope.settings.state = 'error';
                $scope.settings.errorMessage = err.data;
                console.log('UPLOAD FAILED', err)
            }

            ////////////////////////////////////////////////////

            function fileSelected(event) {

                $scope.settings.state = 'processing';

                //Create new formData object
                var formData = new FormData();
                formData.append('file', fileInput[0].files[0]);

                ///////////////////////////////////////////

                //URL to send to
                var uploadURL = Fluro.apiURL + '/persona/' + $scope.personaID + '/image';

                if($scope.resetToken && $scope.resetToken.length) {
                    uploadURL += '?resetToken=' + $scope.resetToken;
                }

                //Make the request
                $http({
                        url: uploadURL,
                        method: "POST",
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        }
                    })
                    .then(uploadComplete, uploadFailed);
            }
        }
    }
});

/**
app.controller('PersonaImageReplaceController', function($scope, FluroContent, $http, Fluro) {

    $scope.photoReplace = {};

    /////////////////////////////////   
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////

    $scope.upload = function() {

        console.log('Select and upload')

        var fileInput = document.getElementById('file').files[0],
            fileReader = new FileReader();

        ///////////////////////////////////////////

        fileReader.onloadend = function(event) {
            var data = event.target.result;

            console.log('File Loaded');

            ///////////////////////////////////////////

            function uploadComplete(res) {
                console.log('uploadCompleted', res);
            }

            ///////////////////////////////////////////

            function uploadFailed(er) {
                console.log('UPLOAD FAILED', err)
            }

            ///////////////////////////////////////////

            var uploadURL = Fluro.apiURL + '/persona/' + $scope.personaID + '/image';

            $http.post(uploadURL, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity
            }).then(uploadComplete, uploadFailed);
        }

        ///////////////////////////////////////////

        fileReader.readAsBinaryString(fileInput);

    }



    // $scope.uploadFile = function(files) {

    //     console.log('Upload Files!', files);

    //     //Take the first selected file
    //     var fd = new FormData();
    //     fd.append("file", files[0]);


    //     var uploadURL = Fluro.apiURL + '/persona/' + $scope.model._id + '/image';

    //     ///////////////////////////////////////////

    //     function uploadComplete(res) {
    //         console.log('uploadCompleted', res);
    //     }

    //     ///////////////////////////////////////////

    //     function uploadFailed(er) {
    //         console.log('UPLOAD FAILED', err)
    //     }

    //     ///////////////////////////////////////////

    //     $http.post(uploadURL, fd, {
    //         // withCredentials: true,
    //         // headers: {'Content-Type': undefined },
    //         transformRequest: angular.identity
    //     }).then(uploadComplete, uploadFailed);



    // };



    /////////////////////////////////

    $scope.showReplaceDialog = function() {
        $scope.photoReplace.show = true;
    }

    /////////////////////////////////

});

/**/