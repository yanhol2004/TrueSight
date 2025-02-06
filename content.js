console.log("Content script loaded.");

// Extracts the main headline
function getHeadline() {
    const headlines = document.querySelectorAll("h1");
    for (let headline of headlines) {
        if (!headline.className.toLowerCase().includes("logo")) {
            return headline.innerText.trim();
        }
    }
    return "No headline found";
}

// Extracts the article body text
function getArticleText() {
    const paragraphs = document.querySelectorAll("p");
    const articleText = Array.from(paragraphs).map((p) => p.innerText).join(" ");
    return articleText.substring(0, 500); // Limit text length
}

// Extracts large images on the page
function getLargeImages() {
    const images = document.querySelectorAll("img");
    const largeImages = Array.from(images)
        .filter((img) => img.naturalWidth > 200 && img.naturalHeight > 200)
        .map((img) => ({ src: img.src }))
        .filter((image) => {
            if (seen.has(image.src)) {
                return false; // Skip duplicates
            }
            seen.add(image.src);
            return true;
        });
    console.log("Extracted Images:", largeImages);
    return largeImages;
}

// Sends the headline and article text for analysis
function analyzeHeadlineAndText() {
    const headline = getHeadline();
    const articleText = getArticleText();

    console.log("Sending headline and text for analysis...");
    chrome.runtime.sendMessage(
        {
            action: "analyzeHeadline",
            headline,
            articleText,
        },
        (response) => {
            console.log("Response from background script:", response);
        }
    );
}

// Sends the images for analysis
function analyzeImages(images) {
    if (images.length > 0) {
        console.log("Sending images for analysis...");
        chrome.runtime.sendMessage(
            {
                action: "analyzeImages",
                images,
            },
            (response) => {
                console.log("Response from background script:", response);
            }
        );
    }
}

// Handles messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "imageAnalysisResults") {
        console.log("Received image analysis results:", message.results);

        message.results.forEach((result) => {
            const matchingImages = Array.from(document.querySelectorAll("img")).filter(
                (img) => img.src === result.imageUrl
            );

            matchingImages.forEach((img) => {
                let borderColor = "green"; // Default to green if no issue
                let tooltip = `✅ Not a Deepfake (Score: ${result.deepfakeScore.toFixed(2)}) | ✅ Not AI-Generated (Score: ${result.genaiScore.toFixed(2)})`;
            
                // If flagged as deepfake or GenAI, use a red border
                if (result.isDeepfake || result.isGenAI) {
                    borderColor = "red";
                    tooltip = `${result.isDeepfake ? `⚠️ Deepfake Detected (Score: ${result.deepfakeScore.toFixed(2)})` : `✅ Not a Deepfake (Score: ${result.deepfakeScore.toFixed(2)})`}`;
            
                    tooltip += `| \n ${result.isGenAI ? `⚠️ GenAI Content Detected (Score: ${result.genaiScore.toFixed(2)})` : `✅ Not AI-Generated (Score: ${result.genaiScore.toFixed(2)})`}`;
                }
            
                // Apply styles to the image
                img.style.setProperty("overflow", "visible", "important");
                img.style.setProperty("overflow-clip-margin", "none", "important");
            
                img.style.border = `5px solid ${borderColor}`;
                // img.style.outline = borderColor === "red" ? "4px solid red" : ""; // Extra visibility
                img.style.boxSizing = "border-box";
                // img.style.margin = "5px"; // Ensure space around the image
                img.style.zIndex = "1000"; // Bring it to the front
                img.title = tooltip; // Display detailed info on hover
            
                console.log(`Applied ${borderColor} border to image: ${img.src}`);
            });
        });
    } else if (message.action === "headlineAnalysisResults") {
        console.log("Received headline analysis results:", message.results);
    }
    return true;
});

