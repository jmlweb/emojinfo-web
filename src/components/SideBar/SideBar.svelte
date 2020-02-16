<script>
  import { getContext } from 'svelte'
  import { fade } from 'svelte/transition'

  const { menuOpen, toggleMenu } = getContext('appState')
  import ModeSelector from './ModeSelector.svelte'
  import SizeSelector from './SizeSelector.svelte'
  import GenderSelector from './GenderSelector.svelte'
  import ToneSelector from './ToneSelector.svelte'
</script>

{#if $menuOpen}
  <div class="overlay" transition:fade on:click="{toggleMenu}"></div>
{/if}

<aside class:menuOpen="{$menuOpen}">
  <ModeSelector />
  <SizeSelector />
  <GenderSelector />
  <ToneSelector />
  <div class="button-wrapper">
    <button on:click="{toggleMenu}">Close</button>
  </div>
</aside>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(25, 18, 87, 0.7);
  }
  aside {
    background: linear-gradient(180deg, #f4f5f5 0%, #f0f2f4 100%);
    width: 340px;
    max-width: 100%;
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    transform: translateX(360px);
    padding: 16px 24px;
    opacity: 0.5;
    transition: transform 0.3s, opacity 0.2s;
    padding-top: 50px;
    display: flex;
    flex-direction: column;

    box-shadow: -6px 0 40px rgba(0, 0, 0, 0.3), -1px 0px 2px rgba(0, 0, 0, 0.4);

    transition-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }

  .menuOpen {
    transform: translateX(0);
    opacity: 1;
    transition: transform 0.4s, opacity 0.5s;
  }

  .menu {
    text-align: right;
  }

  .button-wrapper {
    margin-top: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button {
    background-color: var(--color-primary);
    border-radius: 4px;
    display: block;
    width: 100%;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    padding: 12px 24px;
    transition: background-color 0.4s;

    &:hover {
      background-color: var(--color-mixed);
    }

    &:active {
      background-color: var(--color-secondary);
    }
  }
</style>
