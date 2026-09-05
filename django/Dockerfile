# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# cron: runs the scheduled db backup inside this same container.
# mongodb-database-tools: provides mongodump, used by that backup job.
RUN apt-get update && apt-get install -y --no-install-recommends curl cron && \
    curl -sL https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-x86_64-100.10.0.deb -o /tmp/mongo-tools.deb && \
    dpkg -i /tmp/mongo-tools.deb && \
    rm -f /tmp/mongo-tools.deb && \
    rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . /app

RUN python -m venv venv
RUN . /app/venv/bin/activate && pip install --no-cache-dir -r requirements.txt

# Install the Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Daily database backup, picked up automatically from /etc/cron.d by the cron
# daemon started in entrypoint.sh.
COPY crontab_backup /etc/cron.d/pomotask_backup
RUN chmod 0644 /etc/cron.d/pomotask_backup

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 8000 to the outside world
EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

# Run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]