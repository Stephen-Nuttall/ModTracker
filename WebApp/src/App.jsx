import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

import ModTable from './modTable';
import TextInputBox from './textInputBox';
import CreatePriorityPopup from './createPriorityPopup';

function App() {
    const blankProfileData = {
        profile: {
            "name": "No Data",
            "version": "No Data",
            "modlist": [],
            "priorityList": []
        },
        modListLength: 0,
        priorityListLength: 0,
        errorMessage: "None"
    }

    const [profileData, setProfileData] = useState(blankProfileData)
    const [isLoading, setIsLoading] = useState(false);
    const [priorityPopupOpen, PriorityPopupVisible] = useState(false);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [modToAddPriorityTo, setModToAddPriorityTo] = useState(-1)

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
        return profileData.profile.priorityList.map(priorityData => ({
            name: priorityData.name,
            r: priorityData.r,
            g: priorityData.g,
            b: priorityData.b
        }));
    }, [profileData]);

    useEffect(() => { updateProfileData() }, [])

    const genericCall = async (callName, params) => {
        try {
            const url = `http://localhost:8000/${callName}`
            console.log('Making post to ' + url + ' with data ' + JSON.stringify(params))
            const response = await axios.post(url, params);
            return response.data
        } catch (error) {
            console.error('Error calling API:\n', error);
            setOutput('Error calling API:\n' + error);
            return { errorMessage: error.message }
        }
    }

    const updateProfileData = async () => {
        setIsLoading(true)
        const data = await genericCall("get-profile", { profileIndex: 0 })

        if (data.errorMessage != "None") {
            console.error("Error fetching data:\n" + profileData.errorMessage + "\nChanges not applied.")
            setOutput("ERROR:\n" + profileData.errorMessage + "\nChanges not applied.")
        } else {
            setProfileData(data)
        }
        setIsLoading(false)
    }

    const handlePriorityChange = async (tableIndex, priorityIndex) => {
        if (priorityIndex == "CREATE_NEW") {
            setModToAddPriorityTo(tableIndex)
            PriorityPopupVisible(true)
            return
        }

        if (priorityIndex < profileData.priorityListLength) {
            let newPriority = priorityList[priorityIndex]
            const data = await genericCall("update-mod-priority", {
                profileIndex: 0,
                modIndex: tableIndex,
                priorityName: newPriority.name,
                red: newPriority.r,
                green: newPriority.g,
                blue: newPriority.b
            })

            if (data.errorMessage != "None") {
                console.error("ERROR:\n" + data.errorMessage)
                setOutput("ERROR:\n" + data.errorMessage)
            } else {
                setOutput('Priority level successfully updated to ' + data.priority.name)
            }

            updateProfileData()
        } else {
            console.error("PriorityIndex of " + priorityIndex + " is out of range")
        }
    };

    const createNewPriority = async (priorityName, color) => {
        if (priorityName === undefined || priorityName == "") {
            console.log("Failed to add priority level: PriorityName (" + priorityName + ") is invalid.")
            return
        } else if (modToAddPriorityTo == -1) {
            console.log("Failed to add priority level: modToAddPriorityTo (" + modToAddPriorityTo + ") is not set.")
            return
        } else {
            let priorityNames = []
            for (let i = 0; i < priorityList.length; i++) {
                priorityNames.push(priorityList[i].name)
            }

            if (priorityNames.includes(priorityName)) {
                console.log("Failed to add priority level: There is already a priority named " + priorityName + " in the priority list.")
                setOutput("Can't create priority level. There is already a priority level named '" + priorityName + "'!")
                return
            }
        }

        const data = await genericCall("add-priority", {
            profileIndex: 0,
            modIndex: modToAddPriorityTo,
            priorityName: priorityName,
            red: color.r,
            green: color.g,
            blue: color.b
        })
        setModToAddPriorityTo(-1)

        if (data.errorMessage != "None") {
            console.error("ERROR:\n" + data.errorMessage)
            setOutput("ERROR:\n" + data.errorMessage)
        }

        updateProfileData()
    }

    const handleDelete = async (tableIndex) => {
        const data = await genericCall("remove-mod", { profileIndex: 0, modIndex: tableIndex })

        if (data.errorMessage != "None") {
            console.error("ERROR:\n" + data.errorMessage)
            setOutput("ERROR:\n" + data.errorMessage)
        } else {
            setOutput('Mod successfully removed')
        }
        updateProfileData()
    };

    const addMod = async () => {
        const data = await genericCall("add-mod", { url: input, profileIndex: 0 })

        if (data.errorMessage != "None") {
            console.error("ERROR:\n" + data.errorMessage)
            setOutput("ERROR:\n" + data.errorMessage)
        } else {
            setOutput('Mod successfully added')
        }

        updateProfileData()
    }

    return (
        <>
            <h2>{profileData.profile.name}</h2>
            <pre>Selected Version: {profileData.profile.version}</pre>
            <pre>{profileData.modListLength} mods</pre>

            <ModTable
                modList={modList}
                priorityList={priorityList}
                onPriorityChange={handlePriorityChange}
                onDelete={handleDelete}
            />

            <TextInputBox
                onTextChange={(newInput) => { setInput(newInput) }}
                placeholderText='Enter Mod URL'
                length={75}
            />
            <button onClick={addMod} className="add-mod-button">Add Mod</button>
            <pre>{output}</pre>

            <CreatePriorityPopup
                isOpen={priorityPopupOpen}
                setIsOpen={PriorityPopupVisible}
                onSubmit={createNewPriority}
            />
        </>
    );
}

export default App;
