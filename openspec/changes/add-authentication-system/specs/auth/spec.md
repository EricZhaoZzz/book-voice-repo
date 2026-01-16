## ADDED Requirements

### Requirement: User Registration

The system SHALL allow users to create accounts using email and password via Supabase Auth.

#### Scenario: Successful registration

- **WHEN** user submits valid email, password, and username
- **THEN** system creates Supabase auth user
- **AND** redirects to main application

#### Scenario: Registration with existing email

- **WHEN** user submits email that already exists
- **THEN** system displays appropriate error message

### Requirement: User Login

The system SHALL allow registered users to authenticate using email and password.

#### Scenario: Successful login

- **WHEN** user submits valid credentials
- **THEN** system authenticates via Supabase
- **AND** establishes session
- **AND** redirects to main application

#### Scenario: Invalid credentials

- **WHEN** user submits invalid credentials
- **THEN** system displays error message
- **AND** does not establish session

### Requirement: User Logout

The system SHALL allow authenticated users to sign out.

#### Scenario: Successful logout

- **WHEN** authenticated user requests logout
- **THEN** system clears Supabase session
- **AND** redirects to auth page

### Requirement: Session Management

The system SHALL maintain user sessions using Supabase SSR with cookie-based storage.

#### Scenario: Session refresh

- **WHEN** user makes request with valid session
- **THEN** middleware refreshes session token if needed

#### Scenario: Expired session

- **WHEN** user makes request with expired session
- **THEN** system redirects to auth page

### Requirement: Route Protection

The system SHALL protect authenticated-only routes via Next.js middleware.

#### Scenario: Unauthenticated access to protected route

- **WHEN** unauthenticated user accesses protected route
- **THEN** system redirects to auth page

#### Scenario: Authenticated access to protected route

- **WHEN** authenticated user accesses protected route
- **THEN** system allows access

#### Scenario: Authenticated access to auth page

- **WHEN** authenticated user accesses auth page
- **THEN** system redirects to main application

### Requirement: Guest Mode

The system SHALL allow users to browse content without authentication using localStorage-based guest state.

#### Scenario: Enter guest mode

- **WHEN** user clicks "Continue as Guest"
- **THEN** system stores guest flag in localStorage
- **AND** allows access to public content

#### Scenario: Guest user limitations

- **WHEN** guest user attempts to access user-specific features (favorites, history)
- **THEN** system prompts user to register or login
