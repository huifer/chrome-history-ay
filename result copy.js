document.addEventListener('DOMContentLoaded', () => {
  const resultsContainer = document.getElementById('result');
  const chartContainer = document.getElementById('chart');

  chrome.storage.local.get('historyData', ({ historyData }) => {
    if (historyData) {
      // 按域名访问次数聚合
      const domainCounts = Object.values(historyData).reduce((acc, monthData) => {
        Object.entries(monthData).forEach(([domain, count]) => {
          acc[domain] = (acc[domain] || 0) + count;
        });
        return acc;
      }, {});

      // 按访问次数排序，获取前10个域名
      const sortedDomains = Object.entries(domainCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10);

      // 转换为 ECharts 所需数据格式
      const chartData = sortedDomains.map(([domain, count]) => ({
        name: domain,
        value: count
      }));

      // 初始化 ECharts
      const chart = echarts.init(chartContainer);
      const chartOptions = {
        title: {
          text: 'Top 10 Domains by Visits',
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

      // 显示所有域名及访问次数
      const resultHTML = sortedDomains.map(
        ([domain, count]) => `<li>${domain}: ${count} times</li>`
      ).join('');
      resultsContainer.innerHTML = `<ul>${resultHTML}</ul>`;
    } else {
      resultsContainer.innerHTML = 'No history data available.';
    }
  });
});
