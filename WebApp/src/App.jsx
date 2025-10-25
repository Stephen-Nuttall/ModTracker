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
    const [modInput, setModInput] = useState('');
    const [versionInput, setVersionInput] = useState('');
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


    const genericRequest = async (callName, params, errorOutput = false, successOutput = false, updateData = true) => {
        try {
            const url = `http://localhost:8000/${callName}`
            console.log('Making post to ' + url + ' with data ' + JSON.stringify(params))
            const response = await axios.post(url, params);

            if (response.data.errorMessage != "None") {
                if (errorOutput != false) {
                    console.error(errorOutput + response.data.errorMessage)
                    setOutput(errorOutput + response.data.errorMessage)
                } else {
                    console.error("Error while performing backend operations: " + response.data.errorMessage)
                }
            } else if (successOutput != false) {
                setOutput(successOutput)
            }

            if (updateData == true) {
                updateProfileData()
            }

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
            const data = await genericRequest("add-profile", callParams, "Error restoring data: ")

            if (data.errorMessage == "None") {
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
    }

    const updateProfileData = async () => {
        setIsLoading(true)
        const data = await genericRequest(
            "get-profile",
            { profileIndex: 0 },
            "Error fetching data. No changes could applied, and no new data could be loaded.\nError message: ",
            false,
            false
        )

        if (data.errorMessage == "None") {
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
            const data = await genericRequest(
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

        const data = await genericRequest(
            "add-priority",
            {
                profileIndex: 0,
                modIndex: modToAddPriorityTo,
                priorityName: priorityName,
                red: color.r,
                green: color.g,
                blue: color.b
            },
            "Failed to add new priority level: "
        )
        setModToAddPriorityTo(-1)
    }

    const handleDelete = async (tableIndex) => {
        const data = await genericRequest(
            "remove-mod", { profileIndex: 0, modIndex: tableIndex },
            "Failed to remove mod: ", "Mod successfully removed."
        )
    };

    const addMod = async () => {
        const data = await genericRequest(
            "add-mod", { url: modInput, profileIndex: 0 },
            "Failed to add mod: ", "Mod successfully added."
        )
    }

    const reloadProfile = async () => {
        const data = await genericRequest(
            "update-profile", { profileIndex: 0, profileVersion: versionInput },
            "Failed to update profile: ", "Profile successfully reloaded."
        )
    }

    return (
        <>
            <div>
                <h2>{profileData.profile.name}</h2>
                Selected Version:
                <TextInputBox
                    onTextChange={(newInput) => { setVersionInput(newInput) }}
                    placeholderText={profileData.profile.version}
                    length={25}
                />
                <button onClick={reloadProfile} className="generic-button">⟳</button>
            </div>

            <div>
                <ModTable
                    modList={modList}
                    priorityList={priorityList}
                    onPriorityChange={handlePriorityChange}
                    onDelete={handleDelete}
                    selectedVersion={profileData.profile.version}
                />
            </div>

            <div>
                <TextInputBox
                    onTextChange={(newInput) => { setModInput(newInput) }}
                    placeholderText='Enter Mod URL'
                    length={75}
                />
                <button onClick={addMod} className="generic-button">Add Mod</button>
                <pre>{output}</pre>
            </div>

            <CreatePriorityPopup
                isOpen={priorityPopupOpen}
                setIsOpen={PriorityPopupVisible}
                onSubmit={createNewPriority}
            />
        </>
    );
}

export default App;
