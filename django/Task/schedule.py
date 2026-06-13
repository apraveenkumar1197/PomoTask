from apscheduler.schedulers.background import BackgroundScheduler

def my_scheduled_job():
    print("Job executed!")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(my_scheduled_job, 'interval', minutes=1)
    scheduler.start()