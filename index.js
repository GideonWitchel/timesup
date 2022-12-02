/*
clock naming format is clock-ROW-COL, organized in a table
each table row is named clocks-ROW
each table col is named clocks-COL
ROW / COL is the number of th respective row or column
the table is called clocks
*/

//6 is just UTC, temporary
const timeOffset = +12;

//milliseconds
const tickSpeed = 50;

//I hate that this is RGB and not hex but that's how chrome displays it
//I need to match chrome for later comparisons when cycling
const colors = ["rgb(231, 76, 60)", "rgb(243, 156, 18)", "rgb(244, 208, 63)", "rgb(46, 204, 113)", "rgb(41, 128, 185)", "rgb(142, 68, 173)", "#bbb"];
/*
const innercode = `
        <div class="clock-main">
            <div class="clock-center"></div>
            <span class="clock-hour" style="transform: rotate(0deg);"></span>
            <span class="clock-minute" style="transform: rotate(90deg);"></span>
            <span class="clock-second" style="transform: rotate(135deg);"></span>
        </div>
    `;
*/

//if this is anything other than 1, the clocks will not be accurate (obviously)
let timeMultiplier = 1;

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

//this is also the number of rows, because rows are seen as the number of clocks stacked vertically
const numClocksVert = 5;
//this is also the number of columns for the same reason
const numClocksHoriz = 9;

function currentTimeAngles(timeOffset){
    //timeMultiplier = $("#speedInput").sl;
    //console.log(timeMultiplier);
    let times = {"hour":0, "minute":0, "second":0}

    //split unix time into segments
    times.second = Math.floor(Date.now() / (1000/timeMultiplier));
    times.minute = Math.floor(times.second / 60);
    times.hour = Math.floor(times.minute / 60);

    //account for time zone changes
    times.hour = times.hour+timeOffset;

    //convert segments into rotational values
    times.second = (times.second % 60) * 6;
    times.minute = (times.minute % 60) * 6;
    times.hour = (times.hour % 24) * 15;
    return times;
};

