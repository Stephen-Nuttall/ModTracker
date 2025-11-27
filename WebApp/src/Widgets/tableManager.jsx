import { useMemo } from 'react'

import ModTable from "./modTable";
import '../styles/modTable.css';

const TableManager = ({ profile, requestRef, profileIndex, OpenPriorityPopup, setModToAddPriorityTo }) => {
    const modList = useMemo(() => {
        if (!profile?.modlist) return [];
        return profile?.modlist.map((modData, i) => ({
            name: modData.name,
            id: modData.id,
            url: modData.url,
            versions: modData.versions,
            priority: modData.priority,
            tablePos: i
        }));
    }, [profile]);

    const priorityList = useMemo(() => {
        if (!profile?.priorityList) return [];

        const uniqueNames = new Set();
        return profile?.priorityList.filter(priorityData => {
            if (uniqueNames.has(priorityData.name)) {
                console.warn("Duplicate priority name found! '" + priorityData.name + "' will not be displayed.")
                return false; // Skip if the name is already in the set
            } else {
                uniqueNames.add(priorityData.name);
                return true; // Include if the name is unique
            }
        }).map(priorityData => ({
            name: priorityData.name,
            r: priorityData.r,
            g: priorityData.g,
            b: priorityData.b
        }));
    }, [profile]);

    const handlePriorityChange = async (tableIndex, priorityIndex) => {
        if (priorityIndex == "CREATE_NEW") {
            setModToAddPriorityTo(tableIndex)
            OpenPriorityPopup(true)
            return
        }

        if (priorityIndex < profile?.priorityList.length) {
            let newPriority = priorityList[priorityIndex]

            if (requestRef.current) {
                const data = await requestRef.current?.genericRequest(
                    "update-mod-priority",
                    {
                        profileIndex: profileIndex,
                        modIndex: tableIndex,
                        priorityName: newPriority.name,
                        red: newPriority.r,
                        green: newPriority.g,
                        blue: newPriority.b
                    },
                    "Failed to update priority level: ",
                    'Priority level successfully updated'
                )
            } else {
                console.error("PriorityIndex of " + priorityIndex + " is out of range")
            }
        } else {
            console.error("requestRef is not set!")
        }
    };

    const handleDelete = async (tableIndex) => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "remove-mod", { profileIndex: profileIndex, modIndex: tableIndex },
                "Failed to remove mod: ", "Mod successfully removed."
            )
        } else {
            console.error("requestRef is not set!")
        }
    };

    return (
        <div className='table-manager'>
            <ModTable
                modList={modList}
                priorityList={priorityList}
                onPriorityChange={handlePriorityChange}
                onDelete={handleDelete}
                selectedVersion={profile?.version}
            />
        </div>
    )
}

export default TableManager