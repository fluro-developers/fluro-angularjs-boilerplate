app.service('PrinterService', function($q, $rootScope, FluroContent) {


    var service = {

    };

    /////////////////////////////////////////

    var request;

    service.reload = function(force) {

        if (request && !force) {
            return request;
        }

        /////////////////////////////////////////

        //Set status to processing
        service.processing = true;

        request = FluroContent.endpoint('printer').query({
            noCache: true
        }).$promise;

        /////////////////////////////////////////

        //Listen for the promise to resolve
        request.then(function(res) {

            //Update the status
            service.processing = false;

            //Update the event list
            service.printers = res;

            console.log('PrinterService.reload complete', res);

            //Kill off the request
            request = null;

        }, function(err) {

            //Update the status
            service.processing = false;
            console.log('PrinterService.reload error', err);

            //Kill off the request
            request = null;
        });
    }

    ////////////////////////////////////////////////////////


    service.reprint = function(checkin) {

        if(checkin.reprinting) {
            return console.log('already reprinting');
        }

        if(!$localStorage.printStationID) {
            return console.log('No local storage printer id has been set');
        }

        checkin.reprinting = true;

        //////////////////////////////////

        var promise = FluroContent.endpoint('checkin/reprint/' + checkin._id).save({
            // printStationID:$localStorage.printStationID,
        }).$promise;

        //////////////////////////////////

        console.log('Reprint request made')
        promise.then(function(res) {
            console.log('Reprint complete')
            checkin.reprinting =false;
        }, function(err) {
            console.log('Reprint error', err)
            checkin.reprinting =false;
        })

    }




    /////////////////////////////////////////

    return service;

})