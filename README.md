# Translation Chat App

A real-time translation chat application built with SvelteKit, featuring streaming responses and support for 22 languages. Powered by Cohere's translation API with a clean, responsive interface.

## Features

- 🌍 **22 Language Support**: Japanese, French, German, Spanish, Italian, Portuguese, and more
- 💬 **Real-time Chat Interface**: Texting app-style with auto-scroll to newest messages
- ⚡ **Streaming Responses**: Live translation updates as they're generated
- 💾 **Persistent History**: Chat messages stored in localStorage
- 🎨 **Responsive Design**: Stone/amber warm color palette with mobile-first approach
- ♿ **Accessible**: Full keyboard navigation and screen reader support

## Technology Stack

- **SvelteKit** with Svelte 5 (runes syntax)
- **TypeScript** for type safety
- **Tailwind CSS v4** with forms and typography plugins
- **Cloudflare Pages** deployment ready
- **Cohere API v2** with `command-a-translate-08-2025` model

## Development Setup

### Prerequisites

- Node.js 18+ or pnpm
- Cohere API key (sign up at [cohere.com](https://cohere.com))

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

Add this translation app as a page/section within an existing Cloudflare-hosted website.

#### Method A: Subdirectory Integration

If your existing site supports it, deploy the translation app to a subdirectory:

1. **Configure Route Prefix**:
   
   Update `svelte.config.js`:
   ```javascript
   import adapter from '@sveltejs/adapter-cloudflare';
   import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

   const config = {
     preprocess: vitePreprocess(),
     kit: {
       adapter: adapter(),
       paths: {
         base: '/translate'  // App will be available at yourdomain.com/translate
       }
     }
   };

   export default config;
   ```

2. **Deploy as Separate Pages Project**:
   - Follow the standalone deployment steps above
   - Configure your main site to proxy `/translate/*` requests to this Pages deployment

3. **Nginx/Cloudflare Worker Proxy Example**:
   ```javascript
   // Cloudflare Worker for proxying
   export default {
     async fetch(request) {
       const url = new URL(request.url);
       if (url.pathname.startsWith('/translate')) {
         return fetch(`https://your-translation-app.pages.dev${url.pathname}${url.search}`);
       }
       // Handle other routes...
       return fetch(request);
     }
   }
   ```

#### Method B: Iframe Integration

For simpler integration without proxying:

```html
<!-- Add to your existing website -->
<iframe 
  src="https://your-translation-app.pages.dev" 
  width="100%" 
  height="600px"
  frameborder="0"
  title="Translation Chat">
</iframe>
```

#### Method C: Build Integration

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
   - Add Tailwind plugins to your existing config
   - Ensure environment variables are configured

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COHERE_API_KEY` | Yes | Your Cohere API key for translation services |

## Styling Integration

If integrating with an existing site, you may want to:

1. **Override Colors**: Modify the Tailwind color palette in your CSS
2. **Consistent Typography**: Ensure font families match your site
3. **Custom CSS**: Add custom styles for seamless integration

Example CSS overrides:
```css
/* Custom styles for integration */
.translation-chat {
  --primary-color: your-brand-color;
  --background-color: your-background-color;
}
```

## Performance Optimization

- **Lazy Loading**: The app loads translation API only when needed
- **LocalStorage**: Chat history persists without server storage
- **Streaming**: Responses render progressively for better UX
- **CDN**: Cloudflare's global CDN ensures fast loading worldwide

## Troubleshooting

### Common Issues

1. **API Key Not Found**:
   - Verify `COHERE_API_KEY` is set in Cloudflare environment variables
   - Check that the variable is applied to the correct environment (production/preview)

2. **Build Failures**:
   - Ensure Node.js version is 18+
   - Check that all dependencies are installed
   - Verify build command matches your package manager (npm/pnpm)

3. **Routing Issues with Integration**:
   - Check that base path configuration matches your proxy setup
   - Ensure no route conflicts with existing site

### Support

- Check the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)
- Review [SvelteKit Cloudflare adapter docs](https://kit.svelte.dev/docs/adapter-cloudflare)
- For Cohere API issues, see [Cohere documentation](https://docs.cohere.com/)

## License

[Add your license information here]