async function updateClock() {
    let timeAngles = currentTimeAngles(timeOffset);

    /*
    //apply rotations to all clocks without knowing how many there are
    //only works if there are clocks in every position
    //I could fix it breaking rows with gaps via tombstones
    //but am opting to use for loops because we know the table parameters
    let row = 0;
    let col = 0;
    while(document.getElementById("clocks-"+row)){
        console.log("clock-"+row+"-"+col);
        console.log(document.getElementById("clock-"+row+"-"+col));
        while(document.getElementById("clock-"+row+"-"+col)) {
            console.log("setting")
            setHands("clock-" + row + "-" + col, h, m, s);
            col++;
        }
        col = 0;
        row++;
    }
    */

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

/*
function createNewClock(rowNum, colNum){
    //naming convention is clock-ROW-COL
    let newClock = document.createElement("div");
    newClock.classList.add("clock");
    newClock.id = "clock-" + rowNum +"-"+colNum;
    newClock.innerHTML = innercode;
    return newClock;
};
*/

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

function setupClocks(){
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

    //multiply number by 10 because they are 10em tall each
    //subtract a couple because by default there's a bit too much
    winYem = winYem-2;
    //divide by 2 to split the padding on both sides (right/left and top/bottom)
    //may be changed or dynamically assigned based on screen size in the future
    //right now this only changes once at the start, so if the window isn't fullscreen and/or changes size it will break
    //running it with clock updates or when the browser detects a change in screen size could fix this problem
    let divVertPadding = (winYem-(numClocksVert*10))/2;
    let divHorizPadding = (winXem-(numClocksHoriz*10))/2;
    document.getElementById("clocks").style.margin = ""+divVertPadding+"em "+divHorizPadding+"em";

    //start at the first row
    let currentNode = document.getElementById("clocks-0");

    //draw the clocks
    //this is done in such a static table instead of through flexbox because I want to be able to change specific clock positions easily
    for(let rowNum = 0; rowNum < numClocksVert; rowNum++) {
        //Create the first col and set the currentNode to that first col
        currentNode.appendChild(createNewCol(rowNum, 0));
        currentNode = currentNode.firstChild;

        for (let colNum = 0; colNum < numClocksHoriz; colNum++) {
            //create new clock and append to the col

            //I don't think I can do this one with children because it's looking for data, but innerHTML is a bit insecure
            currentNode.innerHTML = fullClockCode(rowNum, colNum);
            //currentNode.appendChild(createNewClock(rowNum, colNum));

            //the node is the first col in the row, so we must create a new col from the parent node
            //this will currently create a garbage extra column. ***FIX***
            currentNode.parentNode.appendChild(createNewCol(rowNum, colNum+1));
            //navigate to the next column
            currentNode = currentNode.nextElementSibling;
        }
        //navigate to the current row
        currentNode = currentNode.parentNode;
        //create a new row
        //this will currently create a garbage extra row. ***FIX***
        currentNode.parentNode.appendChild(createNewRow(rowNum+1));
        //navigate to the next row
        currentNode = currentNode.nextElementSibling;
    }
};


function getTableLocation(row, col){
    return document.getElementById("clocks-"+row+"-"+col);
};

function clearTableLocation(row, col){
    let tableSpot = getTableLocation(row, col);
    tableSpot.innerHTML = "";
};

function fillTableLocation(row, col, getTypeFunc){
    //getTypeFunc is a function to get the innerHTML of the desired inserted object
    let tableSpot = getTableLocation(row, col);
    tableSpot.innerHTML = getTypeFunc(row, col);
};

function toggleTableLocation(row, col, getTypeFunc){
    //I could implement this with the fillTableLocation and clearTableLocation functions but it would require calling getTableLocation multiple times
    let tableSpot = getTableLocation(row, col);
    if(tableSpot.innerHTML === ""){
        tableSpot.innerHTML = getTypeFunc(row, col);
    }
    else{
        tableSpot.innerHTML = "";
    }
};

/*
function clickToggleHandler(e){
    let clicked = e.target;
    //navigate up to the table location from whatever the target it
    while(clicked.className !== ""){
        clicked = clicked.parentNode;
    }

    //toggle it
    let row = clicked.id.split("-")[1];
    let col = clicked.id.split("-")[2];
    toggleTableLocation(row, col, fullClockCode);
};
*/

function clickColorHandler(e){
    let clicked = e.target;
    //if not actually clicking on the clock, add the clock back if it doesn't exist or don't do anything if it does exist
    if(clicked.className === ""){
        if(!clicked.firstChild){
            let row = clicked.id.split("-")[1];
            let col = clicked.id.split("-")[2];
            clicked.innerHTML = fullClockCode(row, col);
        }
        return;
    }

    //navigate up to the table location from whatever the target it
    while(clicked.className !== ""){
        clicked = clicked.parentNode;
    }

    //toggle it
    let background = clicked.firstChild.nextElementSibling.firstChild.nextElementSibling;
    let colorIndex = 0;
    if(background.style.backgroundColor){
        console.log(background.style.backgroundColor);
        colorIndex = (colors.indexOf(background.style.backgroundColor)+1)%colors.length;
    }
    //if it's the last color, delete the clock instead of toggling
    if(colorIndex === colors.length-1){
        clicked.innerHTML = "";
    }
    else {
        background.style.backgroundColor = colors[colorIndex];
    }
};



window.onload = function(){
    //fill the screen with clocks based on current number of pixels
    setupClocks();
    //set the clocks to the current time
    //this will asynchronously repeat forever
    updateClock();
    //toggle clocks on click
    //document.getElementById('clocks').addEventListener('click', clickToggleHandler, false);

    //cycles colors
    document.getElementById('clocks').addEventListener('click', clickColorHandler, false);

};
