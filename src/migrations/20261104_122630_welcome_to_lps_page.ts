import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_welcome_to_lps_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__welcome_to_lps_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "welcome_to_lps_intro_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "welcome_to_lps_crests_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "welcome_to_lps_welcome_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "welcome_to_lps_values_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "welcome_to_lps_story_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"period" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "welcome_to_lps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar,
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_subtitle" varchar,
  	"hero_image_id" integer,
  	"banner_image_id" integer,
  	"welcome_image_id" integer,
  	"welcome_title_lead" varchar,
  	"welcome_title_accent" varchar,
  	"welcome_signatory_name" varchar,
  	"welcome_signatory_role" varchar,
  	"values_title" varchar,
  	"story_title_lead" varchar,
  	"story_title_accent" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean DEFAULT false,
  	"meta_canonical" varchar,
  	"_status" "enum_welcome_to_lps_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_welcome_to_lps_v_version_intro_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_welcome_to_lps_v_version_crests_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_welcome_to_lps_v_version_welcome_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_welcome_to_lps_v_version_values_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_welcome_to_lps_v_version_story_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"period" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_welcome_to_lps_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_badge" varchar,
  	"version_hero_title_lead" varchar,
  	"version_hero_title_accent" varchar,
  	"version_hero_subtitle" varchar,
  	"version_hero_image_id" integer,
  	"version_banner_image_id" integer,
  	"version_welcome_image_id" integer,
  	"version_welcome_title_lead" varchar,
  	"version_welcome_title_accent" varchar,
  	"version_welcome_signatory_name" varchar,
  	"version_welcome_signatory_role" varchar,
  	"version_values_title" varchar,
  	"version_story_title_lead" varchar,
  	"version_story_title_accent" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_meta_canonical" varchar,
  	"version__status" "enum__welcome_to_lps_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "welcome_to_lps_intro_paragraphs" ADD CONSTRAINT "welcome_to_lps_intro_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."welcome_to_lps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "welcome_to_lps_crests_cards" ADD CONSTRAINT "welcome_to_lps_crests_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "welcome_to_lps_crests_cards" ADD CONSTRAINT "welcome_to_lps_crests_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."welcome_to_lps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "welcome_to_lps_welcome_paragraphs" ADD CONSTRAINT "welcome_to_lps_welcome_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."welcome_to_lps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "welcome_to_lps_values_items" ADD CONSTRAINT "welcome_to_lps_values_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."welcome_to_lps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "welcome_to_lps_story_slides" ADD CONSTRAINT "welcome_to_lps_story_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "welcome_to_lps_story_slides" ADD CONSTRAINT "welcome_to_lps_story_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."welcome_to_lps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "welcome_to_lps" ADD CONSTRAINT "welcome_to_lps_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "welcome_to_lps" ADD CONSTRAINT "welcome_to_lps_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "welcome_to_lps" ADD CONSTRAINT "welcome_to_lps_welcome_image_id_media_id_fk" FOREIGN KEY ("welcome_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "welcome_to_lps" ADD CONSTRAINT "welcome_to_lps_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v_version_intro_paragraphs" ADD CONSTRAINT "_welcome_to_lps_v_version_intro_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_welcome_to_lps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v_version_crests_cards" ADD CONSTRAINT "_welcome_to_lps_v_version_crests_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v_version_crests_cards" ADD CONSTRAINT "_welcome_to_lps_v_version_crests_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_welcome_to_lps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v_version_welcome_paragraphs" ADD CONSTRAINT "_welcome_to_lps_v_version_welcome_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_welcome_to_lps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v_version_values_items" ADD CONSTRAINT "_welcome_to_lps_v_version_values_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_welcome_to_lps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v_version_story_slides" ADD CONSTRAINT "_welcome_to_lps_v_version_story_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v_version_story_slides" ADD CONSTRAINT "_welcome_to_lps_v_version_story_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_welcome_to_lps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v" ADD CONSTRAINT "_welcome_to_lps_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v" ADD CONSTRAINT "_welcome_to_lps_v_version_banner_image_id_media_id_fk" FOREIGN KEY ("version_banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v" ADD CONSTRAINT "_welcome_to_lps_v_version_welcome_image_id_media_id_fk" FOREIGN KEY ("version_welcome_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_welcome_to_lps_v" ADD CONSTRAINT "_welcome_to_lps_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "welcome_to_lps_intro_paragraphs_order_idx" ON "welcome_to_lps_intro_paragraphs" USING btree ("_order");
  CREATE INDEX "welcome_to_lps_intro_paragraphs_parent_id_idx" ON "welcome_to_lps_intro_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "welcome_to_lps_crests_cards_order_idx" ON "welcome_to_lps_crests_cards" USING btree ("_order");
  CREATE INDEX "welcome_to_lps_crests_cards_parent_id_idx" ON "welcome_to_lps_crests_cards" USING btree ("_parent_id");
  CREATE INDEX "welcome_to_lps_crests_cards_image_idx" ON "welcome_to_lps_crests_cards" USING btree ("image_id");
  CREATE INDEX "welcome_to_lps_welcome_paragraphs_order_idx" ON "welcome_to_lps_welcome_paragraphs" USING btree ("_order");
  CREATE INDEX "welcome_to_lps_welcome_paragraphs_parent_id_idx" ON "welcome_to_lps_welcome_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "welcome_to_lps_values_items_order_idx" ON "welcome_to_lps_values_items" USING btree ("_order");
  CREATE INDEX "welcome_to_lps_values_items_parent_id_idx" ON "welcome_to_lps_values_items" USING btree ("_parent_id");
  CREATE INDEX "welcome_to_lps_story_slides_order_idx" ON "welcome_to_lps_story_slides" USING btree ("_order");
  CREATE INDEX "welcome_to_lps_story_slides_parent_id_idx" ON "welcome_to_lps_story_slides" USING btree ("_parent_id");
  CREATE INDEX "welcome_to_lps_story_slides_image_idx" ON "welcome_to_lps_story_slides" USING btree ("image_id");
  CREATE INDEX "welcome_to_lps_hero_hero_image_idx" ON "welcome_to_lps" USING btree ("hero_image_id");
  CREATE INDEX "welcome_to_lps_banner_banner_image_idx" ON "welcome_to_lps" USING btree ("banner_image_id");
  CREATE INDEX "welcome_to_lps_welcome_welcome_image_idx" ON "welcome_to_lps" USING btree ("welcome_image_id");
  CREATE INDEX "welcome_to_lps_meta_meta_image_idx" ON "welcome_to_lps" USING btree ("meta_image_id");
  CREATE INDEX "welcome_to_lps__status_idx" ON "welcome_to_lps" USING btree ("_status");
  CREATE INDEX "_welcome_to_lps_v_version_intro_paragraphs_order_idx" ON "_welcome_to_lps_v_version_intro_paragraphs" USING btree ("_order");
  CREATE INDEX "_welcome_to_lps_v_version_intro_paragraphs_parent_id_idx" ON "_welcome_to_lps_v_version_intro_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_welcome_to_lps_v_version_crests_cards_order_idx" ON "_welcome_to_lps_v_version_crests_cards" USING btree ("_order");
  CREATE INDEX "_welcome_to_lps_v_version_crests_cards_parent_id_idx" ON "_welcome_to_lps_v_version_crests_cards" USING btree ("_parent_id");
  CREATE INDEX "_welcome_to_lps_v_version_crests_cards_image_idx" ON "_welcome_to_lps_v_version_crests_cards" USING btree ("image_id");
  CREATE INDEX "_welcome_to_lps_v_version_welcome_paragraphs_order_idx" ON "_welcome_to_lps_v_version_welcome_paragraphs" USING btree ("_order");
  CREATE INDEX "_welcome_to_lps_v_version_welcome_paragraphs_parent_id_idx" ON "_welcome_to_lps_v_version_welcome_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_welcome_to_lps_v_version_values_items_order_idx" ON "_welcome_to_lps_v_version_values_items" USING btree ("_order");
  CREATE INDEX "_welcome_to_lps_v_version_values_items_parent_id_idx" ON "_welcome_to_lps_v_version_values_items" USING btree ("_parent_id");
  CREATE INDEX "_welcome_to_lps_v_version_story_slides_order_idx" ON "_welcome_to_lps_v_version_story_slides" USING btree ("_order");
  CREATE INDEX "_welcome_to_lps_v_version_story_slides_parent_id_idx" ON "_welcome_to_lps_v_version_story_slides" USING btree ("_parent_id");
  CREATE INDEX "_welcome_to_lps_v_version_story_slides_image_idx" ON "_welcome_to_lps_v_version_story_slides" USING btree ("image_id");
  CREATE INDEX "_welcome_to_lps_v_version_hero_version_hero_image_idx" ON "_welcome_to_lps_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_welcome_to_lps_v_version_banner_version_banner_image_idx" ON "_welcome_to_lps_v" USING btree ("version_banner_image_id");
  CREATE INDEX "_welcome_to_lps_v_version_welcome_version_welcome_image_idx" ON "_welcome_to_lps_v" USING btree ("version_welcome_image_id");
  CREATE INDEX "_welcome_to_lps_v_version_meta_version_meta_image_idx" ON "_welcome_to_lps_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_welcome_to_lps_v_version_version__status_idx" ON "_welcome_to_lps_v" USING btree ("version__status");
  CREATE INDEX "_welcome_to_lps_v_created_at_idx" ON "_welcome_to_lps_v" USING btree ("created_at");
  CREATE INDEX "_welcome_to_lps_v_updated_at_idx" ON "_welcome_to_lps_v" USING btree ("updated_at");
  CREATE INDEX "_welcome_to_lps_v_latest_idx" ON "_welcome_to_lps_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "welcome_to_lps_intro_paragraphs" CASCADE;
  DROP TABLE "welcome_to_lps_crests_cards" CASCADE;
  DROP TABLE "welcome_to_lps_welcome_paragraphs" CASCADE;
  DROP TABLE "welcome_to_lps_values_items" CASCADE;
  DROP TABLE "welcome_to_lps_story_slides" CASCADE;
  DROP TABLE "welcome_to_lps" CASCADE;
  DROP TABLE "_welcome_to_lps_v_version_intro_paragraphs" CASCADE;
  DROP TABLE "_welcome_to_lps_v_version_crests_cards" CASCADE;
  DROP TABLE "_welcome_to_lps_v_version_welcome_paragraphs" CASCADE;
  DROP TABLE "_welcome_to_lps_v_version_values_items" CASCADE;
  DROP TABLE "_welcome_to_lps_v_version_story_slides" CASCADE;
  DROP TABLE "_welcome_to_lps_v" CASCADE;
  DROP TYPE "public"."enum_welcome_to_lps_status";
  DROP TYPE "public"."enum__welcome_to_lps_v_version_status";`)
}
