import React, { useState } from 'react';

const QuoteExtractor = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imdbUrl, setImdbUrl] = useState("");
  const [details, setDetails] = useState({});
  const [error, setError] = useState('');

  const VALID_USERNAME = "siddhanth";
  const VALID_PASSWORD = "password123";

  const handleIMDBRating = () => {
    if (!imdbUrl) {
      setError("Please enter an IMDb URL.");
      return;
    }

    setLoading(true);
    setError('');
    setDetails({});

    fetch(`http://127.0.0.1:5000/movie_details?url=${encodeURIComponent(imdbUrl)}`)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          setDetails(data);
        }
      })
      .catch(error => {
        setLoading(false);
        setError(`Error fetching details: ${error.message}`);
      });
  };

  const handleProductReview = () => {
    if (!productUrl) {
      setOutput("Please enter a product URL.");
      return;
    }

    setLoading(true);
    setOutput(null);

    fetch(`http://127.0.0.1:5000/product_reviews?url=${encodeURIComponent(productUrl)}`)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setLoading(false);
        if (data.error) {
          setOutput(`Error: ${data.error}`);
        } else if (data.reviews && data.reviews.length > 0) {
          const reviews = data.reviews.map((review, index) => <li key={index}>{review}</li>);
          setOutput(<ul>{reviews}</ul>);
        } else {
          setOutput("No reviews found.");
        }
      })
      .catch(error => {
        setLoading(false);
        setOutput(`Error fetching reviews: ${error.message}`);
      });
  };

  const handleLogin = () => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsLoggedIn(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid username or password.");
    }
  };

  const fetchQuotes = () => {
    if (!url) {
      setOutput("Please enter a URL.");
      return;
    }

    setLoading(true);
    setOutput(null);

    fetch(`http://127.0.0.1:5000/quotes?url=${encodeURIComponent(url)}`)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setLoading(false);
        if (data.error) {
          setOutput(`Error: ${data.error}`);
        } else if (data.length > 0) {
          const quotes = data.map(quoteData => `"${quoteData.quote}" - ${quoteData.author}`).join('\n');
          setOutput(quotes);
        } else {
          setOutput("No quotes found.");
        }
      })
      .catch(error => {
        setLoading(false);
        setOutput(`Error fetching data: ${error.message}`);
      });
  };

const handleLLMConversion = async () => {
  if (!url) {
    setOutput("Please enter a URL.");
    return;
  }

  try {
    setLoading(true);
    setOutput(""); // Clear previous output

    const response = await fetch('http://localhost:5000/extract-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Since backend returns an array directly, check if data is array:
    if (Array.isArray(data) && data.length > 0) {
      setOutput(
        <ul>
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else {
      setOutput("No quotes found.");
    }
  } catch (error) {
    setOutput(`Error fetching quotes: ${error.message}`);
  } finally {
    setLoading(false);
  }
};






  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '20px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#111' }}>
          <h2 style={{ textAlign: 'center' }}>Login</h2>
          <input
            style={{ width: '90%', padding: '10px', margin: '10px 0', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            style={{ width: '90%', padding: '10px', margin: '10px 0', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMessage && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'red' }}>{errorMessage}</p>
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeG44d2xoNzJoNzhkY2ZxNDFnMzk5cXZvN2t4MHQ0bXBsYXIyaDVvbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/oy3KWBNjxG6YST6pak/giphy.gif"
                alt="Access Denied"
                style={{ width: '250px', marginTop: '0px' }}
              />
            </div>
          )}
          <button onClick={handleLogin} style={{ width: '95.5%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#000', color: '#fff' }}>
      <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#111', marginBottom: '20px' }}>
        <h2>
          <img
            src="https://img.icons8.com/?size=100&id=20023&format=png&color=000000"
            alt="Logo"
            style={{ width: '75px', height: '75px', verticalAlign: 'middle', marginRight: '10px' }}
          />
          <span style={{ fontSize: '30px', fontFamily: 'Arial, sans-serif' }}>Quote Scraper</span>
        </h2>

        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#111', fontFamily: 'Arial, sans-serif', fontSize: 20 }}>
          <p><strong>Overview:</strong> QuoteScraperApp is a React-based utility app that lets users simulate web scraping workflows after logging in. It mimics content extraction from quote sites, IMDb, Wikipedia, and product listings.</p>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>🧠 <strong>Quote Extraction:</strong> Simulated scraping using BeautifulSoup </li>
            <li>🎬 <strong>IMDb Extraction:</strong> Extracts movie rating and info from IMDB.</li>
          </ul>
        </div>
      </div>

      <input
        style={{ width: '99%', padding: '10px', margin: '10px 0', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '11px', marginBottom: '10px' }}>
        <button onClick={fetchQuotes} style={{ flex: 1, padding: '10px', backgroundColor: '#a11f7e', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Extraction with BeautifulSoup
        </button>
        <button onClick={handleLLMConversion} style={{ flex: 1, padding: '10px', backgroundColor: '#a1661f', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Extraction with LLM
        </button>
      </div>

      <pre style={{ backgroundColor: '#222', color: '#fff', padding: '10px', border: '1px solid #444', minHeight: '100px' }}>
        {loading ? "Loading..." : output}
      </pre>

      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h4 style={{ marginTop: '20px', marginBottom: '5px', fontSize: '16px' }}>
          🎬 <strong>IMDB Extraction:</strong> Paste a movie or show URL from IMDB to extract its rating, title, and brief info.
        </h4>

        <input
          style={{ width: '99%', padding: '10px', margin: '10px 0', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
          placeholder="Enter IMDb URL"
          value={imdbUrl}
          onChange={(e) => setImdbUrl(e.target.value)}
        />

        <button onClick={handleIMDBRating} style={{ width: '100.5%', padding: '10px', marginBottom: '10px', backgroundColor: '#9da11f', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Extraction of IMDb Rating
        </button>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {details.title && (
          <div style={{ marginTop: '20px' }}>
            <p><strong>Title:</strong> {details.title}</p>
            <p><strong>Director:</strong> {details.director}</p>
            <p><strong>Rating:</strong> {details.rating}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteExtractor;
