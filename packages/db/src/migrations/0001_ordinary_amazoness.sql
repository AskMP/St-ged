CREATE TABLE "household_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"total" real NOT NULL,
	"splits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cook_rotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"frequency" text DEFAULT 'weekly' NOT NULL,
	"members" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"start_date" date NOT NULL,
	CONSTRAINT "cook_rotations_household_id_unique" UNIQUE("household_id")
);
--> statement-breakpoint
ALTER TABLE "household_costs" ADD CONSTRAINT "household_costs_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cook_rotations" ADD CONSTRAINT "cook_rotations_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;