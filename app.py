from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sys
import os
from bs4 import BeautifulSoup
import html2text
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.llms import Ollama
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from flask_cors import CORS
from langchain_ollama.llms import OllamaLLM
from dotenv import load_dotenv
import json

# from langchain.libs.langchain.langchain.chains.llm import LLMChain
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

_ = load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


@app.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({"message": "Backend is connected!"})

def fetch_quotes(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        selectors = [
            {'quote_selector': '.b-qt', 'author_selector': '.bq-aut'},
            {'quote_selector': '.quoteText', 'author_selector': '.authorOrTitle'},
            {'quote_selector': '.quote .text', 'author_selector': '.quote .author'},
        ]

        quotes_data = []

        for selector in selectors:
            quotes_elements = soup.select(selector['quote_selector'])

            if quotes_elements:
                for element in quotes_elements:
                    quote_text = element.get_text(strip=True)
                    
                    author_elements = element.select(selector['author_selector'])
                    author_text = author_elements[0].get_text(strip=True) if author_elements else "Unknown"
                    
                    quotes_data.append({'quote': quote_text, 'author': author_text})
                
                return quotes_data

        return []

    except requests.exceptions.RequestException as e:
        print(f"Error fetching the URL: {e}")
        return []
    
def fetch_movie_details(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        rating_selector = '.sc-d541859f-1.imUuxf'
        title_selector = '.hero__primary-text'
        director_selector = '.ipc-metadata-list-item__list-content-item.ipc-metadata-list-item__list-content-item--link'

        rating_element = soup.select_one(rating_selector)
        rating_text = rating_element.get_text(strip=True) if rating_element else "No rating found"

        title_element = soup.select_one(title_selector)
        title_text = title_element.get_text(strip=True) if title_element else "No title found"

        director_element = soup.select_one(director_selector)
        director_text = director_element.get_text(strip=True) if director_element else "No director found"

        return {
            "title": title_text,
            "director": director_text,
            "rating": rating_text
        }
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
# Set environment variables directly in the script or ensure they are set in your environment
os.environ["LANGCHAIN_API_KEY"] = "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"
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "webscraping"


def fetch_and_preprocess_html(url):
    """Fetch HTML and preprocess it to plain text."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        text_maker = html2text.HTML2Text()
        text_maker.ignore_links = True
        return text_maker.handle(response.text)
    except requests.exceptions.RequestException as e:
        return None



# def extract_quotes_with_llm(text_content):
#     llm = ChatGroq(
#         model="llama-3.1-8b-instant",
#         temperature=0.3,
#         top_p=1,
#         max_retries=10,
#         groq_api_key=GROQ_API_KEY
#     )

#     prompt = PromptTemplate.from_template(
#         """
#         You are a skilled web scraping assistant. Your job is to extract meaningful, structured information from raw HTML or webpage text.

#         ## Instructions ##
#         - ONLY extract relevant data (e.g., quotes, product reviews, movie ratings, etc.).
#         - DO NOT include any explanations, code comments, or formatting outside the JSON array.
#         - Ignore unrelated content like ads, navigation links, footers, or headers.
#         - If no relevant data is found, return: ["No relevant data found."]

#         ## Content to extract from ##
#         {webpage_text}

#         ## Output Format ##
#         Respond ONLY with a JSON array of strings, like this:

#         [
#         "First item extracted",
#         "Second item extracted",
#         "Third item extracted"
#         ]
#         """
#     )

#     chain = prompt | llm
#     result = chain.invoke({"webpage_text": text_content})

#     # Parse JSON string to Python list
#     try:
#         extracted_list = json.loads(result.content)
#     except json.JSONDecodeError:
#         # If parsing fails, return a default fallback
#         extracted_list = ["No relevant data found."]

#     return extracted_list


# @app.route('/extract-quotes', methods=['POST'])
# def extract_quotes():
#     data = request.json
#     url = data.get('url')

#     if not url:
#         return jsonify({"error": "URL is required"}), 400

#     text_content = fetch_and_preprocess_html(url)
#     if not text_content:
#         return jsonify({"error": "Unable to fetch content"}), 400

#     quotes = extract_quotes_with_llm(text_content)
#     print("quotes ", quotes)
#     return jsonify({"quotes": quotes})

def extract_quotes_with_llm(text_content):
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.3,
        top_p=1,
        max_retries=10,
        groq_api_key=GROQ_API_KEY
    )

    prompt = PromptTemplate.from_template(
        """
        You are a skilled web scraping assistant. Your job is to extract meaningful, structured information from raw HTML or webpage text.

        ## Instructions ##
        - ONLY extract relevant data (e.g., quotes, product reviews, movie ratings, etc.).
        - DO NOT include any explanations, code comments, or formatting outside the JSON array.
        - Ignore unrelated content like ads, navigation links, footers, or headers.
        - If no relevant data is found, return: ["No relevant data found."]

        ## Content to extract from ##
        {webpage_text}

        ## Output Format ##
        Respond ONLY with a JSON array of strings, like this:

        [
        "First item extracted",
        "Second item extracted",
        "Third item extracted"
        ]
        """
    )

    chain = prompt | llm
    result = chain.invoke({"webpage_text": text_content})

    try:
        extracted_list = json.loads(result.content)
    except json.JSONDecodeError:
        extracted_list = ["No relevant data found."]

    return extracted_list


@app.route('/extract-quotes', methods=['POST'])
def extract_quotes():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "URL is required"}), 400

    text_content = fetch_and_preprocess_html(url)
    if not text_content:
        return jsonify({"error": "Unable to fetch content"}), 400

    quotes = extract_quotes_with_llm(text_content)
    print("quotes", quotes)
    return jsonify(quotes)  

@app.route('/movie_details', methods=['GET'])
def get_movie_details():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "URL parameter is required"}), 400
    
    details = fetch_movie_details(url)
    return jsonify(details)

@app.route('/quotes', methods=['GET'])
def get_quotes():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "URL parameter is required"}), 400

    quotes = fetch_quotes(url)
    if not quotes:
        return jsonify({"message": "No quotes found or error occurred"}), 404

    return jsonify(quotes)
if __name__ == '__main__':
    app.run(debug=True)
