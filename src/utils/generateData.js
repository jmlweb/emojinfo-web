import { groupBy, prop } from 'rambda'

const generateData = ({ hierarchy, groups, subgroups }, sourceData) => {
  if (!sourceData.length) {
    return sourceData
  }
  const groupedData = groupBy(prop('subgroup'), sourceData)
  return Object.keys(hierarchy).map(groupIndex => ({
    name: prop(groupIndex, groups),
    subgroups: prop(groupIndex, hierarchy).map(subgroupIndex => ({
      name: prop(subgroupIndex, subgroups),
      items: groupedData[Number(subgroupIndex)],
    })),
  }))
}

export default generateData
