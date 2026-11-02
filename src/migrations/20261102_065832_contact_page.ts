import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "contact_details_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"address" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "contact_details_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar,
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_subtitle" varchar,
  	"hero_image_id" integer,
  	"details_location" varchar,
  	"map_embed_url" varchar,
  	"map_title" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean DEFAULT false,
  	"meta_canonical" varchar,
  	"_status" "enum_contact_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_contact_v_version_details_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"address" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_v_version_details_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_badge" varchar,
  	"version_hero_title_lead" varchar,
  	"version_hero_title_accent" varchar,
  	"version_hero_subtitle" varchar,
  	"version_hero_image_id" integer,
  	"version_details_location" varchar,
  	"version_map_embed_url" varchar,
  	"version_map_title" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_meta_canonical" varchar,
  	"version__status" "enum__contact_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "contact_details_emails" ADD CONSTRAINT "contact_details_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_details_phones" ADD CONSTRAINT "contact_details_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact" ADD CONSTRAINT "contact_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact" ADD CONSTRAINT "contact_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_v_version_details_emails" ADD CONSTRAINT "_contact_v_version_details_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v_version_details_phones" ADD CONSTRAINT "_contact_v_version_details_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v" ADD CONSTRAINT "_contact_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_v" ADD CONSTRAINT "_contact_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contact_details_emails_order_idx" ON "contact_details_emails" USING btree ("_order");
  CREATE INDEX "contact_details_emails_parent_id_idx" ON "contact_details_emails" USING btree ("_parent_id");
  CREATE INDEX "contact_details_phones_order_idx" ON "contact_details_phones" USING btree ("_order");
  CREATE INDEX "contact_details_phones_parent_id_idx" ON "contact_details_phones" USING btree ("_parent_id");
  CREATE INDEX "contact_hero_hero_image_idx" ON "contact" USING btree ("hero_image_id");
  CREATE INDEX "contact_meta_meta_image_idx" ON "contact" USING btree ("meta_image_id");
  CREATE INDEX "contact__status_idx" ON "contact" USING btree ("_status");
  CREATE INDEX "_contact_v_version_details_emails_order_idx" ON "_contact_v_version_details_emails" USING btree ("_order");
  CREATE INDEX "_contact_v_version_details_emails_parent_id_idx" ON "_contact_v_version_details_emails" USING btree ("_parent_id");
  CREATE INDEX "_contact_v_version_details_phones_order_idx" ON "_contact_v_version_details_phones" USING btree ("_order");
  CREATE INDEX "_contact_v_version_details_phones_parent_id_idx" ON "_contact_v_version_details_phones" USING btree ("_parent_id");
  CREATE INDEX "_contact_v_version_hero_version_hero_image_idx" ON "_contact_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_contact_v_version_meta_version_meta_image_idx" ON "_contact_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_contact_v_version_version__status_idx" ON "_contact_v" USING btree ("version__status");
  CREATE INDEX "_contact_v_created_at_idx" ON "_contact_v" USING btree ("created_at");
  CREATE INDEX "_contact_v_updated_at_idx" ON "_contact_v" USING btree ("updated_at");
  CREATE INDEX "_contact_v_latest_idx" ON "_contact_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_details_emails" CASCADE;
  DROP TABLE "contact_details_phones" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "_contact_v_version_details_emails" CASCADE;
  DROP TABLE "_contact_v_version_details_phones" CASCADE;
  DROP TABLE "_contact_v" CASCADE;
  DROP TYPE "public"."enum_contact_status";
  DROP TYPE "public"."enum__contact_v_version_status";`)
}
