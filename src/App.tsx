import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import './App.css'; // Import the CSS file

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [name, setName] = useState(""); // State for name input
  const [message, setMessage] = useState(""); // State for message input
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // State for slideshow

  // Array of images for the slideshow
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

  // Auto-advance slideshow every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  function createTodo() {
    const timeInMs = Date.now(); // Use current timestamp in milliseconds
    const content = `${timeInMs}_____${name}_____${message}`; // Combine timestamp, name, and message
    client.models.Todo.create({ content });
    // We keep the name, but clear the message
    setMessage("");
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  console.log(deleteTodo)

  // Handler for key press on the message input
  const handleMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if the Enter key was pressed AND if both name and message have values
    if (e.key === 'Enter' && name && message) {
      createTodo();
    }
  };

  // // Navigation functions for slideshow
  // const goToPrevious = () => {
  //   setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1);
  // };

  // const goToNext = () => {
  //   setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1);
  // };

  // const goToSlide = (index: number) => {
  //   setCurrentImageIndex(index);
  // };

  const sortedTodos = [...todos].sort((a, b) => {
    const timestampA = parseInt(a.content?.split('_____', 1)[0] || '0', 10);
    const timestampB = parseInt(b.content?.split('_____', 1)[0] || '0', 10);
    return timestampB - timestampA;
  });

  return (
    <main className="app-container">
      <div className="info-section">
        <h1>You're invited to stay with us at a beach house in St. Augustine!</h1>

        {/* Slideshow container */}
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

          {/* Navigation arrows */}
          {/* <button className="slideshow-nav prev" onClick={goToPrevious}>
            &#8249;
          </button>
          <button className="slideshow-nav next" onClick={goToNext}>
            &#8250;
          </button> */}

          {/* Dots indicator */}
          {/* <div className="slideshow-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div> */}
        </div>

        <h2>YooJung and his family are coming to visit!</h2>
        <p>When we asked him what he wanted to do, he said "I want to hang out with Grandma Rose and the family!"</p>
        <p>Where: <a href="https://maps.app.goo.gl/XVRWAR6WqPrX3fuk6" target="_blank" rel="noopener noreferrer">584 S Fletcher Ave, Fernandina Beach, FL 32034</a></p>
        <p>When: June 18th, 5PM - June 20th, 10AM</p>
        <p>If you need to stay the night, your room is covered!</p>
        <p>If you need a ride from Savannah, reach out to Daniel, we might have room.</p>
        <p>Here's a group chat space we can use in case we want an alternative to group texting.</p>
      </div>

      <div className="input-section"> {/* Add class name */}
        {/* Name input is always visible */}
        <div className="input-group"> {/* Add class name */}
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Message input appears when name has a value */}
        {name && (
          <div className="input-group"> {/* Add class name */}
            <label htmlFor="message">Message:</label>
            <input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleMessageKeyPress} // Add key press handler
              placeholder={`Message from ${name}`}
            />
          </div>
        )}

        {/* Send button appears when both name and message have values */}
        {name && message && (
          <button onClick={createTodo} className="send-button">Send</button>
        )}
      </div>

      <div className="messages-section"> {/* Add class name */}
        <h2>Messages</h2> {/* Add a heading for clarity */}
        {/* Display messages */}
        {sortedTodos.map((todo) => { // Map over the sorted array
          const parts = todo.content?.split('_____', 3);
          const displayDatePart = parts?.[0]; // Get the timestamp string
          const displayName = parts?.[1] || 'who dis?';
          const displayMessage = parts?.[2] || 'wat dat?';

          let displayDay = ''; // e.g., Day
          let displayTime = ''; // e.g., HH:MM

          if (displayDatePart) {
            const timestamp = parseInt(displayDatePart, 10);
            if (!isNaN(timestamp)) {
              const dateObj = new Date(timestamp);
              // Format Day (e.g., "Mon", "Tue")
              displayDay = dateObj.toLocaleDateString([], { weekday: 'short' });
              // Format Time (e.g., "14:30")
              displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          }

          return (
            <div
              // onClick={deleteTodo.bind(null, todo.id)}
              key={todo.id}
              className="message-card">
              <div className="message-header">
                <strong className="message-name">{displayName}</strong>
                <div className="message-timestamp">
                  <span className="timestamp-day">{displayDay}</span>
                  <span className="timestamp-time">{displayTime}</span>
                </div>
              </div>
              <div className="message-body">
                {displayMessage}
              </div>
            </div>
          );
        })}
      </div>
    </main >
  );
}

export default App;
