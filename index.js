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

function currentTimeAngles(timeOffset){
    //timeMultiplier = $("#speedInput").sl;
    //console.log(timeMultiplier);
    let times = {"hour":0, "minute":0, "second":0};

    //split unix time into segments
    times.second = Math.floor(Date.now() / (1000/timeMultiplier));
    times.minute = Math.floor(times.second / 60);
    times.hour = Math.floor(times.minute / 60);

    //account for time zone changes
    times.hour += timeOffset;

    //triple equals is never true after the val is changed
    if(timeMultiplier == 1) {
        //override hour with local time because currently broken
        times.hour = new Date().getHours();
    }

    //convert segments into rotational values
    times.second = (times.second % 60) * 6;
    times.minute = (times.minute % 60) * 6;
    times.hour = (times.hour % 24) * 15;
    return times;
};

async function updateClock() {
    let timeAngles = currentTimeAngles(timeOffset);

    //apply rotations to all clocks while knowing how many there are
    for(let row = 0; row < numClocksVert; row++){
        for(let col = 0; col < numClocksHoriz; col++){
            //sometimes the internal objects won't be clocks, so I'll check for that
            if(document.getElementById("clock-"+row+"-"+col)){
                setHands("clock-"+row+"-"+col,timeAngles.hour,timeAngles.minute,timeAngles.second);
            }
        }
    }

    //asynchronously repeat forever
    setTimeout(() => updateClock(), tickSpeed);
};

function setHands(id, h, m, s){
    //console.log(document.getElementById(id));
    let hour = document.getElementById(id).firstChild.nextSibling.firstChild.nextSibling.nextSibling.nextSibling;
    let minute = hour.nextElementSibling;
    let second = minute.nextElementSibling;
    hour.style.transform = 'rotate(' + h + 'deg)';
    minute.style.transform = 'rotate(' + m + 'deg)';
    second.style.transform = 'rotate(' + s + 'deg)';
};

function createNewRow(rowNum){
    //naming convention is clocks-ROW
    let newRow = document.createElement("tr");
    newRow.id = "clocks-"+rowNum;
    return newRow;
};

function createNewCol(rowNum, colNum){
    //naming convention is clocks-ROW-COL
    let newCol = document.createElement("td");
    newCol.id = "clocks-"+rowNum+"-"+colNum;
    return newCol;
};

function setPadding(){
    //get window pixel values and convert to em because that's how I'm doing clock sizes
    let winXem = window.innerWidth/ parseFloat(
        getComputedStyle(
            document.querySelector('body')
        )['font-size']
    );
    let winYem = window.innerHeight/ parseFloat(
        getComputedStyle(
            document.querySelector('body')
        )['font-size']
    );

    //For some reason default padding is slightly off - maybe device/browser specific?
    //I think the slight misalignment is worth compatability with all screen and table sizes
    //this would fix it, but makes bigger tables go off screen
    //winYem -= 1.4;
    //winXem -= 1.4;

    //multiply number by 10 because they are 10em tall each
    //divide by 2 to split the padding on both sides (right/left and top/bottom)
    //may be changed or dynamically assigned based on screen size in the future
    //right now this only changes once at the start, so if the window isn't fullscreen and/or changes size it will break
    //running it with clock updates or when the browser detects a change in screen size could fix this problem
    let divVertPadding = (winYem-(numClocksVert*10))/2;
    let divHorizPadding = (winXem-(numClocksHoriz*10))/2;
    document.getElementById("clocks").style.margin = ""+divVertPadding+"em "+divHorizPadding+"em";

};

function setupClocks(){
    setPadding();

    //start at the first row
    let currentNode = document.getElementById("clocks-0");

    //draw the clocks
    //this is done in such a static table instead of through flexbox because I want to be able to change specific clock positions easily
    for(let rowNum = 0; rowNum < numClocksVert; rowNum++) {
        //Create the first col and set the currentNode to that first col, if needed
        if(!currentNode.firstChild) {
            currentNode.appendChild(createNewCol(rowNum, 0));
        }
        currentNode = currentNode.firstChild;

        for (let colNum = 0; colNum < numClocksHoriz; colNum++) {
            //create new clock and append to the col

            //I don't think I can do this one with children because it's looking for data, but innerHTML is a bit insecure
            currentNode.innerHTML = fullClockCode(rowNum, colNum);

            //the node is the first col in the row, so we must create a new col from the parent node
            //this whole thing is avoiding an off by 1 and/or if the table already exists
            if(colNum < numClocksHoriz-1) {
                //only make a new col if needed
                if(!currentNode.nextElementSibling) {
                    currentNode.parentNode.appendChild(createNewCol(rowNum, colNum + 1));
                }
                //navigate to the next column
                currentNode = currentNode.nextElementSibling;
            }
        }
        //the off by 1 in the loop and this is to avoid creating garbage extra columns
        currentNode.innerHTML = fullClockCode(rowNum, numClocksHoriz-1);

        //navigate to the current row
        currentNode = currentNode.parentNode;
        //create a new row, iff needed; avoids similar off by 1
        if(rowNum < numClocksVert-1) {
            //if there isn't already another row, make one
            if(!currentNode.nextElementSibling) {
                currentNode.parentNode.appendChild(createNewRow(rowNum + 1));
            }
            //navigate to the next row
            currentNode = currentNode.nextElementSibling;
        }
    }

    numClocks = numClocksHoriz*numClocksVert;
};


