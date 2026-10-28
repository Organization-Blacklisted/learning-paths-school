import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_social_url" varchar,
  	"sizes_social_width" numeric,
  	"sizes_social_height" numeric,
  	"sizes_social_mime_type" varchar,
  	"sizes_social_filesize" numeric,
  	"sizes_social_filename" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"lead" varchar,
  	"quote" varchar
  );
  
  CREATE TABLE "home_vision_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "home_courage_rotating_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"word" varchar
  );
  
  CREATE TABLE "home_courage_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "home_journey_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"level" varchar,
  	"range" varchar,
  	"path_prefix" varchar,
  	"path" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "home_framework_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_ecosystem_tabs_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_ecosystem_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "home_alumni_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_alumni_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"institution" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "home_news_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"excerpt" varchar,
  	"href" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "home_marquee_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"courage_title_lead" varchar,
  	"courage_title_accent" varchar,
  	"journey_badge" varchar,
  	"journey_title_lead" varchar,
  	"journey_title_accent" varchar,
  	"journey_intro" varchar,
  	"framework_badge" varchar,
  	"framework_title_lead" varchar,
  	"framework_title_accent" varchar,
  	"framework_intro" varchar,
  	"framework_centre_photo_id" integer,
  	"framework_centre_label" varchar,
  	"ecosystem_badge" varchar,
  	"ecosystem_title_lead" varchar,
  	"ecosystem_title_accent" varchar,
  	"ecosystem_intro" varchar,
  	"alumni_badge" varchar,
  	"alumni_title_start" varchar,
  	"alumni_title_accent" varchar,
  	"alumni_title_second_line" varchar,
  	"campus_badge" varchar,
  	"campus_title_start" varchar,
  	"campus_title_accent" varchar,
  	"campus_title_end" varchar,
  	"campus_intro" varchar,
  	"campus_poster_id" integer,
  	"campus_tag" varchar,
  	"news_badge" varchar,
  	"news_title_lead" varchar,
  	"news_title_accent" varchar,
  	"news_intro" varchar,
  	"cta_badge" varchar,
  	"cta_title_lead" varchar,
  	"cta_title_accent" varchar,
  	"cta_text" varchar,
  	"cta_button_label" varchar,
  	"cta_button_href" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean DEFAULT false,
  	"meta_canonical" varchar,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_v_version_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"lead" varchar,
  	"quote" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_vision_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_courage_rotating_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"word" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_courage_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_journey_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"level" varchar,
  	"range" varchar,
  	"path_prefix" varchar,
  	"path" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_framework_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_ecosystem_tabs_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_ecosystem_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_alumni_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_alumni_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"institution" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_news_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"excerpt" varchar,
  	"href" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_marquee_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_courage_title_lead" varchar,
  	"version_courage_title_accent" varchar,
  	"version_journey_badge" varchar,
  	"version_journey_title_lead" varchar,
  	"version_journey_title_accent" varchar,
  	"version_journey_intro" varchar,
  	"version_framework_badge" varchar,
  	"version_framework_title_lead" varchar,
  	"version_framework_title_accent" varchar,
  	"version_framework_intro" varchar,
  	"version_framework_centre_photo_id" integer,
  	"version_framework_centre_label" varchar,
  	"version_ecosystem_badge" varchar,
  	"version_ecosystem_title_lead" varchar,
  	"version_ecosystem_title_accent" varchar,
  	"version_ecosystem_intro" varchar,
  	"version_alumni_badge" varchar,
  	"version_alumni_title_start" varchar,
  	"version_alumni_title_accent" varchar,
  	"version_alumni_title_second_line" varchar,
  	"version_campus_badge" varchar,
  	"version_campus_title_start" varchar,
  	"version_campus_title_accent" varchar,
  	"version_campus_title_end" varchar,
  	"version_campus_intro" varchar,
  	"version_campus_poster_id" integer,
  	"version_campus_tag" varchar,
  	"version_news_badge" varchar,
  	"version_news_title_lead" varchar,
  	"version_news_title_accent" varchar,
  	"version_news_intro" varchar,
  	"version_cta_badge" varchar,
  	"version_cta_title_lead" varchar,
  	"version_cta_title_accent" varchar,
  	"version_cta_text" varchar,
  	"version_cta_button_label" varchar,
  	"version_cta_button_href" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_meta_canonical" varchar,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_hero_slides" ADD CONSTRAINT "home_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_hero_slides" ADD CONSTRAINT "home_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_vision_items" ADD CONSTRAINT "home_vision_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_courage_rotating_words" ADD CONSTRAINT "home_courage_rotating_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_courage_photos" ADD CONSTRAINT "home_courage_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_courage_photos" ADD CONSTRAINT "home_courage_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_journey_stages" ADD CONSTRAINT "home_journey_stages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_journey_stages" ADD CONSTRAINT "home_journey_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_framework_items" ADD CONSTRAINT "home_framework_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_ecosystem_tabs_bullets" ADD CONSTRAINT "home_ecosystem_tabs_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_ecosystem_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_ecosystem_tabs" ADD CONSTRAINT "home_ecosystem_tabs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_ecosystem_tabs" ADD CONSTRAINT "home_ecosystem_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_alumni_paragraphs" ADD CONSTRAINT "home_alumni_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_alumni_people" ADD CONSTRAINT "home_alumni_people_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_alumni_people" ADD CONSTRAINT "home_alumni_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_news_items" ADD CONSTRAINT "home_news_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_news_items" ADD CONSTRAINT "home_news_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_marquee_images" ADD CONSTRAINT "home_marquee_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_marquee_images" ADD CONSTRAINT "home_marquee_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_framework_centre_photo_id_media_id_fk" FOREIGN KEY ("framework_centre_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_campus_poster_id_media_id_fk" FOREIGN KEY ("campus_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_hero_slides" ADD CONSTRAINT "_home_v_version_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_hero_slides" ADD CONSTRAINT "_home_v_version_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_vision_items" ADD CONSTRAINT "_home_v_version_vision_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_courage_rotating_words" ADD CONSTRAINT "_home_v_version_courage_rotating_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_courage_photos" ADD CONSTRAINT "_home_v_version_courage_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_courage_photos" ADD CONSTRAINT "_home_v_version_courage_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_journey_stages" ADD CONSTRAINT "_home_v_version_journey_stages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_journey_stages" ADD CONSTRAINT "_home_v_version_journey_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_framework_items" ADD CONSTRAINT "_home_v_version_framework_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_ecosystem_tabs_bullets" ADD CONSTRAINT "_home_v_version_ecosystem_tabs_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_version_ecosystem_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_ecosystem_tabs" ADD CONSTRAINT "_home_v_version_ecosystem_tabs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_ecosystem_tabs" ADD CONSTRAINT "_home_v_version_ecosystem_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_alumni_paragraphs" ADD CONSTRAINT "_home_v_version_alumni_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_alumni_people" ADD CONSTRAINT "_home_v_version_alumni_people_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_alumni_people" ADD CONSTRAINT "_home_v_version_alumni_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_news_items" ADD CONSTRAINT "_home_v_version_news_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_news_items" ADD CONSTRAINT "_home_v_version_news_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_marquee_images" ADD CONSTRAINT "_home_v_version_marquee_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_marquee_images" ADD CONSTRAINT "_home_v_version_marquee_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_framework_centre_photo_id_media_id_fk" FOREIGN KEY ("version_framework_centre_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_campus_poster_id_media_id_fk" FOREIGN KEY ("version_campus_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_social_sizes_social_filename_idx" ON "media" USING btree ("sizes_social_filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_hero_slides_order_idx" ON "home_hero_slides" USING btree ("_order");
  CREATE INDEX "home_hero_slides_parent_id_idx" ON "home_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "home_hero_slides_image_idx" ON "home_hero_slides" USING btree ("image_id");
  CREATE INDEX "home_vision_items_order_idx" ON "home_vision_items" USING btree ("_order");
  CREATE INDEX "home_vision_items_parent_id_idx" ON "home_vision_items" USING btree ("_parent_id");
  CREATE INDEX "home_courage_rotating_words_order_idx" ON "home_courage_rotating_words" USING btree ("_order");
  CREATE INDEX "home_courage_rotating_words_parent_id_idx" ON "home_courage_rotating_words" USING btree ("_parent_id");
  CREATE INDEX "home_courage_photos_order_idx" ON "home_courage_photos" USING btree ("_order");
  CREATE INDEX "home_courage_photos_parent_id_idx" ON "home_courage_photos" USING btree ("_parent_id");
  CREATE INDEX "home_courage_photos_image_idx" ON "home_courage_photos" USING btree ("image_id");
  CREATE INDEX "home_journey_stages_order_idx" ON "home_journey_stages" USING btree ("_order");
  CREATE INDEX "home_journey_stages_parent_id_idx" ON "home_journey_stages" USING btree ("_parent_id");
  CREATE INDEX "home_journey_stages_image_idx" ON "home_journey_stages" USING btree ("image_id");
  CREATE INDEX "home_framework_items_order_idx" ON "home_framework_items" USING btree ("_order");
  CREATE INDEX "home_framework_items_parent_id_idx" ON "home_framework_items" USING btree ("_parent_id");
  CREATE INDEX "home_ecosystem_tabs_bullets_order_idx" ON "home_ecosystem_tabs_bullets" USING btree ("_order");
  CREATE INDEX "home_ecosystem_tabs_bullets_parent_id_idx" ON "home_ecosystem_tabs_bullets" USING btree ("_parent_id");
  CREATE INDEX "home_ecosystem_tabs_order_idx" ON "home_ecosystem_tabs" USING btree ("_order");
  CREATE INDEX "home_ecosystem_tabs_parent_id_idx" ON "home_ecosystem_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_ecosystem_tabs_image_idx" ON "home_ecosystem_tabs" USING btree ("image_id");
  CREATE INDEX "home_alumni_paragraphs_order_idx" ON "home_alumni_paragraphs" USING btree ("_order");
  CREATE INDEX "home_alumni_paragraphs_parent_id_idx" ON "home_alumni_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "home_alumni_people_order_idx" ON "home_alumni_people" USING btree ("_order");
  CREATE INDEX "home_alumni_people_parent_id_idx" ON "home_alumni_people" USING btree ("_parent_id");
  CREATE INDEX "home_alumni_people_image_idx" ON "home_alumni_people" USING btree ("image_id");
  CREATE INDEX "home_news_items_order_idx" ON "home_news_items" USING btree ("_order");
  CREATE INDEX "home_news_items_parent_id_idx" ON "home_news_items" USING btree ("_parent_id");
  CREATE INDEX "home_news_items_image_idx" ON "home_news_items" USING btree ("image_id");
  CREATE INDEX "home_marquee_images_order_idx" ON "home_marquee_images" USING btree ("_order");
  CREATE INDEX "home_marquee_images_parent_id_idx" ON "home_marquee_images" USING btree ("_parent_id");
  CREATE INDEX "home_marquee_images_image_idx" ON "home_marquee_images" USING btree ("image_id");
  CREATE INDEX "home_framework_framework_centre_photo_idx" ON "home" USING btree ("framework_centre_photo_id");
  CREATE INDEX "home_campus_campus_poster_idx" ON "home" USING btree ("campus_poster_id");
  CREATE INDEX "home_meta_meta_image_idx" ON "home" USING btree ("meta_image_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "_home_v_version_hero_slides_order_idx" ON "_home_v_version_hero_slides" USING btree ("_order");
  CREATE INDEX "_home_v_version_hero_slides_parent_id_idx" ON "_home_v_version_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_hero_slides_image_idx" ON "_home_v_version_hero_slides" USING btree ("image_id");
  CREATE INDEX "_home_v_version_vision_items_order_idx" ON "_home_v_version_vision_items" USING btree ("_order");
  CREATE INDEX "_home_v_version_vision_items_parent_id_idx" ON "_home_v_version_vision_items" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_courage_rotating_words_order_idx" ON "_home_v_version_courage_rotating_words" USING btree ("_order");
  CREATE INDEX "_home_v_version_courage_rotating_words_parent_id_idx" ON "_home_v_version_courage_rotating_words" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_courage_photos_order_idx" ON "_home_v_version_courage_photos" USING btree ("_order");
  CREATE INDEX "_home_v_version_courage_photos_parent_id_idx" ON "_home_v_version_courage_photos" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_courage_photos_image_idx" ON "_home_v_version_courage_photos" USING btree ("image_id");
  CREATE INDEX "_home_v_version_journey_stages_order_idx" ON "_home_v_version_journey_stages" USING btree ("_order");
  CREATE INDEX "_home_v_version_journey_stages_parent_id_idx" ON "_home_v_version_journey_stages" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_journey_stages_image_idx" ON "_home_v_version_journey_stages" USING btree ("image_id");
  CREATE INDEX "_home_v_version_framework_items_order_idx" ON "_home_v_version_framework_items" USING btree ("_order");
  CREATE INDEX "_home_v_version_framework_items_parent_id_idx" ON "_home_v_version_framework_items" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_ecosystem_tabs_bullets_order_idx" ON "_home_v_version_ecosystem_tabs_bullets" USING btree ("_order");
  CREATE INDEX "_home_v_version_ecosystem_tabs_bullets_parent_id_idx" ON "_home_v_version_ecosystem_tabs_bullets" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_ecosystem_tabs_order_idx" ON "_home_v_version_ecosystem_tabs" USING btree ("_order");
  CREATE INDEX "_home_v_version_ecosystem_tabs_parent_id_idx" ON "_home_v_version_ecosystem_tabs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_ecosystem_tabs_image_idx" ON "_home_v_version_ecosystem_tabs" USING btree ("image_id");
  CREATE INDEX "_home_v_version_alumni_paragraphs_order_idx" ON "_home_v_version_alumni_paragraphs" USING btree ("_order");
  CREATE INDEX "_home_v_version_alumni_paragraphs_parent_id_idx" ON "_home_v_version_alumni_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_alumni_people_order_idx" ON "_home_v_version_alumni_people" USING btree ("_order");
  CREATE INDEX "_home_v_version_alumni_people_parent_id_idx" ON "_home_v_version_alumni_people" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_alumni_people_image_idx" ON "_home_v_version_alumni_people" USING btree ("image_id");
  CREATE INDEX "_home_v_version_news_items_order_idx" ON "_home_v_version_news_items" USING btree ("_order");
  CREATE INDEX "_home_v_version_news_items_parent_id_idx" ON "_home_v_version_news_items" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_news_items_image_idx" ON "_home_v_version_news_items" USING btree ("image_id");
  CREATE INDEX "_home_v_version_marquee_images_order_idx" ON "_home_v_version_marquee_images" USING btree ("_order");
  CREATE INDEX "_home_v_version_marquee_images_parent_id_idx" ON "_home_v_version_marquee_images" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_marquee_images_image_idx" ON "_home_v_version_marquee_images" USING btree ("image_id");
  CREATE INDEX "_home_v_version_framework_version_framework_centre_photo_idx" ON "_home_v" USING btree ("version_framework_centre_photo_id");
  CREATE INDEX "_home_v_version_campus_version_campus_poster_idx" ON "_home_v" USING btree ("version_campus_poster_id");
  CREATE INDEX "_home_v_version_meta_version_meta_image_idx" ON "_home_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_hero_slides" CASCADE;
  DROP TABLE "home_vision_items" CASCADE;
  DROP TABLE "home_courage_rotating_words" CASCADE;
  DROP TABLE "home_courage_photos" CASCADE;
  DROP TABLE "home_journey_stages" CASCADE;
  DROP TABLE "home_framework_items" CASCADE;
  DROP TABLE "home_ecosystem_tabs_bullets" CASCADE;
  DROP TABLE "home_ecosystem_tabs" CASCADE;
  DROP TABLE "home_alumni_paragraphs" CASCADE;
  DROP TABLE "home_alumni_people" CASCADE;
  DROP TABLE "home_news_items" CASCADE;
  DROP TABLE "home_marquee_images" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "_home_v_version_hero_slides" CASCADE;
  DROP TABLE "_home_v_version_vision_items" CASCADE;
  DROP TABLE "_home_v_version_courage_rotating_words" CASCADE;
  DROP TABLE "_home_v_version_courage_photos" CASCADE;
  DROP TABLE "_home_v_version_journey_stages" CASCADE;
  DROP TABLE "_home_v_version_framework_items" CASCADE;
  DROP TABLE "_home_v_version_ecosystem_tabs_bullets" CASCADE;
  DROP TABLE "_home_v_version_ecosystem_tabs" CASCADE;
  DROP TABLE "_home_v_version_alumni_paragraphs" CASCADE;
  DROP TABLE "_home_v_version_alumni_people" CASCADE;
  DROP TABLE "_home_v_version_news_items" CASCADE;
  DROP TABLE "_home_v_version_marquee_images" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_status";`)
}
