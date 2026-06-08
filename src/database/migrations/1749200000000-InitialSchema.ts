import { type MigrationInterface, type QueryRunner } from "typeorm";

async function createEnumIfNotExists(
  queryRunner: QueryRunner,
  name: string,
  values: string[],
): Promise<void> {
  const literals = values.map((v) => `'${v}'`).join(", ");
  await queryRunner.query(`
    DO $$ BEGIN
      CREATE TYPE "public"."${name}" AS ENUM(${literals});
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

async function createTableIfNotExists(
  queryRunner: QueryRunner,
  sql: string,
): Promise<void> {
  await queryRunner.query(
    sql.replace("CREATE TABLE", "CREATE TABLE IF NOT EXISTS"),
  );
}

async function createIndexIfNotExists(
  queryRunner: QueryRunner,
  sql: string,
): Promise<void> {
  await queryRunner.query(
    sql
      .replace("CREATE UNIQUE INDEX", "CREATE UNIQUE INDEX IF NOT EXISTS")
      .replace("CREATE INDEX", "CREATE INDEX IF NOT EXISTS"),
  );
}

async function addForeignKeyIfNotExists(
  queryRunner: QueryRunner,
  table: string,
  constraint: string,
  sql: string,
): Promise<void> {
  await queryRunner.query(`
    DO $$ BEGIN
      ALTER TABLE "${table}"
      ADD CONSTRAINT "${constraint}"
      ${sql};
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

export class InitialSchema1749200000000 implements MigrationInterface {
  name = "InitialSchema1749200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createEnumIfNotExists(queryRunner, "users_role_enum", [
      "user",
      "platform_admin",
    ]);
    await createEnumIfNotExists(queryRunner, "tenant_members_role_enum", [
      "owner",
      "admin",
      "member",
    ]);
    await createEnumIfNotExists(queryRunner, "subscriptions_status_enum", [
      "active",
      "trialing",
      "canceled",
      "past_due",
    ]);

    await createTableIfNotExists(
      queryRunner,
      `
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "email" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "profile_image_url" character varying,
        "is_verified" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `,
    );
    await createIndexIfNotExists(
      queryRunner,
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );

    await createTableIfNotExists(
      queryRunner,
      `
      CREATE TABLE "tokens" (
        "sessionId" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "hash_refresh_token" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tokens" PRIMARY KEY ("sessionId")
      )
    `,
    );
    await createIndexIfNotExists(
      queryRunner,
      `CREATE INDEX "IDX_tokens_user_id" ON "tokens" ("user_id")`,
    );
    await addForeignKeyIfNotExists(
      queryRunner,
      "tokens",
      "FK_tokens_user_id",
      'FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE',
    );

    await createTableIfNotExists(
      queryRunner,
      `
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `,
    );
    await createIndexIfNotExists(
      queryRunner,
      `CREATE UNIQUE INDEX "IDX_tenants_slug" ON "tenants" ("slug")`,
    );

    await createTableIfNotExists(
      queryRunner,
      `
      CREATE TABLE "plans" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "price_monthly" numeric(10,2) NOT NULL DEFAULT 0,
        "price_yearly" numeric(10,2) NOT NULL DEFAULT 0,
        "features" jsonb NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plans" PRIMARY KEY ("id")
      )
    `,
    );
    await createIndexIfNotExists(
      queryRunner,
      `CREATE UNIQUE INDEX "IDX_plans_slug" ON "plans" ("slug")`,
    );

    await createTableIfNotExists(
      queryRunner,
      `
      CREATE TABLE "tenant_members" (
        "id" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "public"."tenant_members_role_enum" NOT NULL DEFAULT 'member',
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_members" PRIMARY KEY ("id")
      )
    `,
    );
    await createIndexIfNotExists(
      queryRunner,
      `CREATE UNIQUE INDEX "IDX_tenant_members_tenant_user" ON "tenant_members" ("tenant_id", "user_id")`,
    );
    await addForeignKeyIfNotExists(
      queryRunner,
      "tenant_members",
      "FK_tenant_members_tenant_id",
      'FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE',
    );
    await addForeignKeyIfNotExists(
      queryRunner,
      "tenant_members",
      "FK_tenant_members_user_id",
      'FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE',
    );

    await createTableIfNotExists(
      queryRunner,
      `
      CREATE TABLE "subscriptions" (
        "id" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "plan_id" uuid NOT NULL,
        "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'trialing',
        "current_period_start" TIMESTAMP NOT NULL,
        "current_period_end" TIMESTAMP NOT NULL,
        "cancel_at_period_end" boolean NOT NULL DEFAULT false,
        "external_customer_id" character varying,
        "external_subscription_id" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id")
      )
    `,
    );
    await createIndexIfNotExists(
      queryRunner,
      `CREATE INDEX "IDX_subscriptions_tenant_id" ON "subscriptions" ("tenant_id")`,
    );
    await addForeignKeyIfNotExists(
      queryRunner,
      "subscriptions",
      "FK_subscriptions_tenant_id",
      'FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE',
    );
    await addForeignKeyIfNotExists(
      queryRunner,
      "subscriptions",
      "FK_subscriptions_plan_id",
      'FOREIGN KEY ("plan_id") REFERENCES "plans"("id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "FK_subscriptions_plan_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "FK_subscriptions_tenant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_subscriptions_tenant_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions"`);

    await queryRunner.query(
      `ALTER TABLE "tenant_members" DROP CONSTRAINT IF EXISTS "FK_tenant_members_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_members" DROP CONSTRAINT IF EXISTS "FK_tenant_members_tenant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_tenant_members_tenant_user"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_members"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_plans_slug"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "plans"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tenants_slug"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants"`);

    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT IF EXISTS "FK_tokens_user_id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tokens_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tokens"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "subscriptions_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tenant_members_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
  }
}
