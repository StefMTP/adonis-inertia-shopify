import { BaseCommand, flags } from "@adonisjs/core/build/standalone";
import execa from "execa";

export default class MigrateFresh extends BaseCommand {
  public static commandName = "migrate:fresh";
  public static description =
    'Use this command to clear the database & run the database migrations. Optionally seed the database with data with the flag "--seed" (depending on node_env, development or production, we get different data)';

  @flags.boolean({
    alias: "s",
    description: "Seed the database after migrating",
    name: "seed",
  })
  public seed: boolean;

  @flags.boolean({
    alias: "d",
    description:
      "Print SQL queries instead of running migrations and seeding database",
    name: "sql-dump",
  })
  public sqlDump: boolean;

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  /**
   * The run method executes these three actions in order:
   *  The first action is to truncate and drop all database tables (if in production, prompt appears for action confirmation)
   *  The second action is the command migration:run to run all present migrations
   *  node ace db:seed to seed the tables with the seeder data, if seed flag is present
   */
  public async run() {
    try {
      if (this.application.nodeEnvironment === "production") {
        const verifyAction = await this.prompt.confirm(
          "This command will delete all data, drop all tables and run migrations again. Are you sure want to go on?"
        );
        if (!verifyAction) {
          this.logger
            .action("migrate:fresh")
            .skipped("Possible crisis averted...");
          return;
        }
      }
      const client = (
        await import("@ioc:Adonis/Lucid/Database")
      ).default.connection();
      const tables = await client.getAllTables();
      if (tables.length > 0) {
        this.logger.info("Clearing up the database...", "%time%");
        await client.rawQuery("SET FOREIGN_KEY_CHECKS = 0");
        await client.rawQuery("SET UNIQUE_CHECKS = 0");
        for (const table of tables) {
          await client.rawQuery(`TRUNCATE TABLE ${table}`);
          await client.rawQuery(`DROP TABLE ${table} CASCADE`);
          this.logger.success(`Deleted table ${table} ✅`);
        }
        await client.rawQuery("SET FOREIGN_KEY_CHECKS = 1");
        await client.rawQuery("SET UNIQUE_CHECKS = 1");
      } else {
        this.logger.warning("There are no tables in the database.");
      }
      this.logger.info("Running migrations...", "%time%");
      const migrationRunArgs = ["migration:run"];
      if (this.sqlDump) {
        migrationRunArgs.push("--dry-run");
      }
      await execa.node("ace", migrationRunArgs, {
        stdio: "inherit",
      });
      this.logger.success("Migrations were successful ✅");
      if (this.seed && !this.sqlDump) {
        this.logger.info("Seeding database...", "%time%");
        await execa.node("ace", ["db:seed"], {
          stdio: "inherit",
        });
        this.logger.success("Database seeded ✅");
      }
    } catch (err) {
      this.logger.fatal(err);
      console.log(err);
    }
  }
}
