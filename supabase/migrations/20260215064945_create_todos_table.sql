/*
  # Create todos table

  1. New Tables
    - `todos`
      - `id` (uuid, primary key) - Unique identifier for each todo
      - `name` (text, not null) - Todo name/title
      - `description` (text) - Detailed description of the todo
      - `effort` (integer, not null) - Effort level from 1-10
      - `pct_complete` (integer, not null) - Percentage complete from 0-100
      - `is_done` (boolean, not null) - Whether the todo is completed
      - `date_created` (timestamptz, not null) - When the todo was created
      - `date_updated` (timestamptz, not null) - When the todo was last updated
  
  2. Security
    - Enable RLS on `todos` table
    - Add policies for authenticated users to:
      - Read all todos
      - Insert new todos
      - Update existing todos
      - Delete todos
*/

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  effort integer NOT NULL DEFAULT 1 CHECK (effort >= 1 AND effort <= 10),
  pct_complete integer NOT NULL DEFAULT 0 CHECK (pct_complete >= 0 AND pct_complete <= 100),
  is_done boolean NOT NULL DEFAULT false,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all todos"
  ON todos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete todos"
  ON todos FOR DELETE
  TO authenticated
  USING (true);