(function(){
	var myApp =angular.module('myApp', ['ngResource']);
	var prices = [];

    myApp.factory('appsData', function ($http, $log, $resource) {
    	var temp = $resource('https://itunes.apple.com/us/rss/toppaidapplications/limit=100/json', {},
	    {
	     get: {method:'GET', isArray:true},
	    });
	    return temp;
    });

    myApp.controller('AppsController', 
		function AppsController($scope, appsData) {
			$scope.sortOrder = "name";
			var resultcount = { };
			var myTotal = 0;
			$scope.apps = [];
			appsData.get({}, function(response) {
				$scope.apps = response;
				$scope.author = $scope.apps[0]['author'];
				$scope.app = $scope.apps[0]['entry'];
				$scope.newlist = []; // main object
				var container = {};
				var prices = [];
				for(var i=0; i < $scope.app.length; i++) {
					var price = $scope.app[i]['im:price']['label'];
					container[i] = {
						name: $scope.app[i]['im:name']['label'],
						imgsrc1: $scope.app[i]['im:image'][1]['label'],
						imgheight1: $scope.app[i]['im:image'][1]['attributes']['height'],
						releaseDate: $scope.app[i]['im:releaseDate']['label'],
						price: price,
						category: $scope.app[i]['category']['attributes']['term']
					}
					
					prices[i] = price;
					if(!resultcount[price]) resultcount[price] = 0;
				    ++resultcount[price];
				    myTotal++; 
				}
				//$scope.newlist = container; 
				for(var key in container){
					$scope.newlist[key]=container[key];
				}
				$scope.prices = prices;
				
				console.log($scope.newlist);
				var unique = $scope.prices.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
				console.log(unique);
				console.log(resultcount);

				var canvas = $('#exampleCanvas'),
		    	context = canvas.getContext('2d');

		    	function getCanvasWidth() {
		    		var containerWidth = $('.container').outerWidth(false)-30;
		    		//$('#cwidth').html('Canvas Width = ' + containerWidth);		    		
		    		return parseInt(containerWidth)-2;
		    	}
		    	
		    	function getCanvasHeight(cwidth) {
		    		var h = (cwidth >= 300) ? 320 : window.innerWidth * .4 - 2 ;
		    		//$('#cheight').html('Canvas Height = ' + h);
		    		return parseInt(h);
		    	}

		    	resizeCanvas();

		    	function resizeCanvas() {
		    		var canvas.width = getCanvasWidth();
		    		var canvas.height = getCanvasHeight(canvas.width);
		    		drawStuff();
		    	}

			    function drawStuff() {
					var lastend = 0;
					var myColor = ["#ECD078","#53777A","#aa2222","#e29418","#a218e2","#b593c5","#1c60b4","#1ca4b4","#40ff40","#dd7f7f"]; 
					var centerX = canvas.width/2;
					var centerY = canvas.height/2;
					var radius = canvas.height/2 - canvas.height/2 * .1;

					var i = 0;
					$.each(resultcount, function(key, value) {
					    context.fillStyle = myColor[i];
					    //context.fillStyle = getRandomColor();
					    context.beginPath();
					    context.moveTo(canvas.width/2,canvas.height/2);
					    // Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
					    context.arc(centerX,centerY,radius,lastend,lastend+(Math.PI*2*(parseInt(value)/myTotal)),false);
					    context.lineTo(canvas.width/2,canvas.height/2);
					    context.fill();
					    lastend += Math.PI*2*(parseInt(value)/myTotal);
					    i++;				     
					});
					var i = 0;
					var legY = 10;
					$.each(resultcount, function(key, value) {
					   context.beginPath();
				       context.rect(10, legY, 10, 10);
				       context.fillStyle = myColor[i];
					   context.fill();
				       context.fill();
				       context.lineWidth = 1;
				       context.strokeStyle = myColor[i];
				       context.stroke();
				       context.font = '1em Calibri';
	                   context.fillStyle = 'blue';
	                   context.fillText(key + ' ('+value+')', 25, legY+10);
					   legY += 15;
					   i++;
					});
				}
				
				//document.addEventListener('mouseover', resizeCanvas, false);
				window.addEventListener('resize', resizeCanvas, false);
		
			})
					
			function getRandomColor() {
				return '#' + Math.random().toString(16).substring(2, 8);
			}
		}
	);

})();

