import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_signature_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__signature_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "signature_events_events_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "signature_events" (
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
  	"_status" "enum_signature_events_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_signature_events_v_version_events_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_signature_events_v" (
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
  	"version__status" "enum__signature_events_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "signature_events_events_items" ADD CONSTRAINT "signature_events_events_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "signature_events_events_items" ADD CONSTRAINT "signature_events_events_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."signature_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "signature_events" ADD CONSTRAINT "signature_events_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_signature_events_v_version_events_items" ADD CONSTRAINT "_signature_events_v_version_events_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_signature_events_v_version_events_items" ADD CONSTRAINT "_signature_events_v_version_events_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_signature_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_signature_events_v" ADD CONSTRAINT "_signature_events_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "signature_events_events_items_order_idx" ON "signature_events_events_items" USING btree ("_order");
  CREATE INDEX "signature_events_events_items_parent_id_idx" ON "signature_events_events_items" USING btree ("_parent_id");
  CREATE INDEX "signature_events_events_items_image_idx" ON "signature_events_events_items" USING btree ("image_id");
  CREATE INDEX "signature_events_meta_meta_image_idx" ON "signature_events" USING btree ("meta_image_id");
  CREATE INDEX "signature_events__status_idx" ON "signature_events" USING btree ("_status");
  CREATE INDEX "_signature_events_v_version_events_items_order_idx" ON "_signature_events_v_version_events_items" USING btree ("_order");
  CREATE INDEX "_signature_events_v_version_events_items_parent_id_idx" ON "_signature_events_v_version_events_items" USING btree ("_parent_id");
  CREATE INDEX "_signature_events_v_version_events_items_image_idx" ON "_signature_events_v_version_events_items" USING btree ("image_id");
  CREATE INDEX "_signature_events_v_version_meta_version_meta_image_idx" ON "_signature_events_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_signature_events_v_version_version__status_idx" ON "_signature_events_v" USING btree ("version__status");
  CREATE INDEX "_signature_events_v_created_at_idx" ON "_signature_events_v" USING btree ("created_at");
  CREATE INDEX "_signature_events_v_updated_at_idx" ON "_signature_events_v" USING btree ("updated_at");
  CREATE INDEX "_signature_events_v_latest_idx" ON "_signature_events_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "signature_events_events_items" CASCADE;
  DROP TABLE "signature_events" CASCADE;
  DROP TABLE "_signature_events_v_version_events_items" CASCADE;
  DROP TABLE "_signature_events_v" CASCADE;
  DROP TYPE "public"."enum_signature_events_status";
  DROP TYPE "public"."enum__signature_events_v_version_status";`)
}
