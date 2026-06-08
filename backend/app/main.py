from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

workers = {}
commands = {}
logs = []

def add_log(log_type:str, message:str, worker_id:str = "system"):
	logs.insert(0, {
		"type":log_type,
		"message":message,
		"worker_id":worker_id,
		"time":datetime.now(timezone.utc).isoformat()
		})
	if len(logs) > 100:
		logs.pop()

@app.get("/logs")
def get_logs():
	return logs[:20]

@app.post("/logs")
def create_log(data:dict):
	app_log(
		data.get("type","info"),
		data.get("message",""),
		data.get("worker_id","unknown")
)
	return {"success":True}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/metrics")
def receive_metrics(data: dict):
    hostname = data.get("hostname", "unknown")

    workers[hostname] = {
        "id": hostname,
        "name": hostname,
        "ip": data.get("ip", "Unknown"),
        "os": data.get("os", "Windows"),
        "status": "online",
        "cpu": data.get("cpu", 0),
        "ram": data.get("ram", 0),
        "disk": data.get("disk", 0),
        "uptime": data.get("uptime", "Live"),
        "last_seen": datetime.now(timezone.utc).isoformat(),
	"app_status": data.get(
		"app_status",
		"unknown"
),
    }

    return {"success": True, "worker": hostname}

@app.get("/servers")
def get_servers():
    now = datetime.now(timezone.utc)
    result = []

    for worker in workers.values():
        last_seen = datetime.fromisoformat(worker["last_seen"])
        diff = (now - last_seen).total_seconds()

        item = worker.copy()
        item["status"] = "online" if diff <= 15 else "offline"
        item["seconds_since_seen"] = int(diff)

        result.append(item)

    return result

@app.get("/dashboard")
def get_dashboard():
    now = datetime.now(timezone.utc)

    total = len(workers)
    online = 0
    offline = 0
    cpu_values = []
    ram_values = []

    for worker in workers.values():
        last_seen = datetime.fromisoformat(worker["last_seen"])
        diff = (now - last_seen).total_seconds()

        if diff <= 15:
            online += 1
            cpu_values.append(float(worker.get("cpu", 0)))
            ram_values.append(float(worker.get("ram", 0)))
        else:
            offline += 1

    cpu_avg = round(sum(cpu_values) / len(cpu_values), 1) if cpu_values else 0
    ram_avg = round(sum(ram_values) / len(ram_values), 1) if ram_values else 0

    return {
        "total_servers": total,
        "online": online,
        "offline": offline,
        "cpu_avg": cpu_avg,
        "ram_avg": ram_avg,
    }

@app.post("/commands/{worker_id}")
def create_command(worker_id: str, data: dict):
    action = data.get("action")

    if action not in ["start", "stop", "restart"]:
        return {
            "success": False,
            "message": "Invalid action"
        }

    commands[worker_id] = {
        "action": action,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    add_log("info",f"Command {action} sent to {worker_id}", worker_id)


    return {
        "success": True,
        "worker_id": worker_id,
        "action": action
    }


@app.get("/commands/{worker_id}")
def get_command(worker_id: str):
    command = commands.get(worker_id)

    if not command:
        return {
            "has_command": False
        }

    commands.pop(worker_id)

    return {
        "has_command": True,
        "command": command
    }
