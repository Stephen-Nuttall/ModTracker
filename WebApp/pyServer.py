from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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

@app.post("/ping")
async def ping(): return "Pong!"

@app.post("/get-data")
async def getData(request: Request): return await request.app.state.data.getData()

@app.post("/get-profile-list")
async def getProfileList(request: Request): return await request.app.state.data.getProfileList()

@app.post("/get-priority-list")
async def getPriorityList(request: Request): return await request.app.state.data.getPriorityList()

@app.post("/get-profile")
async def getProfile(request: Request): return await request.app.state.data.getProfile(request)
    
@app.post("/add-profile")
async def addProfile(request: Request): return await request.app.state.data.addProfile(request)

@app.post("/update-profile")
async def updateProfile(request: Request): return await request.app.state.data.updateProfile(request)

@app.post("/add-mod")
async def addMod(request: Request): return await request.app.state.data.addMod(request)

@app.post("/remove-mod")
async def removeMod(request: Request): return await request.app.state.data.removeMod(request)
    
@app.post("/update-mod-priority")
async def updateModPriority(request: Request): return await request.app.state.data.updateModPriority(request)
    
@app.post("/add-priority")
async def addPriority(request: Request): return await request.app.state.data.addPriority(request)
