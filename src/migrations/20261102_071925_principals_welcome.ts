import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_principals_welcome_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__principals_welcome_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "principals_welcome_message_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "principals_welcome" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar,
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_subtitle" varchar,
  	"message_image_id" integer,
  	"message_title_lead" varchar,
  	"message_title_accent" varchar,
  	"message_signatory_name" varchar,
  	"message_signatory_role" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean DEFAULT false,
  	"meta_canonical" varchar,
  	"_status" "enum_principals_welcome_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_principals_welcome_v_version_message_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_principals_welcome_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_badge" varchar,
  	"version_hero_title_lead" varchar,
  	"version_hero_title_accent" varchar,
  	"version_hero_subtitle" varchar,
  	"version_message_image_id" integer,
  	"version_message_title_lead" varchar,
  	"version_message_title_accent" varchar,
  	"version_message_signatory_name" varchar,
  	"version_message_signatory_role" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_meta_canonical" varchar,
  	"version__status" "enum__principals_welcome_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "principals_welcome_message_paragraphs" ADD CONSTRAINT "principals_welcome_message_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."principals_welcome"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "principals_welcome" ADD CONSTRAINT "principals_welcome_message_image_id_media_id_fk" FOREIGN KEY ("message_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "principals_welcome" ADD CONSTRAINT "principals_welcome_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_principals_welcome_v_version_message_paragraphs" ADD CONSTRAINT "_principals_welcome_v_version_message_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_principals_welcome_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_principals_welcome_v" ADD CONSTRAINT "_principals_welcome_v_version_message_image_id_media_id_fk" FOREIGN KEY ("version_message_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_principals_welcome_v" ADD CONSTRAINT "_principals_welcome_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "principals_welcome_message_paragraphs_order_idx" ON "principals_welcome_message_paragraphs" USING btree ("_order");
  CREATE INDEX "principals_welcome_message_paragraphs_parent_id_idx" ON "principals_welcome_message_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "principals_welcome_message_message_image_idx" ON "principals_welcome" USING btree ("message_image_id");
  CREATE INDEX "principals_welcome_meta_meta_image_idx" ON "principals_welcome" USING btree ("meta_image_id");
  CREATE INDEX "principals_welcome__status_idx" ON "principals_welcome" USING btree ("_status");
  CREATE INDEX "_principals_welcome_v_version_message_paragraphs_order_idx" ON "_principals_welcome_v_version_message_paragraphs" USING btree ("_order");
  CREATE INDEX "_principals_welcome_v_version_message_paragraphs_parent_id_idx" ON "_principals_welcome_v_version_message_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_principals_welcome_v_version_message_version_message_im_idx" ON "_principals_welcome_v" USING btree ("version_message_image_id");
  CREATE INDEX "_principals_welcome_v_version_meta_version_meta_image_idx" ON "_principals_welcome_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_principals_welcome_v_version_version__status_idx" ON "_principals_welcome_v" USING btree ("version__status");
  CREATE INDEX "_principals_welcome_v_created_at_idx" ON "_principals_welcome_v" USING btree ("created_at");
  CREATE INDEX "_principals_welcome_v_updated_at_idx" ON "_principals_welcome_v" USING btree ("updated_at");
  CREATE INDEX "_principals_welcome_v_latest_idx" ON "_principals_welcome_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "principals_welcome_message_paragraphs" CASCADE;
  DROP TABLE "principals_welcome" CASCADE;
  DROP TABLE "_principals_welcome_v_version_message_paragraphs" CASCADE;
  DROP TABLE "_principals_welcome_v" CASCADE;
  DROP TYPE "public"."enum_principals_welcome_status";
  DROP TYPE "public"."enum__principals_welcome_v_version_status";`)
}
