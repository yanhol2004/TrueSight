document.addEventListener("DOMContentLoaded", () => {
    const headlineEl = document.getElementById("headline");
    const factCheckEl = document.getElementById("fact-check-result");
    const imageResultsEl = document.getElementById("image-results");

    // Load and display fact-checking and deepfake analysis results
    chrome.storage.local.get(["factCheckResult", "deepfakeResults"], (data) => {
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
                factCheckEl.innerHTML = `<p>No fact-checking data available.</p>`;
            }
        }

        // Display deepfake analysis results
        if (imageResultsEl) {
            const results = data.deepfakeResults || [];
            if (results.length === 0) {
                imageResultsEl.innerHTML = "<p>No images analyzed yet.</p>";
                return;
            }

            // Display each analyzed image result
            results.forEach((result, index) => {
                const li = document.createElement("li");
                
                li.innerHTML = `
                    <img src="${result.imageUrl}" alt="Analyzed Image" height="50" style="margin-right: 10px; width: auto;">
                    <div>
                        <p>${result.isDeepfake
                            ? `⚠️ <strong>Deepfake Detected</strong> (Score: ${result.deepfakeScore.toFixed(2)})`
                            : `✅ <strong>Not a Deepfake</strong> (Score: ${result.deepfakeScore.toFixed(2)})`}
                        </p>
                        <p>${result.isGenAI
                            ? `⚠️ <strong>GenAI Content Detected</strong> (Score: ${result.genaiScore.toFixed(2)})`
                            : `✅ <strong>Not AI-Generated</strong> (Score: ${result.genaiScore.toFixed(2)})`}
                        </p>
                    </div>
                `;

                imageResultsEl.appendChild(li);
            });
        }
    });
});