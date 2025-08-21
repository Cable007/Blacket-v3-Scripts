async function instantSellBlooks() {
    if (!window.user || !window.blooks) {
        console.error("Error: 'window.user' or 'window.blooks' are not defined.");
        console.error("Please ensure you have fetched and assigned these objects first.");
        return Promise.reject(new Error("Missing user or blooks data."));
    }
    const getBlookName = (blookId) => {
        const blook = window.blooks.find(b => b.id === blookId);
        return blook ? blook.name : "Unknown Blook";
    };
    const userBlookCounts = new Map();
    for (const blook of window.user.blooks) {
        const key = `${blook.blookId}-${blook.shiny}`;
        userBlookCounts.set(key, (userBlookCounts.get(key) || 0) + 1);
    }
    const duplicateBlooks = new Set();
    for (const [key, count] of userBlookCounts.entries()) {
        if (count > 1) {
            const blookId = key.split('-')[0];
            const blookName = getBlookName(blookId);
            duplicateBlooks.add(blookName);
        }
    }
    if (duplicateBlooks.size === 0) {
        console.log("You have no duplicate blooks to sell!");
        return;
    }
    const blookNamesArray = Array.from(duplicateBlooks);
    console.log("You have duplicates of the following blooks:");
    console.log(blookNamesArray.join(", "));
    const blookNameInput = prompt("Enter the name of the blook you want to sell (e.g., 'King'):");
    if (!blookNameInput) {
        console.log("Sale cancelled.");
        return;
    }
    const blookToSellName = blookNameInput.toLowerCase();
    const blookReference = window.blooks.find(b => b.name.toLowerCase() === blookToSellName);
    if (!blookReference) {
        console.error(`Error: Blook with name '${blookNameInput}' not found.`);
        return Promise.reject(new Error("Blook not found."));
    }
    const userBlooksToSell = window.user.blooks.filter(b => b.blookId === blookReference.id);
    if (userBlooksToSell.length <= 1) {
        console.log(`You only have one of '${blookReference.name}'. Nothing to sell.`);
        return;
    }
    const blookIdsToSell = userBlooksToSell.slice(1).map(b => b.id);
    console.log(`Attempting to sell ${blookIdsToSell.length} duplicate(s) of '${blookReference.name}'.`);
    console.log(`Current tokens: ${window.user.tokens}`);
    const dto = { blooks: blookIdsToSell };
    try {
        const response = await window.fetch2.put("/api/blooks/sell-blooks", dto);
        let tokensEarned = 0;
        const blookDataToSell = window.blooks.find(b => b.id === blookReference.id);
        if (blookDataToSell) {
            tokensEarned = blookDataToSell.price * blookIdsToSell.length;
        }
        const newBlooks = window.user.blooks.filter(blook => !blookIdsToSell.includes(blook.id));
        const newTokens = window.user.tokens + tokensEarned;
        window.user.blooks = newBlooks;
        window.user.tokens = newTokens;
        console.log(`Successfully sold ${blookIdsToSell.length} blook(s).`);
        console.log(`Earned ${tokensEarned} tokens.`);
        console.log(`New token balance: ${newTokens}`);
        console.log("Updated user object:", window.user);
        return response;
    } catch (error) {
        console.error("Failed to sell blooks:", error);
        throw error;
    }
}
