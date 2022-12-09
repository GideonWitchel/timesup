/*
clock naming format is clock-ROW-COL, organized in a table
each table row is named clocks-ROW
each table col is named clocks-COL
ROW / COL is the number of th respective row or column
the table is called clocks
*/

//this is also the number of rows, because rows are seen as the number of clocks stacked vertically
let numClocksVert = 2;
//this is also the number of columns for the same reason
let numClocksHoriz = 2;

//if this is anything other than 1, the clocks will obviously not be accurate
let timeMultiplier = 1;

//6 is just UTC, temporary
const timeOffset = +12;

//How often the clocks will update to reflect the backend time (in milliseconds)
const tickSpeed = 50;

//for monitoring and triggering events based on the number of removed clocks if their positions are irrelevant
let numClocks = numClocksHoriz*numClocksVert;

//in menus and win stuff, don't trigger actions
let freezeState = false;

//I hate that this is RGB and not hex but that's how chrome displays it
//I need to match chrome for later comparisons when cycling
const colors = ["rgb(231, 76, 60)", "rgb(243, 156, 18)", "rgb(244, 208, 63)", "rgb(46, 204, 113)", "rgb(41, 128, 185)", "rgb(142, 68, 173)"];

//I know this isn't 100% secure, but it's really convenient for now
function fullClockCode(rowNum, colNum){
    //start the clock with the correct time
    let timeAngles = currentTimeAngles(timeOffset);
    return `
         <div class="clock" id="clock-`+rowNum+"-"+colNum+`">
             <div class="clock-main">
                 <div class="clock-center"></div>
                 <span class="clock-hour" style="transform: rotate(`+ timeAngles.hour +`deg);"></span>
                 <span class="clock-minute" style="transform: rotate(`+ timeAngles.minute +`deg);"></span>
                 <span class="clock-second" style="transform: rotate(`+ timeAngles.second +`deg);"></span>
             </div>
         </div>
         `;
};

window.addEventListener("load", function(){
    //fill the screen with clocks based on current number of pixels
    setupClocks();

    //set the clocks to the current time
    //this will asynchronously repeat forever
    updateClock();

    //cycle colors when clicked
    document.getElementById('clocks').addEventListener('click', clickColorHandler);
    //monitor speed slider
    document.getElementById('speed-input').addEventListener('change', updateSpeed);
    //monitor speed settings menu
    document.getElementById('speed-input-manual').addEventListener('change', updateSpeedManual);
    //monitor reset button
    document.getElementById('reset-button').addEventListener('click', resetClocks);
    //monitor hard reset button
    document.getElementById('hard-reset-button').addEventListener('click', hardResetClocks);
    //monitor music button
    document.getElementById('music-button').addEventListener('click', toggleMusic);
});

//keep the table centered as the window gets moved
window.addEventListener("resize", function() {setPadding();});
