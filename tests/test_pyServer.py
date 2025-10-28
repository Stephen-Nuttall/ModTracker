import sys, os, unittest, requests

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import Backend.mod as mod

class TestPyServer(unittest.TestCase):
    _skipTests = False
        
    def _genericCall(self, callName:str, requestParameters:dict = None):
        requestTimeout = 2.0
        url = f"http://localhost:8000/{callName}"

        try:
            if requestParameters:
                response = requests.post(url, json=requestParameters, timeout=(requestTimeout, requestTimeout))
            else:
                response = requests.post(url, timeout=(requestTimeout, requestTimeout))
        
            if response.status_code == 200:
                return response.json()  
            else:
                print(f"Error reaching PyServer: {response.status_code}, {response.text}")
                return False
        except requests.exceptions.Timeout:
            print(f"Request to PyServer timed out after {requestTimeout} seconds")
            return False
        except requests.exceptions.ConnectionError:
            print(f"Failed to reach PyServer")
            return False
        
    def _verifyModDict(self, modDict):
        name = modDict["name"]
        priority = modDict["priority"]
        id = modDict["id"]
        url = modDict["url"]
        versions = modDict["versions"]
        tablePosition = modDict["tablePosition"]

        self._verifyPriorityDict(priority)
        
    def _verifyPriorityDict(self, priorityDict):
        priority_name = priorityDict["name"]
        priority_r = priorityDict["r"]
        priority_g = priorityDict["g"]
        priority_b = priorityDict["b"]

    def _verifyProfileDict(self, profileDict):
        name = profileDict["name"]
        version = profileDict["version"]
        modList = profileDict["modlist"]
        priorityList = profileDict["priorityList"]

        if modList:
            modDict = modList[0]
            self._verifyModDict(modDict)

        if priorityList:
            priority = priorityList[0]
            self._verifyPriorityDict(priority)

    def _verifyProfileManagerDict(self, profileManagerDict):
        profileList = profileManagerDict["profileList"]
        priorityList = profileManagerDict["priorityList"]

        if profileList:
            profile = profileList[0]
            self._verifyProfileDict(profile)

        if priorityList:
            priority = priorityList[0]
            self._verifyPriorityDict(priority)
    
    def test1_ping(self):
        response = self._genericCall("ping")

        if not response:
            self.__class__._skipTests = True
            self.skipTest("PyServer could not be pinged. Skipping PyServer tests.")
        else:
            self.__class__._skipTests = False

    def testGetData(self):
        if self.__class__._skipTests:
            self.skipTest("Failed to ping PyServer")
            
        response = self._genericCall("get-data")
        self.assertNotEqual(response, False)
        
        try:
            errorMessage = response["errorMessage"]
            self.assertEqual(errorMessage, "None")

            profileManager = response["profileManager"]
            self._verifyProfileManagerDict(profileManager)
        except KeyError:
            errorString = "The format of PyServer's response does not match expected format."
            self.fail(errorString)

    def testGetProfileList(self):
        if self.__class__._skipTests:
            self.skipTest("Failed to ping PyServer")
            
        response = self._genericCall("get-profile-list")
        self.assertNotEqual(response, False)
        
        try:
            errorMessage = response["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            profileList = response["profileList"]

            if profileList:
                self._verifyProfileDict(profileList[0])
        except KeyError:
            errorString = "The format of PyServer's response does not match expected format."
            self.fail(errorString)

    def testGetPriorityList(self):
        if self.__class__._skipTests:
            self.skipTest("Failed to ping PyServer")
            
        response = self._genericCall("get-priority-list")
        self.assertNotEqual(response, False)
        
        try:
            errorMessage = response["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            priorityList = response["priorityList"]

            if priorityList:
                self._verifyPriorityDict(priorityList[0])
        except KeyError:
            errorString = "The format of PyServer's response does not match expected format."
            self.fail(errorString)

    def testGetProfile(self):
        if self.__class__._skipTests:
            self.skipTest("Failed to ping PyServer")
            
        index = 0
        response = self._genericCall("get-profile", {'profileIndex' : index})
        self.assertNotEqual(response, False)
        
        try:
            errorMessage = response["errorMessage"]

            if errorMessage == "Could not find a profile at index 0.":
                return
            
            self.assertEqual(errorMessage, "None")
            
            profile = response["profile"]
            self._verifyProfileDict(profile)

            modListLength = response["modListLength"]
            priorityListLength = response["priorityListLength"]
        except KeyError:
            errorString = "The format of PyServer's response does not match expected format."
            self.fail(errorString)

    def testAddProfile(self):
        if self.__class__._skipTests:
            self.skipTest("Failed to ping PyServer")

        newProfile = mod.Profile()
        
        response = self._genericCall("add-profile", {'profileData' : newProfile.createDict()})
        self.assertNotEqual(response, False)
        
        try:
            errorMessage = response["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            profile = response["profile"]
            self._verifyProfileDict(profile)

            modListLength = response["modListLength"]
            priorityListLength = response["priorityListLength"]
        except KeyError:
            errorString = "The format of PyServer's response does not match expected format."
            self.fail(errorString)

    def testUpdateProfile(self):
        if self.__class__._skipTests:
            self.skipTest("Failed to ping PyServer")
        
        index = 0
        inputName = "Cool Name"
        response = self._genericCall("update-profile", {'profileIndex' : index, 'profileName' : inputName})
        self.assertNotEqual(response, False)
        
        try:
            errorMessage = response["errorMessage"]
            
            if errorMessage == "Could not find a profile at index 0.":
                return
            
            self.assertEqual(errorMessage, "None")
            
            profile = response["profile"]
            self._verifyProfileDict(profile)

            self.assertEqual(profile["name"], "Cool Name")

            modListLength = response["modListLength"]
            priorityListLength = response["priorityListLength"]
        except KeyError:
            errorString = "The format of PyServer's response does not match expected format."
            self.fail(errorString)

# "add-mod"
# "remove-mod"
# "update-mod-priority"
# "add-priority"

if __name__ == "__main__":
    unittest.main(verbosity=2,failfast=True)