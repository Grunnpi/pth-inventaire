import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getUsers} from '../store/actions/userAction'

const Users = () => {
    const dispatch = useDispatch()
    const usersList = useSelector(state => state.usersList)
    const {loading, error, users} = usersList
    useEffect(() => {
        dispatch(getUsers())
      }, [dispatch])
    return (
        <>
            {loading ? "Loading..." : error ? error.message : users.map(u => <h3>{u.name}</h3>)}
        </>
    )
}

export default Users