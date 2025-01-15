# Offline-Ready Anime App

A simple, progressive web application that displays anime information with offline capabilities. The app uses the Jikan API (unofficial MyAnimeList API) to fetch anime data and implements various caching strategies for offline access.

## Features

### Core Functionality
- Display anime cards with images, titles, ratings, and descriptions
- Infinite scroll using Intersection Observer API
- Offline support via Service Workers
- Online/Offline status indicator
- Responsive grid layout
- Multiple caching strategies

### Technical Features
- Service Worker implementation
- Intersection Observer for efficient infinite scrolling
- Rate limiting handling for API requests
- Responsive design using CSS Grid
- Error handling for network failures

## Getting Started

### Prerequisites
- A modern web browser that supports Service Workers
- A local web server (Service Workers won't work with `file://` protocol)

### Installation

1. Clone the repository or download the files:
```bash
git clone git@github.com:vatsalbudhbhatti/anime-pwa.git
```

2. Set up a local web server. You can use any of these methods:
   - Using Python:
     ```bash
     python -m http.server 8000
     ```
   - Using Node.js's `http-server`:
     ```bash
     npx http-server
     ```
   - Using VS Code's Live Server extension

3. Open your browser and navigate to:
   - `http://localhost:8000` (for Python)
   - `http://localhost:8080` (for http-server)
   - The URL provided by your chosen server

## Project Structure

```
├── index.html          # Main application file
├── service-worker.js   # Service worker with caching strategies
└── README.md          # Documentation
```

## Available Caching Strategies

The service worker includes multiple caching strategies. Only one should be active at a time:

1. **Cache First, Network Fallback** (Default)
   - Checks cache first
   - Falls back to network if not in cache
   - Best for static assets and stable content

2. **Network First, Cache Fallback**
   - Attempts network request first
   - Falls back to cache if offline
   - Best for frequently updated content

3. **Stale While Revalidate**
   - Returns cached version immediately
   - Updates cache in background
   - Best for balance of speed and freshness

4. **Cache Only**
   - Only serves cached content
   - Best for truly static assets

5. **Network Only**
   - Always fetches from network
   - Best for real-time data

To switch strategies, edit `service-worker.js` and uncomment the desired strategy while commenting out others.

## API Usage

The app uses the Jikan API v4:
- Base URL: `https://api.jikan.moe/v4`
- Endpoint used: `/anime`
- Rate limiting: ~3 requests per second

## Browser Support

The app works in all modern browsers that support:
- Service Workers
- Intersection Observer API
- CSS Grid
- Fetch API

## Testing Offline Functionality

1. Load the app while online
2. Open Developer Tools (F12)
3. Go to Network tab
4. Toggle "Offline" mode
5. Refresh the page
6. The app should still work with cached content

## Known Limitations

- Images may not be available offline unless previously cached
- API rate limiting may cause delays in loading new content
- Service Workers require HTTPS in production (localhost is exempt)

## Performance Considerations

- Images are loaded with optimal sizing
- Infinite scroll uses Intersection Observer for efficiency
- Built-in delay handling for API rate limits
- Efficient caching strategies for offline use

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
