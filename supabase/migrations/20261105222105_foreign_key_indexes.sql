-- Support foreign-key lookups and cascade deletes.
-- Apply during a quiet maintenance window: index creation takes write locks.
begin;
set local lock_timeout = '5s';
create index explore_feedback_user_id_fk_idx on public.explore_feedback (user_id);
create index explore_location_requests_neighborhood_id_fk_idx on public.explore_location_requests (neighborhood_id);
create index explore_promotions_user_id_fk_idx on public.explore_promotions (user_id);
create index explore_recent_views_listing_id_fk_idx on public.explore_recent_views (listing_id);
create index explore_trade_confirmations_listing_id_fk_idx on public.explore_trade_confirmations (listing_id);
create index explore_trade_confirmations_user_id_fk_idx on public.explore_trade_confirmations (user_id);
create index favorites_listing_id_fk_idx on public.favorites (listing_id);
create index listing_reports_listing_id_fk_idx on public.listing_reports (listing_id);
create index listing_reports_reviewed_by_fk_idx on public.listing_reports (reviewed_by);
create index listing_reservations_conversation_id_fk_idx on public.listing_reservations (conversation_id);
create index listings_category_id_fk_idx on public.listings (category_id);
create index message_reads_user_id_fk_idx on public.message_reads (user_id);
create index messages_sender_id_fk_idx on public.messages (sender_id);
create index profiles_neighborhood_id_fk_idx on public.profiles (neighborhood_id);
create index trade_feedback_reviewer_id_fk_idx on public.trade_feedback (reviewer_id);
commit;
