## ADDED Requirements

### Requirement: Database Schema

The system SHALL provide a PostgreSQL database with tables for users, textbooks, units, lessons, favorites, play_history, learning_stats, and play_logs matching the TypeScript type definitions.

#### Scenario: Tables exist with correct structure

- **WHEN** the database is initialized
- **THEN** all eight tables (users, textbooks, units, lessons, favorites, play_history, learning_stats, play_logs) exist with columns matching `src/types/database.ts`

#### Scenario: Foreign key relationships enforced

- **WHEN** a record references a non-existent parent record
- **THEN** the database rejects the insert with a foreign key violation error

#### Scenario: Unique constraints enforced

- **WHEN** a duplicate record violates a unique constraint (e.g., same user_id + lesson_id in favorites)
- **THEN** the database rejects the insert with a unique constraint violation error

### Requirement: Row Level Security

The system SHALL enforce Row Level Security (RLS) policies to protect user data at the database level.

#### Scenario: Users can only read their own profile

- **WHEN** a user queries the users table
- **THEN** only their own record is returned

#### Scenario: Users can only access their own favorites

- **WHEN** a user queries the favorites table
- **THEN** only records where user_id matches their auth.uid() are returned

#### Scenario: Users can only access their own play history

- **WHEN** a user queries the play_history table
- **THEN** only records where user_id matches their auth.uid() are returned

#### Scenario: Content tables are publicly readable

- **WHEN** any user (authenticated or anonymous) queries textbooks, units, or lessons
- **THEN** all records are returned

#### Scenario: Only admins can modify content

- **WHEN** a non-admin user attempts to insert, update, or delete from textbooks, units, or lessons
- **THEN** the operation is rejected

### Requirement: Storage Buckets

The system SHALL provide storage buckets for audio files and images with appropriate access policies.

#### Scenario: Audio bucket exists

- **WHEN** the storage is configured
- **THEN** an "audio" bucket exists for storing lesson MP3 files

#### Scenario: Images bucket exists

- **WHEN** the storage is configured
- **THEN** an "images" bucket exists for storing cover images and avatars

#### Scenario: Public read access for media

- **WHEN** any user requests a file from audio or images bucket
- **THEN** the file is served via CDN without authentication

#### Scenario: Admin upload access

- **WHEN** an admin user uploads a file to audio or images bucket
- **THEN** the upload succeeds

#### Scenario: Non-admin upload rejected

- **WHEN** a non-admin user attempts to upload to audio or images bucket
- **THEN** the upload is rejected

### Requirement: Environment Configuration

The system SHALL use environment variables to configure Supabase connection.

#### Scenario: Application connects to Supabase

- **WHEN** the Next.js application starts with valid environment variables
- **THEN** the Supabase client successfully connects to the database

#### Scenario: Missing environment variables detected

- **WHEN** required Supabase environment variables are missing
- **THEN** the application throws an error indicating missing configuration
