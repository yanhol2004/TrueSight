chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message in background.js:", request);

    // Handle headline analysis
    if (request.action === "analyzeHeadline") {
        const { headline, articleText } = request;
        console.log("Analyzing headline and article text:", headline, articleText);

        checkFact(headline, articleText)
            .then((result) => {
                console.log("Headline analysis complete:", result);

                // Send the results back to the sender's tab
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: "headlineAnalysisResults",
                    results: result,
                });
                sendResponse({ status: "Headline analysis complete" });
            })
            .catch((error) => {
                console.error("Error analyzing headline:", error);
                sendResponse({ status: "Error analyzing headline" });
            });

        return true; // Keeps the messaging channel open for async response
    }

    // Handle image analysis
    if (request.action === "analyzeImages" && request.images) {
        console.log("Received image analysis request:", request.images);

        analyzeImages(request.images)
            .then((results) => {
                console.log("Image analysis complete:", results);

                // Send the results back to the sender's tab
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: "imageAnalysisResults",
                    results,
                });
                sendResponse({ status: "Image analysis complete" });
            })
            .catch((error) => {
                console.error("Error analyzing images:", error);
                sendResponse({ status: "Error analyzing images" });
            });

        return true; // Keeps the messaging channel open for async response
    }
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
// async function (images) {
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

// Analyze images for deepfakes (simulated API request)
async function analyzeImages(images) {
    const results = [];

    // Retrieve API credentials from local storage
    const credentials = await new Promise((resolve, reject) => {
        chrome.storage.local.get(["se_api_user", "se_api_secret"], (data) => {
            if (data.se_api_user && data.se_api_secret) {
                resolve({
                    apiUser: data.se_api_user,
                    apiSecret: data.se_api_secret,
                });
            } else {
                reject("API credentials not found in local storage.");
            }
        });
    }).catch((error) => {
        console.error(error);
        return null; // Stop execution if credentials are missing
    });

    if (!credentials) {
        return []; // Return an empty results array if credentials are missing
    }

    console.log("Using API Credentials:", credentials);

    for (let image of images) {
        console.log("Processing Image:", image.src); // Log each image being processed

        try {
            // Send request to the API
            const apiUrl = "https://api.sightengine.com/1.0/check.json";
            const df_params = new URLSearchParams({
                url: image.src,
                models: "deepfake",
                api_user: credentials.apiUser,
                api_secret: credentials.apiSecret,
            });
            const ai_params = new URLSearchParams({
                url: image.src,
                models: "genai",
                api_user: credentials.apiUser,
                api_secret: credentials.apiSecret,
            });

            const response = await fetch(`${apiUrl}?${df_params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log("API Response for Image (deepfake):", result);

            // Extract the deepfake score
            const deepfakeScore = result.type?.deepfake || 0;

            response = await fetch(`${apiUrl}?${ai_params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            result = await response.json();
            console.log("API Response for Image (genai):", result);

            // Extract the deepfake score
            const genaiScore = result.type?.ai_generated || 0;

            // Push analysis result
            results.push({
                imageUrl: image.src,
                isDeepfake: deepfakeScore > 0.5, // Flag as deepfake
                isGenAI: genaiScore > 0.5, // Flag as GenAI
                deepfakeScore,
                genaiScore
            });
        } catch (error) {
            console.error(`Error analyzing image (${image.src}):`, error.message);
            // Push a default result for failed API requests
            results.push({
                imageUrl: image.src,
                isDeepfake: false,
                isGenAI: true,
                deepfakeScore: 0,
                genaiScore: 0
            });
        }
    }

    console.log("Final Analysis Results:", results); // Log all results

    // Store results in Chrome's local storage
    chrome.storage.local.set({ deepfakeResults: results });

    return results; // Return results for messaging
}

