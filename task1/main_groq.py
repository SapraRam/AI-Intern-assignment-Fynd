import json
import pandas as pd
import time
import os
from dotenv import load_dotenv
import asyncio
import aiohttp

# Load environment variables from .env.local
load_dotenv('.env.local')

# load dataset
df = pd.read_csv("yelp.csv")
df = df.sample(200, random_state=42).reset_index(drop=True)

# Prompt 1: Few-Shot Learning (Best for accuracy)
# WHY: Provides concrete examples so the model learns the pattern
prompt1 = """You are an expert Yelp review rating classifier. Classify reviews into 1-5 stars.

Examples:
Review: "Absolutely terrible service. Food was cold and the waiter was rude. Never coming back."
{"predicted_stars": 1, "explanation": "Strong negative language, multiple complaints, explicit statement of not returning"}

Review: "It was okay. Nothing special but nothing bad either. Average food, average service."
{"predicted_stars": 3, "explanation": "Neutral language, 'okay' and 'average' indicate middle rating"}

Review: "Great food and friendly staff! Will definitely come back. Highly recommend!"
{"predicted_stars": 5, "explanation": "Enthusiastic praise, intent to return, explicit recommendation"}

Now classify this review. Return ONLY valid JSON:
Review: "{review_text}"
"""

# Prompt 2: Sentiment Anchoring (Clear boundaries)
# WHY: Provides explicit sentiment-to-rating mapping with keywords
prompt2 = """Classify the Yelp review star rating (1-5) based on sentiment:

RATING GUIDE:
- 1 star: Angry, terrible experience, "never again", strong complaints
- 2 stars: Disappointed, below expectations, some complaints
- 3 stars: Mixed/neutral, "okay", "average", pros and cons balanced
- 4 stars: Positive, good experience, minor issues only
- 5 stars: Excellent, enthusiastic, "love it", "best ever", strong recommendation

Output ONLY this JSON: {"predicted_stars": <1-5>, "explanation": "<brief reason>"}

Review: "{review_text}"
"""

# Prompt 3: Chain-of-Thought with Scoring
# WHY: Guides model through structured analysis steps for better reasoning
prompt3 = """Analyze this Yelp review step by step, then predict the star rating.

Step 1: Identify sentiment words (positive/negative)
Step 2: Check for extreme language ("terrible", "amazing", "worst", "best")
Step 3: Look for intent to return or recommend
Step 4: Assign rating based on overall tone

Rating scale:
1 = Very negative, 2 = Somewhat negative, 3 = Neutral/Mixed, 4 = Positive, 5 = Very positive

IMPORTANT: Output ONLY the final JSON (no reasoning text):
{"predicted_stars": <1-5>, "explanation": "<one sentence summary>"}

Review: "{review_text}"
"""

prompts = {
    "Prompt_1_FewShot": prompt1,
    "Prompt_2_Anchored": prompt2,
    "Prompt_3_CoT": prompt3
}



GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Semaphore to control concurrent requests (stay under rate limits)
# Groq allows 60 RPM for moonshotai/kimi-k2-instruct - 2x faster than llama!
MAX_CONCURRENT = 15
REQUEST_DELAY = 0.05  # Smaller delay for faster model

async def classify_review_async(session, semaphore, prompt_name, idx, prompt_template, review_text, actual):
    """Async API call to Groq"""
    prompt = prompt_template.replace("{review_text}", review_text[:1500])  # Shorter text = faster
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "moonshotai/kimi-k2-instruct",  # 60 RPM - 2x faster than llama-3.1-8b-instant!
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,  # Low temperature for consistent results
        "response_format": {"type": "json_object"},
        "max_tokens": 150
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        async with semaphore:
            try:
                await asyncio.sleep(REQUEST_DELAY)  # Small delay to spread requests
                
                async with session.post(GROQ_API_URL, headers=headers, json=payload, timeout=30) as response:
                    if response.status == 429:  # Rate limited
                        retry_after = int(response.headers.get('retry-after', 5))
                        await asyncio.sleep(retry_after + 1)
                        continue
                    
                    response.raise_for_status()
                    data = await response.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    
                    return {
                        "prompt_name": prompt_name,
                        "idx": idx,
                        "actual": actual,
                        "predicted": parsed.get("predicted_stars"),
                        "explanation": parsed.get("explanation", ""),
                        "json_valid": True,
                        "raw": content
                    }
                    
            except asyncio.TimeoutError:
                await asyncio.sleep(2 * (attempt + 1))
            except aiohttp.ClientResponseError as e:
                if e.status == 429:
                    await asyncio.sleep(5 * (attempt + 1))
                else:
                    return {
                        "prompt_name": prompt_name,
                        "idx": idx,
                        "actual": actual,
                        "predicted": None,
                        "explanation": "",
                        "json_valid": False,
                        "raw": str(e)
                    }
            except Exception as e:
                if attempt == max_retries - 1:
                    return {
                        "prompt_name": prompt_name,
                        "idx": idx,
                        "actual": actual,
                        "predicted": None,
                        "explanation": "",
                        "json_valid": False,
                        "raw": str(e)
                    }
                await asyncio.sleep(2)
    
    return {
        "prompt_name": prompt_name,
        "idx": idx,
        "actual": actual,
        "predicted": None,
        "explanation": "",
        "json_valid": False,
        "raw": "Max retries exceeded"
    }

