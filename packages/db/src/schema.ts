import { pgTable, text, jsonb, timestamp, uuid, integer, doublePrecision, boolean } from 'drizzle-orm/pg-core';

export const searchJob = pgTable('search_job', {
  id: uuid('id').primaryKey(),
  dslJson: jsonb('dsl_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  status: text('status').notNull(),
  summaryStats: jsonb('summary_stats'),
  errorText: text('error_text')
});

export const business = pgTable('business', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  vertical: text('vertical'),
  website: text('website'),
  phone: text('phone'),
  addressJson: jsonb('address_json'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  franchiseBool: boolean('franchise_bool'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const location = pgTable('location', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id),
  addressJson: jsonb('address_json'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng')
});

export const person = pgTable('person', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id),
  name: text('name'),
  role: text('role'),
  email: text('email'),
  phone: text('phone'),
  sourceUrl: text('source_url'),
  confidence: doublePrecision('confidence'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const signal = pgTable('signal', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id),
  type: text('type'),
  valueJson: jsonb('value_json'),
  confidence: doublePrecision('confidence'),
  evidenceUrl: text('evidence_url'),
  evidenceSnippet: text('evidence_snippet'),
  sourceKey: text('source_key'),
  detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow(),
  overriddenByUser: boolean('overridden_by_user').default(false)
});

export const leadView = pgTable('lead_view', {
  id: uuid('id').primaryKey(),
  searchJobId: uuid('search_job_id').references(() => searchJob.id),
  businessId: uuid('business_id').references(() => business.id),
  score: integer('score'),
  subscoresJson: jsonb('subscores_json'),
  rank: integer('rank'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const note = pgTable('note', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id),
  text: text('text'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const tag = pgTable('tag', {
  id: uuid('id').primaryKey(),
  label: text('label').unique()
});

export const businessTag = pgTable('business_tag', {
  businessId: uuid('business_id').references(() => business.id),
  tagId: uuid('tag_id').references(() => tag.id)
});

export const statusLog = pgTable('status_log', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id),
  status: text('status').notNull(),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow()
});

export const event = pgTable('event', {
  id: uuid('id').primaryKey(),
  type: text('type'),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  payloadJson: jsonb('payload_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  processedFlags: jsonb('processed_flags')
});

export const artifact = pgTable('artifact', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id),
  type: text('type'),
  uri: text('uri'),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});


