import { useState, useEffect  } from "react"

import { useAuthContext } from "../hooks/useAuthContext"
import { useArticlesContext } from "../hooks/useArticlesContext"
import { API_URL } from '../config/api';

const AddArticle = () => {

    const {user} = useAuthContext()
    const { dispatch } = useArticlesContext()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [products, setProducts] = useState('')
    const [prices, setPrices] = useState(0)
    const [quantity, setQuantity] = useState(0)


    const handleSubmit = async (e) => {
        e.preventDefault()

        
        const response = await fetch(`${API_URL}/articles`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'},
            body: JSON.stringify({name, description, products, prices, quantity}),
            });

            const json = await response.json();
            dispatch({ type: 'CREATE_ARTICLE', payload: json });
          
    }

    return (
        <form className="login" onSubmit={handleSubmit}>
            <h3>Ajouter un article</h3>
            <label>Nom:</label>
            <input 
              type="nom"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
           
            <label>Description:</label>
            <input  
              type="description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
            <label>Produit proposé:</label>
            <input 
              type="produit"
              onChange={(e) => setProducts(e.target.value)}
              value={products}
            />
            <label>Prix:</label>
            <input 
              type="number"
              onChange={(e) => setPrices(e.target.value)}
              value={prices}
            />
            <label>Quantité:</label>
            <input 
              type="number"
              onChange={(e) => setQuantity(e.target.value)}
              value={quantity}
            />
            <button >Enregister</button>

        </form>
    )
}

export default AddArticle

