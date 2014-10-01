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
    	for(var i=0,len=charts[type][dataPoints].length;i<len;i++)
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
    	charts.linePlotTime=0;
    	charts.areaPlotTime=0;
    	charts.barPlotTime=0;
    	charts.fetchTime=0;
    	charts.processTime=0;
//Invoke GetData Function
        charts.getData(this.value);
    },
//Function to calculate average of plotting times 
    avgTime :function(type,dataPoints,totalLoadingTime)
    { 
    	var count=0;
    	var totalPlotTime=0;
    	var avgLoadingTime=0;
    	charts[type][dataPoints].push(totalLoadingTime);
        count=charts[type][dataPoints].length;
         for(var i=0;i<count;i++)
         	{
         	totalPlotTime+=charts[type][dataPoints][i];
         	}
         avgLoadingTime=totalPlotTime/count;
         avgLoadingTime=Math.round(avgLoadingTime*100)/100;
         return avgLoadingTime;
    },
// getData function to fetch json data using ajax call
    getData : function (filename) {
    	var that = this;
    	that.startTime = new Date().getTime();
    	try {
            var selectBoxValue=$('.selectBox').val();
//Call Ajax Function to fetch json data
            $.ajax({
                url: "data/" + filename + ".json",
                dataType: 'json',
                async: false,
                cache: false,
                success: function (json, status) {
                    charts.fetchTime = new Date().getTime() - that.startTime;
                    if (status != "success") {
                        console.log("Error loading data");
                        return;
                    }
//Display fetching time in table
               	 	if (selectBoxValue == "data_1000") {
                        $(".data-1000-table .fetchTime").html(charts.fetchTime);
                    } else if (selectBoxValue == "data_2500") {
                    	 $(".data-2500-table .fetchTime").html(charts.fetchTime);
                    } else if (selectBoxValue == "data_5000") {
                    	 $(".data-5000-table .fetchTime").html(charts.fetchTime);
                    } else if (selectBoxValue == "data_7500") {
                    	 $(".data-7500-table .fetchTime").html(charts.fetchTime);
                    }else if (selectBoxValue == "data_10000") {
                    	 $(".data-10000-table .fetchTime").html(charts.fetchTime);          
                    }
//Invoke ProcessData function
                    charts.processData(json.data);
                    setTimeout(that.completeProcess, 100);
                },
                error: function (result, status, err) {
                	console.log("Error loading data");
                    return;
                }
            });
        } catch (exception) {
            console.log("Get Data Error" + exception);
        }
       
      
    },
