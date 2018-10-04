app.service('CheckinEventService', function ($q, $rootScope, FluroContentRetrieval) {


	var service = {};

	/////////////////////////////////////////
	

	var request;

	service.reload = function(force) {

		if(request && !force) {
			return request;
		}

		/////////////////////////////////////////

		//Get start of today
        var thismorning = new Date();
        thismorning.setHours(0,0,0,0);

        // //Get end of today
        var tonight = new Date();
        tonight.setHours(23,59,0,0);

        //Find all events that are running today
        var queryDetails = {
            "_type":"event",
            "startDate": {
                "$lte": "date('"+tonight+"')"
            },
            "endDate": {
                "$gte": "date('"+thismorning+"')"
            },
        }


		/////////////////////////////////////////

		//Set status to processing
		service.processing = true;

		var requestOptions = {
			noCache:true,
		}

		//Now we make the request to the server
		request = FluroContentRetrieval.query(queryDetails, null, null, requestOptions, null);

		//Listen for the promise to resolve
        request.then(function(res) {

        	//Update the status
        	service.processing = false;

        	//Update the event list
            service.events = res;
           
           	console.log('EventService.reload complete', res);

           	//Kill off the request so we dont load more than we need to
           	request = null;

        }, function(err) {

        	//Update the status
        	service.processing = false;
            console.log('EventService.reload error', err);

            //Kill off the request so we dont load more than we need to
            request = null;
        });
		

	}

	/////////////////////////////////////////

	service.eventRequiresPin = function(event) {
		//check if the app needs a pin number
        var appNeedsPin = _.get($rootScope, 'appData.requirePin');
        //check if the event requires a pin number
        var eventNeedsPin = _.get(event, 'checkinData.requirePin');
        return (appNeedsPin || eventNeedsPin);
	}


	////////////////////////////////////////////////

    controller.eventIsOpen = function(event) {

        var now = new Date();

        //Get the checkin times
        var checkinTimes = service.getEventCheckinTimes(event);

        //Check whether we are within the checkin time for this event
        return ((now >= checkinTimes.startDate) && (now <= checkinTimes.endDate));
    }

	////////////////////////////////////////////////

    service.getEventCheckinTimes = function(event) {

        var startDate = new Date(event.startDate);
        startDate.setSeconds(0, 0);

        var endDate = new Date(event.endDate);
        endDate.setSeconds(0, 0);

        ///////////////////////////////////////////////////

        if (startDate.getTime() == endDate.getTime()) {
            //15 minutes
            var defaultEventLength = 60 * 60000;
            endDate = new Date(startDate.getTime() + defaultEventLength);
        }

        ///////////////////////////////////////////////////

        //30 minutes by default
        var checkinStartOffset = 90;
        var checkinEndOffset = 90;

        if (event.checkinData) {
            if (event.checkinData.checkinStartOffset) {
                checkinStartOffset = event.checkinData.checkinStartOffset;
            }

            if (event.checkinData.checkinEndOffset) {
                checkinEndOffset = event.checkinData.checkinEndOffset;
            }
        }

        ///////////////////////////////////////

        //Change the minutes to milliseconds
        checkinStartOffset = checkinStartOffset * 60000;
        checkinEndOffset = checkinEndOffset * 60000;

        //Get the dates with the offsets added
        startDate = new Date(startDate.getTime() - checkinStartOffset);
        endDate = new Date(endDate.getTime() + checkinEndOffset);

        return {
            startDate:startDate,
            endDate:endDate,
        };
    }

	/////////////////////////////////////////


	return service;

})