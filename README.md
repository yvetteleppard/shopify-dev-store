# Superrb Themekit

## Setup

1. Create new private project on Github in the superrbstudio organisation
2. Clone this repo
3. Change remote URL to your new project: `git remote set-url origin git@github.com:superrbstudio/<yourprojectname>.git`
4. Run `npm install` to install all dependencies
5. Commit and push everything
6. Duplicate `.config.sample.yml` to create `.config.yml`
7. Create a private app for deployment. Add this settings to your `.config.yml` - [Ref](https://shopify.dev/tools/theme-kit/getting-started#step-2-generate-api-credentials)
8. Add your config

## Workflow

### Local Development
You'll need to run two processes for local development. `npm run dev` and `npm run watch`. If your theme is the currently published theme (usually on development stores), use `npm run watch-live` instead.

### Live

Run `npm run deploy`