//Function to process json data and add to flotData array
    processData : function (jsonData) {
    	var that=this;
    	try {
        	var flotData=[];
            var selectBoxValue=$('.selectBox').val();
            var dataSize = jsonData.length;
            var currentDate = "";
            for (var index = 0; index < dataSize; index++) {
                currentDate = jsonData[index][0].split("-");
                flotData.push([Date.UTC(currentDate[2], months[currentDate[1].toLowerCase()], currentDate[0]), parseInt(jsonData[index][1])]);
            }
            charts.processTime = new Date().getTime() - that.startTime;
            charts.processTime=charts.processTime-charts.fetchTime;
//Display processing time in table
            if (selectBoxValue == "data_1000") {
                $(".data-1000-table").find(".processTime").html(charts.processTime);
            } else if (selectBoxValue == "data_2500") {
            	 $(".data-2500-table").find(".processTime").html(charts.processTime);
            } else if (selectBoxValue == "data_5000") {
            	 $(".data-5000-table").find(".processTime").html(charts.processTime);
            } else if (selectBoxValue == "data_7500") {
            	 $(".data-7500-table").find(".processTime").html(charts.processTime);
            }else if (selectBoxValue == "data_10000") {
            	 $(".data-10000-table").find(".processTime").html(charts.processTime);          
            }
//Invoke genLineChart function          
            charts.genLineChart(flotData);
//Invoke genAreaChart function 
            charts.genAreaChart(flotData);
//Invoke genBarChart function 
            charts.genBarChart(flotData);
        } catch (exception) {
            console.log("Process Data Error");
        }
    },
    completeProcess:function(){
    	var that=this;
    	var avgLoadingTime=0;
    	
    	var selectBoxValue=$('.selectBox').val();
    	that.lineStartTime = charts.lineStartTime;
        charts.linePlotTime = new Date().getTime() - that.lineStartTime;
        that.linePlotTime = charts.linePlotTime;
        charts.areaPlotTime = new Date().getTime() - charts.areaStartTime;
        that.areaPlotTime = charts.areaPlotTime;
        charts.barPlotTime = new Date().getTime() - charts.barStartTime;
        that.barPlotTime = charts.barPlotTime;
        var totalLineLoadingTime=charts.fetchTime+charts.processTime+that.linePlotTime;
    	var totalAreaLoadingTime=charts.fetchTime+charts.processTime+that.areaPlotTime;
    	var totalBarLoadingTime=charts.fetchTime+charts.processTime+that.barPlotTime;
        	var table1=$(".line-chart-table");
        if (selectBoxValue == "data_1000") {
        	avgLoadingTime=charts.avgTime("line","1000",totalLineLoadingTime);
        	table1.find(".data-1000-table .plotTime").html(that.linePlotTime);
        	table1.find(".data-1000-table .totalLoadingTime").html(totalLineLoadingTime);
        	table1.find(".data-1000-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_2500") {
        	avgLoadingTime=charts.avgTime("line","2500",totalLineLoadingTime);
        	table1.find(".data-2500-table .plotTime").html(that.linePlotTime);
        	table1.find(".data-2500-table .totalLoadingTime").html(totalLineLoadingTime);
        	table1.find(".data-2500-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_5000") {
        	avgLoadingTime=charts.avgTime("line","5000",totalLineLoadingTime);
        	table1.find(".data-5000-table .plotTime").html(that.linePlotTime);
        	table1.find(".data-5000-table .totalLoadingTime").html(totalLineLoadingTime);
        	table1.find(".data-5000-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_7500") {
        	avgLoadingTime=charts.avgTime("line","7500",totalLineLoadingTime);
        	table1.find(".data-7500-table .plotTime").html(that.linePlotTime);
        	table1.find(".data-7500-table .totalLoadingTime").html(totalLineLoadingTime);
        	table1.find(".data-7500-table .avgLoadingTime").html(avgLoadingTime);
        }else if (selectBoxValue == "data_10000") {
        	avgLoadingTime=charts.avgTime("line","10000",totalLineLoadingTime);
        	table1.find(".data-10000-table .plotTime").html(that.linePlotTime);
        	table1.find(".data-10000-table .totalLoadingTime").html(totalLineLoadingTime);
        	table1.find(".data-10000-table .avgLoadingTime").html(avgLoadingTime);
        }
        	var table2=$(".area-chart-table");
        if (selectBoxValue == "data_1000") {
        	avgLoadingTime=charts.avgTime("area","1000",totalAreaLoadingTime);
        	table2.find(".data-1000-table .plotTime").html(that.areaPlotTime);
        	table2.find(".data-1000-table .totalLoadingTime").html(totalAreaLoadingTime);
        	table2.find(".data-1000-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_2500") {
        	avgLoadingTime=charts.avgTime("area","2500",totalAreaLoadingTime);
        	table2.find(".data-2500-table .plotTime").html(that.areaPlotTime);
        	table2.find(".data-2500-table .totalLoadingTime").html(totalAreaLoadingTime);
        	table2.find(".data-2500-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_5000") {
        	avgLoadingTime=charts.avgTime("area","5000",totalAreaLoadingTime);
        	table2.find(".data-5000-table .plotTime").html(that.areaPlotTime);
        	table2.find(".data-5000-table .totalLoadingTime").html(totalAreaLoadingTime);
        	table2.find(".data-5000-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_7500") {
        	avgLoadingTime=charts.avgTime("area","7500",totalAreaLoadingTime);
        	table2.find(".data-7500-table .plotTime").html(that.areaPlotTime); 
        	table2.find(".data-7500-table .totalLoadingTime").html(totalAreaLoadingTime);
        	table2.find(".data-7500-table .avgLoadingTime").html(avgLoadingTime);
        }else if (selectBoxValue == "data_10000") {
        	avgLoadingTime=charts.avgTime("area","10000",totalAreaLoadingTime);
        	table2.find(".data-10000-table .plotTime").html(that.areaPlotTime);
        	table2.find(".data-10000-table .totalLoadingTime").html(totalAreaLoadingTime);
        	table2.find(".data-10000-table .avgLoadingTime").html(avgLoadingTime);
        }
        	var table3=$(".bar-chart-table");
        if (selectBoxValue == "data_1000") {
        	avgLoadingTime=charts.avgTime("bar","1000",totalBarLoadingTime);
        	table3.find(".data-1000-table .plotTime").html(that.barPlotTime);
        	table3.find(".data-1000-table .totalLoadingTime").html(totalBarLoadingTime);
        	table3.find(".data-1000-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_2500") {
        	avgLoadingTime=charts.avgTime("bar","2500",totalBarLoadingTime);
        	table3.find(".data-2500-table .plotTime").html(that.barPlotTime);
        	table3.find(".data-2500-table .totalLoadingTime").html(totalBarLoadingTime);
        	table3.find(".data-2500-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_5000") {
        	avgLoadingTime=charts.avgTime("bar","5000",totalBarLoadingTime);
        	table3.find(".data-5000-table .plotTime").html(that.barPlotTime);
        	table3.find(".data-5000-table .totalLoadingTime").html(totalBarLoadingTime);
        	table3.find(".data-5000-table .avgLoadingTime").html(avgLoadingTime);
        } else if (selectBoxValue == "data_7500") {
        	avgLoadingTime=charts.avgTime("bar","7500",totalBarLoadingTime);
        	table3.find(".data-7500-table .plotTime").html(that.barPlotTime); 
        	table3.find(".data-7500-table .totalLoadingTime").html(totalBarLoadingTime);
        	table3.find(".data-7500-table .avgLoadingTime").html(avgLoadingTime);
        }else if (selectBoxValue == "data_10000") {
        	avgLoadingTime=charts.avgTime("bar","10000",totalBarLoadingTime);
        	table3.find(".data-10000-table .plotTime").html(that.barPlotTime);
        	table3.find(".data-10000-table .totalLoadingTime").html(totalBarLoadingTime);
        	table3.find(".data-10000-table .avgLoadingTime").html(avgLoadingTime);
        }
    	return false;
    },

//Function to create line chart structure and draw the line plot
    genLineChart : function (flotData) {
    	var that = this;
    	that.lineStartTime = new Date().getTime();
        try {
            var chartOptions = {
                xaxis: {
                    mode: "time",
                    timeformat: "%e %b %Y",
                    axisLabel: "Data Range",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                    axisLabelPadding: 7
                },
                yaxis: {
                    axisLabel: "Data Points",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                    axisLabelPadding: 5
                },
                grid: {
                    hoverable: true
                },
                tooltip: true,

            };
            var plotData = [{
                color: "#252525",
                label: "Yearly yield",
                data: flotData

            }];
	   $.plot("#lineChartPlaceholder", plotData, chartOptions);

        } catch (exception) {
            console.log("Generate Line Graph Error");
        }
    },
//Function to create area chart structure and draw the area plot
    genAreaChart : function (flotData) {
    	var that = this;
    	that.areaStartTime = new Date().getTime();
        try {
            var chartOptions = {
                xaxis: {
                    mode: "time",
                    timeformat: "%e %b %Y",
                    axisLabel: "Data Range"
                },
                yaxis: {
                    min: 0,
                    max: 125000,
                    axisLabel: "Data Points"

                },
                grid: {
                    hoverable: true,
                },
                series: {
                    lines: {
                        show: true,
                        fill: true,
                        fillColor: {
                            colors: [{
                                opacity: 0.7
                            }, {
                                opacity: 0.1
                            }]
                        }
                    },
                    points: {
                        show: false,

                    }
                },
                legend: {
                    backgroundOpacity: 0.5,
                    noColumns: 0
                },
                tooltip: true
            };
            var plotData = [{
                color: "#89A54E",
                label: "Yearly yield",
                data: flotData
            }];

            $.plot("#areaChartPlaceholder", plotData, chartOptions);

        } catch (exception) {
            console.log("Generate Area Graph Error");
        }
    },
//Function to create bar chart structure and draw the bar plot
    genBarChart : function (flotData) {
    	var that = this;
    	that.barStartTime = new Date().getTime();
        try {
            var chartOptions = {
            	 
                xaxis: {
                    mode: "time",
                    timeformat: "%e %b %Y"
                },
                yaxis: {
                    min: 0,
                    max: 125000,
                    axisLabel: "Data Points"
                },
                grid: {
                    hoverable: true,
                   
                },
                series: {
                	
                    bars: {
                        show: true,
                        fill: true,
                        fillColor: {
                            colors: [{
                                opacity: 0.7
                            }, {
                                opacity: 0.1
                            }]
                        }
                    },
                    points:{
                    	show:false
                    }
                   
                },
                  legend: {
                    backgroundOpacity: 0.5,
                    noColumns: 0
                },
               tooltip: true,
            };
            var plotData = [{
                color: "#2E64FE",
                label: "Yearly yield",
                data: flotData
            }];

            $.plot("#barChartPlaceholder", plotData, chartOptions);

        } catch (exception) {
            console.log("Generate Bar Graph Error");
        }
    }


}
charts.init();

