DO $DO$
BEGIN
  INSERT INTO public.crawler_sources (name, url, type, region, country, status, category)
  SELECT * FROM (VALUES 
    ('Walmart Deals', 'https://www.walmart.com/shop/deals', 'web', 'Nationwide', 'US', 'active', 'Geral'),
    ('Target Top Deals', 'https://www.target.com/c/top-deals/-/N-4xw74', 'web', 'Nationwide', 'US', 'active', 'Geral'),
    ('Best Buy Top Deals', 'https://www.bestbuy.com/site/deals/top-deals/pcmcat1563299784494.c', 'web', 'Nationwide', 'US', 'active', 'Tecnologia'),
    ('Kroger Rollbacks', 'https://www.kroger.com/pr/savings', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Walgreens Weekly Ad', 'https://www.walgreens.com/offers/offers.jsp', 'web', 'Nationwide', 'US', 'active', 'Geral'),
    ('CVS Weekly Ad', 'https://www.cvs.com/weeklyad', 'web', 'Nationwide', 'US', 'active', 'Geral'),
    ('Whole Foods Weekly Sales', 'https://www.wholefoodsmarket.com/sales-flyer', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('McDonalds Offers', 'https://www.mcdonalds.com/us/en-us/deals.html', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Burger King Offers', 'https://www.bk.com/offers', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Wendys Offers', 'https://www.wendys.com/offers', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Taco Bell Offers', 'https://www.tacobell.com/offers-and-deals', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Subway Offers', 'https://www.subway.com/en-us/promotions', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Dominos Deals', 'https://www.dominos.com/en/pages/order/coupon', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Pizza Hut Deals', 'https://www.pizzahut.com/link/deals', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Papa Johns Deals', 'https://www.papajohns.com/order/specials', 'web', 'Nationwide', 'US', 'active', 'Alimentação'),
    ('Starbucks Offers', 'https://www.starbucks.com/rewards', 'web', 'Nationwide', 'US', 'active', 'Alimentação')
  ) AS v(name, url, type, region, country, status, category)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.crawler_sources WHERE url = v.url
  );
END $DO$;
