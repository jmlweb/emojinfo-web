import { fetchFromCDN } from 'emojibase'

const fetchGroups = fetchFromCDN('meta/groups.json', { version: '5.1.1' })
const fetchData = fetchFromCDN('en/data.json', { version: '5.1.1' })

const emojiService = {
  fetch: () => Promise.all([fetchGroups, fetchData]),
}

export default emojiService
