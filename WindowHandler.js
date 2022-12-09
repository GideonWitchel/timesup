
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