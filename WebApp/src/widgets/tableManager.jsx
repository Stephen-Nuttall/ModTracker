import React from "react"
import profileManager from '../data/stateProvider.jsx'

import ModTable from "./modTable"
import '../styles/modTable.css'

const TableManager = ({ profile, OpenPriorityPopup, setModToAddPriorityTo, forceRerender }) => {
    const priorityList = profileManager.getPriorityList()
    const modList = profile.getModList()

    function handlePriorityChange(tableIndex, priorityIndex) {
        if (priorityIndex == "CREATE_NEW") {
            setModToAddPriorityTo(modList[tableIndex])
            OpenPriorityPopup(true)
            return
        }

        if (priorityIndex < priorityList.length) {
            const mod = profile.getMod(tableIndex)
            const priority = profileManager.getPriority(priorityIndex)

            if (priority !== undefined) {
                mod.priority = priority
                forceRerender(profileManager.hash())
                console.log(`'${mod.getName()}' has been set to '${priority.name}'`)
            } else {
                throw new Error("Could not update priority. Priority object at given index is undefined.")
            }
        } else {
            console.error("PriorityIndex of " + priorityIndex + " is out of range")
        }
    }

    const handleDelete = async (tableIndex) => {
        profile.removeMod(tableIndex)
        forceRerender(profileManager.hash())
    }

    return (
        <div className='table-manager'>
            <ModTable
                modList={modList}
                priorityList={priorityList}
                onPriorityChange={handlePriorityChange}
                onDelete={handleDelete}
                selectedVersion={profile.selectedVersion}
            />
        </div>
    )
}

export default TableManager