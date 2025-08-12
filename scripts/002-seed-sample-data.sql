-- Insert sample keywords for testing
INSERT INTO keywords (name) VALUES 
('weight loss for women'),
('keto diet cookbook'),
('mindfulness meditation'),
('small business marketing'),
('dog training guide')
ON CONFLICT (name) DO NOTHING;

-- Insert sample books (using placeholder data)
WITH keyword_ids AS (
  SELECT id, name FROM keywords WHERE name IN (
    'weight loss for women', 
    'keto diet cookbook', 
    'mindfulness meditation'
  )
)
INSERT INTO books (keyword_id, asin, title, publisher, price, current_bsr, review_count, publication_date)
SELECT 
  k.id,
  'B0' || LPAD((ROW_NUMBER() OVER())::text, 8, '0'),
  CASE k.name
    WHEN 'weight loss for women' THEN 'The Complete Weight Loss Guide for Women Over 40'
    WHEN 'keto diet cookbook' THEN 'Easy Keto Recipes: 100 Delicious Low-Carb Meals'
    WHEN 'mindfulness meditation' THEN 'Mindful Living: A Beginner''s Guide to Meditation'
  END,
  'Independent Publisher',
  CASE k.name
    WHEN 'weight loss for women' THEN 12.99
    WHEN 'keto diet cookbook' THEN 15.99
    WHEN 'mindfulness meditation' THEN 9.99
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 25000
    WHEN 'keto diet cookbook' THEN 15000
    WHEN 'mindfulness meditation' THEN 45000
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 127
    WHEN 'keto diet cookbook' THEN 89
    WHEN 'mindfulness meditation' THEN 234
  END,
  CURRENT_DATE - INTERVAL '6 months'
FROM keyword_ids k
ON CONFLICT (asin) DO NOTHING;

-- Insert sample keyword metrics
INSERT INTO keyword_metrics (
  keyword_id, 
  total_sales, 
  self_pub_sales, 
  demand_trend, 
  royalties, 
  new_publications_30d, 
  supply_trend, 
  success_rate, 
  self_pub_percentage, 
  opportunity_score
)
SELECT 
  k.id,
  CASE k.name
    WHEN 'weight loss for women' THEN 15000
    WHEN 'keto diet cookbook' THEN 22000
    WHEN 'mindfulness meditation' THEN 8500
    ELSE 5000
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 12000
    WHEN 'keto diet cookbook' THEN 18000
    WHEN 'mindfulness meditation' THEN 7000
    ELSE 4000
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 'rising'
    WHEN 'keto diet cookbook' THEN 'stable'
    WHEN 'mindfulness meditation' THEN 'declining'
    ELSE 'stable'
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 45000.00
    WHEN 'keto diet cookbook' THEN 67000.00
    WHEN 'mindfulness meditation' THEN 28000.00
    ELSE 15000.00
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 45
    WHEN 'keto diet cookbook' THEN 32
    WHEN 'mindfulness meditation' THEN 67
    ELSE 25
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 'rising'
    WHEN 'keto diet cookbook' THEN 'stable'
    WHEN 'mindfulness meditation' THEN 'rising'
    ELSE 'stable'
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 78.5
    WHEN 'keto diet cookbook' THEN 65.2
    WHEN 'mindfulness meditation' THEN 45.8
    ELSE 50.0
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 80.0
    WHEN 'keto diet cookbook' THEN 81.8
    WHEN 'mindfulness meditation' THEN 82.4
    ELSE 75.0
  END,
  CASE k.name
    WHEN 'weight loss for women' THEN 85.2
    WHEN 'keto diet cookbook' THEN 72.8
    WHEN 'mindfulness meditation' THEN 58.3
    ELSE 60.0
  END
FROM keywords k
ON CONFLICT (keyword_id) DO NOTHING;
