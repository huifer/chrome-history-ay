document.getElementById('fetch-history').addEventListener('click', async () => {
  const resultsContainer = document.getElementById('result');
  resultsContainer.innerHTML = "Fetching history...";

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

    // Create display content
    const resultHTML = Object.keys(domainMap).map(month => {
      const domains = domainMap[month];
      const domainsList = Object.entries(domains)
        .map(([domain, count]) => `<li>${domain}: ${count} times</li>`)
        .join('');
      return `<h2>${month}</h2><ul>${domainsList}</ul>`;
    }).join('');

    resultsContainer.innerHTML = resultHTML;

  } catch (error) {
    resultsContainer.innerHTML = `Error: ${error.message}`;
  }
});
