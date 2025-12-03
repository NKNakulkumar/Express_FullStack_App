import { relations, sql } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';


export const shortLink = mysqlTable('short_link', {
  id: int().autoincrement().primaryKey(),
  url: varchar({ length: 255 }).notNull(),
  shortcode: varchar("short_code",{ length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => UserData.id),
});

export const sessionsTale = mysqlTable("sessions",{
  id:int().autoincrement().primaryKey(),
  userId:int("user_id").notNull().references(()=>UserData.id,{onDelete:"cascade"}),
  valid:boolean().default(true).notNull(),
  userAgent:text("user_agent"),
  ip:varchar({length:255}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

export const VerifyEmailTokenTable= mysqlTable("is_email_valid",{
  id:int().autoincrement().primaryKey(),
  userId:int("user_id").notNull().references(()=>UserData.id,{onDelete:"cascade"}),
  token:varchar({length:8}).notNull(),
  expiresAt: timestamp("expires_at").default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

})

export const UserData = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }),
  isEmailValid:boolean("is_email_valid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const oAuthAccountsTable = mysqlTable("oauth_accounts",{
  id: int("id").autoincrement().primaryKey(),
  userId:int("user_id").notNull().references(()=>UserData.id,{onDelete:"cascade"}),
  provider:mysqlEnum("provider",["google","github"]).notNull(),
  providerAccountId:varchar("provider_account_id",{length:255}).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  

})

export const usersRelation = relations(UserData, ({ many }) => ({
  shortLinks: many(shortLink),
  session:many(sessionsTale)
}));
// A short link belongs to a user
export const shortLinksRelation = relations(shortLink, ({ one }) => ({
    user: one(UserData, {
    fields: [shortLink.userId], //foreign key
    references: [UserData.id],
  }),
}));


export const sessionsRelation = relations(sessionsTale, ({one})=>({
user:one(UserData,{
  fields:[sessionsTale.userId],
  references:[UserData.id], // foreign key.
})

}))

export const passwordresetTokenTable = mysqlTable("password_reset_token",{
id:int("id").autoincrement().primaryKey(),
  userId:int("user_id").notNull().references(()=>UserData.id,{onDelete:"cascade"}).unique(),
  tokenHash:text("token_hash").notNull(),
   expiresAt: timestamp("expires_at").default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 HOUR)`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),


})