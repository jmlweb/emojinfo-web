<script>
  import { getContext } from 'svelte'
  import throttle from 'just-throttle'
  import SideBarGroup from './SideBarGroup.svelte'

  const { emojiSize } = getContext('appState')

  const updateEmojiSize = e => {
    emojiSize.set(Number(e.target.value))
  }
</script>

<SideBarGroup title="Emoji size">
  <input
    type="range"
    min="16"
    max="64"
    step="2"
    on:change="{throttle(updateEmojiSize, 60)}"
    value="{$emojiSize}" />
</SideBarGroup>

<style>
  input {
    width: 100%;
  }
</style>
