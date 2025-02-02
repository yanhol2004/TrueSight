// Extracts the main headline
function getHeadline() {
    // Select all <h1> elements
    const headlines = document.querySelectorAll("h1");

    for (let headline of headlines) {
        // Check if the class name contains "logo"
        if (!headline.className.toLowerCase().includes("logo")) {
            return headline.innerText.trim(); // Return the first valid headline
        }
    }

    // If no valid headline is found
    return "No headline found";
}

// Extracts the article body text
function getArticleText() {
    let paragraphs = document.querySelectorAll("p");
    let articleText = Array.from(paragraphs).map(p => p.innerText).join(" ");
    return articleText.substring(0, 500); // Limit text length
}
 

function getLargeImages() {
    // Select all <img> elements
    const images = document.querySelectorAll("img");
    console.log("All Images:", images); // Log extracted images
    const largeImages = Array.from(images)
        .filter(img => img.naturalWidth > 200 && img.naturalHeight > 200) // Filter by size
        .map(img => ({
            src: img.src,
            element: img
        }));

    console.log("Extracted Images:", largeImages); // Log extracted images
    return largeImages;
}

// // Use MutationObserver to handle dynamically loaded content
// function observeDOMChanges() {
//     const observer = new MutationObserver(() => {
//         const images = getLargeImages();
//         if (images.length > 0) {
//             console.log("Images found:", images);
//             observer.disconnect(); // Stop observing once images are found
//             chrome.runtime.sendMessage({
//                 action: "analyzeImages",
//                 images
//             });
//         }
//     });

//     observer.observe(document.body, { childList: true, subtree: true });
// }

// Start observing
// observeDOMChanges();

// Send data to the background script
chrome.runtime.sendMessage({
    headline: getHeadline(),
    articleText: getArticleText(),
    action: "analyzeImages",
    images: getLargeImages()
});


// // Listen for image analysis results from the background script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "imageAnalysisResults") {
//         message.results.forEach(result => {
//             if (result.isDeepfake) {
//                 // Highlight deepfake images with a red border
//                 result.element.style.border = "4px solid red";
//                 result.element.title = `⚠️ Deepfake Detected! (Score: ${result.deepfakeScore.toFixed(2)})`;
//             } else {
//                 // Optionally mark non-deepfake images with a green border
//                 result.element.style.border = "4px solid green";
//                 result.element.title = `✅ Not a Deepfake (Score: ${result.deepfakeScore.toFixed(2)})`;
//             }
//         });
//     }
// });