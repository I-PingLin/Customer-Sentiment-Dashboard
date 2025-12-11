
export interface SentimentDataPoint {
  time: string;
  sentiment: number;
}

export interface WordCloudWord {
  text: string;
  value: number;
}

export interface WordClouds {
  positive: WordCloudWord[];
  negative: WordCloudWord[];
}

export interface AnalysisReport {
  sentimentTrend: SentimentDataPoint[];
  wordClouds: WordClouds;
  executiveSummary: string;
}
