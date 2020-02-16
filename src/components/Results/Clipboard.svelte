<script>
	import { tick } from 'svelte';

	let valueCopy = null;
	export let value = null;
	export let onCopy;
	let areaDom;

	async function copy() {
		valueCopy = value;
		await tick();
		areaDom.focus();
    areaDom.select();
		let message = '';
		try {
			const successful = document.execCommand('copy');
			if (!successful) {
				message = 'Copying text was unsuccessful';
			} else {
				onCopy();
			}
		} catch (err) {
			message = 'Oops, unable to copy';
		}

		// we can notifi by event or storage about copy status
		if (message.length) {
			console.error(message);
		}
		valueCopy = null;
	}
</script>

<div class="clipboard">
	{#if valueCopy != null}
		<textarea bind:this={areaDom}>{ valueCopy }</textarea>
	{/if}
	<button class="copy-button" on:click={copy}>
		Copy to clipboard
	</button>
</div>

<style>
	.clipboard {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

  textarea {
    position: fixed;
    top: 0;
    left: 0;
    width: 2em;
    height: 2em;
    padding: 0;
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
  }

	.copy-button {
		background-color: var(--color-secondary);
    border-radius: 4px;
    transition: background-color 0.4s;
		color: #fff;
		font-family: var(--font-primary);
		font-size: 18px;
		padding: 8px 16px;
		border: 0;

		&:hover {
      background-color: var(--color-mixed);
    }
	}
</style>
