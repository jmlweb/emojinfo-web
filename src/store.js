import { derived, writable, readable } from 'svelte/store'
import {
  either,
  includes,
  filter,
  join,
  map,
  pipe,
  prop,
  toLower,
  trim,
} from 'rambda'

import GENDERS from './constants/genders'
import MODES from './constants/modes'
import emojiService from './services/emojiService'
import generateData from './utils/generateData'

const setLocalItemIfNeeded = key => val => {
  if (val) {
    localStorage.setItem(key, val)
  }
}

/**
 * MODE
 */
const storedMode = localStorage.getItem('mode')
export let mode = writable(storedMode || MODES.categorized.value)

mode.subscribe(setLocalItemIfNeeded('mode'))

/**
 * EMOJI SIZE
 */
const DEFAULT_EMOJI_SIZE = 28
const storedEmojiSize = localStorage.getItem('emojiSize')
export let emojiSize = writable(
  storedEmojiSize ? Number(storedEmojiSize) : DEFAULT_EMOJI_SIZE
)
emojiSize.subscribe(setLocalItemIfNeeded('emojiSize'))

/**
 * TONE
 */
const storedTone = localStorage.getItem('tone')
export let tone = writable(storedTone ? Number(storedTone) : null)
tone.subscribe(setLocalItemIfNeeded('tone'))

export let menuOpen = writable(false)
export let gender = writable(Object.values(GENDERS))
export let keyword = writable('')

export let selectedEmoji = writable(null)

/**
 * DATA
 */
const sourceData = readable(null, set => {
  emojiService.fetch().then(set)
})

const metadata = derived(sourceData, ($sourceData, set) => {
  if (!$sourceData) {
    set({})
  } else {
    const [metadata] = $sourceData
    set(metadata)
  }
})

const groups = derived(metadata, ($metadata, set) => {
  set($metadata.groups)
})

const subgroups = derived(metadata, ($metadata, set) => {
  set($metadata.subgroups)
})

const emojiList = derived(sourceData, ($sourceData, set) => {
  if (!$sourceData) {
    set([])
  } else {
    const [, emojiList] = $sourceData
    set(emojiList)
  }
})

const filteredEmojiList = derived(
  [emojiList, keyword],
  ([$emojiList, $keyword], set) => {
    if (!$keyword) {
      set($emojiList)
    } else {
      const cleanKeyword = trim($keyword.toLowerCase())
      set(
        filter(
          either(
            pipe(
              prop('shortcodes'),
              map(toLower),
              join(', '),
              includes(cleanKeyword)
            ),
            pipe(prop('name'), toLower, includes(cleanKeyword))
          ),
          $emojiList
        )
      )
    }
  }
)

export let data = derived(
  [metadata, filteredEmojiList],
  ([$metadata, $filteredEmojiList], set) => {
    set(generateData($metadata, $filteredEmojiList))
  }
)

export const isLoading = derived([data, keyword], ([$data, $keyword], set) =>
  set(!$data.length && $keyword.length === 0)
)
export const selectedEmojiData = derived(
  [emojiList, selectedEmoji],
  ([$emojiList, $selectedEmoji], set) => {
    if (!$selectedEmoji) {
      set(null)
    } else {
      const found = $emojiList.find(x => x.emoji === $selectedEmoji)
      if (found) {
        set(found)
      }
    }
  }
)

export default {
  mode,
  data,
  isLoading,
  gender,
  emojiSize,
  menuOpen,
  tone,
  keyword,
  selectedEmoji,
  selectedEmojiData,
  groups,
  subgroups,
}
