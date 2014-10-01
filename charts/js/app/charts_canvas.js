'use strict';
 var charts = {
		 lineStartTime:0,
		 areaStartTime:0,
		 barStartTime:0,
		 startTime:0,
		 fetchTime:0,
		 processTime:0,
		 linePlotTime:0,
		 areaPlotTime:0,
		 barPlotTime:0,
line : {
		1000 : [],
		2500 : [],
		5000 : [],
		7500 : [],
		10000 : []
	},
	area : {
		1000 : [],
		2500 : [],
		5000 : [],
		7500 : [],
		10000 : []
	},
	bar : {
		1000 : [],
		2500 : [],
		5000 : [],
		7500 : [],
		10000 : []
	},
//First Function to be executed.
     init : function () {
        window.onload = charts.onWindowOnload;
     },
//Function to be executed during page onload event.
    onWindowOnload : function () {
    	try{
        $(".dialog").addClass("nt-hidden");
        $('.selectBox').val("data_1000");
//Invoke GetData Function to fetch data on page load
        charts.getData("data_1000");
        $(".avgLoadingTime").on("click",charts.displayAverageTime);
        $('.selectBox').on("change",charts.onChangeDataPoints);
    	}
    	catch (exception) {
            console.log(exception);
    	}
    },
 // Display popup to show plotting times on click of average time
    displayAverageTime : function(){
    	$("#dialog").dialog();
    	var dataPoints=$(this).closest("tbody").find("th").text();
    	var className=$(this).closest("table").attr('class').split(" ")[1];
    	var type=className.split("-")[0];
    	$("#dialog").find(".popup-chart-type").text(type +" "+ "chart");
    	$("#dialog").find(".popup-datapoints").text("("+dataPoints+" "+"data points)");
    	$("#dialog #popup-tbody").html("");
    	var ref=$("#popup-tbody");
    	for(var i=0;i<charts[type][dataPoints].length;i++)
    		{
    			var clone=$(".clone-table #popup-tr").clone();
    			clone.removeAttr("style");
    			clone.removeAttr("id");
    			clone.find(".popup-td1").text(i+1);
    			clone.find(".popup-td2").text(charts[type][dataPoints][i]);
    			ref.append(clone);
    		}
    	$(".dialog").removeClass("nt-hidden");
    },
//Invoke function when number of data points are changed in the dropdown
    onChangeDataPoints : function (event) {
    	 charts.linePlotTime = 0;
         charts.areaPlotTime = 0;
         charts.barPlotTime = 0;
         charts.fetchTime = 0;
         charts.processTime = 0;
         charts.lineStartTime = 0;
         charts.areaStartTime = 0;
         charts.barStartTime = 0;
         charts.startTime = 0;
//Invoke GetData Function
        charts.getData(this.value);
    },
//Function to calculate average of plotting times 
    avgTime :function(type,dataPoints,totalLoadingTime)
    { 
    	var count=0,avgLoadingTime=0;
    	try{
    	charts[type][dataPoints].push(totalLoadingTime);
        count=charts[type][dataPoints].length;
        totalLoadingTime=0;
         for(var i=0;i<count;i++)
         	{
        	 totalLoadingTime+=charts[type][dataPoints][i];
         	}
         avgLoadingTime=totalLoadingTime/count;
         avgLoadingTime=Math.round(avgLoadingTime*100)/100;
    	}catch(e){
    		console.log("Error in calculating average"+e);
    	}finally{
    		count=0,totalLoadingTime=0;
    	}
         return avgLoadingTime;
    },
// getData function to fetch json data using ajax call
    getData : function (filename) {
    	var that = this;
    	that.startTime = new Date().getTime();
    	try {
//Call Ajax Function to fetch json data
            $.ajax({
                url: "data/" + filename + ".json",
                dataType: 'json'
            }).done(function(resp, textStatus, jqXHR) {
            	 charts.fetchTime = new Date().getTime() - that.startTime;
                if (textStatus != "success") {
                	console.log("Error loading data");
                    return;
                }
//Display fetching time in table
                var selectedValue=$('.selectBox').val().split("_");
                selectedValue=selectedValue[0]+"-"+selectedValue[1];
                 $("."+selectedValue+"-table .fetchTime").html(charts.fetchTime);

//Invoke ProcessData function
                charts.processData(resp.data);
                setTimeout(that.completeProcess, 100);
            }).fail(function(jqXHR, textStatus, errorThrown) {
            	console.log("Error loading data");
                return;
            });
        } catch (exception) {
            console.log("Get Data Error" + exception);
        }finally {}
       
      
    },
//Function to process json data and add to flotData array
    processData : function (jsonData) {
    	  var that=this;
    	  var flotData, loopIndex, loopLength;
    	  var selectedValue=$('.selectBox').val().split("_");
    	  try {
    		 flotData = [];
             for (loopIndex = 0, loopLength = jsonData.length; loopIndex < loopLength; loopIndex++) {
            	 var dataObj=new Object();
          	   dataObj.label=jsonData[loopIndex][0];
          	   dataObj.y=jsonData[loopIndex][1];
                 flotData.push(dataObj);  
             }
            charts.processTime = new Date().getTime() - that.startTime;
            charts.processTime=charts.processTime-charts.fetchTime;
//Display processing time in table
            selectedValue=selectedValue[0]+"-"+selectedValue[1];
             $("."+selectedValue+"-table .processTime").html(charts.processTime);
//Invoke genLineChart function          
            charts.genLineChart(flotData);
//Invoke genAreaChart function 
            charts.genAreaChart(flotData);
//Invoke genBarChart function 
            charts.genBarChart(flotData);
            flotData = null;
        } catch (exception) {
            console.log("Process Data Error");
        }finally {
     //       currentDate = null;
            loopIndex = null;
            loopLength = null;
            selectedValue=null;
        }
        
    },
    completeProcess:function(){
    	var that=this;
    	var avgLoadingTime=0,totalLineLoadingTime,totalAreaLoadingTime,totalBarLoadingTime;
    	var selectValue=$('.selectBox').val().split("_"),selectedValue;
    	that.lineStartTime = charts.lineStartTime;
        charts.linePlotTime = new Date().getTime() - that.lineStartTime;
        that.linePlotTime = charts.linePlotTime;
        charts.areaPlotTime = new Date().getTime() - charts.areaStartTime;
        that.areaPlotTime = charts.areaPlotTime;
        charts.barPlotTime = new Date().getTime() - charts.barStartTime;
        that.barPlotTime = charts.barPlotTime;
        totalLineLoadingTime=charts.fetchTime+charts.processTime+that.linePlotTime;
    	totalAreaLoadingTime=charts.fetchTime+charts.processTime+that.areaPlotTime;
    	totalBarLoadingTime=charts.fetchTime+charts.processTime+that.barPlotTime;
    	
         selectedValue=selectValue[0]+"-"+selectValue[1];
          var table1 = $(".line-chart-table");
              avgLoadingTime = charts.avgTime("line",selectValue[1], totalLineLoadingTime);
              table1.find("."+selectedValue+"-table .plotTime").html(that.linePlotTime);
              table1.find("."+selectedValue+"-table .totalLoadingTime").html(totalLineLoadingTime);
              table1.find("."+selectedValue+"-table .avgLoadingTime").html(avgLoadingTime);
          
          var table2 = $(".area-chart-table");
              avgLoadingTime = charts.avgTime("area",selectValue[1], totalAreaLoadingTime);
              table2.find("."+selectedValue+"-table .plotTime").html(that.areaPlotTime);
              table2.find("."+selectedValue+"-table .totalLoadingTime").html(totalAreaLoadingTime);
              table2.find("."+selectedValue+"-table .avgLoadingTime").html(avgLoadingTime);
         
          var table3 = $(".bar-chart-table");
              avgLoadingTime = charts.avgTime("bar",selectValue[1], totalBarLoadingTime);
              table3.find("."+selectedValue+"-table .plotTime").html(that.barPlotTime);
              table3.find("."+selectedValue+"-table .totalLoadingTime").html(totalBarLoadingTime);
              table3.find("."+selectedValue+"-table .avgLoadingTime").html(avgLoadingTime);
         
    	return false;
    },

//Function to create line chart structure and draw the line plot
    genLineChart : function (flotData) {
    	var that = this;
    	that.lineStartTime = new Date().getTime();
        try {
        	 CanvasJS.addColorSet("lineGraphColor",["#000"]);
        	 var chart = new CanvasJS.Chart("lineChartPlaceholder", {
                 theme: "theme2",//theme1
                 colorSet: "lineGraphColor",
                 backgroundColor: "#fff",
                 title:{
                     text: "Line Chart"              
                },
                axisX:{
                	   labelAngle: -90
                	 },
                 data: [              
                 {
                     type: "line",
                     dataPoints: flotData
                 }
                 ]
             });
             chart.render();

        } catch (exception) {
            console.log("Generate Line Graph Error");
        }
    },
//Function to create area chart structure and draw the area plot
    genAreaChart : function (flotData) {
    	var that = this;
    	that.areaStartTime = new Date().getTime();
        try {
        	CanvasJS.addColorSet("areaGraphColor",["#89A54E"]);
        	var chart = new CanvasJS.Chart("areaChartPlaceholder", {
                theme: "theme2",//theme1
                colorSet: "areaGraphColor",
                title:{
                    text: "Area Chart"              
               },
               axisX:{
               	   labelAngle: -90
               	 },
                data: [              
                {
                    type: "area",
                    dataPoints: flotData
                }
                ]
            });
            chart.render();

        } catch (exception) {
            console.log("Generate Area Graph Error");
        }
    },
//Function to create bar chart structure and draw the bar plot
    genBarChart : function (flotData) {
    	var that = this;
    	that.barStartTime = new Date().getTime();
        try {
        	 CanvasJS.addColorSet("barGraphColor",["#2E64FE"]);
        	 var chart = new CanvasJS.Chart("barChartPlaceholder", {
                 theme: "theme2",//theme1
                 colorSet: "barGraphColor",
                 title:{
                     text: "Bar Chart"              
                },
                axisX:{
                	   labelAngle: -90
                	 },
                 data: [              
                 {
                     type: "column",
                     dataPoints: flotData
                 }
                 ]
             });
             chart.render();

        } catch (exception) {
            console.log("Generate Bar Graph Error");
        }
    }


}
$(function() {
	    charts.init();
});