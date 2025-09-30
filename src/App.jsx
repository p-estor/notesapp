import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { generateClient } from "@aws-amplify/data-client";
import amplifyConfig from "./amplify_outputs.json";

Amplify.configure(amplifyConfig);

const client = generateClient();

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [image, setImage] = useState(null);

  // Listar notas
  const fetchNotes = async () => {
    try {
      const result = await client.Notes.list();
      setNotes(result.items || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // Crear nota
  const createNote = async (e) => {
    e.preventDefault();
    if (!newNote) return;

    let noteData = { content: newNote };

    if (image) {
      try {
        const imageName = `${Date.now()}-${image.name}`;
        await client.Storage.put(imageName, image);
        noteData.image = imageName;
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }

    try {
      await client.Notes.create(noteData);
      setNewNote("");
      setImage(null);
      fetchNotes();
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  // Eliminar nota
  const deleteNote = async (id) => {
    try {
      await client.Notes.delete({ id });
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <AmplifyAuthenticator>
      <div id="root">
        <h1>Notes App</h1>

        <form onSubmit={createNote}>
          <input
            type="text"
            placeholder="New note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">Add Note</button>
        </form>

        <div className="notes-grid">
          {notes.map((note) => (
            <div className="card box" key={note.id}>
              <p>{note.content}</p>
              {note.image && (
                <img
                  src={client.Storage.get(note.image)}
                  alt="note"
                  width="100"
                />
              )}
              <button onClick={() => deleteNote(note.id)}>Delete</button>
            </div>
          ))}
        </div>

        <AmplifySignOut />
      </div>
    </AmplifyAuthenticator>
  );
}

export default App;
