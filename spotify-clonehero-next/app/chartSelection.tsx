export type ChartResponse = {
  name: string;
  artist: string;
  charter: string;
  diff_drums: number | null;
  diff_drums_real: number | null;
  diff_guitar: number | null;
  uploadedAt: string;
  lastModified: string | null;
  file: string;
};

export type ChartResponseEncore = {
  name: string;
  artist: string;
  charter: string;
  diff_drums: number;
  diff_drums_real: number;
  diff_guitar: number;
  modifiedTime: string;
  md5: string;
};

export type ChartInfo = {
  charter: string;
  uploadedAt: string;
  diff_drums: number | null;
  diff_guitar: number | null;
};

export function selectChart<T extends ChartInfo>(
  charts: T[],
): {
  chart: T;
  reasons: string[];
} {
  type ChartTest = (recommendedChart: T, chart: T) => string | undefined;

  const testSameCharter: ChartTest = (recommendedChart: T, chart: T) => {
    if (chart == null || recommendedChart == null) {
      debugger;
    }
    if (
      chart.charter == recommendedChart.charter &&
      new Date(chart.uploadedAt) > new Date(recommendedChart.uploadedAt)
    ) {
      return 'Chart from same charter is newer';
    }
  };

  const testPreferHarmonix: ChartTest = (recommendedChart: T, chart: T) => {
    if (recommendedChart.charter != 'Harmonix' && chart.charter == 'Harmonix') {
      return 'Better chart is from Harmonix';
    }
  };

  const testPreferOfficialTracks: ChartTest = (
    recommendedChart: T,
    chart: T,
  ) => {
    if (
      !['Harmonix', 'Neversoft'].includes(recommendedChart.charter) &&
      ['Harmonix', 'Neversoft'].includes(chart.charter)
    ) {
      return 'Better chart is from official game';
    }
  };

  const testPreferDrums: ChartTest = (recommendedChart: T, chart: T) => {
    if (
      (recommendedChart.diff_drums == null ||
        recommendedChart.diff_drums < 0) &&
      chart.diff_drums != null &&
      chart.diff_drums > 0
    ) {
      return "Better chart has drums, current chart doesn't";
    }
  };

  const testPreferGuitar: ChartTest = (recommendedChart: T, chart: T) => {
    if (
      (recommendedChart.diff_guitar == null ||
        recommendedChart.diff_guitar < 0) &&
      chart.diff_guitar != null &&
      chart.diff_guitar > 0
    ) {
      return "Better chart has guitar, current chart doesn't";
    }
  };

  const testPreferHigherDiffSum: ChartTest = (
    recommendedChart: T,
    chart: T,
  ) => {
    // Prefer charts with higher diff_ sum
    const recommendedDiffSum = Object.keys(recommendedChart)
      .filter(key => key.startsWith('diff_'))
      .map(key => recommendedChart[key as keyof T] as number)
      .filter((value: number) => value > 0)
      .reduce((a: number, b: number) => a + b, 0);

    const chartDiffSum = Object.keys(chart)
      .filter(key => key.startsWith('diff_'))
      .map(key => chart[key as keyof T] as number)
      .filter((value: number) => value > 0)
      .reduce((a: number, b: number) => a + b, 0);

    if (chartDiffSum > recommendedDiffSum) {
      return 'Better chart has more instruments or difficulty';
    }
  };

  const rankingGroups = [
    [
      testSameCharter,
      testPreferHarmonix,
      testPreferOfficialTracks,
      testPreferDrums,
    ],
    [testPreferGuitar],
    [testPreferHigherDiffSum],
  ];

  let chartsInConsideration = charts.slice(1);

  for (const rankingGroup of rankingGroups) {
    const recommendedChart = charts[0];

    let reasonsPerChart: Map<T, string[]> = new Map();
    for (const chart of chartsInConsideration) {
      const reasons: string[] = [];

      // Log all the reasons for each /new/ chart in this group
      // If any charts don't have a reason, remove them from consideration
      //   unless none have a reason
      // At the end, compare best chart with original chart

      for (const test of rankingGroup) {
        const reason = test(recommendedChart, chart);

        if (reason) {
          reasons.push(reason);
        }
      }
      reasonsPerChart.set(chart, reasons);
    }

    // Get the charts that have reasons
    const chartsWithReasons = Array.from(reasonsPerChart.keys()).filter(
      chart => reasonsPerChart.get(chart)!.length > 0,
    );

    if (chartsWithReasons.length == 1) {
      return {
        chart: chartsWithReasons[0],
        reasons: reasonsPerChart.get(chartsWithReasons[0])!,
      };
    } else if (chartsWithReasons.length > 1) {
      chartsInConsideration = chartsWithReasons;
    } else {
      const chart = chartsInConsideration[0];
      const reasons: string[] = [];

      for (const test of rankingGroup) {
        const reason = test(chart, charts[0]);

        if (reason) {
          reasons.push(reason);
        }
      }

      if (reasons.length) {
        // Our original chart is better
        return {
          chart: charts[0],
          reasons: [],
        };
      }
      // No charts have reasons, compare any chart against the original to see if the original has reasons
    }
  }

  return {
    chart: charts[0],
    reasons: [],
  };
}
