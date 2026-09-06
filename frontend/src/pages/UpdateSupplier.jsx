import { useState, useEffect  } from "react"
import { Link } from 'react-router-dom'
import { useAuthContext } from "../hooks/useAuthContext"
import { useSuppliersContext } from "../hooks/useSuppliersContext"
import { useParams } from 'react-router-dom';
import { API_URL } from '../config/api';

const UpdateSupplier = () => {

    const {user} = useAuthContext()
    const { dispatch } = useSuppliersContext()
    

    const { supplierId } = useParams()

    const [supplierData, setSupplierData] = useState({
      username: '',
      email: '',
      password: '',
      address: '',
      contact: '',
      domain: '',
    });

    useEffect(() => {
      const fetchSupplierData = async () => {
        try {
          const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
            },
          });
          const json = await response.json();
          console.log(json)
          const extractedSupplierData = {
            username: json.username,
            email: json.email,
            password: json.password,
            address: json.address,
            contact: json.contact,
            domain: json.domain
          };
          console.log(extractedSupplierData);
          setSupplierData(extractedSupplierData);
        } catch (error) {
          console.error('Error fetching supplier data:', error);
        }
      };
  
      fetchSupplierData();
    }, [supplierId, user.accessToken]);
    
   
  
      
    

    const handleSubmit = async (e) => {
        e.preventDefault()

        
        const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
            method: 'PATCH',
            headers: {'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'},
            body: JSON.stringify(supplierData),
            });

            const updatedSupplier = await response.json();
            dispatch({ type: 'UPDATE_SUPPLIER', payload: updatedSupplier });
          
    }

    return (
        <form className="login" onSubmit={handleSubmit}>
            <h3>Données personnelles</h3>
            <label>Identifiant:</label>
            <input 
              type="username"
              onChange={(e) => setSupplierData({ ...supplierData, username: e.target.value })}
              value={supplierData.username}
            />
           
            <label>Email:</label>
            <input 
              type="email"
              onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
              value={supplierData.email}
            />
            <label>Mot de passe:</label>
            <input 
              type="password"
              onChange={(e) => setSupplierData({ ...supplierData, password: e.target.value })}
              value={supplierData.password}
            />
            <label>Adresse:</label>
            <input 
              type="address"
              onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
              value={supplierData.address}
            />
            <label>Contact:</label>
            <input 
              type="contact"
              onChange={(e) => setSupplierData({ ...supplierData, contact: e.target.value })}
              value={supplierData.contact}
            />
            <label>Domaine d'activité:</label>
            <input 
              type="domain"
              onChange={(e) => setSupplierData({ ...supplierData, domain: e.target.value })}
              value={supplierData.domain}
            />
            <button >Enregister</button>

        </form>
    )
}

export default UpdateSupplier

