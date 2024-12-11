document.getElementById('fetch-history').addEventListener('click', async () => {
  try {
    const historyItems = await chrome.history.search({
      text: '',
      startTime: new Date('2024-01-01').getTime(),
      endTime: new Date('2024-12-31').getTime(),
      maxResults: 10000
    });

    const domainMap = {};
    historyItems.forEach(item => {
      const url = new URL(item.url);
      const domain = url.hostname;

      const date = new Date(item.lastVisitTime);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!domainMap[month]) domainMap[month] = {};
      if (!domainMap[month][domain]) domainMap[month][domain] = 0;

      domainMap[month][domain]++;
    });

    // Save the result to local storage
    await chrome.storage.local.set({ historyData: domainMap });

    // Open a new window to display the results
    chrome.windows.create({
      url: 'result.html',
      type: 'popup',
      width: 800,
      height: 600
    });
  } catch (error) {
    console.error(`Error fetching history: ${error.message}`);
  }
});
