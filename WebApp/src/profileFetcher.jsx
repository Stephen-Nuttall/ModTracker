import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const ProfileFetcher = forwardRef(({ updateData, setOutputText, setLoading = (bool) => { } }, requestRef) => {
    let startupInitiated = false

    useImperativeHandle(requestRef, () => ({ genericRequest: genericRequest }))

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
    const [output, setOutput] = useState('');

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

    useEffect(() => { updateData(profileData) }, [profileData])
    useEffect(() => { setOutputText(output) }, [output])
    useEffect(() => { setLoading(isLoading) }, [isLoading])

    // Generic method of making a request to the backend server, with parameters available for customization.
    // Available for parent components to reference.
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
            console.error('Error calling backend: ' + error.message + "\n" + error);
            setOutput('Error calling backend: ' + error.message);
            return { errorMessage: error.message }
        }
    }

    // Loads profile data from browser storage.
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

    // Retrieves profile data after a call and loads the new data into updateData() and browser storage.
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
})

export default ProfileFetcher