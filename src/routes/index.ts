import { Router } from 'express';
import { runIngestionJob } from '../jobs/ingestion.job';
import { runSentimentJob } from '../jobs/sentiment.job';
import { getRecentSystemRuns, getActiveMarkets, upsertMarketAiSummary, getMarketAnalysisData } from '../db/actions';
import { generateMarketSummary } from '../services/ai.service';

export const router = Router();

router.post('/refresh-data', async (req, res) => {
  try {
    // Run in background so we don't block the HTTP request timeout
    runIngestionJob().catch(err => console.error('[Fatal] Ingestion job failed:', err));
    res.status(202).json({ message: 'Ingestion job started in the background.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-sentiment', async (req, res) => {
  try {
    runSentimentJob().catch(err => console.error('[Fatal] Sentiment job failed:', err));
    res.status(202).json({ message: 'Sentiment job started in the background.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/regenerate-summary', async (req, res) => {
  try {
    // Only regenerate overall market summary from existing data
    const markets = await getActiveMarkets();
    let updatedCount = 0;
    
    for (const market of markets) {
      const marketData = await getMarketAnalysisData(market.id);
      if (!marketData || marketData.length === 0) continue;

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
      
      updatedCount++;
    }

    res.json({ message: `Successfully regenerated summaries for ${updatedCount} markets.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/system-status', async (req, res) => {
  try {
    const runs = await getRecentSystemRuns(20);
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
