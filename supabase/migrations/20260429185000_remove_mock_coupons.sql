DO $$
BEGIN
  DELETE FROM public.coupons 
  WHERE title IN ('50% Off Burger', '10% Off Electronics', 'Buy 1 Get 1 Free Shoes') 
     OR store_name IN ('Burger King', 'Tech Store', 'Shoe Store');

  DELETE FROM public.discovered_promotions 
  WHERE title IN ('50% Off Burger', '10% Off Electronics', 'Buy 1 Get 1 Free Shoes') 
     OR store_name IN ('Burger King', 'Tech Store', 'Shoe Store');
END $$;
