document.getElementById('fetch-history').addEventListener('click', async () => {
  try {
    const domainMap = {};
    for (let month = 0; month < 12; month++) {
        const monthStart = new Date(2024, month, 1);
        const monthEnd = new Date(2024, month + 1, 0);

        const historyItems = await chrome.history.search({
            text: '',
            startTime: monthStart.getTime(),
            endTime: monthEnd.getTime(),
            maxResults: 100000000
        });

        historyItems.forEach(item => {
            const url = new URL(item.url);
            const domain = url.hostname;

            const date = new Date(item.lastVisitTime);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!domainMap[monthKey]) domainMap[monthKey] = {};
            if (!domainMap[monthKey][domain]) domainMap[monthKey][domain] = 0;

            domainMap[monthKey][domain]++;
        });
    }
    debugger;
    // Save the result to local storage
    await chrome.storage.local.set({ historyData: domainMap });
  } catch (error) {
    console.error(`Error fetching history: ${error.message}`);
  }
});
