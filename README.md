# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

## Developing

Once you've installed dependencies with `deno install`, start a development server:

```sh
deno task dev

# or start the server and open the app in a new browser tab
deno task dev -- --open
```

## Building

To create a production version of your app:

```sh
deno task build
```

You can preview the production build with `deno task preview`.

## Deploying

This project deploys to [Cloudflare Workers](https://developers.cloudflare.com/workers/) using [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare), which outputs a Worker to `.svelte-kit/cloudflare/`.

Copy `.dev.vars.example` to `.dev.vars` and fill in `ANTHROPIC_API_KEY` for local `wrangler dev`/`wrangler deploy`. In production, set it with:

```sh
deno run -A ./node_modules/.bin/wrangler secret put ANTHROPIC_API_KEY
```

Then deploy with:

```sh
deno task deploy
```

CI (`.gitlab-ci.yml`) runs this on pushes to `main`, and needs a `CLOUDFLARE_API_TOKEN` CI/CD variable set in the project settings.
