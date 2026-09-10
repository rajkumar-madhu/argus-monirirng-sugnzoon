<p align="center">
  <strong>Argus Frontend</strong>
</p>

# Argus Frontend

React-based web interface for Argus, a community observability fork of MIT-licensed SigNoz. Original SigNoz copyright is retained in the root `LICENSE`. This UI is not affiliated with SigNoz Inc.

Placeholders: `github.com/rajkumar-madhu/argus-monirirng-sugnzoon`, `https://argus.example.com`. The UI still depends on upstream `@signozhq/*` design-system packages.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **State:** React Query, Zustand, Redux Toolkit (legacy)
- **Styling:** CSS Modules, Ant Design (legacy)
- **Charts:** uPlot
- **Testing:** Jest

## Local Development Setup

1. Run the Argus backend locally — see [docs/contributing/development.md](../docs/contributing/development.md)

2. Configure environment:
   ```bash
   cp example.env .env
   ```
   
   Key variables in `.env`:
   ```bash
   # Backend API endpoint (required)
   VITE_FRONTEND_API_ENDPOINT="http://localhost:8080"
   
   # Enable bundle analyzer (optional)
   BUNDLE_ANALYSER="true"
   ```

3. Install and run:
   ```bash
   pnpm install
   pnpm dev
   ```

## Development

```bash
pnpm dev
```

Opens [http://localhost:3301](http://localhost:3301).

## Build

```bash
pnpm build
```

Output in `build/` folder.

## Bundle Size Analysis

Set in `.env`:
```bash
BUNDLE_ANALYSER="true"
```

Then run build:
```bash
pnpm build
```

Opens bundle analyzer visualization automatically.

## Testing

```bash
# Unit tests
pnpm test

# Type checking
pnpm tsgo --noEmit
```

## Linting

```bash
# Run all linters (oxlint + stylelint)
pnpm lint
```

## Project Structure

```
src/
├── api/          # API clients and react-query hooks
├── components/   # Shared UI components
├── container/    # Page-level containers
├── hooks/        # Custom React hooks
├── pages/        # Route pages
├── providers/    # React context providers
├── store/        # Redux store
└── types/        # TypeScript definitions
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [docs/ARGUS.md](../docs/ARGUS.md).
