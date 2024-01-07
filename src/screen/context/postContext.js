import React, {createContext, useState, useEffect} from 'react'
import axios from 'axios'
import { createContext} from 'react'

//context

const PostContext = createContext()

const PostProvider = ({children}) =>{
    
    const [loading, setLoading] = useState(false)
const [posts, setPosts] = useState([])

}

