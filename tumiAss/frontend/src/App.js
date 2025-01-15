import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/add-item', { name, quantity });
            alert('Item added successfully!');
        } catch (error) {
            alert('Error adding item: ' + error.message);
        }
    };

    return (
        <div>
            <h1>Fridge Management</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Item Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />
                <button type="submit">Add Item</button>
            </form>
        </div>
    );
}

export default App;