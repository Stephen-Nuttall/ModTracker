import { useState, useRef, useEffect } from 'react'

import DataFetcher from './dataFetcher.jsx'
import ProfileSelectWindow from './profileSelectWindow.jsx'
import DetailsWindow from './detailsWindow.jsx'

function App() {
    try {
        const requestRef = useRef(null)

        const blankProfileData = {
            "profileList": [],
            "priorityList": []
        }

        const [profileData, setProfileData] = useState([])
        const [curProfileIndex, setProfileIndex] = useState(-1)
        const [selectedProfile, setSelectedProfile] = useState()
        const [numProfiles, setNumProfiles] = useState(-1)
        const [output, setOutput] = useState('')
        const [isLoading, setIsLoading] = useState(false)

        const storedData = localStorage.getItem('profiles')
        const parsedData = storedData !== (undefined || "undefined") ? JSON.parse(storedData) : blankProfileData

        useEffect(() => {
            setNumProfiles(getNumProfiles())
        }, [])

        useEffect(() => {
            if (curProfileIndex >= 0 && profileData.profileList !== undefined) {
                setSelectedProfile(profileData.profileList[curProfileIndex])
            }
        }, [profileData, curProfileIndex])

        function getNumProfiles() {
            if (parsedData == null) {
                return 0
            } else {
                return parsedData.profileList.length
            }
        }

        const displaySelectWindow = curProfileIndex < 0 || curProfileIndex >= numProfiles

        return (
            <div>
                <DataFetcher updateData={setProfileData} setOutputText={setOutput} setLoading={setIsLoading} ref={requestRef} />
                {
                    displaySelectWindow ?
                        <ProfileSelectWindow
                            profileList={parsedData?.profileList}
                            requestRef={requestRef}
                            setCurProfileIndex={setProfileIndex}
                            isLoading={isLoading}
                        /> :
                        <DetailsWindow
                            profileIndex={curProfileIndex}
                            profile={selectedProfile}
                            requestRef={requestRef}
                            setCurProfileIndex={setProfileIndex}
                            functionOutputText={output}
                            isLoading={isLoading}
                        />
                }
            </div>
        )
    }
    catch (exception) {
        return (
            <>
                <h2>Sorry! A fatal error occured when trying to load the site.</h2>
                <div>Exception caught: {exception.message}</div>
                {console.error(exception)}
            </>
        )
    }
}

export default App