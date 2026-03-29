export interface Market {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  is_active: boolean;
  created_at: string;
}

export interface MarketTick {
  id: string;
  market_id: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketMetricsLatest {
  market_id: string;
  index_price: number;
  percent_change: number;
  day_high: number;
  day_low: number;
  volume: number;
  volatility_index?: number;
  last_updated: string;
}

export interface NewsRaw {
  id: string;
  market_id: string;
  title: string;
  source?: string;
  url?: string;
  content_raw?: string;
  published_at?: string;
  fetched_at: string;
}

export interface NewsAiAnalysis {
  id: string;
  news_id: string;
  sentiment_label: string;
  sentiment_score: number;
  ai_summary?: string;
  analyzed_at: string;
}

export interface MarketAiSummary {
  market_id: string;
  summary_text?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  risk_level?: string;
  generated_at: string;
}

export interface SystemRun {
  id: string;
  run_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface TradeSignal {
  id: string;
  market_id: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  generated_at: string;
}
