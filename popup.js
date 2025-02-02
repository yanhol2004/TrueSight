// document.addEventListener("DOMContentLoaded", () => {
//     chrome.storage.local.get(["factCheckResult", "imageResults"], (data) => {
//         const headlineEl = document.getElementById("headline");
//         const factCheckEl = document.getElementById("fact-check-result");
//         const imageResultsEl = document.getElementById("image-results");

//         // Display the headline
//         const headline = "Pope Francis endorsed Donald Trump for president."; // Example
//         headlineEl.textContent = headline;

//         // Fact-checking result
//         if (data.factCheckResult && data.factCheckResult.claims && data.factCheckResult.claims.length > 0) {
//             const claim = data.factCheckResult.claims[0];
//             const review = claim.claimReview[0];
//             factCheckEl.innerHTML = `
//                 <p><strong>Claim:</strong> ${claim.text}</p>
//                 <p><strong>Rating:</strong> ${review.textualRating}</p>
//                 <p><a href="${review.url}" target="_blank">Source</a></p>
//             `;
//         } else {
//             factCheckEl.innerHTML = `<p>No fact-checking data available for this headline.</p>`;
//         }

//     });
// });

// document.addEventListener("DOMContentLoaded", () => {
//     chrome.runtime.onMessage.addListener((message) => {
//         if (message.action === "imageAnalysisResults") {
//             const resultsContainer = document.getElementById("image-results");
//             resultsContainer.innerHTML = "";

//             message.results.forEach((result, index) => {
//                 const li = document.createElement("li");
//                 li.innerHTML = `
//                     <img src="${result.imageUrl}" alt="Image" width="50" height="50" style="margin-right: 10px;">
//                     ${result.isDeepfake
//                         ? `⚠️ Deepfake Detected (Score: ${result.deepfakeScore.toFixed(2)})`
//                         : `✅ Not a Deepfake (Score: ${result.deepfakeScore.toFixed(2)})`}
//                 `;
//                 resultsContainer.appendChild(li);
//             });
//         }
//     });
// });

document.addEventListener("DOMContentLoaded", () => {
    const headlineEl = document.getElementById("headline");
    const factCheckEl = document.getElementById("fact-check-result");
    const imageResultsEl = document.getElementById("image-results");

    // Load and display fact-checking results from storage
    chrome.storage.local.get(["factCheckResult", "imageResults"], (data) => {
        // Display the headline
        const headline = "Pope Francis endorsed Donald Trump for president."; // Example
        if (headlineEl) {
            headlineEl.textContent = headline;
        }

        // Fact-checking result
        if (factCheckEl) {
            if (data.factCheckResult && data.factCheckResult.claims && data.factCheckResult.claims.length > 0) {
                const claim = data.factCheckResult.claims[0];
                const review = claim.claimReview[0];
                factCheckEl.innerHTML = `
    <p><strong>Claim:</strong> ${claim.text}</p>
    <p><strong>Rating:</strong> <span style="color: red;">${review.textualRating}</span></p>
    <p><a href="${review.url}" target="_blank">Source</a></p>
`;
            } else {
                factCheckEl.innerHTML = `<p>No fact-checking data available for this headline.</p>`;
            }
        }

        // // Display image results from local storage (if available)
        // if (imageResultsEl && data.imageResults) {
        //     imageResultsEl.innerHTML = "";
        //     data.imageResults.forEach((result, index) => {
        //         const li = document.createElement("li");
        //         li.innerHTML = `
        //             <img src="${result.imageUrl}" alt="Image" width="50" height="50" style="margin-right: 10px;">
        //             ${result.isDeepfake
        //                 ? `⚠️ Deepfake Detected (Score: ${result.deepfakeScore.toFixed(2)})`
        //                 : `✅ Not a Deepfake (Score: ${result.deepfakeScore.toFixed(2)})`}
        //         `;
        //         imageResultsEl.appendChild(li);
        //     });
        // }
    });

    // Listen for real-time image analysis results
    // chrome.runtime.onMessage.addListener((message) => {
    //     if (message.action === "imageAnalysisResults" && imageResultsEl) {
    //         imageResultsEl.innerHTML = "";

    //         message.results.forEach((result, index) => {
    //             const li = document.createElement("li");
    //             li.innerHTML = `
    //                 <img src="${result.imageUrl}" alt="Image" width="50" height="50" style="margin-right: 10px;">
    //                 ${result.isDeepfake
    //                     ? `⚠️ Deepfake Detected (Score: ${result.deepfakeScore.toFixed(2)})`
    //                     : `✅ Not a Deepfake (Score: ${result.deepfakeScore.toFixed(2)})`}
    //             `;
    //             imageResultsEl.appendChild(li);
    //         });
    //     }
    // });
});