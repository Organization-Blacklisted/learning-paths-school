import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_partnerships_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partnerships_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "partnerships_partners_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"role" varchar
  );
  
  CREATE TABLE "partnerships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar,
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_subtitle" varchar,
  	"partners_intro" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean DEFAULT false,
  	"meta_canonical" varchar,
  	"_status" "enum_partnerships_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_partnerships_v_version_partners_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"role" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_badge" varchar,
  	"version_hero_title_lead" varchar,
  	"version_hero_title_accent" varchar,
  	"version_hero_subtitle" varchar,
  	"version_partners_intro" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_meta_canonical" varchar,
  	"version__status" "enum__partnerships_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "partnerships_partners_items" ADD CONSTRAINT "partnerships_partners_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partnerships_partners_items" ADD CONSTRAINT "partnerships_partners_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partnerships_v_version_partners_items" ADD CONSTRAINT "_partnerships_v_version_partners_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partnerships_v_version_partners_items" ADD CONSTRAINT "_partnerships_v_version_partners_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_v" ADD CONSTRAINT "_partnerships_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "partnerships_partners_items_order_idx" ON "partnerships_partners_items" USING btree ("_order");
  CREATE INDEX "partnerships_partners_items_parent_id_idx" ON "partnerships_partners_items" USING btree ("_parent_id");
  CREATE INDEX "partnerships_partners_items_logo_idx" ON "partnerships_partners_items" USING btree ("logo_id");
  CREATE INDEX "partnerships_meta_meta_image_idx" ON "partnerships" USING btree ("meta_image_id");
  CREATE INDEX "partnerships__status_idx" ON "partnerships" USING btree ("_status");
  CREATE INDEX "_partnerships_v_version_partners_items_order_idx" ON "_partnerships_v_version_partners_items" USING btree ("_order");
  CREATE INDEX "_partnerships_v_version_partners_items_parent_id_idx" ON "_partnerships_v_version_partners_items" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_v_version_partners_items_logo_idx" ON "_partnerships_v_version_partners_items" USING btree ("logo_id");
  CREATE INDEX "_partnerships_v_version_meta_version_meta_image_idx" ON "_partnerships_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_partnerships_v_version_version__status_idx" ON "_partnerships_v" USING btree ("version__status");
  CREATE INDEX "_partnerships_v_created_at_idx" ON "_partnerships_v" USING btree ("created_at");
  CREATE INDEX "_partnerships_v_updated_at_idx" ON "_partnerships_v" USING btree ("updated_at");
  CREATE INDEX "_partnerships_v_latest_idx" ON "_partnerships_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "partnerships_partners_items" CASCADE;
  DROP TABLE "partnerships" CASCADE;
  DROP TABLE "_partnerships_v_version_partners_items" CASCADE;
  DROP TABLE "_partnerships_v" CASCADE;
  DROP TYPE "public"."enum_partnerships_status";
  DROP TYPE "public"."enum__partnerships_v_version_status";`)
}
