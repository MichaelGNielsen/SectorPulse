# Brug en letvægts Python-base
FROM python:3.11-slim

# Sæt arbejdsmappe
WORKDIR /app

# Kopier kun requirements først for at udnytte Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopier resten af koden
COPY . .

# Mount logs volume (skal mountes ved kørsel: -v ./logs:/app/logs)

# Kør din scanner
CMD ["python", "sector_pulse.py"]
