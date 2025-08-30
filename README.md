# How Do You Say?

A real-time translation chat application built with SvelteKit, featuring streaming responses and support for 23 languages. Powered by Cohere's translation API with a clean, responsive interface.

## Features

- 🌍 **23 Language Support**: Japanese, French, German, Spanish, Italian, Portuguese, and more
- 💬 **Real-time Chat Interface**: Texting app-style with auto-scroll to newest messages
- 💾 **Persistent History**: Chat messages stored in localStorage

## Limitations
- 😅 **Phonetic Mixup**: Languages that use the Latin alphabet often generate phonetics of the English version of the text.

## Stack

- **SvelteKit** with Svelte 5 (runes syntax)
- **TypeScript** for type safety
- **Tailwind CSS v4** with forms and typography plugins
- **Cloudflare Pages** deployment ready
- **Cohere APIv2** with `command-a-translate-08-2025` model

## Development Setup

### Prerequisites

- Node.js 18+ or pnpm
- Cohere API key (sign up at [cohere.com](https://dashboard.cohere.com))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd hdys

# Install dependencies
pnpm install
# or
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
COHERE_API_KEY=your_cohere_api_key_here
```

### Development Commands

```bash
# Start development server
pnpm dev
# or
npm run dev

# Start dev server and open in browser
pnpm run dev -- --open

# Type checking
pnpm run check
pnpm run check:watch  # watch mode

# Linting and formatting
pnpm lint              # check formatting and linting
pnpm run format        # format code

# Build for production
pnpm build
pnpm preview          # preview production build
```

## Cloudflare Deployment

This app is configured with the Cloudflare Pages adapter and can be deployed in two ways:

### Option 1: Standalone Deployment (Recommended)

Deploy as its own Cloudflare Pages site (e.g., `translate.yourdomain.com` or `your-app.pages.dev`).

#### Step 1: Create wrangler.toml

Create a `wrangler.toml` file in your project root:

```toml
name = "translation-chat-app"
compatibility_date = "2024-08-30"
pages_build_output_dir = ".svelte-kit/cloudflare"

[env.production.vars]
# Environment variables will be set in Cloudflare dashboard
```

#### Step 2: Deploy via Cloudflare Dashboard

1. **Connect Repository**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your repository

2. **Configure Build Settings**:
   - **Framework preset**: SvelteKit
   - **Build command**: `npm run build` or `pnpm build`
   - **Build output directory**: `.svelte-kit/cloudflare`
   - **Node.js version**: 18 or higher

3. **Set Environment Variables**:
   - In Pages project settings → Environment variables
   - Add `COHERE_API_KEY` with your API key
   - Apply to both Production and Preview environments

4. **Deploy**:
   - Click "Save and Deploy"
   - Your app will be available at `your-project-name.pages.dev`

#### Step 3: Custom Domain (Optional)

1. In Cloudflare Pages → Custom domains
2. Add your domain (e.g., `translate.yourdomain.com`)
3. Cloudflare will handle SSL certificates automatically

### Option 2: Integration with Existing Website

For more advanced integration, you can build this as part of your existing SvelteKit site:

1. **Copy Source Files**:
   - Copy `src/routes/api/translate` to your existing site
   - Copy the main page component to your desired route

2. **Install Dependencies**:
   ```bash
   # Add to your existing package.json
   npm install @tailwindcss/forms @tailwindcss/typography
   ```

3. **Update Configuration**:
   - Ensure environment variables are configured

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COHERE_API_KEY` | Yes | Your Cohere API key for translation services |



Apache 2.0 License
