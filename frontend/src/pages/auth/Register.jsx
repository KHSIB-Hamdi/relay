import { useState } from "react"
import { useRegister } from "../../hooks/useRegister"
import { Link } from 'react-router-dom'
import convertToBase64 from '../../convert';
import { Header } from '../../components';


const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [address, setAddress] = useState('')
    const [contact, setContact] = useState('')
    const [domain, setDomain] = useState('')
   {/* const [file, setFile] = useState() */}
    
    const { register, errors, isLoading } = useRegister()
    

    const handleSubmit = async (e) => {
        e.preventDefault()

        await register(username, email, password, address, contact, domain)
        
    }
    {/* const onUpload = async e => {
        const base64 = await convertToBase64(e.target.files[0]);
        setFile(base64);
      } */}

    return (
        <div>
        
      <form className="register" onSubmit={handleSubmit}>
          
          {errors.allFields && <div className="error">{errors.allFields}</div>}
          <label>Identifiant:</label>
          <input 
              type="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
          />
          {errors.username && <div className="error">{errors.username}</div>}
          <label>Email:</label>
          <input 
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
          />
          {errors.email && <div className="error">{errors.email}</div>}
          <label>Mot de passe:</label>
          <input 
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
          />
          {errors.password && <div className="error">{errors.password}</div>}
          <label>Adresse:</label>
          <input 
              type="address"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
          />
          <label>Contact:</label>
          <input 
              type="contact"
              onChange={(e) => setContact(e.target.value)}
              value={contact}
          />
          {errors.contact && <div className="error">{errors.contact}</div>}
          <label>Secteur d'activité:</label>
          <input 
              type="domain"
              onChange={(e) => setDomain(e.target.value)}
              value={domain}
          />
          {/*<label >
          <img src={file} className="profile_img" />
          </label>
                  
    <input onChange={onUpload} type="file" id='profile' name='profile' /> */}
          <button disabled={isLoading}>S'inscrire</button>
          <div className="text-center py-4">
              <span className='text-gray-500'>Déja un membre? <Link className='text-red-500' to="/login">Se connecter</Link></span>
          </div>
      </form>
      </div>
  )
}

export default Register
