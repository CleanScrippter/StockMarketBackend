import { supabase } from './client';
import { Market, MarketTick, MarketMetricsLatest, NewsRaw, NewsAiAnalysis, MarketAiSummary, SystemRun, TradeSignal } from '../types';

export const getActiveMarkets = async (): Promise<Market[]> => {
  const { data, error } = await supabase.from('markets').select('*').eq('is_active', true);
  if (error) throw error;
  return data || [];
};

export const insertMarketTick = async (tick: Omit<MarketTick, 'id'>) => {
  const { error } = await supabase.from('market_ticks').insert([tick]);
  if (error) throw error;
};

export const upsertMarketMetricsLatest = async (metrics: Omit<MarketMetricsLatest, 'last_updated'>) => {
  const { error } = await supabase.from('market_metrics_latest').upsert([metrics]);
  if (error) throw error;
};

export const insertNewsRaw = async (news: Omit<NewsRaw, 'id' | 'fetched_at'>) => {
  const { error } = await supabase.from('news_raw').insert([news]);
  if (error) throw error;
};

export const getUnanalyzedNews = async (): Promise<NewsRaw[]> => {
  // Find news_raw items where there's no corresponding news_ai_analysis
  const { data, error } = await supabase.from('news_raw').select('*, news_ai_analysis(id)');
  if (error) throw error;
  
  // Filter out those that already have analysis
  return (data || []).filter(n => (!n.news_ai_analysis || n.news_ai_analysis.length === 0));
};

export const insertNewsAnalysis = async (analysis: Omit<NewsAiAnalysis, 'id' | 'analyzed_at'>) => {
  const { error } = await supabase.from('news_ai_analysis').insert([analysis]);
  if (error) throw error;
};

export const upsertMarketAiSummary = async (summary: Omit<MarketAiSummary, 'generated_at'>) => {
  const { error } = await supabase.from('market_ai_summary').upsert([summary]);
  if (error) throw error;
};

export const insertTradeSignal = async (signal: Omit<TradeSignal, 'id' | 'generated_at'>) => {
  const { error } = await supabase.from('trade_signals').insert([signal]);
  if (error) throw error;
};

export const logSystemRun = async (runType: string, status: string, errorMessage?: string): Promise<string> => {
  const { data, error } = await supabase.from('system_runs').insert([{ run_type: runType, status, error_message: errorMessage }]).select('id').single();
  if (error) throw error;
  return data.id as string;
};

export const completeSystemRun = async (id: string, status: string, errorMessage?: string) => {
  const { error } = await supabase.from('system_runs').update({
    status,
    completed_at: new Date().toISOString(),
    error_message: errorMessage
  }).eq('id', id);
  if (error) throw error;
};

export const getRecentSystemRuns = async (limit = 10): Promise<SystemRun[]> => {
  const { data, error } = await supabase.from('system_runs').select('*').order('started_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
};

export const getMarketAnalysisData = async (marketId: string) => {
  const { data, error } = await supabase
    .from('news_raw')
    .select('*, news_ai_analysis(*)')
    .eq('market_id', marketId)
    .order('published_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
};
