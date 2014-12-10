var container = document.getElementById('examples');

function basic(container) {
  // Fill series s1 and s2.
  var
    s1 = {
      data: [
        [0, 4.5],
        [2.2, 3],
        [0, 4],
        [1.5,2],
        [0, 5],
        [3, 2.5],
        [3.5,3.5],
        [4.2,4.2]
      ]
    },
    graph, ticks;

  // Radar Labels
  ticks = [
    [0, "程序的应用"],
    [1, "沟通交流"],
    [2, "自动飞行"],
    [3, "人工飞行"],
    [4, "领导与团队合作"],
    [5, "解决问题和决策制定"],
    [6, "情景意识"],
    [7, "工作负荷"]
  ];

  // Draw the graph.
  graph = Flotr.draw(container, [s1], {
    radar: {
      show: true
    },
    grid: {
      circular: true,
      minorHorizontalLines: true
    },
    yaxis: {
      min: 0,
      max: 5,
      minorTickFreq: 1
    },
    xaxis: {
      ticks: ticks
    },
    mouse: {
      track: true
    }
  });
}
basic(container);