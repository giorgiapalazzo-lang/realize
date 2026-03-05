# Influencer Access Portal - MVP

## Setup & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   The app uses SQLite. The database will be automatically seeded on the first run.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Login Credentials**:
   - **Admin**: `admin@portal.com` / `admin123`
   - **Media Center**: `media@center.com` / `media123`

## Features
- **Login**: Role-based access (Admin/Media Center).
- **Influencer List**: Advanced filtering by ER, followers, pricing, and specific tags.
- **Influencer Details**: Case studies, pricing ranges, and media profiles.
- **Shortlist**: Manage selected influencers and generate campaign emails.
- **Email Generation**: Preview and copy campaign summaries to clipboard.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons + Motion
- **Backend**: Express.js (Full-stack mode)
- **Database**: SQLite (via Better-SQLite3)
- **Auth**: JWT-based session in cookies
