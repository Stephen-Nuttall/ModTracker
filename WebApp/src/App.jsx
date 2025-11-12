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
        const [profileIndex, setProfileIndex] = useState(-1)
        const [selectedProfile, setSelectedProfile] = useState()
        const [numProfiles, setNumProfiles] = useState(-1)
        const [output, setOutput] = useState('')
        const [isLoading, setIsLoading] = useState(false)

        const storedData = localStorage.getItem('profiles')
        const parsedData = storedData !== (undefined || "undefined") ? JSON.parse(storedData) : blankProfileData

        useEffect(() => {
            setProfileIndex(getProfileIndexFromURL())
            setNumProfiles(getNumProfiles())
        }, [])

        useEffect(() => {
            if (profileIndex >= 0 && profileData.profileList !== undefined) {
                setSelectedProfile(profileData.profileList[profileIndex])
            }
        }, [profileData, profileIndex])

        const getProfileIndexFromURL = () => {
            let index = null

            try {
                const qp = new URLSearchParams(window.location.search).get('profile')
                if (qp !== null) {
                    const n = parseInt(qp, 10)
                    if (!isNaN(n)) return n
                }
            } catch (exception) { }

            const pathMatch = window.location.pathname && window.location.pathname.match(/profile=(\d+)/)
            const hashMatch = window.location.hash && window.location.hash.match(/profile=(\d+)/)

            if (pathMatch) {
                index = parseInt(pathMatch[1], 10)
            } else if (hashMatch) {
                index = parseInt(hashMatch[1], 10)
            }

            return index !== null ? index : -1
        }

        function getNumProfiles() {
            if (parsedData == null) {
                return 0
            } else {
                return parsedData.profileList.length
            }
        }

        const displaySelectWindow = profileIndex < 0 || profileIndex >= numProfiles

        return (
            <div>
                <DataFetcher updateData={setProfileData} setOutputText={setOutput} setLoading={setIsLoading} ref={requestRef} />
                {
                    displaySelectWindow ?
                        <ProfileSelectWindow profileList={parsedData?.profileList} requestRef={requestRef} isLoading={isLoading} /> :
                        <DetailsWindow
                            profileIndex={profileIndex}
                            profile={selectedProfile}
                            requestRef={requestRef}
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