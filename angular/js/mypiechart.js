// Run the code when the DOM is ready
$( pieChart );

function pieChart() {

  // Config settings
  var chartSizePercent = 55;                        // The chart radius relative to the canvas width/height (in percent)
  var sliceBorderWidth = 1;                         // Width (in pixels) of the border around each slice
  var sliceBorderStyle = "#fff";                    // Colour of the border around each slice
  var sliceGradientColour = "#ddd";                 // Colour to use for one end of the chart gradient
  var maxPullOutDistance = 25;                      // How far, in pixels, to pull slices out when clicked
  var pullOutFrameStep = 4;                         // How many pixels to move a slice with each animation frame
  var pullOutFrameInterval = 40;                    // How long (in ms) between each animation frame
  var pullOutLabelPadding = 65;                     // Padding between pulled-out slice and its label  
  var pullOutLabelFont = "bold 16px 'Trebuchet MS', Verdana, sans-serif";  // Pull-out slice label font
  var pullOutValueFont = "bold 12px 'Trebuchet MS', Verdana, sans-serif";  // Pull-out slice value font
  var pullOutValuePrefix = "$";                     // Pull-out slice value prefix
  var pullOutShadowColour = "rgba( 0, 0, 0, .5 )";  // Colour to use for the pull-out slice shadow
  var pullOutShadowOffsetX = 5;                     // X-offset (in pixels) of the pull-out slice shadow
  var pullOutShadowOffsetY = 5;                     // Y-offset (in pixels) of the pull-out slice shadow
  var pullOutShadowBlur = 5;                        // How much to blur the pull-out slice shadow
  var pullOutBorderWidth = 2;                       // Width (in pixels) of the pull-out slice border
  var pullOutBorderStyle = "#333";                  // Colour of the pull-out slice border
  var chartStartAngle = -.5 * Math.PI;              // Start the chart at 12 o'clock instead of 3 o'clock

  // Declare some variables for the chart
  var canvas;                       // The canvas element in the page
  var currentPullOutSlice = -1;     // The slice currently pulled out (-1 = no slice)
  var currentPullOutDistance = 0;   // How many pixels the pulled-out slice is currently pulled out in the animation
  var animationId = 0;              // Tracks the interval ID for the animation created by setInterval()
  var chartData = [];               // Chart data (labels, values, and angles)
  var chartColours = [];            // Chart colours (pulled from the HTML table)
  var totalValue = 0;               // Total of all the values in the chart
  var canvasWidth;                  // Width of the canvas, in pixels
  var canvasHeight;                 // Height of the canvas, in pixels
  var centreX;                      // X-coordinate of centre of the canvas/chart
  var centreY;                      // Y-coordinate of centre of the canvas/chart
  var chartRadius;                  // Radius of the pie chart, in pixels

  // Set things up and draw the chart
  init();

  **
   * Set up the chart data and colours, as well as the chart and table click handlers,
   * and draw the initial pie chart
   */

  function init() {

    // Get the canvas element in the page
    canvas = document.getElementById('chart');

    // Exit if the browser isn't canvas-capable
    if ( typeof canvas.getContext === 'undefined' ) return;

    // Initialise some properties of the canvas and chart
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    centreX = canvasWidth / 2;
    centreY = canvasHeight / 2;
    chartRadius = Math.min( canvasWidth, canvasHeight ) / 2 * ( chartSizePercent / 100 );

    // Grab the data from the table,
    // and assign click handlers to the table data cells
    
    var currentRow = -1;
    var currentCell = 0;

    $('#chartData td').each( function() {
      currentCell++;
      if ( currentCell % 2 != 0 ) {
        currentRow++;
        chartData[currentRow] = [];
        chartData[currentRow]['label'] = $(this).text();
      } else {
       var value = parseFloat($(this).text());
       totalValue += value;
       value = value.toFixed(2);
       chartData[currentRow]['value'] = value;
      }

      // Store the slice index in this cell, and attach a click handler to it
      $(this).data( 'slice', currentRow );
      $(this).click( handleTableClick );

      // Extract and store the cell colour
      if ( rgb = $(this).css('color').match( /rgb\((\d+), (\d+), (\d+)/) ) {
        chartColours[currentRow] = [ rgb[1], rgb[2], rgb[3] ];
      } else if ( hex = $(this).css('color').match(/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/) ) {
        chartColours[currentRow] = [ parseInt(hex[1],16) ,parseInt(hex[2],16), parseInt(hex[3], 16) ];
      } else {
        alert( "Error: Colour could not be determined! Please specify table colours using the format '#xxxxxx'" );
        return;
      }

    } );

    // Now compute and store the start and end angles of each slice in the chart data

    var currentPos = 0; // The current position of the slice in the pie (from 0 to 1)

    for ( var slice in chartData ) {
      chartData[slice]['startAngle'] = 2 * Math.PI * currentPos;
      chartData[slice]['endAngle'] = 2 * Math.PI * ( currentPos + ( chartData[slice]['value'] / totalValue ) );
      currentPos += chartData[slice]['value'] / totalValue;
    }

    // All ready! Now draw the pie chart, and add the click handler to it
    drawChart();
    $('#chart').click ( handleChartClick );

    /**
   * Process mouse clicks in the chart area.
   *
   * If a slice was clicked, toggle it in or out.
   * If the user clicked outside the pie, push any slices back in.
   *
   * @param Event The click event
   */

  function handleChartClick ( clickEvent ) {

    // Get the mouse cursor position at the time of the click, relative to the canvas
    var mouseX = clickEvent.pageX - this.offsetLeft;
    var mouseY = clickEvent.pageY - this.offsetTop;

    // Was the click inside the pie chart?
    var xFromCentre = mouseX - centreX;
    var yFromCentre = mouseY - centreY;
    var distanceFromCentre = Math.sqrt( Math.pow( Math.abs( xFromCentre ), 2 ) + Math.pow( Math.abs( yFromCentre ), 2 ) );

    if ( distanceFromCentre <= chartRadius ) {

      // Yes, the click was inside the chart.
      // Find the slice that was clicked by comparing angles relative to the chart centre.

      var clickAngle = Math.atan2( yFromCentre, xFromCentre ) - chartStartAngle;
      if ( clickAngle < 0 ) clickAngle = 2 * Math.PI + clickAngle;
                  
      for ( var slice in chartData ) {
        if ( clickAngle >= chartData[slice]['startAngle'] && clickAngle <= chartData[slice]['endAngle'] ) {

          // Slice found. Pull it out or push it in, as required.
          toggleSlice ( slice );
          return;
        }
      }
    }

    // User must have clicked outside the pie. Push any pulled-out slice back in.
    pushIn();
  }