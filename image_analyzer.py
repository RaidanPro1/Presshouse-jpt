
import os
import base64
import io
import google.generativeai as genai
from PIL import Image

def analyze_image(base64_image_string: str, prompt_string: str) -> str:
    """
    Analyzes an image using the Google Gemini API (gemini-1.5-flash model).

    Args:
        base64_image_string: A string containing the base64 encoded image data.
        prompt_string: The text prompt for analyzing the image.

    Returns:
        A string containing the text analysis from the Gemini API.

    Raises:
        ValueError: If the API_KEY environment variable is not set.
        Exception: For any errors during the API call.
    """
    api_key = os.environ.get("API_KEY")
    if not api_key:
        raise ValueError("API_KEY environment variable not found. Please set it to your Google Gemini API key.")

    # Configure the generative AI client
    genai.configure(api_key=api_key)

    # Select the model
    model = genai.GenerativeModel('gemini-1.5-flash')

    try:
        # Decode the base64 string into bytes
        image_bytes = base64.b64decode(base64_image_string)

        # Create a PIL Image object from the bytes
        img = Image.open(io.BytesIO(image_bytes))

        # Generate content with both the prompt and the image
        print("Sending request to Gemini API...")
        response = model.generate_content([prompt_string, img])
        print("Response received.")

        # Return the text part of the response
        return response.text

    except Exception as e:
        print(f"An error occurred during Gemini API call: {e}")
        raise

if __name__ == "__main__":
    # This block demonstrates how to use the analyze_image function.
    # It will only run when the script is executed directly.

    # 1. A sample base64 encoded string for a 1x1 red pixel PNG image.
    #    In a real application, you would get this from a file upload, an API, etc.
    sample_base64_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

    # 2. A sample prompt to ask the model about the image.
    sample_prompt = "What is this image? Describe it in one short sentence."

    print("--- Gemini Image Analysis Script ---")

    # 3. Check if the API key is available before running.
    if "API_KEY" not in os.environ:
        print("\nERROR: API_KEY environment variable is not set.")
        print("Please set the API_KEY environment variable before running this script.")
        print("Example: export API_KEY='your_api_key_here'")
    else:
        try:
            # 4. Call the function and get the result.
            analysis_result = analyze_image(sample_base64_image, sample_prompt)

            # 5. Print the result.
            print("\n--- Analysis Result ---")
            print(analysis_result)
            print("-----------------------")

        except Exception as e:
            print(f"\nAn error occurred: {e}")

```