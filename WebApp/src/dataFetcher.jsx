import { useEffect, useState, forwardRef, useImperativeHandle, version } from 'react'
import axios from 'axios'
import pyServer_IP from './secrets/pyServer_IP.txt?raw';

const DataFetcher = forwardRef(({ updateData, setOutputText, setLoading = (bool) => { } }, requestRef) => {
    let startupInitiated = false

    useImperativeHandle(requestRef, () => ({ genericRequest: genericRequest }))

    const blankProfileData = {
        "profileList": [],
        "priorityList": []
    }

    const [profileData, setProfileData] = useState(blankProfileData)
    const [isLoading, setIsLoading] = useState(false)
    const [output, setOutput] = useState('')

    useEffect(() => {
        console.log("Beginning Startup")

        if (startupInitiated == false) {
            startupInitiated = true
            restoreProfileData()
        }

        return () => {
            startupInitiated = true
        }
    }, [])

    useEffect(() => { updateData(profileData) }, [profileData])
    useEffect(() => { setOutputText(output) }, [output])
    useEffect(() => { setLoading(isLoading) }, [isLoading])

    // Generic method of making a request to the backend server, with parameters available for customization.
    // Available for parent components to reference.
    const genericRequest = async (callName, params, errorOutput = false, successOutput = false, updateData = true) => {
        setIsLoading(true)
        try {
            let url = `${window.location.protocol}//${window.location.hostname}:8000/${callName}`
            if (url.includes("github.io")) {
                const hostname = pyServer_IP.trim();
                url = `${hostname}/${callName}`
            } else {
                console.log('Making post to ' + url + ' with current user data and these parameters:\n' + JSON.stringify(params))
            }

            const fullParams = { data: profileData, ...params }
            const response = await axios.post(url, fullParams)

            if (response.data.errorMessage != "None") {
                updateData = false

                if (errorOutput != false) {
                    console.error(errorOutput + response.data.errorMessage)
                    setOutput(errorOutput + response.data.errorMessage)
                } else {
                    console.error("Error while performing backend operations: " + response.data.errorMessage)
                }
            } else if (successOutput != false) {
                setOutput(successOutput)
            }

            if (updateData && response.data.profileManager !== undefined) {
                setProfileData(response.data.profileManager)
                localStorage.setItem('profiles', JSON.stringify(response.data.profileManager))
            }

            return response.data.functionOutput
        } catch (error) {
            console.error('Error calling backend: ' + error.message + "\n" + error)
            setOutput('Error calling backend: ' + error.message)
            return { errorMessage: error.message }
        } finally {
            setIsLoading(false)
        }
    }

    // Loads profile data from browser storage.
    const restoreProfileData = async () => {
        const storedData = localStorage.getItem('profiles')
        const parsedData = storedData !== (undefined || "undefined") ? JSON.parse(storedData) : blankProfileData

        const data = await genericRequest(
            "restore-data",
            { data: parsedData },
            "Error restoring data: ", false
        )

    }
})

export default DataFetcher