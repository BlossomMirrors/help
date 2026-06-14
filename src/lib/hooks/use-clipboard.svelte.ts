export class UseClipboard {
	status = $state<'success' | 'failure' | undefined>(undefined);

	async copy(text: string): Promise<'success' | 'failure'> {
		try {
			await navigator.clipboard.writeText(text);
			this.status = 'success';
			setTimeout(() => (this.status = undefined), 2000);
			return 'success';
		} catch {
			this.status = 'failure';
			setTimeout(() => (this.status = undefined), 2000);
			return 'failure';
		}
	}
}
