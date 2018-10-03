app.filter('filesize', function() {


     /*function calculateAge(birthday) { // birthday is a date
         var ageDifMs = Date.now() - birthday.getTime();
         var ageDate = new Date(ageDifMs); // miliseconds from epoch
         return Math.abs(ageDate.getUTCFullYear() - 1970);
     }
     */

     return function(bytes) { 
           var sizes = ['Bytes', 'kb', 'mb', 'gb', 'tb'];
		   if (bytes == 0) return '0 Byte';
		   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		   return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
     }; 
     
});

