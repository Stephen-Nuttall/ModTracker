import { useState } from 'react'
import profileManager from '../data/stateProvider.jsx'

import ProfileSelectWindow from './profileSelectWindow.jsx'
import DetailsWindow from './detailsWindow.jsx'

function App() {
    const [curProfileIndex, setProfileIndex] = useState(-1)
    const [output, setOutput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const displaySelectWindow = curProfileIndex < 0 || curProfileIndex >= profileManager.getNumProfiles()

    if (profileManager === undefined) {
        console.error("Profile Manager is undefined!")
        throw new Error("Profile Manager is undefined!")
    } else if (displaySelectWindow) {
        return (
            <ProfileSelectWindow
                setCurProfileIndex={setProfileIndex}
                isLoading={isLoading}
            />
        )
    } else {
        return (
            <DetailsWindow
                profileIndex={curProfileIndex}
                setCurProfileIndex={setProfileIndex}
                functionOutputText={output}
                isLoading={isLoading}
            />
        )
    }
}

export default App