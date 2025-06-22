# flaZK Development Guide

## Quick Start

### 🎭 Mock Development (Recommended for UI work)

```bash
npm run dev:mocks
```

- Uses mock data
- No backend required
- Fastest startup
- Perfect for UI/UX development

### 🚀 Full Stack Development

```bash
npm run dev:full
```

- Runs both API and Widget
- Real backend integration
- Uses local file storage
- Includes pre-seeded test data

### 🔧 API Only

```bash
npm run dev:api
```

- Just the backend
- Access at http://localhost:3001

### 🌐 Widget with API

```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:widget
```

- Separate terminals for each service
- Better for debugging

## Environment Variables

### Widget (.env)

- `VITE_USE_MOCKS`: Enable/disable mock mode (true/false)

### API (.env)

- `PORT`: API port (default: 3001)
- `STORAGE_PATH`: Local storage path for uploaded files (default: ./storage)
- `DB_PATH`: Local database path (default: ./data/db.json)

## Test Data

The API comes with pre-seeded test users and documents:

### Test Users

- **Phone**: +15555551234 (Has all documents)
- **Phone**: +15555552345 (Missing driving record)
- **Phone**: +15555553456 (Missing license and points)

### Verification Code

- All test users accept code: `123456`

## Development Scenarios

### Working on UI Components

Use mock mode for fastest development:

```bash
npm run dev:mocks
```

Change scenarios using the selector in bottom-left corner:

- **All Documents**: User has everything needed
- **Missing One**: Missing driving record points
- **Missing Two**: Missing license status and points

### Testing File Uploads

In mock mode, file names determine what data is extracted:

- Files with "license" → License status data
- Files with "record" or "dmv" → Driving points data
- Files with "combined" → Both types of data

### API Integration Testing

1. Start the full environment:

   ```bash
   npm run dev:full
   ```

2. The widget will automatically use the real API endpoints

3. Uploaded files are stored in `apps/api/storage/`

4. Database is stored in `apps/api/data/db.json`

## Project Structure

```
flazk/
├── apps/
│   ├── widget/          # React verification widget
│   │   └── src/
│   └── api/             # Express backend API
│       ├── src/
│       ├── storage/     # Uploaded files (gitignored)
│       └── data/        # Local database
│           └── seed.json # Pre-seeded test data
├── packages/
│   └── shared/          # Shared configs and utilities
└── package.json         # Root package.json
```

## Common Commands

```bash
# Install all dependencies
npm run install-all

# Clean all builds
npm run clean

# Build everything
npm run build
```

## Local Storage

### Uploaded Files

- Stored in `apps/api/storage/`
- Organized by user ID
- Automatically created on first upload

### Database

- JSON file at `apps/api/data/db.json`
- Includes users, documents, and verification sessions
- Reset by copying `seed.json` over `db.json`
