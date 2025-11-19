import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast"
import { io } from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);
    console.log(onlineUser);
    
    
    //login function to handle uer authentication and socket connection
    const login = async (state, credentials) => {
      try{
        const {data} = await axios.post(`/api/auth/${state}`, credentials);
        // console.log(data);
        if (data.success) {
            setAuthUser(data.userData);
            connectSocket(data.userData);
            // console.log()
            axios.defaults.headers.common["token"] = data.token;
            setToken(data.token);
            localStorage.setItem("token", data.token)
            toast.success(data.message)
          } else{
            toast.error(data.message)
        }
      } catch(err) {
        toast.error(err.message)
      }
    }
    
    //logout function to handle user logout and socket disconnection
    const logout = () => {
      localStorage.removeItem("token")
      setToken(null);
      setAuthUser(null)
      setOnlineUser([])
      axios.defaults.headers.common["token"] = null;
      toast.success("Logged out successfully")
      socket.disconnect();
    }

    //update profile function to handle user profile updates
    const updateProfile = async (body) => {
      try{
        const { data } = await axios.put("/api/auth/update-profile", body);
        if(data.success) {
            setAuthUser(data.user)
            toast.success("Profile updated successfully");
          }
      } catch(err) {
        toast.error(err.message)
      }
    }

    //check if user is authenticated if so, set the user date and connect the socket
    const checkAuth = async () => {
        try{
            const {data} = await axios.get("/api/auth/check")
            if(data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch(err) {
            toast.error(err.message)
        }
    }
    
    //connect socket functioj to handle socket connection and online users updates
    const connectSocket = (userData) => {
      if(!userData || socket?.connected) return;
      const newSocket = io(backendUrl, {
        query: {
            userId: userData._id,
        }
      });
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUser(userIds);
      })
    }
    

    useEffect(()=> {
        if(token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    },[])

    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}