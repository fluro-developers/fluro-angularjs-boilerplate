app.service('StalkerService', function() {

	var service = {
		trackedEvents:[],
		elapsed:0,
	};

	/////////////////////////////////////////

	service.reset = function() {
		service.trackedEvents = [];
		service.elapsed = 0;
	}

	/////////////////////////////////////////

	service.track = function(name, optionalData) {

		var event = {
			name:name,
			date:new Date(),
			duration:0,
			elapsed:0,
		}

        /////////////////////////////////////////

		//If there is already an event
		if(service.trackedEvents.length) {

			//Get the last event
			var lastEvent = service.trackedEvents[service.trackedEvents.length-1];

			if(lastEvent) {
				//Get the datetime of the last event
				var lastEventDate = moment(lastEvent.date);

				//And now
				var now = moment(event.date);

				//Find the difference between now and the last event date
	            var difference = now.diff(lastEventDate);

	            //Store the duration and the elapsed time
	            event.duration = difference;
	            event.elapsed = lastEvent.elapsed + difference;
	        }
        }

        /////////////////////////////////////////

		if(optionalData) {
			event.data = optionalData;
		}

		// console.log('STALKER', name, service.trackedEvents.length);
		service.trackedEvents.push(event)
	}

	/////////////////////////////////////////
	/////////////////////////////////////////


	return service;


});
