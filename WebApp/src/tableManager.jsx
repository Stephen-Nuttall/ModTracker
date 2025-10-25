import { useState, useMemo } from 'react'

import ModTable from "./modTable";
import './styles/modTable.css';

const TableManager = ({ profileData, requestRef, OpenPriorityPopup, setModToAddPriorityTo }) => {
    const modList = useMemo(() => {
        if (!profileData?.profile?.modlist) return [];
        return profileData.profile.modlist.map((modData, i) => ({
            name: modData.name,
            id: modData.id,
            url: modData.url,
            versions: modData.versions,
            priority: modData.priority,
            tablePos: i
        }));
    }, [profileData]);

    const priorityList = useMemo(() => {
        if (!profileData?.profile?.priorityList) return [];

        const uniqueNames = new Set();
        return profileData.profile.priorityList.filter(priorityData => {
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
    }, [profileData]);

    const handlePriorityChange = async (tableIndex, priorityIndex) => {
        if (priorityIndex == "CREATE_NEW") {
            setModToAddPriorityTo(tableIndex)
            OpenPriorityPopup(true)
            return
        }

        if (priorityIndex < profileData.priorityListLength) {
            let newPriority = priorityList[priorityIndex]

            if (requestRef.current) {
                const data = await requestRef.current?.genericRequest(
                    "update-mod-priority",
                    {
                        profileIndex: 0,
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
                "remove-mod", { profileIndex: 0, modIndex: tableIndex },
                "Failed to remove mod: ", "Mod successfully removed."
            )
        } else {
            console.error("requestRef is not set!")
        }
    };

    return (
        <>
            <ModTable
                modList={modList}
                priorityList={priorityList}
                onPriorityChange={handlePriorityChange}
                onDelete={handleDelete}
                selectedVersion={profileData.profile?.version}
            />
        </>
    )
}

export default TableManager