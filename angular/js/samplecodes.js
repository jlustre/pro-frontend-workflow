(function(){
	//make it a habit to encapsulate all codes with this
})();

//**********************************************

var myApp = angular.module('myApp', ['anyModule1', 'anyModule1'])
	//controlle template
	.controller('myController', ['$scope'
		function($scope) {

	}])

	//directive template
	.directive('myDirective', ['api',
		function(api) {
			return function($scope, $element, $attributes) {

			};
		}

	])