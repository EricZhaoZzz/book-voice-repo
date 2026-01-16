# Book Voice - English Listening Audio Platform

Quick access to English listening resources via QR code scanning for primary and secondary school students.

## Tech Stack

### Frontend

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form handling and validation
- **Howler.js** - Audio playback

### Backend

- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - File storage with CDN
  - Row Level Security (RLS)

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky + lint-staged** - Git hooks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd book-voice-repo
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
book-voice-repo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (main)/            # Main app routes
│   │   ├── admin/             # Admin routes
│   │   └── api/               # API routes
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── player/            # Audio player
│   │   ├── textbooks/         # Textbook management
│   │   ├── lessons/           # Lesson management
│   │   └── analytics/         # Analytics
│   ├── components/            # Shared components
│   │   ├── ui/                # UI components (shadcn)
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities
│   │   ├── supabase/          # Supabase client
│   │   ├── utils/             # Helper functions
│   │   └── hooks/             # Custom hooks
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── public/                    # Static files
├── docs/                      # Documentation
└── tests/                     # Tests (future)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features

### Phase 1 (MVP)

- [x] Project setup and infrastructure
- [ ] User authentication (email + password)
- [ ] Guest mode
- [ ] Three-tier content structure (Textbook → Unit → Lesson)
- [ ] Basic audio player
- [ ] QR code generation and scanning
- [ ] Admin content management

### Phase 2

- [ ] Advanced player features (speed control, AB loop, resume playback)
- [ ] Subtitle display
- [ ] Favorites system
- [ ] Play history
- [ ] Search and filter

### Phase 3

- [ ] Learning statistics and reports
- [ ] Batch QR code export
- [ ] Analytics dashboard
- [ ] User management

## Database Schema

See [TECHNICAL_ARCHITECTURE.md](./docs/TECHNICAL_ARCHITECTURE.md) for detailed database schema.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'feat: add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

### Commit Convention

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## License

Private project - All rights reserved

## Support

For issues and questions, please contact the development team.
