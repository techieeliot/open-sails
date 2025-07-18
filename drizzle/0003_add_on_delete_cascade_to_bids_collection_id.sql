// 0003_add_on_delete_cascade_to_bids_collection_id.sql
-- Add ON DELETE CASCADE to bids.collection_id foreign key
ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_collection_id_fkey;
ALTER TABLE bids ADD CONSTRAINT bids_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;
