import { pgTable, serial, varchar, timestamp, integer, text, boolean, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统表（必须保留）
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    name: varchar("name", { length: 100 }),
    avatar: varchar("avatar", { length: 500 }),
    email: varchar("email", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_phone_idx").on(table.phone),
  ]
);

// 职业信用评分表
export const creditScores = pgTable(
  "credit_scores",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    score: integer("score").notNull(),
    level: varchar("level", { length: 20 }).notNull(),
    factors: jsonb("factors"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("credit_scores_user_id_idx").on(table.userId),
  ]
);

// 职业信用报告表
export const creditReports = pgTable(
  "credit_reports",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    reportNo: varchar("report_no", { length: 50 }).notNull().unique(),
    status: varchar("status", { length: 20 }).notNull().default('pending'),
    identityInfo: jsonb("identity_info"),
    educationInfo: jsonb("education_info"),
    qualificationInfo: jsonb("qualification_info"),
    litigationInfo: jsonb("litigation_info"),
    investmentInfo: jsonb("investment_info"),
    financialCreditInfo: jsonb("financial_credit_info"),
    blacklistInfo: jsonb("blacklist_info"),
    reportUrl: varchar("report_url", { length: 500 }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("credit_reports_user_id_idx").on(table.userId),
    index("credit_reports_report_no_idx").on(table.reportNo),
  ]
);

// 个人简历表
export const resumes = pgTable(
  "resumes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    summary: text("summary"),
    workExperience: jsonb("work_experience"),
    education: jsonb("education"),
    skills: jsonb("skills"),
    certifications: jsonb("certifications"),
    projects: jsonb("projects"),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("resumes_user_id_idx").on(table.userId),
  ]
);

// 增信记录表
export const creditEnhancements = pgTable(
  "credit_enhancements",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    evidence: jsonb("evidence"),
    status: varchar("status", { length: 20 }).notNull().default('pending'),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
    reviewerNote: text("reviewer_note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("credit_enhancements_user_id_idx").on(table.userId),
    index("credit_enhancements_type_idx").on(table.type),
  ]
);

// 工作履历表（用于自证）
export const workHistories = pgTable(
  "work_histories",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    company: varchar("company", { length: 200 }).notNull(),
    position: varchar("position", { length: 100 }).notNull(),
    startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
    description: text("description"),
    isVerified: boolean("is_verified").default(false).notNull(),
    evidence: jsonb("evidence"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("work_histories_user_id_idx").on(table.userId),
  ]
);
