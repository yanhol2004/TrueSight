chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.headline) {
        checkFact(request.headline);
        console.log("headline:", request.headline);
    }
    // if (request.images.length > 0) {
    //     reverseImageSearch(request.images);
    // }
});

// Extract keywords from the headline
function extractKeywords(headline) {
    const stopwords = [
        "the", "and", "of", "to", "in", "on", "with", "for", "at", "by", "from", "as", "an", "is", "this", "that", "a", "it", "was", "are", "be"
    ];
    const words = headline
        .toLowerCase()
        .split(/\W+/) // Split by non-word characters
        .filter(word => word.length > 3 && !stopwords.includes(word)); // Filter out short words and stopwords
    return words.join(" ");
}


async function checkFact(headline) {
    let apiKey = "";

    // Extract keywords from the headline
    const keywords = extractKeywords(headline);
    console.log("Extracted Keywords:", keywords);

    // Query Google Fact Check Tools API
    let url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(keywords)}&key=${apiKey}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log("API Response:", data);

        // Store the result in Chrome's local storage
        chrome.storage.local.set({ factCheckResult: data });
    } catch (error) {
        console.error("Error fetching API response:", error);
    }
}


// Sightengine API credentials
// const API_USER = "your_api_user"; // Replace with your API user
// const API_SECRET = "your_api_secret"; // Replace with your API secret

// Function to analyze images using the Sightengine API
// async function analyzeImages(images) {
//     const results = [];

//     for (let image of images) {
//         try {
//             // // Make API request to analyze the image
//             // const response = await axios.get("https://api.sightengine.com/1.0/check.json", {
//             //     params: {
//             //         url: image.src,
//             //         models: "deepfake",
//             //         api_user: API_USER,
//             //         api_secret: API_SECRET
//             //     }
//             // });

//             // // Extract the deepfake score
//             // const deepfakeScore = response.data.type.deepfake;
//             const deepfakeScore = 0.9
//             // Push analysis result
//             results.push({
//                 element: image.element,
//                 isDeepfake: deepfakeScore > 0.5, // Flag as deepfake if score > 0.5
//                 deepfakeScore,
//                 imageUrl: image.src
//             });
//         } catch (error) {
//             console.error("Error analyzing image:", image.src, error.message);
//         }
//     }

//     // Send the analysis results back to the content script
//     chrome.runtime.sendMessage({ action: "imageAnalysisResults", results });
// }

async function analyzeImages(images) {
    const results = [];

    for (let image of images) {
        console.log("Processing Image:", image.src); // Log each image being processed

        // Simulated analysis result with a fixed score
        const deepfakeScore = 0.9; // Fixed value for testing
        results.push({
            element: image.element,
            isDeepfake: deepfakeScore > 0.5, // Flag as deepfake
            deepfakeScore,
            imageUrl: image.src
        });
    }

    console.log("Analysis Results:", results); // Log results
    chrome.runtime.sendMessage({ action: "imageAnalysisResults", results });
}

// Listen for image analysis requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "analyzeImages") {
        analyzeImages(message.images);
    }
});
