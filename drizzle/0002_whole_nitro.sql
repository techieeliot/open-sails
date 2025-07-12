ALTER TABLE "bids" DROP CONSTRAINT "bids_collection_id_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;