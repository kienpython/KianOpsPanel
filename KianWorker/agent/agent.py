import psutil
import requests
import socket
import time
import platform
import subprocess
import os

SERVER_IP="13.214.8.10"
WORKER_ID = socket.gethostname()
APP_PATH = r"C:\Users\kienp\Downloads\Used\KianOpsPanel\KianWorker\dummy_app.py"
app_process = None


def send_log(log_type, message):
    try:
        requests.post(
            f"http://{SERVER_IP}:8000/logs",
            json={
                "type":log_type,
                "message":message,
                "worker_id":WORKER_ID
            },
            timeout=5
        )
    except Exception as e:
        print("Send log failed:",e)


def get_app_status():
    global app_process  
    if app_process is None:
        return "stopped"
    if app_process.poll() is None:
        return "running"
    return "stopped"

def collect_metrics():

    return {

        "hostname": WORKER_ID,

        "ip":
        socket.gethostbyname(
        socket.gethostname()
        ),

        "os":
        platform.system(),

        "cpu":
        psutil.cpu_percent(
        interval=1
        ),

        "ram":
        psutil.virtual_memory().percent,

        "disk":
        psutil.disk_usage(
        "C:\\"
        ).percent,

        "uptime":
        "Live",

        "app_status":
        get_app_status()

    }

def send_metrics():
    data = collect_metrics()
    try:
        response = requests.post(
            f"http://{SERVER_IP}:8000/metrics",
            json=data,
            timeout=5
        )
        print("Metrics sent:", response.status_code, data)
    except Exception as e:
        print("Metrics failed:",e)

def start_app():
    global app_process
    if app_process and app_process.poll() is None:
        print("App already running")
        send_log("warning", "App already running")
        return
    app_process = subprocess.Popen(
        ["python",APP_PATH],
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    print("App started")
    send_log("info", "App started successfully")

def stop_app():
    global app_process
    if app_process and app_process.poll() is None:
        app_process.terminate()
        app_process = None
        print("App stopped")
        send_log("info", "App stopped successfully")

    else:
        print("App is not running")
        send_log("warning", "Stop failed: app is not running")

def restart_app():
    stop_app()
    time.sleep(1)
    start_app()
    send_log("info", "App restarted")

def check_command():
    try:
        response = requests.get(
            f"http://{SERVER_IP}:8000/commands/{WORKER_ID}",
            timeout=5
        )
        data = response.json()
        if not data.get("has_command"):
            return
        action = data['command']['action']
        print("Received command:",action)
        if action=="start":
            start_app()
        elif action == "stop":
            stop_app()
        elif action == "restart":
            restart_app()
    except Exception as e:
        print("Command check failed:",e)
    
while True:
    send_metrics()
    check_command()
    time.sleep(3)