let scanner;

document.getElementById("scanBtn").addEventListener("click", startScanner);

function startScanner(){

scanner = new Html5Qrcode("reader");

scanner.start(

{ facingMode:"environment" },

{

fps:10,

qrbox:250

},

success,

error

);

}

function success(code){

scanner.stop();

document.getElementById("barcode").innerHTML = code;

fetch("https://world.openfoodfacts.org/api/v0/product/"+code+".json")

.then(response=>response.json())

.then(data=>{

if(data.status==1){

let p=data.product;

document.getElementById("product").innerHTML=
p.product_name || "Not Available";

document.getElementById("brand").innerHTML=
p.brands || "Not Available";

document.getElementById("calories").innerHTML=
p.nutriments["energy-kcal_100g"]+" kcal";

document.getElementById("protein").innerHTML=
p.nutriments.proteins_100g+" g";

document.getElementById("fat").innerHTML=
p.nutriments.fat_100g+" g";

document.getElementById("sugar").innerHTML=
p.nutriments.sugars_100g+" g";

document.getElementById("salt").innerHTML=
p.nutriments.salt_100g+" g";

}
else{

alert("Product not found.");

}

});

}

function error(err){

}
