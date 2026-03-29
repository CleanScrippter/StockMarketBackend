Build a backend service for an **AI Stock Sentiment Dashboard**.

Purpose:
This backend is responsible for:

* Fetching market data from AlphaVantage API
* Fetching latest news from a news API
* Running AI-based sentiment analysis
* Storing all processed data in Supabase (PostgreSQL)
* Exposing APIs to trigger these processes

Development Context:

* Use Supabase client for all database interactions (do NOT use raw SQL connections)
* Structure the project so it works well with AI-assisted development and modular code generation

Configuration:

* Use environment variables:

  * SUPABASE_URL
  * SUPABASE_ANON_KEY or SERVICE_ROLE_KEY
  * ALPHAVANTAGE_API_KEY
  * NEWS_API_KEY
  * OPENAI_API_KEY (or any LLM provider)

Architecture:

* Backend handles:

  * Data ingestion
  * AI processing
  * Control APIs
* Frontend will directly read from Supabase (no read APIs required in backend)

Database Tables:

* markets
* market_ticks
* market_metrics_latest
* news_raw
* news_ai_analysis
* market_ai_summary
* system_runs

Core Features:

1. Market Data Ingestion (AlphaVantage)

* Use AlphaVantage API to fetch:

  * Latest stock/index price
  * Time series data (for chart)
* Normalize response and store:

  * market_ticks (time-series)
  * market_metrics_latest (latest snapshot)

2. News Data Ingestion

* Fetch latest news using a news API
* Store in news_raw

3. AI Processing

* Read latest news from news_raw

* For each article:

  * Generate sentiment (bullish / bearish / neutral)
  * Generate short summary

* Store results in news_ai_analysis

* Generate overall market summary:

  * Aggregate sentiment scores
  * Create final summary text
  * Assign risk level (low / medium / high)

* Store in market_ai_summary

4. API Endpoints

POST /api/refresh-data

* Fetch market data from AlphaVantage
* Fetch latest news
* Store all raw data in Supabase
* Create entry in system_runs

POST /api/generate-sentiment

* Run AI sentiment + summaries on latest news
* Update news_ai_analysis
* Generate market_ai_summary
* Log execution in system_runs

POST /api/regenerate-summary

* Only regenerate overall market summary from existing data
* Update market_ai_summary

GET /api/system-status

* Return latest job status and timestamps from system_runs

5. AI Integration

* Use LLM API for:

  * News summarization
  * Sentiment classification
* Keep prompts modular and reusable
* Ensure responses are structured (JSON format preferred)

6. Project Structure

* routes/
* services/

  * market.service (AlphaVantage integration)
  * news.service
  * ai.service
* jobs/

  * ingestion.job
  * sentiment.job
* db/

  * supabase client setup
  * query helpers
* config/
* utils/

7. Requirements

* Use Supabase JS client for DB operations
* Clean modular code
* Proper error handling and logging
* Async/await throughout
* Environment-based configuration
* Ready for cron/scheduler integration later

8. Notes

* No frontend code required
* No authentication required (MVP)
* Focus on clarity, modularity, and production-style structure