function getTableLocation(row, col){
    return document.getElementById("clocks-"+row+"-"+col);
};

function clearTableLocation(row, col){
    let tableSpot = getTableLocation(row, col);
    tableSpot.innerHTML = "";
    numClocks--;
};

function fillTableLocation(row, col, getTypeFunc){
    //getTypeFunc is a function to get the innerHTML of the desired inserted object
    let tableSpot = getTableLocation(row, col);
    tableSpot.innerHTML = getTypeFunc(row, col);
    numClocks++;
};

function toggleTableLocation(row, col, getTypeFunc){
    //I could implement this with the fillTableLocation and clearTableLocation functions but it would require calling getTableLocation multiple times
    let tableSpot = getTableLocation(row, col);
    if(tableSpot.innerHTML === ""){
        tableSpot.innerHTML = getTypeFunc(row, col);
        numClocks++;
    }
    else{
        tableSpot.innerHTML = "";
        numClocks--;
    }
};

function cycleColor(targetCell){
    let background = targetCell.firstChild.nextElementSibling.firstChild.nextElementSibling;
    let colorIndex = 0;
    //initially there is no backgroundColor attribute, so it defaults to index 0 in the list of colors
    if(background.style.backgroundColor){
        //if it's the last color, delete the clock instead of toggling
        if(colors.indexOf(background.style.backgroundColor) === colors.length-1){
            targetCell.innerHTML = "";
            numClocks--;
            return;
        }
        //if there is a background color attribute, find the next one in the list
        colorIndex = (colors.indexOf(background.style.backgroundColor) + 1) % colors.length;
    }
    //update the color to the new one
    background.style.backgroundColor = colors[colorIndex];
};

function clickColorHandler(e){
    if(freezeState){return;}

    let clicked = e.target;
    //if not actually clicking on the clock (clicking background space)
    if(clicked.className === ""){
        //add the clock back if it doesn't exist
        if(!clicked.firstChild){
            let row = clicked.id.split("-")[1];
            let col = clicked.id.split("-")[2];
            clicked.innerHTML = fullClockCode(row, col);
            numClocks++;
        }
        //or do nothing if it does exist and the user just didn't click it
        return;
    }

    //navigate up to the table location from whatever the target it
    while(clicked.className !== ""){
        clicked = clicked.parentNode;
    }

    cycleColor(clicked);
    checkSpecialEvents();
};

function checkSpecialEvents(){
    if (numClocks === 0){
        freezeState = true;
        setupClocks();
        bigRainbowClocks(0);
    }
};

function bigRainbowClocks(colorNum){
    if(colorNum < colors.length) {
        for (let row = 0; row < numClocksVert; row++) {
            for (let col = 0; col < numClocksHoriz; col++) {
                cycleColor(document.getElementById("clocks-" + row + "-" + col));
            }
        }
    }
    //if at end of array, end with 1 bigger sized sides for the clocks
    if(colorNum >= colors.length)
    {
        numClocksVert += 1;
        numClocksHoriz += 1;
        setupClocks();
        freezeState = false;
        return;
    }

    //otherwise continue
    colorNum++;
    //arbitrary 100ms between colors
    setTimeout(() => bigRainbowClocks(colorNum), 100);
};

function updateSpeed(){
    syncSpeed(document.getElementById('speed-input').value);
};


function updateSpeedManual(){
    syncSpeed(document.getElementById('speed-input-manual').value);
}

function syncSpeed(newSpeed){
    //sanitize
    if(isNaN(parseInt(newSpeed))){
        return;
    }
    timeMultiplier = newSpeed;

    //update all other parts of the website that reflect the speed
    document.getElementById("speed-input").value = timeMultiplier;
    document.getElementById("speed-input-manual").placeholder = timeMultiplier;
    document.getElementById("speed-input-manual").value = timeMultiplier;

    if(timeMultiplier == 1){
        document.getElementById('speed-label').textContent = "Time Multiplier | 1x | Real Time";
    }
    else {
        document.getElementById('speed-label').textContent = "Time Multiplier | " + timeMultiplier + "x | Not Real Time";
    }
}

function resetClocks(){
    document.getElementById('clocks').innerHTML ='<tr id=\"clocks-0\"></tr>';
    syncSpeed(1);
    setupClocks();
}

function hardResetClocks(){
    numClocksVert = 2;
    numClocksHoriz = 2;
    resetClocks();
}

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
});

//keep the table centered as the window gets moved
window.addEventListener("resize", function() {setPadding();});
