# Contributing to MUSE

Thank you for contributing to **MUSE**! We welcome contributions aligned with our core philosophy:
> **The AI interaction should be short; the real-world interaction should be long.**

## Hacktoberfest & Open Source Guidelines

MUSE is built for **Hacktoberfest** under the "Touch Grass" theme: encouraging developers and players to step away from the screen and engage with the physical world through multimodal AI.

### Development Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests and type checks:
   ```bash
   npm test
   npm run typecheck
   ```
4. Start the development server:
   ```bash
   npx expo start
   ```

### Branch Naming Conventions
- `feat/mission-engine`
- `feat/camera`
- `feat/gemma-provider`
- `feat/verification`
- `fix/image-resizing`
- `docs/readme-updates`

### Pull Request Guidelines
- Keep PRs focused on a single concern.
- Ensure all tests pass (`npm test`) and TypeScript compiles (`npm run typecheck`).
- Document any new environment variables or architecture changes.
- Never commit private API keys or secrets.
