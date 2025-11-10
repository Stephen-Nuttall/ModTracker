from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sys

if "test" in sys.argv[0]:
    import WebApp.appData as appData
else:
    import appData

async def lifespan(app: FastAPI):
    app.state.data = appData.DataManager()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def loadDataManager(data):
    oldData = data.get("data", {"profileList" : [], "priorityList" : []})

    dataManager = appData.DataManager()
    restoreResult = dataManager.restoreData(oldData)

    if restoreResult["errorMessage"] != "None":
        return restoreResult["errorMessage"]
    else:
        return dataManager

async def runDataFunction(functionName, request: Request):
    try:
        data = await request.json()
        dataManager = loadDataManager(data)
        
        if not isinstance(dataManager, appData.DataManager):
            return {"errorMessage" : f"ERROR LOADING DATA INTO DATA MANAGER: {dataManager}"}

        function = getattr(dataManager, functionName, None)
        if functionName == "restoreData":
            newData = dataManager.getData()

            if newData["errorMessage"] != "None":
                return {"errorMessage" : f"ERROR FETCHING NEW DATA AFTER RESTORING DATA: {newData["errorMessage"]}"}
            else:
                return {
                    "profileManager" : newData["profileManager"],
                    "errorMessage" : "None"
                }
        elif function and callable(function):
            functionOutput = function(data)
            newData = dataManager.getData()

            if functionOutput["errorMessage"] != "None":
                return {"errorMessage" : f"ERROR IN FUNCTION '{functionName}': {functionOutput["errorMessage"]}"}
            elif newData["errorMessage"] != "None":
                return {"errorMessage" : f"ERROR FETCHING NEW DATA AFTER FUNCTION CALL: {newData["errorMessage"]}"}
            else:
                return {
                    "profileManager" : newData["profileManager"],
                    "functionOutput" : functionOutput,
                    "errorMessage" : "None"
                }
        else:
            return {"errorMessage" : f"Data function {functionName} not found."}
    except Exception as e:
        return {"errorMessage" : f"ERROR WHILE TRYING TO CARRY OUT REQUEST: {str(e)}"}


@app.post("/ping")
async def ping(): return "Pong!"

@app.post("/get-data")
async def getData(request: Request): return await runDataFunction("getData", request)

@app.post("/restore-data")
async def restoreData(request: Request): return await runDataFunction("restoreData", request)

@app.post("/get-profile-list")
async def getProfileList(request: Request): return await runDataFunction("getProfileList", request)

@app.post("/get-num-profiles")
async def getNumProfiles(request: Request): return await runDataFunction("getNumProfiles", request)

@app.post("/get-priority-list")
async def getPriorityList(request: Request): return await runDataFunction("getPriorityList", request)

@app.post("/get-profile")
async def getProfile(request: Request): return await runDataFunction("getProfile", request)
    
@app.post("/add-profile")
async def addProfile(request: Request): return await runDataFunction("addProfile", request)

@app.post("/remove-profile")
async def removeProfile(request: Request): return await runDataFunction("removeProfile", request)

@app.post("/restore-profile")
async def restoreProfile(request: Request): return await runDataFunction("restoreProfile", request)

@app.post("/update-profile")
async def updateProfile(request: Request): return await runDataFunction("updateProfile", request)

@app.post("/download-mods")
async def downloadMods(request: Request): return await runDataFunction("downloadReadyMods", request)

@app.post("/add-mod")
async def addMod(request: Request): return await runDataFunction("addMod", request)

@app.post("/remove-mod")
async def removeMod(request: Request): return await runDataFunction("removeMod", request)
    
@app.post("/update-mod-priority")
async def updateModPriority(request: Request): return await runDataFunction("updateModPriority", request)
    
@app.post("/add-priority")
async def addPriority(request: Request): return await runDataFunction("addPriority", request)
