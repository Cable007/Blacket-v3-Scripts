async function instantSellBlooks(blookIds) {
    if (!window.user || !window.blooks) {
        console.error("Error: 'window.user' or 'window.blooks' are not defined.");
        console.error("Please ensure you have fetched and assigned these objects first.");
        return Promise.reject(new Error("Missing user or blooks data."));
    }
    if (!Array.isArray(blookIds) || blookIds.length === 0) {
        console.error("Error: 'blookIds' must be a non-empty array of strings.");
        return Promise.reject(new Error("Invalid input."));
    }
    console.log(`Attempting to sell ${blookIds.length} blook(s).`);
    console.log(`Current tokens: ${window.user.tokens}`);
    const dto = { blooks: blookIds };
    try {
        const response = await window.fetch2.put("/api/blooks/sell-blooks", dto);
        let tokensEarned = 0;
        const blooksToSell = [];
        for (const blookId of blookIds) {
            const userBlook = window.user.blooks.find(b => b.id === blookId);
            if (!userBlook) continue;
            const blook = window.blooks.find(b => b.id === userBlook.blookId);
            if (!blook) continue;
            tokensEarned += blook.price;
            blooksToSell.push(userBlook);
        }
        const newBlooks = window.user.blooks.filter(blook => !blookIds.includes(blook.id));
        const newTokens = window.user.tokens + tokensEarned;
        window.user.blooks = newBlooks;
        window.user.tokens = newTokens;
        console.log(`Successfully sold ${blooksToSell.length} blook(s).`);
        console.log(`Earned ${tokensEarned} tokens.`);
        console.log(`New token balance: ${newTokens}`);
        console.log("Updated user object:", window.user);
        return response;
    } catch (error) {
        console.error("Failed to sell blooks:", error);
        throw error;
    }
}
