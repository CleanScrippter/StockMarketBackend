import { analyzeNewsSentiment, generateMarketSummary, generateTradeSignal } from '../services/ai.service';
import {
  getActiveMarkets,
  getUnanalyzedNews,
  insertNewsAnalysis,
  upsertMarketAiSummary,
  insertTradeSignal,
  getMarketAnalysisData,
  logSystemRun,
  completeSystemRun
} from '../db/actions';

export const runSentimentJob = async () => {
  const runId = await logSystemRun('sentiment', 'running');
  
  try {
    // 1. Process all unanalyzed news
    const newsToProcess = await getUnanalyzedNews();
    console.log(`[Sentiment] Found ${newsToProcess.length} unanalyzed news articles.`);

    for (const news of newsToProcess) {
      try {
        const analysis = await analyzeNewsSentiment(news.title, news.content_raw || '');
        await insertNewsAnalysis({
          news_id: news.id,
          sentiment_label: analysis.sentiment_label,
          sentiment_score: analysis.sentiment_score,
          ai_summary: analysis.ai_summary
        });
      } catch (err: any) {
        console.error(`[Sentiment] Error analyzing news ${news.id}:`, err.message);
      }
    }

    // 2. Generate overall market summaries and trade signals
    const markets = await getActiveMarkets();
    for (const market of markets) {
      try {
        const marketData = await getMarketAnalysisData(market.id);
        if (!marketData || marketData.length === 0) continue;

        // Simplify data to fit cleanly in LLM limits
        const cleanData = marketData.map(d => ({
          title: d.title,
          sentiment: d.news_ai_analysis?.[0]?.sentiment_label || 'unknown',
          score: d.news_ai_analysis?.[0]?.sentiment_score || 0
        }));

        const summary = await generateMarketSummary(market.symbol, cleanData);

        await upsertMarketAiSummary({
          market_id: market.id,
          summary_text: summary.summary_text,
          sentiment_score: summary.sentiment_score,
          sentiment_label: summary.sentiment_label,
          risk_level: summary.risk_level
        });

        // 3. Generate Trade Signal
        const trade = await generateTradeSignal(market.symbol, summary.summary_text);
        
        await insertTradeSignal({
          market_id: market.id,
          signal: trade.signal,
          confidence: trade.confidence
        });

      } catch (err: any) {
        console.error(`[Sentiment] Error generating market summary for ${market.symbol}:`, err.message);
      }
    }

    await completeSystemRun(runId, 'completed');
    console.log('[Sentiment] Complete.');
  } catch (err: any) {
    await completeSystemRun(runId, 'failed', err.message);
    throw err;
  }
};
