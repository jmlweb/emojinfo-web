<script>
  import { getContext } from 'svelte'
  import GENDERS from '../../constants/genders'
  import SideBarGroup from './SideBarGroup.svelte'

  const { gender } = getContext('appState')
</script>

<SideBarGroup title="Filter by gender">
  <ul>
  {#each Object.keys(GENDERS) as genderKey}
    <li>
      <label>
        <input
          type="checkbox"
          bind:group="{$gender}"
          value="{Number(GENDERS[genderKey])}" />
        {genderKey}
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
