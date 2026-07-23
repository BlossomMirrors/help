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

You can preview the production build with `deno task preview`, or run the built Deno server directly:

```sh
deno task serve
```

This project deploys using [`@deno/svelte-adapter`](https://github.com/denoland/svelte-adapter), which outputs a Deno-native server to `.deno-deploy/`.
