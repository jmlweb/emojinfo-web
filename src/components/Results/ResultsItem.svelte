<script>
import { getContext } from 'svelte'
  import { fade } from 'svelte/transition'

  import tipz from '../../utils/tipz'

  const { selectedEmoji, selectedEmojiData } = getContext('appState')

  export let data;
  export let tone;
  export let emojiSize;
  export let buttonHeight;

  $: skinnedData = (!tone || !data.skins) ? data : data.skins[tone - 1];

  $: tipContent = skinnedData.shortcodes
        .map(x => `:${x}:`)
        .join(', ');
</script>

<div class="item" transition:fade>
  <button
    on:click={() => selectedEmoji.set(data.emoji)}
    class="emoji"
    use:tipz="{{ content: tipContent  }}"
    style="font-size: {emojiSize}px; height: {buttonHeight}px">
    {skinnedData.emoji}
  </button>
</div>

<style>
  .item {
    margin: 0;
    padding: 0;
    display: flex;
  }

  .emoji {
    background: linear-gradient(145deg, #e3e5e5, #ffffff);
    font-family: initial;
    border: 0;
    box-shadow: 7px 7px 13px #cfd0d0, -7px -7px 13px #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    display: block;
    width: 100%;
    border-radius: 8px;
    transform-origin: 50% 50%;
    transition: transform 0.2s;
    outline: 0;

    &:hover {
      background: linear-gradient(145deg, #ffffff, #e3e5e5);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.9);
    }
  }
</style>
