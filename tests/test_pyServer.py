import sys, os, unittest, testData
from fastapi.testclient import TestClient

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import Backend.mod as mod, WebApp.appData as appData
from WebApp.pyServer import app

class TestPyServer(testData.TestCase):
    runSetup = False
    runTeardown = False

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        examplePriorityList = [
                mod.Priority("High Priority", red=255, green=128, blue=0),
                mod.Priority("Medium Priority", red=255, green=196, blue=0),
                mod.Priority("Low Priority", red=255, green=255, blue=0)
            ]
        self._exampleDataSource = mod.ProfileManager([
            mod.Profile([
                    mod.Mod("Test Mod 1"),
                    mod.Mod("Test Mod 2"),
                    mod.Mod("Test Mod 3")
                ],
                examplePriorityList,
                name="Test Profile"
            )],
            examplePriorityList
        )
        self._exampleData = self._exampleDataSource.createDict()

        app.state.data = appData.DataManager()
        
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
    
    def testPing(self):
        response = self.client.post("ping")
        self.assertEqual(response.status_code, 200)

    def testGetData(self):
        response = self.client.post("get-data", json={"data" : self._exampleData})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")

            functionOutput = json["functionOutput"]
            profileManagerJSON = json["profileManager"]
            profileManagerFuncOutput = functionOutput["profileManager"]

            self._verifyProfileManagerDict(profileManagerJSON)
            self.assertEqual(profileManagerJSON, profileManagerFuncOutput)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testRestoreData(self):
        response = self.client.post("restore-data", json={"data" : self._exampleData})
        self.assertEqual(response.status_code, 200)
        json = response.json()

        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")

            profileManager = json["profileManager"]
            self._verifyProfileManagerDict(profileManager)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)


    def testGetProfileList(self):
        response = self.client.post("get-profile-list", json={"data" : self._exampleData})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            functionOutput = json["functionOutput"]
            profileList = functionOutput["profileList"]

            if profileList:
                self._verifyProfileDict(profileList[0])
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testGetPriorityList(self):
        response = self.client.post("get-priority-list", json={"data" : self._exampleData})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            functionOutput = json["functionOutput"]
            priorityList = functionOutput["priorityList"]

            if priorityList:
                self._verifyPriorityDict(priorityList[0])
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testGetProfile(self):
        response = self.client.post("get-profile", json={"data" : self._exampleData, 'profileIndex' : 0})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]

            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")
            
            self.assertEqual(errorMessage, "None")
            
            functionOutput = json["functionOutput"]

            profile = functionOutput["profile"]
            self._verifyProfileDict(profile)

            modListLength = functionOutput["modListLength"]
            priorityListLength = functionOutput["priorityListLength"]
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testAddProfile(self):
        newProfile = mod.Profile()
        response = self.client.post("add-profile", json={"data" : self._exampleData, 'profileData' : newProfile.createDict()})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            functionOutput = json["functionOutput"]
            
            profile = functionOutput["profile"]
            self._verifyProfileDict(profile)

            modListLength = functionOutput["modListLength"]
            priorityListLength = functionOutput["priorityListLength"]
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testUpdateProfile(self):
        response = self.client.post("update-profile", json={
            "data" : self._exampleData,
            'profileIndex' : 0,
            'profileName' : "Cool Name",
            'refresh' : False
        })
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            
            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")
            
            self.assertEqual(errorMessage, "None")

            functionOutput = json["functionOutput"]
            profile = functionOutput["profile"]
            self._verifyProfileDict(profile)

            self.assertEqual(profile["name"], "Cool Name")

            modListLength = functionOutput["modListLength"]
            priorityListLength = functionOutput["priorityListLength"]
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testAddMod(self):
        response = self.client.post("add-mod", json={"data" : self._exampleData, 'profileIndex' : 0, 'url' : "https://modrinth.com/mod/sodium"})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]

            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")

            self.assertEqual(errorMessage, "None")

            functionOutput = json["functionOutput"]
            debugInfo = functionOutput["debugInfo"]
            profile = debugInfo["profile"]
            modlist = profile["modlist"]

            self.assertTrue(modlist)
            self._verifyModDict(modlist[0])
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testRemoveMod(self):
        profileManager:mod.ProfileManager = self._exampleDataSource
        profile:mod.Profile = profileManager.getProfile(0)
        startLen = len(profile.getModList())

        response = self.client.post("remove-mod", json={"data" : self._exampleData, 'profileIndex' : 0, "modIndex" : 0})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")

            newProfileManager = json["profileManager"]
            endLen = len(newProfileManager["profileList"][0]["modlist"])
            self.assertEqual(endLen + 1, startLen)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

        if errorMessage == "Could not find a profile at index 0.":
            self.fail("This test cannot be conducted without any profiles in the profile manager.")

    def testUpdateModPriority(self):
        priorityName = "Cool Priority"

        profileManager:mod.ProfileManager = self._exampleDataSource
        profile:mod.Profile = profileManager.getProfile(0)
        modObj:mod.Mod = profile.getMod(0)

        self.assertNotEqual(modObj.priority.name, priorityName)
        
        response = self.client.post("update-mod-priority", json={
            "data" : self._exampleData,
            'profileIndex' : 0,
            "modIndex" : 0,
            "priorityName" : priorityName,
            "red" : 0,
            "green" : 0,
            "blue" : 0
        })
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            
            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")
            
            self.assertEqual(errorMessage, "None")
            
            functionOutput = json["functionOutput"]
            priority = functionOutput["priority"]
            self._verifyPriorityDict(priority)
            self.assertEqual(priority["name"], priorityName)

            newProfileManager = json["profileManager"]
            newPriorityName = newProfileManager["profileList"][0]["modlist"][0]["priority"]["name"]
            self.assertEqual(newPriorityName, priorityName)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)

    def testAddPriority(self):
        priorityName = "Cool Priority"

        profileManager:mod.ProfileManager = self._exampleDataSource
        profile:mod.Profile = profileManager.getProfile(0)
        modObj:mod.Mod = profile.getMod(-1)
        startListLen = len(profileManager.getPriorityList())

        self.assertNotEqual(modObj.priority.name, priorityName)
        
        response = self.client.post("add-priority", json={
            "data" : self._exampleData,
            'profileIndex' : 0,
            "modIndex" : 0,
            "priorityName" : priorityName,
            "red" : 0,
            "green" : 0,
            "blue" : 0
        })
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            
            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")
            
            self.assertEqual(errorMessage, "None")
            
            newProfileManager = json["profileManager"]
            functionOutput = json["functionOutput"]
            priority = functionOutput["priority"]
            
            self._verifyPriorityDict(priority)
            self.assertEqual(priority["name"], priorityName)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse JSON:\n{json}"
            self.fail(errorString)
        
        modObj:mod.Mod = profile.getMod(-1)
        endListLen = len(profileManager.getPriorityList())

if __name__ == "__main__":
    unittest.main(verbosity=2,failfast=True)