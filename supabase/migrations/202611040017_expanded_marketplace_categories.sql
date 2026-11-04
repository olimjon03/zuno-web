-- Add physical-goods categories without changing existing category IDs or listings.
-- Safe to rerun: slug remains the stable database identity.
begin;
insert into public.categories (slug, name_en, name_ko, sort_order) values
  ('electronics', 'Electronics', '디지털기기', 1),
  ('home-living', 'Home & Living', '가구·생활', 2),
  ('fashion', 'Fashion', '패션', 3),
  ('sports', 'Sports', '스포츠', 4),
  ('books', 'Books', '도서', 5),
  ('phones-tablets', 'Phones & Tablets', '휴대폰·태블릿', 6),
  ('computers', 'Computers', '컴퓨터', 7),
  ('furniture', 'Furniture', '가구', 8),
  ('appliances', 'Appliances', '가전제품', 9),
  ('baby-kids', 'Baby & Kids', '유아·아동용품', 10),
  ('beauty-care', 'Beauty & Care', '뷰티·미용', 11),
  ('pet-supplies', 'Pet Supplies', '반려동물용품', 12),
  ('outdoor-camping', 'Outdoor & Camping', '캠핑·아웃도어', 13),
  ('tools-diy', 'Tools & DIY', '공구·DIY', 14),
  ('games-hobbies', 'Games & Hobbies', '게임·취미', 15),
  ('musical-instruments', 'Musical Instruments', '악기', 16),
  ('other', 'Other', '기타', 17)
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_ko = excluded.name_ko,
  sort_order = excluded.sort_order;
commit;
