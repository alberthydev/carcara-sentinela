FROM python:3.12-slim

WORKDIR /worker

RUN apt-get update \
  && apt-get install -y --no-install-recommends tesseract-ocr \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY plate_worker.py server.py ./

EXPOSE 8000
CMD ["python", "server.py"]
