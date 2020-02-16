import { fetchFromCDN } from 'emojibase'

const fetchGroups = fetchFromCDN('meta/groups.json')
const fetchData = fetchFromCDN('en/data.json')

const emojiService = {
  fetch: () => Promise.all([fetchGroups, fetchData]),
}

export default emojiService
