import os
from app import create_app
from dotenv import load_dotenv

# Load environment variables from the .env file BEFORE importing create_app,
# so that config.py can read them via os.environ.get(...).
load_dotenv()


app = create_app(os.getenv("FLASK_ENV", "development"))
if __name__ == "__main__":
    app.run(debug=True, port=5000)
