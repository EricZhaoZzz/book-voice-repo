## ADDED Requirements

### Requirement: Admin Access Control

The system SHALL restrict content management features to users with admin role.

#### Scenario: Admin user accesses admin pages

- **WHEN** a user with role "admin" navigates to /admin/\*
- **THEN** the page content is displayed

#### Scenario: Non-admin user redirected

- **WHEN** a user with role "student" navigates to /admin/\*
- **THEN** the user is redirected to the home page

#### Scenario: Unauthenticated user redirected

- **WHEN** an unauthenticated user navigates to /admin/\*
- **THEN** the user is redirected to the login page

### Requirement: Textbook Management

The system SHALL provide CRUD operations for textbooks.

#### Scenario: List all textbooks

- **WHEN** an admin navigates to /admin/textbooks
- **THEN** a table displays all textbooks with name, grade, publisher, and actions

#### Scenario: Create textbook

- **WHEN** an admin submits the textbook form with valid data (name, grade, publisher, version)
- **THEN** a new textbook record is created in the database

#### Scenario: Edit textbook

- **WHEN** an admin updates a textbook's information
- **THEN** the textbook record is updated in the database

#### Scenario: Delete textbook

- **WHEN** an admin deletes a textbook with no units
- **THEN** the textbook record is removed from the database

#### Scenario: Delete textbook with units rejected

- **WHEN** an admin attempts to delete a textbook that has units
- **THEN** the deletion is rejected with an error message

### Requirement: Unit Management

The system SHALL provide CRUD operations for units within a textbook.

#### Scenario: List units for textbook

- **WHEN** an admin navigates to /admin/textbooks/[id]/units
- **THEN** a table displays all units for that textbook ordered by order_num

#### Scenario: Create unit

- **WHEN** an admin submits the unit form with valid data (name, order_num)
- **THEN** a new unit record is created linked to the textbook

#### Scenario: Edit unit

- **WHEN** an admin updates a unit's information
- **THEN** the unit record is updated in the database

#### Scenario: Delete unit

- **WHEN** an admin deletes a unit with no lessons
- **THEN** the unit record is removed from the database

#### Scenario: Delete unit with lessons rejected

- **WHEN** an admin attempts to delete a unit that has lessons
- **THEN** the deletion is rejected with an error message

### Requirement: Lesson Management

The system SHALL provide CRUD operations for lessons within a unit.

#### Scenario: List lessons for unit

- **WHEN** an admin navigates to /admin/textbooks/[id]/units/[unitId]/lessons
- **THEN** a table displays all lessons for that unit ordered by order_num

#### Scenario: Create lesson

- **WHEN** an admin submits the lesson form with valid data (name, order_num, audio file)
- **THEN** a new lesson record is created with audio_url pointing to uploaded file

#### Scenario: Edit lesson

- **WHEN** an admin updates a lesson's information
- **THEN** the lesson record is updated in the database

#### Scenario: Delete lesson

- **WHEN** an admin deletes a lesson
- **THEN** the lesson record is removed and associated audio file is deleted from storage

### Requirement: File Upload

The system SHALL provide file upload functionality for cover images and audio files.

#### Scenario: Upload cover image

- **WHEN** an admin uploads an image file (jpg, png, webp) under 5MB
- **THEN** the file is stored in the images bucket and URL is returned

#### Scenario: Upload audio file

- **WHEN** an admin uploads an audio file (mp3) under 50MB
- **THEN** the file is stored in the audio bucket and URL is returned

#### Scenario: Invalid file type rejected

- **WHEN** an admin attempts to upload a file with unsupported type
- **THEN** the upload is rejected with an error message

#### Scenario: File size exceeded rejected

- **WHEN** an admin attempts to upload a file exceeding size limit
- **THEN** the upload is rejected with an error message
