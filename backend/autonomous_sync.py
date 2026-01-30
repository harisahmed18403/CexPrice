from app import app, db
from app.models import Category
from app.services.cex.refresh_cex import RefreshCex, refresh_status
import time
import threading
import sys

def get_smart_categories():
    INCLUDES = ['Apple', 'iPhone', 'iPad', 'MacBook', 'Android', 'Samsung', 'Galaxy', 'Pixel', 'Google']
    EXCLUDES = ['Accessory', 'Accessories', 'Cable', 'Case', 'Cover', 'Protector', 'Sleeve', 'Bag', 'Strap', 'Mount', 'Part']
    
    with app.app_context():
        cats = Category.query.all()
        target_ids = []
        for cat in cats:
            name = cat.name
            should_include = any(inc.lower() in name.lower() for inc in INCLUDES)
            should_exclude = any(exc.lower() in name.lower() for exc in EXCLUDES)
            if should_include and not should_exclude:
                target_ids.append(cat.id)
        return target_ids

def monitor_logs():
    last_log_idx = 0
    while refresh_status["is_running"]:
        if len(refresh_status["logs"]) > last_log_idx:
            for i in range(last_log_idx, len(refresh_status["logs"])):
                print(f"[LOG] {refresh_status['logs'][i]}", flush=True)
            last_log_idx = len(refresh_status["logs"])
        time.sleep(1)
    # Final logs
    for i in range(last_log_idx, len(refresh_status["logs"])):
        print(f"[LOG] {refresh_status['logs'][i]}", flush=True)

def run_autonomous_sync():
    print("Starting Autonomous Sync...")
    target_ids = get_smart_categories()
    print(f"Targeting {len(target_ids)} categories: {target_ids}")
    
    refresher = RefreshCex()
    
    # Run refresh in a thread so we can monitor logs in main thread
    refresh_thread = threading.Thread(target=refresher.refreshProducts, args=(target_ids,))
    refresh_thread.start()
    
    # We need a small delay for it to start
    time.sleep(2)
    
    monitor_logs()
    
    refresh_thread.join()
    print("Sync Finished.")

if __name__ == "__main__":
    run_autonomous_sync()
