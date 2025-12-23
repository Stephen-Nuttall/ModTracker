import PieChart from "./pieChart"

function ChartManager({ profile }) {
    const modlist = profile.getModList()
    let readyMods = { label: "Available for " + profile.selectedVersion, value: 0, color: 'rgb(0, 125, 0)' }
    let priorityLevels = [readyMods]

    if (modlist) {
        for (const mod of modlist) {
            const versions = mod.getVersions()
            const priority = mod.priority
            const existingPriority = priorityLevels.find(pr => pr.label === priority.name)

            if (versions.includes(profile.selectedVersion)) {
                readyMods.value++
            } else if (existingPriority) {
                existingPriority.value += 1
            } else {
                const red = Number.isFinite(priority.r) ? priority.r : 0
                const green = Number.isFinite(priority.g) ? priority.g : 0
                const blue = Number.isFinite(priority.b) ? priority.b : 0
                priorityLevels.push({
                    label: priority.name,
                    value: 1,
                    color: `rgb(${red}, ${green}, ${blue})`
                })
            }
        }
    }

    return (
        <PieChart data={priorityLevels} size={600} />
    )
}

export default ChartManager