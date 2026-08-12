/* =========================
   Nutri Scan - Scanner JS
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

    const scanBtn = document.getElementById("scanBtn");

    const barcodeEl = document.getElementById("barcode");
    const productEl = document.getElementById("product");
    const brandEl = document.getElementById("brand");

    const caloriesEl = document.getElementById("calories");
    const proteinEl = document.getElementById("protein");
    const fatEl = document.getElementById("fat");
    const sugarEl = document.getElementById("sugar");
    const saltEl = document.getElementById("salt");

    let scanner = null;
    let scanning = false;

    /* =========================
       Start Scanner
       ========================= */

    scanBtn.addEventListener("click", async () => {

        if (scanning) {
            await stopScanner();
            return;
        }

        startScanner();
    });


    async function startScanner() {

        if (typeof Html5Qrcode === "undefined") {
            alert("Scanner library is still loading. Please try again.");
            return;
        }

        scanner = new Html5Qrcode("reader");

        try {

            await scanner.start(
                {
                    facingMode: "environment"
                },
                {
                    fps: 10,
                    qrbox: {
                        width: 280,
                        height: 150
                    }
                },

                async (decodedText) => {

                    console.log("Barcode detected:", decodedText);

                    barcodeEl.textContent = decodedText;

                    await stopScanner();

                    getProductData(decodedText);
                },

                (errorMessage) => {
                    // Ignore continuous scanning errors.
                    // They happen normally while searching for a barcode.
                }
            );

            scanning = true;

            scanBtn.textContent = "🛑 Stop Scanner";

        } catch (error) {

            console.error("Scanner error:", error);

            alert(
                "Unable to start the camera.\n\n" +
                "Please allow camera permission and make sure you are using HTTPS or localhost."
            );
        }
    }


    /* =========================
       Stop Scanner
       ========================= */

    async function stopScanner() {

        if (!scanner || !scanning) {
            return;
        }

        try {

            await scanner.stop();

            scanner.clear();

        } catch (error) {

            console.error("Error stopping scanner:", error);

        }

        scanning = false;

        scanBtn.textContent = "📷 Start Scanner";
    }


    /* =========================
       Get Product Information
       ========================= */

    async function getProductData(barcode) {

        setLoading();

        try {

            const response = await fetch(
                `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
            );

            if (!response.ok) {
                throw new Error("Network error");
            }

            const data = await response.json();

            if (
                data.status !== 1 ||
                !data.product
            ) {

                showNotFound();

                return;
            }

            displayProduct(data.product, barcode);

        } catch (error) {

            console.error("API error:", error);

            showError();
        }
    }


    /* =========================
       Display Product
       ========================= */

    function displayProduct(product, barcode) {

        const nutriments = product.nutriments || {};

        barcodeEl.textContent = barcode;

        productEl.textContent =
            product.product_name ||
            "Unknown product";

        brandEl.textContent =
            product.brands ||
            "Unknown brand";


        /* Calories */

        caloriesEl.textContent =
            getNutritionValue(
                nutriments["energy-kcal_100g"],
                "kcal"
            );


        /* Protein */

        proteinEl.textContent =
            getNutritionValue(
                nutriments.proteins_100g,
                "g"
            );


        /* Fat */

        fatEl.textContent =
            getNutritionValue(
                nutriments.fat_100g,
                "g"
            );


        /* Sugar */

        sugarEl.textContent =
            getNutritionValue(
                nutriments.sugars_100g,
                "g"
            );


        /* Salt */

        saltEl.textContent =
            getNutritionValue(
                nutriments.salt_100g,
                "g"
            );
    }


    /* =========================
       Nutrition Formatter
       ========================= */

    function getNutritionValue(value, unit) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return "Not available";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return "Not available";
        }

        return `${number.toFixed(1)} ${unit} / 100g`;
    }


    /* =========================
       Loading State
       ========================= */

    function setLoading() {

        productEl.textContent = "Loading...";
        brandEl.textContent = "Loading...";

        caloriesEl.textContent = "Loading...";
        proteinEl.textContent = "Loading...";
        fatEl.textContent = "Loading...";
        sugarEl.textContent = "Loading...";
        saltEl.textContent = "Loading...";
    }


    /* =========================
       Product Not Found
       ========================= */

    function showNotFound() {

        productEl.textContent = "Product not found";
        brandEl.textContent = "-";

        caloriesEl.textContent = "-";
        proteinEl.textContent = "-";
        fatEl.textContent = "-";
        sugarEl.textContent = "-";
        saltEl.textContent = "-";

        alert(
            "😕 Sorry, this product was not found in the Open Food Facts database."
        );
    }


    /* =========================
       API Error
       ========================= */

    function showError() {

        productEl.textContent = "Unable to load product";
        brandEl.textContent = "-";

        caloriesEl.textContent = "-";
        proteinEl.textContent = "-";
        fatEl.textContent = "-";
        sugarEl.textContent = "-";
        saltEl.textContent = "-";

        alert(
            "⚠️ Something went wrong while getting the food information."
        );
    }

});
