import { useState } from 'react'
import profileManager from '../data/stateProvider.jsx'

import ModTable from "./modTable";
import '../styles/modTable.css';

const TableManager = ({ profile, OpenPriorityPopup, setModToAddPriorityTo }) => {
    const [managerHash, forceRerender] = useState("")
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

            mod.priority = priority
            forceRerender(profileManager.hash())
            console.log(`'${mod.getName()}' has been set to '${priority.name}'`)
        } else {
            console.error("PriorityIndex of " + priorityIndex + " is out of range")
        }
    };

    const handleDelete = async (tableIndex) => {
        profile.removeMod(tableIndex)
    };

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