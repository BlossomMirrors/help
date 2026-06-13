import Button from "./button.svelte";
export { buttonVariants } from "./button.svelte";
import type { HTMLButtonAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

export type ButtonVariant =
	| "default"
	| "primary"
	| "destructive"
	| "ghost"
	| "link"
	| "outline"
	| "secondary";

export type ButtonSize =
	| "default"
	| "sm"
	| "lg"
	| "icon"
	| "icon-sm"
	| "icon-xs"
	| "xs";

export type ButtonProps = HTMLButtonAttributes & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	class?: string;
	ref?: HTMLElement | null;
	children?: Snippet;
};

export { Button, Button as Root };
