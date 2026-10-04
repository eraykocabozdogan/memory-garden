import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const auth = pgSchema("auth");
const authUsers = auth.table("users", {
  id: uuid("id").primaryKey(),
});

export const memoryKind = pgEnum("memory_kind", ["photo", "video", "text"]);
export const memoryDatePrecision = pgEnum("memory_date_precision", [
  "none",
  "year",
  "month",
  "day",
]);
export const mediaAssetStatus = pgEnum("media_asset_status", [
  "queued",
  "processing",
  "ready",
  "failed",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  username: text("username").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const diaryEntries = pgTable(
  "diary_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    content: text("content").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .default(sql`now() + interval '24 hours'`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("diary_entries_author_published_index").on(table.authorId, table.publishedAt),
    index("diary_entries_expires_index").on(table.expiresAt),
    check("diary_entries_content_nonempty", sql`length(btrim(${table.content})) > 0`),
    check(
      "diary_entries_lifetime_24_hours",
      sql`${table.expiresAt} = ${table.publishedAt} + interval '24 hours'`,
    ),
  ],
);

export const diaryFlowerResponses = pgTable(
  "diary_flower_responses",
  {
    entryId: uuid("entry_id")
      .primaryKey()
      .references(() => diaryEntries.id, { onDelete: "cascade" }),
    responderId: uuid("responder_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    flowerId: text("flower_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("diary_flower_responses_responder_index").on(table.responderId),
    check("diary_flower_responses_flower_nonempty", sql`length(btrim(${table.flowerId})) > 0`),
  ],
);

export const memoryDays = pgTable(
  "memory_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memoryDate: date("memory_date", { mode: "string" }).notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("memory_days_memory_date_unique").on(table.memoryDate)],
);

export const memoryItems = pgTable(
  "memory_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: memoryKind("kind").notNull(),
    datePrecision: memoryDatePrecision("date_precision").notNull(),
    memoryDayId: uuid("memory_day_id").references(() => memoryDays.id, {
      onDelete: "cascade",
    }),
    memoryYear: integer("memory_year"),
    memoryMonth: smallint("memory_month"),
    textContent: text("text_content"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("memory_items_day_sort_index").on(table.memoryDayId, table.sortOrder),
    index("memory_items_partial_date_index").on(
      table.datePrecision,
      table.memoryYear,
      table.memoryMonth,
    ),
    check("memory_items_sort_order_nonnegative", sql`${table.sortOrder} >= 0`),
    check(
      "memory_items_date_shape",
      sql`
        (${table.datePrecision} = 'day' AND ${table.memoryDayId} IS NOT NULL AND ${table.memoryYear} IS NULL AND ${table.memoryMonth} IS NULL)
        OR (${table.datePrecision} = 'month' AND ${table.memoryDayId} IS NULL AND ${table.memoryYear} IS NOT NULL AND ${table.memoryMonth} BETWEEN 1 AND 12)
        OR (${table.datePrecision} = 'year' AND ${table.memoryDayId} IS NULL AND ${table.memoryYear} IS NOT NULL AND ${table.memoryMonth} IS NULL)
        OR (${table.datePrecision} = 'none' AND ${table.memoryDayId} IS NULL AND ${table.memoryYear} IS NULL AND ${table.memoryMonth} IS NULL)
      `,
    ),
    check(
      "memory_items_content_shape",
      sql`
        (${table.kind} = 'text' AND ${table.textContent} IS NOT NULL AND length(btrim(${table.textContent})) > 0)
        OR (${table.kind} IN ('photo', 'video') AND ${table.textContent} IS NULL)
      `,
    ),
  ],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    memoryItemId: uuid("memory_item_id")
      .primaryKey()
      .references(() => memoryItems.id, { onDelete: "cascade" }),
    status: mediaAssetStatus("status").default("queued").notNull(),
    sourceObjectKey: text("source_object_key").notNull(),
    displayObjectKey: text("display_object_key"),
    previewObjectKey: text("preview_object_key"),
    originalFileName: text("original_file_name").notNull(),
    sourceMimeType: text("source_mime_type").notNull(),
    sourceSizeBytes: bigint("source_size_bytes", { mode: "number" }).notNull(),
    displayMimeType: text("display_mime_type"),
    displaySizeBytes: bigint("display_size_bytes", { mode: "number" }),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: integer("duration_seconds"),
    processingRunId: uuid("processing_run_id").notNull(),
    attemptCount: integer("attempt_count").default(0).notNull(),
    errorCode: text("error_code"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("media_assets_source_object_key_unique").on(table.sourceObjectKey),
    uniqueIndex("media_assets_display_object_key_unique").on(table.displayObjectKey),
    uniqueIndex("media_assets_preview_object_key_unique").on(table.previewObjectKey),
    index("media_assets_status_index").on(table.status, table.updatedAt),
    check("media_assets_attempt_count_nonnegative", sql`${table.attemptCount} >= 0`),
    check(
      "media_assets_ready_shape",
      sql`
        (${table.status} <> 'ready')
        OR (
          ${table.displayObjectKey} IS NOT NULL
          AND ${table.previewObjectKey} IS NOT NULL
          AND ${table.displayMimeType} IS NOT NULL
          AND ${table.displaySizeBytes} IS NOT NULL
          AND ${table.width} IS NOT NULL
          AND ${table.height} IS NOT NULL
        )
      `,
    ),
  ],
);

export const memoryDayLocations = pgTable(
  "memory_day_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memoryDayId: uuid("memory_day_id")
      .notNull()
      .references(() => memoryDays.id, { onDelete: "cascade" }),
    provinceCode: text("province_code").notNull(),
    provinceName: text("province_name").notNull(),
    districtCode: text("district_code"),
    districtName: text("district_name"),
    longitude: doublePrecision("longitude").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("memory_day_locations_day_sort_index").on(table.memoryDayId, table.sortOrder),
    check("memory_day_locations_sort_order_nonnegative", sql`${table.sortOrder} >= 0`),
    check(
      "memory_day_locations_district_shape",
      sql`(${table.districtCode} IS NULL) = (${table.districtName} IS NULL)`,
    ),
    check(
      "memory_day_locations_coordinate_range",
      sql`${table.longitude} BETWEEN -180 AND 180 AND ${table.latitude} BETWEEN -90 AND 90`,
    ),
  ],
);
