import { useState, useRef, useEffect } from 'react'

import DataFetcher from './dataFetcher.jsx'
import ProfileSelectWindow from './profileSelectWindow.jsx'
import DetailsWindow from './DetailsWindow.jsx'

function App() {
    const requestRef = useRef(null)

    const [profileData, setProfileData] = useState([])
    const [profileIndex, setProfileIndex] = useState(-1)
    const [selectedProfile, setSelectedProfile] = useState()
    const [numProfiles, setNumProfiles] = useState(-1)
    const [output, setOutput] = useState('');

    useEffect(() => {
        setProfileIndex(getProfileIndexFromURL())
        setNumProfiles(getNumProfiles())
    }, [])

    useEffect(() => {
        if (profileIndex >= 0) {
            setSelectedProfile(profileData.profileList[profileIndex])
        }
    }, [profileData])

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
        const storedData = localStorage.getItem('profiles');
        const parsedData = JSON.parse(storedData);

        if (parsedData == null) {
            return 0
        } else {
            return parsedData.profileList.length
        }
    }

    return (
        <>
            <DataFetcher updateData={setProfileData} setOutputText={setOutput} ref={requestRef} />
            {profileIndex < 0 || profileIndex >= numProfiles ?
                <ProfileSelectWindow /> :
                <DetailsWindow profileIndex={profileIndex} profile={selectedProfile} requestRef={requestRef} />}
        </>
    )
}

export default App