// Observe dynamically loaded images
function observeDynamicImages() {
    const observer = new MutationObserver(() => {
        const images = getLargeImages();
        console.log("Dynamic images detected. Sending for analysis...");
        analyzeImages(images);
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Start analyses
function init() {
    console.log("Initializing content script...");
    
    analyzeHeadlineAndText(); // Analyze headline and text
    analyzeImages(getLargeImages()); // Analyze initially loaded images
    observeDynamicImages(); // Watch for dynamically loaded images
}

// Initialize the content script
init();
// console.log("Content script loaded.");
// // Extracts the main headline
// function getHeadline() {
//     // Select all <h1> elements
//     const headlines = document.querySelectorAll("h1");

//     for (let headline of headlines) {
//         // Check if the class name contains "logo"
//         if (!headline.className.toLowerCase().includes("logo")) {
//             return headline.innerText.trim(); // Return the first valid headline
//         }
//     }

//     // If no valid headline is found
//     return "No headline found";
// }

// // Extracts the article body text
// function getArticleText() {
//     let paragraphs = document.querySelectorAll("p");
//     let articleText = Array.from(paragraphs).map(p => p.innerText).join(" ");
//     return articleText.substring(0, 500); // Limit text length
// }
 

// function getLargeImages() {
//     // Select all <img> elements
//     const images = document.querySelectorAll("img");
//     console.log("All Images:", images); // Log extracted images
//     const largeImages = Array.from(images)
//         .filter(img => img.naturalWidth > 200 && img.naturalHeight > 200) // Filter by size
//         .map(img => ({
//             src: img.src,
//             element: img
//         }));

//     console.log("Extracted Images:", largeImages); // Log extracted images
//     return largeImages;
// }

// function scrapeImagesFromTwitter() {
//     const images = [];
    
//     // Select all image elements
//     document.querySelectorAll('img').forEach(img => {
//         // Debug: Print image information
//         console.log(`Found image: ${img.src}, class: ${img.className}, width: ${img.naturalWidth}, height: ${img.naturalHeight}`);

//         // Exclude small images and potential logo images
//         if (
//             img.naturalWidth > 200 &&
//             img.naturalHeight > 200 &&
//             !img.className.toLowerCase().includes('logo')
//         ) {
//             images.push({
//                 src: img.src,
//                 width: img.naturalWidth,
//                 height: img.naturalHeight,
//                 class: img.className
//             });
//         }
//     });

//     // Debug: Print total images found
//     console.log(`Total images scraped: ${images.length}`);
//     return images;
// }

// // Observe DOM changes for dynamically loaded content
// function observeTwitterImages() {
//     const observer = new MutationObserver(() => {
//         const images = scrapeImagesFromTwitter();
//         if (images.length > 0) {
//             console.log('Sending scraped images to the background script...');
//             chrome.runtime.sendMessage({ action: 'analyzeImages', images });
//             observer.disconnect(); // Stop observing once images are scraped
//         }
//     });

//     observer.observe(document.body, { childList: true, subtree: true });
// }

// // Start observing for images
// observeTwitterImages();


// // Send data to the background script
// chrome.runtime.sendMessage({
//     headline: getHeadline(),
//     articleText: getArticleText(),
//     action: "analyzeImages",
//     images: getLargeImages()
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "imageAnalysisResults") {
//         console.log("Received analysis results:", message.results);

//         message.results.forEach((result) => {
//             // Find all matching images on the page
//             const matchingImages = Array.from(document.querySelectorAll("img")).filter(
//                 (img) => img.src === result.imageUrl
//             );

//             matchingImages.forEach((img) => {
//                 // Apply a red or green border based on deepfake detection
//                 if (result.isDeepfake) {
//                     img.style.border = "4px solid red";
//                     img.title = `⚠️ Deepfake Detected (Score: ${result.deepfakeScore.toFixed(2)})`;
//                 } else {
//                     img.style.border = "4px solid green";
//                     img.title = `✅ Not a Deepfake (Score: ${result.deepfakeScore.toFixed(2)})`;
//                 }
//                 console.log(`Applied border to image: ${img.src}`);
//             });
//         });
//     }
// });
