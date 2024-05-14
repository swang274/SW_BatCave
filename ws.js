require('dotenv').config()
const axios = require('axios')
const path = require('path')
const fs = require('fs')

const URL = process.env.URL
const REQUESTOR = process.env.REQUESTOR
const SUBSCRIPTION = process.env.SUBSCRIPTION
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const TOKEN_FILE = path.join(__dirname, 'token.json')
let _token

// Load token data from the file
function loadTokenData() {
    if (fs.existsSync(TOKEN_FILE)) {
        const data = fs.readFileSync(TOKEN_FILE)
        return JSON.parse(data)
    }
    return null
}

// Save token data to the file
function saveTokenData(tokenData) {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2))
}

// Store token and expiry time
function storeToken(token, expiresIn) {
    const expiryTime = Math.floor(Date.now() / 1000) + expiresIn - 30
    const tokenData = {
        accessToken: token,
        expiryTime: expiryTime,
    }
    saveTokenData(tokenData)
}

function isTokenExpired() {
    const tokenData = loadTokenData()
    if (tokenData && tokenData.expiryTime) {
        const currentTime = Math.floor(Date.now() / 1000)
        _token = tokenData.accessToken
        return currentTime >= tokenData.expiryTime
    }
    return true
}

// Refresh the token
async function refreshToken() {
    const encodedCredentials = Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
    ).toString('base64')

    let data = JSON.stringify({
        authentication: encodedCredentials,
        requestor: REQUESTOR,
    })

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${URL}/auth`,
        headers: {
            'Content-Type': 'application/json',
            Subscription: SUBSCRIPTION,
        },
        data: data,
    }

    try {
        const { data } = await axios.request(config)
        if (data.access_token) {
            _token = data.access_token
            const currentTime = Math.floor(Date.now() / 1000) // Convert current time to seconds
            let expiresIn = currentTime + data.expires_in

            storeToken(data.access_token, expiresIn)
            console.log('Token refreshed successfully')
        } else {
            console.error('Failed to refresh token')
        }
    } catch (error) {
        console.error('Error refreshing token:', error)
    }
}

async function token() {
    // Check if token is expired
    if (isTokenExpired()) {
        await refreshToken()
    }
    return _token
}

async function getContacts(testCase) {
    let _token = await token()

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${URL}/contacts`,
        headers: {
            Authorization: `Bearer ${_token}`,
            requestor: REQUESTOR,
            test_case: testCase,
            Subscription: SUBSCRIPTION,
        },
    }

    return await axios.request(config)
}

async function postContacts(testCase, contacts) {
    let _token = await token()

    let data = {
        contacts: contacts,
    }

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${URL}/contacts`,
        headers: {
            Authorization: `Bearer ${_token}`,
            requestor: REQUESTOR,
            test_case: testCase,
            Subscription: SUBSCRIPTION,
        },
        data: data,
    }
    return await axios.request(config)
}

// Export functions for use in other files
module.exports = {
    getContacts,
    postContacts,
}
