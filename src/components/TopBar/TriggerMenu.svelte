<script>
  import { getContext } from 'svelte'
  import { spring } from 'svelte/motion'

  const { menuOpen, toggleMenu } = getContext('appState')

  const efc = e => {
    toggleMenu(e);
  }

  const springOpts = {
    stiffness: 0.04,
    damping: 0.3,
  }

  const first = spring(null, springOpts)
  const second = spring(null, springOpts)
  const third = spring(null, springOpts)
  $: $first = $menuOpen
    ? {
        x: 23.8873,
        y: 6.33093,
        rotate: 45,
      }
    : {
        x: 0,
        y: 0,
        rotate: 0,
      }
  $: $second = $menuOpen
    ? {
        x: 8.33093,
        y: 87.1127,
        rotate: -45,
      }
    : {
        x: 0,
        y: 44,
        rotate: 0,
      }
  $: $third = $menuOpen
    ? {
        x: 23.8873,
        y: 8.33093,
        rotate: 45,
      }
    : {
        x: 0,
        y: 88,
        rotate: 0,
      }
</script>

<button on:click="{efc}" class:open="{$menuOpen}" aria-label="Toggle menu">
  <svg
    width="18"
    height="18"
    viewBox="0 0 110 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <rect
      x="{$first.x}"
      y="{$first.y}"
      width="110"
      height="22"
      transform="{`rotate(${$first.rotate} ${$first.x} ${$first.y})`}"
      fill="white"></rect>
    <rect
      x="{$second.x}"
      y="{$second.y}"
      width="110"
      height="22"
      transform="{`rotate(${$second.rotate} ${$second.x} ${$second.y})`}"
      fill="white"></rect>
    <rect
      x="{$third.x}"
      y="{$third.y}"
      width="110"
      height="22"
      transform="{`rotate(${$third.rotate} ${$third.x} ${$third.y})`}"
      fill="white"></rect>
  </svg>
</button>

<style>
  button {
    background: transparent;
    border: 1px solid transparent;
    padding: 10px;
    position: fixed;
    z-index: 2;
    outline: 0;
    margin-right: -10px;
    right: 24px;
    top: 18px;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    border-radius: 50%;
    box-shadow: 1px 3px 12px rgba(5, 35, 63, 0.3);
    transition: transform 0.2s, background-color 0.6s;
  }

  .open {
    background-color: var(--color-secondary);
  }

  button:hover {
    background-color: var(--color-mixed)
  }

  button:active {
    background-color: var(--color-secondary)
  }

  svg {
    display: block;
  }
</style>
