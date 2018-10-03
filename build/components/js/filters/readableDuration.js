app.filter('readableDuration', function() {


    // return function convertTime(seconds) {


    //     var time = seconds;
    //     // time = parseInt(time / 60);

    //     var minutes = time % 60;
    //     time = parseInt(time / 60);

    //     var hours = time % 24;
    //     var out = "";

    //     if (hours && hours > 0) out += hours + " " + ((hours == 1) ? "hr" : "hrs") + " ";
    //     if (minutes && minutes > 0) out += minutes + " " + ((minutes == 1) ? "min" : "mins") + " ";
    //     if (seconds && seconds > 0) out += seconds + " " + ((seconds == 1) ? "sec" : "secs") + " ";

    //     return out.trim();
    // }


    return  function(duration) {
        var hour = 0;
        var min = 0;
        var sec = 0;

        if (duration) {
            if (duration >= 60) {
                min = Math.floor(duration / 60);
                sec = duration % 60;
            } else {
                sec = duration;
            }

            if (min >= 60) {
                hour = Math.floor(min / 60);
                min = min - hour * 60;
            }

            // if (hour < 10) {
            //     hour = '0' + hour;
            // }
            // if (min < 10) {
            //     min = '0' + min;
            // }
            // if (sec < 10) {
            //     sec = '0' + sec;
            // }
        }

        var out = '';

        if(hour) {
        	out += hour + ' hr';
        	if(hour > 1) {
        		out += 's ';
        	} else {
        		out += ' ';
        	}
        }

        if(min) {
        	out += min + ' min';
        	if(min > 1) {
        		out += 's ';
        	} else {
        		out += ' ';
        	}
        }

        if(sec && !hour) {
        	out += sec + ' sec';
        	if(sec > 1) {
        		out += 's ';
        	} else {
        		out += ' ';
        	}
        }

        return out.trim();
    }





});