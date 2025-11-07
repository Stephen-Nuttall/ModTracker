import PieChart from "./pieChart"

function ChartManager({ profile }) {
    let readyMods = { label: "Available for " + profile?.version, value: 0, color: 'rgb(0, 125, 0)' }
    let priorityLevels = [readyMods]

    if (profile?.modlist) {
        for (const mod of profile?.modlist) {
            const priority = mod?.priority
            const existingPriority = priorityLevels.find(pr => pr.label === priority.name)

            if (mod.versions.includes(profile?.version)) {
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
        <PieChart data={priorityLevels} size={500} />
    )
}

export default ChartManager