//<!-- ****  JavaScript Feature submission **** -->
//<!-- Parser for time into clock angles with key-value pairs-->
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

    //convert segments into rotational values
    times.second = (times.second % 60) * 6;
    times.minute = (times.minute % 60) * 6;
    times.hour = (times.hour % 12) * 30;
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

    //<!-- ****  jQuery substitute for Bootstrap Feature submission **** -->
    //cycle colors when clicked
    $(document).ready(function(){
        $(".clock").click(function(){
            clickColorHandlerJquery(this);
        });
    });
};

function updateClocksManualVert(){
    numClocksVert = document.getElementById("num-clocks-vert-input").value;
    resetClocks();
}
function updateClocksManualHoriz(){
    numClocksHoriz = document.getElementById("num-clocks-horiz-input").value;
    resetClocks();
}