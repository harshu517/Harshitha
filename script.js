let scanner = null;
let running = false;

// Local catalog for products not found in the global database
const localProducts = {
    "8908017763036": {
        product_name: "Dry Mart Silver Walnut Kernels",
        brands: "Dry Mart",
        image_front_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300",
        quantity: "250g / 500g",
        nutriments: {
            "energy-kcal_100g": 654,
            "proteins_100g": 15.2,
            "fat_100g": 65.2,
            "carbohydrates_100g": 13.7,
            "sugars_100g": 2.6
        },
        expiration_date: "9 Months from Packing"
    }
};

/* Start Scanner */
function startScanner() {
    if (running) return;

    scanner = new Html5Qrcode("reader");

    const config = {
        fps: 10,
        qrbox: {
            width: 280,
            height: 180
        }
    };

    scanner.start(
        { facingMode: "environment" },
        config,

        function(decodedText) {
            // Show scanning state
            document.getElementById("result").innerHTML = `
                <p>🔍 Barcode: <b>${decodedText}</b></p>
                <p style="color: #00ffff; margin-top: 8px;">⏳ Loading product details...</p>
            `;

            stopScanner();
            fetchFullProductDetails(decodedText);
        },

        function(errorMessage) {
            // keep scanning silently
        }

    ).then(function() {
        running = true;
        document.getElementById("result").innerHTML = "📷 Camera is ready...";
    }).catch(function(error) {
        document.getElementById("result").innerHTML = "❌ Could not open camera.";
        console.error(error);
    });
}

/* Fetch Product Details */
async function fetchFullProductDetails(barcode) {
    const resultBox = document.getElementById("result");

    try {
        let p = null;

        // 1. Check local catalog first
        if (localProducts[barcode]) {
            p = localProducts[barcode];
        } else {
            // 2. Otherwise fetch from Open Food Facts API
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
            const data = await response.json();

            if (data.status === 1 && data.product) {
                p = data.product;
            }
        }

        if (p) {
            const name = p.product_name || "Product Name Not Found";
            const brand = p.brands || "Unknown Brand";
            const image = p.image_front_url || "";
            const quantity = p.quantity || "N/A";
            
            const nutriments = p.nutriments || {};
            const calories = nutriments["energy-kcal_100g"] !== undefined ? `${nutriments["energy-kcal_100g"]} kcal` : "N/A";
            const protein = nutriments["proteins_100g"] !== undefined ? `${nutriments["proteins_100g"]} g` : "N/A";
            const fat = nutriments["fat_100g"] !== undefined ? `${nutriments["fat_100g"]} g` : "N/A";
            const carbs = nutriments["carbohydrates_100g"] !== undefined ? `${nutriments["carbohydrates_100g"]} g` : "N/A";
            const sugar = nutriments["sugars_100g"] !== undefined ? `${nutriments["sugars_100g"]} g` : "N/A";

            const expirationInfo = p.expiration_date || p.shelf_life || "Check physical packet stamp";

            resultBox.innerHTML = `
                <div style="text-align: left; margin-top: 15px; color: #fff; font-size: 14px;">
                    ${image ? `<img src="${image}" alt="${name}" style="width: 120px; display: block; margin: 0 auto 15px auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);">` : ""}
                    
                    <h2 style="color: #00eaff; margin-bottom: 6px; font-size: 20px;">${name}</h2>
                    <p><b>🏢 Brand:</b> ${brand}</p>
                    <p><b>📦 Quantity:</b> ${quantity}</p>
                    <p><b>🔢 Barcode:</b> ${barcode}</p>

                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 12px 0;">

                    <h4 style="color: #ffcc00; margin-bottom: 6px;">⚡ Nutrition (per 100g):</h4>
                    <p>• <b>Calories:</b> ${calories}</p>
                    <p>• <b>Protein:</b> ${protein}</p>
                    <p>• <b>Total Fat:</b> ${fat}</p>
                    <p>• <b>Carbohydrates:</b> ${carbs}</p>
                    <p>• <b>Sugars:</b> ${sugar}</p>

                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 12px 0;">

                    <h4 style="color: #ff0080; margin-bottom: 6px;">📅 Date Information:</h4>
                    <p><b>• Expiry / Shelf Life:</b> ${expirationInfo}</p>
                    <p style="font-size: 12px; color: #aaa; margin-top: 4px;">
                        ℹ️ <i>Exact manufacturing and expiry dates are printed on the packet.</i>
                    </p>
                </div>
            `;
        } else {
            resultBox.innerHTML = `
                <div style="color: #ff9999; margin-top: 10px;">
                    <p><b>Barcode:</b> ${barcode}</p>
                    <p style="margin-top: 8px;">⚠️ Product not found in database.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error(err);
        resultBox.innerHTML = `<p style="color: #ff5555;">❌ Error loading product data.</p>`;
    }
}

/* Stop Scanner */
function stopScanner() {
    if (!scanner || !running) return;

    scanner.stop().then(function() {
        running = false;
    }).catch(function(error) {
        console.error(error);
    });
}
