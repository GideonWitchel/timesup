//Color Cycling
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
    addScore();
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


//Speed Updates
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

//Reset
function resetClocks(){
    document.getElementById('clocks').innerHTML ='<tr id=\"clocks-0\"></tr>';
    syncSpeed(1);
    setupClocks();
}

function hardResetClocks(){
    numClocksVert = 2;
    numClocksHoriz = 2;
    score = 0;
    updateScoreDisplay();
    resetClocks();
}


//Rainbow Reset
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

//Music
function toggleMusic(){
    let musicObject = document.getElementById("music");
    //if it is muted, unmute and play
    if(musicObject.muted){
        musicObject.muted = false;
        musicObject.play();
    }
    //if it is not muted, mute and pause
    else{
        musicObject.muted = true;
        musicObject.pause();
    }
    //update bookie
    document.cookie="muted="+musicObject.muted;
}

function musicChangeHandler(){
    changeTrack(document.getElementById('music-picker').value);
}

function changeTrack(trackName){
    document.getElementById("music").src = "songs/"+trackName;

    //I don't know why you need to toggle twice, but you do
    toggleMusic();
    toggleMusic();
}