//riddle answer in SHA-256 Hash form
const validHash = "d8198efa3604d164853468608c55efa148bc56e3564d5a30232bf98b8ab43aeb";

function getErrorMessage(input){
    if(input.length < 2){
        return "Too Short";
    }
    if(input.length > 12){
        return "Too Long";
    }
    if(input.match(/[0-9]/g)){
        return "Invalid Input: Digits";
    }
    if(input.match(/[A-Z]/g)){
        return "Invalid Input: Capital Letters";
    }
    return "Invalid Input";
}

function isValid(input){
    //lowercase only, 2-16 in length
    if(input.match(/^[a-z]{2,16}$/g)){
        return true;
    }
    return false;
}

async function secretSubmitHandler(e){
    let secretInput = document.getElementById("secret-password").value;
    if(!isValid(secretInput)){
        document.getElementById("secret-error").textContent = getErrorMessage(secretInput);
        return;
    }
    document.getElementById("secret-error").textContent = "";
    let inputHash = await hash(secretInput);
    if(inputHash === validHash){
        //valid password
        showSecretSettings();
    }
    else{
        //invalid password
        document.getElementById("secret-error").textContent = "Incorrect Answer";
    }
}

//SHA-256 Hashing Function
async function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');
    return hashHex;
}

function showSecretSettings(){
    document.getElementById("secret-text").style.display = "none";
    document.getElementById("secret-menus").style.display = "inline-block";
}