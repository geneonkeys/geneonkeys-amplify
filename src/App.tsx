import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import './App.css';
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const client = generateClient<Schema>();

// Define our "tabs"
type TabType = 'bulletin' | 'itinerary';

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('bulletin');
  const [itineraryDate, setItineraryDate] = useState("");


  // Itinerary specific states
  const [itineraryTitle, setItineraryTitle] = useState("");
  const [itineraryTime, setItineraryTime] = useState("");
  const [itineraryDescription, setItineraryDescription] = useState("");

  const images = [
    "https://media.vrbo.com/lodging/67000000/66730000/66726700/66726604/82390e0c.jpg?impolicy=resizecrop&rw=1200&ra=fit",
    "https://media.vrbo.com/lodging/67000000/66730000/66726700/66726604/9ef97257.jpg?impolicy=resizecrop&rw=1200&ra=fit",
    "rooms.png"
  ];

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Filter messages vs itinerary items
  const messages = todos.filter(todo =>
    todo.content?.startsWith('MESSAGE_____')
  );

  const itineraryItems = todos.filter(todo =>
    todo.content?.startsWith('ITINERARY_____')
  );

  function createMessage() {
    const timeInMs = Date.now();
    const content = `MESSAGE_____${timeInMs}_____${name}_____${message}`;
    client.models.Todo.create({ content });
    setMessage("");
  }

  function createItineraryItem() {
    const timeInMs = Date.now();
    const content = `ITINERARY_____${timeInMs}_____${itineraryDate}_____${itineraryTime}_____${itineraryTitle}_____${itineraryDescription}`;
    client.models.Todo.create({ content });
    setItineraryTitle("");
    setItineraryTime("");
    setItineraryDate("");
    setItineraryDescription("");
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  const handleMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name && message) {
      createMessage();
    }
  };

  const sortedMessages = [...messages].sort((a, b) => {
    const timestampA = parseInt(a.content?.split('_____', 2)[1] || '0', 10);
    const timestampB = parseInt(b.content?.split('_____', 2)[1] || '0', 10);
    return timestampB - timestampA;
  });

  // Update the sortedItinerary logic to sort by date then time
  const sortedItinerary = [...itineraryItems].sort((a, b) => {
    const partsA = a.content?.split('_____');
    const partsB = b.content?.split('_____');
    const dateA = partsA?.[2] || '';
    const timeA = partsA?.[3] || '';
    const dateB = partsB?.[2] || '';
    const timeB = partsB?.[3] || '';

    // First sort by date, then by time
    const dateComparison = dateA.localeCompare(dateB);
    if (dateComparison !== 0) return dateComparison;
    return timeA.localeCompare(timeB);
  });

  return (
    <main className="app-container">
      {/* Header with tabs */}
      <div className="vacation-header">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'bulletin' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulletin')}
          >
            📋 Bulletin
          </button>
          <button
            className={`tab-button ${activeTab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setActiveTab('itinerary')}
          >
            📅 Itinerary
          </button>
        </div>
      </div>

      {/* Bulletin Tab */}
      {activeTab === 'bulletin' && (
        <>
          <div className="info-section">
            <h1>YooJung and his family are coming to visit!</h1>
            <p>When we asked them what they wanted to do, they said "We want to hang out with Grandma Rose and the family!"</p>
            <p>They'll be with us June 17th-24th.</p>
            <p>We'll be doing plenty and would love to have you join us whenever you can, but the main events are....</p>

            <div className="main-event-card beach-house">

              <h2>A Two Night Stay at a St. Augustine Beach House</h2>

              <div className="slideshow-container">
                <div className="slideshow-wrapper">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Beach house ${index + 1}`}
                      className={`slideshow-image ${index === currentImageIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <p>Where: <a href="https://maps.app.goo.gl/XVRWAR6WqPrX3fuk6" target="_blank" rel="noopener noreferrer">584 S Fletcher Ave, Fernandina Beach, FL 32034</a></p>
              <p>When: June 18th, 5PM - June 20th, 10AM</p>
              <p>If you need to stay the night, your room is covered!</p>
              <p>If you need a ride from Savannah, reach out to Daniel, we might have room.</p>
            </div>
          </div>
          <div className="main-event-card beach-house">
            <h2>A Saturday Night Cookout</h2>
            <p>Details to come!</p>
          </div>

          <div className="input-section">
            <div className="input-group">
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {name && (
              <div className="input-group">
                <label htmlFor="message">Message:</label>
                <input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleMessageKeyPress}
                  placeholder={`Message from ${name}`}
                />
              </div>
            )}

            {name && message && (
              <button onClick={createMessage} className="send-button">Send Message</button>
            )}
          </div>

          <div className="messages-section">
            <h2>Family Chat</h2>
            {sortedMessages.map((todo) => {
              const parts = todo.content?.split('_____');
              const timestamp = parseInt(parts?.[1] || '0', 10);
              const displayName = parts?.[2] || 'Anonymous';
              const displayMessage = parts?.[3] || '';

              const dateObj = new Date(timestamp);
              const displayDay = dateObj.toLocaleDateString([], { weekday: 'short' });
              const displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={todo.id} className="message-card">
                  <div className="message-header">
                    <strong className="message-name">{displayName}</strong>
                    <div className="message-timestamp">
                      <span className="timestamp-day">{displayDay}</span>
                      <span className="timestamp-time">{displayTime}</span>
                    </div>
                  </div>
                  <div className="message-body">{displayMessage}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Itinerary Tab */}
      {activeTab === 'itinerary' && (
        <div className="itinerary-section">
          <h2>📅 Vacation Itinerary</h2>
          {isDevelopment && (<>
            <div className="input-section">
              <div className="input-group">
                <label htmlFor="itinerary-date">Date:</label>
                <input
                  id="itinerary-date"
                  type="date"
                  value={itineraryDate}
                  onChange={(e) => setItineraryDate(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="itinerary-time">Time:</label>
                <input
                  id="itinerary-time"
                  type="time"
                  value={itineraryTime}
                  onChange={(e) => setItineraryTime(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="itinerary-title">Activity:</label>
                <input
                  id="itinerary-title"
                  value={itineraryTitle}
                  onChange={(e) => setItineraryTitle(e.target.value)}
                  placeholder="e.g., Beach Walk, Lunch at..."
                />
              </div>

              <div className="input-group">
                <label htmlFor="itinerary-description">Details:</label>
                <input
                  id="itinerary-description"
                  value={itineraryDescription}
                  onChange={(e) => setItineraryDescription(e.target.value)}
                  placeholder="Additional details or location"
                />
              </div>

              {itineraryDate && itineraryTime && itineraryTitle && (
                <button onClick={createItineraryItem} className="send-button">Add to Itinerary</button>
              )}

            </div>
          </>)}

          <div className="itinerary-list">
            {sortedItinerary.map((todo) => {
              const parts = todo.content?.split('_____');
              const date = parts?.[2] || '';
              const time = parts?.[3] || '';
              const title = parts?.[4] || '';
              const description = parts?.[5] || '';

              // In the itinerary display section, replace the date formatting:
              const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              }) : '';


              return (
                <div key={todo.id} className="itinerary-item">
                  <div className="itinerary-datetime">
                    <div className="itinerary-date">{formattedDate}</div>
                    <div className="itinerary-time">{time}</div>
                  </div>
                  <div className="itinerary-content">
                    <h4>{title}</h4>
                    {description && <p>{description}</p>}
                  </div>
                  {isDevelopment && <button
                    className="delete-button"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    ❌
                  </button>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
