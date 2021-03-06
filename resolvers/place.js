const fetch = require('node-fetch')
const url = require('url')
const { pool } = require('../util')

const placeResolver = {
  Query: {
    async getPlace(root, args) {
      const title = args.title; 
      
    },
    async getPlaces(root, args) {
      const title = args.title; 

    },
    async searchPlace(root, args) {
      const {lat, lng, title} = args;
      
      let response = await hereAPI('/autosuggest', {
        q: title,
        cat: ['eat-drink'],
        in: `${lat},${lng};r=30000`,
      })
      
      let results = response.results || [];
      console.log(response, results)
      return results.filter(place => [
        'snacks-fast-food',
        'restaurant',
        'eat-drink'
      ].includes(place.category)).map((place, id) => {
        place.id = id;
        return place;
      })
    },
  }
}

async function hereAPI(resourceParam, queryParams) {
  const host = 'https://places.cit.api.here.com';
  const path = '/places/v1';;
  const apiId = `app_id=${process.env.HERE_APP_ID}`
  const apiCode = `app_code=${process.env.HERE_APP_CODE}`
  let url = `${host}${path}${resourceParam}?${apiId}&${apiCode}`;

  for (let key in queryParams) {
    let value = queryParams[key]
    if (Array.isArray(value)) {
      value = value.join(",")
    }
    url +=`&${key}=${value}`
  }

  let response = await fetch(url)
  return response.json()
}

module.exports = placeResolver;
