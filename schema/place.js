const typeDefs =`
type Place {
  title: String
  highlightedTitle: String
  first_name: String
  last_name: String
  phone_number: String
  position: [Float]
  vicinity: String
  category: String
}

extend type Query {
  getPlace(title: String, vicinity: String): Place
  getPlaces(title: String): [Place]
  searchPlace(lat: Float, lng: Float, title: String): [Place]
}
`

module.exports = typeDefs;
