app.filter('dateInitials', function($rootScope) {

    return function(string) {

        switch (string) {
            case 'year':
                return 'yr'
                break;
            case 'day':
                return 'day'
                break;
            case 'week':
                return 'wk'
                break
            case 'month':
                return 'mo'
                break
            case 'once':
                return 'once'
                break
            default:
                return string[0] + string[1];
                break;
        }

    };
});