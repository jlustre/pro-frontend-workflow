(function(){
	//make it a habit to encapsulate all codes with this
})();

//**********************************************

var myApp = angular.module('myApp', ['anyModule1', 'anyModule1'])
	//controlle template
	.controller('myController', ['$scope'
		function($scope) {

	}])

	//directive as declarative
	.directive('myDirective', ['api',
		function(api) {
			return function($scope, $element, $attributes) {
				$scope.retweet = function () {
					api.retweet($scope.tweet);//
				};
				$scope.reply = function () {
					api.replyTo($scope.tweet);
				};
			};
		}

	])

<!-- HTML portion -->
<p ng-repeat="tweet in tweets" tweet>
<!-- ng-click allows us to bind a click event to a function on the $scope object -->
@{{tweet.author}}: {{tweet.text}}
<span ng-click="retweet()">RT</span> |
<span ng-click="reply()">Reply</span>
</p>

By adding the tweet attribute to the paragraph tag, we tell Angular that this element
should use the tweet directive, which gives us access to the published methods, as
well as anything else we later decide to attach to the $scope object.

//***********************************************************

//template directives
angular.module('myApp.directives', [])
.directive('myAwesomeDirective', ['api', function(api) {
	//Do any one-time directive initialization work here
	return {
		priority : 10,
		terminal : false,
		template: '<div><h3>{{title}}</h3></div>',
		templateUrl : 'myDirective.html',
		replace : true,
		compile : function (element, attributes, transclude) {},
		link : function ($scope, $element, $attrs) {},
		scope : true,
		controller : function ($scope, $element, $attrs) {},
		require : 'myAwesomeDirective',
		transclude : true
	};
}]);

//priority
priority option, which allows us to specify in what order directives should be executed, if there are multiple directives on the
same node. Default is 0;
//Terminal
Closely tied to priority, terminal dictates whether or not directive execution should stop after the priority level.
//Templating
If your directive provides a custom HTML structure, you can use the template or templateUrl property to define it. 
These templates can also contain other directives nested within them, and those will be initialized and attached as 
part of your directives compilation process as well.

//Replace
Use of the replace property specifies whether the whole element should be replaced with the template, or if the template 
HTML should just replace the elements inner HTML. If you do choose to replace the entire element, note that Angular will do its
best to copy over all of the classes/attributes from the original element, including merging the class attributes together. 
Additionally, if you want to replace the original element, your template must have only one root node. 
If you try to use a template with multiple root nodes (such as <h2>{{title}}</h2><div>{{content}}</div>), 
Angular will throw an error as there is no way to migrate the attributes over consistently.

//Compiling and linking
The compile and link properties do the bulk of the DOM manipulation and the plugin binding work. You can think of compile 
as performing any tasks that require restructuring the DOM (and possibly adding other directives) regardless of the specific 
scope, and the link function as attaching a scope to that compiled element.
--both are returning a function

If you set a value for the compile property, Angular will ignore the link property. If you need to use both, you can 
return an object from the compile function, with pre set to your compile function, and post set to your link function,
as demonstrated in the following code:.
		//Ex.
		angular.directive('myAwesomeDirective', function () {
			return {
				compile : function (tElement, tAttrs, transclude) {
					pre : function compile ($scope, $element, $attrs) {},
					post : function link ($scope, $element, $attrs) {}
				}
			}
		});

//Scope
scope= true;  //inherit from parents but when changed the parent scope does not change
scope= false; //all are inherited from parents
scope= {}; //referred to isolate scope, nothing inherited from parent, can still access the parent or root scopes by using the $parent and
           //$root properties
While there are a few instances where we want our directive to be entirely isolated, more commonly we will want to maintain access to 
a few explicitly specified properties and methods from the ancestral scope tree. To do this, Angular provides three symbols for 
notating what type of access you want to acquire: @, =, and &, which are prepended to the attribute names that you want to derive 
a value from. As such, we can create an isolate scope that looks like this:
	scope : {
		'myReadonlyVariable' : '@myStringAttr',
		'myTwowayVariable' : '=myParentProperty', //this method of binding is identical to a false scope property,
		'myInternalFunction' : '&myParentFunction'
	}; 

If left undefined, the scope value is null, which tells Angular to give the directive the same scope as the object its attached to.
First, simply set the scope parameter to true, which will create a new scope for the directive, but still inherit from its parent. 
This means you will still be able to read all of the values from your parent scope, including adding any new watchers to monitor 
data changes, but new values you write onto the scope wont affect the parent scopes values.
Secondly, if you want to isolate your directive from the rest of your application, you can create an aptly named isolate scope. 
This scope can be helpful in ensuring modularity and preventing accidental changes to data outside of your directive caused by 
shared properties or methods. To create an isolate scope, simply pass in an object hash to the scope parameter. If its
empty, no values will be inherited and your scope will be completely isolated.

Each DOM element can only have one scope applied to it, which means that if you set scope : true for multiple directives on the 
same node, they will all share the same new scope. While this is usually fine, do note that only one directive on a node can 
request an isolate scope, and all other directives will share that scope, so be careful with declaring an isolated scope too often, 
particularly if you intend to share this module with other developers who might need to isolate their own directives as well.

//controller and require
The controller function can store many of the same properties or methods that you might normally attach to the scope discussed 
earlier, however, if they are attached to the controller itself, they can be shared with other directives in the DOM tree. 
This sharing is done via the require property, which tells Angular to grab the instance of one directives controller and make 
it available to another directive.

//Sample

angular.directive('autocompleteInput', function () {
	return {
		require : 'ngModel',
		link : function ($scope, $element, $attrs, ngModel) {
			ngModel.$render = function () {
				$element.val(ngModel.$viewValue || '');
			};
			$element.autocomplete({
				… //Define source, etc
				select : function (ev, ui) {
					$scope.$apply(function() {
						ngModel.$setViewValue(ui.item.value);
					});
				}
			});
		}
	}
});

//***********************************************************

//Declaring a module
angular.module('myApp.directives', [])
.directive('myAwesomeDirective', ['api', function(api) {
	//Do any one-time directive initialization work here
	return function($scope, $element, $attrs) {
			//Do directive work that needs to be applied to each instance here
	};
}]);

The ngModel controller provides multiple methods and properties, but for our purposes we only need two, $render and $setViewValue(). 
The ngModel directive calls $render whenever the value of the data element that it is bound to (data. property in the preceding code) 
changes. Thus, once we assign our custom function to the $render key, any time the data changes, we can update the input value 
appropriately. $setViewValue works in the opposite direction, so when the user does something that should change the value, 
we can tell ngModel what the new value is and it will update the internal data model.

//transclude
Transclusion. In short, transclusion provides the ability to have an isolate scope as we discussed earlier, and still have
access to the parent scopes properties for internal content.