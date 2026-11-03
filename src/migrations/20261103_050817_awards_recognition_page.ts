import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_awards_recognition_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__awards_recognition_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "awards_recognition_awards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "awards_recognition" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar,
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_subtitle" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean DEFAULT false,
  	"meta_canonical" varchar,
  	"_status" "enum_awards_recognition_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_awards_recognition_v_version_awards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_awards_recognition_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_badge" varchar,
  	"version_hero_title_lead" varchar,
  	"version_hero_title_accent" varchar,
  	"version_hero_subtitle" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_meta_canonical" varchar,
  	"version__status" "enum__awards_recognition_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "awards_recognition_awards_items" ADD CONSTRAINT "awards_recognition_awards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards_recognition_awards_items" ADD CONSTRAINT "awards_recognition_awards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."awards_recognition"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "awards_recognition" ADD CONSTRAINT "awards_recognition_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_recognition_v_version_awards_items" ADD CONSTRAINT "_awards_recognition_v_version_awards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_recognition_v_version_awards_items" ADD CONSTRAINT "_awards_recognition_v_version_awards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_awards_recognition_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_awards_recognition_v" ADD CONSTRAINT "_awards_recognition_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "awards_recognition_awards_items_order_idx" ON "awards_recognition_awards_items" USING btree ("_order");
  CREATE INDEX "awards_recognition_awards_items_parent_id_idx" ON "awards_recognition_awards_items" USING btree ("_parent_id");
  CREATE INDEX "awards_recognition_awards_items_image_idx" ON "awards_recognition_awards_items" USING btree ("image_id");
  CREATE INDEX "awards_recognition_meta_meta_image_idx" ON "awards_recognition" USING btree ("meta_image_id");
  CREATE INDEX "awards_recognition__status_idx" ON "awards_recognition" USING btree ("_status");
  CREATE INDEX "_awards_recognition_v_version_awards_items_order_idx" ON "_awards_recognition_v_version_awards_items" USING btree ("_order");
  CREATE INDEX "_awards_recognition_v_version_awards_items_parent_id_idx" ON "_awards_recognition_v_version_awards_items" USING btree ("_parent_id");
  CREATE INDEX "_awards_recognition_v_version_awards_items_image_idx" ON "_awards_recognition_v_version_awards_items" USING btree ("image_id");
  CREATE INDEX "_awards_recognition_v_version_meta_version_meta_image_idx" ON "_awards_recognition_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_awards_recognition_v_version_version__status_idx" ON "_awards_recognition_v" USING btree ("version__status");
  CREATE INDEX "_awards_recognition_v_created_at_idx" ON "_awards_recognition_v" USING btree ("created_at");
  CREATE INDEX "_awards_recognition_v_updated_at_idx" ON "_awards_recognition_v" USING btree ("updated_at");
  CREATE INDEX "_awards_recognition_v_latest_idx" ON "_awards_recognition_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "awards_recognition_awards_items" CASCADE;
  DROP TABLE "awards_recognition" CASCADE;
  DROP TABLE "_awards_recognition_v_version_awards_items" CASCADE;
  DROP TABLE "_awards_recognition_v" CASCADE;
  DROP TYPE "public"."enum_awards_recognition_status";
  DROP TYPE "public"."enum__awards_recognition_v_version_status";`)
}
