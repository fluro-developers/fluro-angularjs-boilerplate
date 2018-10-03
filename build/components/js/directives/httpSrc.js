
function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

app.directive('httpSrc', function($http) {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var requestConfig = {
                method: 'get',
                url: attrs.httpSrc,
                responseType: 'arraybuffer',
                cache: 'true'
            };

            $http(requestConfig).then(function(res) {
               var b64 = _arrayBufferToBase64(res.data);

                attrs.$set('src', "data:image/jpeg;base64," + b64);
            }, function(err) {
                console.log('HTTP IMAGE LOAD ERROR', err);
            });
        }
    }
});


app.directive('httpBgSrc', function($http, Fluro) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var requestConfig = {
                method: 'get',
                url: attrs.httpBgSrc,
                responseType: 'arraybuffer',
                cache: 'true'
            };
            $http(requestConfig)
                .then(function(res) {
                    var b64 = _arrayBufferToBase64(res.data);

                    element.css('backgroundImage', "url(data:image/jpeg;base64," + b64 + ')');
                }, function(err) {
                console.log('HTTP IMAGE LOAD ERROR', err);
            });
        },

    }
});