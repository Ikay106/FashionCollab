-- ============================================================
-- FashionCollab — Database Schema
-- Run this entire script in Supabase SQL Editor to set up
-- the full database from scratch.
-- ============================================================


-- ── 1. profiles ──────────────────────────────────────────────
CREATE TABLE profiles (
  id              uuid NOT NULL PRIMARY KEY,
  full_name       text,
  username        text,
  role            text,
  bio             text,
  instagram_url   text,
  portfolio_url   text,
  website_url     text,
  avatar_url      text,
  location        text,
  created_at      timestamp with time zone DEFAULT now(),
  updated_at      timestamp with time zone DEFAULT now()
);


-- ── 2. projects ───────────────────────────────────────────────
CREATE TABLE projects (
  id          bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text,
  description text,
  location    text,
  shoot_date  date,
  status      text DEFAULT 'draft',
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now()
);


-- ── 3. project_members ────────────────────────────────────────
CREATE TABLE project_members (
  id          uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  bigint REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text,
  invited_at  timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone
);


-- ── 4. project-images ─────────────────────────────────────────
CREATE TABLE "project-images" (
  id           uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   bigint REFERENCES projects(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url    text,
  file_name    text,
  storage_path text,
  description  text,
  uploaded_at  timestamp with time zone NOT NULL DEFAULT now()
);


-- ── 5. image_comments ─────────────────────────────────────────
CREATE TABLE image_comments (
  id         uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id   uuid REFERENCES "project-images"(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  comment    text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);


-- ── 6. project_notes ──────────────────────────────────────────
CREATE TABLE project_notes (
  id         bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id bigint REFERENCES projects(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title      text,
  content    text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);


-- ── 7. project_links ──────────────────────────────────────────
CREATE TABLE project_links (
  id         bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id bigint REFERENCES projects(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title      text,
  url        text,
  category   text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);


-- ── 8. project_activity ───────────────────────────────────────
CREATE TABLE project_activity (
  id           bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id   bigint NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL,
  action       text NOT NULL,
  entity_type  text NOT NULL,
  entity_label text,
  created_at   timestamp with time zone DEFAULT now()
);