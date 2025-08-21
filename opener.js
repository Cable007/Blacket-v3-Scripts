async function instantOpenPack(packId) {
    if (!window.user || !window.packs) {
        console.error("Error: 'window.user' or 'window.packs' are not defined.");
        console.error("Please make sure you have fetched and assigned these objects first.");
        return Promise.reject(new Error("Missing user or packs data."));
    }
    const packToOpen = window.packs.find(pack => pack.id === packId);
    if (!packToOpen) {
        console.error(`Error: Pack with ID '${packId}' not found.`);
        return Promise.reject(new Error("Pack not found."));
    }
    console.log(`Attempting to open pack: ${packToOpen.name} (ID: ${packId})`);
    console.log(`Current tokens: ${window.user.tokens}`);
    const dto = { packId };
    try {
        const response = await window.fetch2.post("/api/market/open-pack", dto);
        const { blooks, statistics, tokens } = window.user;
        blooks.push(response.data);
        statistics.packsOpened++;
        const newTokens = tokens - packToOpen.price;
        window.user.blooks = blooks;
        window.user.statistics = statistics;
        window.user.tokens = newTokens;
        console.log("Pack opened successfully!");
        console.log("New Blook:", response.data);
        console.log(`New token balance: ${newTokens}`);
        console.log("Updated user object:", window.user);
        return response;
    } catch (error) {
        console.error("Failed to open pack:", error);
        throw error;
    }
}
