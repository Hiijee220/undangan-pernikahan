import {sqliteTable,integer,text} from "drizzle-orm/sqlite-core";
export const invitationContent=sqliteTable("invitation_content",{id:integer("id").primaryKey(),content:text("content").notNull(),updatedAt:integer("updated_at").notNull()});
