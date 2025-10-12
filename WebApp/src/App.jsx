import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

import ModTable from './modTable';
import TextInputBox from './textInputBox';
import CreatePriorityPopup from './createPriorityPopup';

function App() {
    let startupInitiated = false

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

    useEffect(() => {
        console.log("Beginning Startup")

        if (startupInitiated == false) {
            startupInitiated = true
            restoreProfileData()
        }

        return () => {
            startupInitiated = true
        };
    }, [])

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


    const genericCall = async (callName, params) => {
        try {
            const url = `http://localhost:8000/${callName}`
            console.log('Making post to ' + url + ' with data ' + JSON.stringify(params))
            const response = await axios.post(url, params);
            return response.data
        } catch (error) {
            console.error('Error calling API: ', error);
            setOutput('Error calling API: ' + error);
            return { errorMessage: error.message }
        }
    }

    const restoreProfileData = async () => {
        setIsLoading(true)
        let callParams = {}

        if (localStorage.getItem('profileData') !== null) {
            const storedData = localStorage.getItem('profileData');
            const parsedData = JSON.parse(storedData);
            callParams = { "profileData": parsedData.profile }
        } else {
            console.log("No profile data was found in localstorage. Continuing without restoring any data.")
        }

        try {
            const data = await genericCall("add-profile", callParams)

            if (data.errorMessage != "None") {
                console.error("Error restoring data: " + data.errorMessage + "\nDebug info: " + data.debugInfo)
                setOutput("Error restoring data: " + data.errorMessage)
            } else {
                console.log("Restored profile data: " + data.profile
                    + "\nProfile list length: " + data.debugInfo.profileManager.profileList.length)
                setProfileData(data)
                localStorage.setItem('profileData', JSON.stringify(data))
            }
        } catch (error) {
            console.error("Error restoring data: " + error)
        } finally {
            setIsLoading(false);
        }

        updateProfileData()
    }

    const updateProfileData = async () => {
        setIsLoading(true)
        const data = await genericCall("get-profile", { profileIndex: 0 })

        if (data.errorMessage != "None") {
            console.error("Error fetching data: " + data.errorMessage + "\nNo changes could applied, and no new data could be loaded.")
            setOutput("Error fetching data: " + data.errorMessage + "\nNo changes could applied, and no new data could be loaded.")
        } else {
            setProfileData(data)
            localStorage.setItem('profileData', JSON.stringify(data))
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
                console.error("Failed to update priority level: " + data.errorMessage)
                setOutput("Failed to update priority level: " + data.errorMessage)
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
            console.error("Failed to add new priority level: " + data.errorMessage)
            setOutput("Failed to add priority level: " + data.errorMessage)
        }

        updateProfileData()
    }

    const handleDelete = async (tableIndex) => {
        const data = await genericCall("remove-mod", { profileIndex: 0, modIndex: tableIndex })

        if (data.errorMessage != "None") {
            console.error("Failed to remove mod: " + data.errorMessage)
            setOutput("Failed to remove mod: " + data.errorMessage)
        } else {
            setOutput('Mod successfully removed')
        }
        updateProfileData()
    };

    const addMod = async () => {
        const data = await genericCall("add-mod", { url: input, profileIndex: 0 })

        if (data.errorMessage != "None") {
            console.error("Failed to add mod: " + data.errorMessage)
            setOutput("Failed to add mod: " + data.errorMessage)
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
