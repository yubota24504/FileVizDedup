import json
import urllib.request
import urllib.error
from typing import Dict, Any
from urllib.parse import urlparse, urlunparse

class OllamaClient:
    """
    A client to interact with the Ollama API without external dependencies.
    """
    def __init__(self, base_url: str = "http://127.0.0.1:11434", model: str = "llama3:latest"):
        """
        Initializes the OllamaClient.

        Args:
            base_url (str): The base URL of the Ollama API. It will be sanitized to only include scheme and hostname/port.
            model (str): The name of the model to use for generation.
        """
        # Sanitize base_url to ensure it only contains the scheme and netloc (host:port)
        # This prevents issues if the provided URL contains a path (e.g., "http://host:port/api")
        parsed_url = urlparse(base_url)
        self.base_url = urlunparse((parsed_url.scheme, parsed_url.netloc, '', '', '', ''))
        self.model = model

    def generate(self, prompt: str) -> str:
        """
        Generates a response from the Ollama API.

        Args:
            prompt (str): The prompt to send to the model.

        Returns:
            str: The generated response or an error message.
        """
        # The endpoint path is now cleanly joined to the sanitized base_url.
        url = f"{self.base_url}/api/generate"
        data = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        json_data = json.dumps(data).encode('utf-8')
        headers = {'Content-Type': 'application/json'}

        req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                if response.status == 200:
                    response_data = json.loads(response.read().decode('utf-8'))
                    return response_data.get("response", "Error: 'response' key not found in Ollama's reply.")
                else:
                    # This case is less likely as urlopen raises HTTPError for non-2xx, but included for completeness.
                    return f"Error: Ollama request failed ({response.status}) url={url}"
        except urllib.error.HTTPError as e:
            # Return a detailed error message including the status code and the URL that was called.
            return f"Error: Ollama request failed ({e.code}) url={url}"
        except urllib.error.URLError as e:
            # Return a detailed error if the server could not be reached.
            return f"Error: Could not connect to Ollama. Details: {e.reason} url={url}"
        except Exception as e:
            # Catch any other unexpected errors.
            return f"An unexpected error occurred: {str(e)}"

