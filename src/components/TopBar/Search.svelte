<script>
  import { getContext } from 'svelte'

  import SearchIcon from './SearchIcon.svelte'
  const { keyword, isLoading } = getContext('appState')

  let value = $keyword;

  const doSearch = () => {
    keyword.set(value)
  }
</script>

<form class="box" on:submit|preventDefault={doSearch}>
  <input
    class="input"
    type="text"
    placeholder="Search emoji"
    disabled="{$isLoading}" bind:value />
  <button class="button" class:loading="{$isLoading}" on:click={doSearch}>
    <SearchIcon />
  </button>
</form>

<style>
  .box {
    width: 100%;
    position: relative;
    box-shadow: 2px 2px 12px rgba(5, 35, 63, 0.08),
      1px 1px 4px rgba(5, 35, 63, 0.08);
  }

  .input {
    padding: 12px;
    padding-right: 48px;
    width: 100%;
    font-size: 18px;
    font-family: var(--font-primary);
    font-weight: 300;
    border-radius: 4px;
    border: 0;
    background: #fff;
  }

  .button {
    position: absolute;
    right: 4px;
    top: 4px;
    bottom: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-secondary);
    border-radius: 4px;
    transition: background-color 0.4s;

    &:hover {
      background-color: var(--color-mixed);
    }

    &:active {
      background-color: var(--color-primary);
    }
  }

  .loading, [disabled] {
    opacity: 0.5;
  }
</style>
