import { useState } from "react"
import { useLogin } from "../../hooks/useLogin"
import { Link } from 'react-router-dom'

const Login = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const {login, errors, isLoading} = useLogin()
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault()

        await login(username, password, rememberMe)
    }

    return (
      <div >
          
        <form className="login" onSubmit={handleSubmit}>
            
            <label>Identifiant:</label>
            <input 
              type="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            {errors.username && <div className="error">{errors.username}</div>}
            <label>Mot de passe:</label>
            <input 
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <label style={{ display: 'flex' }}>
            <span >
              Rester connecté
              </span>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                style={{ marginRight: '200px' }}
              />
              
            </label>
            <button disabled={isLoading}>Se connecter</button>
            
            
            <div className="text-center py-4">
                <span className='text-gray-500'>Mot de passe oublié? <Link className='text-red-500' to="/verify-otp">Récupérer</Link></span>
              </div>

              <div className="text-center py-4">
                <span className='text-gray-500'>N'est pas un membre? <Link className='text-red-500' to="/register">S'incrire</Link></span>
              </div>
        </form>
        </div>
    )
}

export default Login