async def process_batch(tasks, batch_size=60):
    """Process requests in batches respecting rate limits"""
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    results = []
    
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT, limit_per_host=MAX_CONCURRENT)
    timeout = aiohttp.ClientTimeout(total=60)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        # Process in batches of 60 (matching RPM limit for kimi-k2-instruct)
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i + batch_size]
            batch_start = time.time()
            
            # Create async tasks for this batch
            async_tasks = [
                classify_review_async(session, semaphore, *task)
                for task in batch
            ]
            
            # Execute batch
            batch_results = await asyncio.gather(*async_tasks, return_exceptions=True)
            
            for result in batch_results:
                if isinstance(result, Exception):
                    results.append({
                        "prompt_name": "error",
                        "idx": -1,
                        "actual": None,
                        "predicted": None,
                        "explanation": "",
                        "json_valid": False,
                        "raw": str(result)
                    })
                else:
                    results.append(result)
            
            # Ensure we don't exceed rate limit
            batch_elapsed = time.time() - batch_start
            if batch_elapsed < 60 and i + batch_size < len(tasks):
                # Wait remaining time to respect 30 RPM
                wait_time = max(0, 60 - batch_elapsed)
                if wait_time > 0:
                    print(f"\n⏳ Rate limit pause: {wait_time:.1f}s...")
                    await asyncio.sleep(wait_time)
            
            print(f"\n✓ Processed {min(i + batch_size, len(tasks))}/{len(tasks)} requests")
    
    return results

if __name__ == "__main__":
    all_results = {}
    
    # Prepare all tasks
    all_tasks = []
    for prompt_name, prompt_template in prompts.items():
        for idx in range(len(df)):
            row = df.iloc[idx]
            text = str(row["text"]).replace('\n', ' ')
            all_tasks.append((prompt_name, idx, prompt_template, text, row["stars"]))
    
    # Run async processing
    print(f"\n🚀 Starting async processing of {len(all_tasks)} requests...")
    results = asyncio.run(process_batch(all_tasks, batch_size=60))
    
    # Organize results by prompt
    for prompt_name in prompts.keys():
        prompt_results = [r for r in results if r["prompt_name"] == prompt_name]
        result_df = pd.DataFrame(prompt_results)
        
        # Compute accuracy
        valid = result_df[result_df["predicted"].notnull()]
        accuracy = (valid["actual"] == valid["predicted"]).mean() if len(valid) > 0 else 0
        json_valid_rate = result_df["json_valid"].mean()
        
        all_results[prompt_name] = {
            "accuracy": accuracy,
            "json_valid_rate": json_valid_rate,
            "df": result_df
        }
        
        result_df.to_csv(f"{prompt_name}_groq_outputs.csv", index=False)
    
    table = []
    for name, stats in all_results.items():
        table.append([name, round(stats["accuracy"] * 100, 2), round(stats["json_valid_rate"] * 100, 2)])
    
    comparison_df = pd.DataFrame(table, columns=["Prompt", "Accuracy (%)", "JSON Validity (%)"])
    print(comparison_df.to_string(index=False))
    comparison_df.to_csv("prompt_comparison_results_groq.csv", index=False)
    
    # Show best accuracy
    best_accuracy = max(stats["accuracy"] for stats in all_results.values())
    print(f"\n🎯 Best accuracy: {best_accuracy*100:.1f}%")
    
    print("\n" + "=" * 60)
    print("=== PROMPT APPROACH EXPLANATIONS ===")
    print("=" * 60)
    print("""
Prompt 1 (Few-Shot Learning): 
- Provides concrete examples of each rating level
- Model learns from examples, not just instructions
- Best for pattern recognition

Prompt 2 (Sentiment Anchoring):
- Clear sentiment-to-rating mapping with keywords
- Explicit anchors like "never again" → 1 star
- Best for clear-cut cases

Prompt 3 (Chain-of-Thought):
- Guides model through structured analysis steps
- Step-by-step reasoning process
- Best for nuanced reviews
""")
    print("\n✅ All results saved to CSV files!")
