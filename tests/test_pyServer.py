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
        app.state.data = appData.DataManager(useTestSetup=True)
        
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
        response = self.client.post("get-data")
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")

            profileManager = json["profileManager"]
            self._verifyProfileManagerDict(profileManager)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testGetProfileList(self):
        response = self.client.post("get-profile-list")
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            profileList = json["profileList"]

            if profileList:
                self._verifyProfileDict(profileList[0])
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testGetPriorityList(self):
        response = self.client.post("get-priority-list")
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            priorityList = json["priorityList"]

            if priorityList:
                self._verifyPriorityDict(priorityList[0])
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testGetProfile(self):
        response = self.client.post("get-profile", json={'profileIndex' : 0})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]

            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")
            
            self.assertEqual(errorMessage, "None")
            
            profile = json["profile"]
            self._verifyProfileDict(profile)

            modListLength = json["modListLength"]
            priorityListLength = json["priorityListLength"]
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testAddProfile(self):
        newProfile = mod.Profile()
        response = self.client.post("add-profile", json={'profileData' : newProfile.createDict()})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            self.assertEqual(errorMessage, "None")
            
            profile = json["profile"]
            self._verifyProfileDict(profile)

            modListLength = json["modListLength"]
            priorityListLength = json["priorityListLength"]
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testUpdateProfile(self):
        response = self.client.post("update-profile", json={'profileIndex' : 0, 'profileName' : "Cool Name", 'refresh' : False})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
            
            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")
            
            self.assertEqual(errorMessage, "None")
            
            profile = json["profile"]
            self._verifyProfileDict(profile)

            self.assertEqual(profile["name"], "Cool Name")

            modListLength = json["modListLength"]
            priorityListLength = json["priorityListLength"]
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testAddMod(self):
        response = self.client.post("add-mod", json={'profileIndex' : 0, 'url' : "https://modrinth.com/mod/sodium"})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]

            if errorMessage == "Could not find a profile at index 0.":
                self.fail("This test cannot be conducted without any profiles in the profile manager.")

            self.assertEqual(errorMessage, "None")
            
            debugInfo = json["debugInfo"]
            profile = debugInfo["profile"]
            modlist = profile["modlist"]

            self.assertTrue(modlist)
            self._verifyModDict(modlist[0])
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testRemoveMod(self):
        profileManager:mod.ProfileManager = app.state.data._profileManager
        profile:mod.Profile = profileManager.getProfile(0)
        startLen = len(profile.getModList())

        response = self.client.post("remove-mod", json={'profileIndex' : 0, "modIndex" : 0})
        self.assertEqual(response.status_code, 200)
        json = response.json()
        
        try:
            errorMessage = json["errorMessage"]
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

        if errorMessage == "Could not find a profile at index 0.":
            self.fail("This test cannot be conducted without any profiles in the profile manager.")
        self.assertEqual(errorMessage, "None")

        endLen = len(profile.getModList())
        self.assertEqual(endLen + 1, startLen)

    def testUpdateModPriority(self):
        priorityName = "Cool Priority"

        profileManager:mod.ProfileManager = app.state.data._profileManager
        profile:mod.Profile = profileManager.getProfile(0)
        modObj:mod.Mod = profile.getMod(0)

        self.assertNotEqual(modObj.priority.name, priorityName)
        
        response = self.client.post("update-mod-priority", json={
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
            
            priority = json["priority"]
            self._verifyPriorityDict(priority)
            self.assertEqual(priority["name"], priorityName)

            self.assertEqual(modObj.priority.name, priorityName)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)

    def testAddPriority(self):
        priorityName = "Cool Priority"

        profileManager:mod.ProfileManager = app.state.data._profileManager
        profile:mod.Profile = profileManager.getProfile(0)
        modObj:mod.Mod = profile.getMod(-1)
        startListLen = len(profileManager.getPriorityList())

        self.assertNotEqual(modObj.priority.name, priorityName)
        
        response = self.client.post("add-priority", json={
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
            
            priority = json["priority"]
            self._verifyPriorityDict(priority)
            self.assertEqual(priority["name"], priorityName)
        except (KeyError, TypeError):
            errorString = f"The format of PyServer's response does not match expected format. Reponse Json:\n{json}"
            self.fail(errorString)
        
        modObj:mod.Mod = profile.getMod(-1)
        endListLen = len(profileManager.getPriorityList())

if __name__ == "__main__":
    unittest.main(verbosity=2,failfast=True)