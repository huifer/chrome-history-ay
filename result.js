document.addEventListener('DOMContentLoaded', async () => {
  const resultsContainer = document.getElementById('result');
  const chartContainer = document.getElementById('chart');

  // 读取 domainkey.json 文件中的关键词数据
  async function fetchDomainKeywords() {
    const response = await fetch('domainkey.json');
    return response.json();
  }

  // 获取并处理浏览记录数据
  chrome.storage.local.get('historyData', async ({ historyData }) => {
    if (historyData) {
      const { domainKeywords } = await fetchDomainKeywords();

      // 按域名访问次数聚合
      const domainCounts = Object.values(historyData).reduce((acc, monthData) => {
        Object.entries(monthData).forEach(([domain, count]) => {
          acc[domain] = (acc[domain] || 0) + count;
        });
        return acc;
      }, {});

      // 按关键词统计访问次数
      const keywordCounts = {};
      Object.entries(domainCounts).forEach(([domain, count]) => {
        if (domainKeywords[domain]) {
          domainKeywords[domain].forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + count;
          });
        }
      });

      // 获取访问次数最多的前10个关键词
      const sortedKeywords = Object.entries(keywordCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10);

      // 转换为 ECharts 数据格式
      const chartData = sortedKeywords.map(([keyword, count]) => ({
        name: keyword,
        value: count
      }));

      // 初始化 ECharts
      const chart = echarts.init(chartContainer);
      const chartOptions = {
        title: {
          text: 'Top 10 Keywords by Visits',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: 'bottom'
        },
        series: [
          {
            name: 'Visits',
            type: 'pie',
            radius: '50%',
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      chart.setOption(chartOptions);

      // 显示关键词及访问次数
      const resultHTML = sortedKeywords.map(
        ([keyword, count]) => `<li>${keyword}: ${count} times</li>`
      ).join('');
      resultsContainer.innerHTML = `<ul>${resultHTML}</ul>`;
    } else {
      resultsContainer.innerHTML = 'No history data available.';
    }
  });
});
