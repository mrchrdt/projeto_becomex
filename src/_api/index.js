import axios from 'axios'

const _countries = {
  Get: (responseFunction) => axios.get(process.env.NODE_API_COUNTRIES).then(response => responseFunction(response.data))
}

export default {
  GetCountries: _countries
}
