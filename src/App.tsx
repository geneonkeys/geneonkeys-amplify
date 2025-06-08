import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import './App.css'; // Import the CSS file

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [name, setName] = useState(""); // State for name input
  const [message, setMessage] = useState(""); // State for message input

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

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

  // Handler for key press on the message input
  const handleMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if the Enter key was pressed AND if both name and message have values
    if (e.key === 'Enter' && name && message) {
      createTodo();
    }
  };


  const sortedTodos = [...todos].sort((a, b) => {
    const timestampA = parseInt(a.content?.split('_____', 1)[0] || '0', 10);
    const timestampB = parseInt(b.content?.split('_____', 1)[0] || '0', 10);
    return timestampA - timestampB;
  });


  return (
    <main className="app-container">
      <div className="info-section">
        <h1>You're invited!</h1>
        <p>YooJung and his family are coming to visit. When we asked him what he wanted to do, he said "I want to hang out with Grandma Rose and the family!"</p>
        <p>Where: <a href="https://maps.app.goo.gl/XVRWAR6WqPrX3fuk6" target="_blank" rel="noopener noreferrer">584 S Fletcher Ave, Fernandina Beach, FL 32034</a></p>
        <p>When: June 18th, 5PM - June 20th, 10AM</p>
        <p>All you've got to do is show up, your bed is covered. If you need a ride from Savannah, reach out to Daniel, we might have room.</p>
        <p>Group texts can get messy, so here's a space we can use for chat.</p>
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
    </main>
  );
}

export default App;
