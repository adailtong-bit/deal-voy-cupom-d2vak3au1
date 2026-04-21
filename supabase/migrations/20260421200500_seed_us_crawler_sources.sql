DO $US_SOURCES$
BEGIN
  -- Fast Food & Restaurants (USA)
  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.mcdonalds.com/us/en-us/deals.html') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('McDonald''s US Deals', 'https://www.mcdonalds.com/us/en-us/deals.html', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.burgerking.com/deals') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Burger King US Deals', 'https://www.burgerking.com/deals', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.wendys.com/offers') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Wendy''s US Offers', 'https://www.wendys.com/offers', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.tacobell.com/offers') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Taco Bell US Offers', 'https://www.tacobell.com/offers', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.subway.com/en-us/rewards') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Subway US Rewards', 'https://www.subway.com/en-us/rewards', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.dominos.com/en/pages/offers/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Domino''s US Offers', 'https://www.dominos.com/en/pages/offers/', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.pizzahut.com/index.php?#/menu/coupons/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Pizza Hut US Coupons', 'https://www.pizzahut.com/index.php?#/menu/coupons/', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.papajohns.com/order/specials') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Papa Johns US Specials', 'https://www.papajohns.com/order/specials', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.kfc.com/menu/deals') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('KFC US Deals', 'https://www.kfc.com/menu/deals', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.sonicdrivein.com/deals/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Sonic Drive-In US Deals', 'https://www.sonicdrivein.com/deals/', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.panerabread.com/en-us/featured-menu/promotions.html') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Panera Bread Promotions', 'https://www.panerabread.com/en-us/featured-menu/promotions.html', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.dunkindonuts.com/en/offers') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Dunkin'' Donuts Offers', 'https://www.dunkindonuts.com/en/offers', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.starbucks.com/rewards') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Starbucks Rewards', 'https://www.starbucks.com/rewards', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  -- Grocery & Supermarkets (USA)
  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.kroger.com/cl/coupons/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Kroger US Coupons', 'https://www.kroger.com/cl/coupons/', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.publix.com/savings') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Publix US Savings', 'https://www.publix.com/savings', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.albertsons.com/savings.html') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Albertsons US Savings', 'https://www.albertsons.com/savings.html', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.safeway.com/shop/deals.html') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Safeway US Deals', 'https://www.safeway.com/shop/deals.html', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.aldi.us/en/weekly-specials/our-weekly-ads/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Aldi US Weekly Ads', 'https://www.aldi.us/en/weekly-specials/our-weekly-ads/', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.heb.com/weekly-ad') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('HEB US Weekly Ad', 'https://www.heb.com/weekly-ad', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.meijer.com/shop/en/coupons') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Meijer US Coupons', 'https://www.meijer.com/shop/en/coupons', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.wholefoodsmarket.com/sales-flyer') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Whole Foods US Sales', 'https://www.wholefoodsmarket.com/sales-flyer', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.traderjoes.com/home/sales') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Trader Joe''s US Sales', 'https://www.traderjoes.com/home/sales', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.wegmans.com/savings/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Wegmans US Savings', 'https://www.wegmans.com/savings/', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.hy-vee.com/deals/coupons') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Hy-Vee Coupons', 'https://www.hy-vee.com/deals/coupons', 'web', 'active', 'Alimentação', 'USA', 50);
  END IF;

  -- Pharmacies & Convenience (USA)
  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.cvs.com/weeklyad/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('CVS Weekly Ad', 'https://www.cvs.com/weeklyad/', 'web', 'active', 'Saúde', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.walgreens.com/offers/offers.jsp') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Walgreens Offers', 'https://www.walgreens.com/offers/offers.jsp', 'web', 'active', 'Saúde', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.riteaid.com/shop/online-deals') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Rite Aid Deals', 'https://www.riteaid.com/shop/online-deals', 'web', 'active', 'Saúde', 'USA', 50);
  END IF;

  -- Deal Aggregators (USA)
  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://slickdeals.net/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Slickdeals US', 'https://slickdeals.net/', 'web', 'active', 'Geral', 'USA', 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.retailmenot.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('RetailMeNot US', 'https://www.retailmenot.com/', 'web', 'active', 'Geral', 'USA', 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.groupon.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Groupon US', 'https://www.groupon.com/', 'web', 'active', 'Geral', 'USA', 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://hip2save.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Hip2Save US', 'https://hip2save.com/', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.krazycouponlady.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Krazy Coupon Lady', 'https://www.krazycouponlady.com/', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://bensbargains.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Bens Bargains', 'https://bensbargains.com/', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://dealnews.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('DealNews US', 'https://dealnews.com/', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.coupons.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Coupons.com', 'https://www.coupons.com/', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.bradsdeals.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Brad''s Deals', 'https://www.bradsdeals.com/', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.offers.com/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Offers.com', 'https://www.offers.com/', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  -- Retailers (USA)
  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.target.com/c/target-circle/-/N-pzno9') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Target US Circle Deals', 'https://www.target.com/c/target-circle/-/N-pzno9', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.walmart.com/deals') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Walmart US Deals', 'https://www.walmart.com/deals', 'web', 'active', 'Geral', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.bestbuy.com/site/electronics/top-deals/pcmcat1563299784494.c') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Best Buy US Top Deals', 'https://www.bestbuy.com/site/electronics/top-deals/pcmcat1563299784494.c', 'web', 'active', 'Tecnologia', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.amazon.com/deals') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Amazon US Deals', 'https://www.amazon.com/deals', 'web', 'active', 'Geral', 'USA', 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.macys.com/p/coupons/') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Macy''s Coupons', 'https://www.macys.com/p/coupons/', 'web', 'active', 'Moda', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.kohls.com/feature/coupons.jsp') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Kohl''s Coupons', 'https://www.kohls.com/feature/coupons.jsp', 'web', 'active', 'Moda', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.jcpenney.com/offers') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('JCPenney Offers', 'https://www.jcpenney.com/offers', 'web', 'active', 'Moda', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.homedepot.com/c/Coupons') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Home Depot Coupons', 'https://www.homedepot.com/c/Coupons', 'web', 'active', 'Casa', 'USA', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.lowes.com/c/Savings') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, country, max_results)
    VALUES ('Lowe''s Savings', 'https://www.lowes.com/c/Savings', 'web', 'active', 'Casa', 'USA', 50);
  END IF;

END $US_SOURCES$;
