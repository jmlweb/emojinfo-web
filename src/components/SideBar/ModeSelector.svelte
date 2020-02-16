<script>
  import { getContext } from 'svelte'
  import MODES from '../../constants/modes'
  import SideBarGroup from './SideBarGroup.svelte'

  const { mode } = getContext('appState')
</script>

<SideBarGroup title="Emoji Organization">
  <ul class="wrapper">
    {#each Object.keys(MODES) as modeKey}
    <li>
      <label>
        <input type="radio" bind:group="{$mode}" value={MODES[modeKey].value} />
        {MODES[modeKey].title}
      </label>
    </li>
    {/each}
  </ul>
</SideBarGroup>

<style>
  ul {
    color: var(--color-blue-8);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0 0 16px;

    &:last-child {
      margin-right: 0;
    }
  }

  label {
    cursor: pointer;
  }
</style>
