// app.filter('reword', function($rootScope) {
// 	return function (str) {

// 		// console.log('TEST', str, $rootScope.applicationData);

// 		var translations = _.get($rootScope.applicationData, 'translations');
// 		var replacement = _.find(translations, {from:str});

// 		if(replacement) {

// 			console.log('Replace', replacement.from, replacement.to);
// 			return str.replace(new RegExp(replacement.from, 'g'), replacement.to);
// 		} else {
// 			return str;
// 		}
// 	}
// });



 app.filter('reword', function($rootScope) {

 	console.log('Get Translations')
	var translations = _.get($rootScope.applicationData, 'translations');


      return function(string) {


      	//Loop through each translatedWord
   			_.each(translations, function(set) {

   				// console.log('REPLACE', set.from, string);
   				string = string.replace(new RegExp(set.from, 'g'), set.to);
   			});

   			// console.log('Replaced', string);

   			return string
    		
    		
		};





    });