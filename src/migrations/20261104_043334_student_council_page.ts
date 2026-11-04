import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_student_council_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__student_council_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "student_council_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "student_council" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar,
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_subtitle" varchar,
  	"intro_image_id" integer,
  	"intro_title_accent" varchar,
  	"intro_title_rest" varchar,
  	"intro_text" varchar,
  	"gallery_title_accent" varchar,
  	"gallery_title_rest" varchar,
  	"gallery_image_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean DEFAULT false,
  	"meta_canonical" varchar,
  	"_status" "enum_student_council_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_student_council_v_version_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_student_council_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_badge" varchar,
  	"version_hero_title_lead" varchar,
  	"version_hero_title_accent" varchar,
  	"version_hero_subtitle" varchar,
  	"version_intro_image_id" integer,
  	"version_intro_title_accent" varchar,
  	"version_intro_title_rest" varchar,
  	"version_intro_text" varchar,
  	"version_gallery_title_accent" varchar,
  	"version_gallery_title_rest" varchar,
  	"version_gallery_image_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_meta_canonical" varchar,
  	"version__status" "enum__student_council_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "student_council_features_items" ADD CONSTRAINT "student_council_features_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "student_council_features_items" ADD CONSTRAINT "student_council_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."student_council"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "student_council" ADD CONSTRAINT "student_council_intro_image_id_media_id_fk" FOREIGN KEY ("intro_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "student_council" ADD CONSTRAINT "student_council_gallery_image_id_media_id_fk" FOREIGN KEY ("gallery_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "student_council" ADD CONSTRAINT "student_council_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_student_council_v_version_features_items" ADD CONSTRAINT "_student_council_v_version_features_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_student_council_v_version_features_items" ADD CONSTRAINT "_student_council_v_version_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_student_council_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_student_council_v" ADD CONSTRAINT "_student_council_v_version_intro_image_id_media_id_fk" FOREIGN KEY ("version_intro_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_student_council_v" ADD CONSTRAINT "_student_council_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("version_gallery_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_student_council_v" ADD CONSTRAINT "_student_council_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "student_council_features_items_order_idx" ON "student_council_features_items" USING btree ("_order");
  CREATE INDEX "student_council_features_items_parent_id_idx" ON "student_council_features_items" USING btree ("_parent_id");
  CREATE INDEX "student_council_features_items_image_idx" ON "student_council_features_items" USING btree ("image_id");
  CREATE INDEX "student_council_intro_intro_image_idx" ON "student_council" USING btree ("intro_image_id");
  CREATE INDEX "student_council_gallery_gallery_image_idx" ON "student_council" USING btree ("gallery_image_id");
  CREATE INDEX "student_council_meta_meta_image_idx" ON "student_council" USING btree ("meta_image_id");
  CREATE INDEX "student_council__status_idx" ON "student_council" USING btree ("_status");
  CREATE INDEX "_student_council_v_version_features_items_order_idx" ON "_student_council_v_version_features_items" USING btree ("_order");
  CREATE INDEX "_student_council_v_version_features_items_parent_id_idx" ON "_student_council_v_version_features_items" USING btree ("_parent_id");
  CREATE INDEX "_student_council_v_version_features_items_image_idx" ON "_student_council_v_version_features_items" USING btree ("image_id");
  CREATE INDEX "_student_council_v_version_intro_version_intro_image_idx" ON "_student_council_v" USING btree ("version_intro_image_id");
  CREATE INDEX "_student_council_v_version_gallery_version_gallery_image_idx" ON "_student_council_v" USING btree ("version_gallery_image_id");
  CREATE INDEX "_student_council_v_version_meta_version_meta_image_idx" ON "_student_council_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_student_council_v_version_version__status_idx" ON "_student_council_v" USING btree ("version__status");
  CREATE INDEX "_student_council_v_created_at_idx" ON "_student_council_v" USING btree ("created_at");
  CREATE INDEX "_student_council_v_updated_at_idx" ON "_student_council_v" USING btree ("updated_at");
  CREATE INDEX "_student_council_v_latest_idx" ON "_student_council_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "student_council_features_items" CASCADE;
  DROP TABLE "student_council" CASCADE;
  DROP TABLE "_student_council_v_version_features_items" CASCADE;
  DROP TABLE "_student_council_v" CASCADE;
  DROP TYPE "public"."enum_student_council_status";
  DROP TYPE "public"."enum__student_council_v_version_status";`)
}
