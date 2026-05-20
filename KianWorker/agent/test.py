import psutil

metrics = {
    "cpu": psutil.cpu_percent(interval=1),
    "ram": psutil.virtual_memory().percent,
    "disk": psutil.disk_usage('/').percent
}

print(metrics)