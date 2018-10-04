app.service('IdleTimeoutService', function($interval, NotificationService) {

    //Private variables
    var interval;
    var _defaultSecondsLeft = 60;

    ///////////////////////////////////////////////////////////

    var listeners = [];

    ///////////////////////////////////////////////////////////

    var service = {
        seconds: _defaultSecondsLeft,
    }

    service.addListener = function(func) {
        listeners.push(func);
    }

    service.removeListener = function(func) {
        _.pull(listeners, func);
    }

    ///////////////////////////////////////////////////////////

    function countdown() {

        if (service.seconds <= 0) {
            //Each function listening to the timer
            _.each(listeners, function(listener) {

                //Run the function
                listener();
            })

            return;
        }

        if (service.seconds < 10) {
            NotificationService.message('Restarting in ' + service.seconds, 'warning', 1000);
        }

        //take away one second
        service.seconds--;

        // console.log('Seconds left', service.seconds);
    }

    ///////////////////////////////////////////////////////////

    service.start = function() {
        if (interval) {
            return;
        }

        interval = $interval(countdown, 1000);
    }

    ///////////////////////////////////////////////////////////

    service.stop = function() {
        if (interval) {
            $interval.cancel(interval);
            interval = null;
        }
    }

    ///////////////////////////////////////////////////////////

    service.reset = function() {
        service.seconds = _defaultSecondsLeft;
    }

    ///////////////////////////////////////////////////////////

    return service;
});