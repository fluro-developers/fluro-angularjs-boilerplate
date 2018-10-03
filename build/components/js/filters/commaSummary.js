
app.filter('commaSummary', function() {
    return function (arrayOfObjects, limit) {

        if(!limit) {
            limit = 20;
        }

        var names = _.chain(arrayOfObjects)
        .map(function(object) {
            return object.title;
        })
        .compact()
        .value();

        var string = names.join(', ');

        if(string.length >=limit) {
            string = string.substr(0,limit) + '...';
        }

        return string;
    }
})
